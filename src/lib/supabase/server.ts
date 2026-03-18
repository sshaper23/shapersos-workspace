import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client (service role key, bypasses RLS).
 * Use only in API routes. Returns null if env vars are missing.
 */
export function getSupabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
