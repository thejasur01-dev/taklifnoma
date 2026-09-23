import type { InvitationData } from "../schema";

export type DateParts = { weekday: string; day: string; month: string; year: string; time: string };

/**
 * demo    — marketing preview, replies are not stored
 * preview — the owner looking at an unpublished draft, replies are not stored
 * live    — a published invitation opened by a guest
 */
export type InvitationMode = "demo" | "preview" | "live";

export type InvitationProps = {
  data: InvitationData;
  date: DateParts;
  mode: InvitationMode;
  /** Invitation slug, required in live mode to store RSVPs. */
  slug?: string;
  /** Rendered inside a phone frame: hero height comes from --inv-screen. */
  embedded?: boolean;
  /** Skip the opening screen (used by the editor preview). */
  initiallyOpen?: boolean;
};
