import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Profile } from '@/services/profile';

type ProfileCardProps = {
  profile: Partial<Profile>;
  compact?: boolean;
  showActions?: boolean;
  onFollowToggle?: () => void;
  isFollowing?: boolean;
};

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  compact = false, 
  showActions = false,
  onFollowToggle,
  isFollowing = false
}) => {
  const router = useRouter();

  const handleProfilePress = () => {
    if (profile.id) {
      router.push(`/profile/${profile.id}`);
    }
  };

  const DEFAULT_AVATAR = 'https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.webp';

  return (
    <TouchableOpacity 
      style={[styles.container, compact && styles.compactContainer]} 
      onPress={handleProfilePress}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: profile.profile_photo_url || DEFAULT_AVATAR }} 
        style={[styles.avatar, compact && styles.compactAvatar]} 
        resizeMode="cover"
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{profile.full_name}</Text>
        <Text style={styles.username} numberOfLines={1}>@{profile.username}</Text>
        
        {!compact && profile.bio && (
          <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
        )}
        
        {!compact && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <FontAwesome name="fire" size={14} color={Colors.light.tint} />
              <Text style={styles.statText}>{profile.streak_count || 0} day streak</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cafe-outline" size={16} color={Colors.light.tint} />
              <Text style={styles.statText}>{profile.total_teas || 0} teas</Text>
            </View>
          </View>
        )}
      </View>
      
      {showActions && (
        <TouchableOpacity 
          style={[
            styles.followButton, 
            isFollowing ? styles.followingButton : {}
          ]} 
          onPress={onFollowToggle}
        >
          <Text style={[
            styles.followButtonText, 
            isFollowing ? styles.followingButtonText : {}
          ]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  compactContainer: {
    padding: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  compactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginBottom: 6,
  },
  bio: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginLeft: 4,
  },
  followButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  followButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  followingButtonText: {
    color: Colors.light.tint,
  },
});

export default ProfileCard; 