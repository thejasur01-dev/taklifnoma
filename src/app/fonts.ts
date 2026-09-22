import { Forum, Geist, Great_Vibes, Lora, Tenor_Sans } from "next/font/google";

/** Site UI and marketing typography. */
export const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

/*
 * Invitation template fonts (exposed as CSS variables, used by themes).
 * Not preloaded: they are only needed where a template preview renders.
 */
export const fontScript = Great_Vibes({
  variable: "--font-inv-script",
  weight: "400",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
  preload: false,
});

export const fontClassic = Forum({
  variable: "--font-inv-classic",
  weight: "400",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
  preload: false,
});

export const fontSerif = Lora({
  variable: "--font-inv-serif",
  subsets: ["latin", "latin-ext", "cyrillic"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

export const fontModern = Tenor_Sans({
  variable: "--font-inv-modern",
  weight: "400",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
  preload: false,
});

export const fontVariables = [fontSans, fontScript, fontClassic, fontSerif, fontModern]
  .map((f) => f.variable)
  .join(" ");
