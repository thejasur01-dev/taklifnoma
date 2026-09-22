"use server";

import type { Messages } from "next-intl";
import { getLocale } from "next-intl/server";
import { z } from "zod";
import { redirect } from "@/i18n/navigation";
import { normalizePhone } from "@/lib/auth/phone";
import { requestLoginCode, verifyLoginCode } from "@/lib/auth/phone-login";
import { createClient } from "@/lib/supabase/server";

export type AuthErrorKey = keyof Messages["auth"]["errors"];

export type PhoneLoginState = {
  step: "phone" | "code";
  phone?: string;
  error?: AuthErrorKey;
  retryAfterSeconds?: number;
  /** Increments on every successful send so the client can restart its resend timer. */
  sentCount?: number;
};

const codeSchema = z.string().regex(/^\d{6}$/);

export async function requestPhoneCode(prev: PhoneLoginState, formData: FormData): Promise<PhoneLoginState> {
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  if (!phone) return { ...prev, step: "phone", error: "invalidPhone" };

  const result = await requestLoginCode(phone);
  if (!result.ok) {
    return {
      ...prev,
      step: prev.step === "code" && prev.phone === phone ? "code" : "phone",
      phone,
      error: result.error,
      retryAfterSeconds: result.retryAfterSeconds,
    };
  }
  return { step: "code", phone, sentCount: (prev.sentCount ?? 0) + 1 };
}

export async function verifyPhoneCode(prev: PhoneLoginState, formData: FormData): Promise<PhoneLoginState> {
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  if (!phone) return { step: "phone", error: "invalidPhone" };

  const code = codeSchema.safeParse(String(formData.get("code") ?? "").replace(/\D/g, ""));
  if (!code.success) return { ...prev, step: "code", phone, error: "invalidCode" };

  const locale = await getLocale();
  const result = await verifyLoginCode(phone, code.data, locale);
  if (!result.ok) return { ...prev, step: "code", phone, error: result.error };

  return redirect({ href: "/dashboard", locale });
}

export async function signOut(): Promise<never> {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  const locale = await getLocale();
  return redirect({ href: "/", locale });
}
