import { PostgrestError } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';
import { notificationService } from './notifications';

export type Fine = {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  status: 'pending' | 'paid' | 'donated';
  due_date: string;
  created_at: string;
  offense_count: number;
};

export type Donation = {
  id: string;
  user_id: string;
  fine_id: string;
  amount: number;
  receipt_url: string;
  charity_name: string;
  verified: boolean | null;
  created_at: string;
};

export const fineService = {
  /**
   * Get all fines for a user
   */
  getUserFines: async (userId: string): Promise<{ data: Fine[]; error: PostgrestError | null }> => {
    try {
      const { data, error } = await supabase
        .from('fines')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user fines:', error);
        return { data: [], error };
      }

      return { data: data as Fine[], error: null };
    } catch (error) {
      console.error('Error in getUserFines:', error);
      return { data: [], error: error as PostgrestError };
    }
  },

  /**
   * Get a specific fine by ID
   */
  getFineById: async (fineId: string): Promise<{ data: Fine | null; error: PostgrestError | null }> => {
    try {
      const { data, error } = await supabase
        .from('fines')
        .select('*')
        .eq('id', fineId)
        .single();

      if (error) {
        console.error('Error fetching fine:', error);
        return { data: null, error };
      }

      return { data: data as Fine, error: null };
    } catch (error) {
      console.error('Error in getFineById:', error);
      return { data: null, error: error as PostgrestError };
    }
  },

  /**
   * Get unpaid fines for a user
   */
  getUnpaidFines: async (userId: string): Promise<{ data: Fine[]; error: PostgrestError | null }> => {
    try {
      const { data, error } = await supabase
        .from('fines')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching unpaid fines:', error);
        return { data: [], error };
      }

      return { data: data as Fine[], error: null };
    } catch (error) {
      console.error('Error in getUnpaidFines:', error);
      return { data: [], error: error as PostgrestError };
    }
  },

  /**
   * Create a fine for a user (typically called by a server-side function)
   */
  createFine: async (
    userId: string,
    amount: number,
    reason: string,
    offenseCount: number = 1
  ): Promise<{ data: Fine | null; error: PostgrestError | Error | null }> => {
    try {
      // Calculate due date (14 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const { data, error } = await supabase
        .from('fines')
        .insert({
          user_id: userId,
          amount,
          reason,
          status: 'pending',
          due_date: dueDate.toISOString(),
          offense_count: offenseCount,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating fine:', error);
        return { data: null, error };
      }

      // Create a notification for the user
      await notificationService.createFineNotification(
        userId,
        amount,
        data.id
      );

      return { data: data as Fine, error: null };
    } catch (error) {
      console.error('Error in createFine:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Mark a fine as paid
   */
  markFinePaid: async (fineId: string): Promise<{ success: boolean; error: PostgrestError | null }> => {
    try {
      const { error } = await supabase
        .from('fines')
        .update({
          status: 'paid',
        })
        .eq('id', fineId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error marking fine as paid:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in markFinePaid:', error);
      return { success: false, error: error as PostgrestError };
    }
  },

  /**
   * Process a donation for a fine
   */
  submitDonation: async (
    userId: string,
    fineId: string,
    charityName: string,
    amount: number,
    receiptUri: string
  ): Promise<{ data: Donation | null; error: PostgrestError | Error | null }> => {
    try {
      // Generate unique filename for receipt
      const fileExt = receiptUri.split('.').pop();
      const fileName = `${userId}_${fineId}_${Date.now()}.${fileExt}`;
      const filePath = `donation-receipts/${fileName}`;

      // Check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(receiptUri);
      if (!fileInfo.exists) {
        return { data: null, error: new Error('Receipt file not found') };
      }

      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(receiptUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Upload receipt to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, decode(base64), {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading receipt:', uploadError);
        return { data: null, error: uploadError };
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      // Create donation record
      const { data: donationData, error: donationError } = await supabase
        .from('donations')
        .insert({
          user_id: userId,
          fine_id: fineId,
          amount,
          receipt_url: publicUrl,
          charity_name: charityName,
          verified: null, // Will be verified later
        })
        .select()
        .single();

      if (donationError) {
        console.error('Error creating donation record:', donationError);
        return { data: null, error: donationError };
      }

      // Update fine status to donated
      const { error: fineError } = await supabase
        .from('fines')
        .update({
          status: 'donated',
        })
        .eq('id', fineId)
        .eq('status', 'pending');

      if (fineError) {
        console.error('Error updating fine status:', fineError);
        // Don't return error, since donation was created successfully
      }

      // Update user's total_donated in profile
      const { error: profileError } = await supabase.rpc('update_donation_stats', {
        user_id: userId,
        donation_amount: amount,
      });

      if (profileError) {
        console.error('Error updating donation stats:', profileError);
        // Don't return error, since donation was created successfully
      }

      return { data: donationData as Donation, error: null };
    } catch (error) {
      console.error('Error in submitDonation:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Verify a donation
   */
  verifyDonation: async (donationId: string, verified: boolean): Promise<{ success: boolean; error: PostgrestError | null }> => {
    try {
      const { error } = await supabase
        .from('donations')
        .update({
          verified,
        })
        .eq('id', donationId);

      if (error) {
        console.error('Error verifying donation:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in verifyDonation:', error);
      return { success: false, error: error as PostgrestError };
    }
  },

  /**
   * Get donation history for a user
   */
  getUserDonations: async (userId: string): Promise<{ data: Donation[]; error: PostgrestError | null }> => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user donations:', error);
        return { data: [], error };
      }

      return { data: data as Donation[], error: null };
    } catch (error) {
      console.error('Error in getUserDonations:', error);
      return { data: [], error: error as PostgrestError };
    }
  },

  /**
   * Get donation details for a specific fine
   */
  getDonationForFine: async (fineId: string): Promise<{ data: Donation | null; error: PostgrestError | null }> => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('fine_id', fineId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching donation for fine:', error);
        return { data: null, error };
      }

      return { data: data as Donation, error: null };
    } catch (error) {
      console.error('Error in getDonationForFine:', error);
      return { data: null, error: error as PostgrestError };
    }
  },

  /**
   * Calculate fine amount based on offense count
   */
  calculateFineAmount: (offenseCount: number): number => {
    // Base fine is $5, doubles for each subsequent offense
    // 1st offense: $5, 2nd: $10, 3rd: $20, etc.
    const baseFine = 5;
    return baseFine * Math.pow(2, offenseCount - 1);
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