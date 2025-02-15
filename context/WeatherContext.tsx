import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { WeatherData, Coordinates } from '../types/weather';
import weatherJson from '../data/weatherData.json';

const STORAGE_KEYS = {
  RECENT_SEARCHES: 'weather_recent_searches',
  FAVORITES: 'weather_favorites',
  LAST_WEATHER: 'weather_last_weather',
  SETTINGS: 'weather_settings',
};

interface WeatherContextType {
  weatherData: WeatherData[];
  recentSearches: string[];
  favorites: string[];
  isCelsius: boolean;
  isDarkMode: boolean;
  isOffline: boolean;
  currentLocation: Coordinates | null;
  lastUpdated: number | null;
  searchSuggestions: WeatherData[];
  addRecentSearch: (city: string) => void;
  toggleFavorite: (city: string) => void;
  toggleTemperatureUnit: () => void;
  toggleTheme: () => void;
  searchCities: (query: string) => void;
  getWeatherByCity: (city: string) => WeatherData | null;
  refreshWeather: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [weatherData] = useState<WeatherData[]>(weatherJson.cities);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCelsius, setIsCelsius] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<WeatherData[]>([]);

  useEffect(() => {
    loadSavedData();
    checkDarkMode();
    setupNetworkListener();
  }, []);

  const loadSavedData = async () => {
    try {
      const [
        savedRecent,
        savedFavorites,
        savedSettings,
        savedWeather
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES),
        AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_WEATHER),
      ]);

      if (savedRecent) setRecentSearches(JSON.parse(savedRecent));
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setIsCelsius(settings.isCelsius);
        setIsDarkMode(settings.isDarkMode);
      }
      if (savedWeather) {
        const weather = JSON.parse(savedWeather);
        setLastUpdated(weather.timestamp);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const checkDarkMode = () => {
    const hours = new Date().getHours();
    setIsDarkMode(hours >= 18 || hours < 6);
  };

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  };

  const searchCities = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchSuggestions([]);
      return;
    }

    const searchLower = query.toLowerCase().trim();
    const suggestions = weatherData.filter(city => {
      const cityMatch = city.city.toLowerCase().includes(searchLower);
      const countryMatch = city.country.toLowerCase().includes(searchLower);
      return cityMatch || countryMatch;
    });

    setSearchSuggestions(suggestions);
  }, [weatherData]);

  const addRecentSearch = async (city: string) => {
    try {
      const newRecentSearches = [
        city,
        ...recentSearches.filter(s => s !== city)
      ].slice(0, 5);

      setRecentSearches(newRecentSearches);
      await AsyncStorage.setItem(
        STORAGE_KEYS.RECENT_SEARCHES,
        JSON.stringify(newRecentSearches)
      );

      // Cache the weather data
      const cityWeather = getWeatherByCity(city);
      if (cityWeather) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.LAST_WEATHER,
          JSON.stringify({
            data: cityWeather,
            timestamp: Date.now()
          })
        );
      }
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const toggleFavorite = async (city: string) => {
    try {
      const newFavorites = favorites.includes(city)
        ? favorites.filter(f => f !== city)
        : [...favorites, city];

      setFavorites(newFavorites);
      await AsyncStorage.setItem(
        STORAGE_KEYS.FAVORITES,
        JSON.stringify(newFavorites)
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const toggleTemperatureUnit = async () => {
    try {
      const newIsCelsius = !isCelsius;
      setIsCelsius(newIsCelsius);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify({ ...getSettings(), isCelsius: newIsCelsius })
      );
    } catch (error) {
      console.error('Error toggling temperature unit:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newIsDarkMode = !isDarkMode;
      setIsDarkMode(newIsDarkMode);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify({ ...getSettings(), isDarkMode: newIsDarkMode })
      );
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  const getSettings = () => ({
    isCelsius,
    isDarkMode
  });

  const getWeatherByCity = (cityName: string): WeatherData | null => {
    return weatherData.find(
      city => city.city.toLowerCase() === cityName.toLowerCase()
    ) || null;
  };

  const refreshWeather = async () => {
    try {
      setLastUpdated(Date.now());
      // In a real app, this would fetch fresh data from an API
      // For now, we'll just update the timestamp
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_WEATHER,
        JSON.stringify({
          timestamp: Date.now()
        })
      );
    } catch (error) {
      console.error('Error refreshing weather:', error);
    }
  };

  return (
    <WeatherContext.Provider
      value={{
        weatherData,
        recentSearches,
        favorites,
        isCelsius,
        isDarkMode,
        isOffline,
        currentLocation,
        lastUpdated,
        searchSuggestions,
        addRecentSearch,
        toggleFavorite,
        toggleTemperatureUnit,
        toggleTheme,
        searchCities,
        getWeatherByCity,
        refreshWeather,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
