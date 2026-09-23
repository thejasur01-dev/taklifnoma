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

export type Countdown = { days: number; hours: number; minutes: number; started: boolean };

/** Time left until `target`, floored to whole minutes. */
export function timeUntil(target: Date, now: Date = new Date()): Countdown {
  const totalMinutes = Math.floor((target.getTime() - now.getTime()) / 60_000);
  if (totalMinutes <= 0) return { days: 0, hours: 0, minutes: 0, started: true };
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
    started: false,
  };
}

/** Yandex Maps is the default in Uzbekistan; falls back to a search by venue and address. */
export function mapLink(event: InvitationData["event"]): string {
  if (event.mapUrl) return event.mapUrl;
  const query = [event.venueName, event.address].filter(Boolean).join(", ");
  return `https://yandex.uz/maps/?text=${encodeURIComponent(query)}`;
}
