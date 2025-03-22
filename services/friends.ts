import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type Friend = {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  // Joined information
  friend?: {
    username: string;
    full_name: string;
    profile_photo: string | null;
    streak_count: number;
  };
};

export type FriendRequest = {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending';
  created_at: string;
  // Joined information
  user?: {
    username: string;
    full_name: string;
    profile_photo: string | null;
  };
};

export const friendService = {
  /**
   * Get a user's friends
   */
  getFriends: async (userId: string): Promise<{ data: Friend[]; error: PostgrestError | null }> => {
    try {
      // Get accepted friends where the user is either user_id or friend_id
      const { data: friends1, error: error1 } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          updated_at,
          friend:friend_id(
            username,
            full_name:users!inner(full_name),
            profile_photo:users!inner(profile_photo),
            streak_count
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (error1) {
        console.error('Error fetching friends (part 1):', error1);
        return { data: [], error: error1 };
      }

      // Also get cases where the user is the friend_id
      const { data: friends2, error: error2 } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          updated_at,
          friend:user_id(
            username,
            full_name:users!inner(full_name),
            profile_photo:users!inner(profile_photo),
            streak_count
          )
        `)
        .eq('friend_id', userId)
        .eq('status', 'accepted');

      if (error2) {
        console.error('Error fetching friends (part 2):', error2);
        return { data: [], error: error2 };
      }

      // Combine the results
      const allFriends = [
        ...(friends1 || []),
        ...(friends2 || []).map(friend => ({
          ...friend,
          // Swap user_id and friend_id to maintain consistent perspective
          user_id: friend.friend_id,
          friend_id: friend.user_id,
        })),
      ];

      return { data: allFriends as Friend[], error: null };
    } catch (error) {
      console.error('Error in getFriends:', error);
      return { data: [], error: error as PostgrestError };
    }
  },

  /**
   * Get pending friend requests sent to the user
   */
  getPendingRequests: async (userId: string): Promise<{ data: FriendRequest[]; error: PostgrestError | null }> => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          user:user_id(
            username,
            full_name:users!inner(full_name),
            profile_photo:users!inner(profile_photo)
          )
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching pending requests:', error);
        return { data: [], error };
      }

      return { data: data as FriendRequest[], error: null };
    } catch (error) {
      console.error('Error in getPendingRequests:', error);
      return { data: [], error: error as PostgrestError };
    }
  },

  /**
   * Get sent friend requests by the user
   */
  getSentRequests: async (userId: string): Promise<{ data: FriendRequest[]; error: PostgrestError | null }> => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          friend:friend_id(
            username,
            full_name:users!inner(full_name),
            profile_photo:users!inner(profile_photo)
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching sent requests:', error);
        return { data: [], error };
      }

      // Rename friend to user to match FriendRequest type
      const requests = data.map(request => ({
        ...request,
        user: request.friend,
        friend: undefined,
      }));

      return { data: requests as FriendRequest[], error: null };
    } catch (error) {
      console.error('Error in getSentRequests:', error);
      return { data: [], error: error as PostgrestError };
    }
  },

  /**
   * Send a friend request
   */
  sendFriendRequest: async (userId: string, friendId: string): Promise<{ success: boolean; error: PostgrestError | Error | null; requestId?: string }> => {
    try {
      // Check if already friends or request already sent
      const { data: existingRelation, error: checkError } = await supabase
        .from('friends')
        .select('id, status')
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing relationship:', checkError);
        return { success: false, error: checkError };
      }

      // If already friends, return early
      if (existingRelation) {
        if (existingRelation.status === 'accepted') {
          return { success: false, error: new Error('Already friends') };
        } else if (existingRelation.status === 'pending') {
          return { success: false, error: new Error('Friend request already sent') };
        }
      }

      // Create new friend request
      const { data, error } = await supabase
        .from('friends')
        .insert({
          user_id: userId,
          friend_id: friendId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending friend request:', error);
        return { success: false, error };
      }

      return { success: true, error: null, requestId: data.id };
    } catch (error) {
      console.error('Error in sendFriendRequest:', error);
      return { success: false, error: error as Error };
    }
  },

  /**
   * Accept a friend request
   */
  acceptFriendRequest: async (requestId: string): Promise<{ success: boolean; error: PostgrestError | null }> => {
    try {
      const { error } = await supabase
        .from('friends')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error accepting friend request:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in acceptFriendRequest:', error);
      return { success: false, error: error as PostgrestError };
    }
  },

  /**
   * Decline a friend request
   */
  declineFriendRequest: async (requestId: string): Promise<{ success: boolean; error: PostgrestError | null }> => {
    try {
      const { error } = await supabase
        .from('friends')
        .update({
          status: 'declined',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error declining friend request:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in declineFriendRequest:', error);
      return { success: false, error: error as PostgrestError };
    }
  },

  /**
   * Remove a friend
   */
  removeFriend: async (userId: string, friendId: string): Promise<{ success: boolean; error: PostgrestError | null }> => {
    try {
      // Delete the friend relationship in both directions
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error removing friend:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in removeFriend:', error);
      return { success: false, error: error as PostgrestError };
    }
  },

  /**
   * Cancel a sent friend request
   */
  cancelFriendRequest: async (requestId: string): Promise<{ success: boolean; error: PostgrestError | null }> => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', requestId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error canceling friend request:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in cancelFriendRequest:', error);
      return { success: false, error: error as PostgrestError };
    }
  },
}; 