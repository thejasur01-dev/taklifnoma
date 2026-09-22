-- =============================================================================
-- 0002 — Business model update (2026-09-23):
--   * Two plans instead of per-template tiers: standard (self-service, 100 000)
--     and individual (a staff member customises the design, 500 000).
--   * More ceremony types (qiz bazm, xatna).
--   * Phone-number login verified through Telegram Gateway.
-- =============================================================================

-- ---- Plans ------------------------------------------------------------------
create type public.order_plan as enum ('standard', 'individual');

alter table public.orders add column plan public.order_plan not null default 'standard';

alter table public.templates drop column tier;
drop type public.template_tier;
alter table public.templates alter column price_uzs set default 100000;
update public.templates set price_uzs = 100000;

-- ---- Ceremony types ---------------------------------------------------------
alter type public.event_category add value if not exists 'qiz_bazm' after 'osh';
alter type public.event_category add value if not exists 'xatna' after 'qiz_bazm';

-- ---- Phone identity ---------------------------------------------------------
-- E.164 without "+" is normalised in app code; one account per phone number.
create unique index profiles_phone_key on public.profiles (phone) where phone is not null;

-- Pending Telegram Gateway verifications. Service-role only (RLS on, no policies):
-- used for rate limiting and to bind a request_id to the phone it was sent to.
create table public.phone_verifications (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null check (phone ~ '^\+[0-9]{9,15}$'),
  request_id  text not null,
  attempts    smallint not null default 0 check (attempts >= 0),
  created_at  timestamptz not null default now(),
  verified_at timestamptz
);

create index phone_verifications_phone_idx on public.phone_verifications (phone, created_at desc);

alter table public.phone_verifications enable row level security;
revoke all on public.phone_verifications from anon, authenticated;
