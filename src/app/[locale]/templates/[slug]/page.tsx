import { Check, ChevronRight, Maximize2 } from "lucide-react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PhonePreview } from "@/components/phone-preview";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { PLAN_PRICES_UZS } from "@/lib/config";
import { CATALOG, getCatalogTemplate } from "@/templates/catalog";
import { demoInvitationData } from "@/templates/demo-data";
import { invitationDateParts } from "@/templates/invitation/date";
import { InvitationRenderer } from "@/templates/invitation/render";

const INCLUDES = ["i1", "i2", "i3", "i4", "i5"] as const;

export function generateStaticParams() {
  return CATALOG.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/templates/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const template = getCatalogTemplate(slug);
  if (!hasLocale(routing.locales, locale) || !template) return {};
  const [names, info] = await Promise.all([
    getTranslations({ locale, namespace: "templateNames" }),
    getTranslations({ locale, namespace: "templateInfo" }),
  ]);
  return {
    title: names(template.slug),
    description: info(`${template.slug}.tagline`),
    openGraph: template.kind === "media" ? { images: [{ url: template.thumbnail }] } : undefined,
  };
}

export default async function TemplatePage({ params }: PageProps<"/[locale]/templates/[slug]">) {
  const { locale, slug } = await params;
  const template = getCatalogTemplate(slug);
  if (!hasLocale(routing.locales, locale) || !template) notFound();
  setRequestLocale(locale);

  const [page, catalog, names, info, pricing, ceremony, data] = await Promise.all([
    getTranslations("templatePage"),
    getTranslations("catalog"),
    getTranslations("templateNames"),
    getTranslations("templateInfo"),
    getTranslations("home.pricing"),
    getTranslations("ceremony"),
    demoInvitationData(),
  ]);
  const date = await invitationDateParts(data.event.startsAt);
  const name = names(template.slug);
  const related = CATALOG.filter((t) => t.slug !== template.slug).slice(0, 4);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-8 pb-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:pt-12">
          <div className="lg:py-6">
            <nav
              aria-label="breadcrumb"
              className="text-xs tracking-[0.14em] text-muted-foreground uppercase"
            >
              <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                  <Link href="/" className="hover:text-foreground">
                    {page("home")}
                  </Link>
                </li>
                <ChevronRight aria-hidden="true" className="size-3" />
                <li>
                  <Link href="/#templates" className="hover:text-foreground">
                    {page("back")}
                  </Link>
                </li>
                <ChevronRight aria-hidden="true" className="size-3" />
                <li aria-current="page" className="text-foreground">
                  {name}
                </li>
              </ol>
            </nav>

            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">{name}</h1>
            <p className="mt-4 text-xl text-pretty text-primary">{info(`${template.slug}.tagline`)}</p>
            <p className="mt-5 max-w-[60ch] leading-relaxed text-pretty text-muted-foreground">
              {info(`${template.slug}.description`)}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {template.categories.map((c) => ceremony(c)).join(", ")}
            </p>

            <div className="mt-8 border-t pt-8">
              <p className="text-4xl font-semibold tracking-[-0.03em] tabular-nums">
                {pricing("price", { price: PLAN_PRICES_UZS.standard })}
              </p>
            </div>

            <div className="mt-8 rounded-2xl border bg-card p-6">
              <h2 className="font-medium">{page("includesTitle")}</h2>
              <ul className="mt-4 space-y-3">
                {INCLUDES.map((key) => (
                  <li key={key} className="flex gap-3 text-sm">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      strokeWidth={2}
                    />
                    {page(key)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={`/create/${template.slug}`}>{page("order")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={`/templates/${template.slug}/full`}>
                  <Maximize2 aria-hidden="true" strokeWidth={1.75} />
                  {page("fullscreen")}
                </Link>
              </Button>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[360px] lg:sticky lg:top-24 lg:self-start">
            <PhonePreview label={name} screenHeight={660}>
              <InvitationRenderer templateSlug={template.slug} data={data} date={date} mode="demo" embedded />
            </PhonePreview>
            <p className="mt-4 text-center text-sm text-muted-foreground">{page("previewHint")}</p>
          </div>
        </div>

        <section className="border-t bg-card/60">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold tracking-tight">{page("back")}</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/templates/${t.slug}`}
                    className="flex h-full flex-col rounded-2xl border bg-card p-5 transition-shadow hover:shadow-[0_20px_40px_-30px_rgb(18_20_26/0.4)]"
                  >
                    <span className="font-semibold">{names(t.slug)}</span>
                    <span className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {info(`${t.slug}.tagline`)}
                    </span>
                    <span className="mt-4 text-sm text-primary">{catalog("view")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
