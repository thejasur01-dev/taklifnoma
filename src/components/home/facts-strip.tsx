import { Languages, Link2, ListChecks, Send } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function FactsStrip() {
  const t = await getTranslations("home.facts");
  const facts = [
    { icon: ListChecks, label: t("rsvp") },
    { icon: Link2, label: t("guests") },
    { icon: Send, label: t("telegram") },
    { icon: Languages, label: t("languages") },
  ];

  return (
    <section className="border-y bg-card/60">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-5 px-4 py-7 sm:px-6 lg:grid-cols-4 lg:px-8">
        {facts.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3 text-sm">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
              <Icon aria-hidden="true" className="size-4" strokeWidth={1.5} />
            </span>
            <span className="text-pretty">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
