import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Profile } from '@/services/profile';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

type ProfileHeaderProps = {
  profile: Profile;
  isCurrentUser: boolean;
  relationshipStatus?: 'none' | 'friends' | 'pending_sent' | 'pending_received';
  onFriendAction?: (action: 'add' | 'accept' | 'reject' | 'remove') => void;
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  profile, 
  isCurrentUser,
  relationshipStatus = 'none',
  onFriendAction 
}) => {
  const router = useRouter();
  
  const handleEditProfile = () => {
    router.push('/profile/edit');
  };
  
  const renderFriendButton = () => {
    switch (relationshipStatus) {
      case 'none':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, styles.addFriendButton]}
            onPress={() => onFriendAction && onFriendAction('add')}
          >
            <Ionicons name="person-add" size={16} color="white" />
            <Text style={styles.actionButtonText}>Add Friend</Text>
          </TouchableOpacity>
        );
      case 'friends':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, styles.friendsButton]}
            onPress={() => onFriendAction && onFriendAction('remove')}
          >
            <Ionicons name="people" size={16} color={Colors.light.tint} />
            <Text style={[styles.actionButtonText, { color: Colors.light.tint }]}>Friends</Text>
          </TouchableOpacity>
        );
      case 'pending_sent':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, styles.pendingButton]}
            onPress={() => onFriendAction && onFriendAction('remove')}
          >
            <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.light.tabIconDefault} />
            <Text style={[styles.actionButtonText, { color: Colors.light.tabIconDefault }]}>Pending</Text>
          </TouchableOpacity>
        );
      case 'pending_received':
        return (
          <View style={styles.friendRequestButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => onFriendAction && onFriendAction('accept')}
            >
              <Ionicons name="checkmark" size={16} color="white" />
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => onFriendAction && onFriendAction('reject')}
            >
              <Ionicons name="close" size={16} color="white" />
              <Text style={styles.actionButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  const DEFAULT_AVATAR = 'https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.webp';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: profile.profile_photo_url || DEFAULT_AVATAR }} 
          style={styles.profileImage} 
          resizeMode="cover"
        />
        
        <View style={styles.nameContainer}>
          <Text style={styles.fullName}>{profile.full_name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          
          {isCurrentUser ? (
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            renderFriendButton()
          )}
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile.total_teas || 0}</Text>
          <Text style={styles.statLabel}>Teas</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile.streak_count || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>${profile.total_donated?.toFixed(2) || '0.00'}</Text>
          <Text style={styles.statLabel}>Donated</Text>
        </View>
      </View>
      
      {profile.bio && (
        <Text style={styles.bio}>{profile.bio}</Text>
      )}
      
      <View style={styles.infoContainer}>
        {profile.location && (
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={16} color={Colors.light.tabIconDefault} />
            <Text style={styles.infoText}>{profile.location}</Text>
          </View>
        )}
        
        {profile.occupation && (
          <View style={styles.infoItem}>
            <Ionicons name="briefcase-outline" size={16} color={Colors.light.tabIconDefault} />
            <Text style={styles.infoText}>{profile.occupation}</Text>
          </View>
        )}
        
        {profile.favorite_tea && (
          <View style={styles.infoItem}>
            <Ionicons name="cafe-outline" size={16} color={Colors.light.tabIconDefault} />
            <Text style={styles.infoText}>Favorite: {profile.favorite_tea}</Text>
          </View>
        )}
      </View>
      
      {profile.hobbies && profile.hobbies.length > 0 && (
        <View style={styles.hobbiesContainer}>
          {profile.hobbies.map((hobby, index) => (
            <View key={index} style={styles.hobbyTag}>
              <Text style={styles.hobbyText}>{hobby}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  nameContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  fullName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.tint,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: Colors.light.tint,
    fontWeight: '500',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  divider: {
    width: 1,
    backgroundColor: '#f0f0f0',
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 8,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hobbyTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  hobbyText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 6,
  },
  addFriendButton: {
    backgroundColor: Colors.light.tint,
  },
  friendsButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  pendingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault,
  },
  acceptButton: {
    backgroundColor: Colors.light.tint,
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: 'red',
  },
  friendRequestButtons: {
    flexDirection: 'row',
  },
});

export default ProfileHeader; 