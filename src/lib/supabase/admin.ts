import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/env";
import { serverEnv } from "@/lib/server-env";
import type { Database } from "@/types/database";

/**
 * Service-role client: BYPASSES RLS. Use only in trusted server code
 * (payment webhooks, Telegram auth, admin actions after an is_admin check).
 */
export function createAdminClient() {
  const config = getSupabasePublicConfig();
  const secret = serverEnv.SUPABASE_SECRET_KEY;
  if (!config || !secret) return null;

  return createClient<Database>(config.url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
