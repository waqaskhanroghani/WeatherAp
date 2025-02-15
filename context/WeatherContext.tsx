import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import * as Location from 'expo-location';
import { WeatherContextType, WeatherData, Coordinates } from '../types/weather';
import weatherData from '../assets/weatherData.json';

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);
const WEATHER_API_URL = 'http://localhost:3000/weather';

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCelsius, setIsCelsius] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [lastSearchedCity, setLastSearchedCity] = useState<string | null>(null);

  useEffect(() => {
    loadStoredData();
    checkDarkMode();
    setupNetworkListener();
    requestLocationPermission();
  }, []);

  const setupNetworkListener = async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      setIsOffline(!networkState.isConnected);

      // Check network status periodically
      setInterval(async () => {
        const state = await Network.getNetworkStateAsync();
        setIsOffline(!state.isConnected);
      }, 5000); // Check every 5 seconds
    } catch (error) {
      console.error('Error setting up network listener:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          lat: location.coords.latitude,
          lon: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadStoredData = async () => {
    try {
      const [
        storedSearches,
        storedFavorites,
        storedUnit,
        storedLastCity,
        storedWeatherData
      ] = await Promise.all([
        AsyncStorage.getItem('recentSearches'),
        AsyncStorage.getItem('favorites'),
        AsyncStorage.getItem('temperatureUnit'),
        AsyncStorage.getItem('lastSearchedCity'),
        AsyncStorage.getItem('cachedWeatherData')
      ]);

      if (storedSearches) setRecentSearches(JSON.parse(storedSearches));
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
      if (storedUnit) setIsCelsius(storedUnit === 'celsius');
      if (storedLastCity) setLastSearchedCity(storedLastCity);
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  const checkDarkMode = () => {
    const hours = new Date().getHours();
    setIsDarkMode(hours < 6 || hours >= 18);
  };

  const addRecentSearch = async (city: string) => {
    const updatedSearches = [city, ...recentSearches.filter(s => s !== city)].slice(0, 5);
    setRecentSearches(updatedSearches);
    setLastSearchedCity(city);
    await Promise.all([
      AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches)),
      AsyncStorage.setItem('lastSearchedCity', city)
    ]);
  };

  const toggleFavorite = async (city: string) => {
    const updatedFavorites = favorites.includes(city)
      ? favorites.filter(f => f !== city)
      : [...favorites, city];
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const toggleTemperatureUnit = async () => {
    setIsCelsius(!isCelsius);
    await AsyncStorage.setItem('temperatureUnit', !isCelsius ? 'celsius' : 'fahrenheit');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const refreshWeatherData = async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        const cachedData = await getCachedWeatherData();
        if (cachedData) {
          // Update UI with cached data
          return;
        }
      }

      // In a real app, you would fetch from an actual API
      // For now, we'll simulate an API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Cache the weather data
      await AsyncStorage.setItem('cachedWeatherData', JSON.stringify(weatherData));
    } catch (error) {
      console.error('Error refreshing weather data:', error);
    }
  };

  const getCachedWeatherData = async (): Promise<WeatherData | null> => {
    try {
      const cachedData = await AsyncStorage.getItem('cachedWeatherData');
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error('Error getting cached weather data:', error);
      return null;
    }
  };

  return (
    <WeatherContext.Provider
      value={{
        weatherData: weatherData as WeatherData[],
        recentSearches,
        favorites,
        isCelsius,
        isDarkMode,
        isOffline,
        currentLocation,
        lastSearchedCity,
        addRecentSearch,
        toggleFavorite,
        toggleTemperatureUnit,
        toggleDarkMode,
        setCurrentLocation,
        refreshWeatherData,
        getCachedWeatherData,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
