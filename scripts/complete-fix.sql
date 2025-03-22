-- Complete Fix for TeaTime App Database
-- This script will reset your database and set up proper triggers and policies

-- First, drop all tables and start fresh (in reverse order to avoid FK constraints)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.fines CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.friends CASCADE;
DROP TABLE IF EXISTS public.tea_submissions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop any existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create all tables
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  location TEXT DEFAULT '',
  occupation TEXT DEFAULT '',
  favorite_tea TEXT DEFAULT 'Earl Grey',
  profile_photo_url TEXT DEFAULT NULL, -- URL reference to the image in storage, not the actual binary data
  hobbies TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  streak_count INTEGER DEFAULT 0,
  total_teas INTEGER DEFAULT 0,
  missed_count INTEGER DEFAULT 0,
  total_fines NUMERIC DEFAULT 0,
  total_donated NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tea_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  image_url TEXT NOT NULL, -- URL reference to storage, not the actual image
  tea_type TEXT NOT NULL,
  submission_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_late BOOLEAN DEFAULT false,
  ai_verified BOOLEAN,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  friend_id UUID REFERENCES public.users(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  submission_id UUID REFERENCES public.tea_submissions(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, submission_id)
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  submission_id UUID REFERENCES public.tea_submissions(id) NOT NULL,
  parent_id UUID REFERENCES public.comments(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'donated')),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  offense_count INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  fine_id UUID REFERENCES public.fines(id) NOT NULL,
  amount NUMERIC NOT NULL,
  receipt_url TEXT NOT NULL, -- URL reference to storage, not the actual receipt image
  charity_name TEXT NOT NULL,
  verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('teatime', 'friend_request', 'friend_accepted', 'like', 'comment', 'fine', 'verification')),
  content TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tea_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create a trigger function to automatically create user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into public.users
  INSERT INTO public.users (id, email, full_name, bio, location, occupation, favorite_tea, profile_photo_url, hobbies)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    '',
    '',
    '',
    'Earl Grey',
    NULL, -- No profile photo initially
    '{}'
  );
  
  -- Insert into public.profiles
  INSERT INTO public.profiles (id, username, streak_count, total_teas, missed_count, total_fines, total_donated)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user' || substr(NEW.id::text, 1, 8)),
    0,
    0,
    0,
    0,
    0
  );
  
  RETURN NEW;
END;
$$;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create basic RLS policies
-- Users table
CREATE POLICY "Users can view their own data and friends' data"
  ON public.users FOR SELECT
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.friends
      WHERE (user_id = auth.uid() AND friend_id = id AND status = 'accepted') OR
            (user_id = id AND friend_id = auth.uid() AND status = 'accepted')
    )
  );

CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Profiles table
CREATE POLICY "Profiles are viewable by all authenticated users"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Tea submissions table
CREATE POLICY "Tea submissions are viewable by friends"
  ON public.tea_submissions FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.friends
      WHERE (user_id = auth.uid() AND friend_id = tea_submissions.user_id AND status = 'accepted') OR
            (user_id = tea_submissions.user_id AND friend_id = auth.uid() AND status = 'accepted')
    )
  );

CREATE POLICY "Users can insert their own tea submissions"
  ON public.tea_submissions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Storage policies need to be set in the Supabase Dashboard
-- Users can upload to their own folders for profile photos, tea images, and receipts

-- Add some example data for testing (optional)
-- Uncomment if you want test data
/*
INSERT INTO auth.users (id, email) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test1@example.com'),
  ('00000000-0000-0000-0000-000000000002', 'test2@example.com');
*/ 