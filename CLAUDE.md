@AGENTS.md
@PROJECT_SPEC.md

# Loyiha holati va qarorlar

- Bosqich: **1 — Poydevor** tugallandi (2026-09-23). Keyingisi: 2-bosqich — shablon dvigateli.
- Next.js **16** (spec'da 15 edi; 16 — joriy barqaror). `middleware.ts` → `src/proxy.ts`, `params`/`cookies()` async.
- next-intl: `uz` prefikssiz (`as-needed`), `ru`/`en` prefiks bilan; brauzer tilini avtomatik aniqlash **o'chirilgan** (asosiy auditoriya — o'zbek).
- Supabase: publishable/secret kalitlar (`.env.example`). Kalitlarsiz ham ilova build bo'ladi va ishlaydi (auth "sozlanmagan" xabarini beradi).
- Mehmonlar DB'ga to'g'ridan-to'g'ri kira olmaydi: `/i/*` o'qish va RSVP/tilak yozish faqat server (service role) orqali, rate limit + honeypot bilan.
- To'lov bilan bog'liq ustunlar (`invitations.status/active_until/published_at`, `profiles.role`) faqat service role orqali o'zgaradi — column-level GRANT bilan himoyalangan, testlarda tekshirilgan.
- Auth: Telegram Login Widget (`/api/auth/telegram`) + email OTP kodi (zaxira). Telefon SMS — keyinroq (Eskiz, Supabase SMS hook).
- Docker yo'q: DB testlari va tip generatsiyasi **PGlite** orqali (`tests/db/harness.ts`).

# Buyruqlar

- `npm run check` — typecheck + lint + i18n + unit/DB testlar
- `npm run test:e2e` — Playwright (build + start, desktop va 360px)
- `npm run db:types` — `src/types/database.ts` ni migratsiyalardan qayta generatsiya qilish (migratsiya o'zgarganda majburiy)
- `npm run db:push` — migratsiyalarni ulangan Supabase loyihasiga qo'llash
