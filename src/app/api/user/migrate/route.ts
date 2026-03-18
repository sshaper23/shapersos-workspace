import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  toDbNorthStar,
  toDbBrandGuidelines,
  toDbMechanism,
  toDbAlignment,
  toDbToolChat,
  toDbConcept,
  toDbFavorite,
  toDbActivity,
  toDbTokenUsage,
} from "@/lib/supabase/helpers";
import type { AppState, AlignmentAnalysis } from "@/types/context";

/**
 * POST /api/user/migrate
 *
 * One-time migration: accepts full localStorage AppState blob,
 * splits into Supabase table inserts. Called when an authenticated
 * user has data in localStorage but nothing in Supabase.
 */
export async function POST(req: NextRequest) {
  // Get user ID
  let userId: string | null = req.headers.get("x-user-id");
  if (!userId) {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const result = await auth();
      userId = result.userId;
    } catch {
      // Clerk not available
    }
  }
  if (!userId) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 500 });
  }

  const state: AppState = await req.json();
  const errors: string[] = [];

  // 1. Create user_state row
  const { error: userError } = await supabase.from("user_state").upsert({
    user_id: userId,
    active_north_star_id: state.activeNorthStarId || null,
    active_brand_guidelines_id: state.activeBrandGuidelinesId || null,
    active_mechanism_id: state.activeMechanismId || null,
    selected_model: state.selectedModel || "claude-sonnet-4-20250514",
    messaging_matrix_state: state.messagingMatrixState || null,
    first_visit_at: state.firstVisitAt || null,
    visit_count: state.visitCount || 0,
    tools_used: state.toolsUsed || 0,
    playbooks_completed: state.playbooksCompleted || 0,
    last_active_date: state.lastActiveDate || null,
    dismissed_progress_steps: state.dismissedProgressSteps || [],
    weekly_focus: state.weeklyFocus || "",
    weekly_update: state.weeklyUpdate || { label: "", url: "" },
    cta_dismissed_at: state.ctaDismissedAt || null,
    subscription_tier: state.subscriptionTier || "pro",
    ai_generations_used: state.aiGenerationsUsed || 0,
    mechanic_messages_this_month: state.mechanicMessagesThisMonth || 0,
    mechanic_messages_reset_at: state.mechanicMessagesResetAt || null,
  });
  if (userError) errors.push(`user_state: ${userError.message}`);

  // 2. North Star profiles
  if (state.northStarProfiles?.length) {
    const rows = state.northStarProfiles.map((p) => toDbNorthStar(p, userId!));
    const { error } = await supabase.from("north_star_profiles").upsert(rows, { onConflict: "id" });
    if (error) errors.push(`north_star_profiles: ${error.message}`);
  }

  // 3. Brand guidelines
  if (state.brandGuidelinesProfiles?.length) {
    const rows = state.brandGuidelinesProfiles.map((p) => toDbBrandGuidelines(p, userId!));
    const { error } = await supabase.from("brand_guidelines_profiles").upsert(rows, { onConflict: "id" });
    if (error) errors.push(`brand_guidelines_profiles: ${error.message}`);
  }

  // 4. Sales mechanisms
  if (state.mechanisms?.length) {
    const rows = state.mechanisms.map((m) => toDbMechanism(m, userId!));
    const { error } = await supabase.from("sales_mechanisms").upsert(rows, { onConflict: "id" });
    if (error) errors.push(`sales_mechanisms: ${error.message}`);
  }

  // 5. Alignment analyses
  if (state.alignmentAnalyses && Object.keys(state.alignmentAnalyses).length) {
    const rows = Object.values(state.alignmentAnalyses as Record<string, AlignmentAnalysis>).map((a) =>
      toDbAlignment(a, userId!)
    );
    const { error } = await supabase.from("alignment_analyses").upsert(rows, { onConflict: "id" });
    if (error) errors.push(`alignment_analyses: ${error.message}`);
  }

  // 6. Tool chat sessions
  if (state.toolChatSessions?.length) {
    const rows = state.toolChatSessions.map((s) => toDbToolChat(s, userId!));
    const { error } = await supabase.from("tool_chat_sessions").upsert(rows, { onConflict: "id" });
    if (error) errors.push(`tool_chat_sessions: ${error.message}`);
  }

  // 7. Concept library
  if (state.conceptLibrary?.length) {
    const rows = state.conceptLibrary.map((c) => toDbConcept(c, userId!));
    const { error } = await supabase.from("concept_library").upsert(rows, { onConflict: "id" });
    if (error) errors.push(`concept_library: ${error.message}`);
  }

  // 8. Favorites
  if (state.favorites?.length) {
    const rows = state.favorites.map((f) => toDbFavorite(f, userId!));
    const { error } = await supabase.from("favorites").upsert(rows, { onConflict: "id" });
    if (error) errors.push(`favorites: ${error.message}`);
  }

  // 9. Recent activity
  if (state.recentActivity?.length) {
    const rows = state.recentActivity.map((a) => toDbActivity(a, userId!));
    const { error } = await supabase.from("recent_activity").upsert(rows, { onConflict: "id" });
    if (error) errors.push(`recent_activity: ${error.message}`);
  }

  // 10. Token usage
  if (state.tokenUsageHistory?.length) {
    const rows = state.tokenUsageHistory.map((t) => toDbTokenUsage(t, userId!));
    const { error } = await supabase.from("token_usage_history").upsert(rows, { onConflict: "id" });
    if (error) errors.push(`token_usage_history: ${error.message}`);
  }

  if (errors.length > 0) {
    console.error("[migrate] Errors during migration:", errors);
    return NextResponse.json({ success: false, errors }, { status: 500 });
  }

  return NextResponse.json({ success: true, migrated: true });
}
