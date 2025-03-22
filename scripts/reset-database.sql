-- Reset Teatime Authority App Database
-- WARNING: This will delete all data in your database

-- First, drop all tables in the correct order to avoid foreign key constraints
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.donations;
DROP TABLE IF EXISTS public.fines;
DROP TABLE IF EXISTS public.comments;
DROP TABLE IF EXISTS public.likes;
DROP TABLE IF EXISTS public.friends;
DROP TABLE IF EXISTS public.tea_submissions;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.users;

-- Now recreate all tables using the correct schema

-- Create users table with extended profile information
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  occupation TEXT,
  favorite_tea TEXT,
  profile_photo TEXT,
  hobbies TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profiles table with stats
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

-- Create tea submissions table
CREATE TABLE IF NOT EXISTS public.tea_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  image_url TEXT NOT NULL,
  tea_type TEXT NOT NULL,
  submission_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_late BOOLEAN DEFAULT false,
  ai_verified BOOLEAN,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create friends table
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  friend_id UUID REFERENCES public.users(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Ensure unique relationships
  UNIQUE(user_id, friend_id)
);

-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  submission_id UUID REFERENCES public.tea_submissions(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Ensure users can only like a submission once
  UNIQUE(user_id, submission_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  submission_id UUID REFERENCES public.tea_submissions(id) NOT NULL,
  parent_id UUID REFERENCES public.comments(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create fines table
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

-- Create donations table
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  fine_id UUID REFERENCES public.fines(id) NOT NULL,
  amount NUMERIC NOT NULL,
  receipt_url TEXT NOT NULL,
  charity_name TEXT NOT NULL,
  verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('teatime', 'friend_request', 'friend_accepted', 'like', 'comment', 'fine', 'verification')),
  content TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS friends_user_id_idx ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS friends_friend_id_idx ON public.friends(friend_id);
CREATE INDEX IF NOT EXISTS friends_status_idx ON public.friends(status);
CREATE INDEX IF NOT EXISTS tea_submissions_user_id_idx ON public.tea_submissions(user_id);
CREATE INDEX IF NOT EXISTS tea_submissions_submission_time_idx ON public.tea_submissions(submission_time);
CREATE INDEX IF NOT EXISTS likes_submission_id_idx ON public.likes(submission_id);
CREATE INDEX IF NOT EXISTS comments_submission_id_idx ON public.comments(submission_id);
CREATE INDEX IF NOT EXISTS fines_user_id_idx ON public.fines(user_id);
CREATE INDEX IF NOT EXISTS fines_status_idx ON public.fines(status);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON public.notifications(is_read);

-- Create triggers and functions for notifications and stats
-- Only adding essential functions for registration to work

-- Create function to update user stats after tea submission
CREATE OR REPLACE FUNCTION public.update_user_stats_after_submission(user_id UUID, is_late BOOLEAN)
RETURNS VOID AS $$
DECLARE
  current_streak INTEGER;
BEGIN
  -- Get current streak
  SELECT streak_count INTO current_streak FROM public.profiles WHERE id = user_id;
  
  -- Update total teas
  UPDATE public.profiles
  SET
    total_teas = total_teas + 1,
    streak_count = CASE WHEN is_late = false THEN current_streak + 1 ELSE 1 END, -- Reset streak if late
    updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update donation stats
CREATE OR REPLACE FUNCTION public.update_donation_stats(user_id UUID, donation_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET
    total_donated = total_donated + donation_amount,
    updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Set up Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tea_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Profiles table policies
CREATE POLICY "Profiles are viewable by friends"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.friends
      WHERE (user_id = auth.uid() AND friend_id = id AND status = 'accepted') OR
            (user_id = id AND friend_id = auth.uid() AND status = 'accepted')
    )
  );

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id); 