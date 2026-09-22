import { Inter, Playfair_Display } from "next/font/google";

export const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

export const fontHeading = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});
