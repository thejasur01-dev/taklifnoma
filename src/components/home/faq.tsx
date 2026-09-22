import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const QUESTIONS = [1, 2, 3, 4, 5, 6] as const;

export async function Faq() {
  const t = await getTranslations("home.faq");

  return (
    <section
      id="faq"
      className="mx-auto grid max-w-7xl scroll-mt-20 gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8 lg:pb-28"
    >
      <Reveal>
        <h2 className="text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-[2.6rem] sm:leading-[1.1] lg:sticky lg:top-28">
          {t("title")}
        </h2>
      </Reveal>
      <Reveal delay={0.06}>
        <Accordion type="single" collapsible defaultValue="q1" className="border-t">
          {QUESTIONS.map((n) => (
            <AccordionItem key={n} value={`q${n}`}>
              <AccordionTrigger className="py-6 text-left text-lg font-medium hover:no-underline">
                {t(`q${n}`)}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">
                {t(`a${n}`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}
