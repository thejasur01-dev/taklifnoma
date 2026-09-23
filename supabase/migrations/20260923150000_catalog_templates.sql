-- =============================================================================
-- 0003 — Real template catalog (mirrors src/templates/catalog.ts).
-- Replaces the placeholder rows from the first seed. Slugs are stable keys
-- used by the app to pick a renderer; invitations reference templates by id.
-- =============================================================================

delete from public.templates
where slug in (
  'classic-manor-roses', 'classic-emerald-night', 'classic-ivory-minimal',
  'envelope-manor-roses', 'envelope-emerald-night', 'envelope-ivory-minimal'
)
and not exists (select 1 from public.invitations i where i.template_id = templates.id);

insert into public.templates (slug, layout, theme, name_i18n, category, tags, price_uzs, is_new, sort) values
  ('gulli-darvoza', 'gate-video', 'gulli-darvoza',
    '{"uz": "Gulli darvoza", "ru": "Цветочные врата", "en": "Floral Gate"}', 'wedding', '{floral,gold,video}', 100000, true, 0),
  ('lojuvard', 'arch', 'lojuvard',
    '{"uz": "Lojuvard", "ru": "Лазурит", "en": "Lapis"}', 'wedding', '{blue,classic}', 100000, false, 10),
  ('anor', 'frame', 'anor',
    '{"uz": "Anor", "ru": "Гранат", "en": "Pomegranate"}', 'wedding', '{red,romantic}', 100000, false, 20),
  ('zumrad-tun', 'arch', 'zumrad-tun',
    '{"uz": "Zumrad tun", "ru": "Изумрудная ночь", "en": "Emerald Night"}', 'nikoh', '{green,dark,gold}', 100000, false, 30),
  ('oq-atlas', 'minimal', 'oq-atlas',
    '{"uz": "Oq atlas", "ru": "Белый атлас", "en": "White Satin"}', 'wedding', '{white,minimal}', 100000, false, 40),
  ('tungi-osmon', 'frame', 'tungi-osmon',
    '{"uz": "Tungi osmon", "ru": "Ночное небо", "en": "Night Sky"}', 'wedding', '{navy,dark}', 100000, false, 50),
  ('sahro', 'arch', 'sahro',
    '{"uz": "Sahro", "ru": "Пустыня", "en": "Desert"}', 'osh', '{sand,warm}', 100000, false, 60),
  ('lola', 'minimal', 'lola',
    '{"uz": "Lola", "ru": "Тюльпан", "en": "Tulip"}', 'fotiha', '{pink,soft}', 100000, false, 70),
  ('kumush', 'frame', 'kumush',
    '{"uz": "Kumush", "ru": "Серебро", "en": "Silver"}', 'osh', '{silver,modern}', 100000, false, 80)
on conflict (slug) do update set
  layout = excluded.layout,
  theme = excluded.theme,
  name_i18n = excluded.name_i18n,
  category = excluded.category,
  tags = excluded.tags,
  sort = excluded.sort,
  is_active = true;
