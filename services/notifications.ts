import { PostgrestError, RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type NotificationType = 
  | 'teatime' 
  | 'friend_request' 
  | 'friend_accepted' 
  | 'like' 
  | 'comment' 
  | 'fine' 
  | 'verification';

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  content: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
  // For joined data
  sender?: {
    username: string;
    full_name: string;
    profile_photo: string | null;
  };
};

export const notificationService = {
  /**
   * Get notifications for a user
   */
  getNotifications: async (userId: string, limit: number = 20, page: number = 0): Promise<{ data: Notification[]; error: PostgrestError | null }> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:related_id(
            username,
            full_name:users!inner(full_name),
            profile_photo:users!inner(profile_photo)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) {
        console.error('Error fetching notifications:', error);
        return { data: [], error };
      }

      return { data: data as Notification[], error: null };
    } catch (error) {
      console.error('Error in getNotifications:', error);
      return { data: [], error: error as PostgrestError };
    }
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (userId: string): Promise<{ count: number; error: PostgrestError | null }> => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        return { count: 0, error };
      }

      return { count: count || 0, error: null };
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return { count: 0, error: error as PostgrestError };
    }
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId: string): Promise<{ success: boolean; error: PostgrestError | null }> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return { success: false, error: error as PostgrestError };
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (userId: string): Promise<{ success: boolean; error: PostgrestError | null }> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return { success: false, error: error as PostgrestError };
    }
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (notificationId: string): Promise<{ success: boolean; error: PostgrestError | null }> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      return { success: false, error: error as PostgrestError };
    }
  },

  /**
   * Create a new notification
   */
  createNotification: async (
    userId: string,
    type: NotificationType,
    content: string,
    relatedId?: string
  ): Promise<{ success: boolean; error: PostgrestError | null }> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          content,
          related_id: relatedId || null,
          is_read: false,
        });

      if (error) {
        console.error('Error creating notification:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in createNotification:', error);
      return { success: false, error: error as PostgrestError };
    }
  },

  /**
   * Subscribe to realtime notifications
   * Returns a cleanup function to unsubscribe
   */
  subscribeToNotifications: (userId: string, callback: (notification: Notification) => void): (() => void) => {
    const channel: RealtimeChannel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Call the callback with the new notification
          if (payload.new) {
            callback(payload.new as Notification);
          }
        }
      )
      .subscribe();

    // Return a cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Create a teatime reminder notification
   */
  createTeaTimeReminder: async (userId: string): Promise<{ success: boolean; error: PostgrestError | null }> => {
    return await notificationService.createNotification(
      userId,
      'teatime',
      "It's tea time! Don't forget to take your tea selfie within the next 10 minutes."
    );
  },

  /**
   * Create a friend request notification
   */
  createFriendRequestNotification: async (
    userId: string, 
    requesterId: string,
    requesterName: string
  ): Promise<{ success: boolean; error: PostgrestError | null }> => {
    return await notificationService.createNotification(
      userId,
      'friend_request',
      `${requesterName} sent you a friend request.`,
      requesterId
    );
  },

  /**
   * Create a friend accepted notification
   */
  createFriendAcceptedNotification: async (
    userId: string,
    friendId: string,
    friendName: string
  ): Promise<{ success: boolean; error: PostgrestError | null }> => {
    return await notificationService.createNotification(
      userId,
      'friend_accepted',
      `${friendName} accepted your friend request.`,
      friendId
    );
  },

  /**
   * Create a like notification
   */
  createLikeNotification: async (
    submissionUserId: string,
    likerId: string,
    likerName: string,
    submissionId: string
  ): Promise<{ success: boolean; error: PostgrestError | null }> => {
    // Don't notify yourself
    if (submissionUserId === likerId) {
      return { success: true, error: null };
    }
    
    return await notificationService.createNotification(
      submissionUserId,
      'like',
      `${likerName} liked your tea submission.`,
      submissionId
    );
  },

  /**
   * Create a comment notification
   */
  createCommentNotification: async (
    submissionUserId: string,
    commenterId: string,
    commenterName: string,
    submissionId: string
  ): Promise<{ success: boolean; error: PostgrestError | null }> => {
    // Don't notify yourself
    if (submissionUserId === commenterId) {
      return { success: true, error: null };
    }
    
    return await notificationService.createNotification(
      submissionUserId,
      'comment',
      `${commenterName} commented on your tea submission.`,
      submissionId
    );
  },

  /**
   * Create a fine notification
   */
  createFineNotification: async (
    userId: string,
    amount: number,
    fineId: string
  ): Promise<{ success: boolean; error: PostgrestError | null }> => {
    return await notificationService.createNotification(
      userId,
      'fine',
      `You've been fined $${amount.toFixed(2)} for missing tea time.`,
      fineId
    );
  },

  /**
   * Create a verification notification
   */
  createVerificationNotification: async (
    userId: string,
    submissionId: string,
    verified: boolean,
    reason?: string
  ): Promise<{ success: boolean; error: PostgrestError | null }> => {
    const message = verified 
      ? 'Your tea submission has been verified. Cheers!' 
      : `Your tea submission was rejected: ${reason || 'No reason provided'}`;
    
    return await notificationService.createNotification(
      userId,
      'verification',
      message,
      submissionId
    );
  },
}; 