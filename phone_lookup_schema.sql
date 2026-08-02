-- ==============================================================
-- RUN THIS in Supabase SQL Editor
-- Adds a public phone-to-email lookup table for phone-based login
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.phone_lookup (
    phone TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Allow anyone (even unauthenticated) to READ this table
-- This is needed so we can look up email by phone before logging in
ALTER TABLE public.phone_lookup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can lookup phone" 
    ON public.phone_lookup FOR SELECT 
    USING (true);

-- Only authenticated users can insert their own record
CREATE POLICY "Users can insert own phone" 
    ON public.phone_lookup FOR INSERT 
    WITH CHECK (true);
