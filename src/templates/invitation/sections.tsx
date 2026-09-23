"use client";

import { MapPin, Navigation } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { type InvitationData, mapLink } from "../schema";
import { Countdown } from "../sections/countdown";
import { RsvpForm } from "../sections/rsvp-form";
import type { DateParts, InvitationMode } from "./types";

/*
 * Blocks shared by every template. Colors and fonts come from CSS variables
 * set by the template root: --g-paper, --g-card, --g-ink, --g-muted,
 * --g-gold (accent), --g-line, --g-font-body, --g-font-names.
 */

export function Ornament({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex items-center justify-center gap-3", className)}>
      <span className="h-px w-12 bg-current opacity-50" />
      <span className="size-1.5 rotate-45 bg-current" />
      <span className="h-px w-12 bg-current opacity-50" />
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-sans text-[11px] tracking-[0.3em] text-[var(--g-muted)] uppercase">{children}</p>;
}

export function Names({ data, className }: { data: InvitationData; className?: string }) {
  return (
    <p className={cn("[font-family:var(--g-font-names)] leading-[1.1]", className)}>
      {data.hosts.first}
      <span className="mx-3 text-[0.6em] text-[var(--g-gold)]">&amp;</span>
      {data.hosts.second}
    </p>
  );
}

type SectionsProps = {
  data: InvitationData;
  date: DateParts;
  mode: InvitationMode;
  slug?: string;
  /** Background artwork for the closing block; a solid accent panel otherwise. */
  closingImage?: string;
};

export function InvitationSections({ data, date, mode, slug, closingImage }: SectionsProps) {
  const t = useTranslations("invitation");

  return (
    <>
      <section className="px-8 py-20 text-center">
        <Reveal>
          <Ornament className="text-[var(--g-gold)]" />
          {data.message ? (
            <p className="mx-auto mt-8 max-w-[30ch] text-[1.35rem] leading-relaxed whitespace-pre-line">
              {data.message}
            </p>
          ) : null}
          {data.families ? (
            <>
              <p className="mt-10 font-sans text-[11px] tracking-[0.3em] text-[var(--g-muted)] uppercase">
                {t("sincerely")}
              </p>
              <p className="mt-2 text-2xl text-[var(--g-gold)] italic">{data.families}</p>
            </>
          ) : null}
        </Reveal>
      </section>

      <section className="border-y border-[var(--g-line)] bg-[var(--g-card)] px-6 py-20 text-center">
        <Reveal>
          <Eyebrow>{t("dateTitle")}</Eyebrow>
          <div className="mt-7 flex items-center justify-center gap-5">
            <span className="min-w-24 border-y border-[var(--g-line)] py-2 font-sans text-xs tracking-[0.25em] uppercase">
              {date.month}
            </span>
            <span className="text-7xl leading-none text-[var(--g-gold)]">{date.day}</span>
            <span className="min-w-24 border-y border-[var(--g-line)] py-2 font-sans text-xs tracking-[0.25em] uppercase">
              {date.year}
            </span>
          </div>
          <p className="mt-5 text-xl text-[var(--g-muted)] italic first-letter:uppercase">
            {date.weekday}, {date.time}
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-14">
          <Eyebrow>{t("countdownTitle")}</Eyebrow>
          <Countdown startsAt={data.event.startsAt} className="mx-auto mt-5 max-w-sm" />
        </Reveal>
      </section>

      <section className="px-8 py-20 text-center">
        <Reveal>
          <MapPin aria-hidden="true" className="mx-auto size-6 text-[var(--g-gold)]" strokeWidth={1.25} />
          <div className="mt-4">
            <Eyebrow>{t("venueTitle")}</Eyebrow>
          </div>
          <p className="mt-3 text-[2rem] leading-tight">{data.event.venueName}</p>
          {data.event.address ? (
            <p className="mt-2 text-lg text-[var(--g-muted)]">{data.event.address}</p>
          ) : null}
          <p className="mt-4 font-sans text-sm tracking-wide">{t("startsAt", { time: date.time })}</p>
          <a
            href={mapLink(data.event)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full border border-[var(--g-gold)] px-7 font-sans text-[15px] text-[var(--g-ink)] transition-colors hover:bg-[var(--g-gold)] hover:text-[var(--g-paper)]"
          >
            <Navigation aria-hidden="true" className="size-4" strokeWidth={1.5} />
            {t("openMap")}
          </a>
        </Reveal>
      </section>

      <section className="px-6 pb-20">
        <Reveal className="rounded-[1.75rem] border border-[var(--g-line)] bg-[var(--g-card)] px-6 py-10 shadow-[0_24px_60px_-40px_rgb(0_0_0/0.45)]">
          <div className="text-center">
            <Ornament className="text-[var(--g-gold)]" />
            <h2 className="mt-6 text-3xl">{t("rsvpTitle")}</h2>
            <p className="mt-2 text-lg text-[var(--g-muted)]">{t("rsvpText")}</p>
          </div>
          <div className="mt-8">
            <RsvpForm mode={mode} slug={slug} />
          </div>
        </Reveal>
      </section>

      <section
        className={cn(
          "relative overflow-hidden px-8 py-28 text-center",
          closingImage ? "text-white" : "bg-[var(--g-ink)] text-[var(--g-paper)]",
        )}
      >
        {closingImage ? (
          <>
            <Image
              src={closingImage}
              alt=""
              fill
              sizes="(max-width: 480px) 100vw, 480px"
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-[#1d1813]/60" />
          </>
        ) : null}
        <Reveal className="relative">
          <Ornament className={closingImage ? "text-[#f1dfbf]" : "text-[var(--g-gold)]"} />
          <p className="mt-8 text-3xl italic">{t("closing")}</p>
          <Names data={data} className="mt-5 text-[clamp(2.2rem,12.5cqw,3rem)]" />
          {data.families ? <p className="mt-6 text-lg italic opacity-80">{data.families}</p> : null}
        </Reveal>
      </section>
    </>
  );
}
