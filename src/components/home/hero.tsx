import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveal";
import { PhoneFrame } from "@/components/phone-frame";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { buildCoverContent, calendarNames, DEMO_EVENT_DATE } from "@/templates/cover-content";
import { InvitationCover } from "@/templates/invitation-cover";
import { getTheme } from "@/templates/themes";

export async function Hero({ ctaHref }: { ctaHref: string }) {
  const t = await getTranslations("home.hero");
  const nav = await getTranslations("nav");
  const demo = await getTranslations("demo");
  const calendar = calendarNames(await getTranslations("calendar"));

  const content = buildCoverContent(
    { greeting: demo("greeting"), invitation: demo("invitation"), venue: demo("venue") },
    { first: demo("firstName"), second: demo("secondName") },
    DEMO_EVENT_DATE,
    calendar,
  );

  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-10 pb-16 sm:px-6 md:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8 lg:pt-20 lg:pb-24">
      <Reveal immediate className="max-w-xl">
        <h1 className="pb-1 text-[2.6rem] leading-[1.06] font-semibold tracking-[-0.035em] text-balance sm:text-5xl lg:text-[4rem]">
          {t.rich("title", {
            em: (chunks) => <em className="font-medium text-primary italic">{chunks}</em>,
          })}
        </h1>
        <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-pretty text-muted-foreground">
          {t("subtitle")}
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href={ctaHref}>
              {nav("create")}
              <ArrowRight
                className="transition-transform group-hover/button:translate-x-0.5"
                strokeWidth={1.75}
              />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/#templates">{t("secondary")}</Link>
          </Button>
        </div>
      </Reveal>

      <Reveal immediate delay={0.12} y={28} className="relative mx-auto w-full max-w-[520px]">
        {/* Tinted stage behind the device */}
        <div
          aria-hidden="true"
          className="absolute inset-x-[4%] top-[8%] bottom-[2%] rounded-[2.5rem] bg-accent [background-image:radial-gradient(90%_70%_at_70%_20%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent)]"
        />
        {/* Second design peeking behind, shows the catalog has range */}
        <div
          aria-hidden="true"
          className="absolute top-[16%] left-[2%] hidden w-[36%] -rotate-[8deg] overflow-hidden rounded-2xl shadow-[0_24px_50px_-24px_rgb(18_20_26/0.4)] sm:block"
        >
          <InvitationCover theme={getTheme("anor")} layout="frame" content={content} />
        </div>
        <div className="relative mx-auto w-[64%] max-w-[300px] py-6 sm:w-[54%]">
          <PhoneFrame label={t("previewLabel")}>
            <InvitationCover theme={getTheme("lojuvard")} layout="arch" content={content} />
          </PhoneFrame>
        </div>
      </Reveal>
    </section>
  );
}
