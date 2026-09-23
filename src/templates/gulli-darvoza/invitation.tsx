"use client";

import { MapPin, Navigation, Volume2, VolumeX } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { type InvitationData, mapLink } from "../schema";
import { Countdown } from "../sections/countdown";
import { RsvpForm } from "../sections/rsvp-form";

const ASSETS = {
  gate: "/templates/gulli-darvoza/gate.webp",
  couple: "/templates/gulli-darvoza/couple.webp",
  video: "/templates/gulli-darvoza/intro.mp4",
};

/** Warm ivory and champagne gold, sampled from the gate artwork. */
const THEME = {
  "--g-paper": "#fbf7f0",
  "--g-card": "#fffdf9",
  "--g-ink": "#3a2e26",
  "--g-muted": "#86735f",
  "--g-gold": "#a9824a",
  "--g-line": "#e7d9c4",
} as CSSProperties;

type Stage = "intro" | "playing" | "open";

export type DateParts = { weekday: string; day: string; month: string; year: string; time: string };

type Props = {
  data: InvitationData;
  date: DateParts;
  mode: "demo" | "live";
};

const EASE = [0.16, 1, 0.3, 1] as const;

function Ornament({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex items-center justify-center gap-3", className)}>
      <span className="h-px w-12 bg-current opacity-50" />
      <span className="size-1.5 rotate-45 bg-current" />
      <span className="h-px w-12 bg-current opacity-50" />
    </span>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-sans text-[11px] tracking-[0.3em] text-[var(--g-muted)] uppercase">{children}</p>;
}

function Names({ data, className }: { data: InvitationData; className?: string }) {
  return (
    <p className={cn("[font-family:var(--font-inv-script)] leading-[1.1]", className)}>
      {data.hosts.first}
      <span className="mx-3 text-[0.6em] text-[var(--g-gold)]">&amp;</span>
      {data.hosts.second}
    </p>
  );
}

export function GulliDarvozaInvitation({ data, date, mode }: Props) {
  const t = useTranslations("invitation");
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stage, setStage] = useState<Stage>("intro");
  const [muted, setMuted] = useState(false);

  // Fetch the intro video once the page is idle, so the gate opens instantly on tap
  // while the first paint stays light (poster image only).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const warm = () => {
      video.preload = "auto";
      video.load();
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(warm, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = globalThis.setTimeout(warm, 1500);
    return () => globalThis.clearTimeout(id);
  }, []);

  async function openGate() {
    const video = videoRef.current;
    if (reduce || !video) {
      setStage("open");
      return;
    }
    setStage("playing");
    video.muted = false;
    try {
      await video.play();
    } catch {
      // Some browsers refuse audible playback; fall back to muted.
      video.muted = true;
      setMuted(true);
      try {
        await video.play();
      } catch {
        setStage("open");
      }
    }
  }

  function finish() {
    videoRef.current?.pause();
    setStage("open");
  }

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  const heroItem = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1.1, delay, ease: EASE },
        };

  return (
    <div
      style={THEME}
      className="bg-[var(--g-paper)] [font-family:var(--font-inv-garamond)] text-[var(--g-ink)]"
    >
      {/* Gate → video → couple scene */}
      <section className="relative h-[100dvh] min-h-[560px] overflow-hidden bg-[#1d1813]">
        <Image
          src={ASSETS.couple}
          alt=""
          fill
          sizes="(max-width: 480px) 100vw, 480px"
          className={cn(
            "object-cover transition-opacity duration-700",
            stage === "open" ? "opacity-100" : "opacity-0",
          )}
        />
        <Image
          src={ASSETS.gate}
          alt=""
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className={cn(
            "object-cover transition-opacity duration-500",
            stage === "intro" ? "opacity-100" : "opacity-0",
          )}
        />
        <video
          ref={videoRef}
          src={ASSETS.video}
          poster={ASSETS.gate}
          playsInline
          preload="none"
          aria-hidden="true"
          onEnded={() => setStage("open")}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-500",
            stage === "playing" ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />

        {stage === "intro" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/60 via-black/5 to-transparent px-8 pb-[max(3.5rem,env(safe-area-inset-bottom))] text-white">
            <Names data={data} className="text-5xl drop-shadow-[0_2px_12px_rgb(0_0_0/0.35)]" />
            <button
              type="button"
              onClick={openGate}
              className="relative mt-8 inline-flex h-13 items-center rounded-full border border-white/45 bg-white/15 px-8 font-sans text-[15px] font-medium tracking-wide backdrop-blur-md transition-colors hover:bg-white/25 active:scale-[0.98]"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 animate-[ping_2.4s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full border border-white/40 motion-reduce:hidden"
              />
              {t("open")}
            </button>
          </div>
        ) : null}

        {stage === "playing" ? (
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] font-sans text-sm text-white">
            <button
              type="button"
              onClick={toggleSound}
              aria-label={muted ? t("soundOn") : t("soundOff")}
              className="grid size-11 place-items-center rounded-full bg-black/25 backdrop-blur-md"
            >
              {muted ? (
                <VolumeX className="size-5" strokeWidth={1.5} />
              ) : (
                <Volume2 className="size-5" strokeWidth={1.5} />
              )}
            </button>
            <button
              type="button"
              onClick={finish}
              className="h-11 rounded-full bg-black/25 px-5 backdrop-blur-md"
            >
              {t("skip")}
            </button>
          </div>
        ) : null}

        {stage === "open" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/70 via-black/15 to-transparent px-8 pb-16 text-center text-white">
            {data.showBismillah ? (
              <motion.p {...heroItem(0.1)} className="text-lg tracking-wide text-[#f1dfbf] italic">
                {t("bismillah")}
              </motion.p>
            ) : null}
            <motion.div {...heroItem(0.5)}>
              <Names data={data} className="mt-4 text-[3.4rem] drop-shadow-[0_2px_16px_rgb(0_0_0/0.4)]" />
            </motion.div>
            <motion.p {...heroItem(0.95)} className="mt-5 font-sans text-sm tracking-[0.35em] uppercase">
              {date.day} · {date.month} · {date.year}
            </motion.p>
          </div>
        ) : null}
      </section>

      {stage === "open" ? (
        <>
          {/* Invitation text */}
          <section className="px-8 py-20 text-center">
            <Reveal>
              <Ornament className="text-[var(--g-gold)]" />
              <p className="mx-auto mt-8 max-w-[30ch] text-[1.35rem] leading-relaxed">{data.message}</p>
              <p className="mt-10 font-sans text-[11px] tracking-[0.3em] text-[var(--g-muted)] uppercase">
                {t("sincerely")}
              </p>
              <p className="mt-2 text-2xl text-[var(--g-gold)] italic">{data.families}</p>
            </Reveal>
          </section>

          {/* Date and countdown */}
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

          {/* Venue */}
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

          {/* RSVP */}
          <section className="px-6 pb-20">
            <Reveal className="rounded-[1.75rem] border border-[var(--g-line)] bg-[var(--g-card)] px-6 py-10 shadow-[0_24px_60px_-40px_rgb(58_46_38/0.45)]">
              <div className="text-center">
                <Ornament className="text-[var(--g-gold)]" />
                <h2 className="mt-6 text-3xl">{t("rsvpTitle")}</h2>
                <p className="mt-2 text-lg text-[var(--g-muted)]">{t("rsvpText")}</p>
              </div>
              <div className="mt-8">
                <RsvpForm mode={mode} />
              </div>
            </Reveal>
          </section>

          {/* Closing */}
          <section className="relative overflow-hidden px-8 py-28 text-center text-white">
            <Image
              src={ASSETS.gate}
              alt=""
              fill
              sizes="(max-width: 480px) 100vw, 480px"
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-[#1d1813]/60" />
            <Reveal className="relative">
              <Ornament className="text-[#f1dfbf]" />
              <p className="mt-8 text-3xl italic">{t("closing")}</p>
              <Names data={data} className="mt-5 text-5xl" />
              <p className="mt-6 text-lg text-white/80 italic">{data.families}</p>
            </Reveal>
          </section>
        </>
      ) : null}
    </div>
  );
}
