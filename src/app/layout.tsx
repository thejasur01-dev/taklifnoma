import type { ReactNode } from "react";

/**
 * Pass-through root layout. The real <html> documents live in
 * app/[locale]/layout.tsx (site, dashboard, admin) and, from stage 2,
 * app/i/layout.tsx (guest-facing invitation pages without locale prefix).
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
