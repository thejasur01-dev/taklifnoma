import { z } from "zod";

/**
 * Content of one invitation (stored in invitations.data). Every template
 * renders the same shape, so switching templates never loses data (spec §6).
 */
export const invitationDataSchema = z.object({
  hosts: z.object({
    first: z.string().trim().min(1).max(40),
    second: z.string().trim().min(1).max(40),
  }),
  showBismillah: z.boolean().default(true),
  message: z.string().trim().max(600),
  families: z.string().trim().max(160),
  event: z.object({
    startsAt: z.iso.datetime({ offset: true }),
    venueName: z.string().trim().min(1).max(120),
    address: z.string().trim().max(240),
    /** Custom Yandex/Google link; generated from the address when absent. */
    mapUrl: z.url().optional(),
  }),
});

export type InvitationData = z.infer<typeof invitationDataSchema>;

export type Countdown = { days: number; hours: number; minutes: number; seconds: number; started: boolean };

/** Time left until `target`, floored to whole seconds. */
export function timeUntil(target: Date, now: Date = new Date()): Countdown {
  const total = Math.floor((target.getTime() - now.getTime()) / 1000);
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true };
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    started: false,
  };
}

/** Yandex Maps is the default in Uzbekistan; falls back to a search by venue and address. */
export function mapLink(event: InvitationData["event"]): string {
  if (event.mapUrl) return event.mapUrl;
  const query = [event.venueName, event.address].filter(Boolean).join(", ");
  return `https://yandex.uz/maps/?text=${encodeURIComponent(query)}`;
}
