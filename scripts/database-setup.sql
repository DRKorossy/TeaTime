-- Teatime Authority App Database Schema
-- Run this in the Supabase SQL Editor to set up your database

-- Enable RLS (Row Level Security)
alter table auth.users enable row level security;

-- Create users table with extended profile information
create table if not exists public.users (
  id uuid references auth.users(id) primary key,
  email text not null,
  full_name text not null,
  bio text,
  location text,
  occupation text,
  favorite_tea text,
  profile_photo text,
  hobbies text[],
  timezone text default 'UTC',
  verified boolean default false,
  created_at timestamp with time zone default now()
);

-- Create profiles table with stats
create table if not exists public.profiles (
  id uuid references auth.users(id) primary key,
  username text unique not null,
  streak_count integer default 0,
  total_teas integer default 0,
  missed_count integer default 0,
  total_fines numeric default 0,
  total_donated numeric default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create tea submissions table
create table if not exists public.tea_submissions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) not null,
  image_url text not null,
  tea_type text not null,
  submission_time timestamp with time zone not null,
  is_late boolean default false,
  ai_verified boolean,
  rejection_reason text,
  created_at timestamp with time zone default now()
);

-- Create friends table
create table if not exists public.friends (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) not null,
  friend_id uuid references public.users(id) not null,
  status text not null check (status in ('pending', 'accepted', 'declined')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  -- Ensure unique relationships
  unique(user_id, friend_id)
);

-- Create likes table
create table if not exists public.likes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) not null,
  submission_id uuid references public.tea_submissions(id) not null,
  created_at timestamp with time zone default now(),
  -- Ensure users can only like a submission once
  unique(user_id, submission_id)
);

-- Create comments table
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) not null,
  submission_id uuid references public.tea_submissions(id) not null,
  parent_id uuid references public.comments(id),
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create fines table
create table if not exists public.fines (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) not null,
  amount numeric not null,
  reason text not null,
  status text not null check (status in ('pending', 'paid', 'donated')),
  due_date timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  offense_count integer default 1
);

-- Create donations table
create table if not exists public.donations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) not null,
  fine_id uuid references public.fines(id) not null,
  amount numeric not null,
  receipt_url text not null,
  charity_name text not null,
  verified boolean,
  created_at timestamp with time zone default now()
);

-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) not null,
  type text not null check (type in ('teatime', 'friend_request', 'friend_accepted', 'like', 'comment', 'fine', 'verification')),
  content text not null,
  related_id uuid,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- Create indexes for performance
create index if not exists users_email_idx on public.users(email);
create index if not exists profiles_username_idx on public.profiles(username);
create index if not exists friends_user_id_idx on public.friends(user_id);
create index if not exists friends_friend_id_idx on public.friends(friend_id);
create index if not exists friends_status_idx on public.friends(status);
create index if not exists tea_submissions_user_id_idx on public.tea_submissions(user_id);
create index if not exists tea_submissions_submission_time_idx on public.tea_submissions(submission_time);
create index if not exists likes_submission_id_idx on public.likes(submission_id);
create index if not exists comments_submission_id_idx on public.comments(submission_id);
create index if not exists fines_user_id_idx on public.fines(user_id);
create index if not exists fines_status_idx on public.fines(status);
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_is_read_idx on public.notifications(is_read);

-- Create function to update user stats after tea submission
create or replace function public.update_user_stats_after_submission(user_id uuid, is_late boolean)
returns void as $$
declare
  current_streak integer;
begin
  -- Get current streak
  select streak_count into current_streak from public.profiles where id = user_id;
  
  -- Update total teas
  update public.profiles
  set
    total_teas = total_teas + 1,
    streak_count = case when is_late = false then current_streak + 1 else 1 end, -- Reset streak if late
    updated_at = now()
  where id = user_id;
end;
$$ language plpgsql;

-- Create function to update donation stats
create or replace function public.update_donation_stats(user_id uuid, donation_amount numeric)
returns void as $$
begin
  update public.profiles
  set
    total_donated = total_donated + donation_amount,
    updated_at = now()
  where id = user_id;
end;
$$ language plpgsql;

-- Create function to check for missed tea submissions daily
create or replace function public.check_teatime_compliance()
returns void as $$
declare
  u record;
  offense_count integer;
  fine_amount numeric;
begin
  -- Loop through all users
  for u in select id from public.users loop
    -- Check if user submitted tea today
    if not exists (
      select 1 from public.tea_submissions
      where user_id = u.id
      and submission_time::date = current_date
    ) then
      -- Get offense count
      select coalesce(count(*), 0) + 1 into offense_count
      from public.fines
      where user_id = u.id
      and reason = 'Missed tea time'
      and created_at > now() - interval '30 days';
      
      -- Calculate fine amount (base $5, doubles each time)
      fine_amount := 5 * (2 ^ (offense_count - 1));
      
      -- Create fine
      insert into public.fines (user_id, amount, reason, status, due_date, offense_count)
      values (
        u.id,
        fine_amount,
        'Missed tea time',
        'pending',
        now() + interval '14 days',
        offense_count
      );
      
      -- Update missed count
      update public.profiles
      set
        missed_count = missed_count + 1,
        streak_count = 0, -- Reset streak
        total_fines = total_fines + fine_amount,
        updated_at = now()
      where id = u.id;
    end if;
  end loop;
end;
$$ language plpgsql;

-- Create trigger to create notification when a new fine is created
create or replace function public.create_fine_notification()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, content, related_id)
  values (
    new.user_id,
    'fine',
    'You''ve been fined $' || new.amount || ' for ' || new.reason,
    new.id
  );
  return new;
end;
$$ language plpgsql;

create trigger fine_notification_trigger
after insert on public.fines
for each row
execute function public.create_fine_notification();

-- Create trigger to create notification when a user gets a new like
create or replace function public.create_like_notification()
returns trigger as $$
declare
  submission_owner uuid;
  liker_name text;
begin
  -- Get submission owner
  select user_id into submission_owner
  from public.tea_submissions
  where id = new.submission_id;
  
  -- Don't notify for self-likes
  if submission_owner = new.user_id then
    return new;
  end if;
  
  -- Get liker name
  select profiles.username into liker_name
  from public.profiles
  where id = new.user_id;
  
  -- Create notification
  insert into public.notifications (user_id, type, content, related_id)
  values (
    submission_owner,
    'like',
    liker_name || ' liked your tea submission',
    new.submission_id
  );
  
  return new;
end;
$$ language plpgsql;

create trigger like_notification_trigger
after insert on public.likes
for each row
execute function public.create_like_notification();

-- Create trigger to create notification when a user gets a new comment
create or replace function public.create_comment_notification()
returns trigger as $$
declare
  submission_owner uuid;
  commenter_name text;
begin
  -- Get submission owner
  select user_id into submission_owner
  from public.tea_submissions
  where id = new.submission_id;
  
  -- Don't notify for self-comments
  if submission_owner = new.user_id then
    return new;
  end if;
  
  -- Get commenter name
  select profiles.username into commenter_name
  from public.profiles
  where id = new.user_id;
  
  -- Create notification
  insert into public.notifications (user_id, type, content, related_id)
  values (
    submission_owner,
    'comment',
    commenter_name || ' commented on your tea submission',
    new.submission_id
  );
  
  return new;
end;
$$ language plpgsql;

create trigger comment_notification_trigger
after insert on public.comments
for each row
execute function public.create_comment_notification();

-- Create trigger to create notification when a user gets a new friend request
create or replace function public.create_friend_request_notification()
returns trigger as $$
declare
  requester_name text;
begin
  -- Only for new pending requests
  if new.status <> 'pending' then
    return new;
  end if;
  
  -- Get requester name
  select profiles.username into requester_name
  from public.profiles
  where id = new.user_id;
  
  -- Create notification
  insert into public.notifications (user_id, type, content, related_id)
  values (
    new.friend_id,
    'friend_request',
    requester_name || ' sent you a friend request',
    new.user_id
  );
  
  return new;
end;
$$ language plpgsql;

create trigger friend_request_notification_trigger
after insert on public.friends
for each row
execute function public.create_friend_request_notification();

-- Create trigger to create notification when a friend request is accepted
create or replace function public.create_friend_accepted_notification()
returns trigger as $$
declare
  accepter_name text;
begin
  -- Only for newly accepted requests
  if new.status <> 'accepted' or old.status = 'accepted' then
    return new;
  end if;
  
  -- Get accepter name
  select profiles.username into accepter_name
  from public.profiles
  where id = new.friend_id;
  
  -- Create notification
  insert into public.notifications (user_id, type, content, related_id)
  values (
    new.user_id,
    'friend_accepted',
    accepter_name || ' accepted your friend request',
    new.friend_id
  );
  
  return new;
end;
$$ language plpgsql;

create trigger friend_accepted_notification_trigger
after update on public.friends
for each row
execute function public.create_friend_accepted_notification();

-- Set up Row Level Security (RLS) policies

-- Users table policies
create policy "Users can view their own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own data"
  on public.users for update
  using (auth.uid() = id);

-- Profiles table policies
create policy "Profiles are viewable by friends"
  on public.profiles for select
  using (
    auth.uid() = id or
    exists (
      select 1 from public.friends
      where (user_id = auth.uid() and friend_id = id and status = 'accepted') or
            (user_id = id and friend_id = auth.uid() and status = 'accepted')
    )
  );

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Tea submissions policies
create policy "Tea submissions are viewable by owner and friends"
  on public.tea_submissions for select
  using (
    user_id = auth.uid() or
    exists (
      select 1 from public.friends
      where ((user_id = auth.uid() and friend_id = tea_submissions.user_id) or
             (user_id = tea_submissions.user_id and friend_id = auth.uid())) and
            status = 'accepted'
    )
  );

create policy "Users can create their own tea submissions"
  on public.tea_submissions for insert
  with check (user_id = auth.uid());

create policy "Users can update their own tea submissions"
  on public.tea_submissions for update
  using (user_id = auth.uid());

-- Friends policies
create policy "Friends are viewable by either user"
  on public.friends for select
  using (user_id = auth.uid() or friend_id = auth.uid());

create policy "Users can create friend requests"
  on public.friends for insert
  with check (user_id = auth.uid());

create policy "Users can update friend status if they're the recipient"
  on public.friends for update
  using (friend_id = auth.uid());

create policy "Users can delete their own friend requests"
  on public.friends for delete
  using (user_id = auth.uid() and status = 'pending');

-- Likes policies
create policy "Likes are viewable by anyone"
  on public.likes for select
  to authenticated
  using (true);

create policy "Users can create likes"
  on public.likes for insert
  with check (user_id = auth.uid());

create policy "Users can delete their own likes"
  on public.likes for delete
  using (user_id = auth.uid());

-- Comments policies
create policy "Comments are viewable by tea owner and friends"
  on public.comments for select
  using (
    exists (
      select 1 from public.tea_submissions
      where tea_submissions.id = comments.submission_id and
      (
        tea_submissions.user_id = auth.uid() or
        exists (
          select 1 from public.friends
          where ((user_id = auth.uid() and friend_id = tea_submissions.user_id) or
                 (user_id = tea_submissions.user_id and friend_id = auth.uid())) and
                status = 'accepted'
        )
      )
    )
  );

create policy "Users can create comments"
  on public.comments for insert
  with check (user_id = auth.uid());

create policy "Users can update their own comments"
  on public.comments for update
  using (user_id = auth.uid());

create policy "Users can delete their own comments"
  on public.comments for delete
  using (user_id = auth.uid());

-- Fines policies
create policy "Users can view their own fines"
  on public.fines for select
  using (user_id = auth.uid());

-- Donations policies
create policy "Users can view their own donations"
  on public.donations for select
  using (user_id = auth.uid());

create policy "Users can create donations"
  on public.donations for insert
  with check (user_id = auth.uid());

-- Notifications policies
create policy "Users can view their own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can update their own notifications"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "Users can delete their own notifications"
  on public.notifications for delete
  using (user_id = auth.uid());

-- Enable Supabase Realtime for relevant tables
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table friends;
alter publication supabase_realtime add table tea_submissions;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table likes; 