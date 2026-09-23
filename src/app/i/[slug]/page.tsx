import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/config";
import { getPublicInvitation } from "@/lib/invitations/public";
import { invitationDateParts } from "@/templates/invitation/date";
import { InvitationRenderer } from "@/templates/invitation/render";

export async function generateMetadata({ params }: PageProps<"/i/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getPublicInvitation(slug);
  if (!invitation) return {};
  const t = await getTranslations({ locale: invitation.locale, namespace: "invitation" });
  const title = `${invitation.data.hosts.first} & ${invitation.data.hosts.second}`;
  const image = invitation.template.kind === "media" ? invitation.template.thumbnail : undefined;
  return {
    title,
    description: t("coverLine"),
    openGraph: { title, description: t("coverLine"), images: image ? [{ url: image }] : undefined },
  };
}

export default async function InvitationPage({ params }: PageProps<"/i/[slug]">) {
  const { slug } = await params;
  const invitation = await getPublicInvitation(slug);
  if (!invitation) notFound();

  const [t, date] = await Promise.all([
    getTranslations({ locale: invitation.locale, namespace: "invitation" }),
    invitationDateParts(invitation.data.event.startsAt, invitation.locale),
  ]);

  return (
    <>
      {invitation.mode === "preview" ? (
        <p className="fixed inset-x-0 top-3 z-30 mx-auto w-fit max-w-[92vw] rounded-full bg-black/60 px-4 py-2 text-center text-xs text-white backdrop-blur-md">
          {t("draftBanner")}
        </p>
      ) : null}
      <main className="mx-auto w-full max-w-[480px] sm:my-8 sm:overflow-hidden sm:rounded-[2rem] sm:shadow-[0_40px_120px_-30px_rgb(0_0_0/0.55)]">
        <InvitationRenderer
          templateSlug={invitation.template.slug}
          data={invitation.data}
          date={date}
          mode={invitation.mode}
          slug={invitation.slug}
        />
      </main>
      <footer className="py-8 text-center text-xs text-white/50">
        <Link href="/" className="hover:text-white/80">
          {t("madeWith", { brand: BRAND.name })}
        </Link>
      </footer>
    </>
  );
}
