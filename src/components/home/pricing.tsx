import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { PLAN_PRICES_UZS } from "@/lib/config";
import { cn } from "@/lib/utils";

const FEATURES = ["f1", "f2", "f3", "f4"] as const;

export async function Pricing({ ctaHref }: { ctaHref: string }) {
  const t = await getTranslations("home.pricing");
  const nav = await getTranslations("nav");

  const plans = [
    {
      id: "standard" as const,
      cta: nav("create"),
      className: "border bg-card",
      muted: "text-muted-foreground",
      check: "text-primary",
      buttonVariant: "default" as const,
    },
    {
      id: "individual" as const,
      cta: t("individual.cta"),
      className: "bg-[#12141a] text-[#f4f5f7] dark:bg-accent dark:text-foreground",
      muted: "text-[#f4f5f7]/70 dark:text-muted-foreground",
      check: "text-[#9fb2f2] dark:text-primary",
      buttonVariant: "secondary" as const,
    },
  ];

  return (
    <section id="pricing" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal className="text-center">
        <h2 className="text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-[2.6rem] sm:leading-[1.1]">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-[52ch] text-lg text-pretty text-muted-foreground">{t("note")}</p>
      </Reveal>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {plans.map((plan, i) => (
          <Reveal
            key={plan.id}
            delay={i * 0.08}
            className={cn("flex flex-col rounded-2xl p-8 sm:p-10", plan.className)}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-medium">{t(`${plan.id}.name`)}</h3>
              {plan.id === "individual" ? (
                <span className="rounded-full border border-current/20 px-3 py-1 text-xs">
                  {t("individual.badge")}
                </span>
              ) : null}
            </div>
            <p className="mt-6 text-4xl font-semibold tracking-[-0.03em] tabular-nums sm:text-5xl">
              {t("price", { price: PLAN_PRICES_UZS[plan.id] })}
            </p>
            <p className={cn("mt-3", plan.muted)}>{t(`${plan.id}.text`)}</p>
            <ul className="mt-8 space-y-3.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex gap-3">
                  <Check
                    aria-hidden="true"
                    className={cn("mt-0.5 size-5 shrink-0", plan.check)}
                    strokeWidth={1.75}
                  />
                  <span>{t(`${plan.id}.${f}`)}</span>
                </li>
              ))}
            </ul>
            <Button asChild size="lg" variant={plan.buttonVariant} className="mt-10 w-full">
              <Link href={ctaHref}>{plan.cta}</Link>
            </Button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
