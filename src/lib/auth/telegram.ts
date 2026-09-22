import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

/** Login data older than this is rejected (replay protection). */
export const TELEGRAM_AUTH_MAX_AGE_SECONDS = 24 * 60 * 60;

const telegramUserSchema = z.object({
  id: z.coerce.number().int().positive(),
  first_name: z.string().min(1).max(64),
  last_name: z.string().max(64).optional(),
  username: z.string().max(64).optional(),
  photo_url: z.url().optional(),
  auth_date: z.coerce.number().int().positive(),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
});

export type TelegramUser = z.infer<typeof telegramUserSchema>;

/**
 * Verifies Telegram Login Widget data.
 * https://core.telegram.org/widgets/login#checking-authorization
 *
 * All received fields except `hash` take part in the check string, so any
 * extra or tampered parameter makes the signature invalid.
 */
export function verifyTelegramAuth(
  params: Record<string, string>,
  botToken: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): TelegramUser | null {
  const parsed = telegramUserSchema.safeParse(params);
  if (!parsed.success) return null;

  const checkString = Object.keys(params)
    .filter((key) => key !== "hash")
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("\n");

  const secret = createHash("sha256").update(botToken).digest();
  const expected = createHmac("sha256", secret).update(checkString).digest();
  const received = Buffer.from(parsed.data.hash, "hex");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

  const age = nowSeconds - parsed.data.auth_date;
  if (age < -60 || age > TELEGRAM_AUTH_MAX_AGE_SECONDS) return null;

  return parsed.data;
}

/**
 * Supabase Auth needs an identifier; Telegram users get a stable synthetic
 * address that is never used for mailing. Identity is resolved by
 * profiles.telegram_id first, so this value never has to change.
 */
export function telegramSyntheticEmail(telegramId: number): string {
  return `tg${telegramId}@telegram.local`;
}

export function telegramDisplayName(user: Pick<TelegramUser, "first_name" | "last_name">): string {
  return [user.first_name, user.last_name].filter(Boolean).join(" ");
}
