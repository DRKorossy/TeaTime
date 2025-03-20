import React, { useState } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { Button, Card, Divider, Searchbar, Text, Avatar, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

// Mock data for friend requests and friends list
const MOCK_FRIEND_REQUESTS = [
  { id: '1', name: 'Jane Smith', username: 'janesmith', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Alex Johnson', username: 'alexj', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
];

const MOCK_FRIENDS = [
  { id: '3', name: 'David Wilson', username: 'davidw', avatarUrl: 'https://i.pravatar.cc/150?img=3', lastActive: '2 hours ago' },
  { id: '4', name: 'Sarah Miller', username: 'sarahm', avatarUrl: 'https://i.pravatar.cc/150?img=4', lastActive: 'Just now' },
  { id: '5', name: 'Michael Brown', username: 'michaelb', avatarUrl: 'https://i.pravatar.cc/150?img=5', lastActive: '1 day ago' },
  { id: '6', name: 'Emily Davis', username: 'emilyd', avatarUrl: 'https://i.pravatar.cc/150?img=6', lastActive: '3 days ago' },
];

type TabState = 'requests' | 'friends';

export default function FriendsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabState>('friends');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Mock search functionality
    if (query.trim().length > 0) {
      // In a real app, this would be an API call to search for users
      setSearchResults([
        { id: '7', name: 'James Wilson', username: query + 'user', avatarUrl: 'https://i.pravatar.cc/150?img=7' },
      ]);
    } else {
      setSearchResults([]);
    }
  };

  const renderFriendRequest = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Avatar.Image size={50} source={{ uri: item.avatarUrl }} />
        <View style={styles.userInfo}>
          <Text variant="titleMedium">{item.name}</Text>
          <Text variant="bodySmall">@{item.username}</Text>
        </View>
        <View style={styles.actions}>
          <Button mode="contained" style={styles.acceptButton}>Accept</Button>
          <Button mode="outlined" style={styles.declineButton}>Decline</Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderFriend = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Avatar.Image size={50} source={{ uri: item.avatarUrl }} />
        <View style={styles.userInfo}>
          <Text variant="titleMedium">{item.name}</Text>
          <Text variant="bodySmall">@{item.username}</Text>
          {item.lastActive && (
            <Chip icon="clock-outline" style={styles.activeChip}>
              {item.lastActive}
            </Chip>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderSearchResult = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Avatar.Image size={50} source={{ uri: item.avatarUrl }} />
        <View style={styles.userInfo}>
          <Text variant="titleMedium">{item.name}</Text>
          <Text variant="bodySmall">@{item.username}</Text>
        </View>
        <Button mode="contained" style={styles.addButton}>Add Friend</Button>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Friends</Text>
      
      <Searchbar
        placeholder="Search for friends"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      {searchResults.length > 0 ? (
        <View style={styles.searchResults}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
          />
        </View>
      ) : (
        <>
          <View style={styles.tabs}>
            <Button
              mode={activeTab === 'friends' ? 'contained' : 'outlined'}
              onPress={() => setActiveTab('friends')}
              style={styles.tab}
            >
              Friends
            </Button>
            <Button
              mode={activeTab === 'requests' ? 'contained' : 'outlined'}
              onPress={() => setActiveTab('requests')}
              style={styles.tab}
              icon="bell-outline"
            >
              Requests {MOCK_FRIEND_REQUESTS.length > 0 && `(${MOCK_FRIEND_REQUESTS.length})`}
            </Button>
          </View>

          <Divider style={styles.divider} />

          {activeTab === 'requests' ? (
            <FlatList
              data={MOCK_FRIEND_REQUESTS}
              renderItem={renderFriendRequest}
              keyExtractor={(item) => item.id}
              style={styles.list}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No friend requests at the moment.</Text>
              }
            />
          ) : (
            <FlatList
              data={MOCK_FRIENDS}
              renderItem={renderFriend}
              keyExtractor={(item) => item.id}
              style={styles.list}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Add friends to see them here.</Text>
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Layout.spacing.m,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.m,
    color: Colors.primary,
  },
  searchBar: {
    marginBottom: Layout.spacing.m,
    backgroundColor: Colors.card,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Layout.spacing.s,
  },
  tab: {
    flex: 1,
    margin: Layout.spacing.xs,
  },
  divider: {
    marginVertical: Layout.spacing.s,
  },
  list: {
    flex: 1,
  },
  card: {
    marginBottom: Layout.spacing.m,
    backgroundColor: Colors.card,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: Layout.spacing.m,
  },
  actions: {
    flexDirection: 'row',
  },
  acceptButton: {
    marginRight: Layout.spacing.xs,
    backgroundColor: Colors.success,
  },
  declineButton: {
    borderColor: Colors.error,
    borderWidth: 1,
  },
  addButton: {
    backgroundColor: Colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Layout.spacing.xl,
    color: Colors.mutedText,
  },
  searchResults: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    marginVertical: Layout.spacing.m,
    color: Colors.primary,
  },
  activeChip: {
    backgroundColor: Colors.primaryTransparent,
    marginTop: Layout.spacing.xs,
    height: 24,
    alignSelf: 'flex-start',
  },
}); 