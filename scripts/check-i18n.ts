/**
 * Verifies translation files (PROJECT_SPEC §10 "Matnlar"):
 *  - every locale has exactly the same keys as the primary locale (uz);
 *  - no empty values;
 *  - ICU placeholders ({name}) match across locales;
 *  - a ru/en value identical to uz is reported as untranslated unless allow-listed.
 *
 * Usage: npm run i18n:check
 */
import { readFileSync } from "node:fs";
import path from "node:path";

type Messages = { [key: string]: string | Messages };

const PRIMARY = "uz";
const LOCALES = ["uz", "ru", "en"] as const;
/** Keys whose value is legitimately the same in every language. */
const ALLOW_IDENTICAL = [/^localeSwitcher\.(uz|ru|en)$/, /\.codePlaceholder$/];

function flatten(obj: Messages, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out.set(full, value);
    else for (const [k, v] of flatten(value, full)) out.set(k, v);
  }
  return out;
}

const placeholders = (s: string) =>
  [...s.matchAll(/\{(\w+)/g)]
    .map((m) => m[1])
    .sort()
    .join(",");

const load = (locale: string) =>
  flatten(
    JSON.parse(readFileSync(path.resolve(__dirname, `../messages/${locale}.json`), "utf8")) as Messages,
  );

const primary = load(PRIMARY);
const errors: string[] = [];

for (const locale of LOCALES) {
  const messages = locale === PRIMARY ? primary : load(locale);
  for (const [key, value] of messages) {
    if (!value.trim()) errors.push(`[${locale}] empty value: ${key}`);
    if (!primary.has(key)) errors.push(`[${locale}] extra key not in ${PRIMARY}: ${key}`);
  }
  if (locale === PRIMARY) continue;
  for (const [key, value] of primary) {
    const translated = messages.get(key);
    if (translated === undefined) {
      errors.push(`[${locale}] missing key: ${key}`);
      continue;
    }
    if (placeholders(translated) !== placeholders(value)) {
      errors.push(`[${locale}] placeholder mismatch: ${key}`);
    }
    if (translated === value && !ALLOW_IDENTICAL.some((re) => re.test(key))) {
      errors.push(`[${locale}] untranslated (same as ${PRIMARY}): ${key}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`i18n check failed (${errors.length}):\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log(`i18n OK: ${primary.size} keys × ${LOCALES.length} locales`);
