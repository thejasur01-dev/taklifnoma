"use client";

import { useTranslations } from "next-intl";
import { ErrorView } from "@/components/error-view";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errors");
  return (
    <ErrorView code="500" title={t("serverTitle")} text={t("serverText")}>
      <Button size="lg" onClick={reset}>
        {t("retry")}
      </Button>
    </ErrorView>
  );
}
