"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPhone } from "@/lib/auth/phone";
import { CODE_RESEND_INTERVAL_SECONDS } from "@/lib/auth/rate-limit";
import { type PhoneLoginState, requestPhoneCode, verifyPhoneCode } from "./actions";

const initialState: PhoneLoginState = { step: "phone" };

function useCountdown(deadline: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!deadline) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [deadline]);
  return deadline ? Math.max(0, Math.ceil((deadline - now) / 1000)) : 0;
}

function ErrorText({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {children}
    </p>
  );
}

function CodeStep({
  phone,
  sendState,
  resendAction,
  resending,
  onChangePhone,
  devMode,
}: {
  phone: string;
  sendState: PhoneLoginState;
  resendAction: (formData: FormData) => void;
  resending: boolean;
  onChangePhone: () => void;
  devMode: boolean;
}) {
  const t = useTranslations("auth");
  const [verifyState, verifyAction, verifying] = useActionState(verifyPhoneCode, { step: "code", phone });
  const formRef = useRef<HTMLFormElement>(null);

  const [deadline] = useState(
    () => Date.now() + (sendState.retryAfterSeconds ?? CODE_RESEND_INTERVAL_SECONDS) * 1000,
  );
  const secondsLeft = useCountdown(deadline);
  const error = verifyState.error ?? sendState.error;

  return (
    <div className="space-y-5">
      <p className="text-pretty text-muted-foreground" role="status">
        {t("codeSent", { phone: formatPhone(phone) })}
      </p>
      {devMode ? (
        <p className="rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">{t("devHint")}</p>
      ) : null}

      <form ref={formRef} action={verifyAction} className="space-y-4" noValidate>
        <input type="hidden" name="phone" value={phone} />
        <div className="grid gap-2">
          <Label htmlFor="code">{t("codeLabel")}</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoFocus
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "code-error" : undefined}
            className="h-14 text-center text-2xl tracking-[0.5em] tabular-nums"
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              if (digits !== e.target.value) e.target.value = digits;
              if (digits.length === 6 && !verifying) formRef.current?.requestSubmit();
            }}
          />
          {error ? <ErrorText id="code-error">{t(`errors.${error}`)}</ErrorText> : null}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={verifying}>
          {verifying ? t("verifying") : t("verify")}
        </Button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <Button type="button" variant="link" className="h-auto px-0" onClick={onChangePhone}>
          {t("changePhone")}
        </Button>
        <form action={resendAction}>
          <input type="hidden" name="phone" value={phone} />
          <Button
            type="submit"
            variant="link"
            className="h-auto px-0"
            disabled={secondsLeft > 0 || resending}
          >
            {secondsLeft > 0 ? t("resendIn", { seconds: secondsLeft }) : t("resend")}
          </Button>
        </form>
      </div>
    </div>
  );
}

export function PhoneLoginForm({ devMode }: { devMode: boolean }) {
  const t = useTranslations("auth");
  const [sendState, sendAction, sending] = useActionState(requestPhoneCode, initialState);
  const [editing, setEditing] = useState(false);

  if (sendState.step === "code" && sendState.phone && !editing) {
    return (
      <CodeStep
        key={`${sendState.sentCount ?? 0}-${sendState.retryAfterSeconds ?? 0}`}
        phone={sendState.phone}
        sendState={sendState}
        resendAction={sendAction}
        resending={sending}
        onChangePhone={() => setEditing(true)}
        devMode={devMode}
      />
    );
  }

  const error = sendState.error;
  return (
    <form
      action={(formData) => {
        setEditing(false);
        sendAction(formData);
      }}
      className="space-y-4"
      noValidate
    >
      <div className="grid gap-2">
        <Label htmlFor="phone">{t("phoneLabel")}</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          autoFocus
          defaultValue={sendState.phone ? formatPhone(sendState.phone) : "+998 "}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "phone-error phone-hint" : "phone-hint"}
          className="h-14 text-lg tabular-nums"
        />
        {error ? <ErrorText id="phone-error">{t(`errors.${error}`)}</ErrorText> : null}
        <p id="phone-hint" className="text-sm text-pretty text-muted-foreground">
          {t("phoneHint")}
        </p>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={sending}>
        {sending ? t("sending") : t("sendCode")}
      </Button>
    </form>
  );
}
