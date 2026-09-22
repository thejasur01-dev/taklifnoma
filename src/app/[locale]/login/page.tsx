import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { TelegramLoginButton } from "@/components/auth/telegram-login-button";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/session";
import { publicEnv } from "@/lib/env";
import type { AuthErrorKey } from "./actions";
import { EmailLoginForm } from "./email-login-form";

const URL_ERRORS = ["telegram", "linkExpired", "notConfigured"] as const satisfies readonly AuthErrorKey[];
type UrlError = (typeof URL_ERRORS)[number];
const isUrlError = (value: unknown): value is UrlError => URL_ERRORS.includes(value as UrlError);

export async function generateMetadata({ params }: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("title"), robots: { index: false } };
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  if (await getCurrentUser()) redirect({ href: "/dashboard", locale });

  const { error } = await searchParams;
  const t = await getTranslations("auth");
  const botUsername = publicEnv.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl">{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {isUrlError(error) && (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {t(`errors.${error}`)}
              </p>
            )}

            <div className="space-y-2 text-center">
              {botUsername ? (
                <>
                  <p className="text-sm text-muted-foreground">{t("telegramHint")}</p>
                  <TelegramLoginButton
                    botUsername={botUsername}
                    authUrl={`${publicEnv.NEXT_PUBLIC_SITE_URL}/api/auth/telegram`}
                  />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t("telegramUnavailable")}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">{t("divider")}</span>
              <Separator className="flex-1" />
            </div>

            <EmailLoginForm />

            <p className="text-center text-xs text-muted-foreground">{t("terms")}</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
