import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ErrorView } from "@/components/error-view";
import { routing } from "@/i18n/routing";
import { fontVariables } from "./fonts";
import "./globals.css";

/** Fallback for requests outside the [locale] segment (e.g. /i/unknown before stage 2). */
export default async function GlobalNotFound() {
  const locale = routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "errors" });
  return (
    <html lang={locale} className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ErrorView code="404" title={t("notFoundTitle")} text={t("notFoundText")}>
          <Link href="/" className="underline underline-offset-4">
            {t("backHome")}
          </Link>
        </ErrorView>
      </body>
    </html>
  );
}
