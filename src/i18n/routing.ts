import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Uzbek (Latin) is the primary language; its URLs carry no prefix.
  locales: ["uz", "ru", "en"],
  defaultLocale: "uz",
  localePrefix: "as-needed",
  // Many Uzbek users have ru/en browsers; the primary audience must land on
  // Uzbek. Language is chosen explicitly via the switcher.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
