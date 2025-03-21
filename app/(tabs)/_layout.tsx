import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, SafeAreaView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.mutedText,
        headerShown: false,
        tabBarStyle: {
          ...Platform.select({
            ios: {
              shadowOpacity: 0.1,
              shadowRadius: 10,
              shadowColor: '#000',
              shadowOffset: { height: -1, width: 0 },
            },
            android: {
              elevation: 4,
            },
          }),
          backgroundColor: Colors.card,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0, 0, 0, 0.06)',
          height: 60 + (insets.bottom > 0 ? insets.bottom : 16),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
          paddingTop: 8,
        },
        tabBarItemStyle: {
          paddingBottom: Platform.OS === 'ios' ? 4 : 0,
        },
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 12,
          marginTop: 0,
          marginBottom: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "notifications" : "notifications-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
