import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { type LayoutId, type Theme, themeStyle } from "./themes";

export type InvitationCoverContent = {
  greeting: string;
  firstName: string;
  secondName: string;
  invitation: string;
  weekday: string;
  day: string;
  monthYear: string;
  time: string;
  venue: string;
};

type Props = {
  theme: Theme;
  layout: LayoutId;
  content: InvitationCoverContent;
  className?: string;
};

/** Eight-point star (two squares), the girih motif used as the template ornament. */
function Star({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative inline-block size-[4.2cqw]", className)}>
      <span className="absolute inset-0 rotate-45 bg-[var(--inv-accent)]" />
      <span className="absolute inset-0 bg-[var(--inv-accent)]" />
    </span>
  );
}

function LayoutFrame({ layout }: { layout: LayoutId }) {
  if (layout === "arch") {
    return (
      <>
        <span
          aria-hidden="true"
          className="absolute inset-x-[7%] top-[4.5%] bottom-[4.5%] rounded-t-[50cqw] border border-[var(--inv-line)]"
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-[10%] top-[6.5%] bottom-[6.5%] rounded-t-[50cqw] border border-[var(--inv-line)] opacity-60"
        />
      </>
    );
  }
  if (layout === "frame") {
    return (
      <>
        <span aria-hidden="true" className="absolute inset-[5%] border border-[var(--inv-line)]" />
        <span aria-hidden="true" className="absolute inset-[7%] border border-[var(--inv-line)] opacity-60" />
        {(
          [
            "top-[3.6%] left-[3.6%]",
            "top-[3.6%] right-[3.6%]",
            "bottom-[3.6%] left-[3.6%]",
            "right-[3.6%] bottom-[3.6%]",
          ] as const
        ).map((pos) => (
          <Star key={pos} className={cn("absolute size-[3cqw]", pos)} />
        ))}
      </>
    );
  }
  return (
    <>
      <span aria-hidden="true" className="absolute inset-x-[18%] top-[7%] h-px bg-[var(--inv-line)]" />
      <span aria-hidden="true" className="absolute inset-x-[18%] bottom-[7%] h-px bg-[var(--inv-line)]" />
    </>
  );
}

/**
 * Cover screen of an invitation. Sized entirely in container units, so the
 * same component renders a catalog thumbnail and a full phone preview.
 */
export function InvitationCover({ theme, layout, content, className }: Props) {
  const style = {
    ...themeStyle(theme),
    background: `radial-gradient(120% 80% at 50% 0%, var(--inv-paper) 55%, var(--inv-paper-edge) 100%)`,
  } as CSSProperties;

  return (
    <div
      style={style}
      className={cn(
        "@container relative aspect-[9/16] w-full overflow-hidden [font-family:var(--inv-font-body)] text-[var(--inv-ink)]",
        className,
      )}
    >
      <LayoutFrame layout={layout} />

      <div className="relative flex h-full flex-col items-center justify-center px-[16%] text-center">
        <Star className={layout === "arch" ? "mb-[6cqw]" : "mb-[5cqw]"} />
        <p className="text-[3.4cqw] tracking-[0.28em] text-[var(--inv-muted)] uppercase">
          {content.greeting}
        </p>

        <div className="mt-[5cqw] [font-family:var(--inv-font-names)] leading-[1.05]">
          <p className="text-[13cqw]">{content.firstName}</p>
          <p className="my-[1cqw] text-[7cqw] text-[var(--inv-accent)]">&amp;</p>
          <p className="text-[13cqw]">{content.secondName}</p>
        </div>

        <p className="mt-[6cqw] text-[3.9cqw] leading-relaxed text-[var(--inv-muted)]">
          {content.invitation}
        </p>

        <div className="mt-[7cqw] flex items-center gap-[4cqw]">
          <span className="w-[14cqw] border-t border-[var(--inv-line)] pt-[1.5cqw] text-[3.2cqw] tracking-[0.18em] uppercase">
            {content.weekday}
          </span>
          <span className="[font-family:var(--inv-font-names)] text-[12cqw] leading-none text-[var(--inv-accent)]">
            {content.day}
          </span>
          <span className="w-[14cqw] border-t border-[var(--inv-line)] pt-[1.5cqw] text-[3.2cqw] tracking-[0.18em] uppercase">
            {content.time}
          </span>
        </div>
        <p className="mt-[2cqw] text-[3.6cqw] tracking-[0.22em] uppercase">{content.monthYear}</p>

        <p className="mt-[6cqw] text-[3.6cqw] text-[var(--inv-muted)]">{content.venue}</p>
      </div>
    </div>
  );
}
