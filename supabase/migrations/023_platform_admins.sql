-- Platform-level admin access for the internal /intern area (cross-team
-- stats, price editing, promo codes) — a wholly separate concept from
-- org roles: every existing permission check in this app is scoped to a
-- single org's membership, but this is the business owners looking across
-- ALL teams at once.
--
-- Keyed by email rather than user_id on purpose: it lets us pre-authorize
-- an address before that person has ever logged in (no auth.users FK to
-- satisfy), and Supabase's auth.email() helper reads the email straight off
-- the current request's JWT, so RLS policies never need to touch auth.users
-- directly.
create table if not exists public.platform_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;
-- No policies at all for authenticated/anon — only service_role (used
-- inside the admin-* Edge Functions) ever reads this table. Nothing about
-- who the admins are should be discoverable from the client.

create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.platform_admins where email = auth.email());
$$;

insert into public.platform_admins (email) values ('info@dolphintennis.com')
on conflict (email) do nothing;

-- billing_prices already has public SELECT (migration 022); this adds
-- UPDATE for platform admins so prices can be edited from /intern without
-- going through the SQL editor each time. Lower risk than exposing the
-- cross-tenant stats via RLS — it's just the price catalog, not per-team
-- data — so a direct policy is fine here (the stats/coupon logic stays in
-- Edge Functions instead).
create policy "Platform admins can update prices"
  on public.billing_prices for update
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
