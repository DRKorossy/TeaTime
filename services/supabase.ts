import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Replace with your Supabase URL and anon key from the Supabase dashboard
// You'll need to create a Supabase project and get these values
const supabaseUrl = 'https://ddszdjhdjvvdooownxte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkc3pkamhkanZ2ZG9vb3dueHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NTUyNzIsImV4cCI6MjA1ODAzMTI3Mn0.ej-CPYLQD1fO9ssDe38xlJHseRZksR2h6SFiZgPT7ig';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 