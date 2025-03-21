import React, { useState } from 'react';
import { StyleSheet, FlatList, View, Alert, TouchableOpacity } from 'react-native';
import { Button, Card, Text, Avatar, TextInput, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistance } from 'date-fns';

// Mock data for friend requests and friends list
const MOCK_FRIEND_REQUESTS = [
  { 
    id: '1', 
    name: 'Jane Smith', 
    username: 'janesmith', 
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    streakDays: 14,
    complianceRate: 98
  },
  { 
    id: '2', 
    name: 'Alex Johnson', 
    username: 'alexj', 
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    streakDays: 7,
    complianceRate: 85
  },
];

const MOCK_FRIENDS = [
  { 
    id: '3', 
    name: 'David Wilson', 
    username: 'davidw', 
    avatarUrl: 'https://i.pravatar.cc/150?img=3', 
    lastSubmission: Date.now() - 3600000 * 2, // 2 hours ago
    isOnline: true,
    streak: 12
  },
  { 
    id: '4', 
    name: 'Sarah Miller', 
    username: 'sarahm', 
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
    lastSubmission: Date.now() - 600000, // 10 minutes ago
    isOnline: true,
    streak: 21
  },
  { 
    id: '5', 
    name: 'Michael Brown', 
    username: 'michaelb', 
    avatarUrl: 'https://i.pravatar.cc/150?img=5', 
    lastSubmission: Date.now() - 3600000 * 26, // 26 hours ago
    isOnline: false,
    streak: 3
  },
  { 
    id: '6', 
    name: 'Emily Davis', 
    username: 'emilyd', 
    avatarUrl: 'https://i.pravatar.cc/150?img=6', 
    lastSubmission: Date.now() - 3600000 * 72, // 3 days ago
    isOnline: false,
    streak: 0
  },
];

// enum TabState for type safety
enum TabState {
  REQUESTS = 'requests',
  FRIENDS = 'friends',
  SEARCH = 'search'
}

type FriendRequest = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  streakDays: number;
  complianceRate: number;
}

type Friend = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  lastSubmission: number;
  isOnline: boolean;
  streak: number;
}

export default function FriendsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabState>(TabState.FRIENDS);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [requests] = useState<FriendRequest[]>(MOCK_FRIEND_REQUESTS);
  const [friends] = useState<Friend[]>(MOCK_FRIENDS);

  const handleSearch = () => {
    setSearchPerformed(true);
    // Mock search functionality
    if (searchQuery.trim().length > 0) {
      // In a real app, this would be an API call to search for users
      setSearchResults([
        { 
          id: '7', 
          name: 'James Wilson', 
          username: searchQuery + 'user', 
          avatarUrl: 'https://i.pravatar.cc/150?img=7' 
        },
      ]);
      setActiveTab(TabState.SEARCH);
    } else {
      setSearchResults([]);
    }
  };

  // Format time since latest submission
  const formatTimeSince = (timestamp: number) => {
    const now = new Date();
    const date = new Date(timestamp);
    return formatDistance(date, now, { addSuffix: true });
  };

  // Handle friend request actions
  const handleAcceptRequest = (id: string) => {
    Alert.alert(
      "Friend Request Accepted",
      "You are now friends!",
      [{ text: "OK" }]
    );
  };

  const handleDeclineRequest = (id: string) => {
    Alert.alert(
      "Friend Request Declined",
      "The request has been declined",
      [{ text: "OK" }]
    );
  };

  // Handle nudging a friend
  const handleNudgeFriend = (id: string) => {
    // Simulate sending a nudge
    Alert.alert(
      "Nudge Sent",
      "Your friend has been reminded it's tea time!",
      [{ text: "OK" }]
    );
  };

  // Render friend request
  const renderFriendRequest = ({ item }: { item: FriendRequest }) => (
    <Card style={styles.requestCard} mode="elevated">
      <Card.Content style={styles.requestContent}>
        <View style={styles.userRow}>
          <Avatar.Image size={56} source={{ uri: item.avatarUrl }} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userUsername}>@{item.username}</Text>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.streakDays}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.complianceRate}%</Text>
                <Text style={styles.statLabel}>Compliance</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.requestActions}>
          <Button 
            mode="contained" 
            onPress={() => handleAcceptRequest(item.id)}
            style={styles.acceptButton}
            contentStyle={styles.buttonContent}
          >
            Accept
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => handleDeclineRequest(item.id)}
            style={styles.declineButton}
            contentStyle={styles.buttonContent}
          >
            Decline
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  // Render friend
  const renderFriend = ({ item }: { item: Friend }) => {
    const hasSubmittedToday = item.lastSubmission > Date.now() - 24 * 60 * 60 * 1000;
    
    return (
      <Card style={styles.friendCard} mode="elevated">
        <Card.Content style={styles.friendContent}>
          <View style={styles.friendRow}>
            <View style={styles.avatarContainer}>
              <Avatar.Image size={56} source={{ uri: item.avatarUrl }} />
              {item.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            
            <View style={styles.friendInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.friendName}>{item.name}</Text>
                {item.streak > 0 && (
                  <View style={styles.streakBadge}>
                    <MaterialCommunityIcons name="fire" size={12} color={Colors.accent} />
                    <Text style={styles.streakText}>{item.streak}</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.friendUsername}>@{item.username}</Text>
              
              <View style={styles.statusRow}>
                <View style={[
                  styles.statusIndicator, 
                  { backgroundColor: hasSubmittedToday ? Colors.success : Colors.warning }
                ]} />
                <Text style={styles.statusText}>
                  {hasSubmittedToday 
                    ? `Last tea: ${formatTimeSince(item.lastSubmission)}` 
                    : `No tea today - ${formatTimeSince(item.lastSubmission)}`}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.nudgeButton} 
              onPress={() => handleNudgeFriend(item.id)}
            >
              <MaterialCommunityIcons 
                name="bell-ring-outline" 
                size={22} 
                color={Colors.primary}
              />
              <Text style={styles.nudgeText}>Nudge</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Render search result
  const renderSearchResult = ({ item }: { item: any }) => (
    <Card style={styles.searchCard} mode="elevated">
      <Card.Content style={styles.searchContent}>
        <View style={styles.userRow}>
          <Avatar.Image size={56} source={{ uri: item.avatarUrl }} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userUsername}>@{item.username}</Text>
          </View>
        </View>
        
        <Button 
          mode="contained" 
          onPress={() => Alert.alert('Friend Request Sent', 'Your request has been sent')}
          style={styles.addButton}
        >
          Send Friend Request
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Friends</Text>
        <TextInput
          placeholder="Search friends..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
          right={<TextInput.Icon icon="magnify" onPress={handleSearch} />}
        />
      </View>
      
      <View style={styles.tabContainer}>
        <Button
          mode={activeTab === TabState.FRIENDS ? 'contained' : 'outlined'}
          onPress={() => setActiveTab(TabState.FRIENDS)}
          style={[styles.tabButton, styles.rightTabButton]}
          contentStyle={styles.tabButtonContent}
          labelStyle={styles.tabButtonLabel}
        >
          Friends
        </Button>
        <Button
          mode={activeTab === TabState.REQUESTS ? 'contained' : 'outlined'}
          onPress={() => setActiveTab(TabState.REQUESTS)}
          style={[styles.tabButton, styles.leftTabButton]}
          contentStyle={styles.tabButtonContent}
          labelStyle={styles.tabButtonLabel}
        >
          Requests {requests.length > 0 && `(${requests.length})`}
        </Button>
      </View>
      
      {activeTab === TabState.SEARCH && (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            searchPerformed ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found</Text>
                <Text style={styles.emptySubtext}>Try a different search term</Text>
              </View>
            ) : null
          }
        />
      )}
      
      {activeTab === TabState.REQUESTS && (
        <FlatList
          data={requests}
          renderItem={renderFriendRequest}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No friend requests</Text>
            </View>
          }
        />
      )}
      
      {activeTab === TabState.FRIENDS && (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No friends yet</Text>
              <Text style={styles.emptySubtext}>Search for users to connect with</Text>
            </View>
          }
        />
      )}
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
  },
  searchBar: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: Layout.borderRadius.small,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Layout.spacing.m,
    marginVertical: Layout.spacing.m,
  },
  tabButton: {
    flex: 1,
    borderWidth: 0,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftTabButton: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: Layout.borderRadius.small,
    borderBottomLeftRadius: Layout.borderRadius.small,
  },
  rightTabButton: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: Layout.borderRadius.small,
    borderBottomRightRadius: Layout.borderRadius.small,
  },
  tabButtonContent: {
    height: 40,
  },
  tabButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: Layout.spacing.m,
  },
  requestCard: {
    marginBottom: Layout.spacing.m,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    borderWidth: 0,
  },
  requestContent: {
    padding: Layout.spacing.m,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  userUsername: {
    fontSize: 14,
    color: Colors.mutedText,
    marginBottom: 8,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.mutedText,
  },
  verticalDivider: {
    height: 24,
    width: 1,
    backgroundColor: Colors.border,
    marginRight: 16,
  },
  requestActions: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'flex-end',
  },
  acceptButton: {
    marginRight: 8,
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.small,
    elevation: 2,
  },
  declineButton: {
    borderColor: Colors.error,
    borderRadius: Layout.borderRadius.small,
  },
  buttonContent: {
    height: 36,
  },
  friendCard: {
    marginBottom: Layout.spacing.m,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    borderWidth: 0,
  },
  friendContent: {
    padding: Layout.spacing.m,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    bottom: 0,
    right: 0,
  },
  friendInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.accent}20`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
    marginLeft: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: Colors.mutedText,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    color: Colors.bodyText,
  },
  nudgeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  nudgeText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  searchCard: {
    marginBottom: Layout.spacing.m,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    borderWidth: 0,
  },
  searchContent: {
    padding: Layout.spacing.m,
  },
  addButton: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.small,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Layout.spacing.xl,
    backgroundColor: '#FFFFFF',
    borderRadius: Layout.borderRadius.medium,
    marginTop: Layout.spacing.m,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.mutedText,
    textAlign: 'center',
  },
}); 