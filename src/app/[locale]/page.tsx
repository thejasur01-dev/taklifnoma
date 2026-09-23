import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { FactsStrip } from "@/components/home/facts-strip";
import { Faq } from "@/components/home/faq";
import { Features } from "@/components/home/features";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { Pricing } from "@/components/home/pricing";
import { Steps } from "@/components/home/steps";
import { type ShowcaseItem, TemplatesAndDemo } from "@/components/home/templates-and-demo";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";
import { CEREMONY_TYPES, type CeremonyType, PLAN_PRICES_UZS } from "@/lib/config";
import { CATALOG } from "@/templates/catalog";
import { calendarNames } from "@/templates/cover-content";

/** Ceremonies shown as catalog filters (others are reachable later in /templates). */
const FILTER_CEREMONIES = [
  "wedding",
  "nikoh",
  "fotiha",
  "qiz_bazm",
  "osh",
  "xatna",
] as const satisfies readonly CeremonyType[];

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [t, ceremony, names, info, demo, cal, templatePage, catalog] = await Promise.all([
    getTranslations("home"),
    getTranslations("ceremony"),
    getTranslations("templateNames"),
    getTranslations("templateInfo"),
    getTranslations("demo"),
    getTranslations("calendar"),
    getTranslations("templatePage"),
    getTranslations("catalog"),
  ]);
  // Creating always starts from choosing a template.
  const ctaHref = "/#templates";

  const categoryLabels = Object.fromEntries(CEREMONY_TYPES.map((c) => [c, ceremony(c)])) as Record<
    CeremonyType,
    string
  >;
  const items: ShowcaseItem[] = CATALOG.map((tpl) => {
    const common = {
      slug: tpl.slug,
      name: names(tpl.slug),
      tagline: info(`${tpl.slug}.tagline`),
      categories: [...tpl.categories],
      hasVideo: tpl.hasVideo,
    };
    return tpl.kind === "media"
      ? { ...common, kind: "media" as const, thumbnail: tpl.thumbnail }
      : { ...common, kind: "themed" as const, layout: tpl.layout };
  });

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero ctaHref={ctaHref} />
        <FactsStrip />
        <TemplatesAndDemo
          items={items}
          ceremonies={FILTER_CEREMONIES.map((id) => ({ id, label: categoryLabels[id] }))}
          categoryLabels={categoryLabels}
          cover={{
            greeting: demo("greeting"),
            invitation: demo("invitation"),
            venue: demo("venue"),
            firstName: demo("firstName"),
            secondName: demo("secondName"),
          }}
          labels={{
            templatesTitle: t("templates.title"),
            templatesSubtitle: t("templates.subtitle"),
            filterLabel: t("templates.filterLabel"),
            all: t("templates.all"),
            view: catalog("view"),
            order: catalog("order"),
            price: t("pricing.price", { price: PLAN_PRICES_UZS.standard }),
            empty: t("templates.empty"),
            demoTitle: t("demo.title"),
            demoSubtitle: t("demo.subtitle"),
            firstName: t("demo.firstName"),
            secondName: t("demo.secondName"),
            date: t("demo.date"),
            style: t("demo.style"),
            cta: t("demo.cta"),
            previewLabel: t("hero.previewLabel"),
            video: templatePage("video"),
          }}
          calendar={calendarNames(cal)}
        />
        <Features />
        <Steps />
        <Pricing ctaHref={ctaHref} />
        <Faq />
        <FinalCta ctaHref={ctaHref} />
      </main>
      <SiteFooter />
    </>
  );
}
