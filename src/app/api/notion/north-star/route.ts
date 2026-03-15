import { NextRequest, NextResponse } from "next/server";
import {
  northStarSections,
  NOTION_NORTH_STAR_DATA_SOURCE,
} from "@/data/north-star";

// Notion API endpoints
const NOTION_API = "https://api.notion.com/v1/pages";
const NOTION_DB_QUERY = `https://api.notion.com/v1/databases/${NOTION_NORTH_STAR_DATA_SOURCE}/query`;

// GET: Read the most recent North Star entry from Notion
export async function GET() {
  try {
    const notionApiKey = process.env.NOTION_API_KEY;

    if (!notionApiKey) {
      return NextResponse.json({ success: true, data: null, synced: false });
    }

    const response = await fetch(NOTION_DB_QUERY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionApiKey}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        sorts: [{ timestamp: "created_time", direction: "descending" }],
        page_size: 1,
      }),
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error("Notion query error:", await response.text());
      return NextResponse.json({ success: false, data: null });
    }

    const data = await response.json();

    if (!data.results?.length) {
      return NextResponse.json({ success: true, data: null });
    }

    const page = data.results[0];
    const fields: Record<string, string> = {};

    // Map Notion properties back to field keys
    const allFields = northStarSections.flatMap((s) => s.fields);
    for (const field of allFields) {
      const prop = page.properties?.[field.notionProperty];
      if (!prop) continue;

      if (prop.title?.[0]?.text?.content) {
        fields[field.key] = prop.title[0].text.content;
      } else if (prop.rich_text?.[0]?.text?.content) {
        fields[field.key] = prop.rich_text[0].text.content;
      }
    }

    return NextResponse.json({
      success: true,
      data: Object.keys(fields).length > 0 ? fields : null,
      notionPageId: page.id,
    });
  } catch (error) {
    console.error("North Star GET error:", error);
    return NextResponse.json({ success: false, data: null }, { status: 500 });
  }
}

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
