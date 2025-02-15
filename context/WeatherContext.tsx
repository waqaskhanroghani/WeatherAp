import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { WeatherData, Coordinates } from '../types/weather';

const STORAGE_KEYS = {
  RECENT_SEARCHES: 'weather_recent_searches',
  FAVORITES: 'weather_favorites',
  LAST_WEATHER: 'weather_last_weather',
  SETTINGS: 'weather_settings',
};

// Sample weather data with cities from Pakistan, US, UK, and other countries
const sampleWeatherData: WeatherData[] = [
  // Pakistan Cities
  {
    city: 'Islamabad',
    temperature: 22,
    weather: 'Sunny',
    humidity: 45,
    windSpeed: 8,
    coordinates: { lat: 33.6844, lon: 73.0479 },
    country: 'Pakistan'
  },
  {
    city: 'Lahore',
    temperature: 24,
    weather: 'Partly Cloudy',
    humidity: 55,
    windSpeed: 10,
    coordinates: { lat: 31.5204, lon: 74.3587 },
    country: 'Pakistan'
  },
  {
    city: 'Karachi',
    temperature: 28,
    weather: 'Sunny',
    humidity: 70,
    windSpeed: 15,
    coordinates: { lat: 24.8607, lon: 67.0011 },
    country: 'Pakistan'
  },
  {
    city: 'Peshawar',
    temperature: 20,
    weather: 'Clear',
    humidity: 40,
    windSpeed: 12,
    coordinates: { lat: 34.0151, lon: 71.5249 },
    country: 'Pakistan'
  },
  {
    city: 'Multan',
    temperature: 26,
    weather: 'Sunny',
    humidity: 35,
    windSpeed: 14,
    coordinates: { lat: 30.1575, lon: 71.5249 },
    country: 'Pakistan'
  },
  {
    city: 'Faisalabad',
    temperature: 25,
    weather: 'Clear',
    humidity: 50,
    windSpeed: 11,
    coordinates: { lat: 31.4504, lon: 73.1350 },
    country: 'Pakistan'
  },
  {
    city: 'Rawalpindi',
    temperature: 21,
    weather: 'Partly Cloudy',
    humidity: 48,
    windSpeed: 9,
    coordinates: { lat: 33.6007, lon: 73.0679 },
    country: 'Pakistan'
  },
  {
    city: 'Gujranwala',
    temperature: 23,
    weather: 'Sunny',
    humidity: 52,
    windSpeed: 12,
    coordinates: { lat: 32.1877, lon: 74.1945 },
    country: 'Pakistan'
  },
  
  // US Cities
  {
    city: 'New York',
    temperature: 18,
    weather: 'Cloudy',
    humidity: 65,
    windSpeed: 12,
    coordinates: { lat: 40.7128, lon: -74.0060 },
    country: 'USA'
  },
  {
    city: 'Los Angeles',
    temperature: 23,
    weather: 'Sunny',
    humidity: 60,
    windSpeed: 8,
    coordinates: { lat: 34.0522, lon: -118.2437 },
    country: 'USA'
  },
  {
    city: 'Chicago',
    temperature: 15,
    weather: 'Windy',
    humidity: 55,
    windSpeed: 20,
    coordinates: { lat: 41.8781, lon: -87.6298 },
    country: 'USA'
  },
  {
    city: 'San Francisco',
    temperature: 17,
    weather: 'Foggy',
    humidity: 75,
    windSpeed: 15,
    coordinates: { lat: 37.7749, lon: -122.4194 },
    country: 'USA'
  },
  {
    city: 'Miami',
    temperature: 27,
    weather: 'Sunny',
    humidity: 80,
    windSpeed: 10,
    coordinates: { lat: 25.7617, lon: -80.1918 },
    country: 'USA'
  },
  
  // UK Cities
  {
    city: 'London',
    temperature: 15,
    weather: 'Rainy',
    humidity: 75,
    windSpeed: 15,
    coordinates: { lat: 51.5074, lon: -0.1278 },
    country: 'UK'
  },
  {
    city: 'Manchester',
    temperature: 13,
    weather: 'Cloudy',
    humidity: 80,
    windSpeed: 18,
    coordinates: { lat: 53.4808, lon: -2.2426 },
    country: 'UK'
  },
  {
    city: 'Birmingham',
    temperature: 14,
    weather: 'Overcast',
    humidity: 70,
    windSpeed: 12,
    coordinates: { lat: 52.4862, lon: -1.8904 },
    country: 'UK'
  },
  {
    city: 'Edinburgh',
    temperature: 11,
    weather: 'Partly Cloudy',
    humidity: 72,
    windSpeed: 16,
    coordinates: { lat: 55.9533, lon: -3.1883 },
    country: 'UK'
  },
  
  // Additional Major Cities
  {
    city: 'Dubai',
    temperature: 32,
    weather: 'Sunny',
    humidity: 55,
    windSpeed: 14,
    coordinates: { lat: 25.2048, lon: 55.2708 },
    country: 'UAE'
  },
  {
    city: 'Singapore',
    temperature: 29,
    weather: 'Thunderstorm',
    humidity: 85,
    windSpeed: 8,
    coordinates: { lat: 1.3521, lon: 103.8198 },
    country: 'Singapore'
  },
  {
    city: 'Tokyo',
    temperature: 21,
    weather: 'Clear',
    humidity: 65,
    windSpeed: 10,
    coordinates: { lat: 35.6762, lon: 139.6503 },
    country: 'Japan'
  },
  {
    city: 'Sydney',
    temperature: 24,
    weather: 'Sunny',
    humidity: 68,
    windSpeed: 15,
    coordinates: { lat: -33.8688, lon: 151.2093 },
    country: 'Australia'
  }
];

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
  const [weatherData] = useState<WeatherData[]>(sampleWeatherData);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCelsius, setIsCelsius] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<WeatherData[]>([]);

  // Load saved preferences and data
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
    const suggestions = weatherData.filter(city => 
      city.city.toLowerCase().includes(searchLower) ||
      city.country.toLowerCase().includes(searchLower)
    ).slice(0, 5);

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
