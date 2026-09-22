import type { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { getPathname } from "@/i18n/navigation";
import { getLocaleFromCookie } from "@/lib/auth/locale-cookie";
import { telegramDisplayName, telegramSyntheticEmail, verifyTelegramAuth } from "@/lib/auth/telegram";
import { serverEnv } from "@/lib/server-env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Telegram Login Widget callback (data-auth-url).
 * 1. Verify the widget signature with the bot token.
 * 2. Resolve the Supabase user by profiles.telegram_id (or create one).
 * 3. Mint a one-time magic-link token server-side and exchange it for a session cookie.
 */
export async function GET(request: NextRequest) {
  const locale = await getLocaleFromCookie();
  const loginPath = (error: string) => `${getPathname({ href: "/login", locale })}?error=${error}`;

  const botToken = serverEnv.TELEGRAM_BOT_TOKEN;
  const admin = createAdminClient();
  const supabase = await createClient();
  if (!botToken || !admin || !supabase) redirect(loginPath("notConfigured"));

  const tgUser = verifyTelegramAuth(Object.fromEntries(request.nextUrl.searchParams), botToken);
  if (!tgUser) redirect(loginPath("telegram"));

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("telegram_id", tgUser.id)
    .maybeSingle();

  let email = telegramSyntheticEmail(tgUser.id);
  if (existing) {
    const { data } = await admin.auth.admin.getUserById(existing.id);
    if (data.user?.email) email = data.user.email;
  }

  const fullName = telegramDisplayName(tgUser);
  // Creates the auth user on first login; the DB trigger creates the profile.
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { data: { full_name: fullName, locale } },
  });
  if (linkError || !link.properties.hashed_token) redirect(loginPath("telegram"));

  const { data: profile } = await admin.from("profiles").select("full_name").eq("id", link.user.id).single();

  await admin
    .from("profiles")
    .update({
      telegram_id: tgUser.id,
      telegram_username: tgUser.username ?? null,
      full_name: profile?.full_name || fullName,
    })
    .eq("id", link.user.id);

  const { error: otpError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: link.properties.hashed_token,
  });
  if (otpError) redirect(loginPath("telegram"));

  redirect(getPathname({ href: "/dashboard", locale }));
}
