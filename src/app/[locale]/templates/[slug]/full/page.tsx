import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { CATALOG, getCatalogTemplate } from "@/templates/catalog";
import { demoInvitationData } from "@/templates/demo-data";
import { invitationDateParts } from "@/templates/invitation/date";
import { InvitationRenderer } from "@/templates/invitation/render";
import { getTheme } from "@/templates/themes";

export function generateStaticParams() {
  return CATALOG.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/templates/[slug]/full">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !getCatalogTemplate(slug)) return {};
  const names = await getTranslations({ locale, namespace: "templateNames" });
  const template = getCatalogTemplate(slug);
  return template ? { title: names(template.slug), robots: { index: false } } : {};
}

/** Full-screen demo of a template, as a guest would see it on the phone. */
export default async function TemplateFullPage({ params }: PageProps<"/[locale]/templates/[slug]/full">) {
  const { locale, slug } = await params;
  const template = getCatalogTemplate(slug);
  if (!hasLocale(routing.locales, locale) || !template) notFound();
  setRequestLocale(locale);

  const [page, catalog, data] = await Promise.all([
    getTranslations("templatePage"),
    getTranslations("catalog"),
    demoInvitationData(),
  ]);
  const date = await invitationDateParts(data.event.startsAt);
  const backdrop = template.kind === "media" ? template.thumbnail : null;
  const paper = template.kind === "themed" ? getTheme(template.slug).palette.paperEdge : "#16120e";

  return (
    <div className="relative min-h-[100dvh]" style={{ background: backdrop ? "#16120e" : paper }}>
      {backdrop ? (
        <div aria-hidden="true" className="fixed inset-0 hidden sm:block">
          <Image src={backdrop} alt="" fill sizes="100vw" className="scale-110 object-cover blur-2xl" />
          <div className="absolute inset-0 bg-[#16120e]/55" />
        </div>
      ) : null}

      {/* Top bar kept clear of the invitation's own controls (bottom of the screen). */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 p-3 sm:p-4">
        <Link
          href={`/templates/${slug}`}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-black/35 px-4 text-sm text-white backdrop-blur-md transition-colors hover:bg-black/50"
        >
          <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.75} />
          {page("back")}
        </Link>
        <Button asChild size="sm" className="h-10 shadow-[0_12px_40px_-10px_rgb(0_0_0/0.6)]">
          <Link href={`/create/${slug}`}>{catalog("order")}</Link>
        </Button>
      </div>

      <main className="relative mx-auto w-full max-w-[480px] sm:my-8 sm:overflow-hidden sm:rounded-[2rem] sm:shadow-[0_40px_120px_-30px_rgb(0_0_0/0.55)]">
        <InvitationRenderer templateSlug={slug} data={data} date={date} mode="demo" />
      </main>
    </div>
  );
}
