/**
 * Product-level constants. The brand name is a placeholder (see PROJECT_SPEC.md)
 * and must be changed only here.
 */
export const BRAND = {
  name: "Taklifnoma",
  domain: "taklifnoma.uz",
} as const;

/** How many days an invitation link stays active after the main event. */
export const LINK_ACTIVE_DAYS_AFTER_EVENT = 90;

/**
 * Two plans (decision 2026-09-23):
 *  - standard: the customer fills any ready-made template in the constructor;
 *  - individual: a staff member customises the design together with the customer.
 */
export const PLANS = ["standard", "individual"] as const;
export type Plan = (typeof PLANS)[number];

export const PLAN_PRICES_UZS: Record<Plan, number> = {
  standard: 100_000,
  individual: 500_000,
};

export const CEREMONY_TYPES = [
  "wedding",
  "nikoh",
  "fotiha",
  "osh",
  "qiz_bazm",
  "xatna",
  "birthday",
  "other",
] as const;
export type CeremonyType = (typeof CEREMONY_TYPES)[number];
