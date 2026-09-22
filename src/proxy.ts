import createIntlProxy from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/proxy";

const handleI18nRouting = createIntlProxy(routing);

export async function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);
  return updateSession(request, response);
}

export const config = {
  // Skip API routes, auth callbacks, public invitation pages (/i/...),
  // Next internals and any file with an extension.
  matcher: ["/((?!api|auth|i/|_next|_vercel|.*\\..*).*)"],
};
