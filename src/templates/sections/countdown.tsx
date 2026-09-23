"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { type Countdown as CountdownValue, timeUntil } from "../schema";

type Variant = "boxes" | "glass";

/**
 * Live countdown (days, hours, minutes, seconds) to the event, ticking every
 * second. Rendered after mount only: the server clock and the guest's clock
 * differ, so server output would not match.
 */
export function Countdown({
  startsAt,
  variant = "boxes",
  className,
}: {
  startsAt: string;
  variant?: Variant;
  className?: string;
}) {
  const t = useTranslations("invitation");
  const [value, setValue] = useState<CountdownValue | null>(null);

  useEffect(() => {
    const target = new Date(startsAt);
    const tick = () => setValue(timeUntil(target));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startsAt]);

  if (value?.started) {
    return <p className={cn("text-center text-2xl italic", className)}>{t("started")}</p>;
  }

  const cells = [
    { label: t("days"), value: value?.days },
    { label: t("hours"), value: value?.hours },
    { label: t("minutes"), value: value?.minutes },
    { label: t("seconds"), value: value?.seconds },
  ];

  return (
    <dl className={cn("grid grid-cols-4", variant === "glass" ? "gap-2" : "gap-2.5", className)}>
      {cells.map((cell) => (
        <div
          key={cell.label}
          className={cn(
            "flex flex-col items-center",
            variant === "glass"
              ? "rounded-xl border border-white/25 bg-white/10 py-2.5 backdrop-blur-md"
              : // --g-frame / --g-frame-width let a theme color the cells (e.g. turquoise tiles)
                "rounded-2xl border [border-width:var(--g-frame-width,1px)] border-[var(--g-frame,var(--g-line))] bg-[var(--g-card)] py-4",
          )}
        >
          <dd
            className={cn(
              "leading-none tabular-nums",
              variant === "glass" ? "font-sans text-2xl font-light" : "text-4xl",
            )}
          >
            {cell.value === undefined ? "--" : String(cell.value).padStart(2, "0")}
          </dd>
          <dt
            className={cn(
              "mt-1.5 font-sans uppercase",
              variant === "glass"
                ? "text-[9px] tracking-[0.18em] text-white/75"
                : "text-[10px] tracking-[0.2em] text-[var(--g-muted)]",
            )}
          >
            {cell.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
