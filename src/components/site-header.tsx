import { getTranslations } from "next-intl/server";
import { signOut } from "@/app/[locale]/login/actions";
import { BrandMark } from "@/components/brand-mark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const user = await getCurrentUser();

  const items = [
    { href: "/#templates", label: t("templates") },
    { href: "/#features", label: t("features") },
    { href: "/#pricing", label: t("pricing") },
    { href: "/#faq", label: t("faq") },
  ];
  const account = user
    ? { href: "/dashboard", label: t("dashboard") }
    : { href: "/login", label: t("login") };

  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={t("home")} className="rounded-md">
          <BrandMark />
        </Link>

        <nav aria-label={t("mainNavigation")} className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          {user ? (
            <form action={signOut} className="hidden md:block">
              <Button type="submit" variant="ghost" size="sm">
                {t("logout")}
              </Button>
            </form>
          ) : null}
          <Link
            href={account.href}
            className="hidden rounded-full px-3.5 py-2 text-sm font-medium md:inline-flex"
          >
            {account.label}
          </Link>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href={user ? "/dashboard" : "/login"}>{t("create")}</Link>
          </Button>
          <MobileNav items={items} account={account} />
        </div>
      </div>
    </header>
  );
}
