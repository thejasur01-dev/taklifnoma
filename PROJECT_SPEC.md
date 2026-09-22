# Loyiha: Onlayn taklifnoma platformasi — to'liq texnik topshiriq

> Bu hujjat Claude agent (VS Code) uchun yozilgan. Uni loyiha ildiziga `CLAUDE.md` nomi bilan qo'ying — agent har safar avtomatik o'qiydi.
> `[BREND]` — hozircha vaqtinchalik nom. Brend nomi tanlangach, hamma joyda almashtiriladi.

---

## 0. Agent uchun ish qoidalari

1. Ishni **bosqichma-bosqich** qil (9-bo'lim). Bir bosqich tugamaguncha va men tasdiqlamagunimcha keyingisiga o'tma.
2. Har bir bosqich boshida qisqa reja yoz, oxirida nima qilinganini va qanday tekshirish mumkinligini ayt.
3. Kod, o'zgaruvchi, fayl nomlari — **ingliz tilida**. Foydalanuvchiga ko'rinadigan barcha matnlar — **faqat i18n fayllarda** (kod ichida qattiq yozilgan matn bo'lmasin).
4. Noaniq joy bo'lsa — taxmin qilma, so'ra. Kichik texnik tanlovlarda o'zing qaror qil va sababini yoz.
5. TypeScript `strict` rejimda. `any` ishlatma.
6. Har bir mantiqiy qadamdan keyin git commit (ma'noli xabar bilan).
7. Maxfiy kalitlar faqat `.env.local` da. `.env.example` ni doim yangilab bor.
8. Har bir yangi funksiya uchun kamida asosiy testlar (Vitest — mantiq, Playwright — asosiy foydalanuvchi yo'llari).

---

## 1. Loyiha nima va nima uchun kerak

**Nima:** To'y, nikoh, fotiha, osh, tug'ilgan kun va boshqa marosimlar uchun **raqamli (onlayn) taklifnoma** yaratish platformasi. Foydalanuvchi shablon tanlaydi, ma'lumotlarini kiritadi, to'laydi va **shaxsiy havola** oladi. Havolani Telegram/WhatsApp orqali mehmonlarga yuboradi. Mehmon uni telefonida **animatsiyali veb-sahifa** sifatida ochadi: musiqa, kirish animatsiyasi, sana, sanagacha taymer, xarita, "kelaman / kelolmayman" javobi.

**Nima uchun kerak (bozor muammosi):**
- Qog'oz taklifnoma qimmat, chop etish va tarqatish vaqt oladi, uzoqdagi mehmonlarga yetkazib bo'lmaydi.
- Egasi kim kelishini bilmaydi — joy va ovqatni taxminan hisoblaydi.
- Mavjud raqamli yechimlar (raqobatchi: e-invitation.uz) chiroyli, lekin: shablonlar kam, to'lov va buyurtma qo'lda Telegram orqali, ishonch elementlari yo'q, muhim shartlar (muddat, havola amal qilish vaqti) yozilmagan.

**Bizning maqsad:** raqobatchidan ko'ra **ko'proq shablon**, **to'liq avtomatlashgan** (buyurtma → to'lov → havola bir necha daqiqada, odam aralashuvisiz), **shaffof** va **mehmon bilan ishlash vositalari kuchli** bo'lgan platforma.

---

## 2. Raqobatchi kamchiliklari va bizdagi yechim

| # | Raqobatchida | Bizda |
|---|---|---|
| 1 | Shablonlar kam (~8 ta) | 50+ shablon, "Tema tizimi" orqali tez ko'paytiriladi (6-bo'lim). Kategoriya, uslub, rang, narx bo'yicha filtr |
| 2 | Buyurtma faqat shaxsiy Telegram orqali, to'lov qo'lda | Saytning o'zida konstruktor + Payme/Click orqali avtomatik to'lov. To'lovdan so'ng taklifnoma darhol faollashadi |
| 3 | Ijtimoiy isbot yo'q | Haqiqiy sharhlar (faqat to'lagan mijozlardan), "X ta taklifnoma yaratildi" hisoblagichi, mijozlar ruxsati bilan real namunalar galereyasi |
| 4 | Shartlar yozilmagan (muddat, havola necha kun ishlaydi, tahrirlash) | Har bir mahsulot sahifasida aniq blok: "Havola to'ydan keyin N kun ishlaydi", "Cheksiz tahrirlash", "Tayyor bo'lish: darhol". Alohida FAQ va qaytarish siyosati |
| 5 | Narxlar mantiqi chalkash | 3 ta aniq tarif (Oddiy / Premium / VIP), "Eng ommabop" belgisi, taqqoslash jadvali |
| 6 | Server sekin (TTFB ~1,2 s) | Statik generatsiya/ISR + CDN. Taklifnoma sahifasi mobil 4G da LCP < 2 s |
| 7 | Namunani faqat ko'rish mumkin | "Jonli demo": shablonni ochib, o'z ismlaringizni yozib, darhol natijani ko'rish (ro'yxatdan o'tmasdan) |
| 8 | Mehmon bilan ishlash kuchsiz | Shaxsiy mehmon havolalari ("Hurmatli Aziz aka!"), RSVP statistika, Telegram orqali bildirishnoma, eslatmalar, tilaklar devori |
| 9 | Mayda xatolar (takrorlangan matnlar) | Har bir bosqich oxirida QA ro'yxati (10-bo'lim) |

---

## 3. Foydalanuvchi rollari

- **Mehmon (guest)** — taklifnomani ochadi, javob beradi, tilak qoldiradi. Ro'yxatdan o'tmaydi.
- **Mijoz (customer)** — taklifnoma yaratadi, to'laydi, mehmonlarni boshqaradi.
- **Admin** — shablonlar, buyurtmalar, to'lovlar, sharhlar, promo-kodlar, statistika.

---

## 4. Funksiyalar (to'liq ro'yxat)

### 4.1. Ommaviy sayt (marketing)
- Bosh sahifa: qahramon bloki, "Qanday ishlaydi" (3 qadam), mashhur shablonlar, tariflar, sharhlar, hisoblagich, FAQ, CTA.
- Shablonlar katalogi `/templates`: filtrlar (marosim turi, uslub, rang, narx, animatsiya/video bor-yo'qligi), saralash (mashhur, yangi, arzon), cheksiz yuklash.
- Shablon sahifasi `/templates/[slug]`: telefon ramkasida jonli preview, "O'z ismlaringiz bilan sinab ko'ring" maydoni, nimalar kiradi, narx, shartlar, o'xshash shablonlar.
- Tariflar `/pricing`, FAQ `/faq`, Blog `/blog` (SEO uchun), Aloqa, Maxfiylik siyosati, Foydalanish shartlari, Qaytarish siyosati.
- Tillar: **o'zbek (lotin) — asosiy**, rus, ingliz. (Keyinroq: o'zbek kirill, qozoq, tojik.)

### 4.2. Konstruktor (taklifnoma yaratish)
- Qadam-baqadam ustoz (wizard), o'ng tomonda **jonli preview** (har bir o'zgarish darhol ko'rinadi):
  1. Marosim turi va shablon (keyin ham almashtirish mumkin, ma'lumotlar saqlanadi)
  2. Asosiy ma'lumotlar: kelin va kuyov ismlari (yoki marosim egasi), ota-onalar ismlari (ixtiyoriy), matn (tayyor matnlar kutubxonasidan tanlash yoki o'zi yozish)
  3. Tadbirlar: bir taklifnomada bir nechta tadbir (masalan: nikoh, to'y, osh) — har biri uchun sana, vaqt, joy nomi, manzil, xarita nuqtasi (Yandex/Google)
  4. Media: rasmlar (galereya, 1–12 ta), musiqa (kutubxonadan yoki o'z faylini yuklash)
  5. Qo'shimcha bloklar (yoqish/o'chirish): sanagacha taymer, dress-kod, kun tartibi (timeline), RSVP, tilaklar devori, to'ydan keyin mehmonlar rasm yuklashi, sovg'a/karta ma'lumoti (ixtiyoriy)
  6. Havola: shaxsiy manzil `[BREND].uz/i/aziz-madina` (band emasligi tekshiriladi)
  7. Ko'rib chiqish → To'lov → Nashr
- Qoralama avtomatik saqlanadi. Ro'yxatdan o'tmasdan boshlash mumkin, saqlash/to'lov paytida kirish so'raladi.

### 4.3. Taklifnoma sahifasi (mehmon ko'radigan)
- Manzil: `/i/[slug]`, shaxsiy mehmon uchun `/i/[slug]/[guestCode]`.
- Kirish ekrani: "Taklifnomani ochish" tugmasi → bosilganda kirish animatsiyasi/video va musiqa boshlanadi (brauzerlar musiqani faqat bosishdan keyin ruxsat beradi).
- Bloklar shablonga qarab: ismlar, taklif matni, sana, taymer, tadbirlar, xarita va "Yo'l ko'rsatish" tugmasi (Yandex Go / Google Maps), galereya, dress-kod, RSVP formasi, tilaklar, "Kalendarga qo'shish" (.ics + Google Calendar).
- Musiqa yoqish/o'chirish tugmasi doim ko'rinadi.
- Mehmon uchun til almashtirgich (uz/ru), agar mijoz ikkala tilni to'ldirgan bo'lsa.
- Har bir taklifnoma uchun **dinamik OG rasm** (Telegramda havola yuborilganda ismlar va sana bilan chiroyli karta chiqadi).
- Sahifa `noindex` (Google'ga chiqmaydi — maxfiylik).
- Muddati tugagan taklifnoma: chiroyli "Bu marosim o'tib ketdi" sahifasi + "O'zingizga ham yarating" havolasi.

### 4.4. Mijoz kabineti `/dashboard`
- Mening taklifnomalarim (qoralama / faol / muddati tugagan).
- Tahrirlash (nashrdan keyin ham cheksiz, o'zgarish darhol havolada ko'rinadi).
- **Mehmonlar**: qo'lda qo'shish, Excel/CSV dan import, guruhlar (kuyov tomoni, kelin tomoni, hamkasblar), har biriga shaxsiy havola va QR-kod, "yuborildi" belgisi, bir bosishda Telegram/WhatsApp orqali ulashish.
- **RSVP statistika**: keladi / kelmaydi / javob bermadi, necha kishi bilan keladi, izohlar. Excel'ga eksport.
- **Analitika**: nechta ochildi, qaysi mehmon ochdi, qachon.
- **Tilaklar**: moderatsiya (yashirish/ko'rsatish).
- QR-kod yuklab olish (qog'oz taklifnomaga bosish uchun).
- To'lovlar tarixi, chek.

### 4.5. Telegram bot
- Telegram orqali kirish (Telegram Login Widget) — O'zbekistonda eng qulay.
- Mijozga bildirishnomalar: yangi RSVP javobi, yangi tilak, to'lov tasdiqlandi.
- To'ydan 1 kun oldin mijozga yakuniy statistika.
- (2-bosqich) Mehmonlarga eslatma: bot orqali javob bergan mehmonlarga to'ydan 1 kun oldin "Ertaga ko'rishamiz" xabari.

### 4.6. To'lov
- **Payme** va **Click** (merchant API). Muvaffaqiyatli to'lovdan so'ng webhook → taklifnoma `active` holatiga o'tadi.
- Promo-kodlar (foiz yoki summa, muddat, foydalanish limiti).
- MVP bosqichida to'lov integratsiyasi tayyor bo'lguncha: "qo'lda tasdiqlash" rejimi (admin paneldan bir tugma).
- Eslatma: merchant shartnoma uchun YaTT/MChJ kerak — bu parallel ravishda rasmiylashtiriladi.

### 4.7. Admin panel `/admin`
- Shablonlar: yoqish/o'chirish, narx, tartib, "yangi"/"mashhur" belgisi.
- Buyurtmalar va to'lovlar, qo'lda tasdiqlash, qaytarish.
- Foydalanuvchilar, taklifnomalar (ko'rish, bloklash).
- Sharhlar moderatsiyasi, promo-kodlar.
- Dashboard: kunlik sotuv, konversiya (konstruktorni ochdi → to'ladi), eng mashhur shablonlar.

### 4.8. Keyingi bosqich xizmatlari (hozir qilinmaydi, arxitektura tayyor bo'lsin)
- Love Story animatsion video (buyurtma formasi + namunalar + "Real rasm → animatsiya" taqqoslash).
- Stol joylashuvi (mehmonlarni stollarga taqsimlash).
- To'y onlayn efiri havolasi.
- Kelin-kuyov uchun shaxsiy domen.

---

## 5. Texnik stack

| Qism | Tanlov | Nima uchun |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | SSR/SSG/ISR, SEO, dinamik OG rasmlar, bitta loyihada front va API |
| UI | **Tailwind CSS + shadcn/ui** | Tez, izchil dizayn, kabinet va admin uchun tayyor komponentlar |
| Animatsiya | **CSS animatsiyalari + Framer Motion** (kerak joyda) | Yengil, mobilda tez ishlaydi |
| Baza, auth, fayllar | **Supabase** (Postgres, Auth, Storage, RLS) | Tez ishga tushadi, xavfsizlik qatlam darajasida (RLS) |
| Validatsiya | **Zod** + React Hook Form | Konstruktor formasi va API uchun bitta sxema |
| i18n | **next-intl** | App Router bilan yaxshi ishlaydi |
| Telegram bot | **grammY** (webhook, Next.js API route orqali) | Yengil, TypeScript |
| Rasm optimizatsiya | next/image + sharp (yuklashda WebP/AVIF ga o'girish) | Mobil tezlik |
| Hosting | **Vercel** (front) + Supabase Cloud | CDN, oddiy deploy |
| Monitoring | Sentry + Vercel Analytics | Xatolarni ushlash |
| Test | Vitest, Playwright | |

---

## 6. Shablon tizimi (eng muhim arxitektura qismi)

**G'oya:** "juda ko'p shablon"ga har birini noldan yozmasdan erishish uchun shablon = **Layout + Tema**.

- **Layout (maket)** — bloklarning tuzilishi va animatsiya mantiqi (masalan: `classic-scroll`, `envelope-open`, `gate-open`, `book-pages`, `minimal-card`). Taxminan 6–10 ta layout yoziladi.
- **Tema** — vizual qatlam: rasmlar (fon, ramka, ajratgich, bezaklar), kirish videosi, rang palitrasi, shriftlar, dekorativ animatsiyalar (barglar, kapalaklar, yulduzlar), standart musiqa.
- Bitta layout × ko'p tema = ko'p shablon. 8 layout × 8 tema = 64 ta shablon.

**Papka tuzilishi:**
```
src/templates/
  layouts/
    gate-open/
      Layout.tsx          // bloklarni tartibda chizadi
      intro.tsx           // kirish animatsiyasi
  sections/               // umumiy bloklar (hamma layoutlar ishlatadi)
    Names.tsx  Countdown.tsx  Events.tsx  Map.tsx  Gallery.tsx
    Rsvp.tsx  Wishes.tsx  DressCode.tsx  Timeline.tsx  AddToCalendar.tsx
  themes/
    manor-roses/
      theme.json          // ranglar, shriftlar, assetlar yo'li, dekor effektlari
      assets/             // webp rasmlar, intro.mp4, poster
  registry.ts             // barcha shablonlar ro'yxati: {slug, layout, theme, category, tags, price, tier}
```

**Qoidalar:**
- Barcha bloklar ranglarni faqat CSS o'zgaruvchilaridan oladi (`--color-primary`, `--font-heading`...), tema ularni belgilaydi.
- Har bir shablon bir xil `InvitationData` tipidagi ma'lumotni qabul qiladi (Zod sxema bilan). Shablon almashtirilganda mijoz ma'lumotlari yo'qolmaydi.
- `manifest`da shablon qaysi bloklarni qo'llab-quvvatlashi ko'rsatiladi; konstruktor faqat shularni ko'rsatadi.
- Yangi tema qo'shish = yangi papka + `theme.json` + assetlar + registry'ga bir qator. **Kod yozish shart emas.**
- Katalog uchun preview rasmlari va demo ma'lumotlari avtomatik (skript orqali Playwright bilan skrinshot).
- Assetlar: WebP/AVIF, eng katta rasm 1080px kenglik, video ≤ 2 MB, `poster` bilan, `preload="none"`.

---

## 7. Ma'lumotlar bazasi (Supabase / Postgres)

```
profiles        id (=auth.users.id), full_name, phone, telegram_id, telegram_username, locale, role ('customer'|'admin'), created_at

templates       id, slug (unique), layout, theme, name_i18n jsonb, category ('wedding'|'nikoh'|'fotiha'|'osh'|'birthday'|'other'),
                tags text[], tier ('basic'|'premium'|'vip'), price_uzs int, is_active bool, is_new bool, sort int, preview_url, created_at

invitations     id, owner_id → profiles, template_id → templates, slug (unique), status ('draft'|'pending_payment'|'active'|'expired'|'blocked'),
                data jsonb   -- InvitationData (ismlar, matnlar, bloklar sozlamalari, rasmlar, musiqa)
                locales text[], main_event_date date, active_until date, created_at, updated_at, published_at

events          id, invitation_id, title_i18n jsonb, starts_at timestamptz, venue_name, address, lat, lng, sort

guests          id, invitation_id, name, group_name, phone, code (unique, qisqa), max_people int, sent_at, opened_at, created_at

rsvps           id, invitation_id, guest_id (nullable — umumiy havoladan ham javob berish mumkin), name, status ('yes'|'no'|'maybe'),
                people_count int, event_ids uuid[], comment, created_at

wishes          id, invitation_id, guest_id nullable, author_name, message, is_visible bool, created_at

page_views      id, invitation_id, guest_id nullable, viewed_at, user_agent_short  -- (IP saqlanmaydi)

orders          id, user_id, invitation_id, amount_uzs, promo_code_id, status ('pending'|'paid'|'failed'|'refunded'|'manual'), provider ('payme'|'click'|'manual'),
                provider_tx_id, created_at, paid_at

promo_codes     id, code, type ('percent'|'fixed'), value, max_uses, used_count, valid_until, is_active

reviews         id, user_id, invitation_id, rating 1-5, text, is_published bool, created_at

music_tracks    id, title, artist, url, duration, category, is_active
```

**RLS qoidalari:** mijoz faqat o'z taklifnomalari/mehmonlari/rsvp'larini ko'radi; mehmon faqat `active` taklifnomani o'qiy oladi va faqat `rsvps`/`wishes` ga yoza oladi (rate limit bilan); admin hammasini ko'radi.

---

## 8. Muhim marshrutlar (routes)

```
/[locale]/                      bosh sahifa
/[locale]/templates             katalog
/[locale]/templates/[slug]      shablon sahifasi + jonli demo
/[locale]/pricing  /faq  /blog  /blog/[slug]  /legal/*
/[locale]/create/[templateSlug] konstruktor
/[locale]/dashboard             kabinet
/[locale]/dashboard/[id]        taklifnoma boshqaruvi (mehmonlar, rsvp, analitika, tilaklar)
/[locale]/admin/*               admin panel
/i/[slug]                       taklifnoma (tilsiz prefiks, qisqa havola)
/i/[slug]/[guestCode]           shaxsiy mehmon havolasi
/api/payments/payme  /api/payments/click   webhooklar
/api/telegram/webhook
/api/og/[slug]                  dinamik OG rasm
```

---

## 9. Bosqichlar (reja)

### 1-bosqich — Poydevor (≈3 kun)
- Next.js + TS + Tailwind + shadcn + next-intl + Supabase ulash, ESLint/Prettier, papka tuzilishi.
- Baza migratsiyalari (7-bo'lim), RLS, seed ma'lumotlar.
- Auth: Telegram Login + telefon/email (zaxira).
- **Tayyor bo'lganini tekshirish:** ro'yxatdan o'tish, kirish, bo'sh kabinet ishlaydi; `npm run build` xatosiz.

### 2-bosqich — Shablon dvigateli (≈5 kun)
- `InvitationData` Zod sxemasi, umumiy bloklar (sections), 2 ta layout, 3 ta tema, registry.
- `/i/[slug]` sahifasi, kirish ekrani, musiqa, taymer, xarita, kalendarga qo'shish.
- **Tekshirish:** demo ma'lumot bilan 6 ta shablon (2×3) telefonda to'g'ri ochiladi, Lighthouse mobil ≥ 90.

### 3-bosqich — Konstruktor (≈5 kun)
- Wizard, jonli preview, avtosaqlash, rasm/musiqa yuklash (siqish bilan), slug tekshiruvi, shablon almashtirish.
- **Tekshirish:** noldan taklifnoma yaratib, havolani ochish mumkin (hozircha to'lovsiz, qo'lda faollashtirish).

### 4-bosqich — RSVP, mehmonlar, kabinet (≈4 kun)
- RSVP formasi, tilaklar, mehmonlar ro'yxati, CSV/Excel import, shaxsiy havolalar, QR, statistika, eksport, analitika.
- **Tekshirish:** mehmon javobi darhol kabinetda ko'rinadi.

### 5-bosqich — To'lov va Telegram bot (≈4 kun)
- Payme, Click webhooklar, orders, promo-kodlar, qo'lda tasdiqlash rejimi.
- Bot: bildirishnomalar, kunlik/yakuniy statistika.
- **Tekshirish:** test rejimida to'lov → taklifnoma avtomatik `active`, Telegramga xabar keladi.

### 6-bosqich — Marketing sayt va SEO (≈4 kun)
- Bosh sahifa, katalog filtrlari, shablon sahifasi va jonli demo, tariflar, FAQ, huquqiy sahifalar, blog.
- Meta teglar, OG, sitemap, hreflang, JSON-LD (Organization, Product, FAQPage), dinamik OG rasmlar.
- **Tekshirish:** barcha sahifalar 3 tilda, Lighthouse SEO ≥ 95.

### 7-bosqich — Admin panel (≈3 kun)
- 4.7-bo'limdagi barcha funksiyalar.

### 8-bosqich — Shablonlarni ko'paytirish (doimiy)
- Qolgan layoutlar (jami 6–10) va temalar. Maqsad: ishga tushirishda ≥ 20 ta shablon, 3 oyda ≥ 50 ta.

### 9-bosqich — QA va ishga tushirish (≈3 kun)
- 10-bo'limdagi ro'yxat, real qurilmalarda test (arzon Android + iPhone), Sentry, zaxira nusxa.

---

## 10. Sifat talablari (har bosqich oxirida tekshiriladi)

- **Tezlik:** taklifnoma sahifasi mobil 4G da LCP < 2 s; birinchi yuklash ≤ 500 KB (video va musiqa keyin, talab bo'yicha yuklanadi).
- **Moslashuvchanlik:** 360px kenglikdan boshlab; gorizontal scroll yo'q; iOS Safari va Android Chrome'da test.
- **Musiqa** faqat foydalanuvchi bosgandan keyin chalinadi; ovozni o'chirish tugmasi doim ko'rinadi.
- **Kirish imkoniyati:** kontrast, alt matnlar, klaviatura bilan boshqarish, `prefers-reduced-motion` da animatsiyalar kamayadi.
- **Xavfsizlik:** RLS, RSVP/tilaklar uchun rate limit va oddiy spam himoyasi (honeypot), yuklanadigan fayllar turi va hajmi tekshiriladi, webhook imzolari tekshiriladi.
- **Maxfiylik:** taklifnoma sahifalari `noindex`; IP saqlanmaydi; mijoz o'z ma'lumotlarini o'chira oladi.
- **Matnlar:** hech qayerda takrorlangan yoki tarjima qilinmagan matn yo'q (i18n kalitlari to'liqligi skript bilan tekshiriladi).
- **Xatolar:** hamma formada tushunarli xato xabarlari; 404 va 500 sahifalari chiroyli.

---

## 11. Biznes shartlari (saytda ochiq yoziladi)

- Tariflar (dastlabki taklif, keyin o'zgartiriladi):
  - **Oddiy** — 99 000 so'm: asosiy bloklar, umumiy havola, RSVP.
  - **Premium** (eng ommabop) — 149 000 so'm: + shaxsiy mehmon havolalari, tilaklar, galereya, analitika, Telegram bildirishnomalar.
  - **VIP** — 249 000 so'm: + video-kirishli shablonlar, 2 til, QR dizayn, ustuvor yordam.
- Havola marosimdan keyin **90 kun** ishlaydi (uzaytirish mumkin).
- Nashrdan keyin cheksiz tahrirlash.
- To'lovdan so'ng taklifnoma darhol tayyor.
- Texnik muammo bo'lsa — pul qaytarish siyosati.

---

## 12. Birinchi vazifa

1-bosqichni boshla: loyiha skeletini yarat, stack'ni o'rnat, Supabase migratsiyalarini yoz va rejangni menga ko'rsat. Kodni yozishdan oldin papka tuzilishi va migratsiya faylini tasdiqlash uchun ko'rsat.
