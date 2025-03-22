import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { Profile, profileService } from '@/services/profile';
import { friendsService } from '@/services/friends';
import { teaService } from '@/services/tea';
import ProfileHeader from '@/components/ProfileHeader';
import TeaCard from '@/components/TeaCard';
import EmptyState from '@/components/EmptyState';
import Colors from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [teas, setTeas] = useState<any[]>([]);
  const [relationshipStatus, setRelationshipStatus] = useState<'none' | 'friends' | 'pending_sent' | 'pending_received'>('none');
  const [refreshing, setRefreshing] = useState(false);

  const isCurrentUser = user?.id === id;

  // Fetch profile data
  const fetchProfile = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await profileService.getProfile(id);
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  // Fetch user's teas
  const fetchUserTeas = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await teaService.getUserTeas(id);
      
      if (error) {
        console.error('Error fetching user teas:', error);
        return;
      }
      
      setTeas(data || []);
    } catch (error) {
      console.error('Error in fetchUserTeas:', error);
    }
  };

  // Fetch friendship status if not viewing own profile
  const fetchFriendshipStatus = async () => {
    if (!id || !user || id === user.id) return;
    
    try {
      const { data, error } = await friendsService.getFriendshipStatus(id);
      
      if (error) {
        console.error('Error fetching friendship status:', error);
        return;
      }
      
      setRelationshipStatus(data || 'none');
    } catch (error) {
      console.error('Error in fetchFriendshipStatus:', error);
    }
  };

  const handleFriendAction = async (action: 'add' | 'accept' | 'reject' | 'remove') => {
    if (!id || !user) return;
    
    try {
      let result;
      
      switch (action) {
        case 'add':
          result = await friendsService.sendFriendRequest(id);
          if (result.success) setRelationshipStatus('pending_sent');
          break;
        case 'accept':
          result = await friendsService.acceptFriendRequest(id);
          if (result.success) setRelationshipStatus('friends');
          break;
        case 'reject':
          result = await friendsService.rejectFriendRequest(id);
          if (result.success) setRelationshipStatus('none');
          break;
        case 'remove':
          result = await friendsService.removeFriend(id);
          if (result.success) setRelationshipStatus('none');
          break;
      }
      
    } catch (error) {
      console.error('Error handling friend action:', error);
    }
  };

  const loadAll = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchProfile(),
      fetchUserTeas(),
      fetchFriendshipStatus()
    ]);
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  useEffect(() => {
    loadAll();
  }, [id, user]);

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  // Render error state if profile not found
  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack.Screen 
        options={{
          title: `@${profile.username}`,
          headerTintColor: 'white',
          headerStyle: {
            backgroundColor: Colors.light.tint,
          },
        }} 
      />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader 
          profile={profile}
          isCurrentUser={isCurrentUser}
          relationshipStatus={relationshipStatus}
          onFriendAction={handleFriendAction}
        />
        
        <View style={styles.teaListContainer}>
          <Text style={styles.sectionTitle}>Recent Teas</Text>
          
          {teas.length === 0 ? (
            <EmptyState 
              icon="cafe-outline"
              title="No tea time recorded yet"
              message={isCurrentUser ? 
                "You haven't recorded any tea time yet! When you do, they'll appear here." : 
                `${profile.username} hasn't recorded any tea time yet.`
              }
            />
          ) : (
            teas.map(tea => (
              <TeaCard key={tea.id} tea={tea} />
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'gray',
  },
  teaListContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
}); 