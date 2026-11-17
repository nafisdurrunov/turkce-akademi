-- ============================================================
--  Türkçe Akademi — Supabase schema
--  Jalankan SELURUH file ini di Supabase → SQL Editor → Run.
--  Script ini aman dijalankan ulang (idempotent).
--
--  Tabel:
--    profiles          -> satu baris per pengguna, menyimpan bab terakhir
--    chapter_progress  -> bagian yang selesai per bab
--    quiz_attempts     -> riwayat skor kuis
--    notes             -> catatan pribadi per bab
--    study_days        -> tanggal aktif (untuk streak)
--
--  Semua tabel dilindungi Row Level Security (RLS):
--  pengguna hanya bisa membaca & mengubah barisnya sendiri.
-- ============================================================

-- Diperlukan untuk gen_random_uuid(); biasanya sudah aktif di Supabase.
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. TABEL
-- ------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  last_chapter text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chapter_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  chapter_id text not null,
  completed boolean not null default false,
  sections text[] not null default '{}',
  last_opened_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

create table if not exists public.quiz_attempts (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  chapter_id text not null,
  score integer not null default 0 check (score >= 0),
  total integer not null default 0 check (total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_user_created_idx
  on public.quiz_attempts (user_id, created_at desc);

create table if not exists public.notes (
  user_id uuid not null references auth.users (id) on delete cascade,
  chapter_id text not null,
  content text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

create table if not exists public.study_days (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- ------------------------------------------------------------
-- 2. TRIGGER updated_at
-- ------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists chapter_progress_touch on public.chapter_progress;
create trigger chapter_progress_touch
  before update on public.chapter_progress
  for each row execute function public.touch_updated_at();

drop trigger if exists notes_touch on public.notes;
create trigger notes_touch
  before update on public.notes
  for each row execute function public.touch_updated_at();

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- 3. PROFIL OTOMATIS SAAT SIGN-UP
-- ------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: buat profil untuk pengguna yang sudah terlanjur mendaftar.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.chapter_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.notes enable row level security;
alter table public.study_days enable row level security;

-- profiles ---------------------------------------------------
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles: delete own" on public.profiles;
create policy "profiles: delete own"
  on public.profiles for delete
  to authenticated
  using (auth.uid() = id);

-- chapter_progress -------------------------------------------
drop policy if exists "progress: read own" on public.chapter_progress;
create policy "progress: read own"
  on public.chapter_progress for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "progress: insert own" on public.chapter_progress;
create policy "progress: insert own"
  on public.chapter_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "progress: update own" on public.chapter_progress;
create policy "progress: update own"
  on public.chapter_progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "progress: delete own" on public.chapter_progress;
create policy "progress: delete own"
  on public.chapter_progress for delete
  to authenticated
  using (auth.uid() = user_id);

-- quiz_attempts ----------------------------------------------
drop policy if exists "attempts: read own" on public.quiz_attempts;
create policy "attempts: read own"
  on public.quiz_attempts for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "attempts: insert own" on public.quiz_attempts;
create policy "attempts: insert own"
  on public.quiz_attempts for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "attempts: update own" on public.quiz_attempts;
create policy "attempts: update own"
  on public.quiz_attempts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "attempts: delete own" on public.quiz_attempts;
create policy "attempts: delete own"
  on public.quiz_attempts for delete
  to authenticated
  using (auth.uid() = user_id);

-- notes ------------------------------------------------------
drop policy if exists "notes: read own" on public.notes;
create policy "notes: read own"
  on public.notes for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "notes: insert own" on public.notes;
create policy "notes: insert own"
  on public.notes for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "notes: update own" on public.notes;
create policy "notes: update own"
  on public.notes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "notes: delete own" on public.notes;
create policy "notes: delete own"
  on public.notes for delete
  to authenticated
  using (auth.uid() = user_id);

-- study_days -------------------------------------------------
drop policy if exists "days: read own" on public.study_days;
create policy "days: read own"
  on public.study_days for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "days: insert own" on public.study_days;
create policy "days: insert own"
  on public.study_days for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "days: update own" on public.study_days;
create policy "days: update own"
  on public.study_days for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "days: delete own" on public.study_days;
create policy "days: delete own"
  on public.study_days for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 5. HAK AKSES
-- Hanya pengguna login (authenticated) yang boleh menyentuh tabel.
-- Anon tidak perlu akses langsung ke tabel.
-- ------------------------------------------------------------

revoke all on public.profiles from anon;
revoke all on public.chapter_progress from anon;
revoke all on public.quiz_attempts from anon;
revoke all on public.notes from anon;
revoke all on public.study_days from anon;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.chapter_progress to authenticated;
grant select, insert, update, delete on public.quiz_attempts to authenticated;
grant select, insert, update, delete on public.notes to authenticated;
grant select, insert, update, delete on public.study_days to authenticated;

-- Selesai. Cek Authentication → Users setelah mendaftar:
-- seharusnya muncul baris baru di public.profiles.
