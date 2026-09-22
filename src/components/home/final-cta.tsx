import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { buildCoverContent, calendarNames, DEMO_EVENT_DATE } from "@/templates/cover-content";
import { InvitationCover } from "@/templates/invitation-cover";
import { getTheme } from "@/templates/themes";

export async function FinalCta({ ctaHref }: { ctaHref: string }) {
  const t = await getTranslations("home.cta");
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
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
      <Reveal className="relative overflow-hidden rounded-3xl bg-accent px-6 py-16 text-center sm:px-12 lg:py-24">
        <div
          aria-hidden="true"
          className="absolute -bottom-[18%] -left-[3%] hidden w-[17%] rotate-[-10deg] overflow-hidden rounded-xl shadow-xl lg:block"
        >
          <InvitationCover theme={getTheme("zumrad-tun")} layout="arch" content={content} />
        </div>
        <div
          aria-hidden="true"
          className="absolute -top-[16%] -right-[2%] hidden w-[17%] rotate-[9deg] overflow-hidden rounded-xl shadow-xl lg:block"
        >
          <InvitationCover theme={getTheme("lola")} layout="minimal" content={content} />
        </div>
        <div className="relative mx-auto max-w-xl">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-balance text-accent-foreground sm:text-5xl sm:leading-[1.08]">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-accent-foreground/80">{t("subtitle")}</p>
          <Button asChild size="lg" className="mt-9">
            <Link href={ctaHref}>
              {nav("create")}
              <ArrowRight strokeWidth={1.75} />
            </Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
