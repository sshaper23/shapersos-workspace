import { NextRequest, NextResponse } from "next/server";

const NOTION_API = "https://api.notion.com/v1/pages";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      launchPlan,
      clientName,
      platform,
      campaignName,
      adAccountName,
      audienceContext,
      creativeAssetsLink,
      notes,
    } = body;

    const notionApiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_CREATIVE_BRIEF_DB;

    if (!notionApiKey || !databaseId) {
      return NextResponse.json(
        {
          success: false,
          error: "Notion integration not configured",
        },
        { status: 500 }
      );
    }

    const properties: Record<string, unknown> = {
      "Launch Plan": {
        title: [{ text: { content: launchPlan || "Creative Brief" } }],
      },
      Status: {
        select: { name: "In Progress" },
      },
    };

    if (clientName) {
      properties["Client name"] = {
        rich_text: [{ text: { content: clientName } }],
      };
    }
    if (platform) {
      properties["Platform"] = {
        select: { name: platform },
      };
    }
    if (campaignName) {
      properties["Campaign name"] = {
        rich_text: [{ text: { content: campaignName } }],
      };
    }
    if (adAccountName) {
      properties["Ad account Name"] = {
        rich_text: [{ text: { content: adAccountName } }],
      };
    }
    if (audienceContext) {
      properties[
        "Desires, Benefits, Awareness Level, Sophistication and Persona"
      ] = {
        rich_text: [{ text: { content: audienceContext } }],
      };
    }
    if (creativeAssetsLink) {
      properties["Link To Creative Assets"] = {
        url: creativeAssetsLink,
      };
    }
    if (notes) {
      properties["Notes / clarifications"] = {
        rich_text: [{ text: { content: notes } }],
      };
    }

    const response = await fetch(NOTION_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionApiKey}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Notion API error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to sync to Notion" },
        { status: 500 }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      notionPageId: result.id,
      notionUrl: result.url,
    });
  } catch (error) {
    console.error("Creative brief submission error:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}
