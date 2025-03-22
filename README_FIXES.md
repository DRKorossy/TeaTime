# TeaTime App Registration Fixes

We've fixed two main issues with the registration process in the TeaTime app:

## 1. Row Level Security (RLS) Policy Issue

**Error:** "Error creating user: new row violates row-level security policy for table 'users'"

**Fix:** We created a SQL script that relaxes the INSERT permissions on the `users` and `profiles` tables while maintaining stricter permissions for UPDATE operations. This allows new users to be created during signup.

## 2. Foreign Key Constraint Issue

**Error:** "Error creating user: insert or update on table 'users' violates foreign key constraint 'users_id_fkey'"

**Fix:** We improved the registration process by:
- Creating a database trigger that automatically inserts records into both the `users` and `profiles` tables after a user is created in the `auth.users` table
- Removing the manual insertion code from `auth.tsx` to avoid race conditions
- Ensuring that the foreign key constraints are satisfied by letting the database handle the insertion order

## How to Apply These Fixes

1. **Run the Foreign Key Constraint SQL Fix:**
   - See `HOW_TO_FIX_FOREIGN_KEY.md` for step-by-step instructions
   - This is the most important fix and supersedes the RLS policy fix

2. **Update Your Code:**
   - Update the `auth.tsx` file to remove the manual insertion of records
   - Let the database trigger handle creating user and profile records

## Why This Approach Is Better

- **More Reliable:** Eliminates race conditions in the registration process
- **More Secure:** Uses database triggers with appropriate permissions
- **Simpler Code:** Removes complex error handling from the frontend code
- **Consistent Data:** Ensures user and profile records are always created together

## Testing

After applying these fixes, you should be able to:
1. Successfully register new users
2. Have each user see their own separate profile data and feed
3. Have consistent data across the `auth.users`, `public.users`, and `public.profiles` tables

## Need Help?

If you encounter any issues, check:
1. That the SQL scripts executed successfully
2. That the database trigger was created properly
3. That your code was updated correctly

For detailed instructions, refer to `HOW_TO_FIX_FOREIGN_KEY.md`. 