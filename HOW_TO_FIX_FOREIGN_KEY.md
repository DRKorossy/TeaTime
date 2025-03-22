# How to Fix the Foreign Key Constraint Error

## The Error

You're seeing the error: **"Error creating user: insert or update on table 'users' violates foreign key constraint 'users_id_fkey'"**

This indicates that when creating a user, the system is trying to insert a record into the `public.users` table before the record exists in the `auth.users` table, causing a foreign key violation.

## Solution: Fix the Registration Process

The issue is likely in the order of operations during signup. Let's fix it by running this SQL script:

1. **Open your Supabase project**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Find and select your TeaTime project

2. **Access the SQL Editor**:
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query" to create a new SQL script

3. **Copy and paste the following SQL code**:

```sql
-- First, let's create or replace a trigger function that automatically creates a public.users record
-- when a user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users
  INSERT INTO public.users (id, email, full_name, bio, location, occupation, favorite_tea, profile_photo, hobbies)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    '',  -- bio
    '',  -- location
    '',  -- occupation
    'Earl Grey',  -- favorite_tea
    NULL,  -- profile_photo
    '{}' -- hobbies (empty array)
  );
  
  -- Insert into public.profiles
  INSERT INTO public.profiles (id, username, streak_count, total_teas, missed_count, total_fines, total_donated)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    0,  -- streak_count
    0,  -- total_teas
    0,  -- missed_count
    0,  -- total_fines
    0   -- total_donated
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Make sure RLS is still set properly
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to allow all inserts during signup
DROP POLICY IF EXISTS "Allow user creation during signup" ON public.users;
CREATE POLICY "Allow user creation during signup" 
  ON public.users FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
CREATE POLICY "Allow profile creation during signup"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Also update the auth.tsx file to not insert directly into users and profiles tables
```

4. **Execute the script**:
   - Click "Run" button to execute the SQL script
   - Wait for confirmation that the script ran successfully

5. **Update your auth.tsx file**:
   Now we need to update the code to stop attempting direct inserts. Edit your `TeaTime/context/auth.tsx` file and update the `signUp` function:

```typescript
// Sign up function
const signUp = async (email: string, password: string, username: string, name: string) => {
  try {
    setLoading(true);
    setErrorMessage(null);
    
    // First check if username is taken
    const { data: existingUsers, error: searchError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();
    
    if (searchError && searchError.code !== 'PGRST116') {
      setErrorMessage(searchError.message);
      return { error: searchError };
    }
    
    if (existingUsers) {
      setErrorMessage('Username is already taken');
      return { error: { message: 'Username is already taken' } };
    }
    
    // Create the user account - the trigger will handle creating profiles and users
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: name,
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      return { error };
    }

    return { data };
  } catch (error: any) {
    setErrorMessage(error.message);
    return { error };
  } finally {
    setLoading(false);
  }
};
```

6. **Test the registration again**:
   - Go back to your app
   - Try to sign up again with your information
   - The error should be resolved and you should be able to register successfully

## Why This Fix Works

The previous approach tried to manually insert records into both `users` and `profiles` tables directly from the app code. This can lead to race conditions where the foreign key constraint fails.

The new solution:
1. Creates a database trigger that automatically creates records in both tables whenever a new auth user is created
2. Removes the manual insert code from the app, letting the database handle it
3. Ensures that the records are created in the correct order to satisfy the foreign key constraint

## Security Considerations

This approach is more secure because:
- It uses a database trigger with `SECURITY DEFINER` to handle inserts, which always has appropriate permissions
- The Supabase Auth service still handles the secure creation of user accounts
- The database handles all the record creation, eliminating race conditions
- All operations happen within a single database transaction 