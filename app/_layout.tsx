import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Slot, Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { WeatherProvider } from '../context/WeatherContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <WeatherProvider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
      </Stack>
    </WeatherProvider>
  );
}
