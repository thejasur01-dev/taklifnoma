/** Login-code limits per phone number. Each Gateway message costs money. */
export const CODE_RESEND_INTERVAL_SECONDS = 60;
export const CODE_MAX_PER_HOUR = 5;
export const CODE_MAX_VERIFY_ATTEMPTS = 5;

export type SendLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/** `recentSends` = creation times of codes sent to this phone during the last hour. */
export function evaluateSendLimit(recentSends: Date[], now: Date = new Date()): SendLimitResult {
  const hourAgo = now.getTime() - 60 * 60 * 1000;
  const lastHour = recentSends
    .map((d) => d.getTime())
    .filter((t) => t > hourAgo)
    .sort((a, b) => b - a);

  const latest = lastHour[0];
  if (latest !== undefined) {
    const elapsed = (now.getTime() - latest) / 1000;
    if (elapsed < CODE_RESEND_INTERVAL_SECONDS) {
      return { allowed: false, retryAfterSeconds: Math.ceil(CODE_RESEND_INTERVAL_SECONDS - elapsed) };
    }
  }

  if (lastHour.length >= CODE_MAX_PER_HOUR) {
    const oldest = lastHour[lastHour.length - 1]!;
    return { allowed: false, retryAfterSeconds: Math.ceil((oldest - hourAgo) / 1000) };
  }

  return { allowed: true };
}
