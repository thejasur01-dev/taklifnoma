"use client";

import { ChevronDown, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type Locale, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("localeSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [pending, startTransition] = useTransition();

  return (
    <label
      className={cn(
        "relative inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        className,
      )}
    >
      <Globe aria-hidden="true" className="size-4" strokeWidth={1.5} />
      <span className="sr-only">{t("label")}</span>
      <span aria-hidden="true" className="font-medium uppercase">
        {locale}
      </span>
      <ChevronDown aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
      <select
        name="locale"
        value={locale}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.value as Locale;
          startTransition(() => {
            // @ts-expect-error -- params always match the current pathname
            router.replace({ pathname, params }, { locale: next });
          });
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {t(l)}
          </option>
        ))}
      </select>
    </label>
  );
}
