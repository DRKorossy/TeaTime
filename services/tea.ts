import { PostgrestError } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';
import { format } from 'date-fns';
import { supabase } from './supabase';

export interface TeaSubmission {
  id: string;
  user_id: string;
  description: string;
  image_url: string | null;
  location: string | null;
  created_at: string;
  tea_type: string;
  likes_count: number;
  comments_count: number;
  // Join fields
  user_full_name?: string;
  username?: string;
  profile_photo_url?: string | null;
  // Client-side state
  has_liked?: boolean;
}

export const teaService = {
  /**
   * Get tea submissions for the feed
   */
  getFeedTeas: async (limit: number = 20, page: number = 1): Promise<{ data: TeaSubmission[]; error: PostgrestError | null }> => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error } = await supabase
      .from('tea_submissions')
      .select(`
        id,
        user_id,
        description,
        image_url,
        location,
        created_at,
        tea_type,
        likes_count,
        comments_count,
        users!inner (
          full_name,
          profiles!inner (
            username,
            profile_photo_url
          )
        )
      `)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching feed teas:', error);
      return { data: [], error };
    }

    // Fetch whether the current user has liked each post
    const currentUser = (await supabase.auth.getSession()).data.session?.user;
    
    // Format the response
    const teas = data.map(tea => ({
      id: tea.id,
      user_id: tea.user_id,
      description: tea.description,
      image_url: tea.image_url,
      location: tea.location,
      created_at: tea.created_at,
      tea_type: tea.tea_type,
      likes_count: tea.likes_count,
      comments_count: tea.comments_count,
      user_full_name: tea.users.full_name,
      username: tea.users.profiles.username,
      profile_photo_url: tea.users.profiles.profile_photo_url,
    })) as TeaSubmission[];

    // If user is logged in, check likes
    if (currentUser) {
      const { data: likesData } = await supabase
        .from('likes')
        .select('tea_id')
        .eq('user_id', currentUser.id)
        .in('tea_id', teas.map(t => t.id));

      if (likesData) {
        const likedTeaIds = new Set(likesData.map(like => like.tea_id));
        teas.forEach(tea => {
          tea.has_liked = likedTeaIds.has(tea.id);
        });
      }
    }

    return { data: teas, error: null };
  },

  /**
   * Get tea submissions by a specific user
   */
  getUserTeas: async (userId: string): Promise<{ data: TeaSubmission[]; error: PostgrestError | null }> => {
    const { data, error } = await supabase
      .from('tea_submissions')
      .select(`
        id,
        user_id,
        description,
        image_url,
        location,
        created_at,
        tea_type,
        likes_count,
        comments_count,
        users!inner (
          full_name,
          profiles!inner (
            username,
            profile_photo_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user teas:', error);
      return { data: [], error };
    }

    // Fetch whether the current user has liked each post
    const currentUser = (await supabase.auth.getSession()).data.session?.user;
    
    // Format the response
    const teas = data.map(tea => ({
      id: tea.id,
      user_id: tea.user_id,
      description: tea.description,
      image_url: tea.image_url,
      location: tea.location,
      created_at: tea.created_at,
      tea_type: tea.tea_type,
      likes_count: tea.likes_count,
      comments_count: tea.comments_count,
      user_full_name: tea.users.full_name,
      username: tea.users.profiles.username,
      profile_photo_url: tea.users.profiles.profile_photo_url,
    })) as TeaSubmission[];

    // If user is logged in, check likes
    if (currentUser) {
      const { data: likesData } = await supabase
        .from('likes')
        .select('tea_id')
        .eq('user_id', currentUser.id)
        .in('tea_id', teas.map(t => t.id));

      if (likesData) {
        const likedTeaIds = new Set(likesData.map(like => like.tea_id));
        teas.forEach(tea => {
          tea.has_liked = likedTeaIds.has(tea.id);
        });
      }
    }

    return { data: teas, error: null };
  },

  /**
   * Get a single tea submission by ID
   */
  getTea: async (teaId: string): Promise<{ data: TeaSubmission | null; error: PostgrestError | null }> => {
    const { data, error } = await supabase
      .from('tea_submissions')
      .select(`
        id,
        user_id,
        description,
        image_url,
        location,
        created_at,
        tea_type,
        likes_count,
        comments_count,
        users!inner (
          full_name,
          profiles!inner (
            username,
            profile_photo_url
          )
        )
      `)
      .eq('id', teaId)
      .single();

    if (error) {
      console.error('Error fetching tea:', error);
      return { data: null, error };
    }

    // Fetch whether the current user has liked this post
    const currentUser = (await supabase.auth.getSession()).data.session?.user;
    
    // Format the response
    const tea = {
      id: data.id,
      user_id: data.user_id,
      description: data.description,
      image_url: data.image_url,
      location: data.location,
      created_at: data.created_at,
      tea_type: data.tea_type,
      likes_count: data.likes_count,
      comments_count: data.comments_count,
      user_full_name: data.users.full_name,
      username: data.users.profiles.username,
      profile_photo_url: data.users.profiles.profile_photo_url,
    } as TeaSubmission;

    // If user is logged in, check if they liked this tea
    if (currentUser) {
      const { data: likeData, error: likeError } = await supabase
        .from('likes')
        .select()
        .eq('user_id', currentUser.id)
        .eq('tea_id', teaId)
        .single();

      if (!likeError) {
        tea.has_liked = !!likeData;
      }
    }

    return { data: tea, error: null };
  },

  /**
   * Create a new tea submission
   */
  submitTea: async (
    userId: string,
    teaData: {
      description: string;
      tea_type: string;
      location?: string;
      image?: string;
    }
  ): Promise<{ data: TeaSubmission | null; error: PostgrestError | Error | null }> => {
    try {
      let imageUrl = null;

      // If an image was provided, upload it first
      if (teaData.image) {
        const { url, error } = await teaService.uploadTeaImage(userId, teaData.image);
        if (error) {
          console.error('Error uploading tea image:', error);
          return { data: null, error };
        }
        imageUrl = url;
      }

      // Create the tea submission in the database
      const { data, error } = await supabase
        .from('tea_submissions')
        .insert({
          user_id: userId,
          description: teaData.description,
          tea_type: teaData.tea_type,
          location: teaData.location || null,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting tea:', error);
        return { data: null, error };
      }

      // Return the created submission
      return { data: data as TeaSubmission, error: null };
    } catch (error) {
      console.error('Error in submitTea:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Upload a tea image to Supabase storage
   */
  uploadTeaImage: async (userId: string, imageUri: string): Promise<{ url: string | null; error: Error | null }> => {
    try {
      // Generate a unique file name
      const fileExt = imageUri.split('.').pop();
      const fileName = `${userId}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        return { url: null, error: new Error('File not found') };
      }

      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Upload the image to Supabase Storage
      const { data, error } = await supabase.storage
        .from('tea-images')
        .upload(filePath, decode(base64), {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) {
        console.error('Error uploading tea image:', error);
        return { url: null, error };
      }

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('tea-images')
        .getPublicUrl(filePath);

      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Error in uploadTeaImage:', error);
      return { url: null, error: error as Error };
    }
  },

  /**
   * Like a tea submission
   */
  likeTea: async (userId: string, teaId: string): Promise<{ success: boolean; error: PostgrestError | null }> => {
    // Check if the user has already liked this tea
    const { data: existingLike } = await supabase
      .from('likes')
      .select()
      .eq('user_id', userId)
      .eq('tea_id', teaId)
      .single();

    if (existingLike) {
      // User has already liked the tea
      return { success: true, error: null };
    }

    // Add the like
    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        tea_id: teaId,
      });

    if (error) {
      console.error('Error liking tea:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  },

  /**
   * Unlike a tea submission
   */
  unlikeTea: async (userId: string, teaId: string): Promise<{ success: boolean; error: PostgrestError | null }> => {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('tea_id', teaId);

    if (error) {
      console.error('Error unliking tea:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  },

  /**
   * Add a comment to a tea submission
   */
  addComment: async (userId: string, teaId: string, text: string): Promise<{ success: boolean; error: PostgrestError | null }> => {
    const { error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        tea_id: teaId,
        text,
      });

    if (error) {
      console.error('Error adding comment:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  },

  /**
   * Get comments for a tea submission
   */
  getComments: async (teaId: string): Promise<{ data: any[]; error: PostgrestError | null }> => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        text,
        created_at,
        user_id,
        users!inner (
          full_name,
          profiles!inner (
            username,
            profile_photo_url
          )
        )
      `)
      .eq('tea_id', teaId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return { data: [], error };
    }

    // Format the response
    const comments = data.map(comment => ({
      id: comment.id,
      text: comment.text,
      created_at: comment.created_at,
      user_id: comment.user_id,
      user_full_name: comment.users.full_name,
      username: comment.users.profiles.username,
      profile_photo_url: comment.users.profiles.profile_photo_url,
    }));

    return { data: comments, error: null };
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