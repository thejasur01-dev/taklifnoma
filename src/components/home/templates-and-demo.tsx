"use client";

import { ArrowRight, Eye, Play } from "lucide-react";
import Image from "next/image";
import { useId, useMemo, useRef, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { PhoneFrame } from "@/components/phone-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import type { CeremonyType } from "@/lib/config";
import { cn } from "@/lib/utils";
import { buildCoverContent, type CalendarNames, DEMO_EVENT_DATE } from "@/templates/cover-content";
import { InvitationCover } from "@/templates/invitation-cover";
import { getTheme, type LayoutId } from "@/templates/themes";

type CoverItem = {
  kind: "cover";
  slug: string;
  layout: LayoutId;
  themeId: string;
  name: string;
  categories: CeremonyType[];
};

/** A full template with its own preview page (real artwork, optional video intro). */
type MediaItem = {
  kind: "media";
  slug: string;
  name: string;
  categories: CeremonyType[];
  thumbnail: string;
  hasVideo: boolean;
};

export type ShowcaseItem = CoverItem | MediaItem;

type Labels = {
  templatesTitle: string;
  templatesSubtitle: string;
  filterLabel: string;
  all: string;
  view: string;
  empty: string;
  demoTitle: string;
  demoSubtitle: string;
  firstName: string;
  secondName: string;
  date: string;
  style: string;
  cta: string;
  previewLabel: string;
  video: string;
};

type Props = {
  items: ShowcaseItem[];
  ceremonies: { id: CeremonyType; label: string }[];
  categoryLabels: Record<CeremonyType, string>;
  cover: { greeting: string; invitation: string; venue: string; firstName: string; secondName: string };
  labels: Labels;
  calendar: CalendarNames;
  ctaHref: string;
};

const TASHKENT_OFFSET = "+05:00";
const DEMO_LOCAL_VALUE = "2026-10-17T17:00";

function parseLocalDate(value: string): Date {
  const date = new Date(`${value}:00${TASHKENT_OFFSET}`);
  return Number.isNaN(date.getTime()) ? DEMO_EVENT_DATE : date;
}

export function TemplatesAndDemo({
  items,
  ceremonies,
  categoryLabels,
  cover,
  labels,
  calendar,
  ctaHref,
}: Props) {
  const formId = useId();
  const demoRef = useRef<HTMLElement>(null);

  const [filter, setFilter] = useState<CeremonyType | "all">("all");
  const coverItems = items.filter((i): i is CoverItem => i.kind === "cover");
  const [selected, setSelected] = useState(coverItems[0]?.slug ?? "");
  const [firstName, setFirstName] = useState(cover.firstName);
  const [secondName, setSecondName] = useState(cover.secondName);
  const [dateValue, setDateValue] = useState(DEMO_LOCAL_VALUE);

  const visible = filter === "all" ? items : items.filter((i) => i.categories.includes(filter));
  const current = coverItems.find((i) => i.slug === selected) ?? coverItems[0];

  const sampleContent = useMemo(
    () =>
      buildCoverContent(
        cover,
        { first: cover.firstName, second: cover.secondName },
        DEMO_EVENT_DATE,
        calendar,
      ),
    [cover, calendar],
  );

  const liveContent = buildCoverContent(
    cover,
    { first: firstName.trim() || cover.firstName, second: secondName.trim() || cover.secondName },
    parseLocalDate(dateValue),
    calendar,
  );

  function openInDemo(slug: string) {
    setSelected(slug);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    demoRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  return (
    <>
      <section id="templates" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-[2.6rem] sm:leading-[1.1]">
            {labels.templatesTitle}
          </h2>
          <p className="mt-4 max-w-[60ch] text-lg text-pretty text-muted-foreground">
            {labels.templatesSubtitle}
          </p>
        </Reveal>

        <div
          role="group"
          aria-label={labels.filterLabel}
          className="-mx-4 mt-10 flex snap-x [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {[{ id: "all" as const, label: labels.all }, ...ceremonies].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={filter === c.id}
              onClick={() => setFilter(c.id)}
              className={cn(
                "h-10 shrink-0 snap-start rounded-full border px-4 text-sm transition-colors",
                filter === c.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="mt-10 rounded-lg border border-dashed px-6 py-16 text-center text-muted-foreground">
            {labels.empty}
          </p>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {visible.map((item) => (
              <li key={item.slug}>
                {item.kind === "media" ? (
                  <Link
                    href={`/templates/${item.slug}`}
                    aria-label={`${item.name}. ${labels.view}`}
                    className="group block rounded-lg"
                  >
                    <div
                      aria-hidden="true"
                      className="relative aspect-[9/16] overflow-hidden rounded-lg shadow-[0_1px_2px_rgb(18_20_26/0.06),0_18px_40px_-28px_rgb(18_20_26/0.35)] ring-1 ring-foreground/5 transition-transform duration-500 ease-out-soft group-hover:-translate-y-1"
                    >
                      <Image
                        src={item.thumbnail}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
                      />
                    </div>
                    <div aria-hidden="true" className="mt-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-2 font-medium">
                          {item.name}
                          {item.hasVideo ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
                              <Play className="size-3" strokeWidth={2} />
                              {labels.video}
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {item.categories.map((c) => categoryLabels[c]).join(", ")}
                        </p>
                      </div>
                      <span className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-primary opacity-80 transition-opacity group-hover:opacity-100">
                        <Eye className="size-4" strokeWidth={1.5} />
                        {labels.view}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => openInDemo(item.slug)}
                    aria-label={`${item.name}. ${labels.view}`}
                    className="group block w-full rounded-lg text-left"
                  >
                    <div
                      aria-hidden="true"
                      className="overflow-hidden rounded-lg shadow-[0_1px_2px_rgb(18_20_26/0.06),0_18px_40px_-28px_rgb(18_20_26/0.35)] ring-1 ring-foreground/5 transition-transform duration-500 ease-out-soft group-hover:-translate-y-1"
                    >
                      <InvitationCover
                        theme={getTheme(item.themeId)}
                        layout={item.layout}
                        content={sampleContent}
                      />
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {item.categories.map((c) => categoryLabels[c]).join(", ")}
                        </p>
                      </div>
                      <span
                        aria-hidden="true"
                        className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-primary opacity-80 transition-opacity group-hover:opacity-100"
                      >
                        <Eye aria-hidden="true" className="size-4" strokeWidth={1.5} />
                        {labels.view}
                      </span>
                    </div>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        id="demo"
        ref={demoRef}
        className="scroll-mt-16 bg-card/70 py-20 lg:py-28"
        aria-labelledby={`${formId}-title`}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <Reveal className="order-2 lg:order-1">
            <h2
              id={`${formId}-title`}
              className="text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-[2.6rem] sm:leading-[1.1]"
            >
              {labels.demoTitle}
            </h2>
            <p className="mt-4 max-w-[50ch] text-lg text-pretty text-muted-foreground">
              {labels.demoSubtitle}
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`${formId}-first`}>{labels.firstName}</Label>
                <Input
                  id={`${formId}-first`}
                  value={firstName}
                  maxLength={24}
                  autoComplete="off"
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`${formId}-second`}>{labels.secondName}</Label>
                <Input
                  id={`${formId}-second`}
                  value={secondName}
                  maxLength={24}
                  autoComplete="off"
                  onChange={(e) => setSecondName(e.target.value)}
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor={`${formId}-date`}>{labels.date}</Label>
                <Input
                  id={`${formId}-date`}
                  type="datetime-local"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                />
              </div>
            </div>

            <fieldset className="mt-7">
              <legend className="text-sm font-medium">{labels.style}</legend>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {coverItems.map((item) => {
                  const theme = getTheme(item.themeId);
                  const active = item.slug === current?.slug;
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      aria-pressed={active}
                      aria-label={item.name}
                      title={item.name}
                      onClick={() => setSelected(item.slug)}
                      className={cn(
                        "grid size-11 place-items-center rounded-full ring-offset-2 ring-offset-card transition-shadow",
                        active ? "ring-2 ring-foreground" : "ring-1 ring-border hover:ring-foreground/40",
                      )}
                      style={{ background: theme.palette.paper }}
                    >
                      <span className="size-4 rounded-full" style={{ background: theme.palette.accent }} />
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <Button asChild size="lg" className="mt-10">
              <Link href={ctaHref}>
                {labels.cta}
                <ArrowRight strokeWidth={1.75} />
              </Link>
            </Button>
          </Reveal>

          <Reveal delay={0.1} className="order-1 mx-auto w-[68%] max-w-[320px] lg:order-2">
            {current ? (
              <PhoneFrame label={labels.previewLabel}>
                <InvitationCover
                  theme={getTheme(current.themeId)}
                  layout={current.layout}
                  content={liveContent}
                />
              </PhoneFrame>
            ) : null}
          </Reveal>
        </div>
      </section>
    </>
  );
}
