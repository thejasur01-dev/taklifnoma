import { getTranslations } from "next-intl/server";
import { ErrorView } from "@/components/error-view";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <ErrorView code="404" title={t("notFoundTitle")} text={t("notFoundText")}>
      <Button asChild size="lg">
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </ErrorView>
  );
}
