/** Mirrors the DB check on invitations.slug: 3–40 chars, lowercase, digits, inner hyphens. */
export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && !slug.includes("--");
}

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/** Random placeholder slug for a new draft; the owner can change it later. */
export function randomSlug(length = 8, random: () => number = Math.random): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[Math.floor(random() * ALPHABET.length)];
  return out;
}

/** Suggests a slug from names, e.g. "Akmal", "Madina" → "akmal-madina". */
export function slugFromNames(first: string, second: string): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[ʻʼ'‘’]/g, "")
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  return [clean(first), clean(second)]
    .filter(Boolean)
    .join("-")
    .replace(/-{2,}/g, "-")
    .slice(0, 40)
    .replace(/-+$/, "");
}
