import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  TELEGRAM_GATEWAY_TOKEN: z.string().min(1).optional(),
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  AUTH_DEV_FIXED_CODE: z.string().optional(),
  ALLOW_FREE_PUBLISH: z.string().optional(),
});

export const serverEnv = serverSchema.parse({
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY || undefined,
  TELEGRAM_GATEWAY_TOKEN: process.env.TELEGRAM_GATEWAY_TOKEN || undefined,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || undefined,
  AUTH_DEV_FIXED_CODE: process.env.AUTH_DEV_FIXED_CODE || undefined,
  ALLOW_FREE_PUBLISH: process.env.ALLOW_FREE_PUBLISH || undefined,
});

/**
 * Publishing without payment ("test activation"): always on in development,
 * opt-in elsewhere via ALLOW_FREE_PUBLISH=1 until Payme/Click are integrated.
 */
export function isFreePublishAllowed(): boolean {
  return process.env.NODE_ENV !== "production" || serverEnv.ALLOW_FREE_PUBLISH === "1";
}
