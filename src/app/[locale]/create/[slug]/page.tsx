import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/session";
import { getCatalogTemplate } from "@/templates/catalog";
import { CreateDraft } from "./create-draft";

export async function generateMetadata({ params }: PageProps<"/[locale]/create/[slug]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "create" });
  return { title: t("preparing"), robots: { index: false } };
}

export default async function CreatePage({ params }: PageProps<"/[locale]/create/[slug]">) {
  const { locale, slug } = await params;
  const template = getCatalogTemplate(slug);
  if (!hasLocale(routing.locales, locale) || !template) notFound();
  setRequestLocale(locale);

  if (!(await getCurrentUser())) {
    redirect({ href: `/login?next=/create/${template.slug}`, locale });
  }

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <CreateDraft templateSlug={template.slug} />
      </main>
    </>
  );
}
