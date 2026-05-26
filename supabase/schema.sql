-- Run this in the Supabase SQL editor.

create table if not exists public.examinations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  patient_name text,
  examined_at date,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists examinations_user_idx on public.examinations (user_id, created_at desc);

alter table public.examinations enable row level security;

drop policy if exists "owner can read" on public.examinations;
create policy "owner can read" on public.examinations
  for select using (auth.uid() = user_id);

drop policy if exists "owner can insert" on public.examinations;
create policy "owner can insert" on public.examinations
  for insert with check (auth.uid() = user_id);

drop policy if exists "owner can update" on public.examinations;
create policy "owner can update" on public.examinations
  for update using (auth.uid() = user_id);

drop policy if exists "owner can delete" on public.examinations;
create policy "owner can delete" on public.examinations
  for delete using (auth.uid() = user_id);
