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
          <Card.Content style={styles.cardContent}>
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
                textStyle={styles.statusChipText}
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
                  <View style={styles.imageContainer}>
                    <Image 
                      source={{ uri: submission.imageUrl }} 
                      style={styles.submissionImage} 
                    />
                  </View>
                )}
              </>
            ) : (
              <View style={styles.fineDetails}>
                <Text variant="bodyMedium" style={styles.missedText}>You missed tea time</Text>
                {submission.fine && (
                  <>
                    <View style={styles.fineContainer}>
                      <View style={styles.fineInnerContainer}>
                        <Text style={styles.fineText}>
                          Fine: £{submission.fine.amount.toFixed(2)}
                        </Text>
                        <View style={styles.fineStatusContainer}>
                          <View style={[
                            styles.fineStatusIndicator,
                            submission.fine.status === 'Paid' ? styles.paidIndicator : styles.unpaidIndicator
                          ]} />
                          <Text style={[
                            styles.fineStatusText,
                            submission.fine.status === 'Paid' ? styles.paidText : styles.unpaidText
                          ]}>
                            {submission.fine.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {submission.fine.status === 'Paid' && (
                      <Text variant="bodySmall" style={styles.paymentDateText}>
                        Paid on {format(submission.fine.paymentDate, 'MMM d, yyyy')}
                      </Text>
                    )}
                    {submission.fine.status !== 'Paid' && (
                      <Button 
                        mode="contained" 
                        style={styles.payNowButton}
                        onPress={() => handlePayFine({
                          amount: submission.fine.amount,
                          id: submission.id
                        })}
                      >
                        Pay Fine Now
                      </Button>
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
            <Card.Content style={styles.cardContent}>
              <View style={styles.donationHeader}>
                <Text variant="titleMedium" style={styles.donationAmount}>£{donation.amount.toFixed(2)}</Text>
                <Text variant="bodyMedium" style={styles.donationDate}>{format(donation.date, 'MMM d, yyyy')}</Text>
              </View>
              
              <Text variant="bodyMedium" style={styles.donationCharity} numberOfLines={2} ellipsizeMode="tail">
                Charity: {donation.charity}
              </Text>
              
              {donation.receiptUrl && (
                <View style={styles.receiptContainer}>
                  <Image 
                    source={{ uri: donation.receiptUrl }} 
                    style={styles.receiptImage} 
                  />
                </View>
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
            titleStyle={styles.statTitle}
            descriptionStyle={styles.statDescription}
          />
          
          <List.Item
            title="Compliance Rate"
            description={`${user.compliancePct}%`}
            left={() => <List.Icon icon="check-circle" color={Colors.success} />}
            titleStyle={styles.statTitle}
            descriptionStyle={styles.statDescription}
          />
          
          <List.Item
            title="Member Since"
            description={format(user.joinDate, 'MMMM d, yyyy')}
            left={() => <List.Icon icon="calendar" color={Colors.primary} />}
            titleStyle={styles.statTitle}
            descriptionStyle={styles.statDescription}
          />
          
          <Divider style={styles.statsDivider} />
          
          <Text variant="titleMedium" style={styles.achievementsTitle}>Achievements</Text>
          
          <View style={styles.achievements}>
            <Chip icon="trophy" style={styles.achievementChip} textStyle={styles.achievementText}>1 Week Streak</Chip>
            <Chip icon="tea" style={styles.achievementChip} textStyle={styles.achievementText}>Tea Enthusiast</Chip>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
  
  const renderEditDialog = () => (
    <Portal>
      <Dialog
        visible={editDialogVisible}
        onDismiss={() => setEditDialogVisible(false)}
        style={styles.editDialog}
      >
        <Dialog.Title style={styles.dialogTitle}>Edit Profile</Dialog.Title>
        <Dialog.Content>
          <View style={styles.avatarEditContainer}>
            <Avatar.Image 
              source={{ uri: user.avatarUrl }} 
              size={80} 
              style={styles.avatarEdit}
            />
            <TouchableOpacity 
              style={styles.changePhotoButton}
              onPress={handlePickImage}
            >
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            label="Name"
            value={editForm.name}
            onChangeText={(text) => setEditForm({ ...editForm, name: text })}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Bio"
            value={editForm.bio}
            onChangeText={(text) => setEditForm({ ...editForm, bio: text })}
            style={styles.input}
            multiline
            numberOfLines={3}
            mode="outlined"
          />
          <TextInput
            label="Location"
            value={editForm.location}
            onChangeText={(text) => setEditForm({ ...editForm, location: text })}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Favorite Tea"
            value={editForm.favoriteTea}
            onChangeText={(text) => setEditForm({ ...editForm, favoriteTea: text })}
            style={styles.input}
            mode="outlined"
          />
        </Dialog.Content>
        <Dialog.Actions style={styles.dialogActions}>
          <Button 
            onPress={() => setEditDialogVisible(false)}
            style={styles.cancelButton}
            labelStyle={styles.cancelButtonText}
          >
            Cancel
          </Button>
          <Button 
            onPress={handleUpdateProfile}
            mode="contained"
            style={styles.saveButton}
          >
            Save
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
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
              <Text variant="headlineSmall" style={styles.userName} numberOfLines={1} ellipsizeMode="tail">{user.name}</Text>
              <Text variant="bodyMedium" style={styles.username}>@{user.username}</Text>
              <View style={styles.locationContainer}>
                <Chip icon="map-marker" style={styles.locationChip} textStyle={styles.chipText}>{user.location}</Chip>
              </View>
            </View>
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
            <Chip 
              icon="tea-outline" 
              style={styles.teaChip} 
              textStyle={styles.chipText}
            >
              {user.favoriteTea}
            </Chip>
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
            labelStyle={styles.tabLabel}
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
      
      {renderEditDialog()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    padding: Layout.spacing.m,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.l,
  },
  avatarContainer: {
    marginRight: Layout.spacing.m,
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
    flex: 1,
    paddingTop: Layout.spacing.xs,
  },
  userName: {
    fontWeight: 'bold',
    color: Colors.headerText,
    marginBottom: 2,
  },
  username: {
    color: Colors.mutedText,
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  locationChip: {
    height: 28,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
  },
  editButton: {
    alignSelf: 'flex-end',
    marginTop: -Layout.spacing.xl, // Negative margin to position it properly
  },
  bioSection: {
    padding: Layout.spacing.m,
    paddingTop: 0,
  },
  bioText: {
    marginBottom: Layout.spacing.s,
    lineHeight: 20,
  },
  teaPreference: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.spacing.s,
    flexWrap: 'wrap',
  },
  teaChip: {
    height: 28,
    marginTop: 4,
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
    borderRadius: 0,
    overflow: 'hidden',
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    color: Colors.background,
    fontSize: 12,
    lineHeight: 16,
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
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: Layout.borderRadius.medium,
    marginTop: Layout.spacing.s,
    overflow: 'hidden',
  },
  submissionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fineDetails: {
    marginBottom: Layout.spacing.s,
  },
  missedText: {
    color: Colors.error,
    fontWeight: '500',
    marginBottom: 8,
  },
  fineContainer: {
    marginVertical: 8,
    borderRadius: Layout.borderRadius.small,
    overflow: 'hidden',
    backgroundColor: `${Colors.error}10`,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  fineInnerContainer: {
    padding: Layout.spacing.s,
  },
  fineText: {
    fontWeight: 'bold',
    color: Colors.error,
    fontSize: 16,
  },
  fineStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  fineStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  paidIndicator: {
    backgroundColor: Colors.success,
  },
  unpaidIndicator: {
    backgroundColor: Colors.error,
  },
  fineStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paidText: {
    color: Colors.success,
  },
  unpaidText: {
    color: Colors.error,
  },
  paymentDateText: {
    color: Colors.success,
    marginTop: 4,
    fontStyle: 'italic',
  },
  donationCard: {
    marginBottom: Layout.spacing.m,
    borderRadius: 0,
    overflow: 'hidden',
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  donationAmount: {
    fontWeight: '600',
    color: Colors.primary,
  },
  donationDate: {
    color: Colors.mutedText,
    fontSize: 14,
  },
  donationCharity: {
    marginBottom: Layout.spacing.s,
  },
  receiptContainer: {
    width: '100%',
    height: 200,
    borderRadius: Layout.borderRadius.medium,
    marginTop: Layout.spacing.s,
    overflow: 'hidden',
  },
  receiptImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statsCard: {
    marginBottom: Layout.spacing.m,
    borderRadius: Layout.borderRadius.medium,
    overflow: 'hidden',
    backgroundColor: Colors.card,
  },
  statsTitle: {
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
    color: Colors.primary,
    fontWeight: '600',
  },
  statsDivider: {
    marginVertical: Layout.spacing.m,
  },
  statTitle: {
    fontSize: 16,
    color: Colors.bodyText,
  },
  statDescription: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  achievementsTitle: {
    marginBottom: Layout.spacing.s,
    color: Colors.primary,
    fontWeight: '600',
  },
  achievements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Layout.spacing.xs, // Offset chip margins
  },
  achievementChip: {
    margin: Layout.spacing.xs,
    backgroundColor: Colors.primaryTransparent,
    height: 32,
  },
  achievementText: {
    fontSize: 12,
    color: Colors.primary,
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
  editDialog: {
    borderRadius: Layout.borderRadius.large,
    backgroundColor: Colors.card,
    paddingBottom: Layout.spacing.m,
  },
  dialogTitle: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  avatarEditContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.m,
  },
  avatarEdit: {
    marginBottom: Layout.spacing.s,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  changePhotoButton: {
    marginTop: Layout.spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: `${Colors.primary}20`,
    borderRadius: Layout.borderRadius.small,
  },
  changePhotoText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  dialogActions: {
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.m,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Layout.spacing.s,
  },
  cancelButtonText: {
    color: Colors.mutedText,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.spacing.m,
  },
  tabLabel: {
    fontSize: 12,
  },
  cardContent: {
    padding: 0,
  },
  payNowButton: {
    marginTop: 8,
    backgroundColor: Colors.error,
    borderRadius: Layout.borderRadius.small,
  },
}); 