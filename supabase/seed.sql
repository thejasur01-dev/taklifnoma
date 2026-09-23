-- Development seed: 2 layouts × 3 themes = 6 demo templates (stage 2 target).
-- Every ready-made template costs the standard plan price (see src/lib/config.ts).

insert into public.templates (slug, layout, theme, name_i18n, category, tags, price_uzs, is_new, sort) values
  ('classic-manor-roses',    'classic-scroll', 'manor-roses',
    '{"uz": "Klassik · Atirgul bog''i", "ru": "Классика · Розовый сад", "en": "Classic · Rose Manor"}',
    'wedding', '{floral,classic,pink}', 100000, true, 10),
  ('classic-emerald-night',  'classic-scroll', 'emerald-night',
    '{"uz": "Klassik · Zumrad oqshom", "ru": "Классика · Изумрудный вечер", "en": "Classic · Emerald Night"}',
    'wedding', '{elegant,dark,green}', 100000, false, 20),
  ('classic-ivory-minimal',  'classic-scroll', 'ivory-minimal',
    '{"uz": "Klassik · Fil suyagi", "ru": "Классика · Слоновая кость", "en": "Classic · Ivory Minimal"}',
    'nikoh', '{minimal,light}', 100000, false, 30),
  ('envelope-manor-roses',   'envelope-open',  'manor-roses',
    '{"uz": "Konvert · Atirgul bog''i", "ru": "Конверт · Розовый сад", "en": "Envelope · Rose Manor"}',
    'wedding', '{floral,envelope,pink,animated}', 100000, true, 40),
  ('envelope-emerald-night', 'envelope-open',  'emerald-night',
    '{"uz": "Konvert · Zumrad oqshom", "ru": "Конверт · Изумрудный вечер", "en": "Envelope · Emerald Night"}',
    'fotiha', '{elegant,envelope,dark,animated}', 100000, false, 50),
  ('envelope-ivory-minimal', 'envelope-open',  'ivory-minimal',
    '{"uz": "Konvert · Fil suyagi", "ru": "Конверт · Слоновая кость", "en": "Envelope · Ivory Minimal"}',
    'birthday', '{minimal,envelope,light}', 100000, false, 60)
on conflict (slug) do nothing;

-- First media template: floral gate with video intro (assets in /public/templates/gulli-darvoza).
insert into public.templates (slug, layout, theme, name_i18n, category, tags, price_uzs, is_new, sort) values
  ('gulli-darvoza', 'gate-video', 'gulli-darvoza',
    '{"uz": "Gulli darvoza", "ru": "Цветочные врата", "en": "Floral Gate"}',
    'wedding', '{floral,gold,video,premium}', 100000, true, 0)
on conflict (slug) do nothing;
