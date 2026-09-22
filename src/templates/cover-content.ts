import type { InvitationCoverContent } from "./invitation-cover";

/**
 * Uzbekistan has no DST, so Tashkent is always UTC+5. Formatting is done by
 * hand with translated month/weekday names instead of Intl: many browsers ship
 * without Uzbek locale data, which would render English names on the client
 * (and break hydration).
 */
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

export type CalendarNames = {
  /** Sunday first, as returned by Date#getUTCDay. */
  weekdays: readonly string[];
  /** January first. */
  months: readonly string[];
};

export const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export const MONTH_KEYS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
] as const;

type CalendarKey = `weekday.${(typeof WEEKDAY_KEYS)[number]}` | `month.${(typeof MONTH_KEYS)[number]}`;

export function calendarNames(t: (key: CalendarKey) => string): CalendarNames {
  return {
    weekdays: WEEKDAY_KEYS.map((k) => t(`weekday.${k}`)),
    months: MONTH_KEYS.map((k) => t(`month.${k}`)),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function formatCoverDate(date: Date, names: CalendarNames) {
  const local = new Date(date.getTime() + TASHKENT_OFFSET_MS);
  return {
    weekday: names.weekdays[local.getUTCDay()] ?? "",
    day: String(local.getUTCDate()),
    monthYear: `${names.months[local.getUTCMonth()] ?? ""} ${local.getUTCFullYear()}`,
    time: `${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`,
  };
}

type Texts = Pick<InvitationCoverContent, "greeting" | "invitation" | "venue">;

export function buildCoverContent(
  texts: Texts,
  names: { first: string; second: string },
  date: Date,
  calendar: CalendarNames,
): InvitationCoverContent {
  return { ...texts, firstName: names.first, secondName: names.second, ...formatCoverDate(date, calendar) };
}

/** Sample event date used by marketing previews. */
export const DEMO_EVENT_DATE = new Date("2026-10-17T17:00:00+05:00");
