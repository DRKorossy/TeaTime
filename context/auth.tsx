import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

// Define Auth Context type
type AuthContextType = {
  session: Session | null;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, username: string, name: string) => Promise<any>;
  signOut: () => Promise<any>;
  loading: boolean;
  errorMessage: string | null;
};

// Create Auth Context
const AuthContext = createContext<AuthContextType>({
  session: null,
  initialized: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  loading: false,
  errorMessage: null,
});

// Export Auth Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check for active session on component mount
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setInitialized(true);
      })
      .catch(error => {
        console.error('Error getting session:', error.message);
        setInitialized(true);
      });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
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
      
      // Create the user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            name,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return { error };
      }

      // After signup, create a profile entry
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              username,
              name,
              email,
              avatar_url: null,
              bio: '',
              location: '',
              favorite_tea: 'Earl Grey',
            },
          ]);

        if (profileError) {
          setErrorMessage(profileError.message);
          return { error: profileError };
        }
      }

      return { data };
    } catch (error: any) {
      setErrorMessage(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setErrorMessage(error.message);
        return { error };
      }
      
      return { success: true };
    } catch (error: any) {
      setErrorMessage(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        session,
        initialized,
        signIn,
        signUp,
        signOut,
        loading,
        errorMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Export hook for using auth context
export const useAuth = () => useContext(AuthContext); 