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
 * Optional: --g-frame (countdown cell border), --g-tile-a/--g-tile-b (tile
 * frame colors), --g-closing / --g-closing-ink / --g-closing-names.
 */

export type OrnamentStyle = "diamond" | "islimi";

/** Visual options a template can pick for the shared sections. */
export type SectionsStyle = {
  ornament?: OrnamentStyle;
  /** "tile": venue card inside a glazed-tile (koshin) border. */
  venueFrame?: "plain" | "tile";
  /** Background artwork for the closing block; solid --g-closing color otherwise. */
  closingImage?: string;
  /** Shorter submit label ("Yuborish") for the RSVP form. */
  rsvpSubmit?: "long" | "short";
};

export function Ornament({ className, style = "diamond" }: { className?: string; style?: OrnamentStyle }) {
  if (style === "islimi") {
    // Arcade band (repeating pointed arches) with an eight-point star in the middle.
    const band =
      "h-2.5 w-20 bg-[radial-gradient(circle_at_50%_100%,transparent_4.5px,currentColor_4.5px,currentColor_5.5px,transparent_5.5px)] bg-[length:12px_10px] bg-repeat-x opacity-70";
    return (
      <span aria-hidden="true" className={cn("flex items-center justify-center gap-3", className)}>
        <span className={band} />
        <span className="relative size-3">
          <span className="absolute inset-0 rotate-45 bg-current" />
          <span className="absolute inset-0 bg-current" />
        </span>
        <span className={band} />
      </span>
    );
  }
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

/** Glazed-tile (koshin) border: a diamond lattice between gold lines around a paper card. */
function TileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[1.4rem] border border-[var(--g-gold)] bg-[var(--g-tile-a)] p-[3px] shadow-[0_24px_60px_-40px_rgb(0_0_0/0.5)]">
      <div className="rounded-[1.25rem] bg-[repeating-conic-gradient(from_45deg,var(--g-tile-a)_0_25%,var(--g-tile-b)_0_50%)] bg-[length:18px_18px] bg-center p-[11px]">
        <div className="rounded-[0.8rem] bg-[var(--g-gold)] p-px">
          <div className="rounded-[0.75rem] bg-[var(--g-card)] px-6 py-12">{children}</div>
        </div>
      </div>
    </div>
  );
}

type SectionsProps = {
  data: InvitationData;
  date: DateParts;
  mode: InvitationMode;
  slug?: string;
} & SectionsStyle;

export function InvitationSections({
  data,
  date,
  mode,
  slug,
  closingImage,
  ornament = "diamond",
  venueFrame = "plain",
  rsvpSubmit = "long",
}: SectionsProps) {
  const t = useTranslations("invitation");

  const venue = (
    <>
      <MapPin aria-hidden="true" className="mx-auto size-6 text-[var(--g-gold)]" strokeWidth={1.25} />
      <div className="mt-4">
        <Eyebrow>{t("venueTitle")}</Eyebrow>
      </div>
      <p className="mt-3 text-[2rem] leading-tight">{data.event.venueName}</p>
      {data.event.address ? <p className="mt-2 text-lg text-[var(--g-muted)]">{data.event.address}</p> : null}
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
    </>
  );

  return (
    <>
      <section className="px-8 py-20 text-center">
        <Reveal>
          <Ornament style={ornament} className="text-[var(--g-gold)]" />
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
          {ornament === "islimi" ? (
            <Ornament style={ornament} className="mt-10 text-[var(--g-gold)]" />
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

      <section className="px-6 py-20 text-center">
        <Reveal>{venueFrame === "tile" ? <TileFrame>{venue}</TileFrame> : venue}</Reveal>
      </section>

      <section className="px-6 pb-20">
        <Reveal className="rounded-[1.75rem] border border-[var(--g-line)] bg-[var(--g-card)] px-6 py-10 shadow-[0_24px_60px_-40px_rgb(0_0_0/0.45)]">
          <div className="text-center">
            <Ornament style={ornament} className="text-[var(--g-gold)]" />
            <h2 className="mt-6 text-3xl">{t("rsvpTitle")}</h2>
            <p className="mt-2 text-lg text-[var(--g-muted)]">{t("rsvpText")}</p>
          </div>
          <div className="mt-8">
            <RsvpForm mode={mode} slug={slug} submitLabel={rsvpSubmit} />
          </div>
        </Reveal>
      </section>

      <section
        className={cn(
          "relative overflow-hidden px-8 py-28 text-center",
          closingImage
            ? "text-white"
            : "bg-[var(--g-closing,var(--g-ink))] text-[var(--g-closing-ink,var(--g-paper))]",
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
          <Ornament style={ornament} className={closingImage ? "text-[#f1dfbf]" : "text-[var(--g-gold)]"} />
          <p className="mt-8 text-3xl italic">{t("closing")}</p>
          <Names
            data={data}
            className="mt-5 text-[clamp(2.2rem,12.5cqw,3rem)] text-[var(--g-closing-names,inherit)]"
          />
          {data.families ? <p className="mt-6 text-lg italic opacity-80">{data.families}</p> : null}
        </Reveal>
      </section>
    </>
  );
}
