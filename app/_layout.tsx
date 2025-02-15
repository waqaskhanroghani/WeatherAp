import { Stack } from 'expo-router';
import { WeatherProvider } from '../context/WeatherContext';

export default function RootLayout() {
  return (
    <WeatherProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </WeatherProvider>
  );
}
