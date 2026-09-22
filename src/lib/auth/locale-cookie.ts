import "server-only";
import { hasLocale } from "next-intl";
import { cookies } from "next/headers";
import { type Locale, routing } from "@/i18n/routing";

/** Locale for non-localized routes (API, auth callbacks): next-intl cookie or default. */
export async function getLocaleFromCookie(): Promise<Locale> {
  const value = (await cookies()).get("NEXT_LOCALE")?.value;
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}
