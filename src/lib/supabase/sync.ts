/**
 * Supabase Sync Engine
 *
 * Handles loading full user state from Supabase, saving partial updates,
 * and one-time migration from localStorage.
 */

import type { AppState } from "@/types/context";
import {
  fromDbNorthStar,
  fromDbBrandGuidelines,
  fromDbMechanism,
  fromDbAlignment,
  fromDbToolChat,
  fromDbConcept,
  fromDbFavorite,
  fromDbActivity,
  fromDbTokenUsage,
} from "./helpers";
import { getSupabaseServer } from "./server";

// ─── Load full user state from Supabase ───

export async function loadUserState(
  userId: string
): Promise<Partial<AppState> | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  // Fetch all tables in parallel
  const [
    userStateRes,
    northStarRes,
    brandRes,
    mechanismsRes,
    alignmentRes,
    chatSessionsRes,
    conceptsRes,
    favoritesRes,
    activityRes,
    tokensRes,
  ] = await Promise.all([
    supabase.from("user_state").select("*").eq("user_id", userId).single(),
    supabase.from("north_star_profiles").select("*").eq("user_id", userId),
    supabase.from("brand_guidelines_profiles").select("*").eq("user_id", userId),
    supabase.from("sales_mechanisms").select("*").eq("user_id", userId),
    supabase.from("alignment_analyses").select("*").eq("user_id", userId),
    supabase.from("tool_chat_sessions").select("*").eq("user_id", userId).order("updated_at", { ascending: false }),
    supabase.from("concept_library").select("*").eq("user_id", userId).order("updated_at", { ascending: false }),
    supabase.from("favorites").select("*").eq("user_id", userId).order("timestamp", { ascending: false }),
    supabase.from("recent_activity").select("*").eq("user_id", userId).order("timestamp", { ascending: false }).limit(20),
    supabase.from("token_usage_history").select("*").eq("user_id", userId).order("timestamp", { ascending: false }).limit(500),
  ]);

  // If no user_state row exists, user hasn't been migrated yet
  if (userStateRes.error || !userStateRes.data) {
    return null;
  }

  const us = userStateRes.data;

  // Build alignment analyses record (keyed by mechanismId)
  const alignmentAnalyses: Record<string, ReturnType<typeof fromDbAlignment>> = {};
  for (const row of alignmentRes.data || []) {
    const a = fromDbAlignment(row);
    alignmentAnalyses[a.mechanismId] = a;
  }

  const northStarProfiles = (northStarRes.data || []).map(fromDbNorthStar);
  const brandGuidelinesProfiles = (brandRes.data || []).map(fromDbBrandGuidelines);
  const mechanisms = (mechanismsRes.data || []).map(fromDbMechanism);

  // Derive legacy single-object accessors
  const activeNS = northStarProfiles.find((p) => p.id === us.active_north_star_id) || northStarProfiles[0] || null;
  const activeBG = brandGuidelinesProfiles.find((p) => p.id === us.active_brand_guidelines_id) || brandGuidelinesProfiles[0] || null;

  return {
    // Profiles
    northStarProfiles,
    activeNorthStarId: us.active_north_star_id || null,
    northStarData: activeNS,
    hasCompletedNorthStar: northStarProfiles.length > 0,
    northStarNotionPageId: activeNS?.notionPageId || null,

    brandGuidelinesProfiles,
    activeBrandGuidelinesId: us.active_brand_guidelines_id || null,
    brandGuidelinesData: activeBG,
    hasCompletedBrandGuidelines: brandGuidelinesProfiles.length > 0,
    brandGuidelinesNotionPageId: activeBG?.notionPageId || null,

    // Mechanisms
    mechanisms,
    activeMechanismId: us.active_mechanism_id || null,
    alignmentAnalyses,

    // Messaging matrix
    messagingMatrixState: us.messaging_matrix_state || null,

    // Model
    selectedModel: us.selected_model || "claude-sonnet-4-20250514",

    // Tracking
    firstVisitAt: us.first_visit_at || null,
    visitCount: us.visit_count || 0,
    toolsUsed: us.tools_used || 0,
    playbooksCompleted: us.playbooks_completed || 0,
    lastActiveDate: us.last_active_date || null,
    dismissedProgressSteps: us.dismissed_progress_steps || [],

    // Home
    weeklyFocus: us.weekly_focus || "",
    weeklyUpdate: us.weekly_update || { label: "", url: "" },
    ctaDismissedAt: us.cta_dismissed_at || null,

    // Subscription
    subscriptionTier: us.subscription_tier || "free",
    aiGenerationsUsed: us.ai_generations_used || 0,
    mechanicMessagesThisMonth: us.mechanic_messages_this_month || 0,
    mechanicMessagesResetAt: us.mechanic_messages_reset_at || null,

    // Collections
    toolChatSessions: (chatSessionsRes.data || []).map(fromDbToolChat),
    conceptLibrary: (conceptsRes.data || []).map(fromDbConcept),
    favorites: (favoritesRes.data || []).map(fromDbFavorite),
    recentActivity: (activityRes.data || []).map(fromDbActivity),
    tokenUsageHistory: (tokensRes.data || []).map(fromDbTokenUsage),
  };
}

// ─── Save partial state update to Supabase ───

export async function saveUserState(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  // Upsert user_state row
  const { error } = await supabase
    .from("user_state")
    .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ─── Check if user exists in Supabase ───

export async function userExistsInSupabase(userId: string): Promise<boolean> {
  const supabase = getSupabaseServer();
  if (!supabase) return false;

  const { data } = await supabase
    .from("user_state")
    .select("user_id")
    .eq("user_id", userId)
    .single();

  return !!data;
}
