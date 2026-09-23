import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { calendarNames, formatCoverDate } from "../cover-content";
import type { DateParts } from "./types";

/** Server helper: date parts for an invitation, in the given (or current request) language. */
export async function invitationDateParts(startsAt: string, locale?: Locale): Promise<DateParts> {
  const cal = locale
    ? await getTranslations({ locale, namespace: "calendar" })
    : await getTranslations("calendar");
  const { weekday, day, month, year, time } = formatCoverDate(new Date(startsAt), calendarNames(cal));
  return { weekday, day, month, year, time };
}
