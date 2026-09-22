"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type EmailLoginState, sendEmailCode, verifyEmailCode } from "./actions";

const initialState: EmailLoginState = { step: "email" };

export function EmailLoginForm() {
  const t = useTranslations("auth");
  const [sendState, sendAction, sending] = useActionState(sendEmailCode, initialState);
  const [verifyState, verifyAction, verifying] = useActionState(verifyEmailCode, initialState);
  const [editingEmail, setEditingEmail] = useState(false);

  const codeStep = sendState.step === "code" && !editingEmail;

  if (!codeStep) {
    return (
      <form
        action={(formData) => {
          setEditingEmail(false);
          sendAction(formData);
        }}
        className="space-y-3"
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("emailLabel")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            defaultValue={sendState.email}
            placeholder={t("emailPlaceholder")}
            aria-invalid={Boolean(sendState.error)}
            aria-describedby={sendState.error ? "email-error" : undefined}
            className="h-11"
          />
          {sendState.error && (
            <p id="email-error" role="alert" className="text-sm text-destructive">
              {t(`errors.${sendState.error}`)}
            </p>
          )}
        </div>
        <Button type="submit" className="h-11 w-full" disabled={sending}>
          {sending ? t("sending") : t("sendCode")}
        </Button>
      </form>
    );
  }

  const error = verifyState.error;
  return (
    <form action={verifyAction} className="space-y-3" noValidate>
      <p className="text-sm text-muted-foreground" role="status">
        {t("codeSent", { email: sendState.email ?? "" })}
      </p>
      <input type="hidden" name="email" value={sendState.email ?? ""} />
      <div className="space-y-1.5">
        <Label htmlFor="code">{t("codeLabel")}</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={10}
          required
          autoFocus
          placeholder={t("codePlaceholder")}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "code-error" : undefined}
          className="h-11 text-center text-lg tracking-[0.3em]"
        />
        {error && (
          <p id="code-error" role="alert" className="text-sm text-destructive">
            {t(`errors.${error}`)}
          </p>
        )}
      </div>
      <Button type="submit" className="h-11 w-full" disabled={verifying}>
        {verifying ? t("verifying") : t("verify")}
      </Button>
      <Button type="button" variant="link" className="w-full" onClick={() => setEditingEmail(true)}>
        {t("changeEmail")}
      </Button>
    </form>
  );
}
