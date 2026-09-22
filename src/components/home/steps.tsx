import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveal";

const STEPS = ["choose", "fill", "send"] as const;

export async function Steps() {
  const t = await getTranslations("home.steps");

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-secondary px-6 py-14 sm:px-12 lg:py-20">
        <Reveal>
          <h2 className="text-center text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-[2.6rem] sm:leading-[1.1]">
            {t("title")}
          </h2>
        </Reveal>
        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          <span
            aria-hidden="true"
            className="absolute top-5 right-[16%] left-[16%] hidden h-px bg-foreground/15 md:block"
          />
          {STEPS.map((step, i) => (
            <li key={step} className="relative">
              <Reveal delay={i * 0.08} className="flex flex-col items-center text-center">
                <span className="grid size-10 place-items-center rounded-full border bg-card text-sm font-medium tabular-nums">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight">{t(`${step}.title`)}</h3>
                <p className="mt-2 max-w-[28ch] text-muted-foreground">{t(`${step}.text`)}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
