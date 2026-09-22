import type { EmailOtpType } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { getPathname } from "@/i18n/navigation";
import { getLocaleFromCookie } from "@/lib/auth/locale-cookie";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES: readonly EmailOtpType[] = [
  "email",
  "magiclink",
  "signup",
  "recovery",
  "email_change",
  "invite",
];

/**
 * Handles the link from the login email. Supports both the recommended
 * token_hash template and the default PKCE `code` redirect.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const locale = await getLocaleFromCookie();
  const next = safeRedirectPath(params.get("next"), getPathname({ href: "/dashboard", locale }));
  const failure = `${getPathname({ href: "/login", locale })}?error=linkExpired`;

  const supabase = await createClient();
  if (!supabase) redirect(`${getPathname({ href: "/login", locale })}?error=notConfigured`);

  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const code = params.get("code");

  if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) redirect(next);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
  }

  redirect(failure);
}
