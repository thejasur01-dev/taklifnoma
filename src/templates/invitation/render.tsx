import { getCatalogTemplate } from "../catalog";
import { VIDEO_GATE_CONFIGS } from "../video-gate/configs";
import { VideoGateInvitation } from "../video-gate/invitation";
import { ThemedInvitation } from "./themed";
import type { InvitationProps } from "./types";

/** Picks the renderer for a catalog template. Returns null for unknown slugs. */
export function InvitationRenderer({ templateSlug, ...props }: InvitationProps & { templateSlug: string }) {
  const template = getCatalogTemplate(templateSlug);
  if (!template) return null;
  if (template.kind === "media") {
    return <VideoGateInvitation config={VIDEO_GATE_CONFIGS[template.slug]} {...props} />;
  }
  return <ThemedInvitation themeId={template.slug} layout={template.layout} {...props} />;
}
