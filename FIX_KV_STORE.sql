-- ⚡ QUICK FIX: Create Missing KV Store Table
-- Run this in Supabase SQL Editor NOW!

CREATE TABLE IF NOT EXISTS public.kv_store_fdaa97b0 (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ✅ That's it! Now try generating team ID again.
