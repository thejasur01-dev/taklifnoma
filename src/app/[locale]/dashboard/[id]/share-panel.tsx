"use client";

import { SiInstagram, SiTelegram, SiWhatsapp } from "@icons-pack/react-simple-icons";
import { Copy, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { shareLinks } from "@/lib/invitations/share";

/** Link + one-tap sharing to Telegram, WhatsApp and Instagram. */
export function SharePanel({ url }: { url: string }) {
  const t = useTranslations("editor");
  const links = shareLinks(url, t("shareMessage"));

  async function copy(hint?: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(hint ?? t("copied"));
    } catch {
      toast.error(url);
    }
  }

  async function shareToInstagram() {
    // Mobile browsers open the system sheet, where Instagram is listed.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ url, text: t("shareMessage") });
        return;
      } catch {
        // cancelled: fall back to copying
      }
    }
    await copy(t("instagramHint"));
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">{t("shareTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("shareText")}</p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border bg-background p-1.5 pl-4">
        <span className="min-w-0 flex-1 truncate text-sm tabular-nums">{url}</span>
        <Button type="button" size="sm" variant="secondary" onClick={() => void copy()}>
          <Copy aria-hidden="true" strokeWidth={1.75} />
          {t("copy")}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          asChild
          variant="outline"
          className="h-12 flex-col gap-1 rounded-xl text-xs sm:flex-row sm:text-sm"
        >
          <a href={links.telegram} target="_blank" rel="noopener noreferrer">
            <SiTelegram aria-hidden="true" color="default" size={18} />
            {t("telegram")}
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-12 flex-col gap-1 rounded-xl text-xs sm:flex-row sm:text-sm"
        >
          <a href={links.whatsapp} target="_blank" rel="noopener noreferrer">
            <SiWhatsapp aria-hidden="true" color="default" size={18} />
            {t("whatsapp")}
          </a>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 flex-col gap-1 rounded-xl text-xs sm:flex-row sm:text-sm"
          onClick={() => void shareToInstagram()}
        >
          <SiInstagram aria-hidden="true" color="default" size={18} />
          {t("instagram")}
        </Button>
      </div>

      <Button asChild variant="ghost" className="w-full">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <ExternalLink aria-hidden="true" strokeWidth={1.75} />
          {t("openInvitation")}
        </a>
      </Button>
    </div>
  );
}
