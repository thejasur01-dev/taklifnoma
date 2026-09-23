/**
 * Accepts only same-origin, locale-free app paths (e.g. "/create/anor") to
 * prevent open redirects such as "//evil.com" or "https://evil.com".
 */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  if (!/^\/[A-Za-z0-9/_\-?=&.%]*$/.test(value)) return null;
  return value;
}
