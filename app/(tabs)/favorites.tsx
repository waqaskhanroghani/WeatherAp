import React, { useCallback, memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import { useWeather } from '../../context/WeatherContext';
import { FlashList } from '@shopify/flash-list';
import type { WeatherData } from '../../types/weather';

// Memoized Weather Item Component
const WeatherItem = memo(({ 
  weatherInfo, 
  onToggleFavorite, 
  isCelsius 
}: { 
  weatherInfo: WeatherData; 
  onToggleFavorite: (city: string) => void;
  isCelsius: boolean;
}) => {
  const getTemperature = useCallback((temp: number) => {
    if (isCelsius) return `${temp}°C`;
    return `${Math.round((temp * 9) / 5 + 32)}°F`;
  }, [isCelsius]);

  const getWeatherBackground = useCallback((weather: string) => {
    switch (weather.toLowerCase()) {
      case 'sunny': return { backgroundColor: '#FFD700' };
      case 'cloudy': return { backgroundColor: '#808080' };
      case 'rainy': return { backgroundColor: '#4682B4' };
      default: return { backgroundColor: '#87CEEB' };
    }
  }, []);

  return (
    <View style={[
      styles.favoriteItem,
      getWeatherBackground(weatherInfo.weather)
    ]}>
      <View style={styles.favoriteHeader}>
        <Text style={styles.cityName}>{weatherInfo.city}</Text>
        <TouchableOpacity
          onPress={() => onToggleFavorite(weatherInfo.city)}
          style={styles.favoriteButton}
        >
          <FontAwesome name="star" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.temperature}>
        {getTemperature(weatherInfo.temperature)}
      </Text>
      <Text style={styles.weatherCondition}>
        {weatherInfo.weather}
      </Text>

      <View style={styles.weatherDetails}>
        <View style={styles.weatherDetail}>
          <FontAwesome name="tint" size={20} color="#fff" />
          <Text style={styles.detailText}>
            {weatherInfo.humidity}%
          </Text>
        </View>
        <View style={styles.weatherDetail}>
          <FontAwesome name="wind" size={20} color="#fff" />
          <Text style={styles.detailText}>
            {weatherInfo.windSpeed} km/h
          </Text>
        </View>
      </View>
    </View>
  );
});

// Empty List Component
const EmptyListComponent = memo(({ isDarkMode }: { isDarkMode: boolean }) => (
  <View style={styles.emptyContainer}>
    <FontAwesome name="star-o" size={50} color={isDarkMode ? '#666' : '#999'} />
    <Text style={[styles.emptyText, isDarkMode && styles.darkText]}>
      No favorite cities yet
    </Text>
    <Text style={[styles.subText, isDarkMode && styles.darkText]}>
      Add cities to favorites from the weather screen
    </Text>
  </View>
));

export default function FavoritesScreen() {
  const {
    weatherData,
    favorites,
    isCelsius,
    isDarkMode,
    toggleFavorite,
  } = useWeather();

  const getFavoriteWeather = useCallback((city: string) => {
    return weatherData.find(data => data.city === city);
  }, [weatherData]);

  const renderItem = useCallback(({ item }: { item: string }) => {
    const weatherInfo = getFavoriteWeather(item);
    if (!weatherInfo) return null;

    return (
      <WeatherItem
        weatherInfo={weatherInfo}
        onToggleFavorite={toggleFavorite}
        isCelsius={isCelsius}
      />
    );
  }, [getFavoriteWeather, toggleFavorite, isCelsius]);

  const keyExtractor = useCallback((item: string) => item, []);

  const getItemType = useCallback(() => 'weather', []);

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      <FlashList
        data={favorites}
        renderItem={renderItem}
        estimatedItemSize={200}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<EmptyListComponent isDarkMode={isDarkMode} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 20,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  darkText: {
    color: '#fff',
  },
  favoriteItem: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  favoriteButton: {
    padding: 5,
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  weatherCondition: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 15,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weatherDetail: {
    alignItems: 'center',
  },
  detailText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 16,
  },
});
