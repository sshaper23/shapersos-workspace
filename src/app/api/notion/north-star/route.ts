import { NextRequest, NextResponse } from "next/server";
import {
  northStarSections,
  NOTION_NORTH_STAR_DATA_SOURCE,
} from "@/data/north-star";

// Notion API endpoint for creating pages
const NOTION_API = "https://api.notion.com/v1/pages";

export async function POST(req: NextRequest) {
  try {
    const { fields } = await req.json();

    // Map form field keys to Notion property names
    const allFields = northStarSections.flatMap((s) => s.fields);
    const properties: Record<string, unknown> = {};

    for (const field of allFields) {
      const value = fields[field.key];
      if (!value || value.trim().length === 0) continue;

      if (field.notionProperty === "What's your name?") {
        // Title property
        properties[field.notionProperty] = {
          title: [{ text: { content: value } }],
        };
      } else {
        // Rich text property
        properties[field.notionProperty] = {
          rich_text: [{ text: { content: value } }],
        };
      }
    }

    // Set status to "Awaiting Onboarding"
    properties["Status"] = {
      select: { name: "Awaiting Onboarding" },
    };

    const notionApiKey = process.env.NOTION_API_KEY;

    if (!notionApiKey) {
      // If no API key, return success but note it's not synced
      return NextResponse.json({
        success: true,
        synced: false,
        message:
          "Form submitted successfully. Connect your Notion API key to enable sync.",
      });
    }

    // Create page in Notion database
    const response = await fetch(NOTION_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionApiKey}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_NORTH_STAR_DATA_SOURCE },
        properties,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Notion API error:", error);
      return NextResponse.json(
        {
          success: false,
          synced: false,
          error: "Failed to sync to Notion",
        },
        { status: 500 }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      synced: true,
      notionPageId: result.id,
      notionUrl: result.url,
    });
  } catch (error) {
    console.error("North Star submission error:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}
