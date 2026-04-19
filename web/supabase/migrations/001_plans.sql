-- Run this in Supabase SQL Editor (Dashboard → SQL).
-- Also enable: Authentication → Providers → Anonymous users (Anonymous sign-ins).

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '宮古島行程',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists plans_user_id_idx on public.plans (user_id);

alter table public.plans enable row level security;

create policy "plans_select_own" on public.plans
  for select using (auth.uid() = user_id);

create policy "plans_insert_own" on public.plans
  for insert with check (auth.uid() = user_id);

create policy "plans_update_own" on public.plans
  for update using (auth.uid() = user_id);

create policy "plans_delete_own" on public.plans
  for delete using (auth.uid() = user_id);

create or replace function public.set_plans_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists plans_set_updated_at on public.plans;

create trigger plans_set_updated_at
  before update on public.plans
  for each row
  execute procedure public.set_plans_updated_at();
