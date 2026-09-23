"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";

type Item = { href: string; label: string };

export function MobileNav({ items, account }: { items: Item[]; account: Item }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={t("menu")}>
          <Menu className="size-5" strokeWidth={1.5} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[82vw] max-w-sm bg-background px-6 pt-16">
        <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
        <nav aria-label={t("mainNavigation")} className="flex flex-col">
          {[...items, account].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b py-4 text-lg font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button asChild size="lg" className="mt-8 w-full">
          <Link href="/#templates" onClick={() => setOpen(false)}>
            {t("create")}
          </Link>
        </Button>
      </SheetContent>
    </Sheet>
  );
}
