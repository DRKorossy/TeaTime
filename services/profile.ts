import { PostgrestError } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

export type Profile = {
  // From profiles table
  id: string;
  username: string;
  streak_count: number;
  total_teas: number;
  missed_count: number;
  total_fines: number;
  total_donated: number;
  created_at: string;
  updated_at: string;
  // From users table
  email: string;
  full_name: string;
  bio: string | null;
  location: string | null;
  occupation: string | null;
  favorite_tea: string | null;
  profile_photo_url: string | null;
  hobbies: string[] | null;
};

export const profileService = {
  /**
   * Get a user's profile by their ID
   */
  getProfile: async (userId: string): Promise<{ data: Profile | null; error: PostgrestError | null }> => {
    // Join the users and profiles tables to get all profile information
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        streak_count,
        total_teas,
        missed_count,
        total_fines,
        total_donated,
        created_at,
        updated_at,
        users!inner (
          email,
          full_name,
          bio,
          location,
          occupation,
          favorite_tea,
          profile_photo_url,
          hobbies
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error };
    }

    // Flatten the nested structure for easier consumption
    const profile = data ? {
      id: data.id,
      username: data.username,
      streak_count: data.streak_count,
      total_teas: data.total_teas,
      missed_count: data.missed_count,
      total_fines: data.total_fines,
      total_donated: data.total_donated,
      created_at: data.created_at,
      updated_at: data.updated_at,
      // Extract user data from the nested structure
      email: data.users.email,
      full_name: data.users.full_name,
      bio: data.users.bio,
      location: data.users.location,
      occupation: data.users.occupation,
      favorite_tea: data.users.favorite_tea,
      profile_photo_url: data.users.profile_photo_url,
      hobbies: data.users.hobbies,
    } as Profile : null;

    return { data: profile, error: null };
  },

  /**
   * Update a user's profile information
   */
  updateProfile: async (userId: string, updates: Partial<Profile>): Promise<{ success: boolean; error: PostgrestError | null }> => {
    try {
      // Separate updates for users and profiles tables
      const userUpdates: any = {};
      const profileUpdates: any = {};

      // Determine which fields go to which table
      Object.entries(updates).forEach(([key, value]) => {
        if (['username', 'streak_count', 'total_teas', 'missed_count', 'total_fines', 'total_donated'].includes(key)) {
          profileUpdates[key] = value;
        } else if (['full_name', 'bio', 'location', 'occupation', 'favorite_tea', 'hobbies', 'profile_photo_url'].includes(key)) {
          userUpdates[key] = value;
        }
      });

      // Update the profiles table
      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            ...profileUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          return { success: false, error: profileError };
        }
      }

      // Update the users table
      if (Object.keys(userUpdates).length > 0) {
        const { error: userError } = await supabase
          .from('users')
          .update(userUpdates)
          .eq('id', userId);

        if (userError) {
          console.error('Error updating user:', userError);
          return { success: false, error: userError };
        }
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return { success: false, error: error as PostgrestError };
    }
  },

  /**
   * Upload a profile photo to Supabase storage and update the user's profile
   */
  uploadAvatar: async (userId: string, imageUri: string): Promise<{ success: boolean; error: PostgrestError | Error | null; url?: string }> => {
    try {
      // Generate a unique file name
      const fileExt = imageUri.split('.').pop();
      const fileName = `${userId}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        return { success: false, error: new Error('File not found') };
      }

      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Upload the image to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(filePath, decode(base64), {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) {
        console.error('Error uploading avatar:', error);
        return { success: false, error };
      }

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Update the user's profile_photo_url
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_photo_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating profile with new avatar:', updateError);
        return { success: false, error: updateError };
      }

      return { success: true, error: null, url: publicUrl };
    } catch (error) {
      console.error('Error in uploadAvatar:', error);
      return { success: false, error: error as Error };
    }
  },

  /**
   * Search for users by username or full_name
   */
  searchUsers: async (query: string, limit: number = 20): Promise<{ data: Profile[]; error: PostgrestError | null }> => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        streak_count,
        users!inner (
          full_name,
          profile_photo_url
        )
      `)
      .or(`username.ilike.%${query}%,users.full_name.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error('Error searching users:', error);
      return { data: [], error };
    }

    // Format the returned data
    const profiles = data.map(item => ({
      id: item.id,
      username: item.username,
      streak_count: item.streak_count,
      full_name: item.users.full_name,
      profile_photo_url: item.users.profile_photo_url,
    })) as Partial<Profile>[] as Profile[];

    return { data: profiles, error: null };
  },
};

// Helper function to decode base64
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
} 