"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useId, useState } from "react";
import { cn } from "@/lib/utils";

type Answer = "yes" | "no";

/**
 * Guest reply form. In "demo" mode (template previews) nothing is stored;
 * the live mode will post to a rate-limited server action (stage 4).
 */
export function RsvpForm({ mode }: { mode: "demo" | "live" }) {
  const t = useTranslations("invitation");
  const id = useId();
  const [name, setName] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [errors, setErrors] = useState<{ name?: string; answer?: string }>({});
  const [sent, setSent] = useState<Answer | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = {
      name: name.trim() ? undefined : t("nameRequired"),
      answer: answer ? undefined : t("choiceRequired"),
    };
    setErrors(next);
    if (next.name || next.answer || !answer) return;
    setSent(answer);
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-[var(--g-gold)] text-[var(--g-paper)]">
          <Check aria-hidden="true" className="size-6" strokeWidth={1.75} />
        </span>
        <p className="text-2xl">{sent === "yes" ? t("thanksYes") : t("thanksNo")}</p>
        {mode === "demo" ? (
          <p className="font-sans text-xs text-[var(--g-muted)]">{t("demoNotice")}</p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6 text-left">
      <div className="grid gap-2">
        <label
          htmlFor={`${id}-name`}
          className="font-sans text-[11px] tracking-[0.3em] text-[var(--g-muted)] uppercase"
        >
          {t("name")}
        </label>
        <input
          id={`${id}-name`}
          name="name"
          value={name}
          maxLength={80}
          autoComplete="name"
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${id}-name-error` : undefined}
          className="h-12 w-full border-b border-[var(--g-line)] bg-transparent font-sans text-lg transition-colors outline-none focus:border-[var(--g-gold)]"
        />
        {errors.name ? (
          <p id={`${id}-name-error`} role="alert" className="font-sans text-sm text-[#a3413a]">
            {errors.name}
          </p>
        ) : null}
      </div>

      <fieldset aria-describedby={errors.answer ? `${id}-answer-error` : undefined}>
        <legend className="font-sans text-[11px] tracking-[0.3em] text-[var(--g-muted)] uppercase">
          {t("choiceLabel")}
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(["yes", "no"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={answer === value}
              onClick={() => setAnswer(value)}
              className={cn(
                "h-12 rounded-full border font-sans text-[15px] transition-colors",
                answer === value
                  ? "border-[var(--g-gold)] bg-[var(--g-gold)] text-[var(--g-paper)]"
                  : "border-[var(--g-line)] bg-[var(--g-card)] hover:border-[var(--g-gold)]",
              )}
            >
              {value === "yes" ? t("attending") : t("declining")}
            </button>
          ))}
        </div>
        {errors.answer ? (
          <p id={`${id}-answer-error`} role="alert" className="mt-2 font-sans text-sm text-[#a3413a]">
            {errors.answer}
          </p>
        ) : null}
      </fieldset>

      <button
        type="submit"
        className="h-13 w-full rounded-full bg-[var(--g-ink)] font-sans text-[15px] font-medium text-[var(--g-paper)] transition-transform active:scale-[0.98]"
      >
        {t("submit")}
      </button>
      {mode === "demo" ? (
        <p className="text-center font-sans text-xs text-[var(--g-muted)]">{t("demoNotice")}</p>
      ) : null}
    </form>
  );
}
