import { BRAND } from "@/lib/config";
import { cn } from "@/lib/utils";

/** Logo: an eight-point girih star (two squares) and the wordmark. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span aria-hidden="true" className="relative size-4">
        <span className="absolute inset-0 rotate-45 rounded-[2px] bg-primary" />
        <span className="absolute inset-0 rounded-[2px] bg-primary/80" />
      </span>
      <span className="text-[1.05rem] font-semibold tracking-tight">{BRAND.name}</span>
    </span>
  );
}
