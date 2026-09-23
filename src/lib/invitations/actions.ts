"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { LINK_ACTIVE_DAYS_AFTER_EVENT } from "@/lib/config";
import { isFreePublishAllowed } from "@/lib/server-env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { DEMO_STARTS_AT, getCatalogTemplate } from "@/templates/catalog";
import { type InvitationData, invitationDataSchema } from "@/templates/schema";
import { isValidSlug, randomSlug } from "./slug";

const REUSE_DRAFT_WINDOW_MS = 10 * 60 * 1000;

export type CreateDraftResult =
  { ok: true; id: string } | { ok: false; error: "auth" | "template" | "failed" };

/**
 * Creates a draft for the current user from a catalog template, prefilled with
 * sample content. An untouched draft of the same template created minutes ago
 * is reused, so reloads and back-navigation do not pile up drafts.
 */
export async function createDraft(templateSlug: string): Promise<CreateDraftResult> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  if (!user || !supabase) return { ok: false, error: "auth" };
  if (!getCatalogTemplate(templateSlug)) return { ok: false, error: "template" };

  const { data: template } = await supabase
    .from("templates")
    .select("id")
    .eq("slug", templateSlug)
    .maybeSingle();
  if (!template) return { ok: false, error: "template" };

  const since = new Date(Date.now() - REUSE_DRAFT_WINDOW_MS).toISOString();
  const { data: recent } = await supabase
    .from("invitations")
    .select("id, created_at, updated_at")
    .eq("owner_id", user.id)
    .eq("template_id", template.id)
    .eq("status", "draft")
    .gt("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (recent && recent.created_at === recent.updated_at) return { ok: true, id: recent.id };

  const locale = await getLocale();
  const demo = await getTranslations("demoInvitation");
  const data: InvitationData = invitationDataSchema.parse({
    hosts: { first: demo("first"), second: demo("second") },
    message: demo("message"),
    families: demo("families"),
    event: { startsAt: DEMO_STARTS_AT, venueName: demo("venueName"), address: demo("address") },
  });

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: created, error } = await supabase
      .from("invitations")
      .insert({
        owner_id: user.id,
        template_id: template.id,
        slug: randomSlug(),
        data,
        locales: [locale],
        main_event_date: data.event.startsAt.slice(0, 10),
      })
      .select("id")
      .single();
    if (created) return { ok: true, id: created.id };
    if (error?.code !== "23505") break; // retry only on a slug collision
  }
  return { ok: false, error: "failed" };
}

const saveSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  data: invitationDataSchema,
});

export type SaveResult =
  { ok: true } | { ok: false; error: "invalid" | "slugInvalid" | "slugTaken" | "slugReserved" | "failed" };

export async function saveInvitation(input: z.input<typeof saveSchema>): Promise<SaveResult> {
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  if (!isValidSlug(parsed.data.slug)) return { ok: false, error: "slugInvalid" };

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "failed" };

  // RLS restricts the update to the owner's own invitation.
  const { data, error } = await supabase
    .from("invitations")
    .update({
      slug: parsed.data.slug,
      data: parsed.data.data,
      main_event_date: parsed.data.data.event.startsAt.slice(0, 10),
    })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error?.code === "23505") return { ok: false, error: "slugTaken" };
  if (error?.message.includes("slug_reserved")) return { ok: false, error: "slugReserved" };
  if (error || !data) return { ok: false, error: "failed" };
  return { ok: true };
}

/**
 * Publishes an invitation without payment. Allowed only when
 * isFreePublishAllowed() (development, or ALLOW_FREE_PUBLISH=1) until
 * Payme/Click are integrated (stage 5).
 */
export async function activateForTesting(id: string): Promise<{ ok: boolean }> {
  if (!isFreePublishAllowed()) return { ok: false };

  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) return { ok: false };

  // Ownership check through RLS before using the service role.
  const { data: own } = await supabase.from("invitations").select("id, data").eq("id", id).maybeSingle();
  if (!own) return { ok: false };

  const parsed = invitationDataSchema.safeParse(own.data);
  const eventDay = parsed.success ? new Date(parsed.data.event.startsAt) : new Date();
  const activeUntil = new Date(eventDay.getTime() + LINK_ACTIVE_DAYS_AFTER_EVENT * 86_400_000);

  const { error } = await admin
    .from("invitations")
    .update({
      status: "active",
      published_at: new Date().toISOString(),
      active_until: activeUntil.toISOString().slice(0, 10),
    })
    .eq("id", id);
  return { ok: !error };
}
