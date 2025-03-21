import React, { useState } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity } from 'react-native';
import { Card, Text, Divider, Button, Avatar, Icon, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, formatDistance } from 'date-fns';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { useRouter, useNavigation } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Surface } from 'react-native-paper';

// Fix the TypeScript error by properly declaring the global variable
declare global {
  var lastPaymentType: 'fine' | 'donation';
}

// Set default value
global.lastPaymentType = 'fine';

// Define notification type with all possible types
interface Notification {
  id: string;
  type: 'fine' | 'friendRequest' | 'streak' | 'reminder' | 'teaAlert' | 'socialInteraction';
  title: string;
  message: string;
  time: Date;
  isRead: boolean;
  actionable?: boolean;
  fineAmount?: number;
  donationAmount?: number;
  user?: {
    name: string;
    avatarUrl: string;
  };
}

// Mock data for notifications with proper typing
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'teaAlert',
    title: 'Tea Time Alert',
    message: 'It\'s 5:00 PM! Time for your official tea. You have 10 minutes to submit.',
    time: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    isRead: false,
    actionable: true
  },
  {
    id: '2',
    type: 'socialInteraction',
    title: 'New Like',
    message: 'Sarah Miller liked your tea submission',
    time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isRead: true,
    user: {
      name: 'Sarah Miller',
      avatarUrl: 'https://i.pravatar.cc/150?img=4'
    }
  },
  {
    id: '3',
    type: 'fine',
    title: 'Fine Notice',
    message: 'You missed yesterday\'s tea time. His Majesty is very cross! Fine: £5.00 or donate £0.50 to charity.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    actionable: true,
    fineAmount: 5.00,
    donationAmount: 0.50
  },
  {
    id: '4',
    type: 'socialInteraction',
    title: 'New Comment',
    message: 'David Wilson commented: "Excellent choice of tea, old chap!"',
    time: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    isRead: true,
    user: {
      name: 'David Wilson',
      avatarUrl: 'https://i.pravatar.cc/150?img=3'
    }
  },
  {
    id: '5',
    type: 'reminder',
    title: 'Tea Time Reminder',
    message: 'The King\'s corgi is waiting for your tea submission! Don\'t disappoint the royal pets.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true
  },
];

type TabState = 'all' | 'unread';

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState<TabState>('all');
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const router = useRouter();
  const navigation = useNavigation();
  
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notification => !notification.isRead);
  
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
  };
  
  const getFormattedTime = (time: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - time.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(time, 'h:mm a');
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(time, 'MMM d');
    }
  };
  
  const handlePress = (notification: Notification) => {
    // Only handle regular notifications, not fine or reminder notifications
    if (notification.type !== 'fine' && notification.type !== 'reminder') {
      console.log(`Notification pressed: ${notification.id}`);
      
      // Mark notification as read
      const updatedNotifications = notifications.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      );
      setNotifications(updatedNotifications);
      
      // Route based on notification type
      if (notification.type === 'friendRequest') {
        router.push('/friends');
      } else if (notification.type === 'streak') {
        router.push('/profile');
      } else if (notification.type === 'teaAlert') {
        router.push('/');
      } else if (notification.type === 'socialInteraction') {
        // For now, direct to home page since social page doesn't exist yet
        router.push('/');
      }
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Notifications</Text>
      </View>

      <View style={styles.tabs}>
        <Button
          mode={activeTab === 'all' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('all')}
          style={styles.tab}
          contentStyle={styles.tabContent}
          labelStyle={styles.tabLabel}
        >
          All
        </Button>
        <Button
          mode={activeTab === 'unread' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('unread')}
          style={styles.tab}
          contentStyle={styles.tabContent}
          labelStyle={styles.tabLabel}
        >
          Unread {
            notifications.filter(n => !n.isRead).length > 0 && 
            `(${notifications.filter(n => !n.isRead).length})`
          }
        </Button>
      </View>
      
      <Divider style={styles.divider} />
      
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <>
            {item.type === 'fine' ? (
              // Fine notifications are not clickable as a whole
              <Card style={[styles.card, !item.isRead && styles.unreadCard, styles.fineNotification]}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.notificationContent}>
                    <View style={[styles.iconContainer, { backgroundColor: Colors.error }]}>
                      <MaterialCommunityIcons name="cash" size={24} color="white" />
                    </View>
                    <View style={styles.textContainer}>
                      <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
                      <Text variant="bodyMedium" style={styles.message}>{item.message}</Text>
                      
                      {/* Fine details */}
                      <View style={styles.fineDetails}>
                        <View style={styles.fineAmountContainer}>
                          <Text style={styles.fineText}>Fine: £{item.fineAmount?.toFixed(2)}</Text>
                        </View>
                        
                        {item.donationAmount && (
                          <View style={styles.donationAmountContainer}>
                            <Text style={styles.donationText}>
                              Suggested Donation: £{item.donationAmount?.toFixed(2)}
                            </Text>
                          </View>
                        )}
                        
                        {/* Action buttons */}
                        <View style={styles.actionButtons}>
                          <Button 
                            mode="contained" 
                            style={styles.payButton}
                            contentStyle={styles.actionButtonContent}
                            labelStyle={styles.actionButtonLabel}
                            onPress={() => {
                              console.log('Navigating directly to Fine Payment');
                              // @ts-ignore
                              global.lastPaymentType = 'fine';
                              
                              // NOTE: The issue might be in how we reference the modal path
                              // Let's try the simplest possible approach with absolute paths
                              const amount = item.fineAmount?.toFixed(2);
                              const donationAmount = item.donationAmount?.toFixed(2);
                              
                              // We need to handle the case when the user presses back from the modal
                              // First navigate to the root to clear any tabs state
                              router.replace('/');
                              
                              // Then immediately navigate to the modal
                              setTimeout(() => {
                                router.push(`/fine-payment?amount=${amount}&donationAmount=${donationAmount}`);
                              }, 50);
                            }}
                          >
                            Pay Fine
                          </Button>
                          
                          {item.donationAmount && (
                            <Button 
                              mode="outlined" 
                              style={styles.donateButton}
                              contentStyle={styles.actionButtonContent}
                              labelStyle={styles.donateButtonLabel}
                              onPress={() => {
                                console.log('Navigating directly to Donation');
                                // @ts-ignore
                                global.lastPaymentType = 'donation';
                                
                                // NOTE: The issue might be in how we reference the modal path
                                // Let's try the simplest possible approach with absolute paths
                                const amount = item.donationAmount?.toFixed(2);
                                
                                // We need to handle the case when the user presses back from the modal
                                // First navigate to the root to clear any tabs state
                                router.replace('/');
                                
                                // Then immediately navigate to the modal
                                setTimeout(() => {
                                  router.push(`/donation-payment?amount=${amount}`);
                                }, 50);
                              }}
                            >
                              Donate
                            </Button>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ) : item.type === 'reminder' ? (
              // Reminder notifications are not clickable
              <Card style={[styles.card, !item.isRead && styles.unreadCard, styles.reminderNotification]}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.notificationContent}>
                    <View style={[styles.iconContainer, styles.reminderIcon]}>
                      <MaterialCommunityIcons name="bell" size={24} color="white" />
                    </View>
                    <View style={styles.textContainer}>
                      <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
                      <Text variant="bodyMedium" style={styles.message}>{item.message}</Text>
                      <Text variant="bodySmall" style={styles.timestamp}>
                        {formatDistance(item.time, new Date(), { addSuffix: true })}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ) : (
              // Regular notifications are clickable as a whole
              <TouchableOpacity 
                onPress={() => handlePress(item)}
                activeOpacity={0.7}
              >
                <Card style={[styles.card, !item.isRead && styles.unreadCard]}>
                  <Card.Content style={styles.cardContent}>
                    <View style={styles.notificationContent}>
                      <View style={[styles.iconContainer, getIconBgColor(item.type)]}>
                        <MaterialCommunityIcons name={getNotificationIcon(item.type)} size={24} color="white" />
                      </View>
                      <View style={styles.textContainer}>
                        <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
                        <Text variant="bodyMedium" style={styles.message}>{item.message}</Text>
                        <Text variant="bodySmall" style={styles.timestamp}>
                          {formatDistance(item.time, new Date(), { addSuffix: true })}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            )}
          </>
        )}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon
              source="bell-off-outline"
              size={40}
              color={Colors.mutedText}
            />
            <Text style={styles.emptyText}>
              {activeTab === 'unread' 
                ? 'No unread notifications.' 
                : 'No notifications yet.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// Helper functions
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'teaAlert':
      return 'tea';
    case 'fine':
      return 'cash';
    case 'reminder':
      return 'bell';
    case 'socialInteraction':
      return 'comment';
    default:
      return 'information';
  }
};

const getIconBgColor = (type: string) => {
  switch (type) {
    case 'teaAlert':
      return styles.teaAlertIcon;
    case 'fine':
      return styles.fineIcon;
    case 'reminder':
      return styles.reminderIcon;
    case 'socialInteraction':
      return styles.socialIcon;
    default:
      return styles.defaultIcon;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Layout.spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.m,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  markAllButtonLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Layout.spacing.s,
  },
  tab: {
    flex: 1,
    margin: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.small,
  },
  tabContent: {
    height: 40,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    marginVertical: Layout.spacing.s,
    height: 1.5,
    backgroundColor: Colors.border,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Layout.spacing.m,
  },
  card: {
    marginBottom: Layout.spacing.m,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.small,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 100, // Ensure consistent card height regardless of read status
  },
  cardContent: {
    padding: Layout.spacing.m,
  },
  unreadCard: {
    backgroundColor: `${Colors.primary}08`,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  avatar: {
    marginRight: Layout.spacing.s,
    backgroundColor: Colors.background,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.s,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  teaAlertIcon: {
    backgroundColor: Colors.primary,
  },
  fineIcon: {
    backgroundColor: Colors.error,
  },
  reminderIcon: {
    backgroundColor: Colors.warning,
  },
  socialIcon: {
    backgroundColor: Colors.info,
  },
  defaultIcon: {
    backgroundColor: Colors.info,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  timestamp: {
    color: Colors.mutedText,
    fontSize: 12,
  },
  message: {
    marginBottom: Layout.spacing.s,
    color: Colors.bodyText,
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: Layout.spacing.xs,
  },
  actionButtons: {
    marginTop: Layout.spacing.s,
    flexDirection: 'row', 
  },
  actionButton: {
    alignSelf: 'flex-start',
    borderRadius: Layout.borderRadius.small,
    elevation: 1,
    backgroundColor: Colors.primary,
  },
  actionButtonContent: {
    height: 36,
  },
  actionButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  fineActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payButton: {
    marginRight: Layout.spacing.s,
    backgroundColor: Colors.error,
    borderRadius: Layout.borderRadius.small,
    elevation: 2,
  },
  donateButton: {
    borderColor: Colors.primary,
    borderRadius: Layout.borderRadius.small,
  },
  donateButtonLabel: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Layout.spacing.xxl,
    padding: Layout.spacing.xl,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Layout.spacing.m,
    color: Colors.mutedText,
    fontSize: 16,
  },
  fineNotification: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  reminderNotification: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  textContainer: {
    flex: 1,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  fineDetails: {
    marginTop: Layout.spacing.s,
  },
  fineAmountContainer: {
    alignSelf: 'flex-start',
    paddingVertical: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.m,
    backgroundColor: '#FFE8E8',
    borderRadius: Layout.borderRadius.small,
    marginBottom: Layout.spacing.xs,
    borderWidth: 1,
    borderColor: '#FFCECE',
  },
  fineText: {
    color: Colors.error,
    fontWeight: '600',
  },
  donationAmountContainer: {
    alignSelf: 'flex-start',
    paddingVertical: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.m,
    backgroundColor: '#E8F4FF',
    borderRadius: Layout.borderRadius.small,
    marginBottom: Layout.spacing.s,
    borderWidth: 1,
    borderColor: '#CCE4FF',
  },
  donationText: {
    color: Colors.primary,
    fontWeight: '500',
  },
}); 