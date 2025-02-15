import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import { WeatherData, Coordinates } from '../types/weather';
import weatherJson from '../data/weatherData.json';

const STORAGE_KEYS = {
  RECENT_SEARCHES: 'weather_recent_searches',
  FAVORITES: 'weather_favorites',
  LAST_WEATHER: 'weather_last_weather',
  SETTINGS: 'weather_settings',
  WEATHER_CACHE: 'weather_data_cache',
};

const MAX_RECENT_SEARCHES = 10;

interface WeatherContextType {
  weatherData: WeatherData[];
  recentSearches: string[];
  recentSearchesData: WeatherData[];
  favorites: string[];
  isCelsius: boolean;
  isDarkMode: boolean;
  isOffline: boolean;
  currentLocationWeather: WeatherData | null;
  lastUpdated: number | null;
  searchSuggestions: WeatherData[];
  addRecentSearch: (city: string) => void;
  clearRecentSearches: () => void;
  toggleFavorite: (city: string) => void;
  toggleTemperatureUnit: () => void;
  toggleTheme: () => void;
  searchCities: (query: string) => void;
  getWeatherByCity: (city: string) => WeatherData | null;
  refreshWeather: () => Promise<void>;
  getCurrentLocationWeather: () => Promise<WeatherData | null>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [weatherData] = useState<WeatherData[]>(weatherJson.cities);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCelsius, setIsCelsius] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [currentLocationWeather, setCurrentLocationWeather] = useState<WeatherData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<WeatherData[]>([]);
  const [weatherCache, setWeatherCache] = useState<{ [key: string]: WeatherData }>({});

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
        savedWeather,
        savedCache
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES),
        AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_WEATHER),
        AsyncStorage.getItem(STORAGE_KEYS.WEATHER_CACHE),
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
      if (savedCache) {
        setWeatherCache(JSON.parse(savedCache));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const addRecentSearch = useCallback(async (city: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== city);
      const updated = [city, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getWeatherByCity = useCallback((city: string): WeatherData | null => {
    if (weatherCache[city]) {
      return weatherCache[city];
    }

    const cityData = weatherData.find(w => w.city.toLowerCase() === city.toLowerCase());
    if (cityData) {
      const updatedCache = { ...weatherCache, [city]: cityData };
      setWeatherCache(updatedCache);
      AsyncStorage.setItem(STORAGE_KEYS.WEATHER_CACHE, JSON.stringify(updatedCache));
      return cityData;
    }

    return null;
  }, [weatherData, weatherCache]);

  const recentSearchesData = useMemo(() => {
    return recentSearches
      .map(city => getWeatherByCity(city))
      .filter((data): data is WeatherData => data !== null);
  }, [recentSearches, getWeatherByCity]);

  const clearRecentSearches = useCallback(async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
  }, []);

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

  const refreshWeather = async () => {
    try {
      setLastUpdated(Date.now());
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

  const findNearestCity = useCallback((latitude: number, longitude: number) => {
    let nearestCity = null;
    let shortestDistance = Infinity;

    weatherData.forEach(city => {
      if (city.coordinates) {
        const distance = getDistance(
          latitude,
          longitude,
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
  }, [weatherData]);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const getCurrentLocationWeather = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      const nearestCity = findNearestCity(location.coords.latitude, location.coords.longitude);
      
      if (nearestCity) {
        setCurrentLocationWeather(nearestCity);
        return nearestCity;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting location weather:', error);
      return null;
    }
  }, [findNearestCity]);

  useEffect(() => {
    getCurrentLocationWeather();
  }, [getCurrentLocationWeather]);

  return (
    <WeatherContext.Provider
      value={{
        weatherData,
        recentSearches,
        recentSearchesData,
        favorites,
        isCelsius,
        isDarkMode,
        isOffline,
        currentLocationWeather,
        lastUpdated,
        searchSuggestions,
        addRecentSearch,
        clearRecentSearches,
        toggleFavorite,
        toggleTemperatureUnit,
        toggleTheme,
        searchCities,
        getWeatherByCity,
        refreshWeather,
        getCurrentLocationWeather,
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
