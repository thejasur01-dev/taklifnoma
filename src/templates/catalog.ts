import type { CeremonyType } from "@/lib/config";
import type { LayoutId, ThemeId } from "./themes";
import type { VideoGateSlug } from "./video-gate/configs";

/**
 * The template catalog. Slugs match `templates.slug` in the database
 * (migration 0003) and the `templateNames` / `templateInfo` message keys.
 *
 *  - media:  own artwork and renderer (e.g. video intro)
 *  - themed: generic renderer = layout × theme (PROJECT_SPEC §6)
 */
type MediaTemplate = {
  slug: VideoGateSlug;
  kind: "media";
  thumbnail: string;
  hasVideo: true;
  categories: readonly CeremonyType[];
};

type ThemedTemplate = {
  slug: ThemeId;
  kind: "themed";
  layout: LayoutId;
  hasVideo: false;
  categories: readonly CeremonyType[];
};

export type CatalogTemplate = MediaTemplate | ThemedTemplate;

const themed = (slug: ThemeId, layout: LayoutId, categories: CeremonyType[]): ThemedTemplate => ({
  slug,
  kind: "themed",
  layout,
  hasVideo: false,
  categories,
});

export const CATALOG: readonly CatalogTemplate[] = [
  {
    slug: "gulli-darvoza",
    kind: "media",
    thumbnail: "/templates/gulli-darvoza/gate-thumb.webp",
    hasVideo: true,
    categories: ["wedding", "nikoh"],
  },
  {
    slug: "samarqand-peshtoq",
    kind: "media",
    thumbnail: "/templates/samarqand-peshtoq/portal-thumb.webp",
    hasVideo: true,
    categories: ["wedding", "nikoh"],
  },
  themed("lojuvard", "arch", ["wedding", "nikoh"]),
  themed("anor", "frame", ["wedding", "qiz_bazm"]),
  themed("zumrad-tun", "arch", ["nikoh", "fotiha"]),
  themed("oq-atlas", "minimal", ["wedding", "birthday"]),
  themed("tungi-osmon", "frame", ["wedding", "qiz_bazm"]),
  themed("sahro", "arch", ["osh", "xatna"]),
  themed("lola", "minimal", ["fotiha", "qiz_bazm", "birthday"]),
  themed("kumush", "frame", ["osh", "xatna", "other"]),
];

export type TemplateSlug = CatalogTemplate["slug"];

export function getCatalogTemplate(slug: string): CatalogTemplate | undefined {
  return CATALOG.find((t) => t.slug === slug);
}

/** Sample event used by template previews and new drafts. */
export const DEMO_STARTS_AT = "2026-10-17T18:00:00+05:00";
