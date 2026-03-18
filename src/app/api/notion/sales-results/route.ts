import { NextRequest, NextResponse } from "next/server";

const NOTION_API = "https://api.notion.com/v1/pages";

function truncate(text: string, max = 2000): string {
  return text.length > max ? text.slice(0, max) : text;
}

export async function POST(req: NextRequest) {
  try {
    const {
      businessName,
      week,
      bookedCalls,
      showedUp,
      closed,
      cashCollected,
      cashContracted,
      notes,
    } = await req.json();

    const notionApiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_SALES_RESULTS_DB;

    if (!notionApiKey || !databaseId) {
      return NextResponse.json({
        success: true,
        synced: false,
        message:
          "Form submitted successfully. Connect your Notion API key and database ID to enable sync.",
      });
    }

    // Build the title: "Week of {date} — {businessName}"
    const formattedDate = week
      ? new Date(week + "T00:00:00").toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        })
      : "Unknown";
    const title = `Week of ${formattedDate} — ${businessName || "Unknown Business"}`;

    const properties: Record<string, unknown> = {
      // Title property (Prospect)
      Prospect: {
        title: [{ text: { content: truncate(title) } }],
      },
    };

    // Business Name — rich_text
    if (businessName) {
      properties["Business Name"] = {
        rich_text: [{ text: { content: truncate(businessName) } }],
      };
    }

    // Week — date
    if (week) {
      properties["Week"] = {
        date: { start: week },
      };
    }

    // Booked calls — rich_text
    if (bookedCalls) {
      properties["Booked calls (this week with name and date)"] = {
        rich_text: [{ text: { content: truncate(bookedCalls) } }],
      };
    }

    // Showed up — rich_text
    if (showedUp) {
      properties["List calls that showed up + date"] = {
        rich_text: [{ text: { content: truncate(showedUp) } }],
      };
    }

    // Closed — rich_text
    if (closed) {
      properties[
        "List calls that closed + cash collected and contracted for each"
      ] = {
        rich_text: [{ text: { content: truncate(closed) } }],
      };
    }

    // Cash Collected — number
    if (cashCollected !== undefined && cashCollected !== null && cashCollected !== "") {
      properties["Cash Collected"] = {
        number: Number(cashCollected),
      };
    }

    // Cash Contracted — number
    if (cashContracted !== undefined && cashContracted !== null && cashContracted !== "") {
      properties["Cash Contracted"] = {
        number: Number(cashContracted),
      };
    }

    // Notes — rich_text
    if (notes) {
      properties["Notes"] = {
        rich_text: [{ text: { content: truncate(notes) } }],
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
    console.error("Sales Results submission error:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}
