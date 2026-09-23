import "server-only";
import { hasLocale } from "next-intl";
import { cache } from "react";
import { type Locale, routing } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { type CatalogTemplate, getCatalogTemplate } from "@/templates/catalog";
import { type InvitationData, invitationDataSchema } from "@/templates/schema";

export type PublicInvitation = {
  slug: string;
  data: InvitationData;
  template: CatalogTemplate;
  locale: Locale;
  /** live: published and within its active period; preview: the owner viewing a draft. */
  mode: "live" | "preview";
};

/**
 * Loads an invitation for /i/[slug]. Guests have no table access (RLS), so this
 * uses the service role and applies the visibility rules itself.
 * Cached per request (layout + page + metadata share one query).
 */
export const getPublicInvitation = cache(async (slug: string): Promise<PublicInvitation | null> => {
  const admin = createAdminClient();
  if (!admin || !/^[a-z0-9-]{3,40}$/.test(slug)) return null;

  const { data: row } = await admin
    .from("invitations")
    .select("slug, status, owner_id, locales, data, active_until, templates(slug)")
    .eq("slug", slug)
    .maybeSingle();
  if (!row) return null;

  const template = getCatalogTemplate(row.templates?.slug ?? "");
  const data = invitationDataSchema.safeParse(row.data);
  if (!template || !data.success) return null;

  const first = row.locales[0];
  const locale: Locale = hasLocale(routing.locales, first) ? first : routing.defaultLocale;
  const today = new Date().toISOString().slice(0, 10);
  const live = row.status === "active" && (!row.active_until || row.active_until >= today);

  if (live) return { slug: row.slug, data: data.data, template, locale, mode: "live" };

  const user = await getCurrentUser();
  if (user?.id === row.owner_id && row.status !== "blocked") {
    return { slug: row.slug, data: data.data, template, locale, mode: "preview" };
  }
  return null;
});
