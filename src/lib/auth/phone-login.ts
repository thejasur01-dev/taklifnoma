import "server-only";
import { phoneSyntheticEmail } from "@/lib/auth/phone";
import { CODE_MAX_VERIFY_ATTEMPTS, evaluateSendLimit } from "@/lib/auth/rate-limit";
import { CODE_TTL_SECONDS, checkLoginCode, sendLoginCode } from "@/lib/auth/telegram-gateway";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type RequestCodeResult =
  | { ok: true }
  | {
      ok: false;
      error: "notConfigured" | "telegramUnavailable" | "sendFailed" | "rateLimited";
      retryAfterSeconds?: number;
    };

export type VerifyCodeResult =
  | { ok: true }
  | { ok: false; error: "notConfigured" | "wrongCode" | "codeExpired" | "tooManyAttempts" | "verifyFailed" };

/** Sends a login code to Telegram after per-phone rate limiting. `phone` must be E.164. */
export async function requestLoginCode(phone: string): Promise<RequestCodeResult> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "notConfigured" };

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recent, error } = await admin
    .from("phone_verifications")
    .select("created_at")
    .eq("phone", phone)
    .gt("created_at", hourAgo);
  if (error) return { ok: false, error: "sendFailed" };

  const limit = evaluateSendLimit(recent.map((r) => new Date(r.created_at)));
  if (!limit.allowed) return { ok: false, error: "rateLimited", retryAfterSeconds: limit.retryAfterSeconds };

  const sent = await sendLoginCode(phone);
  if (!sent.ok)
    return { ok: false, error: sent.reason === "unavailable" ? "telegramUnavailable" : "sendFailed" };

  const { error: insertError } = await admin
    .from("phone_verifications")
    .insert({ phone, request_id: sent.requestId });
  return insertError ? { ok: false, error: "sendFailed" } : { ok: true };
}

/** Verifies the code and, on success, signs the user in (creating the account on first login). */
export async function verifyLoginCode(
  phone: string,
  code: string,
  locale: string,
): Promise<VerifyCodeResult> {
  const admin = createAdminClient();
  const supabase = await createClient();
  if (!admin || !supabase) return { ok: false, error: "notConfigured" };

  const validSince = new Date(Date.now() - CODE_TTL_SECONDS * 1000).toISOString();
  const { data: challenge } = await admin
    .from("phone_verifications")
    .select("id, request_id, attempts")
    .eq("phone", phone)
    .is("verified_at", null)
    .gt("created_at", validSince)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!challenge) return { ok: false, error: "codeExpired" };
  if (challenge.attempts >= CODE_MAX_VERIFY_ATTEMPTS) return { ok: false, error: "tooManyAttempts" };

  await admin
    .from("phone_verifications")
    .update({ attempts: challenge.attempts + 1 })
    .eq("id", challenge.id);

  const result = await checkLoginCode(challenge.request_id, code);
  if (result === "invalid") return { ok: false, error: "wrongCode" };
  if (result === "expired") return { ok: false, error: "codeExpired" };
  if (result === "failed") return { ok: false, error: "verifyFailed" };

  await admin
    .from("phone_verifications")
    .update({ verified_at: new Date().toISOString() })
    .eq("id", challenge.id);

  // Resolve the account: an existing profile with this phone, or a new user.
  const { data: profile } = await admin.from("profiles").select("id").eq("phone", phone).maybeSingle();
  let email = phoneSyntheticEmail(phone);
  if (profile) {
    const { data } = await admin.auth.admin.getUserById(profile.id);
    if (data.user?.email) email = data.user.email;
  }

  if (!profile) {
    // Create the account explicitly: a magic link generated for a user that does
    // not exist yet is a signup token and would not verify as "magiclink".
    // The DB trigger creates the profile row.
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { locale },
    });
    if (created.user) {
      await admin.from("profiles").update({ phone }).eq("id", created.user.id);
    } else if (createError?.code !== "email_exists") {
      return { ok: false, error: "verifyFailed" };
    }
  }

  // Mint a one-time token server-side and exchange it for a session cookie.
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (linkError || !link.properties.hashed_token) return { ok: false, error: "verifyFailed" };

  if (!profile) {
    // Covers the email_exists path (e.g. an earlier attempt created the user but failed later).
    await admin.from("profiles").update({ phone }).eq("id", link.user.id).is("phone", null);
  }

  const { error: sessionError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: link.properties.hashed_token,
  });
  return sessionError ? { ok: false, error: "verifyFailed" } : { ok: true };
}
