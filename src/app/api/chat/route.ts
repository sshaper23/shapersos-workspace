import { NextRequest, NextResponse } from "next/server";
import { LOCKED_MODEL } from "@/data/models";
import { PLATFORM_SKILLS } from "@/data/platform-skills";
import { canAccessToolByTier, canAccessPlaybookByTier } from "@/data/tier-config";
import { getSupabaseServer } from "@/lib/supabase/server";

// Allow up to 60 seconds for AI streaming responses (Vercel default is 10s)
export const maxDuration = 60;

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_SKILLS_DB = process.env.NOTION_SKILLS_REGISTRY_DB;

interface SkillRow {
  id: string;
  properties: Record<string, unknown>;
}

/** Server-side skills cache (5 min TTL) */
let skillsCache: { data: SkillRow[]; ts: number } | null = null;
const SKILLS_CACHE_TTL = 5 * 60 * 1000;

async function fetchActiveSkills(): Promise<SkillRow[]> {
  if (skillsCache && Date.now() - skillsCache.ts < SKILLS_CACHE_TTL) {
    return skillsCache.data;
  }
  if (!NOTION_API_KEY || !NOTION_SKILLS_DB) return [];
  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_SKILLS_DB}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          filter: { property: "Status", select: { equals: "Active" } },
          page_size: 100,
        }),
      }
    );
    if (!res.ok) return skillsCache?.data || [];
    const data = await res.json();
    skillsCache = { data: data.results, ts: Date.now() };
    return data.results;
  } catch {
    return skillsCache?.data || [];
  }
}

function extractText(prop: unknown): string {
  if (!prop || typeof prop !== "object") return "";
  const p = prop as {
    rich_text?: { plain_text: string }[];
    title?: { plain_text: string }[];
  };
  if (p.rich_text) return p.rich_text.map((r) => r.plain_text).join("");
  if (p.title) return p.title.map((r) => r.plain_text).join("");
  return "";
}

function extractMulti(prop: unknown): string[] {
  if (!prop || typeof prop !== "object") return [];
  const p = prop as { multi_select?: { name: string }[] };
  return p.multi_select?.map((o) => o.name) || [];
}

/** Find skills that match a given tool or playbook slug */
function findMatchingSkills(
  skills: SkillRow[],
  toolSlug?: string,
  playbookSlug?: string
): string[] {
  const prompts: string[] = [];
  for (const skill of skills) {
    const props = skill.properties as Record<string, unknown>;
    const appliesTo = extractMulti(props["Applies To"]);
    const linkedTools = extractText(props["Linked Tools"]);
    const linkedPlaybooks = extractText(props["Linked Playbooks"]);
    const systemPrompt = extractText(props["System Prompt"]);

    if (!systemPrompt) continue;

    const isGlobal = appliesTo.includes("All Tools");
    const matchesTool =
      toolSlug &&
      linkedTools
        .split(",")
        .map((s) => s.trim())
        .includes(toolSlug);
    const matchesPlaybook =
      playbookSlug &&
      linkedPlaybooks
        .split(",")
        .map((s) => s.trim())
        .includes(playbookSlug);

    if (isGlobal || matchesTool || matchesPlaybook) {
      prompts.push(systemPrompt);
    }
  }
  return prompts;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      systemPrompt,
      northStarContext,
      brandContext,
      mechanismContext,
      toolSlug,
      playbookSlug,
    } = body;

    // ─── Server-side tier enforcement ───
    // If Supabase is configured, check the user's tier before processing.
    // Falls through gracefully if Supabase/Clerk unavailable (dev mode).
    const supabase = getSupabaseServer();
    if (supabase) {
      let userId: string | null = req.headers.get("x-user-id");
      if (!userId) {
        try {
          const { auth } = await import("@clerk/nextjs/server");
          const result = await auth();
          userId = result.userId;
        } catch {
          // Clerk not available — skip tier check
        }
      }
      if (userId) {
        const { data: userState } = await supabase
          .from("user_state")
          .select("subscription_tier")
          .eq("user_id", userId)
          .single();

        const tier = (userState?.subscription_tier as "free" | "pro") ?? "free";

        if (toolSlug && !canAccessToolByTier(toolSlug, tier)) {
          return NextResponse.json(
            { error: "Upgrade to Pro to access this tool." },
            { status: 403 }
          );
        }
        if (playbookSlug && !canAccessPlaybookByTier(tier)) {
          return NextResponse.json(
            { error: "Upgrade to Pro to access playbooks." },
            { status: 403 }
          );
        }
      }
    }

    // Fetch matching skills from the registry
    const skills = await fetchActiveSkills();
    const skillPrompts = findMatchingSkills(skills, toolSlug, playbookSlug);

    // Compose full system prompt with platform skills + Notion skills + context
    const contextParts = [
      // Platform-wide frameworks (always injected)
      PLATFORM_SKILLS,
      // Notion skills registry matches (if connected)
      ...skillPrompts.map((sp) => `--- SKILL FRAMEWORK ---\n${sp}`),
      // Then the tool/playbook-specific prompt
      systemPrompt ||
        "You are a senior direct-response strategist. Write with precision, specificity, and actionable insight. Never be generic.",
      northStarContext &&
        `\n\n--- BUSINESS CONTEXT ---\n${northStarContext}`,
      brandContext && `\n\n--- BRAND GUIDELINES ---\n${brandContext}`,
      mechanismContext &&
        `\n\n--- SALES MECHANISM CONTEXT ---\n${mechanismContext}`,
    ];
    const fullSystemPrompt = contextParts.filter(Boolean).join("\n\n");

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // If we have an API key, use real Anthropic streaming
    if (apiKey) {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey });

      const stream = client.messages.stream({
        model: LOCKED_MODEL,
        max_tokens: 4096,
        system: fullSystemPrompt,
        messages: messages.map(
          (m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })
        ),
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of stream) {
              if (
                event.type === "content_block_delta" &&
                "delta" in event &&
                event.delta.type === "text_delta"
              ) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
                  )
                );
              }
            }
            // Send token usage data from the final message
            try {
              const finalMessage = await stream.finalMessage();
              if (finalMessage.usage) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      usage: {
                        promptTokens: finalMessage.usage.input_tokens,
                        completionTokens: finalMessage.usage.output_tokens,
                        totalTokens:
                          finalMessage.usage.input_tokens +
                          finalMessage.usage.output_tokens,
                        model: LOCKED_MODEL,
                      },
                    })}\n\n`
                  )
                );
              }
            } catch {
              // Usage data is non-critical — skip if unavailable
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (err) {
            console.error("Streaming error:", err);
            // Send error details to the client so it can display them
            const errMsg =
              err instanceof Error ? err.message : "Unknown streaming error";
            const isAuthError =
              errMsg.includes("401") ||
              errMsg.includes("authentication") ||
              errMsg.includes("invalid x-api-key") ||
              errMsg.includes("Invalid API Key");
            const isModelError =
              errMsg.includes("model") || errMsg.includes("not found");
            const isRateLimit =
              errMsg.includes("429") || errMsg.includes("rate");

            let userMessage = `API Error: ${errMsg}`;
            if (isAuthError)
              userMessage =
                "Invalid API key — check your ANTHROPIC_API_KEY in Vercel environment variables and redeploy.";
            else if (isModelError)
              userMessage = `Model "${LOCKED_MODEL}" not available — check the model name in src/data/models.ts.`;
            else if (isRateLimit)
              userMessage =
                "Rate limited by Anthropic — wait a moment and try again.";

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: userMessage })}\n\n`
              )
            );
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Mock fallback — generate a context-aware placeholder response
    const lastUserMessage =
      messages
        ?.filter((m: { role: string }) => m.role === "user")
        .pop()?.content || "";

    const mockResponse = generateMockResponse(
      lastUserMessage,
      fullSystemPrompt,
      skillPrompts.length
    );

    return NextResponse.json({
      role: "assistant",
      content: mockResponse,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

function generateMockResponse(
  userMessage: string,
  systemPrompt: string,
  skillCount: number
): string {
  const hasNorthStar = systemPrompt.includes("BUSINESS CONTEXT");
  const hasBrand = systemPrompt.includes("BRAND GUIDELINES");
  const hasMechanism = systemPrompt.includes("SALES MECHANISM CONTEXT");
  const hasSkills = skillCount > 0;

  const contextNote = [
    hasNorthStar && "your North Star business context",
    hasBrand && "your Brand Guidelines",
    hasMechanism && "your Sales Mechanism data",
    hasSkills && `${skillCount} live skill framework(s)`,
  ]
    .filter(Boolean)
    .join(" and ");

  const contextLine = contextNote
    ? `\n\n*Using ${contextNote} for personalised output.*`
    : "\n\n*Complete your North Star document at /north-star for personalised AI outputs.*";

  return `## AI Response (Mock Mode)

This is a **mock response** — connect your Anthropic API key in \`.env.local\` to enable real AI generation.

**Your input:** ${userMessage.slice(0, 200)}${userMessage.length > 200 ? "..." : ""}

### What would happen with a real API key:
- The system would use the model you selected in the toolbar
- Your business context from the North Star document would be injected automatically
- Brand Guidelines would shape the tone and vocabulary of every output
- Live skills from the registry would be matched and injected dynamically
- Real-time streaming would show the response as it's generated
${contextLine}

---

*To enable real AI: add \`ANTHROPIC_API_KEY=sk-ant-...\` to your \`.env.local\` file and restart the dev server.*`;
}
