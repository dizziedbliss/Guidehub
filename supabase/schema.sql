-- Guidehub Supabase schema
-- Run this in the Supabase SQL Editor for your project.

-- Students: used for login + team-member verification
create table if not exists public.students (
  usn text primary key,
  name text not null,
  dob text not null, -- DDMMYY (consider hashing in real deployments)
  section text not null,
  in_team boolean not null default false,
  created_at timestamptz not null default now()
);

-- Guides: used for the guide selection list
create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  department text not null,
  created_at timestamptz not null default now()
);

-- Optional hardening: enable RLS. Edge Functions using the service role key can still access.
alter table public.students enable row level security;
alter table public.guides enable row level security;

-- No policies are added here on purpose.
-- Access in this app is done via Supabase Edge Functions using the service role key.
