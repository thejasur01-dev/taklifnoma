"use client";

import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { type CSSProperties, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { InvitationCover } from "../invitation-cover";
import { getTheme, type LayoutId, themeStyle } from "../themes";
import { InvitationSections } from "./sections";
import type { InvitationProps } from "./types";

/** Maps a theme palette onto the shared section variables. */
function sectionVars(themeId: string): CSSProperties {
  const theme = getTheme(themeId);
  const { paper, ink, muted, accent, line } = theme.palette;
  const vars = themeStyle(theme);
  return {
    ...vars,
    "--g-paper": paper,
    "--g-card": `color-mix(in oklab, ${paper}, ${ink} 5%)`,
    "--g-ink": ink,
    "--g-muted": muted,
    "--g-gold": accent,
    "--g-line": line,
    "--g-font-body": vars["--inv-font-body"],
    "--g-font-names": vars["--inv-font-names"],
  } as CSSProperties;
}

/**
 * Generic renderer for layout × theme templates: the themed cover is the
 * opening screen, the shared sections follow once the guest opens it.
 */
export function ThemedInvitation({
  themeId,
  layout,
  data,
  date,
  mode,
  slug,
  initiallyOpen,
}: InvitationProps & { themeId: string; layout: LayoutId }) {
  const t = useTranslations("invitation");
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(Boolean(initiallyOpen));
  const contentRef = useRef<HTMLDivElement>(null);

  function openInvitation() {
    setOpen(true);
    // Let the sections mount, then scroll the nearest invitation viewport
    // (the phone screen in previews, the window otherwise) to the first one.
    requestAnimationFrame(() => {
      const el = contentRef.current;
      if (!el) return;
      const behavior = reduce ? "auto" : "smooth";
      const scroller = el.closest<HTMLElement>("[data-inv-scroll]");
      if (scroller) scroller.scrollTo({ top: el.offsetTop, behavior });
      else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior });
    });
  }

  const cover = {
    greeting: t("greeting"),
    firstName: data.hosts.first,
    secondName: data.hosts.second,
    invitation: t("coverLine"),
    weekday: date.weekday,
    day: date.day,
    monthYear: `${date.month} ${date.year}`,
    time: date.time,
    venue: data.event.venueName,
  };

  return (
    <div
      style={sectionVars(themeId)}
      className="@container bg-[var(--g-paper)] [font-family:var(--g-font-body)] text-[var(--g-ink)]"
    >
      <section className="relative h-[var(--inv-screen,100dvh)] min-h-[520px] overflow-hidden">
        <InvitationCover
          theme={getTheme(themeId)}
          layout={layout}
          content={cover}
          className="aspect-auto h-full"
        />
        {!open ? (
          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-[max(2.25rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={openInvitation}
              className={cn(
                "relative inline-flex h-12 items-center rounded-full bg-[var(--g-ink)] px-7 font-sans text-[15px] font-medium text-[var(--g-paper)] shadow-[0_14px_40px_-16px_rgb(0_0_0/0.6)] transition-transform active:scale-[0.98]",
              )}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 animate-[ping_2.4s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full border border-[var(--g-ink)] opacity-40 motion-reduce:hidden"
              />
              {t("open")}
            </button>
          </div>
        ) : null}
      </section>

      {open ? (
        <div ref={contentRef}>
          <InvitationSections data={data} date={date} mode={mode} slug={slug} />
        </div>
      ) : null}
    </div>
  );
}
