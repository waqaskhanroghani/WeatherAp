import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useWeather } from '../../context/WeatherContext';

export default function TabLayout() {
  const { isDarkMode } = useWeather();

  const getTabBarStyle = () => ({
    backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
    borderTopColor: isDarkMode ? '#333' : '#eee',
    borderTopWidth: 1,
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
  });

  const getHeaderStyle = () => ({
    backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
    borderBottomColor: isDarkMode ? '#333' : '#eee',
    borderBottomWidth: 1,
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: getTabBarStyle(),
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: isDarkMode ? '#888' : '#666',
        headerStyle: getHeaderStyle(),
        headerTintColor: isDarkMode ? '#fff' : '#000',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
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
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="cog" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
