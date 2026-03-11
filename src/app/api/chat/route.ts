import { NextRequest, NextResponse } from "next/server";

// Stub API route for future Claude streaming integration.
// When ready, replace with Anthropic SDK streaming.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, model, systemPrompt } = body;

    // Placeholder response — replace with Anthropic SDK call:
    //
    // import Anthropic from "@anthropic-ai/sdk";
    // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    // const stream = await client.messages.stream({
    //   model: model || "claude-sonnet-4-20250514",
    //   max_tokens: 4096,
    //   system: systemPrompt || "You are a helpful AI assistant.",
    //   messages,
    // });
    //
    // return new Response(stream.toReadableStream());

    return NextResponse.json({
      role: "assistant",
      content:
        "This is a placeholder response. Connect your Anthropic API key to enable real AI responses.",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
