import React, { useState } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity } from 'react-native';
import { Card, Text, Divider, Button, Avatar, Icon, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { useRouter } from 'expo-router';

// Mock data for notifications
const MOCK_NOTIFICATIONS = [
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
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const router = useRouter();
  
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
  
  const handlePayFine = (notification: any) => {
    if (notification.type === 'fine') {
      router.push({
        pathname: '/(modals)/fine-payment',
        params: { 
          fineId: notification.id, 
          amount: notification.fineAmount.toFixed(2) 
        }
      });
    }
  };
  
  const renderNotificationCard = ({ item }: { item: any }) => {
    const handlePress = () => {
      if (!item.isRead) {
        markAsRead(item.id);
      }
      if (item.type === 'fine') {
        handlePayFine(item);
      }
      // Handle notification press (e.g., navigate to relevant screen)
    };
    
    return (
      <TouchableOpacity onPress={handlePress}>
        <Card style={[styles.card, !item.isRead && styles.unreadCard]}>
          <Card.Content>
            <View style={styles.notificationHeader}>
              {item.user && (
                <Avatar.Image 
                  size={40} 
                  source={{ uri: item.user.avatarUrl }} 
                  style={styles.avatar}
                />
              )}
              {!item.user && (
                <View style={[styles.iconContainer, getIconBgColor(item.type)]}>
                  <Icon
                    source={getNotificationIcon(item.type)}
                    size={24}
                    color={Colors.background}
                  />
                </View>
              )}
              <View style={styles.headerText}>
                <Text style={styles.title} variant="titleMedium">{item.title}</Text>
                <Text style={styles.timestamp} variant="bodySmall">{getFormattedTime(item.time)}</Text>
              </View>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            
            <Text style={styles.message}>{item.message}</Text>
            
            {item.actionable && (
              <View style={styles.actionButtons}>
                {item.type === 'teaAlert' && (
                  <Button 
                    mode="contained" 
                    style={styles.actionButton}
                    onPress={() => console.log('Take tea photo')}
                  >
                    Take Photo
                  </Button>
                )}
                {item.type === 'fine' && (
                  <View style={styles.fineActions}>
                    <Button 
                      mode="contained" 
                      style={styles.payButton}
                      onPress={() => console.log('Pay fine')}
                    >
                      Pay Fine (£{item.fineAmount.toFixed(2)})
                    </Button>
                    <Button 
                      mode="outlined" 
                      style={styles.donateButton}
                      onPress={() => console.log('Donate')}
                    >
                      Donate (£{item.donationAmount.toFixed(2)})
                    </Button>
                  </View>
                )}
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Notifications</Text>
        {notifications.some(n => !n.isRead) && (
          <Button onPress={markAllAsRead} mode="text">
            Mark all as read
          </Button>
        )}
      </View>
      
      <View style={styles.tabs}>
        <Button
          mode={activeTab === 'all' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('all')}
          style={styles.tab}
        >
          All
        </Button>
        <Button
          mode={activeTab === 'unread' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('unread')}
          style={styles.tab}
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
        renderItem={renderNotificationCard}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {activeTab === 'unread' 
              ? 'No unread notifications.' 
              : 'No notifications yet.'}
          </Text>
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
  unreadCard: {
    backgroundColor: Colors.primaryTransparent,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  avatar: {
    marginRight: Layout.spacing.s,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.s,
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
  defaultIcon: {
    backgroundColor: Colors.info,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
  },
  timestamp: {
    color: Colors.mutedText,
  },
  message: {
    marginBottom: Layout.spacing.s,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.secondary,
  },
  actionButtons: {
    marginTop: Layout.spacing.s,
  },
  actionButton: {
    alignSelf: 'flex-start',
  },
  fineActions: {
    flexDirection: 'row',
  },
  payButton: {
    marginRight: Layout.spacing.s,
    backgroundColor: Colors.error,
  },
  donateButton: {
    borderColor: Colors.secondary,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Layout.spacing.xl,
    color: Colors.mutedText,
  },
  fineNotification: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  fineAction: {
    marginTop: 4,
    color: Colors.error,
    fontWeight: '500',
    fontSize: 13,
  },
}); 