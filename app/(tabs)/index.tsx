import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useWeather } from '../../context/WeatherContext';
import { WeatherData } from '../../types/weather';

export default function WeatherScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState('');

  const {
    weatherData,
    recentSearches,
    favorites,
    isCelsius,
    isDarkMode,
    isOffline,
    currentLocation,
    addRecentSearch,
    toggleFavorite,
    toggleTemperatureUnit,
  } = useWeather();

  useEffect(() => {
    getCurrentLocationWeather();
  }, []);

  const findNearestCity = (latitude: number, longitude: number) => {
    // Calculate distance between two points using Haversine formula
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Find the nearest city from the weather data
    let nearestCity = weatherData[0];
    let minDistance = Number.MAX_VALUE;

    weatherData.forEach(city => {
      if (city.coordinates) {
        const distance = getDistance(
          latitude,
          longitude,
          city.coordinates.lat,
          city.coordinates.lon
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestCity = city;
        }
      }
    });

    return nearestCity;
  };

  const getCurrentLocationWeather = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // If location permission is denied, show Islamabad weather by default
        const defaultCity = weatherData.find(city => city.city === 'Islamabad');
        if (defaultCity) {
          setSelectedCity(defaultCity);
          addRecentSearch(defaultCity.city);
        }
        setLocationError('Using default location (Islamabad)');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const nearestCity = findNearestCity(location.coords.latitude, location.coords.longitude);
      
      if (nearestCity) {
        setSelectedCity(nearestCity);
        addRecentSearch(nearestCity.city);
      }
    } catch (error) {
      // If there's any error, show Islamabad weather
      const defaultCity = weatherData.find(city => city.city === 'Islamabad');
      if (defaultCity) {
        setSelectedCity(defaultCity);
        addRecentSearch(defaultCity.city);
      }
      setLocationError('Unable to get location. Showing Islamabad weather.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCities = weatherData.filter(city =>
    city.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCitySelect = (city: WeatherData) => {
    setSelectedCity(city);
    addRecentSearch(city.city);
    setSearchQuery('');
  };

  const getTemperature = (temp: number) => {
    if (isCelsius) return `${temp}°C`;
    return `${Math.round((temp * 9) / 5 + 32)}°F`;
  };

  const getWeatherBackground = (weather: string) => {
    switch (weather.toLowerCase()) {
      case 'sunny': return { backgroundColor: '#FFD700' };
      case 'cloudy': return { backgroundColor: '#808080' };
      case 'rainy': return { backgroundColor: '#4682B4' };
      default: return { backgroundColor: '#87CEEB' };
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Getting weather information...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, isDarkMode && styles.darkInput]}>
            <FontAwesome name="search" size={20} color={isDarkMode ? '#888' : '#666'} />
            <TextInput
              style={[styles.searchInput, isDarkMode && styles.darkText]}
              placeholder="Search city..."
              placeholderTextColor={isDarkMode ? '#888' : '#666'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="search"
              enablesReturnKeyAutomatically
              onSubmitEditing={Keyboard.dismiss}
              keyboardType="default"
              editable={true}
            />
          </View>
          <TouchableOpacity style={styles.unitToggle} onPress={toggleTemperatureUnit}>
            <Text style={styles.unitText}>{isCelsius ? '°C' : '°F'}</Text>
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {searchQuery !== '' && (
          <FlatList
            data={filteredCities}
            keyExtractor={(item) => item.city}
            style={[styles.searchResults, isDarkMode && styles.darkSearchResults]}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.searchResultItem, isDarkMode && styles.darkSearchResultItem]}
                onPress={() => handleCitySelect(item)}
              >
                <Text style={isDarkMode ? styles.darkText : styles.lightText}>
                  {item.city}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Weather Display */}
        {selectedCity && (
          <View style={[styles.weatherContainer, getWeatherBackground(selectedCity.weather)]}>
            <View style={styles.weatherHeader}>
              <Text style={styles.cityName}>{selectedCity.city}</Text>
              <TouchableOpacity onPress={() => toggleFavorite(selectedCity.city)}>
                <FontAwesome
                  name={favorites.includes(selectedCity.city) ? 'star' : 'star-o'}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.temperature}>
              {getTemperature(selectedCity.temperature)}
            </Text>
            <Text style={styles.weatherCondition}>{selectedCity.weather}</Text>

            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetail}>
                <FontAwesome name="tint" size={20} color="#fff" />
                <Text style={styles.detailText}>{selectedCity.humidity}%</Text>
              </View>
              <View style={styles.weatherDetail}>
                <FontAwesome name="wind" size={20} color="#fff" />
                <Text style={styles.detailText}>{selectedCity.windSpeed} km/h</Text>
              </View>
            </View>

            {selectedCity.coordinates && (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: selectedCity.coordinates.lat,
                    longitude: selectedCity.coordinates.lon,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: selectedCity.coordinates.lat,
                      longitude: selectedCity.coordinates.lon,
                    }}
                    title={selectedCity.city}
                  />
                </MapView>
              </View>
            )}
          </View>
        )}

        {locationError !== '' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{locationError}</Text>
          </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    backgroundColor: 'transparent',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  darkInput: {
    backgroundColor: '#333',
  },
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#000',
  },
  unitToggle: {
    width: 50,
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchResults: {
    maxHeight: 200,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 10,
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
  searchResultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkSearchResultItem: {
    borderBottomColor: '#444',
  },
  weatherContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  weatherCondition: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  weatherDetail: {
    alignItems: 'center',
  },
  detailText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 16,
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ff5252',
    margin: 16,
    borderRadius: 10,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
  },
});
