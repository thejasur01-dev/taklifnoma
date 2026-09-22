/**
 * Product-level constants. The brand name is a placeholder (see PROJECT_SPEC.md)
 * and must be changed only here.
 */
export const BRAND = {
  name: "Taklifnoma",
  domain: "taklifnoma.uz",
} as const;

/** How many days an invitation link stays active after the main event (§11). */
export const LINK_ACTIVE_DAYS_AFTER_EVENT = 90;

export const TIERS = ["basic", "premium", "vip"] as const;
export type Tier = (typeof TIERS)[number];

/** Starting prices in UZS (§11). The DB `templates.price_uzs` is the source of truth per template. */
export const TIER_PRICES_UZS: Record<Tier, number> = {
  basic: 99_000,
  premium: 149_000,
  vip: 249_000,
};

export const POPULAR_TIER: Tier = "premium";
