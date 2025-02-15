import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          backgroundColor: isDark ? '#1a1a1a' : '#fff',
          borderTopColor: isDark ? '#333' : '#e5e5e5',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: isDark ? '#888' : '#666',
        headerStyle: {
          backgroundColor: isDark ? '#1a1a1a' : '#fff',
        },
        headerTintColor: isDark ? '#fff' : '#000',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Weather',
          tabBarLabel: 'Weather',
          headerTitle: 'Weather',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="cloud" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarLabel: 'Favorites',
          headerTitle: 'Favorite Cities',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="star" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
