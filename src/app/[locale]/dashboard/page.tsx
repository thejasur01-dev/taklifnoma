import { ExternalLink, PenLine, Plus } from "lucide-react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getCatalogTemplate } from "@/templates/catalog";
import { calendarNames, formatCoverDate } from "@/templates/cover-content";
import { InvitationCover } from "@/templates/invitation-cover";
import { invitationDataSchema } from "@/templates/schema";
import { getTheme } from "@/templates/themes";

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
  const [t, list, names, invitationT, cal] = await Promise.all([
    getTranslations("dashboard"),
    getTranslations("dashboardList"),
    getTranslations("templateNames"),
    getTranslations("invitation"),
    getTranslations("calendar"),
  ]);
  const calendar = calendarNames(cal);

  const supabase = await createClient();
  const { data: rows } = supabase
    ? await supabase
        .from("invitations")
        .select("id, slug, status, data, templates(slug)")
        .order("created_at", { ascending: false })
    : { data: [] };

  const invitations = (rows ?? []).flatMap((row) => {
    const template = getCatalogTemplate(row.templates?.slug ?? "");
    const parsed = invitationDataSchema.safeParse(row.data);
    if (!template || !parsed.success) return [];
    const date = formatCoverDate(new Date(parsed.data.event.startsAt), calendar);
    return [{ ...row, template, data: parsed.data, date }];
  });

  const name = user.profile?.full_name;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em]">
              {name ? t("greeting", { name }) : t("greetingAnonymous")}
            </h1>
            <p className="mt-2 text-muted-foreground">{t("invitationsTitle")}</p>
          </div>
          <Button asChild>
            <Link href="/#templates">
              <Plus aria-hidden="true" strokeWidth={1.75} />
              {list("newInvitation")}
            </Link>
          </Button>
        </div>

        {invitations.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed px-6 py-20 text-center">
            <p className="text-xl font-semibold">{t("emptyTitle")}</p>
            <p className="mt-2 max-w-sm text-muted-foreground">{t("emptyText")}</p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/#templates">{list("chooseTemplate")}</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {invitations.map((inv) => (
              <li key={inv.id} className="flex flex-col overflow-hidden rounded-2xl border bg-card">
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {inv.template.kind === "media" ? (
                    <Image
                      src={inv.template.thumbnail}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-x-[30%] top-[8%]">
                      <InvitationCover
                        theme={getTheme(inv.template.slug)}
                        layout={inv.template.layout}
                        content={{
                          greeting: invitationT("greeting"),
                          firstName: inv.data.hosts.first,
                          secondName: inv.data.hosts.second,
                          invitation: invitationT("coverLine"),
                          weekday: inv.date.weekday,
                          day: inv.date.day,
                          monthYear: inv.date.monthYear,
                          time: inv.date.time,
                          venue: inv.data.event.venueName,
                        }}
                        className="rounded-md shadow-lg"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold">
                        {inv.data.hosts.first} &amp; {inv.data.hosts.second}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {names(inv.template.slug)} ·{" "}
                        {list("date", { date: `${inv.date.day} ${inv.date.monthYear}` })}
                      </p>
                    </div>
                    <Badge variant={inv.status === "active" ? "default" : "secondary"}>
                      {t(`status.${inv.status}`)}
                    </Badge>
                  </div>
                  <p className="mt-3 truncate text-sm text-muted-foreground">/i/{inv.slug}</p>
                  <div className="mt-5 grid grid-cols-2 gap-2 border-t pt-4">
                    <Button
                      asChild
                      variant={inv.status === "active" ? "outline" : "default"}
                      size="sm"
                      className="h-10"
                    >
                      <Link href={`/dashboard/${inv.id}`}>
                        <PenLine aria-hidden="true" strokeWidth={1.75} />
                        {list("edit")}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="h-10">
                      <a href={`/i/${inv.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink aria-hidden="true" strokeWidth={1.75} />
                        {list("open")}
                      </a>
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
