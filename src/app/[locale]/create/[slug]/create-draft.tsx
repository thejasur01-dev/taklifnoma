"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { createDraft } from "@/lib/invitations/actions";

/**
 * Creates the draft from the browser after mount (never during render or
 * link prefetching), then opens the editor.
 */
export function CreateDraft({ templateSlug }: { templateSlug: string }) {
  const t = useTranslations("create");
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  const run = useCallback(async () => {
    setFailed(false);
    const result = await createDraft(templateSlug);
    if (result.ok) router.replace(`/dashboard/${result.id}`);
    else if (result.error === "auth") router.replace(`/login?next=/create/${templateSlug}`);
    else setFailed(true);
  }, [router, templateSlug]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void run();
  }, [run]);

  return (
    <div className="flex flex-col items-center gap-5 text-center" role="status">
      {failed ? (
        <>
          <p className="max-w-sm text-muted-foreground">{t("failed")}</p>
          <Button onClick={() => void run()}>{t("retry")}</Button>
        </>
      ) : (
        <>
          <Loader2 aria-hidden="true" className="size-8 animate-spin text-primary" strokeWidth={1.5} />
          <p className="text-lg">{t("preparing")}</p>
        </>
      )}
    </div>
  );
}
