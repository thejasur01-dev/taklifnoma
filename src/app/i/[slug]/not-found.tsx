import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { BRAND } from "@/lib/config";

/** Unknown, unpublished or expired invitation. Rendered inside the /i layout. */
export default async function InvitationNotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "invitation" });
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center text-white">
      <span aria-hidden="true" className="relative mb-2 size-5">
        <span className="absolute inset-0 rotate-45 bg-[#cdb068]" />
        <span className="absolute inset-0 bg-[#cdb068]" />
      </span>
      <h1 className="[font-family:var(--font-inv-garamond)] text-3xl">{t("unavailableTitle")}</h1>
      <p className="max-w-sm text-white/70">{t("unavailableText")}</p>
      <Link href="/" className="mt-6 text-sm text-white/60 underline underline-offset-4 hover:text-white">
        {t("madeWith", { brand: BRAND.name })}
      </Link>
    </main>
  );
}
