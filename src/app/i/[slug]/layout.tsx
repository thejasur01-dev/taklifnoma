import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { ReactNode } from "react";
import { routing } from "@/i18n/routing";
import { getPublicInvitation } from "@/lib/invitations/public";
import { fontVariables } from "../../fonts";
import "../../globals.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d1813",
};

/** Guest-facing invitation document, rendered in the invitation's own language. */
export default async function InvitationLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const invitation = await getPublicInvitation(slug);
  const locale = invitation?.locale ?? routing.defaultLocale;
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full bg-[#16120e]">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
