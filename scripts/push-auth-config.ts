/**
 * Pushes Auth settings and email templates (supabase/templates) to the linked
 * Supabase project via the Management API. Idempotent — safe to re-run.
 *
 * Usage: npm run auth:config
 * Needs in .env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SITE_URL, SUPABASE_ACCESS_TOKEN.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { BRAND } from "../src/lib/config";

process.loadEnvFile(path.resolve(__dirname, "../.env.local"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!supabaseUrl || !token) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_ACCESS_TOKEN must be set in .env.local");
}
const projectRef = new URL(supabaseUrl).hostname.split(".")[0];

const loginCode = readFileSync(path.resolve(__dirname, "../supabase/templates/login-code.html"), "utf8");
const subject = `${BRAND.name}: kirish kodi · код для входа · login code`;

const config = {
  site_url: siteUrl,
  // Extra origins (production domain, tunnels) are appended via AUTH_EXTRA_REDIRECT_URLS.
  uri_allow_list: [`${siteUrl}/**`, ...(process.env.AUTH_EXTRA_REDIRECT_URLS?.split(",") ?? [])]
    .filter(Boolean)
    .join(","),
  mailer_otp_length: 6,
  mailer_otp_exp: 900,
  // New users get the "confirmation" email, returning users the "magic link" one.
  mailer_subjects_confirmation: subject,
  mailer_templates_confirmation_content: loginCode,
  mailer_subjects_magic_link: subject,
  mailer_templates_magic_link_content: loginCode,
};

async function main() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error(`Supabase API ${res.status}: ${await res.text()}`);
  console.log(`Auth config updated for ${projectRef} (site_url=${siteUrl})`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
