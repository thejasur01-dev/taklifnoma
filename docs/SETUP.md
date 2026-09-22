# Ishga tushirish bo'yicha qo'llanma

Loyihani o'z kompyuteringizda ishga tushirish va tashqi xizmatlarni ulash uchun qadamlar.

## 1. Lokal ishga tushirish (kalitlarsiz)

```bash
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3000
```

Supabase kalitlari qo'yilmagan bo'lsa ham sayt ochiladi. Faqat kirish ishlamaydi va "Tizim hali to'liq sozlanmagan" degan xabar chiqadi.

## 2. Supabase

1. https://supabase.com da yangi loyiha yarating. Region sifatida **Frankfurt (eu-central-1)** ni tanlang: O'zbekistonga eng yaqin.
2. **Project Settings → API Keys** bo'limidan quyidagilarni `.env.local` ga yozing:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (publishable yoki eski "anon" kalit)
   - `SUPABASE_SECRET_KEY` (secret yoki eski "service_role" kalit). **Hech kimga bermang va git'ga qo'shmang.**
3. Migratsiya va seed ma'lumotlarini bazaga yuklang:
   ```bash
   npx supabase login
   npx supabase link --project-ref <PROJECT_REF>
   npm run db:push                                   # migratsiyalar
   npx supabase db push --include-seed               # 6 ta demo shablon (bir marta)
   ```
4. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (production'da o'z domeningiz)
   - Redirect URLs: `http://localhost:3000/auth/confirm`, `https://<domen>/auth/confirm`
5. **Authentication → Email Templates → Magic Link** shablonini kod ko'rsatadigan qilib o'zgartiring:
   ```html
   <h2>Kirish kodi</h2>
   <p>Kodingiz: <strong>{{ .Token }}</strong></p>
   <p>
     Yoki havolani bosing:
     <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Kirish</a>
   </p>
   ```
   Bu shablon bilan email **boshqa qurilmada** ochilsa ham ishlaydi.
6. Production'da o'z SMTP'ingizni ulang (**Authentication → SMTP**, masalan Resend yoki Brevo). Supabase'ning standart pochtasi soatiga bir necha xat bilan cheklangan.

### Admin tayinlash

Avval saytda kiring, keyin Supabase **SQL Editor**'da quyidagini bajaring:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'sizning@email.uz');
```

## 3. Telegram bot va login

1. [@BotFather](https://t.me/BotFather) → `/newbot`. So'ng `.env.local` ga yozing:
   - `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` — bot nomi, `@` belgisisiz
   - `TELEGRAM_BOT_TOKEN`
2. BotFather → `/setdomain` → saytingiz domeni.
3. Telegram Login Widget **localhost'da ishlamaydi**. Lokal test uchun tunnel oching:
   ```bash
   npx cloudflared tunnel --url http://localhost:3000
   ```
   So'ng chiqqan `https://....trycloudflare.com` manzilini `/setdomain` ga va `NEXT_PUBLIC_SITE_URL` ga qo'ying.

## 4. Tekshiruvlar

```bash
npm run check        # typecheck + lint + i18n + unit va DB (RLS) testlari
npm run test:e2e     # Playwright: desktop va 360px mobil
npm run build
```

Migratsiya o'zgarsa, `npm run db:types` ni ishga tushiring. U `src/types/database.ts` faylini qayta yaratadi.
