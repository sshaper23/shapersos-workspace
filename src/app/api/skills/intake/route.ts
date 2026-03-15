import { NextRequest, NextResponse } from "next/server";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_SKILLS_DB = process.env.NOTION_SKILLS_REGISTRY_DB;

/**
 * POST /api/skills/intake
 *
 * Dedicated intake endpoint for writing skills to Notion.
 * Accepts a skill payload, checks if the slug already exists,
 * then creates or updates accordingly.
 *
 * TODO: Add Clerk admin auth check when Clerk is installed:
 *   const { userId } = auth()
 *   const user = await clerkClient.users.getUser(userId)
 *   if (!user.publicMetadata.isAdmin) return 403
 */
export async function POST(req: NextRequest) {
  // Placeholder admin check — replace with Clerk when available
  const adminKey = req.headers.get("x-admin-key");
  // For now, allow all requests (no Clerk installed yet)
  // When Clerk is added, verify user.publicMetadata.isAdmin here

  if (!NOTION_API_KEY || !NOTION_SKILLS_DB) {
    return NextResponse.json(
      { error: "Notion skills registry not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const {
      skill_name,
      skill_slug,
      category,
      version,
      status,
      system_prompt,
      context_rules,
      key_concepts,
      applies_to,
      linked_playbooks,
      linked_tools,
    } = body;

    if (!skill_name || !skill_slug) {
      return NextResponse.json(
        { error: "skill_name and skill_slug are required" },
        { status: 400 }
      );
    }

    // Check if skill slug already exists
    const searchRes = await fetch(
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
            property: "Skill Slug",
            rich_text: { equals: skill_slug },
          },
          page_size: 1,
        }),
      }
    );

    let existingPageId: string | null = null;
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.results?.length > 0) {
        existingPageId = searchData.results[0].id;
      }
    }

    // Build properties object
    const properties: Record<string, unknown> = {
      "Skill Name": {
        title: [{ text: { content: skill_name } }],
      },
    };

    // Rich text fields (split at 2000 char blocks)
    const textFields: Record<string, string | undefined> = {
      "Skill Slug": skill_slug,
      Version: version || "1.0",
      "System Prompt": system_prompt,
      "Context Rules": context_rules,
      "Key Concepts": Array.isArray(key_concepts)
        ? key_concepts.join(", ")
        : key_concepts,
      "Linked Playbooks": Array.isArray(linked_playbooks)
        ? linked_playbooks.join(", ")
        : linked_playbooks,
      "Linked Tools": Array.isArray(linked_tools)
        ? linked_tools.join(", ")
        : linked_tools,
    };

    for (const [prop, value] of Object.entries(textFields)) {
      if (value) {
        const blocks = [];
        let remaining = value;
        while (remaining.length > 0) {
          blocks.push({ text: { content: remaining.slice(0, 2000) } });
          remaining = remaining.slice(2000);
        }
        properties[prop] = { rich_text: blocks };
      }
    }

    if (category) {
      properties["Category"] = { select: { name: category } };
    }
    if (status) {
      properties["Status"] = {
        select: {
          name: status.charAt(0).toUpperCase() + status.slice(1),
        },
      };
    }
    if (applies_to && Array.isArray(applies_to)) {
      properties["Applies To"] = {
        multi_select: applies_to.map((name: string) => ({ name })),
      };
    }
    properties["Last Updated"] = {
      date: { start: new Date().toISOString().split("T")[0] },
    };

    // Update or create
    if (existingPageId) {
      const res = await fetch(
        `https://api.notion.com/v1/pages/${existingPageId}`,
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

      if (!res.ok) {
        const err = await res.json();
        console.error("Skills intake update error:", err);
        return NextResponse.json(
          { error: "Failed to update skill" },
          { status: res.status }
        );
      }

      const data = await res.json();
      return NextResponse.json({
        success: true,
        action: "updated",
        notionPageId: data.id,
      });
    }

    // Create new
    const res = await fetch("https://api.notion.com/v1/pages", {
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

    if (!res.ok) {
      const err = await res.json();
      console.error("Skills intake create error:", err);
      return NextResponse.json(
        { error: "Failed to create skill" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      action: "created",
      notionPageId: data.id,
    });
  } catch (error) {
    console.error("Skills intake error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
