/**
 * Visual themes for invitations. A template = layout × theme (PROJECT_SPEC §6).
 * Adding a theme is data-only: every component reads colors and fonts from
 * the CSS variables produced by `themeStyle()`.
 */
export type ThemeFont = "script" | "classic" | "serif" | "modern";

export type Theme = {
  id: string;
  palette: {
    paper: string;
    /** Second paper tone for the subtle gradient. */
    paperEdge: string;
    ink: string;
    muted: string;
    accent: string;
    line: string;
  };
  fonts: { names: ThemeFont; body: ThemeFont };
};

export type LayoutId = "arch" | "frame" | "minimal";

export const THEMES = [
  {
    id: "lojuvard",
    palette: {
      paper: "#f7f8fc",
      paperEdge: "#e6ebf8",
      ink: "#1b2a5e",
      muted: "#5a6a9a",
      accent: "#2f4db0",
      line: "#a9b8e3",
    },
    fonts: { names: "script", body: "classic" },
  },
  {
    id: "oq-atlas",
    palette: {
      paper: "#fbfbf8",
      paperEdge: "#efeee8",
      ink: "#2a2a28",
      muted: "#77766f",
      accent: "#8c8a7e",
      line: "#d5d3c8",
    },
    fonts: { names: "serif", body: "modern" },
  },
  {
    id: "anor",
    palette: {
      paper: "#fcf6f5",
      paperEdge: "#f4e2df",
      ink: "#561525",
      muted: "#8c5360",
      accent: "#a3263a",
      line: "#e2b3b9",
    },
    fonts: { names: "script", body: "serif" },
  },
  {
    id: "zumrad-tun",
    palette: {
      paper: "#10291f",
      paperEdge: "#0a1c15",
      ink: "#efe8d4",
      muted: "#b6b09a",
      accent: "#cdb068",
      line: "#5d6b4c",
    },
    fonts: { names: "classic", body: "classic" },
  },
  {
    id: "kumush",
    palette: {
      paper: "#f3f3f4",
      paperEdge: "#e2e3e6",
      ink: "#18191c",
      muted: "#6c6e75",
      accent: "#3c3e44",
      line: "#c3c5cb",
    },
    fonts: { names: "modern", body: "modern" },
  },
  {
    id: "lola",
    palette: {
      paper: "#fff7f4",
      paperEdge: "#fbe6df",
      ink: "#6a3434",
      muted: "#9b6b66",
      accent: "#c9706c",
      line: "#efc2b8",
    },
    fonts: { names: "serif", body: "serif" },
  },
  {
    id: "tungi-osmon",
    palette: {
      paper: "#141c38",
      paperEdge: "#0b1024",
      ink: "#e9edf9",
      muted: "#a3acd0",
      accent: "#c2cdf5",
      line: "#3d4a7d",
    },
    fonts: { names: "script", body: "modern" },
  },
  {
    id: "sahro",
    palette: {
      paper: "#f6eee2",
      paperEdge: "#ead9c1",
      ink: "#47362a",
      muted: "#86705c",
      accent: "#a8703f",
      line: "#d8bf9e",
    },
    fonts: { names: "classic", body: "serif" },
  },
] as const satisfies readonly Theme[];

export type ThemeId = (typeof THEMES)[number]["id"];

const FONT_VARS: Record<ThemeFont, string> = {
  script: "var(--font-inv-script)",
  classic: "var(--font-inv-classic)",
  serif: "var(--font-inv-serif)",
  modern: "var(--font-inv-modern)",
};

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** CSS custom properties consumed by invitation components. */
export function themeStyle(theme: Theme): Record<`--${string}`, string> {
  return {
    "--inv-paper": theme.palette.paper,
    "--inv-paper-edge": theme.palette.paperEdge,
    "--inv-ink": theme.palette.ink,
    "--inv-muted": theme.palette.muted,
    "--inv-accent": theme.palette.accent,
    "--inv-line": theme.palette.line,
    "--inv-font-names": FONT_VARS[theme.fonts.names],
    "--inv-font-body": FONT_VARS[theme.fonts.body],
  };
}
