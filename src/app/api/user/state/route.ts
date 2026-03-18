import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { loadUserState, saveUserState } from "@/lib/supabase/sync";

/**
 * Extract Clerk user ID from request.
 * Tries the Authorization header first, then falls back to a custom header.
 * In production, this should use Clerk's server-side auth().
 */
async function getUserId(req: NextRequest): Promise<string | null> {
  // Try custom header (set by client)
  const uid = req.headers.get("x-user-id");
  if (uid) return uid;

  // Try Clerk server-side auth if available
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}

/**
 * GET /api/user/state
 * Load full user state from Supabase.
 */
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const state = await loadUserState(userId);
  if (!state) {
    // User not in Supabase yet — return empty so client knows to migrate
    return NextResponse.json({ success: true, data: null, needsMigration: true });
  }

  return NextResponse.json({ success: true, data: state });
}

/**
 * PATCH /api/user/state
 * Save partial state updates.
 * Body: { userState?: {}, northStarProfiles?: [], ... }
 */
export async function PATCH(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 500 });
  }

  const errors: string[] = [];

  // ─── user_state scalar fields ───
  if (body.userState) {
    const result = await saveUserState(userId, body.userState);
    if (!result.success) errors.push(`user_state: ${result.error}`);
  }

  // ─── Collection upserts (replace all rows for the user) ───
  const collectionUpdates: {
    table: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
  }[] = [];

  if (body.northStarProfiles) {
    collectionUpdates.push({ table: "north_star_profiles", data: body.northStarProfiles });
  }
  if (body.brandGuidelinesProfiles) {
    collectionUpdates.push({ table: "brand_guidelines_profiles", data: body.brandGuidelinesProfiles });
  }
  if (body.mechanisms) {
    collectionUpdates.push({ table: "sales_mechanisms", data: body.mechanisms });
  }
  if (body.alignmentAnalyses) {
    collectionUpdates.push({ table: "alignment_analyses", data: body.alignmentAnalyses });
  }
  if (body.toolChatSessions) {
    collectionUpdates.push({ table: "tool_chat_sessions", data: body.toolChatSessions });
  }
  if (body.conceptLibrary) {
    collectionUpdates.push({ table: "concept_library", data: body.conceptLibrary });
  }
  if (body.favorites) {
    collectionUpdates.push({ table: "favorites", data: body.favorites });
  }
  if (body.recentActivity) {
    collectionUpdates.push({ table: "recent_activity", data: body.recentActivity });
  }
  if (body.tokenUsageHistory) {
    collectionUpdates.push({ table: "token_usage_history", data: body.tokenUsageHistory });
  }

  for (const { table, data } of collectionUpdates) {
    if (data.length === 0) {
      // Delete all rows for this user in this table
      const { error } = await supabase.from(table).delete().eq("user_id", userId);
      if (error) errors.push(`${table} delete: ${error.message}`);
    } else {
      // Upsert all rows
      const { error } = await supabase.from(table).upsert(data, { onConflict: "id" });
      if (error) errors.push(`${table} upsert: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ success: false, errors }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
