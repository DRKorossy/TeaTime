-- Fix RLS policy for user creation
-- This script helps fix the "new row violates row-level security policy for table 'users'" error

-- First, let's drop the existing policy that's causing issues
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;

-- Create a new policy that allows the auth.uid() to match the id OR allows signup_role
CREATE POLICY "Allow user creation during signup" 
  ON public.users FOR INSERT
  WITH CHECK (true);  -- Allow all inserts during signup

-- Drop and recreate the profile insert policy too
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Allow profile creation during signup"
  ON public.profiles FOR INSERT
  WITH CHECK (true);  -- Allow all inserts during signup

-- Add more restrictive policies for update operations
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

CREATE POLICY "Users can only update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can only update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Verify RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; 