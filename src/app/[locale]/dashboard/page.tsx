import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { routing } from "@/i18n/routing";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps<"/[locale]/dashboard">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("title"), robots: { index: false } };
}

export default async function DashboardPage({ params }: PageProps<"/[locale]/dashboard">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const user = await requireUser(locale);
  const t = await getTranslations("dashboard");

  const supabase = await createClient();
  const { data: invitations } = supabase
    ? await supabase
        .from("invitations")
        .select("id, slug, status, main_event_date")
        .order("created_at", { ascending: false })
    : { data: [] };

  const name = user.profile?.full_name;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-8">
        <h1 className="font-heading text-3xl font-semibold">
          {name ? t("greeting", { name }) : t("greetingAnonymous")}
        </h1>

        <section aria-labelledby="invitations-heading" className="space-y-4">
          <h2 id="invitations-heading" className="text-xl font-medium">
            {t("invitationsTitle")}
          </h2>

          {invitations && invitations.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {invitations.map((inv) => (
                <li key={inv.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between gap-2">
                        <span className="truncate">/i/{inv.slug}</span>
                        <Badge variant="secondary">{t(`status.${inv.status}`)}</Badge>
                      </CardTitle>
                      {inv.main_event_date && <CardDescription>{inv.main_event_date}</CardDescription>}
                    </CardHeader>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <Card className="border-dashed">
              <CardContent className="space-y-2 py-10 text-center">
                <p className="text-lg font-medium">{t("emptyTitle")}</p>
                <p className="text-muted-foreground">{t("emptyText")}</p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </>
  );
}
