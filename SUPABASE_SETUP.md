# Supabase Setup Guide for TeaTime

This guide will help you set up the Supabase backend for the TeaTime app.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Click on "New Project"
3. Enter a project name (e.g., "TeaTime")
4. Choose a database password (save this somewhere secure)
5. Choose a region closest to your users
6. Click "Create new project"

## 2. Set Up Database Schema

1. Once your project is created, go to the SQL Editor
2. Copy the entire contents of the `scripts/database-setup.sql` file
3. Paste it into the SQL Editor
4. Click "Run" to execute the SQL script
5. This will create all necessary tables, functions, triggers, and security policies

## 3. Reset Database (If You Encounter Registration Issues)

If you encounter errors like "relation public.profile does not exist" or have trouble with user registration:

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the entire contents of the `scripts/reset-database.sql` file
3. Paste it into the SQL Editor
4. Click "Run" to execute the script
5. This will reset all tables and recreate the schema with the correct structure
6. Important: This will delete all existing data, so only use during development

## 4. Set Up Storage Buckets

You need to create several storage buckets for different types of files:

1. Go to the "Storage" section in the Supabase dashboard
2. Create the following buckets:
   - `profile-images` - For user profile photos
   - `tea-images` - For tea submission photos
   - `receipts` - For donation receipts

For each bucket:
1. Click "Create Bucket"
2. Enter the bucket name
3. Toggle "Public Bucket" to ON (to make files publicly accessible)
4. Click "Create"

## 5. Configure RLS Policies for Storage

Add security policies to your storage buckets:

1. Go to the "Storage" section, then click on a bucket
2. Click on the "Policies" tab
3. For each bucket, add the following policies:

### profile-images Bucket

**Read Policy (Allow public access to profile images)**
- Policy name: "Anyone can view profile images"
- Allowed operations: SELECT
- Policy definition: `true`

**Write Policy (Only the user can upload their own profile image)**
- Policy name: "Users can upload their own profile images"
- Allowed operations: INSERT, UPDATE, DELETE
- Policy definition: `(storage.foldername(name))[1] = auth.uid()::text`

### tea-images Bucket

**Read Policy (Allow friends to view tea images)**
- Policy name: "Friends can view tea images"
- Allowed operations: SELECT
- Policy definition: `true` (For simplicity, all authenticated users can view)

**Write Policy (Only authenticated users can upload tea images)**
- Policy name: "Authenticated users can upload tea images"
- Allowed operations: INSERT
- Policy definition: `auth.role() = 'authenticated'`

### receipts Bucket

**Read Policy (Allow user to view their own receipts)**
- Policy name: "Users can view their own receipts"
- Allowed operations: SELECT
- Policy definition: `(storage.foldername(name))[1] = auth.uid()::text`

**Write Policy (User can upload receipts)**
- Policy name: "Users can upload their receipts"
- Allowed operations: INSERT
- Policy definition: `auth.role() = 'authenticated'`

## 6. Enable Authentication

1. Go to the "Authentication" section
2. Under "Settings", configure:
   - Site URL: Your app's URL (for development, use your Expo development URL)
   - Redirect URLs: Add your app's URL schemes (e.g., `com.yourcompany.teatime://`)

## 7. Update App Configuration

Update the Supabase credentials in your app:

1. Go to the "Settings" section in the Supabase dashboard, then "API"
2. Copy the "URL" and "anon key"
3. Open `services/supabase.ts` in your app
4. Replace the `supabaseUrl` and `supabaseAnonKey` values with your copied values

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

## 8. Understanding Table Relationships

The database schema has two main tables for user data:

1. **users** - Contains personal information:
   - id (references auth.users)
   - email
   - full_name
   - bio
   - location
   - occupation
   - favorite_tea
   - profile_photo
   - hobbies

2. **profiles** - Contains statistics and activity data:
   - id (references auth.users)
   - username
   - streak_count
   - total_teas
   - missed_count
   - total_fines
   - total_donated

During registration, both tables need to be populated correctly with the user's data.

## 9. Testing the Setup

To verify your setup is working correctly:

1. Try signing up a new user through your app
2. Check if the user appears in the Auth > Users section
3. Verify that the user record was created in the `users` and `profiles` tables
4. Test uploading a profile image and submitting a tea entry

## 10. Troubleshooting

- **CORS Issues**: If you encounter CORS errors, go to Settings > API and add your app's URL to the "Additional allowed CORS origins"
- **RLS Issues**: If queries are failing, verify your row-level security policies are set up correctly
- **Authentication Issues**: Check that your site URL and redirect URLs are configured properly
- **Table Not Found**: If you encounter "relation does not exist" errors, run the reset database script in the SQL Editor

## Next Steps

After setup, explore Supabase features that can enhance your app:

- Set up Edge Functions for server-side logic
- Configure social login providers (Google, Apple, etc.)
- Set up database webhooks to trigger events on data changes
- Implement Supabase Realtime for live updates 