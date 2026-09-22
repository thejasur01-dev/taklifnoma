import { CalendarPlus, MapPin, Music2, PenLine, Send } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

function Tile({
  className,
  children,
  delay = 0,
}: {
  className?: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={cn("flex flex-col rounded-2xl p-7 sm:p-8", className)}>
      {children}
    </Reveal>
  );
}

function TileText({
  title,
  text,
  muted = "text-muted-foreground",
}: {
  title: string;
  text: string;
  muted?: string;
}) {
  return (
    <>
      <h3 className="text-xl font-semibold tracking-tight text-balance">{title}</h3>
      <p className={cn("mt-2 max-w-[42ch] leading-relaxed text-pretty", muted)}>{text}</p>
    </>
  );
}

/** Illustrative figures for the RSVP tile, labelled as a sample in the UI. */
const SAMPLE_RSVP = { yes: 124, no: 18, pending: 31 };

export async function Features() {
  const t = await getTranslations("home.features");
  const rows = [
    { key: "yes", value: SAMPLE_RSVP.yes, color: "bg-primary" },
    { key: "no", value: SAMPLE_RSVP.no, color: "bg-foreground/35" },
    { key: "pending", value: SAMPLE_RSVP.pending, color: "bg-foreground/12" },
  ] as const;

  return (
    <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal>
        <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-[2.6rem] sm:leading-[1.1]">
          {t("title")}
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto]">
        <Tile className="bg-accent text-accent-foreground md:col-span-2 lg:col-span-2">
          <TileText title={t("guests.title")} text={t("guests.text")} muted="text-accent-foreground/80" />
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-card px-4 py-2 text-[13px] font-medium text-foreground tabular-nums shadow-sm">
              /i/aziz-madina/k7m2p9q
            </span>
            <span className="rounded-full bg-card px-4 py-2 text-[13px] font-medium text-foreground tabular-nums shadow-sm">
              /i/aziz-madina/r4hx8dn
            </span>
          </div>
        </Tile>

        <Tile delay={0.06} className="border bg-card lg:row-span-2">
          <TileText title={t("rsvp.title")} text={t("rsvp.text")} />
          <div className="mt-auto pt-10">
            <p className="text-xs text-muted-foreground">{t("rsvp.sample")}</p>
            <div className="mt-3 flex h-2.5 gap-1 overflow-hidden rounded-full" aria-hidden="true">
              {rows.map((r) => (
                <span key={r.key} className={r.color} style={{ flexGrow: r.value }} />
              ))}
            </div>
            <dl className="mt-6 space-y-4">
              {rows.map((r) => (
                <div key={r.key} className="flex items-baseline justify-between gap-4">
                  <dt className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <span aria-hidden="true" className={cn("size-2 rounded-full", r.color)} />
                    {t(`rsvp.${r.key}`)}
                  </dt>
                  <dd className="text-2xl font-semibold tracking-tight tabular-nums">{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Tile>

        <Tile delay={0.04} className="bg-primary text-primary-foreground">
          <Send aria-hidden="true" className="mb-8 size-6" strokeWidth={1.5} />
          <TileText
            title={t("telegram.title")}
            text={t("telegram.text")}
            muted="text-primary-foreground/80"
          />
        </Tile>

        <Tile delay={0.08} className="border bg-card">
          <div className="mb-8 flex gap-2">
            <MapPin aria-hidden="true" className="size-6 text-primary" strokeWidth={1.5} />
            <CalendarPlus aria-hidden="true" className="size-6 text-primary" strokeWidth={1.5} />
          </div>
          <TileText title={t("map.title")} text={t("map.text")} />
        </Tile>

        <Tile delay={0.04} className="bg-secondary">
          <Music2 aria-hidden="true" className="mb-8 size-6 text-primary" strokeWidth={1.5} />
          <TileText title={t("music.title")} text={t("music.text")} />
        </Tile>

        <Tile delay={0.08} className="border bg-card md:col-span-1 lg:col-span-2">
          <PenLine aria-hidden="true" className="mb-8 size-6 text-primary" strokeWidth={1.5} />
          <TileText title={t("edit.title")} text={t("edit.text")} />
        </Tile>
      </div>
    </section>
  );
}
