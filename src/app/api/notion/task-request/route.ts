import { NextRequest, NextResponse } from "next/server";

const NOTION_API = "https://api.notion.com/v1/pages";

function truncate(value: string, max = 2000): string {
  return value.length > max ? value.slice(0, max) : value;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      taskName,
      businessName,
      description,
      taskTypes,
      urgency,
      dueDate,
      resources,
    } = body;

    if (!taskName || taskName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Task name is required" },
        { status: 400 }
      );
    }

    const notionApiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_TASK_REQUEST_DB;

    if (!notionApiKey || !databaseId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Notion API key or Task Request database ID is not configured.",
        },
        { status: 500 }
      );
    }

    // Build Notion properties
    const properties: Record<string, unknown> = {};

    // Title property
    properties["Task name"] = {
      title: [{ text: { content: truncate(taskName.trim()) } }],
    };

    // Business Name (rich_text)
    if (businessName && businessName.trim()) {
      properties["Business Name"] = {
        rich_text: [{ text: { content: truncate(businessName.trim()) } }],
      };
    }

    // Description (rich_text) — Notion property name includes "(1)"
    if (description && description.trim()) {
      properties["Please describe the task in detail (1)"] = {
        rich_text: [{ text: { content: truncate(description.trim()) } }],
      };
    }

    // Task type (multi_select)
    if (taskTypes && Array.isArray(taskTypes) && taskTypes.length > 0) {
      properties["Task type"] = {
        multi_select: taskTypes.map((t: string) => ({ name: t })),
      };
    }

    // Urgency (multi_select)
    if (urgency && urgency.trim()) {
      properties["How urgent is this request?"] = {
        multi_select: [{ name: urgency.trim() }],
      };
    }

    // Due date
    if (dueDate && dueDate.trim()) {
      properties["Due date"] = {
        date: { start: dueDate.trim() },
      };
    }

    // Resources (rich_text) — Notion property name includes "(1)"
    if (resources && resources.trim()) {
      properties["Resources (1)"] = {
        rich_text: [{ text: { content: truncate(resources.trim()) } }],
      };
    }

    // Status
    properties["Status"] = {
      status: { name: "Not started" },
    };

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
        { success: false, error: "Failed to create task in Notion" },
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
    console.error("Task request submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process submission" },
      { status: 500 }
    );
  }
}
