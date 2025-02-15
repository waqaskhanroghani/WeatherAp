import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useWeather } from '../../context/WeatherContext';
import { WeatherData } from '../../types/weather';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function WeatherScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<WeatherData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const scale = useSharedValue(1);
  
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
    refreshWeatherData,
  } = useWeather();

  const filteredCities = useMemo(() => {
    if (!searchQuery) return [];
    return weatherData.filter(city =>
      city.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, weatherData]);

  const handleCitySelect = useCallback((city: WeatherData) => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    setSelectedCity(city);
    addRecentSearch(city.city);
    setSearchQuery('');
  }, []);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshWeatherData();
    setRefreshing(false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>You are offline. Showing cached data.</Text>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <FontAwesome name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, isDarkMode && styles.darkInput]}
              placeholder="Search city..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={isDarkMode ? '#888' : '#666'}
            />
          </View>
          <TouchableOpacity
            style={styles.unitToggle}
            onPress={toggleTemperatureUnit}
          >
            <Text style={styles.unitText}>{isCelsius ? '°C' : '°F'}</Text>
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {searchQuery !== '' && (
          <FlatList
            data={filteredCities}
            keyExtractor={(item) => item.city}
            style={styles.searchResults}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <AnimatedTouchableOpacity
                style={[styles.searchResultItem, animatedStyle]}
                onPress={() => handleCitySelect(item)}
              >
                <Text style={isDarkMode ? styles.darkText : styles.lightText}>
                  {item.city}
                </Text>
              </AnimatedTouchableOpacity>
            )}
          />
        )}

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Map View */}
          {currentLocation && !searchQuery && !selectedCity && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: currentLocation.lat,
                  longitude: currentLocation.lon,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: currentLocation.lat,
                    longitude: currentLocation.lon,
                  }}
                  title="Your Location"
                />
              </MapView>
            </View>
          )}

          {/* Recent Searches */}
          {!searchQuery && !selectedCity && (
            <FlatList
              data={recentSearches}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              style={styles.recentContainer}
              renderItem={({ item }) => {
                const cityData = weatherData.find((c) => c.city === item);
                if (!cityData) return null;
                return (
                  <AnimatedTouchableOpacity
                    style={[
                      styles.recentItem,
                      getWeatherBackground(cityData.weather),
                      animatedStyle,
                    ]}
                    onPress={() => handleCitySelect(cityData)}
                  >
                    <Text style={styles.recentItemText}>{item}</Text>
                    <Text style={styles.recentItemTemp}>
                      {getTemperature(cityData.temperature)}
                    </Text>
                  </AnimatedTouchableOpacity>
                );
              }}
            />
          )}

          {/* Weather Display */}
          {selectedCity && (
            <Animated.View
              style={[
                styles.weatherContainer,
                getWeatherBackground(selectedCity.weather),
                animatedStyle,
              ]}
            >
              <View style={styles.weatherHeader}>
                <Text style={styles.cityName}>{selectedCity.city}</Text>
                <TouchableOpacity
                  onPress={() => toggleFavorite(selectedCity.city)}
                >
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
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  offlineBanner: {
    backgroundColor: '#ff9800',
    padding: 10,
    marginBottom: 10,
  },
  offlineText: {
    color: '#fff',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000',
  },
  darkInput: {
    backgroundColor: '#333',
    color: '#fff',
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
    borderRadius: 10,
    marginHorizontal: 20,
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
  searchResultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recentContainer: {
    maxHeight: 120,
    marginBottom: 20,
  },
  recentItem: {
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recentItemTemp: {
    color: '#fff',
    fontSize: 14,
  },
  weatherContainer: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    margin: 10,
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
  lightText: {
    color: '#000',
  },
  darkText: {
    color: '#fff',
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
});
