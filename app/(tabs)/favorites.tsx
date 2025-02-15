import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useWeather } from '../../context/WeatherContext';
import { WeatherData } from '../../types/weather';

export default function FavoritesScreen() {
  const { favorites, weatherData, isDarkMode, isCelsius, toggleFavorite } = useWeather();

  const getTemperature = (temp: number) => {
    if (isCelsius) return `${temp}°C`;
    return `${Math.round((temp * 9) / 5 + 32)}°F`;
  };

  const getWeatherBackground = (weather: string) => {
    switch (weather.toLowerCase()) {
      case 'sunny':
        return { backgroundColor: '#FFD700' };
      case 'cloudy':
        return { backgroundColor: '#808080' };
      case 'rainy':
        return { backgroundColor: '#4682B4' };
      default:
        return { backgroundColor: '#87CEEB' };
    }
  };

  const renderFavoriteCity = ({ item: cityName }: { item: string }) => {
    const cityData = weatherData.find((city) => city.city === cityName);
    if (!cityData) return null;

    return (
      <Animated.View style={styles.favoriteCard}>
        <View style={[styles.cardContent, getWeatherBackground(cityData.weather)]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cityName}>{cityData.city}</Text>
            <TouchableOpacity onPress={() => toggleFavorite(cityData.city)}>
              <FontAwesome name="star" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.temperature}>
            {getTemperature(cityData.temperature)}
          </Text>
          <Text style={styles.weatherCondition}>{cityData.weather}</Text>

          <View style={styles.weatherDetails}>
            <View style={styles.weatherDetail}>
              <FontAwesome name="tint" size={20} color="#fff" />
              <Text style={styles.detailText}>{cityData.humidity}%</Text>
            </View>
            <View style={styles.weatherDetail}>
              <FontAwesome name="wind" size={20} color="#fff" />
              <Text style={styles.detailText}>{cityData.windSpeed} km/h</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.title, isDarkMode && styles.darkText]}>
        Favorite Cities
      </Text>
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="star-o" size={50} color={isDarkMode ? '#fff' : '#000'} />
          <Text style={[styles.emptyText, isDarkMode && styles.darkText]}>
            No favorite cities yet
          </Text>
          <Text style={[styles.emptySubtext, isDarkMode && styles.darkText]}>
            Add cities to your favorites to see them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteCity}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  darkText: {
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 20,
  },
  favoriteCard: {
    marginBottom: 15,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardContent: {
    padding: 20,
    borderRadius: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  weatherCondition: {
    fontSize: 18,
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});
