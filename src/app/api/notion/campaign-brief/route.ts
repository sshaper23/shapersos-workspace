import { NextRequest, NextResponse } from "next/server";

const NOTION_API = "https://api.notion.com/v1/pages";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      launchPlan,
      clientName,
      platform,
      campaignObjective,
      campaignStrategy,
      campaignType,
      campaignDuration,
      budget,
      budgetSetting,
      adAccountName,
      trafficDestination,
      websiteLink,
      audienceContext,
      notes,
    } = body;

    const notionApiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_CAMPAIGN_BRIEF_DB;

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
        title: [{ text: { content: launchPlan || "Campaign Brief" } }],
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
    if (campaignObjective) {
      properties["Campaign Objective"] = {
        rich_text: [{ text: { content: campaignObjective } }],
      };
    }
    if (campaignStrategy) {
      properties["Campaign Strategy"] = {
        rich_text: [{ text: { content: campaignStrategy } }],
      };
    }
    if (campaignType) {
      properties["Campaign Type"] = {
        rich_text: [{ text: { content: campaignType } }],
      };
    }
    if (campaignDuration) {
      properties["Campaign duration"] = {
        rich_text: [{ text: { content: campaignDuration } }],
      };
    }
    if (budget) {
      properties["Budget"] = {
        rich_text: [{ text: { content: budget } }],
      };
    }
    if (budgetSetting && budgetSetting.length > 0) {
      properties["Budgeting Setting (ABO or CBO)"] = {
        multi_select: budgetSetting.map((s: string) => ({ name: s })),
      };
    }
    if (adAccountName) {
      properties["Ad account Name"] = {
        rich_text: [{ text: { content: adAccountName } }],
      };
    }
    if (trafficDestination) {
      properties["Where to send the traffic"] = {
        rich_text: [{ text: { content: trafficDestination } }],
      };
    }
    if (websiteLink) {
      properties["Link To Website (if applicable)"] = {
        url: websiteLink,
      };
    }
    if (audienceContext) {
      properties[
        "Desires, Benefits, Awareness Level, Sophistication and Persona"
      ] = {
        rich_text: [{ text: { content: audienceContext } }],
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
    console.error("Campaign brief submission error:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}
