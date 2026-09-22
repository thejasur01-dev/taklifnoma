/**
 * Accepts only same-origin relative paths to prevent open redirects
 * (e.g. "//evil.com" or "https://evil.com").
 */
export function safeRedirectPath(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
