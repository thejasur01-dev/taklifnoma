import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Device bezel for live invitation previews (the content is a real component, not a screenshot). */
export function PhoneFrame({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <figure
      aria-label={label}
      className={cn(
        "relative rounded-[2.6rem] bg-[#16181f] p-[0.55rem] shadow-[0_40px_80px_-30px_rgb(18_20_26/0.45),0_0_0_1px_rgb(255_255_255/0.06)_inset]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute top-[1.1rem] left-1/2 z-10 h-[1.35rem] w-[28%] -translate-x-1/2 rounded-full bg-[#16181f]"
      />
      <div className="overflow-hidden rounded-[2.1rem]">{children}</div>
    </figure>
  );
}
