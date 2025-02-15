import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { WeatherData, Coordinates } from '../types/weather';

// Sample weather data with Pakistani, US, and UK cities
const sampleWeatherData: WeatherData[] = [
  // Pakistan Cities
  {
    city: 'Islamabad',
    temperature: 22,
    weather: 'Sunny',
    humidity: 45,
    windSpeed: 8,
    coordinates: { lat: 33.6844, lon: 73.0479 },
  },
  {
    city: 'Lahore',
    temperature: 24,
    weather: 'Partly Cloudy',
    humidity: 55,
    windSpeed: 10,
    coordinates: { lat: 31.5204, lon: 74.3587 },
  },
  {
    city: 'Karachi',
    temperature: 28,
    weather: 'Sunny',
    humidity: 70,
    windSpeed: 15,
    coordinates: { lat: 24.8607, lon: 67.0011 },
  },
  {
    city: 'Peshawar',
    temperature: 20,
    weather: 'Clear',
    humidity: 40,
    windSpeed: 12,
    coordinates: { lat: 34.0151, lon: 71.5249 },
  },
  {
    city: 'Multan',
    temperature: 26,
    weather: 'Sunny',
    humidity: 35,
    windSpeed: 14,
    coordinates: { lat: 30.1575, lon: 71.5249 },
  },
  
  // US Cities
  {
    city: 'New York',
    temperature: 18,
    weather: 'Cloudy',
    humidity: 65,
    windSpeed: 12,
    coordinates: { lat: 40.7128, lon: -74.0060 },
  },
  {
    city: 'Los Angeles',
    temperature: 23,
    weather: 'Sunny',
    humidity: 60,
    windSpeed: 8,
    coordinates: { lat: 34.0522, lon: -118.2437 },
  },
  {
    city: 'Chicago',
    temperature: 15,
    weather: 'Windy',
    humidity: 55,
    windSpeed: 20,
    coordinates: { lat: 41.8781, lon: -87.6298 },
  },
  
  // UK Cities
  {
    city: 'London',
    temperature: 15,
    weather: 'Rainy',
    humidity: 75,
    windSpeed: 15,
    coordinates: { lat: 51.5074, lon: -0.1278 },
  },
  {
    city: 'Manchester',
    temperature: 13,
    weather: 'Cloudy',
    humidity: 80,
    windSpeed: 18,
    coordinates: { lat: 53.4808, lon: -2.2426 },
  },
  {
    city: 'Birmingham',
    temperature: 14,
    weather: 'Overcast',
    humidity: 70,
    windSpeed: 12,
    coordinates: { lat: 52.4862, lon: -1.8904 },
  },
];

interface WeatherContextType {
  weatherData: WeatherData[];
  recentSearches: string[];
  favorites: string[];
  isCelsius: boolean;
  isDarkMode: boolean;
  isOffline: boolean;
  currentLocation: Coordinates | null;
  addRecentSearch: (city: string) => void;
  toggleFavorite: (city: string) => void;
  toggleTemperatureUnit: () => void;
  toggleDarkMode: () => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weatherData] = useState<WeatherData[]>(sampleWeatherData);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCelsius, setIsCelsius] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);

  // Load saved data from AsyncStorage
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedRecentSearches = await AsyncStorage.getItem('recentSearches');
        const savedFavorites = await AsyncStorage.getItem('favorites');
        const savedIsCelsius = await AsyncStorage.getItem('isCelsius');
        const savedIsDarkMode = await AsyncStorage.getItem('isDarkMode');

        if (savedRecentSearches) setRecentSearches(JSON.parse(savedRecentSearches));
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
        if (savedIsCelsius) setIsCelsius(JSON.parse(savedIsCelsius));
        if (savedIsDarkMode) setIsDarkMode(JSON.parse(savedIsDarkMode));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };

    loadSavedData();
  }, []);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const addRecentSearch = (city: string) => {
    setRecentSearches(prev => {
      const newSearches = [city, ...prev.filter(s => s !== city)].slice(0, 5);
      AsyncStorage.setItem('recentSearches', JSON.stringify(newSearches));
      return newSearches;
    });
  };

  const toggleFavorite = (city: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(city)
        ? prev.filter(f => f !== city)
        : [...prev, city];
      AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const toggleTemperatureUnit = () => {
    setIsCelsius(prev => {
      const newValue = !prev;
      AsyncStorage.setItem('isCelsius', JSON.stringify(newValue));
      return newValue;
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      AsyncStorage.setItem('isDarkMode', JSON.stringify(newValue));
      return newValue;
    });
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
        addRecentSearch,
        toggleFavorite,
        toggleTemperatureUnit,
        toggleDarkMode,
      }}>
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
