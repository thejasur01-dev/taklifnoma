"use client";

import { ArrowLeft, Check, ExternalLink, Loader2, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useId, useRef, useState, useTransition } from "react";
import { PhonePreview } from "@/components/phone-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/navigation";
import { activateForTesting, type SaveResult, saveInvitation } from "@/lib/invitations/actions";
import { invitationUrl } from "@/lib/invitations/share";
import { isValidSlug, slugFromNames } from "@/lib/invitations/slug";
import { cn } from "@/lib/utils";
import type { Enums } from "@/types/database";
import { type CalendarNames, formatCoverDate } from "@/templates/cover-content";
import { InvitationRenderer } from "@/templates/invitation/render";
import { type InvitationData, invitationDataSchema } from "@/templates/schema";
import { SharePanel } from "./share-panel";

type Status = Enums<"invitation_status">;
type SaveState = "idle" | "saving" | "saved" | Exclude<SaveResult, { ok: true }>["error"];

type Props = {
  id: string;
  templateSlug: string;
  templateName: string;
  initialData: InvitationData;
  initialSlug: string;
  status: Status;
  siteUrl: string;
  devMode: boolean;
  calendar: CalendarNames;
  priceLabel: string;
};

const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;
const AUTOSAVE_DELAY_MS = 900;

/** ISO with offset → "YYYY-MM-DDTHH:mm" in Tashkent time, for <input type="datetime-local">. */
function toLocalInput(iso: string): string {
  return new Date(new Date(iso).getTime() + TASHKENT_OFFSET_MS).toISOString().slice(0, 16);
}

function fromLocalInput(value: string): string {
  return `${value}:00+05:00`;
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function InvitationEditor(props: Props) {
  const t = useTranslations("editor");
  const statusT = useTranslations("dashboard.status");
  const router = useRouter();
  const uid = useId();
  const [data, setData] = useState(props.initialData);
  const [slug, setSlug] = useState(props.initialSlug);
  const [status, setStatus] = useState(props.status);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [activating, startActivating] = useTransition();
  const [savedSlug, setSavedSlug] = useState(props.initialSlug);
  const saveTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(saveTimer.current), []);

  const validation = invitationDataSchema.safeParse(data);
  const fieldErrors = new Set(validation.success ? [] : validation.error.issues.map((i) => i.path.join(".")));
  const slugOk = isValidSlug(slug);

  /** Debounced autosave, triggered by edits. Only valid content is sent. */
  function scheduleSave(nextData: InvitationData, nextSlug: string) {
    window.clearTimeout(saveTimer.current);
    const parsed = invitationDataSchema.safeParse(nextData);
    if (!parsed.success || !isValidSlug(nextSlug)) {
      setSaveState("idle");
      return;
    }
    setSaveState("saving");
    saveTimer.current = window.setTimeout(async () => {
      const result = await saveInvitation({ id: props.id, slug: nextSlug, data: parsed.data });
      setSaveState(result.ok ? "saved" : result.error);
      if (result.ok) setSavedSlug(nextSlug);
    }, AUTOSAVE_DELAY_MS);
  }

  function update(next: InvitationData) {
    setData(next);
    scheduleSave(next, slug);
  }

  function updateSlug(next: string) {
    setSlug(next);
    scheduleSave(data, next);
  }

  const set = (patch: Partial<InvitationData>) => update({ ...data, ...patch });
  const setHosts = (patch: Partial<InvitationData["hosts"]>) =>
    update({ ...data, hosts: { ...data.hosts, ...patch } });
  const setEvent = (patch: Partial<InvitationData["event"]>) =>
    update({ ...data, event: { ...data.event, ...patch } });

  const err = (path: string, message = t("required")) => (fieldErrors.has(path) ? message : undefined);
  const aria = (id: string, path: string) =>
    fieldErrors.has(path) ? { "aria-invalid": true, "aria-describedby": `${id}-error` } : {};

  const url = invitationUrl(props.siteUrl, savedSlug);
  const { weekday, day, month, year, time } = formatCoverDate(new Date(data.event.startsAt), props.calendar);

  const slugError = !slugOk
    ? t("slugInvalid")
    : saveState === "slugTaken"
      ? t("slugTaken")
      : saveState === "slugReserved"
        ? t("slugReserved")
        : undefined;

  function activate() {
    startActivating(async () => {
      const result = await activateForTesting(props.id);
      if (result.ok) {
        setStatus("active");
        router.refresh();
      }
    });
  }

  const saveIndicator =
    saveState === "saving" ? (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
        {t("saving")}
      </span>
    ) : saveState === "saved" ? (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Check aria-hidden="true" className="size-3.5" />
        {t("saved")}
      </span>
    ) : saveState !== "idle" ? (
      <span className="inline-flex items-center gap-1.5 text-destructive">
        <TriangleAlert aria-hidden="true" className="size-3.5" />
        {t("saveFailed")}
      </span>
    ) : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-24 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon-sm" aria-label={t("back")}>
            <Link href="/dashboard">
              <ArrowLeft strokeWidth={1.75} />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{props.templateName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm" aria-live="polite">
          {saveIndicator}
          <Badge variant={status === "active" ? "default" : "secondary"}>{statusT(status)}</Badge>
        </div>
      </div>

      <div role="tablist" className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-secondary p-1 lg:hidden">
        {(["edit", "preview"] as const).map((key) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "h-10 rounded-full text-sm font-medium transition-colors",
              tab === key ? "bg-card shadow-sm" : "text-muted-foreground",
            )}
          >
            {key === "edit" ? t("tabEdit") : t("tabPreview")}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
        <form
          className={cn("grid gap-5", tab === "preview" && "hidden lg:grid")}
          onSubmit={(e) => e.preventDefault()}
          noValidate
        >
          <Card title={t("namesTitle")}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id={`${uid}-first`} label={t("first")} error={err("hosts.first")}>
                <Input
                  id={`${uid}-first`}
                  value={data.hosts.first}
                  maxLength={40}
                  onChange={(e) => setHosts({ first: e.target.value })}
                  {...aria(`${uid}-first`, "hosts.first")}
                />
              </Field>
              <Field id={`${uid}-second`} label={t("second")} error={err("hosts.second")}>
                <Input
                  id={`${uid}-second`}
                  value={data.hosts.second}
                  maxLength={40}
                  onChange={(e) => setHosts({ second: e.target.value })}
                  {...aria(`${uid}-second`, "hosts.second")}
                />
              </Field>
            </div>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={data.showBismillah}
                onChange={(e) => set({ showBismillah: e.target.checked })}
                className="size-5 accent-[var(--primary)]"
              />
              {t("bismillah")}
            </label>
          </Card>

          <Card title={t("textTitle")}>
            <Field id={`${uid}-message`} label={t("message")}>
              <textarea
                id={`${uid}-message`}
                value={data.message}
                maxLength={600}
                rows={4}
                onChange={(e) => set({ message: e.target.value })}
                className="w-full rounded-md border border-input bg-card px-4 py-3 text-base leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
              />
            </Field>
            <Field id={`${uid}-families`} label={t("families")} hint={t("familiesHint")}>
              <Input
                id={`${uid}-families`}
                value={data.families}
                maxLength={160}
                onChange={(e) => set({ families: e.target.value })}
                aria-describedby={`${uid}-families-hint`}
              />
            </Field>
          </Card>

          <Card title={t("eventTitle")}>
            <Field id={`${uid}-date`} label={t("date")}>
              <Input
                id={`${uid}-date`}
                type="datetime-local"
                value={toLocalInput(data.event.startsAt)}
                onChange={(e) => e.target.value && setEvent({ startsAt: fromLocalInput(e.target.value) })}
              />
            </Field>
            <Field id={`${uid}-venue`} label={t("venueName")} error={err("event.venueName")}>
              <Input
                id={`${uid}-venue`}
                value={data.event.venueName}
                maxLength={120}
                onChange={(e) => setEvent({ venueName: e.target.value })}
                {...aria(`${uid}-venue`, "event.venueName")}
              />
            </Field>
            <Field id={`${uid}-address`} label={t("address")}>
              <Input
                id={`${uid}-address`}
                value={data.event.address}
                maxLength={240}
                onChange={(e) => setEvent({ address: e.target.value })}
              />
            </Field>
            <Field
              id={`${uid}-map`}
              label={t("mapUrl")}
              hint={t("mapHint")}
              error={err("event.mapUrl", t("invalidUrl"))}
            >
              <Input
                id={`${uid}-map`}
                type="url"
                inputMode="url"
                value={data.event.mapUrl ?? ""}
                onChange={(e) => setEvent({ mapUrl: e.target.value.trim() || undefined })}
                {...(fieldErrors.has("event.mapUrl")
                  ? { "aria-invalid": true, "aria-describedby": `${uid}-map-error` }
                  : { "aria-describedby": `${uid}-map-hint` })}
              />
            </Field>
          </Card>

          <Card title={t("linkTitle")}>
            <Field id={`${uid}-slug`} label={t("slug")} hint={t("slugHint")} error={slugError}>
              <div className="flex items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center rounded-md border border-input bg-card pl-4 focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/15">
                  <span className="shrink-0 text-sm text-muted-foreground">/i/</span>
                  <input
                    id={`${uid}-slug`}
                    value={slug}
                    maxLength={40}
                    autoCapitalize="none"
                    spellCheck={false}
                    onChange={(e) => updateSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    aria-invalid={Boolean(slugError)}
                    aria-describedby={slugError ? `${uid}-slug-error` : `${uid}-slug-hint`}
                    className="h-12 min-w-0 flex-1 bg-transparent pr-4 text-base outline-none"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12"
                  onClick={() => {
                    const suggestion = slugFromNames(data.hosts.first, data.hosts.second);
                    if (suggestion) updateSlug(suggestion);
                  }}
                >
                  {t("slugFromNames")}
                </Button>
              </div>
            </Field>
          </Card>

          <section className="rounded-2xl border bg-card p-5 sm:p-6">
            {status === "active" ? (
              <SharePanel url={url} />
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">{t("publishTitle")}</h2>
                  <p className="mt-1 text-sm text-pretty text-muted-foreground">{t("publishText")}</p>
                </div>
                <p className="text-2xl font-semibold tracking-tight tabular-nums">{props.priceLabel}</p>
                <p className="rounded-xl bg-accent px-4 py-3 text-sm text-accent-foreground">
                  {t("payNote")}
                </p>
                <div className="flex flex-wrap gap-3">
                  {props.devMode ? (
                    <Button type="button" onClick={activate} disabled={activating || !validation.success}>
                      {activating ? <Loader2 className="animate-spin" /> : null}
                      {t("devActivate")}
                    </Button>
                  ) : null}
                  <Button asChild variant="outline">
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink aria-hidden="true" strokeWidth={1.75} />
                      {t("previewDraft")}
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </section>
        </form>

        <div className={cn("lg:sticky lg:top-24 lg:self-start", tab === "edit" && "hidden lg:block")}>
          <div className="mx-auto max-w-[360px]">
            <PhonePreview label={t("tabPreview")} screenHeight={680}>
              <InvitationRenderer
                templateSlug={props.templateSlug}
                data={validation.success ? validation.data : data}
                date={{ weekday, day, month, year, time }}
                mode="preview"
                embedded
                initiallyOpen
              />
            </PhonePreview>
          </div>
        </div>
      </div>
    </div>
  );
}
