"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const rsvpSchema = z.object({
  slug: z.string().min(3).max(40),
  name: z.string().trim().min(1).max(80),
  answer: z.enum(["yes", "no"]),
  /** Honeypot: hidden field that real guests never fill. */
  website: z.string().max(0).optional(),
});

export type RsvpResult = "ok" | "invalid" | "closed" | "failed";

/**
 * Stores a guest reply. Guests have no direct table access (RLS), so this runs
 * with the service role and only for published (active) invitations.
 * TODO(stage 4): per-IP-hash rate limit and personal guest links.
 */
export async function submitRsvp(input: z.input<typeof rsvpSchema>): Promise<RsvpResult> {
  const parsed = rsvpSchema.safeParse(input);
  if (!parsed.success) return "invalid";
  // Bots that fill the honeypot get a silent success.
  if (parsed.data.website) return "ok";

  const admin = createAdminClient();
  if (!admin) return "failed";

  const { data: invitation } = await admin
    .from("invitations")
    .select("id, status")
    .eq("slug", parsed.data.slug)
    .maybeSingle();
  if (!invitation || invitation.status !== "active") return "closed";

  const { error } = await admin.from("rsvps").insert({
    invitation_id: invitation.id,
    name: parsed.data.name,
    status: parsed.data.answer,
    people_count: parsed.data.answer === "yes" ? 1 : 0,
  });
  return error ? "failed" : "ok";
}
