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
      <View style={styles.cardWrapper}>
        <Card style={styles.card} mode="elevated">
          <Card.Content style={styles.cardContent}>
            {/* User header */}
            <View style={styles.postHeader}>
              <View style={styles.userInfo}>
                <Avatar.Image size={40} source={{ uri: item.user.avatarUrl }} style={styles.avatar} />
                <View style={styles.nameContainer}>
                  <Text variant="titleMedium" style={styles.userName}>{item.user.name}</Text>
                  <Text variant="bodySmall" style={styles.usernameText}>@{item.user.username}</Text>
                </View>
              </View>
              <View style={styles.postMeta}>
                <Text variant="bodySmall" style={styles.timestamp}>{formatPostTime(item.timestamp)}</Text>
                {!item.isOnTime && (
                  <View style={styles.lateTagContainer}>
                    <Text variant="bodySmall" style={styles.lateTag}>LATE</Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Tea image */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.imageUrl }} style={styles.teaImage} />
            </View>
            
            {/* Interaction buttons */}
            <View style={styles.interactions}>
              <Button 
                icon="heart" 
                mode="text" 
                onPress={() => handleLike(item.id)}
                style={styles.interactionButton}
                labelStyle={styles.interactionButtonLabel}
              >
                {item.likes}
              </Button>
              <Button 
                icon="comment" 
                mode="text" 
                onPress={() => toggleComments(item.id)}
                style={styles.interactionButton}
                labelStyle={styles.interactionButtonLabel}
              >
                {item.comments.length}
              </Button>
            </View>
            
            {/* Tea details */}
            <View style={styles.teaInfo}>
              <Text variant="bodyMedium" style={styles.teaTypeText}>
                <Text style={styles.userName}>{item.user.name}</Text> {/* Username in bold */}
                <Text> - {item.teaType} tea</Text>
              </Text>
              {item.fine && (
                <View style={styles.fineContainer}>
                  <Text variant="bodySmall" style={styles.fineText}>
                    Fine: £{item.fine.amount.toFixed(2)} ({item.fine.status})
                  </Text>
                </View>
              )}
            </View>
            
            {/* Comments section */}
            {(areCommentsExpanded || item.comments.length < 2) && item.comments.length > 0 && (
              <View style={styles.commentsSection}>
                {item.comments.length > 1 && !areCommentsExpanded && (
                  <TouchableOpacity onPress={() => toggleComments(item.id)}>
                    <Text style={styles.viewAllComments}>View all {item.comments.length} comments</Text>
                  </TouchableOpacity>
                )}
                {item.comments.map(comment => (
                  <View key={comment.id} style={styles.comment}>
                    <Text style={styles.commentContent}>
                      <Text style={styles.commentUsername}>{comment.user.name}</Text>
                      <Text style={styles.commentText}> {comment.text}</Text>
                    </Text>
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
                mode="flat"
                dense
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                contentStyle={styles.commentInputContent}
              />
              <IconButton
                icon="send"
                size={22}
                onPress={() => handleAddComment(item.id)}
                disabled={!newComment.trim()}
                iconColor={newComment.trim() ? Colors.primary : Colors.mutedText}
              />
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  // Format the countdown timer
  const formatCountdown = (time: TeaTime) => {
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  };

  const renderCountdownHeader = () => (
    <View style={styles.countdownContainer}>
      {isTeaTime ? (
        <>
          <View style={styles.officialBadge}>
            <Text style={styles.officialBadgeText}>OFFICIAL</Text>
          </View>
          <Text variant="titleLarge" style={styles.teaTimeText}>
            🫖 It's Tea Time! 🫖
          </Text>
          <Text variant="bodyMedium" style={styles.teaTimeSubtext}>
            By royal decree, you are required to take a photo of your tea within {Config.teatime.submissionWindowMinutes} minutes
          </Text>
          <Button 
            mode="contained" 
            onPress={handleTakePhoto}
            style={styles.takePhotoButton}
            labelStyle={styles.takePhotoButtonLabel}
            icon="camera"
            contentStyle={styles.takePhotoButtonContent}
          >
            Submit Royal Tea Photo
          </Button>
        </>
      ) : (
        <>
          <View style={styles.officialBadge}>
            <Text style={styles.officialBadgeText}>MANDATORY</Text>
          </View>
          <Text variant="titleMedium" style={styles.countdownLabel}>
            Royal Tea Time In:
          </Text>
          <Text variant="headlineLarge" style={styles.countdownText}>
            {formatCountdown(timeRemaining)}
          </Text>
          <Text variant="bodyMedium" style={styles.countdownSubtext}>
            Daily tea time at {Config.teatime.hour}:{Config.teatime.minute.toString().padStart(2, '0')} PM
          </Text>
          <View style={styles.reminderBadge}>
            <Text style={styles.reminderText}>Failure to comply will result in penalties</Text>
          </View>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TeaTime</Text>
      </View>
      
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
            <Text style={styles.emptyFeedText}>No tea activity yet. Connect with fellow tea enthusiasts to view their submissions.</Text>
          </View>
        )}
        ListHeaderComponent={renderCountdownHeader}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  countdownContainer: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
    padding: Layout.spacing.m,
    paddingBottom: Layout.spacing.l,
  },
  officialBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
  },
  officialBadgeText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  countdownLabel: {
    color: Colors.primary,
    marginTop: Layout.spacing.m,
    marginBottom: Layout.spacing.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  countdownText: {
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginVertical: Layout.spacing.xs,
  },
  countdownSubtext: {
    color: Colors.bodyText,
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: Layout.spacing.m,
    lineHeight: 20,
  },
  reminderBadge: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.small,
    marginTop: Layout.spacing.m,
    marginBottom: Layout.spacing.s,
  },
  reminderText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  teaTimeText: {
    color: Colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: Layout.spacing.m,
    marginBottom: Layout.spacing.s,
  },
  teaTimeSubtext: {
    color: Colors.bodyText,
    textAlign: 'center',
    marginBottom: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.m,
    lineHeight: 20,
  },
  takePhotoButton: {
    marginTop: Layout.spacing.s,
    marginBottom: Layout.spacing.m,
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.small,
    paddingHorizontal: Layout.spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  takePhotoButtonContent: {
    height: 40,
  },
  takePhotoButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  feedList: {
    paddingBottom: 16,
  },
  emptyFeed: {
    padding: Layout.spacing.l,
    alignItems: 'center',
    backgroundColor: Colors.card,
    margin: Layout.spacing.l,
    borderRadius: Layout.borderRadius.small,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyFeedText: {
    textAlign: 'center',
    color: Colors.bodyText,
    lineHeight: 20,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    margin: 0,
    elevation: 0,
    shadowOpacity: 0,
    borderRadius: 0,
    backgroundColor: Colors.card,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  cardContent: {
    padding: 0,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: Colors.background,
  },
  nameContainer: {
    marginLeft: Layout.spacing.s,
  },
  userName: {
    fontWeight: '600',
    color: Colors.text,
  },
  usernameText: {
    color: Colors.mutedText,
    fontSize: 12,
  },
  postMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    color: Colors.mutedText,
    fontSize: 12,
  },
  lateTagContainer: {
    backgroundColor: `${Colors.error}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.small,
    marginTop: Layout.spacing.xs,
  },
  lateTag: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 10,
  },
  imageContainer: {
    width: '100%',
    height: 375, // Instagram-like square-ish ratio
    backgroundColor: Colors.background,
  },
  teaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  interactions: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  interactionButton: {
    marginRight: Layout.spacing.s,
  },
  interactionButtonLabel: {
    color: Colors.text,
    fontWeight: '600',
  },
  teaInfo: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  teaTypeText: {
    color: Colors.bodyText,
    fontSize: 14,
  },
  teaTypeName: {
    fontWeight: '600',
    color: Colors.text,
  },
  fineContainer: {
    marginTop: Layout.spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: `${Colors.error}10`,
    borderRadius: Layout.borderRadius.small,
    borderLeftWidth: 2,
    borderLeftColor: Colors.error,
    alignSelf: 'flex-start',
  },
  fineText: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 12,
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  viewAllComments: {
    color: Colors.mutedText,
    fontSize: 14,
    marginBottom: 6,
  },
  comment: {
    marginBottom: 3,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentUsername: {
    fontWeight: '600',
    color: Colors.text,
  },
  commentText: {
    color: Colors.bodyText,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 14,
    height: 40,
  },
  commentInputContent: {
    paddingHorizontal: 0,
  },
});
