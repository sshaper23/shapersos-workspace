import { NextRequest, NextResponse } from "next/server";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_SALES_MECHANISM_DB = process.env.NOTION_SALES_MECHANISM_DB;

export async function POST(request: NextRequest) {
  if (!NOTION_API_KEY || !NOTION_SALES_MECHANISM_DB) {
    return NextResponse.json(
      { error: "Notion not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const properties: Record<string, unknown> = {
      "Mechanism Name": {
        title: [{ text: { content: body.name || "Sales Mechanism" } }],
      },
      Status: {
        select: { name: body.status || "Draft" },
      },
    };

    // Text fields
    const textFields: Record<string, string | undefined> = {
      "Business Name": body.businessName,
      "Business ID": body.businessId,
      "Linked Offer": body.linkedOffer,
      "Funnel Type": body.funnelType,
      "Stages JSON": body.stages ? JSON.stringify(body.stages) : undefined,
      "Primary Lead Source": body.metrics?.primaryLeadSource,
      "Monthly Lead Volume": body.metrics?.leadVolume,
      "Cost Per Lead": body.metrics?.costPerLead,
      "Core Offer Price": body.metrics?.coreOfferPrice,
      "Average Client LTV": body.metrics?.ltv,
      "Upsell Description": body.metrics?.upsellDescription,
      "Upsell Price": body.metrics?.upsellPrice,
      "Continuity Description": body.metrics?.continuityDescription,
      "Continuity Monthly Value": body.metrics?.continuityMonthlyValue,
      "Mechanism Summary": body.mechanismSummary,
      "Journey Notes": body.journeyNotes,
    };

    Object.entries(textFields).forEach(([prop, value]) => {
      if (value) {
        const truncated = typeof value === "string" ? value.slice(0, 2000) : String(value);
        properties[prop] = {
          rich_text: [{ text: { content: truncated } }],
        };
      }
    });

    // Number fields
    if (body.stages?.length) {
      properties["Stage Count"] = { number: body.stages.length };
    }

    // Checkbox fields
    if (body.metrics?.hasUpsell !== undefined) {
      properties["Has Upsell"] = { checkbox: !!body.metrics.hasUpsell };
    }
    if (body.metrics?.hasContinuity !== undefined) {
      properties["Has Continuity"] = { checkbox: !!body.metrics.hasContinuity };
    }

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
        console.error("Notion API error:", err);
        return NextResponse.json(
          { error: "Failed to update in Notion" },
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
        parent: { database_id: NOTION_SALES_MECHANISM_DB },
        properties,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Notion API error:", err);
      return NextResponse.json(
        { error: "Failed to save to Notion" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      notionPageId: data.id,
    });
  } catch (error) {
    console.error("Sales mechanism save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!NOTION_API_KEY || !NOTION_SALES_MECHANISM_DB) {
    return NextResponse.json(
      { error: "Notion not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_SALES_MECHANISM_DB}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          sorts: [
            { timestamp: "last_edited_time", direction: "descending" },
          ],
          page_size: 10,
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to query Notion" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ results: data.results });
  } catch (error) {
    console.error("Sales mechanism fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
