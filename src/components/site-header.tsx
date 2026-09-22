import { getTranslations } from "next-intl/server";
import { signOut } from "@/app/[locale]/login/actions";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { BRAND } from "@/lib/config";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const user = await getCurrentUser();

  return (
    <header className="border-b">
      <nav
        aria-label={t("mainNavigation")}
        className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4"
      >
        <Link href="/" className="font-heading text-lg font-semibold">
          {BRAND.name}
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          {user ? (
            <>
              <Button asChild variant="ghost" size="lg">
                <Link href="/dashboard">{t("dashboard")}</Link>
              </Button>
              <form action={signOut}>
                <Button type="submit" variant="outline" size="lg">
                  {t("logout")}
                </Button>
              </form>
            </>
          ) : (
            <Button asChild size="lg">
              <Link href="/login">{t("login")}</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
