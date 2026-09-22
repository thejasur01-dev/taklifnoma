"use server";

import type { Messages } from "next-intl";
import { getLocale } from "next-intl/server";
import { z } from "zod";
import { getPathname, redirect } from "@/i18n/navigation";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type AuthErrorKey = keyof Messages["auth"]["errors"];

export type EmailLoginState = {
  step: "email" | "code";
  email?: string;
  error?: AuthErrorKey;
};

const emailSchema = z.email().max(254);
const codeSchema = z.string().regex(/^\d{6,10}$/);

export async function sendEmailCode(_prev: EmailLoginState, formData: FormData): Promise<EmailLoginState> {
  const email = emailSchema.safeParse(
    String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
  );
  if (!email.success) return { step: "email", error: "invalidEmail" };

  const supabase = await createClient();
  if (!supabase) return { step: "email", email: email.data, error: "notConfigured" };

  const locale = await getLocale();
  const next = getPathname({ href: "/dashboard", locale });
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: {
      shouldCreateUser: true,
      data: { locale },
      emailRedirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { step: "email", email: email.data, error: error.status === 429 ? "rateLimited" : "sendFailed" };
  }
  return { step: "code", email: email.data };
}

export async function verifyEmailCode(_prev: EmailLoginState, formData: FormData): Promise<EmailLoginState> {
  const email = emailSchema.safeParse(
    String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
  );
  if (!email.success) return { step: "email", error: "invalidEmail" };

  const token = codeSchema.safeParse(String(formData.get("code") ?? "").replace(/\s/g, ""));
  if (!token.success) return { step: "code", email: email.data, error: "invalidCode" };

  const supabase = await createClient();
  if (!supabase) return { step: "code", email: email.data, error: "notConfigured" };

  const { error } = await supabase.auth.verifyOtp({ email: email.data, token: token.data, type: "email" });
  if (error) {
    return { step: "code", email: email.data, error: error.status === 429 ? "rateLimited" : "verifyFailed" };
  }

  const locale = await getLocale();
  return redirect({ href: "/dashboard", locale });
}

export async function signOut(): Promise<never> {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  const locale = await getLocale();
  return redirect({ href: "/login", locale });
}
