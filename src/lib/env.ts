import { z } from "zod";

/**
 * Public env (inlined into the client bundle). Each variable must be referenced
 * explicitly so Next.js can inline it.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: z.string().min(1).optional(),
});

const emptyToUndefined = (value: string | undefined) => (value === "" ? undefined : value);

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SITE_URL: emptyToUndefined(process.env.NEXT_PUBLIC_SITE_URL),
  NEXT_PUBLIC_SUPABASE_URL: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: emptyToUndefined(process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME),
});

export type SupabasePublicConfig = { url: string; key: string };

/** Returns null when Supabase is not configured yet (lets the app build and render without keys). */
export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}

export const isTelegramLoginEnabled = Boolean(publicEnv.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME);
