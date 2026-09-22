import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { getSupabasePublicConfig } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Refreshes the Supabase auth session and writes updated cookies onto the
 * response produced by the i18n proxy. Authorization itself is enforced in
 * pages/layouts (and by RLS), not here.
 */
export async function updateSession(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  const config = getSupabasePublicConfig();
  if (!config) return response;

  const supabase = createServerClient<Database>(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers ?? {})) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // Validates the JWT and refreshes it when expired. Do not remove.
  await supabase.auth.getClaims();
  return response;
}
