import { NextRequest, NextResponse } from "next/server";

const NOTION_API = "https://api.notion.com/v1/pages";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      firstName,
      lastName,
      email,
      recurringProblems,
      mostAppealingSolutions,
      attractionFactors,
      unqualifiedProspectsNotes,
    } = body;

    const notionApiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_QUALITATIVE_FEEDBACK_DB;

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
      Submission: {
        title: [{ text: { content: title || "Qualitative Feedback" } }],
      },
    };

    if (firstName) {
      properties["First Name"] = {
        rich_text: [{ text: { content: firstName } }],
      };
    }
    if (lastName) {
      properties["Last Name"] = {
        rich_text: [{ text: { content: lastName } }],
      };
    }
    if (email) {
      properties["Email"] = { email };
    }
    if (recurringProblems) {
      properties["Recurring problems / pain points"] = {
        rich_text: [{ text: { content: recurringProblems } }],
      };
    }
    if (mostAppealingSolutions) {
      properties["Most appealing solutions / products / features"] = {
        rich_text: [{ text: { content: mostAppealingSolutions } }],
      };
    }
    if (attractionFactors) {
      properties["Attraction factors"] = {
        rich_text: [{ text: { content: attractionFactors } }],
      };
    }
    if (unqualifiedProspectsNotes) {
      properties[
        "For unqualified prospects, what is making them unqualified? What are they attracted to?"
      ] = {
        rich_text: [{ text: { content: unqualifiedProspectsNotes } }],
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
    console.error("Qualitative feedback submission error:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}
