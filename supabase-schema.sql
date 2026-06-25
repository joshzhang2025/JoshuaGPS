-- Joshua GPS — Supabase database schema
-- Run this once in your Supabase project: Dashboard -> SQL Editor -> New query -> paste -> Run.
--
-- It creates one table that stores each user's app data as key/value rows,
-- and locks it down so every account can only read and write its own rows.

create table if not exists public.user_data (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  key        text        not null,
  value      text,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- Row Level Security: a signed-in user can only touch rows where user_id = their id.
alter table public.user_data enable row level security;

drop policy if exists "Users manage their own data" on public.user_data;
create policy "Users manage their own data"
  on public.user_data
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
