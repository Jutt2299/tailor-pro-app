-- ============================================================
-- Tailor Pro - Supabase RLS Policies Fix
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Make sure phone_lookup table exists
CREATE TABLE IF NOT EXISTS phone_lookup (
  id    BIGSERIAL PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL
);

-- 2. Enable RLS
ALTER TABLE phone_lookup ENABLE ROW LEVEL SECURITY;

-- 3. DROP old policies first (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can lookup phone" ON phone_lookup;
DROP POLICY IF EXISTS "Anyone can insert phone lookup" ON phone_lookup;

-- 4. Allow SELECT (for login - looking up email by phone)
CREATE POLICY "Anyone can lookup phone"
ON phone_lookup
FOR SELECT
USING (true);

-- 5. Allow INSERT (for registration - saving phone-email mapping)
CREATE POLICY "Anyone can insert phone lookup"
ON phone_lookup
FOR INSERT
WITH CHECK (true);

-- 6. Verify table and policies
SELECT * FROM phone_lookup;
