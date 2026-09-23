@AGENTS.md
@PROJECT_SPEC.md

# Loyiha holati va qarorlar (spec'dan ustun turadi)

- **Biznes modeli (2026-09-23):** 2 ta tarif: **Mustaqil 100 000** (mijoz istalgan shablonni o'zi to'ldiradi) va **Individual 500 000** (dizayner moslab beradi). Noldan dizayn xizmati **yo'q**. Spec'dagi Oddiy/Premium/VIP tariflari bekor qilingan. Narxlar `src/lib/config.ts` → `PLAN_PRICES_UZS`.
- **Kirish:** faqat **telefon raqam**, kod **Telegram Gateway** orqali keladi ("Verification Codes" chati). Email va Telegram widget olib tashlangan. Lokal ishlab chiqishda `AUTH_DEV_FIXED_CODE=1` bo'lsa `000000` kodi ishlaydi (production'da o'chiq).
- **Raqobatchi:** e-invitation.uz tahlili [docs/COMPETITOR_ANALYSIS.md](docs/COMPETITOR_ANALYSIS.md). Maqsad: undan kuchliroq bo'lish (ko'proq shablon, RSVP hamma shablonda, kirishsiz jonli demo, Telegram bildirishnomalari).
- **Dizayn tizimi:** premium-minimal. Geist shrifti, sovuq neytral ranglar va bitta aksent: **lapis ko'k `#2446a8`**. Tugmalar pill shaklida, kartalar 20px, inputlar 16px radius. Token'lar `src/app/globals.css` da. Dark mode OS sozlamasi bo'yicha. Em-dash (`—`) UI matnlarida ishlatilmaydi.
- **Shablonlar:** `src/templates/themes.ts` (tema = palitra + shriftlar) × maket (`arch`, `frame`, `minimal`). `InvitationCover` container-query bilan istalgan o'lchamda chiziladi. Sana `cover-content.ts` orqali (Intl emas, brauzerlarda uz locale yo'q).
- **Mijoz oqimi:** katalog → `/templates/[slug]` (telefon ichida jonli preview) → "Buyurtma berish" → `/create/[slug]` (kirmagan bo'lsa `/login?next=`) → qoralama yaratiladi → muharrir `/dashboard/[id]` (avtosaqlash, jonli preview) → nashr → ulashish (Telegram, WhatsApp, Instagram). Mehmon sahifasi `/i/[slug]`, RSVP server action orqali bazaga yoziladi.
- **Katalog:** `src/templates/catalog.ts` (9 ta shablon) va DB `templates` jadvali (migratsiya 0003) bir xil. Render: `src/templates/invitation/render.tsx`; umumiy bloklar `invitation/sections.tsx`.
- **To'lov hali yo'q:** nashr faqat dev rejimida "Test rejimida faollashtirish" bilan (`activateForTesting`, production'da o'chiq).
- Next.js **16**: `src/proxy.ts`, `params`/`cookies()` async.
- next-intl: `uz` prefikssiz, `ru`/`en` prefiks bilan, brauzer tilini avtomatik aniqlash o'chirilgan.
- Mehmonlar DB'ga to'g'ridan-to'g'ri kira olmaydi (server + service role). To'lov bilan bog'liq ustunlar column-level GRANT bilan himoyalangan.
- Supabase loyihasi: `vovfsyqwltbjbnqwsogt` (Seul). Docker yo'q: DB testlari va tiplar PGlite orqali.

# Buyruqlar

- `npm run check`: typecheck, lint, i18n va unit/DB testlar
- `npm run test:e2e`: Playwright (build, start, desktop va 360px)
- `npm run db:types`: migratsiyalardan `src/types/database.ts` ni qayta yaratish
- `npm run db:push`: migratsiyalarni Supabase'ga yuklash (`.env.local` ni oldin export qiling: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`)
