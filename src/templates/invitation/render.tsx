import { getCatalogTemplate } from "../catalog";
import { GulliDarvozaInvitation } from "../gulli-darvoza/invitation";
import { ThemedInvitation } from "./themed";
import type { InvitationProps } from "./types";

/** Picks the renderer for a catalog template. Returns null for unknown slugs. */
export function InvitationRenderer({ templateSlug, ...props }: InvitationProps & { templateSlug: string }) {
  const template = getCatalogTemplate(templateSlug);
  if (!template) return null;
  if (template.kind === "media") return <GulliDarvozaInvitation {...props} />;
  return <ThemedInvitation themeId={template.slug} layout={template.layout} {...props} />;
}
