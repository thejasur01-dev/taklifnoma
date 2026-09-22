import { getTranslations } from "next-intl/server";
import { BrandMark } from "@/components/brand-mark";
import { Link } from "@/i18n/navigation";
import { BRAND } from "@/lib/config";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  const columns = [
    {
      title: t("product"),
      links: [
        { href: "/#templates", label: nav("templates") },
        { href: "/#features", label: nav("features") },
        { href: "/#pricing", label: nav("pricing") },
      ],
    },
    {
      title: t("help"),
      links: [
        { href: "/#faq", label: nav("faq") },
        { href: "/dashboard", label: nav("dashboard") },
      ],
    },
  ];

  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div className="max-w-xs space-y-3">
          <BrandMark />
          <p className="text-sm leading-relaxed text-muted-foreground">{t("tagline")}</p>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="space-y-3">
            <p className="text-sm font-medium">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-10 text-xs text-muted-foreground sm:px-6 lg:px-8">
        {t("rights", { year: new Date().getFullYear(), brand: BRAND.name })}
      </div>
    </footer>
  );
}
