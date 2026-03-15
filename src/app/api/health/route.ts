import { NextResponse } from "next/server";
import { LOCKED_MODEL } from "@/data/models";

/**
 * GET /api/health
 *
 * Quick diagnostic endpoint — tests whether the Anthropic API key is valid
 * and the configured model responds. Visit this URL in your browser to debug
 * connection issues.
 */
export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const checks: Record<string, string> = {};

  // 1. Check API key presence
  if (!apiKey) {
    checks.apiKey = "❌ MISSING — add ANTHROPIC_API_KEY to Vercel environment variables";
    return NextResponse.json({ status: "fail", model: LOCKED_MODEL, checks }, { status: 500 });
  }
  checks.apiKey = `✅ Present (${apiKey.slice(0, 12)}...)`;

  // 2. Test a minimal API call
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: LOCKED_MODEL,
      max_tokens: 10,
      messages: [{ role: "user", content: "Say OK" }],
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text : "";
    checks.apiCall = `✅ Model responded: "${text.slice(0, 50)}"`;
    checks.model = `✅ ${LOCKED_MODEL}`;
    checks.inputTokens = String(response.usage?.input_tokens ?? "?");
    checks.outputTokens = String(response.usage?.output_tokens ?? "?");

    return NextResponse.json({ status: "ok", model: LOCKED_MODEL, checks });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    checks.apiCall = `❌ ${msg}`;

    // Provide specific guidance
    if (msg.includes("401") || msg.includes("invalid") || msg.includes("API Key")) {
      checks.fix = "Your API key is invalid or revoked. Generate a new one at console.anthropic.com/settings/keys";
    } else if (msg.includes("model") || msg.includes("not found")) {
      checks.fix = `Model "${LOCKED_MODEL}" is not available. Check src/data/models.ts`;
    } else if (msg.includes("429")) {
      checks.fix = "Rate limited — wait a moment and try again";
    } else {
      checks.fix = "Check the error message above and verify your Anthropic account is active with credit";
    }

    return NextResponse.json({ status: "fail", model: LOCKED_MODEL, checks }, { status: 500 });
  }
}
