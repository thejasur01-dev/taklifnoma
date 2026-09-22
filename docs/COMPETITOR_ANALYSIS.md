# e-invitation.uz — raqobatchi tahlili (2026-09-23)

Manba: saytning barcha ommaviy sahifalari, shablon preview'lari, konstruktor va kirish oynasi, JS bundle'dagi matnlar va API yo'llari. Ro'yxatdan haqiqiy telefon bilan o'tilmagan.

## 1. Umumiy ma'lumot

- Stack: Nuxt (Vue) va Cloudflare. Assetlar `assets.e-invitation.uz` da.
- Dizayn: och qaymoqrang fon `#FAF9F6`, zaytun-yashil `#526646`, to'q yashil matn `#273C32`. Shriftlar: Cormorant Garamond (sarlavhalar) va Inter (matn). Premium-minimal, "atelye" ohangida. Mobil versiyada pastki tab-bar bor: Mahsulotlar, Kabinet, Menyu, Buyurtma, Savollar.
- Sayt tillari: uz (lotin va kirill), ru, en, kz, tj, ky, tk.
- Aloqa: bitta shaxsiy Telegram (@tohirusenov), telefon va Instagram.

## 2. Sahifalar

| Sahifa                                | Mazmuni                                                                                                                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                   | Hero ("Unutilmas kuningiz taklifdan boshlanadi"), narx 150 000, 8 ta dizayn va filtr (Barchasi / Nikoh / Nahor oshi), 3 qadam, mobil mockup, 3 ta tarif, FAQ, Love Story banneri, footer |
| `/products/`                          | 8 ta dizayn, har biri 150 000 so'm. Kartochkada rasm, tavsif, "Ko'rish" va "Buyurtma berish"                                                                                             |
| `/preview/[slug]/`                    | Dizayn tavsifi, narx, "nimalar kiradi", sahifaga joylashtirilgan jonli taklifnoma, o'xshash dizaynlar                                                                                    |
| `/narxlar/`, `/order/`                | 3 ta tarif: 150k o'zingiz yaratasiz, 500k mutaxassis tayyor dizaynni moslaydi, 1M noldan dizayn                                                                                          |
| `/love-story/`                        | Animatsion video xizmati: 1 daqiqa 1,5 mln, 2 daqiqa 2 mln, 3 daqiqa 3 mln, 4 daqiqa 4 mln, keyin har daqiqa +1 mln. Buyurtma faqat Telegram orqali                                      |
| `/nega-biz/`                          | 6 ta afzallik                                                                                                                                                                            |
| `/savollar/`                          | 14 ta FAQ                                                                                                                                                                                |
| `/stats/`                             | Ochiq statistika: 126 ta sotuv (aprel–iyul 2026), 84% nikoh, dizaynlar va viloyatlar kesimida                                                                                            |
| `/blog/`                              | 4 ta SEO maqola                                                                                                                                                                          |
| `/constructor`                        | Kirishsiz ochilmaydi                                                                                                                                                                     |
| `/dashboard`                          | Kabinet (kirish talab qilinadi)                                                                                                                                                          |
| `/privacy-policy/`, `/data-deletion/` | Huquqiy sahifalar                                                                                                                                                                        |

## 3. Ro'yxatdan o'tish

- Faqat telefon raqam bilan. Kod **SMS orqali emas, Telegram'ning "Verification Codes" chatiga** keladi (Telegram Gateway API). Zaxira sifatida Telegram bot orqali kod olish mumkin.
- Shaxsiy qurilmada sessiya 30 kun saqlanadi.
- Konstruktorni ochishdan **oldin** kirish majburiy. Bu foydalanuvchi uchun to'siq: dizaynni o'z ismlari bilan sinab ko'rishdan oldin raqam so'raladi.

## 4. Konstruktor (bundle'dan olingan)

- 3 bosqich: **Marosim va uslub → Ismlar, sana, manzil → Ko'rish va saqlash**.
- Marosim turlari: nikoh, osh, qiz bazm, xatna, fotiha va boshqalar. Ismlar maydoni marosimga qarab o'zgaradi (kelin va kuyov, bolalar ismlari, mezbon oila).
- Xaritada nuqta tanlash, "hozirgi joyim" va Google/Yandex havolasini kiritish.
- Musiqa: tayyor ro'yxatdan tanlash yoki o'z faylini yuklash, boshlanish soniyasini belgilash mumkin.
- Galereya, kontaktlar, sovg'a kartasi, o'zgarishlar tarixi, viloyat tanlash.
- To'langan taklifnomaning dizaynini almashtirib bo'lmaydi.
- To'lov boshlangach ma'lumotlarni tahrirlash **bloklanadi**, tuzatish uchun yordam xizmatiga yozish kerak.

## 5. Mehmon ko'radigan taklifnoma

- Havola: `e-invitation.uz/invitations/tohir-odina`.
- Kirish ekrani: chizilgan illyustratsiya va ismlar, "Taklifnomani ochish" tugmasi, keyin musiqa.
- Bloklar: "Hurmatli mehmonimiz" (ismli havolada mehmon ismi), ismlar, taklif matni, galereya (6 ta rasm), iqtibos, kalendar, kunlar sanog'i (taymer), to'yxona (rasm, nomi, shahar), oila nomi.
- **RSVP faqat 2 ta dizaynda bor** (royal-burgundy, monochrome-editorial): ism, keladi/kelmaydi, telefon, tilak.
- Ismli mehmon havolasi kabinetda yaratiladi. Kodda "Bergan parolimizni kiriting" degan matn bor, ya'ni jarayon noqulay.

## 6. To'lov

- Payme, Click, Octo, Uzum va kartaga o'tkazma. O'tkazma cheki operator tomonidan qo'lda tekshiriladi.

## 7. Kuchli tomonlari (o'rganamiz)

1. Premium, tinch vizual uslub va sifatli illyustratsiyali temalar.
2. Telegram orqali telefon tasdiqlash: arzon va O'zbekistonda qulay.
3. "Avval ko'ring, keyin to'lang".
4. Nashrdan keyin tahrirlash bepul.
5. 8 til.
6. Ochiq statistika sahifasi (ishonch uyg'otadi).
7. SEO: blog, FAQ, sahifa title'lari.

## 8. Zaif tomonlari (bizning imkoniyatlarimiz)

| #   | Raqobatchida                                           | Bizda                                                                                                               |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 1   | Atigi 8 ta dizayn, filtrda 2 ta kategoriya             | Layout × tema tizimi: boshlanishida 20+, keyinroq 50+ shablon. Marosim, uslub va rang bo'yicha filtr                |
| 2   | Dizaynni sinashdan oldin kirish majburiy               | Kirishsiz jonli demo: o'z ismlaringizni yozib darhol ko'rasiz. Telefon faqat saqlash yoki to'lov paytida so'raladi  |
| 3   | RSVP faqat 2 ta dizaynda                               | RSVP, tilaklar devori va "kalendarga qo'shish" **barcha** shablonlarda                                              |
| 4   | Javoblar statistikasi yo'q                             | Kabinetda keladi / kelmaydi / javob bermagan, kishilar soni, Excel eksport, real vaqt                               |
| 5   | Mijozga javob kelganini bildirish yo'q                 | Telegram bot orqali har bir RSVP va tilak haqida xabar, to'ydan 1 kun oldin yakuniy hisobot                         |
| 6   | Ismli havola jarayoni noqulay (parol)                  | Mehmonlar ro'yxati, CSV/Excel import, guruhlar, bir bosishda Telegram/WhatsApp orqali yuborish, QR, "ochdi" belgisi |
| 7   | To'lov boshlangach tahrirlash bloklanadi               | Istalgan paytda tahrirlash, o'zgarish darhol havolada ko'rinadi                                                     |
| 8   | Kartaga o'tkazmani operator qo'lda tekshiradi          | Payme/Click avtomatik, taklifnoma bir necha soniyada faollashadi                                                    |
| 9   | Kod ichidagi manzil `/invitations/slug`                | Qisqa manzil `/i/slug` va shaxsiy `/i/slug/mehmon`                                                                  |
| 10  | Butun biznes bitta shaxsiy Telegram akkauntiga bog'liq | Bot, yordam chati va buyurtmalar paneli                                                                             |
| 11  | Havola ochilganda OG rasm oddiy                        | Har bir taklifnoma uchun dinamik OG rasm: ismlar va sana chiroyli kartada                                           |
