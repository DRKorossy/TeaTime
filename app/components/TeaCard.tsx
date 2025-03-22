import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { TeaSubmission, teaService } from '@/services/tea';
import { useAuth } from '@/providers/AuthProvider';
import Colors from '@/constants/Colors';
import { formatDistanceToNow } from 'date-fns';

interface TeaCardProps {
  tea: TeaSubmission;
  onLikeToggle?: (tea: TeaSubmission) => void;
  showHeader?: boolean;
}

const TeaCard: React.FC<TeaCardProps> = ({ 
  tea, 
  onLikeToggle,
  showHeader = true 
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [likes, setLikes] = useState(tea.likes_count || 0);
  const [hasLiked, setHasLiked] = useState(tea.has_liked || false);
  const [isLiking, setIsLiking] = useState(false);

  const handleProfilePress = () => {
    if (tea.user_id) {
      router.push(`/profile/${tea.user_id}`);
    }
  };

  const handleTeaPress = () => {
    router.push(`/tea/${tea.id}`);
  };

  const handleLikePress = async () => {
    if (!user || isLiking) return;
    
    setIsLiking(true);
    
    try {
      if (hasLiked) {
        // Unlike
        await teaService.unlikeTea(user.id, tea.id);
        setLikes(prev => Math.max(0, prev - 1));
        setHasLiked(false);
      } else {
        // Like
        await teaService.likeTea(user.id, tea.id);
        setLikes(prev => prev + 1);
        setHasLiked(true);
      }
      
      if (onLikeToggle) {
        onLikeToggle({
          ...tea,
          likes_count: hasLiked ? likes - 1 : likes + 1,
          has_liked: !hasLiked
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'some time ago';
    }
  };

  // Default avatar if profile pic is missing
  const DEFAULT_AVATAR = 'https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.webp';

  return (
    <View style={styles.container}>
      {showHeader && (
        <TouchableOpacity style={styles.header} onPress={handleProfilePress}>
          <Image 
            source={{ uri: tea.profile_photo_url || DEFAULT_AVATAR }} 
            style={styles.avatar} 
          />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{tea.user_full_name}</Text>
            <Text style={styles.username}>@{tea.username}</Text>
          </View>
          <Text style={styles.time}>{formatTimeAgo(tea.created_at)}</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity style={styles.contentContainer} onPress={handleTeaPress}>
        <Text style={styles.description}>{tea.description}</Text>
        
        {tea.image_url && (
          <Image 
            source={{ uri: tea.image_url }} 
            style={styles.teaImage} 
            resizeMode="cover"
          />
        )}
        
        <View style={styles.teaInfo}>
          <View style={styles.teaTypeContainer}>
            <Ionicons name="cafe-outline" size={16} color={Colors.light.tint} />
            <Text style={styles.teaType}>{tea.tea_type}</Text>
          </View>
          
          {tea.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color={Colors.light.tabIconDefault} />
              <Text style={styles.location}>{tea.location}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleLikePress}
          disabled={isLiking || !user}
        >
          <FontAwesome 
            name={hasLiked ? "heart" : "heart-o"} 
            size={18} 
            color={hasLiked ? Colors.light.tint : Colors.light.tabIconDefault} 
          />
          {likes > 0 && <Text style={styles.actionCount}>{likes}</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleTeaPress}
        >
          <FontAwesome name="comment-o" size={18} color={Colors.light.tabIconDefault} />
          {tea.comments_count > 0 && (
            <Text style={styles.actionCount}>{tea.comments_count}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontWeight: '600',
    fontSize: 14,
  },
  username: {
    color: Colors.light.tabIconDefault,
    fontSize: 12,
  },
  time: {
    color: Colors.light.tabIconDefault,
    fontSize: 12,
  },
  contentContainer: {
    padding: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    color: Colors.light.text,
  },
  teaImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  teaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  teaTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  teaType: {
    fontSize: 12,
    color: Colors.light.tint,
    marginLeft: 4,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  location: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionCount: {
    marginLeft: 6,
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
});

export default TeaCard; 