import type { CSSProperties, ReactNode } from "react";
import { PhoneFrame } from "@/components/phone-frame";
import { cn } from "@/lib/utils";

/**
 * A phone with a scrollable screen for live invitation previews.
 * `--inv-screen` gives invitation heroes the screen height instead of 100dvh.
 */
export function PhonePreview({
  children,
  label,
  screenHeight = 640,
  className,
}: {
  children: ReactNode;
  label?: string;
  screenHeight?: number;
  className?: string;
}) {
  return (
    <PhoneFrame label={label} className={cn("w-full", className)}>
      <div
        data-inv-scroll
        style={{ "--inv-screen": `${screenHeight}px`, height: screenHeight } as CSSProperties}
        className="relative [scrollbar-width:none] overflow-y-auto overscroll-contain"
      >
        {children}
      </div>
    </PhoneFrame>
  );
}
