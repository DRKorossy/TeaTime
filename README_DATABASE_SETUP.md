# TeaTime App Database Setup Guide

This guide will help you set up the database for the TeaTime app correctly. Follow these steps to fix registration issues and ensure user data is properly saved.

## Issue: User Registration Not Working

If you're experiencing any of these issues:
- "Error creating user: new row violates row-level security policy for table 'users'"
- "Error creating user: insert or update on table 'users' violates foreign key constraint 'users_id_fkey'"
- Registration appears to work but no user data is saved in the database tables
- You can log in but your profile data isn't showing up

## Solution: Complete Database Reset and Setup

### 1. Access Your Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your TeaTime project
3. Navigate to the "SQL Editor" section in the left sidebar

### 2. Run the Complete Fix Script

1. Create a new SQL query by clicking "New Query"
2. Copy and paste the entire content from `TeaTime/scripts/complete-fix.sql`
3. Click "Run" to execute the script
4. Wait for confirmation that all operations completed successfully

This script will:
- Drop all existing tables to start fresh
- Create all necessary tables with proper structure
- Set up a trigger to automatically create user profiles when a user signs up
- Configure Row Level Security policies for proper data access

### 3. Set Up Storage Buckets

The app needs storage buckets for user-uploaded images:

1. Go to "Storage" in the Supabase dashboard
2. Create three buckets:
   - `profile-images` - For profile photos
   - `tea-images` - For tea submission photos
   - `receipts` - For donation receipts

3. Set up policies for each bucket:
   - Enable Row Level Security on each bucket
   - Add policies to allow users to read/write to their own folders

Example policy for `profile-images`:
```sql
-- Allow users to upload to their own folder
CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to read their own profile images
CREATE POLICY "Users can view their own profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 4. Understanding Data Storage

1. **Password Storage**: 
   - Passwords are **never** stored in our database tables
   - Supabase Auth automatically handles password hashing and security
   - The auth.users table securely stores password hashes using Argon2/Bcrypt
   - Our public.users table only contains non-sensitive information

2. **Image Storage**:
   - Profile photos, tea images, and receipts are stored in Supabase Storage
   - Only the URLs to these images are stored in the database
   - The table fields like `profile_photo_url` and `image_url` store references, not actual binary data
   - When uploading images, create a path like `{user_id}/{filename}` for proper organization

### 5. Check Database Tables

After running the script, verify that the tables were created:

1. In Supabase, go to "Table Editor" in the left sidebar
2. You should see the following tables:
   - users
   - profiles
   - tea_submissions
   - friends
   - likes
   - comments
   - fines
   - donations
   - notifications

### 6. Try Registering Again

1. Go back to your app
2. Try to register a new account
3. You should be automatically logged in and redirected to your feed after successful registration

### 7. Verify Data Creation

To check if user data was created properly:

1. In Supabase, go to "Table Editor" > "Authentication" > "Users"
2. Find your newly created user
3. Then go to "Table Editor" > "users" and "profiles"
4. You should see entries corresponding to your user in both tables

### How This Fix Works

The fix resolves several issues:

1. **Database Trigger**: Creates a trigger function that automatically inserts records into both `users` and `profiles` tables when a user signs up.

2. **Improved Security**: Configures Row Level Security policies that allow proper access while maintaining security.

3. **Code Improvements**: Updates the registration process to redirect users to their feed after successful signup.

4. **Proper Data Handling**: Ensures sensitive data like passwords are handled by Supabase Auth, while implementing proper storage for user images.

### Troubleshooting

If you still encounter issues:

1. **Check Supabase Logs**: Go to "Database" > "Logs" to see if there are any errors during registration.

2. **Verify Trigger Creation**: Run `SELECT * FROM pg_trigger;` in the SQL Editor to confirm the trigger exists.

3. **Test Manual Insertion**: Try manually inserting a test user in the Auth section and check if the trigger creates the associated records.

4. **Check for Console Errors**: Open your browser's developer console to look for any JavaScript errors during registration. 