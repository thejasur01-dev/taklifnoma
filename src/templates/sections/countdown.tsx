"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { type Countdown as CountdownValue, timeUntil } from "../schema";

/**
 * Days / hours / minutes until the event. Rendered only after mount: the
 * server's clock and the guest's clock differ, so SSR output would not match.
 */
export function Countdown({ startsAt, className }: { startsAt: string; className?: string }) {
  const t = useTranslations("invitation");
  const [value, setValue] = useState<CountdownValue | null>(null);

  useEffect(() => {
    const target = new Date(startsAt);
    const tick = () => setValue(timeUntil(target));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [startsAt]);

  if (value?.started) {
    return <p className={cn("text-center text-2xl italic", className)}>{t("started")}</p>;
  }

  const cells = [
    { label: t("days"), value: value?.days },
    { label: t("hours"), value: value?.hours },
    { label: t("minutes"), value: value?.minutes },
  ];

  return (
    <dl className={cn("grid grid-cols-3 gap-3", className)} aria-live="off">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="flex flex-col items-center rounded-2xl border border-[var(--g-line)] bg-[var(--g-card)] py-5"
        >
          <dd className="text-4xl leading-none tabular-nums">
            {cell.value === undefined ? "–" : String(cell.value).padStart(2, "0")}
          </dd>
          <dt className="mt-2 text-xs tracking-[0.2em] text-[var(--g-muted)] uppercase">{cell.label}</dt>
        </div>
      ))}
    </dl>
  );
}
