import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";
import { requireUser } from "@/lib/auth/session";
import { PLAN_PRICES_UZS } from "@/lib/config";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getCatalogTemplate } from "@/templates/catalog";
import { calendarNames } from "@/templates/cover-content";
import { invitationDataSchema } from "@/templates/schema";
import { InvitationEditor } from "./editor";

export async function generateMetadata({ params }: PageProps<"/[locale]/dashboard/[id]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "editor" });
  return { title: t("title"), robots: { index: false } };
}

export default async function EditInvitationPage({ params }: PageProps<"/[locale]/dashboard/[id]">) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  await requireUser(locale);

  const supabase = await createClient();
  if (!supabase || !/^[0-9a-f-]{36}$/.test(id)) notFound();

  // RLS: only the owner (or an admin) can read the row.
  const { data: invitation } = await supabase
    .from("invitations")
    .select("id, slug, status, data, templates(slug)")
    .eq("id", id)
    .maybeSingle();
  const template = getCatalogTemplate(invitation?.templates?.slug ?? "");
  const parsed = invitationDataSchema.safeParse(invitation?.data);
  if (!invitation || !template || !parsed.success) notFound();

  const [names, cal, editor] = await Promise.all([
    getTranslations("templateNames"),
    getTranslations("calendar"),
    getTranslations("editor"),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <InvitationEditor
          id={invitation.id}
          templateSlug={template.slug}
          templateName={names(template.slug)}
          initialData={parsed.data}
          initialSlug={invitation.slug}
          status={invitation.status}
          siteUrl={publicEnv.NEXT_PUBLIC_SITE_URL}
          devMode={process.env.NODE_ENV !== "production"}
          calendar={calendarNames(cal)}
          priceLabel={editor("price", { price: PLAN_PRICES_UZS.standard })}
        />
      </main>
    </>
  );
}
