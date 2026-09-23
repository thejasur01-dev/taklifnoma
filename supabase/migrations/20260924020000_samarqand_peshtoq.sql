-- =============================================================================
-- 0004 — Second video template: Samarqand peshtoqi (blue-tiled madrasa portal).
-- =============================================================================

insert into public.templates (slug, layout, theme, name_i18n, category, tags, price_uzs, is_new, sort) values
  ('samarqand-peshtoq', 'gate-video', 'samarqand-peshtoq',
    '{"uz": "Samarqand peshtoqi", "ru": "Самаркандский портал", "en": "Samarkand Portal"}',
    'wedding', '{blue,tiles,gold,video,national}', 100000, true, 5)
on conflict (slug) do update set
  layout = excluded.layout,
  theme = excluded.theme,
  name_i18n = excluded.name_i18n,
  tags = excluded.tags,
  sort = excluded.sort,
  is_active = true;
