import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/session";
import { calendarNames, formatCoverDate } from "@/templates/cover-content";
import { GulliDarvozaInvitation } from "@/templates/gulli-darvoza/invitation";
import { DEMO_STARTS_AT, isMediaTemplate, MEDIA_TEMPLATES } from "@/templates/registry";
import { type InvitationData, invitationDataSchema } from "@/templates/schema";

export function generateStaticParams() {
  return MEDIA_TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/templates/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !isMediaTemplate(slug)) return {};
  const names = await getTranslations({ locale, namespace: "templateNames" });
  const meta = await getTranslations({ locale, namespace: "metadata" });
  const template = MEDIA_TEMPLATES.find((t) => t.slug === slug);
  return {
    title: names(slug),
    description: meta("description"),
    openGraph: template ? { images: [{ url: template.thumbnail }] } : undefined,
  };
}

export default async function TemplatePreviewPage({ params }: PageProps<"/[locale]/templates/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !isMediaTemplate(slug)) notFound();
  setRequestLocale(locale);

  const [demo, cal, page, user] = await Promise.all([
    getTranslations("demoInvitation"),
    getTranslations("calendar"),
    getTranslations("templatePage"),
    getCurrentUser(),
  ]);

  const data: InvitationData = invitationDataSchema.parse({
    hosts: { first: demo("first"), second: demo("second") },
    message: demo("message"),
    families: demo("families"),
    event: { startsAt: DEMO_STARTS_AT, venueName: demo("venueName"), address: demo("address") },
  });
  const { weekday, day, month, year, time } = formatCoverDate(
    new Date(data.event.startsAt),
    calendarNames(cal),
  );

  return (
    <div className="relative min-h-[100dvh] bg-[#16120e]">
      {/* Desktop backdrop: the same artwork, blurred */}
      <div aria-hidden="true" className="fixed inset-0 hidden sm:block">
        <Image
          src="/templates/gulli-darvoza/gate-thumb.webp"
          alt=""
          fill
          sizes="100vw"
          className="scale-110 object-cover blur-2xl"
        />
        <div className="absolute inset-0 bg-[#16120e]/55" />
      </div>

      {/* Top bar kept clear of the invitation's own controls (bottom of the screen). */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 p-3 sm:p-4">
        <Link
          href="/#templates"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-black/35 px-4 text-sm text-white backdrop-blur-md transition-colors hover:bg-black/50"
        >
          <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.75} />
          {page("back")}
        </Link>
        <Button asChild size="sm" className="h-10 shadow-[0_12px_40px_-10px_rgb(0_0_0/0.6)]">
          <Link href={user ? "/dashboard" : "/login"}>{page("use")}</Link>
        </Button>
      </div>

      <main className="relative mx-auto w-full max-w-[480px] md:my-8 md:overflow-hidden md:rounded-[2rem] md:shadow-[0_40px_120px_-30px_rgb(0_0_0/0.7)]">
        <GulliDarvozaInvitation data={data} date={{ weekday, day, month, year, time }} mode="demo" />
      </main>
    </div>
  );
}
