import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          ...Platform.select({
            ios: {
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#e5e5e5',
            },
            android: {
              backgroundColor: '#fff',
              elevation: 8,
            },
          }),
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Weather',
          headerTitle: 'Weather',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="cloud" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          headerTitle: 'Favorite Cities',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="star" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
