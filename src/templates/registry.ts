import type { CeremonyType } from "@/lib/config";

/**
 * Full (media) templates with their own page renderer. Cover-only showcase
 * themes live in themes.ts until they get full layouts.
 */
export const MEDIA_TEMPLATES = [
  {
    slug: "gulli-darvoza",
    thumbnail: "/templates/gulli-darvoza/gate-thumb.webp",
    hasVideo: true,
    categories: ["wedding", "nikoh"],
  },
] as const satisfies readonly {
  slug: string;
  thumbnail: string;
  hasVideo: boolean;
  categories: readonly CeremonyType[];
}[];

export type MediaTemplateSlug = (typeof MEDIA_TEMPLATES)[number]["slug"];

export function isMediaTemplate(slug: string): slug is MediaTemplateSlug {
  return MEDIA_TEMPLATES.some((t) => t.slug === slug);
}

/** Sample event used by template previews. */
export const DEMO_STARTS_AT = "2026-10-17T18:00:00+05:00";
