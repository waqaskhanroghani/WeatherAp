import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Keyboard,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useWeather } from '../../context/WeatherContext';
import * as Location from 'expo-location';
import { WeatherData } from '../../types/weather';

export default function WeatherScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [locationError, setLocationError] = useState('');

  const {
    weatherData,
    recentSearches,
    favorites,
    isCelsius,
    isDarkMode,
    isOffline,
    searchSuggestions,
    addRecentSearch,
    toggleFavorite,
    toggleTemperatureUnit,
    searchCities,
    getWeatherByCity,
    refreshWeather,
  } = useWeather();

  useEffect(() => {
    getCurrentLocationWeather();
  }, []);

  const getCurrentLocationWeather = async () => {
    try {
      setIsLoading(true);
      setLocationError('');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const nearestCity = findNearestCity(location.coords.latitude, location.coords.longitude);
      if (nearestCity) {
        setSelectedCity(nearestCity);
        addRecentSearch(nearestCity.city);
      }
    } catch (error) {
      setLocationError('Error getting location');
      console.error('Location error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const findNearestCity = (lat: number, lon: number): WeatherData | null => {
    let nearestCity = null;
    let shortestDistance = Infinity;

    weatherData.forEach(city => {
      if (city.coordinates) {
        const distance = getDistance(
          lat,
          lon,
          city.coordinates.lat,
          city.coordinates.lon
        );
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestCity = city;
        }
      }
    });

    return nearestCity;
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    searchCities(text);
  };

  const handleCitySelect = (city: WeatherData) => {
    setSelectedCity(city);
    addRecentSearch(city.city);
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshWeather();
    setIsRefreshing(false);
  }, [refreshWeather]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return 'sun-o';
      case 'cloudy': return 'cloud';
      case 'rainy': return 'umbrella';
      case 'thunderstorm': return 'bolt';
      case 'foggy': return 'align-center';
      case 'windy': return 'flag';
      case 'clear': return 'star';
      default: return 'question';
    }
  };

  const getWeatherColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return '#FFD700';
      case 'cloudy': return '#808080';
      case 'rainy': return '#4169E1';
      case 'thunderstorm': return '#483D8B';
      case 'foggy': return '#B8B8B8';
      case 'windy': return '#87CEEB';
      case 'clear': return '#00BFFF';
      default: return '#666666';
    }
  };

  const getTemperature = (temp: number) => {
    if (isCelsius) return `${temp}°C`;
    return `${Math.round((temp * 9) / 5 + 32)}°F`;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, isDarkMode && styles.darkInput]}>
          <FontAwesome name="search" size={20} color={isDarkMode ? '#888' : '#666'} />
          <TextInput
            style={[styles.searchInput, isDarkMode && styles.darkText]}
            placeholder="Search city or country..."
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {searchQuery !== '' && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => handleSearchChange('')}
            >
              <FontAwesome name="times-circle" size={20} color={isDarkMode ? '#888' : '#666'} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.unitToggle} onPress={toggleTemperatureUnit}>
          <Text style={styles.unitText}>{isCelsius ? '°C' : '°F'}</Text>
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      {searchQuery !== '' && searchSuggestions.length > 0 && (
        <View style={[styles.searchResultsContainer, isDarkMode && styles.darkSearchResults]}>
          <FlatList
            data={searchSuggestions}
            keyExtractor={(item) => item.city}
            style={styles.searchResults}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.searchResultItem, isDarkMode && styles.darkSearchResultItem]}
                onPress={() => handleCitySelect(item)}
                activeOpacity={0.7}
              >
                <View style={styles.cityInfo}>
                  <Text style={[styles.searchCityName, isDarkMode && styles.darkText]}>
                    {item.city}
                  </Text>
                  <Text style={[styles.searchCountryName, isDarkMode && styles.darkText]}>
                    {item.country}
                  </Text>
                </View>
                <View style={styles.weatherInfo}>
                  <FontAwesome 
                    name={getWeatherIcon(item.weather)} 
                    size={20} 
                    color={getWeatherColor(item.weather)} 
                    style={styles.searchWeatherIcon}
                  />
                  <Text style={[styles.searchTemperature, isDarkMode && styles.darkText]}>
                    {getTemperature(item.temperature)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Recent Searches */}
      {searchQuery === '' && recentSearches.length > 0 && (
        <View style={styles.recentContainer}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Recent Searches</Text>
          <FlatList
            data={recentSearches}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const cityData = getWeatherByCity(item);
              if (!cityData) return null;
              
              return (
                <TouchableOpacity
                  style={[styles.recentItem, isDarkMode && styles.darkRecentItem]}
                  onPress={() => handleCitySelect(cityData)}
                >
                  <Text style={[styles.recentCity, isDarkMode && styles.darkText]}>{item}</Text>
                  <FontAwesome 
                    name={getWeatherIcon(cityData.weather)} 
                    size={24} 
                    color={getWeatherColor(cityData.weather)} 
                  />
                  <Text style={[styles.recentTemp, isDarkMode && styles.darkText]}>
                    {getTemperature(cityData.temperature)}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* Selected City Weather */}
      {selectedCity && (
        <View 
          style={[
            styles.weatherCard,
            isDarkMode && styles.darkWeatherCard,
            { backgroundColor: getWeatherColor(selectedCity.weather) + '20' }
          ]}
        >
          <View style={styles.weatherHeader}>
            <View>
              <Text style={[styles.cityName, isDarkMode && styles.darkText]}>
                {selectedCity.city}
              </Text>
              <Text style={[styles.countryName, isDarkMode && styles.darkText]}>
                {selectedCity.country}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleFavorite(selectedCity.city)}
              style={styles.favoriteButton}
            >
              <FontAwesome
                name={favorites.includes(selectedCity.city) ? 'star' : 'star-o'}
                size={24}
                color={favorites.includes(selectedCity.city) ? '#FFD700' : (isDarkMode ? '#fff' : '#000')}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.weatherInfo}>
            <FontAwesome
              name={getWeatherIcon(selectedCity.weather)}
              size={64}
              color={getWeatherColor(selectedCity.weather)}
              style={styles.weatherIcon}
            />
            <Text style={[styles.temperature, isDarkMode && styles.darkText]}>
              {getTemperature(selectedCity.temperature)}
            </Text>
            <Text style={[styles.weatherCondition, isDarkMode && styles.darkText]}>
              {selectedCity.weather}
            </Text>
          </View>

          <View style={styles.weatherDetails}>
            <View style={styles.detailItem}>
              <FontAwesome name="tint" size={20} color={isDarkMode ? '#fff' : '#000'} />
              <Text style={[styles.detailText, isDarkMode && styles.darkText]}>
                {selectedCity.humidity}%
              </Text>
              <Text style={[styles.detailLabel, isDarkMode && styles.darkText]}>Humidity</Text>
            </View>
            <View style={styles.detailItem}>
              <FontAwesome name="wind" size={20} color={isDarkMode ? '#fff' : '#000'} />
              <Text style={[styles.detailText, isDarkMode && styles.darkText]}>
                {selectedCity.windSpeed} km/h
              </Text>
              <Text style={[styles.detailLabel, isDarkMode && styles.darkText]}>Wind Speed</Text>
            </View>
          </View>
        </View>
      )}

      {/* Error Message */}
      {locationError !== '' && (
        <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
          {locationError}
        </Text>
      )}

      {/* Offline Message */}
      {isOffline && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>You are offline. Showing cached data.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  darkInput: {
    backgroundColor: '#333',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  clearButton: {
    padding: 4,
  },
  unitToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  unitText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchResultsContainer: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  darkSearchResults: {
    backgroundColor: '#333',
  },
  searchResults: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkSearchResultItem: {
    borderBottomColor: '#444',
  },
  cityInfo: {
    flex: 1,
  },
  searchCityName: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchCountryName: {
    fontSize: 14,
    color: '#666',
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchWeatherIcon: {
    marginRight: 8,
  },
  searchTemperature: {
    fontSize: 16,
    fontWeight: '600',
  },
  recentContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  recentItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  darkRecentItem: {
    backgroundColor: '#333',
  },
  recentCity: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recentTemp: {
    fontSize: 14,
    marginTop: 4,
  },
  weatherCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  darkWeatherCard: {
    backgroundColor: '#333',
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  countryName: {
    fontSize: 16,
    color: '#666',
  },
  favoriteButton: {
    padding: 8,
  },
  weatherIcon: {
    marginBottom: 10,
    alignSelf: 'center',
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  weatherCondition: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 10,
  },
  offlineBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ff9800',
    padding: 8,
  },
  offlineText: {
    color: '#fff',
    textAlign: 'center',
  },
});
