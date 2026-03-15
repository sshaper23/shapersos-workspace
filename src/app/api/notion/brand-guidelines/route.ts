import { NextRequest, NextResponse } from "next/server";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_BRAND_GUIDELINES_DB = process.env.NOTION_BRAND_GUIDELINES_DB;

// Map of field names → Notion property names
const FIELD_MAP: Record<string, string> = {
  brandPurpose: "Brand Purpose",
  brandTransformation: "Brand Transformation",
  brandMission: "Brand Mission",
  competitors: "Competitors",
  competitorStrengths: "Competitor Strengths",
  differentiator: "Differentiator",
  personalitySliders: "Personality Sliders",
  personalityDescription: "Personality Description",
  personality_formal_casual: "Formal vs Casual",
  personality_serious_playful: "Serious vs Playful",
  personality_traditional_innovative: "Traditional vs Innovative",
  personality_exclusive_accessible: "Exclusive vs Accessible",
  personality_restrained_bold: "Restrained vs Bold",
  naturalLanguage: "Natural Language",
  avoidWords: "Avoid Words",
  powerWords: "Power Words",
  firstEncounterFeel: "First Encounter Feel",
  sixMonthFeel: "Six Month Feel",
  threeYearFame: "Three Year Fame",
  brandAdmire: "Brand Admire",
  visualAesthetic: "Visual Aesthetic",
  colourDirection: "Colour Direction",
  visualReferences: "Visual References",
  bestTestimonials: "Best Testimonials",
  proudResult: "Proud Result",
  founderStory: "Founder Story",
  neverDo: "Never Do",
  wrongClient: "Wrong Client",
  distanceFrom: "Distance From",
  synthesizedGuidelines: "Synthesized Guidelines",
};

export async function POST(request: NextRequest) {
  if (!NOTION_API_KEY || !NOTION_BRAND_GUIDELINES_DB) {
    return NextResponse.json(
      { error: "Notion not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    // Build properties
    const properties: Record<string, unknown> = {
      "Brand Name": {
        title: [{ text: { content: body.brandMission || "Brand Guidelines" } }],
      },
      Status: {
        select: { name: body.synthesizedGuidelines ? "Complete" : "Draft" },
      },
    };

    // Map all fields to rich_text properties
    Object.entries(FIELD_MAP).forEach(([fieldName, notionProp]) => {
      const value = body[fieldName];
      if (value && notionProp !== "Brand Name") {
        // Notion rich_text max 2000 chars per block
        const truncated =
          typeof value === "string" ? value.slice(0, 2000) : String(value);
        properties[notionProp] = {
          rich_text: [{ text: { content: truncated } }],
        };
      }
    });

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_BRAND_GUIDELINES_DB },
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
    console.error("Brand guidelines save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!NOTION_API_KEY || !NOTION_BRAND_GUIDELINES_DB) {
    return NextResponse.json(
      { error: "Notion not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_BRAND_GUIDELINES_DB}/query`,
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
          page_size: 1,
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
    const page = data.results?.[0];

    if (!page) {
      return NextResponse.json({ data: null });
    }

    // Extract properties into flat map
    const result: Record<string, string> = {};

    // Reverse the field map for lookup
    const reverseMap: Record<string, string> = {};
    Object.entries(FIELD_MAP).forEach(([fieldName, notionProp]) => {
      reverseMap[notionProp] = fieldName;
    });

    Object.entries(page.properties).forEach(
      ([propName, propValue]: [string, unknown]) => {
        const prop = propValue as { type: string; rich_text?: Array<{ plain_text: string }>; title?: Array<{ plain_text: string }> };
        const fieldName = reverseMap[propName];
        if (!fieldName) return;

        if (prop.type === "rich_text" && prop.rich_text?.length) {
          result[fieldName] = prop.rich_text
            .map((rt) => rt.plain_text)
            .join("");
        } else if (prop.type === "title" && prop.title?.length) {
          result[fieldName] = prop.title
            .map((t) => t.plain_text)
            .join("");
        }
      }
    );

    return NextResponse.json({
      data: result,
      notionPageId: page.id,
    });
  } catch (error) {
    console.error("Brand guidelines fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
