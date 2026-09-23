"use client";

import { Volume2, VolumeX } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { InvitationSections, Names } from "../invitation/sections";
import { Countdown } from "../sections/countdown";
import type { InvitationProps } from "../invitation/types";

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
  "--g-font-body": "var(--font-inv-garamond)",
  "--g-font-names": "var(--font-inv-script)",
} as CSSProperties;

type Stage = "intro" | "playing" | "open";

const EASE = [0.16, 1, 0.3, 1] as const;

export function GulliDarvozaInvitation({ data, date, mode, slug, embedded, initiallyOpen }: InvitationProps) {
  const t = useTranslations("invitation");
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stage, setStage] = useState<Stage>(initiallyOpen ? "open" : "intro");
  const [muted, setMuted] = useState(false);

  // Fetch the intro video once the page is idle, so the gate opens instantly on tap
  // while the first paint stays light (poster image only).
  useEffect(() => {
    const video = videoRef.current;
    if (!video || initiallyOpen) return;
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
  }, [initiallyOpen]);

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
    reduce || initiallyOpen
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1.1, delay, ease: EASE },
        };

  const sizes = embedded ? "360px" : "(max-width: 480px) 100vw, 480px";

  return (
    <div
      style={THEME}
      className="@container bg-[var(--g-paper)] [font-family:var(--g-font-body)] text-[var(--g-ink)]"
    >
      {/* Gate → video → couple scene */}
      <section className="relative h-[var(--inv-screen,100dvh)] min-h-[520px] overflow-hidden bg-[#1d1813]">
        <Image
          src={ASSETS.couple}
          alt=""
          fill
          sizes={sizes}
          className={cn(
            "object-cover transition-opacity duration-700",
            stage === "open" ? "opacity-100" : "opacity-0",
          )}
        />
        <Image
          src={ASSETS.gate}
          alt=""
          fill
          priority={!embedded}
          sizes={sizes}
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
            <Names
              data={data}
              className="text-[clamp(2.2rem,12.5cqw,3rem)] drop-shadow-[0_2px_12px_rgb(0_0_0/0.35)]"
            />
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
          <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/75 via-black/20 to-transparent px-6 pb-12 text-center text-white">
            {data.showBismillah ? (
              <motion.p {...heroItem(0.1)} className="text-lg tracking-wide text-[#f1dfbf] italic">
                {t("bismillah")}
              </motion.p>
            ) : null}
            <motion.div
              {...heroItem(0.5)}
              className="mt-2 w-full [font-family:var(--g-font-names)] leading-[0.95] break-words drop-shadow-[0_2px_18px_rgb(0_0_0/0.45)]"
            >
              <p className="text-[clamp(3rem,19cqw,5rem)]">{data.hosts.first}</p>
              <p className="my-1 text-[clamp(1.6rem,9cqw,2.4rem)] text-[#e9d3a8]">&amp;</p>
              <p className="text-[clamp(3rem,19cqw,5rem)]">{data.hosts.second}</p>
            </motion.div>
            <motion.p {...heroItem(0.95)} className="mt-5 font-sans text-sm tracking-[0.35em] uppercase">
              {date.day} · {date.month} · {date.year}
            </motion.p>
            <motion.div {...heroItem(1.3)} className="mt-6 w-full max-w-[21rem]">
              <Countdown startsAt={data.event.startsAt} variant="glass" />
            </motion.div>
          </div>
        ) : null}
      </section>

      {stage === "open" ? (
        <InvitationSections data={data} date={date} mode={mode} slug={slug} closingImage={ASSETS.gate} />
      ) : null}
    </div>
  );
}
