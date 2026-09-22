import "server-only";
import { serverEnv } from "@/lib/server-env";

/**
 * Telegram Gateway: delivers login codes to the "Verification Codes" chat of
 * the Telegram account registered with the phone number.
 * https://core.telegram.org/gateway/api
 */
const API = "https://gatewayapi.telegram.org";
const CODE_LENGTH = 6;
export const CODE_TTL_SECONDS = 300;

/** Local development without a Gateway account: fixed code, never in production. */
const DEV_REQUEST_ID = "dev";
const DEV_CODE = "000000";

type GatewayResponse<T> = { ok: true; result: T } | { ok: false; error: string };

type RequestStatus = {
  request_id: string;
  verification_status?: {
    status: "code_valid" | "code_invalid" | "code_max_attempts_exceeded" | "expired";
  };
};

export type SendResult = { ok: true; requestId: string } | { ok: false; reason: "unavailable" | "failed" };
export type CheckResult = "valid" | "invalid" | "expired" | "failed";

export function isDevCodeMode(): boolean {
  return process.env.NODE_ENV !== "production" && serverEnv.AUTH_DEV_FIXED_CODE === "1";
}

async function call<T>(method: string, body: Record<string, string | number>): Promise<GatewayResponse<T>> {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serverEnv.TELEGRAM_GATEWAY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return (await res.json()) as GatewayResponse<T>;
}

export async function sendLoginCode(phone: string): Promise<SendResult> {
  if (isDevCodeMode()) return { ok: true, requestId: DEV_REQUEST_ID };
  if (!serverEnv.TELEGRAM_GATEWAY_TOKEN) return { ok: false, reason: "unavailable" };

  try {
    const res = await call<RequestStatus>("sendVerificationMessage", {
      phone_number: phone,
      code_length: CODE_LENGTH,
      ttl: CODE_TTL_SECONDS,
    });
    if (res.ok) return { ok: true, requestId: res.result.request_id };
    // PHONE_NUMBER_NOT_FOUND etc.: the number has no Telegram account.
    return { ok: false, reason: res.error.startsWith("PHONE_NUMBER") ? "unavailable" : "failed" };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

export async function checkLoginCode(requestId: string, code: string): Promise<CheckResult> {
  if (isDevCodeMode() && requestId === DEV_REQUEST_ID) return code === DEV_CODE ? "valid" : "invalid";
  if (!serverEnv.TELEGRAM_GATEWAY_TOKEN) return "failed";

  try {
    const res = await call<RequestStatus>("checkVerificationStatus", { request_id: requestId, code });
    if (!res.ok) return "failed";
    switch (res.result.verification_status?.status) {
      case "code_valid":
        return "valid";
      case "code_invalid":
        return "invalid";
      case "code_max_attempts_exceeded":
      case "expired":
        return "expired";
      default:
        return "failed";
    }
  } catch {
    return "failed";
  }
}
