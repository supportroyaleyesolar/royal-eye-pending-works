-- ============================================================================
-- Royal Eye Solar Power – Supabase PostgreSQL Schema & Realtime Setup
-- Copy and paste this script directly into Supabase Dashboard -> SQL Editor -> Run
-- ============================================================================

-- 1. Enable UUID Extension (optional utility)
create extension if not exists "uuid-ossp";

-- 2. Create CUSTOMERS Table
create table if not exists public.customers (
  id text primary key,
  name text not null,
  phone text default '',
  email text default '',
  address text default '',
  district text default 'Thrissur',
  state text default 'Kerala',
  pincode text default '',
  aadhar_number text default '',
  pan_number text default '',
  dob text default '',
  father_name text default '',
  electricity_consumer_no text default '',
  kseb_meter_no text default '',
  sanctioned_load text default '5 kW',
  phase text default '1-Phase',
  bank_name text default '',
  account_number text default '',
  ifsc text default '',
  passbook_holder text default '',
  bank_branch text default '',
  system_capacity text default '3 kW',
  roof_type text default 'Flat RCC',
  loan_required boolean default false,
  loan_amount numeric default 0,
  loan_bank text default '',
  loan_type text default 'Solar Loan',
  loan_status text default 'Applied',
  subsidy_applied boolean default true,
  subsidy_amount numeric default 78000,
  mnre_app_no text default '',
  surya_ghar_app_no text default '',
  workflow_stage text default 'Anubhandham 1',
  status text default 'Pending',
  joined text default to_char(now(), 'YYYY-MM-DD'),
  type text default 'Residential',
  total_billed numeric default 0,
  date text default to_char(now(), 'YYYY-MM-DD'),
  docs jsonb default '{}'::jsonb,
  raw_data jsonb default '{}'::jsonb,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. Create WORKS Table (Solar Installation Tracking)
create table if not exists public.works (
  id bigint primary key,
  title text not null,
  customer text default '',
  date text not null,
  status text default 'Pending',
  progress integer default 0,
  team text default '',
  location text default '',
  raw_data jsonb default '{}'::jsonb,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.customers enable row level security;
alter table public.works enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Allow public read access to customers" on public.customers;
drop policy if exists "Allow public insert to customers" on public.customers;
drop policy if exists "Allow public update to customers" on public.customers;
drop policy if exists "Allow public delete to customers" on public.customers;

drop policy if exists "Allow public read access to works" on public.works;
drop policy if exists "Allow public insert to works" on public.works;
drop policy if exists "Allow public update to works" on public.works;
drop policy if exists "Allow public delete to works" on public.works;

-- Create Open Policies for Client App (or customize according to your auth rules)
create policy "Allow public read access to customers" on public.customers
  for select using (true);

create policy "Allow public insert to customers" on public.customers
  for insert with check (true);

create policy "Allow public update to customers" on public.customers
  for update using (true);

create policy "Allow public delete to customers" on public.customers
  for delete using (true);

create policy "Allow public read access to works" on public.works
  for select using (true);

create policy "Allow public insert to works" on public.works
  for insert with check (true);

create policy "Allow public update to works" on public.works
  for update using (true);

create policy "Allow public delete to works" on public.works
  for delete using (true);

-- 5. Enable Realtime WebSockets for instant synchronization
-- Allows changes on one device (e.g. smartphone) to instantly reflect on desktop screens
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'customers'
  ) then
    alter publication supabase_realtime add table public.customers;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'works'
  ) then
    alter publication supabase_realtime add table public.works;
  end if;
end $$;

-- Notice of completion
select 'Royal Eye Solar Supabase Schema successfully initialized with Realtime WebSockets!' as status;
