/**
 * Phone numbers are stored in E.164 ("+998901234567"). Uzbekistan is the
 * default country: a bare 9-digit local number gets the +998 prefix.
 */
const UZ_COUNTRY_CODE = "998";

export function normalizePhone(input: string): string | null {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  let e164Digits: string;
  if (trimmed.startsWith("+")) e164Digits = digits;
  else if (digits.length === 9) e164Digits = UZ_COUNTRY_CODE + digits;
  else if (digits.startsWith(UZ_COUNTRY_CODE) && digits.length === 12) e164Digits = digits;
  else return null;

  if (e164Digits.startsWith(UZ_COUNTRY_CODE) && e164Digits.length !== 12) return null;
  if (e164Digits.length < 10 || e164Digits.length > 15) return null;
  return `+${e164Digits}`;
}

/** "+998901234567" → "+998 90 123 45 67" (other countries are returned as-is). */
export function formatPhone(e164: string): string {
  const m = /^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(e164);
  return m ? `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : e164;
}

/** Stable synthetic auth email for phone-only accounts (never mailed). */
export function phoneSyntheticEmail(e164: string): string {
  return `p${e164.slice(1)}@phone.local`;
}
