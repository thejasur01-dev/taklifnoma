# Ishga tushirish bo'yicha qo'llanma

## 1. Lokal ishga tushirish

```bash
npm install
cp .env.example .env.local   # kalitlarni to'ldiring
npm run dev                  # http://localhost:3000
```

Lokal sinovda `.env.local` ichida `AUTH_DEV_FIXED_CODE=1` qo'yilsa, kirishda istalgan raqam bilan **`000000`** kodi ishlaydi. Bu rejim production'da avtomatik o'chiq.

## 2. Supabase

1. `.env.local` ga quyidagilarni yozing:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://<ref>.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable kalit
   - `SUPABASE_SECRET_KEY`: secret kalit
   - `SUPABASE_ACCESS_TOKEN`: Account → Access Tokens'dan olinadigan token
   - `SUPABASE_DB_PASSWORD`: loyiha bazasining paroli
2. Migratsiyalarni yuklang (Git Bash):
   ```bash
   set -a; . <(tr -d '\r' < .env.local); set +a
   npx supabase link --project-ref <ref>
   npm run db:push
   npx supabase db push --include-seed   # demo shablonlar, faqat bir marta
   ```

### Admin tayinlash

Avval saytga telefon raqamingiz bilan kiring. Keyin Supabase **SQL Editor**'da quyidagini bajaring:

```sql
update public.profiles set role = 'admin' where phone = '+998XXXXXXXXX';
```

## 3. Telegram Gateway (kirish kodlari)

1. https://gateway.telegram.org saytiga Telegram hisobingiz bilan kiring.
2. **API** bo'limidan tokenni oling va `.env.local` ga `TELEGRAM_GATEWAY_TOKEN=` qatoriga yozing.
3. Balansni to'ldiring. Har bir kod taxminan $0.01 turadi. O'z raqamingizga yuborilgan kodlar bepul, shuning uchun sinov xarajatsiz.
4. Haqiqiy kodlarni sinash uchun `AUTH_DEV_FIXED_CODE` ni bo'sh qoldiring.

## 4. Tekshiruvlar

```bash
npm run check
npm run test:e2e
npm run build
```
