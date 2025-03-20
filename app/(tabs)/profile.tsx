import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Avatar, Card, Divider, Badge, Chip, List, Portal, Dialog, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../services/supabase';
import { useRouter } from 'expo-router';

// Mock user data
const MOCK_USER = {
  id: 'user1',
  name: 'James Wilson',
  username: 'jameswilson',
  email: 'james.wilson@example.com',
  bio: 'Tea enthusiast and proud Brit. Always on time for the national tea ritual! 🇬🇧☕',
  avatarUrl: 'https://i.pravatar.cc/300?img=8',
  location: 'London, UK',
  favoriteTea: 'Earl Grey',
  joinDate: new Date('2023-11-15'),
  streakDays: 7,
  compliancePct: 92,
};

// Mock tea submission history
const MOCK_SUBMISSIONS = [
  {
    id: 'sub1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1121&q=80',
    teaType: 'English Breakfast',
    status: 'Approved',
    onTime: true,
  },
  {
    id: 'sub2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    teaType: 'Earl Grey',
    status: 'Approved',
    onTime: true,
  },
  {
    id: 'sub3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    imageUrl: '',
    teaType: '',
    status: 'Missed',
    onTime: false,
    fine: {
      amount: 5.00,
      status: 'Paid',
      paymentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    }
  },
];

// Mock donation history
const MOCK_DONATIONS = [
  {
    id: 'don1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    amount: 0.50,
    charity: 'Royal British Legion',
    receiptUrl: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  },
];

type ProfileTab = 'history' | 'donations' | 'stats';

export default function ProfileScreen() {
  const [user, setUser] = useState(MOCK_USER);
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);
  const [donations, setDonations] = useState(MOCK_DONATIONS);
  const [activeTab, setActiveTab] = useState<ProfileTab>('history');
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    bio: user.bio,
    location: user.location,
    favoriteTea: user.favoriteTea,
  });
  
  const router = useRouter();
  
  const handleEditProfile = () => {
    setEditDialogVisible(true);
  };
  
  const handleUpdateProfile = () => {
    // In a real app, this would call an API to update the profile
    setUser({
      ...user,
      ...editForm
    });
    setEditDialogVisible(false);
  };
  
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      // In a real app, this would upload the image to Supabase storage
      setUser({
        ...user,
        avatarUrl: result.assets[0].uri,
      });
    }
  };
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Navigation would happen automatically via auth state change listener
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const formatSubmissionDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };
  
  const handlePayFine = (fine: {amount: number, id: string}) => {
    router.push({
      pathname: '/(modals)/fine-payment',
      params: { fineId: fine.id, amount: fine.amount.toString() }
    });
  };
  
  const renderHistory = () => (
    <View style={styles.tabContent}>
      {submissions.map((submission) => (
        <Card key={submission.id} style={styles.submissionCard}>
          <Card.Content>
            <View style={styles.submissionHeader}>
              <Text variant="titleMedium">
                {formatSubmissionDate(submission.date)}
              </Text>
              <Chip 
                style={[
                  styles.statusChip, 
                  submission.status === 'Approved' 
                    ? styles.approvedChip 
                    : styles.missedChip
                ]}
              >
                {submission.status}
              </Chip>
            </View>
            
            {submission.status === 'Approved' ? (
              <>
                <View style={styles.submissionDetails}>
                  <Text variant="bodyMedium">Tea type: {submission.teaType}</Text>
                  <Text variant="bodyMedium">
                    Submitted: {submission.onTime ? 'On time' : 'Late'}
                  </Text>
                </View>
                
                {submission.imageUrl && (
                  <Image 
                    source={{ uri: submission.imageUrl }} 
                    style={styles.submissionImage} 
                  />
                )}
              </>
            ) : (
              <View style={styles.fineDetails}>
                <Text variant="bodyMedium">You missed tea time</Text>
                {submission.fine && (
                  <>
                    <TouchableOpacity 
                      style={styles.fineContainer} 
                      onPress={() => handlePayFine(submission.fine)}
                    >
                      <Text style={styles.fineText}>
                        Fine: £{submission.fine.amount.toFixed(2)}
                      </Text>
                      <Text style={styles.payFineText}>
                        Tap to pay fine
                      </Text>
                    </TouchableOpacity>
                    {submission.fine.status === 'Paid' && (
                      <Text variant="bodySmall">
                        Paid on {format(submission.fine.paymentDate, 'MMM d, yyyy')}
                      </Text>
                    )}
                  </>
                )}
              </View>
            )}
          </Card.Content>
        </Card>
      ))}
    </View>
  );
  
  const renderDonations = () => (
    <View style={styles.tabContent}>
      {donations.length > 0 ? (
        donations.map((donation) => (
          <Card key={donation.id} style={styles.donationCard}>
            <Card.Content>
              <View style={styles.donationHeader}>
                <Text variant="titleMedium">£{donation.amount.toFixed(2)}</Text>
                <Text variant="bodyMedium">{format(donation.date, 'MMM d, yyyy')}</Text>
              </View>
              
              <Text variant="bodyMedium">Charity: {donation.charity}</Text>
              
              {donation.receiptUrl && (
                <Image 
                  source={{ uri: donation.receiptUrl }} 
                  style={styles.receiptImage} 
                />
              )}
            </Card.Content>
          </Card>
        ))
      ) : (
        <Text style={styles.emptyText}>No donations yet</Text>
      )}
    </View>
  );
  
  const renderStats = () => (
    <View style={styles.tabContent}>
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.statsTitle}>Your Tea Statistics</Text>
          
          <List.Item
            title="Current Streak"
            description={`${user.streakDays} days`}
            left={() => <List.Icon icon="fire" color={Colors.accent} />}
          />
          
          <List.Item
            title="Compliance Rate"
            description={`${user.compliancePct}%`}
            left={() => <List.Icon icon="check-circle" color={Colors.success} />}
          />
          
          <List.Item
            title="Member Since"
            description={format(user.joinDate, 'MMMM d, yyyy')}
            left={() => <List.Icon icon="calendar" color={Colors.primary} />}
          />
          
          <Divider style={styles.statsDivider} />
          
          <Text variant="titleMedium" style={styles.achievementsTitle}>Achievements</Text>
          
          <View style={styles.achievements}>
            <Chip icon="trophy" style={styles.achievementChip}>1 Week Streak</Chip>
            <Chip icon="tea" style={styles.achievementChip}>Tea Enthusiast</Chip>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePickImage}>
            <Avatar.Image 
              size={100} 
              source={{ uri: user.avatarUrl }}
              style={styles.avatar}
            />
            <View style={styles.editAvatarBadge}>
              <Badge size={24} style={styles.editBadge}>+</Badge>
            </View>
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            <Text variant="headlineSmall" style={styles.userName}>{user.name}</Text>
            <Text variant="bodyMedium">@{user.username}</Text>
            <Chip icon="map-marker" style={styles.locationChip}>{user.location}</Chip>
          </View>
          
          <Button 
            mode="outlined" 
            onPress={handleEditProfile}
            style={styles.editButton}
          >
            Edit Profile
          </Button>
        </View>
        
        <View style={styles.bioSection}>
          <Text style={styles.bioText}>{user.bio}</Text>
          <View style={styles.teaPreference}>
            <Text variant="bodyMedium">Favorite Tea: </Text>
            <Chip icon="tea-outline" style={styles.teaChip}>{user.favoriteTea}</Chip>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.tabs}>
          <Button
            mode={activeTab === 'history' ? 'contained' : 'outlined'}
            onPress={() => setActiveTab('history')}
            style={styles.tab}
          >
            History
          </Button>
          <Button
            mode={activeTab === 'donations' ? 'contained' : 'outlined'}
            onPress={() => setActiveTab('donations')}
            style={styles.tab}
          >
            Donations
          </Button>
          <Button
            mode={activeTab === 'stats' ? 'contained' : 'outlined'}
            onPress={() => setActiveTab('stats')}
            style={styles.tab}
          >
            Stats
          </Button>
        </View>
        
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'donations' && renderDonations()}
        {activeTab === 'stats' && renderStats()}
        
        <Button 
          mode="outlined" 
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor={Colors.error}
        >
          Log Out
        </Button>
      </ScrollView>
      
      <Portal>
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={editForm.name}
              onChangeText={(text) => setEditForm({...editForm, name: text})}
              style={styles.input}
            />
            <TextInput
              label="Bio"
              value={editForm.bio}
              onChangeText={(text) => setEditForm({...editForm, bio: text})}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            <TextInput
              label="Location"
              value={editForm.location}
              onChangeText={(text) => setEditForm({...editForm, location: text})}
              style={styles.input}
            />
            <TextInput
              label="Favorite Tea"
              value={editForm.favoriteTea}
              onChangeText={(text) => setEditForm({...editForm, favoriteTea: text})}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleUpdateProfile}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Layout.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    backgroundColor: Colors.card,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  editBadge: {
    backgroundColor: Colors.primary,
  },
  userInfo: {
    marginLeft: Layout.spacing.m,
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    color: Colors.headerText,
  },
  locationChip: {
    marginTop: Layout.spacing.xs,
    height: 26,
    alignSelf: 'flex-start',
  },
  editButton: {
    position: 'absolute',
    top: Layout.spacing.m,
    right: Layout.spacing.m,
  },
  bioSection: {
    padding: Layout.spacing.m,
    paddingTop: 0,
  },
  bioText: {
    marginBottom: Layout.spacing.s,
  },
  teaPreference: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.spacing.s,
  },
  teaChip: {
    height: 26,
  },
  divider: {
    marginVertical: Layout.spacing.s,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Layout.spacing.m,
    marginBottom: Layout.spacing.m,
  },
  tab: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
  },
  tabContent: {
    paddingHorizontal: Layout.spacing.m,
  },
  submissionCard: {
    marginBottom: Layout.spacing.m,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  statusChip: {
    height: 24,
  },
  approvedChip: {
    backgroundColor: Colors.success,
  },
  missedChip: {
    backgroundColor: Colors.error,
  },
  submissionDetails: {
    marginBottom: Layout.spacing.s,
  },
  submissionImage: {
    width: '100%',
    height: 200,
    borderRadius: Layout.borderRadius.medium,
    marginTop: Layout.spacing.s,
  },
  fineDetails: {
    marginBottom: Layout.spacing.s,
  },
  donationCard: {
    marginBottom: Layout.spacing.m,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.s,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: Layout.borderRadius.medium,
    marginTop: Layout.spacing.m,
  },
  statsCard: {
    marginBottom: Layout.spacing.m,
  },
  statsTitle: {
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
    color: Colors.primary,
  },
  statsDivider: {
    marginVertical: Layout.spacing.m,
  },
  achievementsTitle: {
    marginBottom: Layout.spacing.s,
  },
  achievements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  achievementChip: {
    margin: Layout.spacing.xs,
  },
  input: {
    marginBottom: Layout.spacing.m,
  },
  logoutButton: {
    margin: Layout.spacing.m,
    borderColor: Colors.error,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Layout.spacing.xl,
    color: Colors.mutedText,
  },
  fineContainer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: Colors.error + '20', // 20% opacity
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  fineText: {
    fontWeight: 'bold',
    color: Colors.error,
  },
  payFineText: {
    fontSize: 12,
    color: Colors.mutedText,
    marginTop: 4,
  },
}); 