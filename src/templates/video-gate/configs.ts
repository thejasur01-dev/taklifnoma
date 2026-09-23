import type { CSSProperties } from "react";
import type { SectionsStyle } from "../invitation/sections";

/**
 * "Video gate" layout: a still of a closed gate/door, a tap-to-play video that
 * opens it, then its last frame becomes the hero behind the names.
 * Each template is pure configuration (PROJECT_SPEC §6: layout × theme).
 */
export type VideoGateConfig = {
  assets: {
    /** First video frame, shown before playback (also the video poster). */
    poster: string;
    /** Last video frame, shown behind the names after playback. */
    still: string;
    video: string;
  };
  /** --g-* variables consumed by the shared sections. */
  theme: CSSProperties;
  intro: {
    /** glass: frosted pill with a ping ring; gold: breathing gold pill. */
    button: "glass" | "gold";
    showNames: boolean;
  };
  hero: {
    namesColor: string;
    countdown: boolean;
    scrollHint: boolean;
  };
  sections: SectionsStyle;
};

export const VIDEO_GATE_CONFIGS = {
  "gulli-darvoza": {
    assets: {
      poster: "/templates/gulli-darvoza/gate.webp",
      still: "/templates/gulli-darvoza/couple.webp",
      video: "/templates/gulli-darvoza/intro.mp4",
    },
    // Warm ivory and champagne gold, sampled from the gate artwork.
    theme: {
      "--g-paper": "#fbf7f0",
      "--g-card": "#fffdf9",
      "--g-ink": "#3a2e26",
      "--g-muted": "#86735f",
      "--g-gold": "#a9824a",
      "--g-line": "#e7d9c4",
      "--g-font-body": "var(--font-inv-garamond)",
      "--g-font-names": "var(--font-inv-script)",
    } as CSSProperties,
    intro: { button: "glass", showNames: true },
    hero: { namesColor: "#ffffff", countdown: true, scrollHint: false },
    sections: { closingImage: "/templates/gulli-darvoza/gate.webp" },
  },
  "samarqand-peshtoq": {
    assets: {
      poster: "/templates/samarqand-peshtoq/portal.webp",
      still: "/templates/samarqand-peshtoq/couple.webp",
      video: "/templates/samarqand-peshtoq/intro.mp4",
    },
    // Cream paper, lapis-blue ink, gold and turquoise from Samarkand tilework.
    theme: {
      "--g-paper": "#f8f0e2",
      "--g-card": "#fdf8ee",
      "--g-ink": "#1b2b4d",
      "--g-muted": "#6b6a7a",
      "--g-gold": "#b3842f",
      "--g-line": "#e6d6b8",
      "--g-frame": "#2a9d9a",
      "--g-frame-width": "2px",
      "--g-tile-a": "#1f4f94",
      "--g-tile-b": "#2a9d9a",
      "--g-closing": "#13233f",
      "--g-closing-ink": "#f3ead8",
      "--g-closing-names": "#e3bd6a",
      "--g-font-body": "var(--font-inv-garamond)",
      "--g-font-names": "var(--font-inv-script)",
    } as CSSProperties,
    intro: { button: "gold", showNames: false },
    hero: { namesColor: "#ecc774", countdown: false, scrollHint: true },
    sections: { ornament: "islimi", venueFrame: "tile", rsvpSubmit: "short" },
  },
} as const satisfies Record<string, VideoGateConfig>;

export type VideoGateSlug = keyof typeof VIDEO_GATE_CONFIGS;
