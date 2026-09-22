import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link, redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/session";
import { isDevCodeMode } from "@/lib/auth/telegram-gateway";
import { buildCoverContent, calendarNames, DEMO_EVENT_DATE } from "@/templates/cover-content";
import { InvitationCover } from "@/templates/invitation-cover";
import { getTheme } from "@/templates/themes";
import { PhoneLoginForm } from "./phone-login-form";

export async function generateMetadata({ params }: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("title"), robots: { index: false } };
}

export default async function LoginPage({ params }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  if (await getCurrentUser()) redirect({ href: "/dashboard", locale });

  const [t, nav, demo, cal] = await Promise.all([
    getTranslations("auth"),
    getTranslations("nav"),
    getTranslations("demo"),
    getTranslations("calendar"),
  ]);
  const content = buildCoverContent(
    { greeting: demo("greeting"), invitation: demo("invitation"), venue: demo("venue") },
    { first: demo("firstName"), second: demo("secondName") },
    DEMO_EVENT_DATE,
    calendarNames(cal),
  );

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label={nav("home")} className="rounded-md">
            <BrandMark />
          </Link>
          <LocaleSwitcher />
        </div>

        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">{t("title")}</h1>
          <p className="mt-3 text-pretty text-muted-foreground">{t("subtitle")}</p>
          <div className="mt-10">
            <PhoneLoginForm devMode={isDevCodeMode()} />
          </div>
          <p className="mt-10 text-xs leading-relaxed text-muted-foreground">{t("terms")}</p>
        </main>
      </div>

      <aside className="relative hidden overflow-hidden bg-accent lg:flex lg:flex-col lg:items-center lg:justify-center lg:px-12">
        <div className="w-[44%] max-w-[300px] -rotate-[4deg] overflow-hidden rounded-2xl shadow-[0_40px_80px_-30px_rgb(18_20_26/0.45)]">
          <InvitationCover theme={getTheme("zumrad-tun")} layout="arch" content={content} />
        </div>
        <div className="mt-14 max-w-sm text-center text-accent-foreground">
          <p className="text-2xl font-semibold tracking-tight text-balance">{t("asideTitle")}</p>
          <p className="mt-3 text-accent-foreground/80">{t("asideText")}</p>
        </div>
      </aside>
    </div>
  );
}
