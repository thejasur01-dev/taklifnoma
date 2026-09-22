-- =============================================================================
-- 0001 — Initial schema: profiles, templates, invitations, events, guests,
--        rsvps, wishes, page_views, orders, promo_codes, reviews, music_tracks.
--
-- Security model (see PROJECT_SPEC.md §7):
--   * customer  — sees and edits only own invitations and their children.
--   * guest     — NO direct table access. The public invitation page and
--                 RSVP / wish submissions go through Next.js server code
--                 (service role) which enforces: status = 'active',
--                 rate limit, honeypot. This keeps the anon key from being
--                 used to list invitations or to bypass the rate limit.
--   * admin     — full access via is_admin().
--   * Payment-sensitive columns (invitations.status, active_until,
--     published_at, profiles.role, orders.*) are writable only by the
--     service role (webhooks / admin server actions).
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.user_role         as enum ('customer', 'admin');
create type public.event_category    as enum ('wedding', 'nikoh', 'fotiha', 'osh', 'birthday', 'other');
create type public.template_tier     as enum ('basic', 'premium', 'vip');
create type public.invitation_status as enum ('draft', 'pending_payment', 'active', 'expired', 'blocked');
create type public.rsvp_status       as enum ('yes', 'no', 'maybe');
create type public.order_status      as enum ('pending', 'paid', 'failed', 'refunded', 'manual');
create type public.payment_provider  as enum ('payme', 'click', 'manual');
create type public.promo_type        as enum ('percent', 'fixed');

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Short, unambiguous code for personal guest links (no 0/o/1/l/i).
create or replace function public.generate_guest_code(len int default 7)
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  alphabet constant text := 'abcdefghjkmnpqrstuvwxyz23456789';
  result text := '';
  bytes bytea := extensions.gen_random_bytes(len);
begin
  for i in 0 .. len - 1 loop
    result := result || substr(alphabet, (get_byte(bytes, i) % length(alphabet)) + 1, 1);
  end loop;
  return result;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  full_name         text check (char_length(full_name) <= 120),
  phone             text check (phone ~ '^\+?[0-9]{9,15}$'),
  telegram_id       bigint unique,
  telegram_username text check (char_length(telegram_username) <= 64),
  locale            text not null default 'uz' check (locale in ('uz', 'ru', 'en')),
  role              public.user_role not null default 'customer',
  created_at        timestamptz not null default now()
);

-- Must be defined after profiles exists. SECURITY DEFINER so it can be used
-- inside RLS policies of profiles itself without infinite recursion.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Auto-create profile on sign up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, locale)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'locale', ''), 'uz')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- templates
-- -----------------------------------------------------------------------------
create table public.templates (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  layout      text not null,
  theme       text not null,
  name_i18n   jsonb not null default '{}'::jsonb check (jsonb_typeof(name_i18n) = 'object'),
  category    public.event_category not null,
  tags        text[] not null default '{}',
  tier        public.template_tier not null default 'basic',
  price_uzs   int not null check (price_uzs >= 0),
  is_active   boolean not null default true,
  is_new      boolean not null default false,
  sort        int not null default 0,
  preview_url text,
  created_at  timestamptz not null default now(),
  unique (layout, theme)
);

create index templates_catalog_idx on public.templates (is_active, category, sort);
create index templates_tags_idx    on public.templates using gin (tags);

-- -----------------------------------------------------------------------------
-- invitations
-- -----------------------------------------------------------------------------
create table public.invitations (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.profiles (id) on delete cascade,
  template_id     uuid not null references public.templates (id) on delete restrict,
  -- Personal URL part: /i/aziz-madina. 3–40 chars, lowercase, digits, inner hyphens.
  slug            text not null unique
                  check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$' and slug !~ '--'),
  status          public.invitation_status not null default 'draft',
  data            jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  locales         text[] not null default '{uz}'
                  check (locales <@ array['uz', 'ru', 'en'] and cardinality(locales) >= 1),
  main_event_date date,
  active_until    date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  published_at    timestamptz
);

create index invitations_owner_idx  on public.invitations (owner_id, created_at desc);
create index invitations_status_idx on public.invitations (status, active_until);

create trigger invitations_set_updated_at
  before update on public.invitations
  for each row execute function public.set_updated_at();

-- Reserved slugs that would collide with app routes or look official.
create table public.reserved_slugs (
  slug text primary key
);

insert into public.reserved_slugs (slug) values
  ('admin'), ('api'), ('dashboard'), ('create'), ('templates'), ('pricing'),
  ('faq'), ('blog'), ('legal'), ('login'), ('logout'), ('signup'), ('support'),
  ('help'), ('about'), ('contact'), ('demo'), ('test'), ('www'), ('app');

create or replace function public.check_invitation_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (select 1 from public.reserved_slugs r where r.slug = new.slug) then
    raise exception 'slug_reserved' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger invitations_check_slug
  before insert or update of slug on public.invitations
  for each row execute function public.check_invitation_slug();

-- -----------------------------------------------------------------------------
-- events (one invitation → several events: nikoh, to'y, osh…)
-- -----------------------------------------------------------------------------
create table public.events (
  id            uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  title_i18n    jsonb not null default '{}'::jsonb check (jsonb_typeof(title_i18n) = 'object'),
  starts_at     timestamptz not null,
  venue_name    text check (char_length(venue_name) <= 200),
  address       text check (char_length(address) <= 400),
  lat           double precision check (lat between -90 and 90),
  lng           double precision check (lng between -180 and 180),
  sort          int not null default 0
);

create index events_invitation_idx on public.events (invitation_id, sort);

-- -----------------------------------------------------------------------------
-- guests
-- -----------------------------------------------------------------------------
create table public.guests (
  id            uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 120),
  group_name    text check (char_length(group_name) <= 60),
  phone         text check (phone ~ '^\+?[0-9]{9,15}$'),
  code          text not null unique default public.generate_guest_code(),
  max_people    int not null default 1 check (max_people between 1 and 50),
  sent_at       timestamptz,
  opened_at     timestamptz,
  created_at    timestamptz not null default now()
);

create index guests_invitation_idx on public.guests (invitation_id, group_name);

-- -----------------------------------------------------------------------------
-- rsvps
-- -----------------------------------------------------------------------------
create table public.rsvps (
  id            uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  guest_id      uuid references public.guests (id) on delete set null,
  name          text not null check (char_length(name) between 1 and 120),
  status        public.rsvp_status not null,
  people_count  int not null default 1 check (people_count between 0 and 50),
  event_ids     uuid[] not null default '{}',
  comment       text check (char_length(comment) <= 1000),
  created_at    timestamptz not null default now()
);

create index rsvps_invitation_idx on public.rsvps (invitation_id, created_at desc);
create index rsvps_guest_idx      on public.rsvps (guest_id);

-- -----------------------------------------------------------------------------
-- wishes
-- -----------------------------------------------------------------------------
create table public.wishes (
  id            uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  guest_id      uuid references public.guests (id) on delete set null,
  author_name   text not null check (char_length(author_name) between 1 and 120),
  message       text not null check (char_length(message) between 1 and 1000),
  is_visible    boolean not null default true,
  created_at    timestamptz not null default now()
);

create index wishes_invitation_idx on public.wishes (invitation_id, created_at desc);

-- -----------------------------------------------------------------------------
-- page_views (no IP stored — privacy requirement)
-- -----------------------------------------------------------------------------
create table public.page_views (
  id               bigint generated always as identity primary key,
  invitation_id    uuid not null references public.invitations (id) on delete cascade,
  guest_id         uuid references public.guests (id) on delete set null,
  viewed_at        timestamptz not null default now(),
  user_agent_short text check (char_length(user_agent_short) <= 64)
);

create index page_views_invitation_idx on public.page_views (invitation_id, viewed_at desc);

-- -----------------------------------------------------------------------------
-- promo_codes
-- -----------------------------------------------------------------------------
create table public.promo_codes (
  id          uuid primary key default gen_random_uuid(),
  code        text not null check (code ~ '^[A-Z0-9_-]{3,32}$'),
  type        public.promo_type not null,
  value       int not null check (value > 0),
  max_uses    int check (max_uses > 0),
  used_count  int not null default 0 check (used_count >= 0),
  valid_until timestamptz,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  check (type <> 'percent' or value <= 100),
  check (max_uses is null or used_count <= max_uses)
);

create unique index promo_codes_code_idx on public.promo_codes (upper(code));

-- -----------------------------------------------------------------------------
-- orders
-- -----------------------------------------------------------------------------
create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete restrict,
  invitation_id  uuid references public.invitations (id) on delete set null,
  amount_uzs     int not null check (amount_uzs >= 0),
  promo_code_id  uuid references public.promo_codes (id) on delete set null,
  status         public.order_status not null default 'pending',
  provider       public.payment_provider not null,
  provider_tx_id text,
  created_at     timestamptz not null default now(),
  paid_at        timestamptz,
  unique (provider, provider_tx_id)
);

create index orders_user_idx       on public.orders (user_id, created_at desc);
create index orders_invitation_idx on public.orders (invitation_id);
create index orders_status_idx     on public.orders (status, created_at desc);

-- -----------------------------------------------------------------------------
-- reviews (only paying customers — enforced in server code at stage 6)
-- -----------------------------------------------------------------------------
create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  invitation_id uuid references public.invitations (id) on delete set null,
  rating        smallint not null check (rating between 1 and 5),
  text          text check (char_length(text) <= 2000),
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (user_id, invitation_id)
);

create index reviews_published_idx on public.reviews (is_published, created_at desc);

-- -----------------------------------------------------------------------------
-- music_tracks
-- -----------------------------------------------------------------------------
create table public.music_tracks (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  artist     text,
  url        text not null,
  duration   int check (duration > 0),   -- seconds
  category   text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles       enable row level security;
alter table public.templates      enable row level security;
alter table public.invitations    enable row level security;
alter table public.reserved_slugs enable row level security;
alter table public.events         enable row level security;
alter table public.guests         enable row level security;
alter table public.rsvps          enable row level security;
alter table public.wishes         enable row level security;
alter table public.page_views     enable row level security;
alter table public.promo_codes    enable row level security;
alter table public.orders         enable row level security;
alter table public.reviews        enable row level security;
alter table public.music_tracks   enable row level security;

-- Ownership helper used by child tables.
create or replace function public.owns_invitation(inv_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.invitations
    where id = inv_id and owner_id = (select auth.uid())
  );
$$;

-- ---- profiles ---------------------------------------------------------------
create policy "profiles: read own"   on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "profiles: admin all"  on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Customers may change only these columns (not role / telegram_id).
revoke update on public.profiles from authenticated;
grant  update (full_name, phone, locale) on public.profiles to authenticated;

-- ---- templates / music_tracks (public catalog) ------------------------------
create policy "templates: public read active" on public.templates for select to anon, authenticated
  using (is_active or public.is_admin());
create policy "templates: admin all" on public.templates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "music: public read active" on public.music_tracks for select to anon, authenticated
  using (is_active or public.is_admin());
create policy "music: admin all" on public.music_tracks for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "reserved_slugs: read" on public.reserved_slugs for select to anon, authenticated
  using (true);

-- ---- invitations ------------------------------------------------------------
create policy "invitations: owner read"   on public.invitations for select to authenticated
  using (owner_id = (select auth.uid()) or public.is_admin());
create policy "invitations: owner insert" on public.invitations for insert to authenticated
  with check (owner_id = (select auth.uid()) and status = 'draft');
create policy "invitations: owner update" on public.invitations for update to authenticated
  using (owner_id = (select auth.uid()) and status <> 'blocked')
  with check (owner_id = (select auth.uid()));
create policy "invitations: owner delete" on public.invitations for delete to authenticated
  using (owner_id = (select auth.uid()));
create policy "invitations: admin all"    on public.invitations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- status / active_until / published_at change only via service role (payment webhook, admin action).
revoke update on public.invitations from authenticated;
grant  update (template_id, slug, data, locales, main_event_date) on public.invitations to authenticated;

-- ---- events / guests (owner full CRUD) --------------------------------------
create policy "events: owner all" on public.events for all to authenticated
  using (public.owns_invitation(invitation_id) or public.is_admin())
  with check (public.owns_invitation(invitation_id) or public.is_admin());

create policy "guests: owner all" on public.guests for all to authenticated
  using (public.owns_invitation(invitation_id) or public.is_admin())
  with check (public.owns_invitation(invitation_id) or public.is_admin());

-- ---- rsvps / wishes / page_views (inserted by server; owner reads) ----------
create policy "rsvps: owner read"   on public.rsvps for select to authenticated
  using (public.owns_invitation(invitation_id) or public.is_admin());
create policy "rsvps: owner delete" on public.rsvps for delete to authenticated
  using (public.owns_invitation(invitation_id) or public.is_admin());

create policy "wishes: owner read"     on public.wishes for select to authenticated
  using (public.owns_invitation(invitation_id) or public.is_admin());
create policy "wishes: owner moderate" on public.wishes for update to authenticated
  using (public.owns_invitation(invitation_id) or public.is_admin())
  with check (public.owns_invitation(invitation_id) or public.is_admin());
create policy "wishes: owner delete"   on public.wishes for delete to authenticated
  using (public.owns_invitation(invitation_id) or public.is_admin());

revoke update on public.wishes from authenticated;
grant  update (is_visible) on public.wishes to authenticated;

create policy "page_views: owner read" on public.page_views for select to authenticated
  using (public.owns_invitation(invitation_id) or public.is_admin());

-- ---- orders (read own; writes only by service role) -------------------------
create policy "orders: owner read" on public.orders for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- ---- promo_codes (admin only; validation happens server-side) ---------------
create policy "promo: admin all" on public.promo_codes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---- reviews ----------------------------------------------------------------
create policy "reviews: public read published" on public.reviews for select to anon, authenticated
  using (is_published or user_id = (select auth.uid()) or public.is_admin());
create policy "reviews: owner insert" on public.reviews for insert to authenticated
  with check (user_id = (select auth.uid()) and is_published = false);
create policy "reviews: admin all" on public.reviews for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
