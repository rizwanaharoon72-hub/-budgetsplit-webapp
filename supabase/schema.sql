-- ============================================================
-- BudgetSplit — Supabase SQL Schema (Assignment 07)
-- Run this in the Supabase SQL Editor (Project → SQL Editor)
-- ============================================================

-- Enable UUID generation extension
create extension if not exists "pgcrypto";

-- ==========================
-- TABLE: profiles
-- ==========================
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    name text not null,
    email text not null,
    current_monthly_income numeric(12,2) not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ==========================
-- TABLE: expenses
-- ==========================
create table if not exists public.expenses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    amount numeric(12,2) not null check (amount > 0),
    category text not null check (category in ('needs', 'wants', 'savings')),
    note text,
    expense_date date not null default current_date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Performance indexes
create index if not exists idx_expenses_user_id on public.expenses(user_id);
create index if not exists idx_expenses_expense_date on public.expenses(expense_date);
create index if not exists idx_expenses_user_date on public.expenses(user_id, expense_date desc);

-- ==========================
-- updated_at trigger function
-- ==========================
create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger trg_expenses_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

-- ==========================
-- Auto-create profile on signup
-- ==========================
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, name, email, current_monthly_income)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'name', ''),
        new.email,
        0
    );
    return new;
end;
$$ language plpgsql security definer;

-- Drop and recreate trigger so it is idempotent
drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ==========================
-- RLS: Enable Row Level Security
-- ==========================
alter table public.profiles enable row level security;
alter table public.expenses enable row level security;

-- ==========================
-- RLS Policies: profiles
-- ==========================
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- ==========================
-- RLS Policies: expenses
-- ==========================
drop policy if exists "Users can read own expenses" on public.expenses;
create policy "Users can read own expenses"
on public.expenses for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own expenses" on public.expenses;
create policy "Users can insert own expenses"
on public.expenses for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own expenses" on public.expenses;
create policy "Users can update own expenses"
on public.expenses for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own expenses" on public.expenses;
create policy "Users can delete own expenses"
on public.expenses for delete
using (auth.uid() = user_id);
