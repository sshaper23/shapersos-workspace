import { NextRequest, NextResponse } from "next/server";
import type { Skill } from "@/types/skills";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_SKILLS_DB = process.env.NOTION_SKILLS_REGISTRY_DB;

function extractRichText(prop: unknown): string {
  if (!prop || typeof prop !== "object") return "";
  const p = prop as { rich_text?: { plain_text: string }[] };
  return p.rich_text?.map((r) => r.plain_text).join("") || "";
}

function extractTitle(prop: unknown): string {
  if (!prop || typeof prop !== "object") return "";
  const p = prop as { title?: { plain_text: string }[] };
  return p.title?.map((r) => r.plain_text).join("") || "";
}

function extractSelect(prop: unknown): string {
  if (!prop || typeof prop !== "object") return "";
  const p = prop as { select?: { name: string } | null };
  return p.select?.name || "";
}

function extractMultiSelect(prop: unknown): string[] {
  if (!prop || typeof prop !== "object") return [];
  const p = prop as { multi_select?: { name: string }[] };
  return p.multi_select?.map((o) => o.name) || [];
}

function extractDate(prop: unknown): string {
  if (!prop || typeof prop !== "object") return "";
  const p = prop as { date?: { start: string } | null };
  return p.date?.start || "";
}

function parseNotionPageToSkill(page: Record<string, unknown>): Skill {
  const props = page.properties as Record<string, unknown>;
  const keyConcepts = extractRichText(props["Key Concepts"]);
  const linkedPlaybooks = extractRichText(props["Linked Playbooks"]);
  const linkedTools = extractRichText(props["Linked Tools"]);

  return {
    id: page.id as string,
    name: extractTitle(props["Skill Name"]),
    slug: extractRichText(props["Skill Slug"]),
    category: extractSelect(props["Category"]),
    version: extractRichText(props["Version"]),
    status: (extractSelect(props["Status"]) || "draft").toLowerCase() as
      | "active"
      | "draft"
      | "deprecated",
    systemPrompt: extractRichText(props["System Prompt"]),
    contextRules: extractRichText(props["Context Rules"]),
    keyConcepts: keyConcepts
      ? keyConcepts.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    appliesTo: extractMultiSelect(props["Applies To"]),
    linkedPlaybooks: linkedPlaybooks
      ? linkedPlaybooks.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    linkedTools: linkedTools
      ? linkedTools.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    lastUpdated: extractDate(props["Last Updated"]),
  };
}

export async function GET() {
  if (!NOTION_API_KEY || !NOTION_SKILLS_DB) {
    return NextResponse.json(
      { error: "Notion skills registry not configured", skills: [] },
      { status: 200 }
    );
  }

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_SKILLS_DB}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          filter: {
            property: "Status",
            select: { equals: "Active" },
          },
          sorts: [
            { property: "Skill Name", direction: "ascending" },
          ],
          page_size: 100,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error("Skills registry query error:", err);
      return NextResponse.json({ error: "Failed to query skills", skills: [] });
    }

    const data = await response.json();
    const skills = data.results.map((page: Record<string, unknown>) =>
      parseNotionPageToSkill(page)
    );

    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Skills registry fetch error:", error);
    return NextResponse.json({ error: "Internal server error", skills: [] });
  }
}

export async function POST(request: NextRequest) {
  if (!NOTION_API_KEY || !NOTION_SKILLS_DB) {
    return NextResponse.json(
      { error: "Notion skills registry not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const properties: Record<string, unknown> = {
      "Skill Name": {
        title: [{ text: { content: body.skill_name || "Unnamed Skill" } }],
      },
    };

    // Text fields (Notion rich_text limit: 2000 chars per block)
    const textFields: Record<string, string | undefined> = {
      "Skill Slug": body.skill_slug,
      Version: body.version,
      "System Prompt": body.system_prompt,
      "Context Rules": body.context_rules,
      "Key Concepts": body.key_concepts,
      "Linked Playbooks": body.linked_playbooks,
      "Linked Tools": body.linked_tools,
    };

    for (const [prop, value] of Object.entries(textFields)) {
      if (value) {
        // Notion rich_text blocks max 2000 chars — split if needed
        const blocks = [];
        let remaining = value;
        while (remaining.length > 0) {
          blocks.push({ text: { content: remaining.slice(0, 2000) } });
          remaining = remaining.slice(2000);
        }
        properties[prop] = { rich_text: blocks };
      }
    }

    // Select fields
    if (body.category) {
      properties["Category"] = { select: { name: body.category } };
    }
    if (body.status) {
      properties["Status"] = { select: { name: body.status } };
    }

    // Multi-select
    if (body.applies_to && Array.isArray(body.applies_to)) {
      properties["Applies To"] = {
        multi_select: body.applies_to.map((name: string) => ({ name })),
      };
    }

    // Date
    properties["Last Updated"] = {
      date: { start: new Date().toISOString().split("T")[0] },
    };

    // If updating existing page
    if (body.notionPageId) {
      const response = await fetch(
        `https://api.notion.com/v1/pages/${body.notionPageId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${NOTION_API_KEY}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
          },
          body: JSON.stringify({ properties }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        console.error("Skills update error:", err);
        return NextResponse.json(
          { error: "Failed to update skill" },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json({ success: true, notionPageId: data.id });
    }

    // Create new page
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_SKILLS_DB },
        properties,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Skills create error:", err);
      return NextResponse.json(
        { error: "Failed to create skill" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, notionPageId: data.id });
  } catch (error) {
    console.error("Skills registry save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
