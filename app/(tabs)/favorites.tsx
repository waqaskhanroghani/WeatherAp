import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useWeather } from '../../context/WeatherContext';
import { WeatherData } from '../../types/weather';

export default function FavoritesScreen() {
  const { favorites, weatherData, isCelsius, toggleFavorite } = useWeather();

  const getFavoriteData = (city: string): WeatherData | undefined => {
    return weatherData.find((item) => item.city === city);
  };

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

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="star-o" size={64} color="#666" />
          <Text style={styles.emptyText}>No favorite cities yet</Text>
          <Text style={styles.emptySubText}>
            Add cities to your favorites from the weather screen
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const cityData = getFavoriteData(item);
            if (!cityData) return null;

            return (
              <View
                style={[styles.favoriteItem, getWeatherBackground(cityData.weather)]}
              >
                <View style={styles.favoriteContent}>
                  <View>
                    <Text style={styles.cityName}>{cityData.city}</Text>
                    <Text style={styles.weatherText}>{cityData.weather}</Text>
                  </View>
                  <View style={styles.rightContent}>
                    <Text style={styles.temperature}>
                      {getTemperature(cityData.temperature)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(cityData.city)}
                      style={styles.favoriteButton}
                    >
                      <FontAwesome name="star" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.weatherDetails}>
                  <View style={styles.weatherDetail}>
                    <FontAwesome name="tint" size={16} color="#fff" />
                    <Text style={styles.detailText}>{cityData.humidity}%</Text>
                  </View>
                  <View style={styles.weatherDetail}>
                    <FontAwesome name="wind" size={16} color="#fff" />
                    <Text style={styles.detailText}>{cityData.windSpeed} km/h</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  favoriteItem: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  favoriteContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  weatherText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
  },
  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  weatherDetails: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
  },
});
