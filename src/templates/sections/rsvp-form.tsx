"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useId, useState, useTransition } from "react";
import { submitRsvp } from "@/lib/rsvp/actions";
import { cn } from "@/lib/utils";
import type { InvitationMode } from "../invitation/types";

type Answer = "yes" | "no";

/**
 * Guest reply form. Replies are stored only in "live" mode; demo and draft
 * previews show the same UI with a notice.
 */
export function RsvpForm({
  mode,
  slug,
  submitLabel = "long",
}: {
  mode: InvitationMode;
  slug?: string;
  submitLabel?: "long" | "short";
}) {
  const t = useTranslations("invitation");
  const id = useId();
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [errors, setErrors] = useState<{ name?: string; answer?: string; form?: string }>({});
  const [sent, setSent] = useState<Answer | null>(null);
  const [pending, startTransition] = useTransition();

  const notice = mode === "demo" ? t("demoNotice") : mode === "preview" ? t("previewNotice") : null;

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = {
      name: name.trim() ? undefined : t("nameRequired"),
      answer: answer ? undefined : t("choiceRequired"),
    };
    setErrors(next);
    if (next.name || next.answer || !answer) return;

    if (mode !== "live" || !slug) {
      setSent(answer);
      return;
    }
    startTransition(async () => {
      const result = await submitRsvp({ slug, name, answer, website });
      if (result === "ok") setSent(answer);
      else setErrors({ form: result === "closed" ? t("rsvpClosed") : t("rsvpFailed") });
    });
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-[var(--g-gold)] text-[var(--g-paper)]">
          <Check aria-hidden="true" className="size-6" strokeWidth={1.75} />
        </span>
        <p className="text-2xl">{sent === "yes" ? t("thanksYes") : t("thanksNo")}</p>
        {notice ? <p className="font-sans text-xs text-[var(--g-muted)]">{notice}</p> : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6 text-left">
      {/* Honeypot, hidden from people and assistive tech */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

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
          <p id={`${id}-name-error`} role="alert" className="font-sans text-sm text-[#c2493f]">
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
          <p id={`${id}-answer-error`} role="alert" className="mt-2 font-sans text-sm text-[#c2493f]">
            {errors.answer}
          </p>
        ) : null}
      </fieldset>

      {errors.form ? (
        <p role="alert" className="text-center font-sans text-sm text-[#c2493f]">
          {errors.form}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-13 w-full rounded-full bg-[var(--g-ink)] font-sans text-[15px] font-medium text-[var(--g-paper)] transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? t("sending") : submitLabel === "short" ? t("submitShort") : t("submit")}
      </button>
      {notice ? <p className="text-center font-sans text-xs text-[var(--g-muted)]">{notice}</p> : null}
    </form>
  );
}
