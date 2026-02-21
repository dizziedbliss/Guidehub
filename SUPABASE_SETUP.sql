-- ============================================
-- GUIDEHUB SUPABASE SETUP (GUIDES NOT RECREATED)
-- ============================================
-- Run this in Supabase SQL Editor.
-- This script:
-- 1) sets up kv/team tables and policies
-- 2) uses students table with only usn, name, section
-- 3) includes students_raw CSV import flow
-- 4) does NOT recreate or seed guides table

-- ============================================
-- 1) KV STORE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.kv_store_fdaa97b0 (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2) STUDENTS TABLE + CSV IMPORT FLOW
-- ============================================

-- Main table (only usn, name, section)
CREATE TABLE IF NOT EXISTS public.students (
  usn TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  section TEXT NOT NULL
);

-- Temp table for your current CSV (has branch too)
DROP TABLE IF EXISTS public.students_raw;
CREATE TABLE public.students_raw (
  usn TEXT,
  name TEXT,
  section TEXT,
  branch TEXT
);

-- After CSV upload into students_raw, run this:
INSERT INTO public.students (usn, name, section)
SELECT TRIM(usn), TRIM(name), TRIM(section)
FROM public.students_raw
WHERE COALESCE(TRIM(usn), '') <> ''
ON CONFLICT (usn) DO UPDATE
SET
  name = EXCLUDED.name,
  section = EXCLUDED.section;

-- Optional cleanup
DROP TABLE IF EXISTS public.students_raw;

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_students_name ON public.students(name);

-- ============================================
-- 3) GUIDES COMPATIBILITY (GUIDES ALREADY EXISTS)
-- ============================================
-- Current app/backend uses guides.id only.
-- Ensure guides table has at least: id, name, department, created_at.

-- ============================================
-- 4) TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.teams (
    team_id TEXT PRIMARY KEY,
    leader_usn TEXT NOT NULL REFERENCES public.students(usn),
  guide_id TEXT NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS guide_id TEXT;

CREATE INDEX IF NOT EXISTS idx_teams_leader_usn ON public.teams(leader_usn);
CREATE INDEX IF NOT EXISTS idx_teams_guide_id ON public.teams(guide_id);

-- ============================================
-- 4B) GUIDE SLOT TRACKER (CROSS-CHECK)
-- ============================================
CREATE TABLE IF NOT EXISTS public.guide_slots (
  guide_id TEXT PRIMARY KEY,
  used_slots INTEGER NOT NULL DEFAULT 0,
  max_slots INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guide_slots_used_slots ON public.guide_slots(used_slots);

-- ============================================
-- 5) TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id SERIAL PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES public.teams(team_id) ON DELETE CASCADE,
    usn TEXT NOT NULL REFERENCES public.students(usn),
    is_leader BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, usn)
);

-- Enforce one-student-one-team at DB level
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_unique_usn
  ON public.team_members(usn);

CREATE INDEX IF NOT EXISTS idx_team_members_usn ON public.team_members(usn);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);

-- ============================================
-- 6) RLS + POLICIES (RERUN-SAFE)
-- ============================================
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.students;
CREATE POLICY "Enable read access for all users"
  ON public.students
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.guides;
CREATE POLICY "Enable read access for all users"
  ON public.guides
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Enable insert for service role" ON public.teams;
CREATE POLICY "Enable insert for service role"
  ON public.teams
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.teams;
CREATE POLICY "Enable read access for all users"
  ON public.teams
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Enable insert for service role" ON public.team_members;
CREATE POLICY "Enable insert for service role"
  ON public.team_members
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.team_members;
CREATE POLICY "Enable read access for all users"
  ON public.team_members
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.guide_slots;
CREATE POLICY "Enable read access for all users"
  ON public.guide_slots
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Enable insert for service role" ON public.guide_slots;
CREATE POLICY "Enable insert for service role"
  ON public.guide_slots
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for service role" ON public.guide_slots;
CREATE POLICY "Enable update for service role"
  ON public.guide_slots
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================
-- DONE
-- ============================================
-- guide_slots is optional cross-check tracking; registrations still work without it.
