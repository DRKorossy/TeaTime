import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Card, Avatar, Divider, IconButton, ActivityIndicator, TextInput } from 'react-native-paper';
import { format, differenceInSeconds, set } from 'date-fns';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import Config from '../../constants/Config';
import { useRouter } from 'expo-router';

// Mock feed data
const MOCK_FEED = [
  {
    id: 'post1',
    user: {
      id: 'user2',
      name: 'Sarah Miller',
      username: 'sarahm',
      avatarUrl: 'https://i.pravatar.cc/150?img=4',
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1121&q=80',
    teaType: 'English Breakfast',
    likes: 5,
    comments: [
      {
        id: 'comment1',
        user: {
          id: 'user3',
          name: 'David Wilson',
          username: 'davidw',
          avatarUrl: 'https://i.pravatar.cc/150?img=3',
        },
        text: 'Excellent choice of tea, old chap!',
        timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
      },
    ],
    isOnTime: true,
  },
  {
    id: 'post2',
    user: {
      id: 'user4',
      name: 'Michael Brown',
      username: 'michaelb',
      avatarUrl: 'https://i.pravatar.cc/150?img=5',
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    teaType: 'Earl Grey',
    likes: 2,
    comments: [],
    isOnTime: false,
    fine: {
      amount: 5.00,
      status: 'Unpaid',
    },
  },
];

// Types
type TeaTime = {
  hours: number;
  minutes: number;
  seconds: number;
};

type FeedItem = (typeof MOCK_FEED)[0];
type Comment = FeedItem['comments'][0];

export default function HomeScreen() {
  const [feed, setFeed] = useState<FeedItem[]>(MOCK_FEED);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TeaTime>({ hours: 0, minutes: 0, seconds: 0 });
  const [isTeaTime, setIsTeaTime] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const router = useRouter();

  // Calculate time until next tea time (5:00 PM)
  const calculateTimeUntilTeaTime = useCallback(() => {
    const now = new Date();
    const teaTime = set(now, { hours: Config.teatime.hour, minutes: Config.teatime.minute, seconds: 0 });
    
    // If tea time is in the past for today, calculate for tomorrow
    if (now > teaTime) {
      teaTime.setDate(teaTime.getDate() + 1);
    }
    
    const totalSeconds = differenceInSeconds(teaTime, now);
    
    // Check if it's currently tea time (5:00-5:10 PM)
    const isCurrentlyTeaTime = now.getHours() === Config.teatime.hour && 
                              now.getMinutes() >= Config.teatime.minute && 
                              now.getMinutes() < (Config.teatime.minute + Config.teatime.submissionWindowMinutes);
    
    setIsTeaTime(isCurrentlyTeaTime);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    setTimeRemaining({ hours, minutes, seconds });
  }, []);

  // Timer effect
  useEffect(() => {
    calculateTimeUntilTeaTime();
    const interval = setInterval(calculateTimeUntilTeaTime, 1000);
    return () => clearInterval(interval);
  }, [calculateTimeUntilTeaTime]);

  // Simulate a refresh
  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, this would fetch new data from Supabase
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Toggle comment visibility
  const toggleComments = (postId: string) => {
    if (expandedComments.includes(postId)) {
      setExpandedComments(expandedComments.filter(id => id !== postId));
    } else {
      setExpandedComments([...expandedComments, postId]);
    }
  };

  // Like a post
  const handleLike = (postId: string) => {
    setFeed(prevFeed => {
      return prevFeed.map(post => {
        if (post.id === postId) {
          return { ...post, likes: post.likes + 1 } as FeedItem;
        }
        return post;
      });
    });
  };

  // Add a comment
  const handleAddComment = (postId: string) => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: `comment${Date.now()}`,
        user: {
          id: 'user1', // Current user
          name: 'James Wilson',
          username: 'jameswilson',
          avatarUrl: 'https://i.pravatar.cc/150?img=8',
        },
        text: newComment.trim(),
        timestamp: new Date(),
      };

      // Use an explicit function with type assertion
      setFeed(prevFeed => {
        return prevFeed.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...post.comments, newCommentObj]
            } as FeedItem;
          }
          return post;
        });
      });

      setNewComment('');
    }
  };

  // Take tea photo
  const handleTakePhoto = () => {
    // Navigate to the tea submission modal
    router.push('/(modals)/tea-submission');
  };

  // Format timestamp
  const formatPostTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return format(date, 'MMM d');
    }
  };

  // Render a feed item
  const renderFeedItem = ({ item }: { item: FeedItem }) => {
    const areCommentsExpanded = expandedComments.includes(item.id);
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          {/* User header */}
          <View style={styles.postHeader}>
            <View style={styles.userInfo}>
              <Avatar.Image size={40} source={{ uri: item.user.avatarUrl }} />
              <View style={styles.nameContainer}>
                <Text variant="titleMedium">{item.user.name}</Text>
                <Text variant="bodySmall" style={styles.usernameText}>@{item.user.username}</Text>
              </View>
            </View>
            <View style={styles.postMeta}>
              <Text variant="bodySmall" style={styles.timestamp}>{formatPostTime(item.timestamp)}</Text>
              {!item.isOnTime && (
                <Text variant="bodySmall" style={styles.lateTag}>LATE</Text>
              )}
            </View>
          </View>
          
          {/* Tea image */}
          <Image source={{ uri: item.imageUrl }} style={styles.teaImage} />
          
          {/* Tea details */}
          <View style={styles.teaInfo}>
            <Text variant="bodyMedium">Tea type: {item.teaType}</Text>
            {item.fine && (
              <Text variant="bodySmall" style={styles.fineText}>
                Fine: £{item.fine.amount.toFixed(2)} ({item.fine.status})
              </Text>
            )}
          </View>
          
          {/* Interaction buttons */}
          <View style={styles.interactions}>
            <Button 
              icon="heart" 
              mode="text" 
              onPress={() => handleLike(item.id)}
              style={styles.interactionButton}
            >
              {item.likes}
            </Button>
            <Button 
              icon="comment" 
              mode="text" 
              onPress={() => toggleComments(item.id)}
              style={styles.interactionButton}
            >
              {item.comments.length}
            </Button>
          </View>
          
          {/* Comments section */}
          {(areCommentsExpanded || item.comments.length < 2) && item.comments.length > 0 && (
            <View style={styles.commentsSection}>
              <Divider style={styles.divider} />
              {item.comments.map(comment => (
                <View key={comment.id} style={styles.comment}>
                  <Avatar.Image 
                    size={24} 
                    source={{ uri: comment.user.avatarUrl }} 
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentContent}>
                    <Text variant="bodySmall" style={styles.commentUsername}>
                      {comment.user.name}
                    </Text>
                    <Text variant="bodyMedium">{comment.text}</Text>
                    <Text variant="bodySmall" style={styles.commentTime}>
                      {formatPostTime(comment.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
          
          {/* Comment input box */}
          <View style={styles.commentInputContainer}>
            <TextInput
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
              style={styles.commentInput}
              mode="outlined"
              dense
            />
            <IconButton
              icon="send"
              size={20}
              onPress={() => handleAddComment(item.id)}
              disabled={!newComment.trim()}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Format the countdown timer
  const formatCountdown = (time: TeaTime) => {
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tea Time Countdown Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          TeaTime Authority
        </Text>
        <View style={styles.headerLine} />
      </View>
      
      <View style={styles.countdownContainer}>
        {isTeaTime ? (
          <>
            <Text variant="titleLarge" style={styles.teaTimeText}>
              🫖 It's Tea Time! 🫖
            </Text>
            <Text variant="bodyMedium" style={styles.teaTimeSubtext}>
              Take a photo of your tea within {Config.teatime.submissionWindowMinutes} minutes
            </Text>
            <Button 
              mode="contained" 
              onPress={handleTakePhoto}
              style={styles.takePhotoButton}
              labelStyle={styles.takePhotoButtonLabel}
            >
              Submit Tea Photo
            </Button>
          </>
        ) : (
          <>
            <Text variant="titleMedium" style={styles.countdownLabel}>
              Next Tea Time In:
            </Text>
            <Text variant="headlineLarge" style={styles.countdownText}>
              {formatCountdown(timeRemaining)}
            </Text>
            <Text variant="bodyMedium" style={styles.countdownSubtext}>
              Remember your daily tea at {Config.teatime.hour}:{Config.teatime.minute.toString().padStart(2, '0')} PM
            </Text>
          </>
        )}
      </View>
      
      <View style={styles.feedHeader}>
        <Text variant="titleMedium" style={styles.feedTitle}>Recent Submissions</Text>
      </View>
      
      <Divider style={styles.divider} />
      
      {/* Feed section */}
      <View style={styles.feedSection}>
        <Text style={styles.feedTitle}>Friend Activity</Text>
        
        <FlatList
          data={feed}
          renderItem={renderFeedItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          contentContainerStyle={styles.feedList}
          ListEmptyComponent={(
            <View style={styles.emptyFeed}>
              <Text>No tea activity yet. Add friends to see their submissions!</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Layout.spacing.l,
    paddingTop: Layout.spacing.l,
    paddingBottom: Layout.spacing.m,
    flexDirection: 'column',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  headerLine: {
    height: 2,
    width: 40,
    backgroundColor: Colors.accent,
    marginTop: Layout.spacing.xs,
    borderRadius: 2,
  },
  countdownContainer: {
    ...Layout.card,
    backgroundColor: Colors.primaryTransparent,
    marginHorizontal: Layout.spacing.l,
    marginBottom: Layout.spacing.l,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.primary}20`,
  },
  countdownLabel: {
    color: Colors.primary,
    marginBottom: Layout.spacing.xs,
    fontWeight: '500',
  },
  countdownText: {
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 1,
    marginVertical: Layout.spacing.xs,
  },
  countdownSubtext: {
    color: Colors.bodyText,
    textAlign: 'center',
    opacity: 0.8,
  },
  teaTimeText: {
    color: Colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Layout.spacing.s,
  },
  teaTimeSubtext: {
    color: Colors.bodyText,
    textAlign: 'center',
    marginBottom: Layout.spacing.m,
  },
  takePhotoButton: {
    marginTop: Layout.spacing.s,
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.medium,
    paddingHorizontal: Layout.spacing.m,
    elevation: 2,
  },
  takePhotoButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 2,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.l,
    marginBottom: Layout.spacing.m,
  },
  feedTitle: {
    color: Colors.headerText,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: Layout.spacing.l,
    marginBottom: Layout.spacing.l,
    borderRadius: Layout.borderRadius.medium,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  divider: {
    marginBottom: Layout.spacing.m,
  },
  feedSection: {
    flex: 1,
    padding: Layout.spacing.m,
    paddingTop: 0,
  },
  feedList: {
    paddingBottom: Layout.spacing.l,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.m,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    marginLeft: Layout.spacing.s,
  },
  usernameText: {
    color: Colors.mutedText,
  },
  postMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    color: Colors.mutedText,
  },
  lateTag: {
    color: Colors.error,
    fontWeight: 'bold',
    marginTop: Layout.spacing.xs,
  },
  teaImage: {
    width: '100%',
    height: 250,
    borderRadius: Layout.borderRadius.medium,
    marginBottom: Layout.spacing.s,
  },
  teaInfo: {
    marginBottom: Layout.spacing.s,
  },
  fineText: {
    color: Colors.error,
    marginTop: Layout.spacing.xs,
  },
  interactions: {
    flexDirection: 'row',
    marginVertical: Layout.spacing.xs,
  },
  interactionButton: {
    marginRight: Layout.spacing.s,
  },
  commentsSection: {
    marginTop: Layout.spacing.s,
  },
  comment: {
    flexDirection: 'row',
    marginTop: Layout.spacing.s,
  },
  commentAvatar: {
    marginRight: Layout.spacing.s,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontWeight: 'bold',
  },
  commentTime: {
    color: Colors.mutedText,
    fontSize: 12,
    marginTop: 2,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.spacing.s,
  },
  commentInput: {
    flex: 1,
  },
  emptyFeed: {
    padding: Layout.spacing.l,
    alignItems: 'center',
  },
});
