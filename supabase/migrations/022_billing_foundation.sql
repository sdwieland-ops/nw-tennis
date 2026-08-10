-- Billing foundation for the paid-plan rollout (Stage 2 of the payments
-- plan). This migration only adds new, additive structure — it does not
-- change any existing write policy on matches/files/training-plan/etc.
-- Wiring org_is_entitled() into those policies is a deliberate follow-up
-- once Stripe checkout actually works end-to-end; enforcing entitlement
-- before there's a way to legitimately satisfy it would only add risk for
-- zero benefit right now.

-- One row per team. Written ONLY by the stripe-webhook Edge Function
-- (service_role) — that's what actually makes the paywall unbypassable,
-- not the pricing page UI (see migration 021's fix for organizations for
-- why UI-only gating isn't enough). status mirrors Stripe subscription
-- status, plus 'exempt' for teams that predate billing entirely.
create table if not exists public.org_subscriptions (
  org_id uuid primary key references public.organizations(id) on delete cascade,
  status text not null default 'exempt'
    check (status in ('exempt', 'trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  plan text check (plan in ('basis', 'fortgeschritten', 'pro')),
  currency text check (currency in ('chf', 'eur')),
  extra_seats integer not null default 0,
  extra_storage boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  -- Grace period after a failed payment before writes actually lock — gives
  -- a card-expiry hiccup a few days to resolve before it disrupts a team
  -- mid-season, without needing a cron job to compute this elsewhere.
  grace_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists org_subscriptions_stripe_customer_idx on public.org_subscriptions (stripe_customer_id);

alter table public.org_subscriptions enable row level security;

create policy "Org members can view their subscription"
  on public.org_subscriptions for select
  using (public.is_org_member(org_id));

-- Deliberately no insert/update/delete policy for authenticated — only
-- service_role (used by the webhook function) can write, bypassing RLS
-- entirely. Unlike organizations before migration 021, there's no gap here
-- to begin with.

-- Backfill: every team that exists today keeps working unchanged.
insert into public.org_subscriptions (org_id, status)
select id, 'exempt' from public.organizations
on conflict (org_id) do nothing;

-- New orgs default to 'exempt' too, until checkout is actually wired into
-- registration — otherwise a brand-new team would have no row at all and
-- org_is_entitled() would (correctly, but prematurely) lock them out.
create or replace function public.create_default_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.org_subscriptions (org_id, status) values (new.id, 'exempt');
  return new;
end;
$$;

drop trigger if exists create_default_subscription on public.organizations;
create trigger create_default_subscription
  after insert on public.organizations
  for each row execute function public.create_default_subscription();

-- Price catalog — Stripe price IDs live here, never in frontend code. The
-- public /preise page reads plan+currency+amount for display; a future
-- create-checkout-session function looks up the actual stripe_price_id
-- server-side from the same row.
create table if not exists public.billing_prices (
  id uuid primary key default gen_random_uuid(),
  plan text not null check (plan in ('basis', 'fortgeschritten', 'pro')),
  currency text not null check (currency in ('chf', 'eur')),
  amount integer not null, -- smallest currency unit (Rappen/Cent)
  stripe_price_id text unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (plan, currency)
);

alter table public.billing_prices enable row level security;

-- Public on purpose — /preise has no login wall, visitors need to see
-- pricing before registering.
create policy "Anyone can view active prices"
  on public.billing_prices for select
  using (active);

-- No client write policy — prices are managed directly by us, not through
-- the app. stripe_price_id stays null until the matching Stripe Price
-- exists (Stage 2.3); amount alone is enough for display in the meantime.
insert into public.billing_prices (plan, currency, amount) values
  ('basis', 'chf', 500),
  ('fortgeschritten', 'chf', 800),
  ('pro', 'chf', 1000),
  ('basis', 'eur', 500),
  ('fortgeschritten', 'eur', 800),
  ('pro', 'eur', 1000)
on conflict (plan, currency) do nothing;

-- Used by write policies elsewhere (wired in a follow-up migration once
-- Stripe checkout works end-to-end) to decide whether a team may still
-- create/edit data. Reading is never gated by this — a lapsed subscription
-- must never make a team's own past data disappear or become uneditable to
-- view.
create or replace function public.org_is_entitled(target_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (
      select
        status in ('exempt', 'trialing', 'active')
        or (status = 'past_due' and grace_until is not null and grace_until > now())
      from public.org_subscriptions
      where org_id = target_org_id
    ),
    false
  );
$$;
