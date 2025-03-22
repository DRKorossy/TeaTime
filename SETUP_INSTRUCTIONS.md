# TeaTime App Setup Instructions

This guide will help you fix the database setup issues and ensure proper user registration and profile handling in the TeaTime app.

## 1. Reset Database Tables

The error "relation public.profile does not exist" indicates that there's an issue with your database schema. Follow these steps to fix it:

1. Log in to your [Supabase dashboard](https://app.supabase.com)
2. Select your TeaTime project
3. Go to the SQL Editor
4. Copy and paste the entire contents of the `TeaTime/scripts/reset-database.sql` file
5. Click "Run" to execute the script

This script will:
- Drop all existing tables to start fresh
- Create the correct schema with proper table names and relationships
- Set up Row Level Security policies to ensure data privacy
- Create necessary functions for user stats

## 2. Fix Row Level Security Policy Issues

If you encounter the error "Error creating user: new row violates row-level security policy for table 'users'" during registration:

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the entire contents of the `TeaTime/scripts/fix-rls-policy.sql` file
3. Click "Run" to execute the script

This script will:
- Fix the overly restrictive RLS policies that prevent new user creation
- Allow inserting new records during the signup process
- Maintain appropriate security for update operations
- Keep data properly protected while enabling necessary functionality

Note on security: This approach maintains security by:
- Only relaxing the INSERT permissions which are necessary for account creation
- Keeping stricter policies for UPDATE operations (users can only modify their own data)
- Relying on Supabase Auth service to handle the secure signup process

## 3. Test the Registration

After fixing the database schema and RLS policies, try registering in the app:

1. Open the app
2. Click "Create Account" on the welcome screen
3. Fill in your information and submit
4. You should now be able to sign up successfully

## 4. Understanding the Fixed Issues

The original issues were:

1. **Incorrect table name**: The error "relation public.profile does not exist" occurred because the code was referencing a singular name "profile" while the actual table is named "profiles" (plural).

2. **Inconsistent data structure**: The registration code was trying to insert fields that didn't match the actual database schema structure, which has a separation between:
   - `users` table (personal info like name, bio, etc.)
   - `profiles` table (stats and activity data like streak count)

3. **Restrictive Row Level Security policies**: The RLS policies were preventing new users from being created because of a chicken-and-egg problem: users couldn't insert their own data because they weren't authenticated yet, but they needed to insert data to become authenticated.

## 5. Creating Multiple Users for Testing

You can now create multiple user accounts to test the functionality:

1. Register a user (e.g., "Alice")
2. Complete the onboarding process
3. Log out
4. Register another user (e.g., "Ben")
5. Complete the onboarding process

Each user will now have:
- Their own separate profile
- Independent tea submission feed
- Separate friends list and notifications
- Individual stats and streaks

## 6. Troubleshooting

If you encounter any issues:

- Check the browser console or app logs for specific error messages
- Ensure all tables were created successfully in Supabase
- Verify that all required extensions are enabled in Supabase
- Make sure the Supabase URL and anon key in `services/supabase.ts` are correct

## 7. Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Expo Documentation](https://docs.expo.dev) 