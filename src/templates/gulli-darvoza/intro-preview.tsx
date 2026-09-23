import Image from "next/image";

/** Static render of the template's opening screen, for marketing previews. */
export function GulliDarvozaIntroPreview({
  first,
  second,
  openLabel,
  priority = false,
}: {
  first: string;
  second: string;
  openLabel: string;
  priority?: boolean;
}) {
  return (
    <div className="@container relative aspect-[9/19.5] w-full overflow-hidden bg-[#1d1813]">
      <Image
        src="/templates/gulli-darvoza/gate.webp"
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 768px) 60vw, 300px"
        className="object-cover"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/60 via-black/5 to-transparent px-[8%] pb-[12%] text-white">
        <p className="[font-family:var(--font-inv-script)] text-[11cqw] leading-tight drop-shadow-[0_2px_10px_rgb(0_0_0/0.35)]">
          {first}
          <span className="mx-2 text-[0.6em] text-[#e9d3a8]">&amp;</span>
          {second}
        </p>
        <span className="mt-[7%] inline-flex h-9 items-center rounded-full border border-white/45 bg-white/15 px-5 text-xs font-medium backdrop-blur-md">
          {openLabel}
        </span>
      </div>
    </div>
  );
}
