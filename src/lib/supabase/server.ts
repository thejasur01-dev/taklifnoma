import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicConfig } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Supabase client bound to the current user's session (RLS applies).
 * Returns null when Supabase is not configured.
 */
export async function createClient() {
  // Read cookies first so every caller is request-bound (dynamic) even before
  // Supabase is configured — otherwise auth-dependent pages get prerendered.
  const cookieStore = await cookies();
  const config = getSupabasePublicConfig();
  if (!config) return null;

  return createServerClient<Database>(config.url, config.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component: cookies are read-only there.
          // The proxy refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}

export type ServerSupabase = NonNullable<Awaited<ReturnType<typeof createClient>>>;
