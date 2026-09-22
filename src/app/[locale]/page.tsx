import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/session";

/** Placeholder landing page — the full marketing site is built in stage 6. */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <h1 className="font-heading text-4xl leading-tight font-semibold text-balance sm:text-5xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-lg text-pretty text-muted-foreground">{t("subtitle")}</p>
        <Button asChild size="lg" className="h-12 px-6 text-base">
          <Link href={user ? "/dashboard" : "/login"}>{user ? t("ctaDashboard") : t("ctaStart")}</Link>
        </Button>
      </main>
    </>
  );
}
