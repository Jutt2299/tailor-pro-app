-- ==============================================================================
-- TAILOR PRO - SUPABASE DATABASE SCHEMA
-- This script creates the tables and sets up Row Level Security (RLS)
-- so that every tailor can only see and edit their own data.
-- ==============================================================================

-- 1. Create Profiles Table (Stores Shop/Tailor info)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_name TEXT,
    owner_name TEXT,
    phone TEXT,
    address TEXT,
    thank_you_msg TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY,
    tailor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    measurements JSONB DEFAULT '{}'::jsonb,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY,
    tailor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    dress_description TEXT,
    special_instructions TEXT,
    total_amount NUMERIC DEFAULT 0,
    amount_paid NUMERIC DEFAULT 0,
    previous_balance NUMERIC DEFAULT 0,
    delivery_date DATE,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'unpaid',
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Ensuring tailors can only access their own rows
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Customers Policies
CREATE POLICY "Users can view own customers" 
    ON public.customers FOR SELECT 
    USING (auth.uid() = tailor_id);

CREATE POLICY "Users can insert own customers" 
    ON public.customers FOR INSERT 
    WITH CHECK (auth.uid() = tailor_id);

CREATE POLICY "Users can update own customers" 
    ON public.customers FOR UPDATE 
    USING (auth.uid() = tailor_id);

CREATE POLICY "Users can delete own customers" 
    ON public.customers FOR DELETE 
    USING (auth.uid() = tailor_id);

-- Orders Policies
CREATE POLICY "Users can view own orders" 
    ON public.orders FOR SELECT 
    USING (auth.uid() = tailor_id);

CREATE POLICY "Users can insert own orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (auth.uid() = tailor_id);

CREATE POLICY "Users can update own orders" 
    ON public.orders FOR UPDATE 
    USING (auth.uid() = tailor_id);

CREATE POLICY "Users can delete own orders" 
    ON public.orders FOR DELETE 
    USING (auth.uid() = tailor_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- When a user signs up, automatically create an empty profile for them
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, shop_name, phone)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'shop_name',
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists (so this script can be run multiple times safely)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
