import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherContextType, WeatherData } from '../types/weather';
import weatherData from '../assets/weatherData.json';

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCelsius, setIsCelsius] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadStoredData();
    checkDarkMode();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedSearches = await AsyncStorage.getItem('recentSearches');
      const storedFavorites = await AsyncStorage.getItem('favorites');
      const storedUnit = await AsyncStorage.getItem('temperatureUnit');

      if (storedSearches) setRecentSearches(JSON.parse(storedSearches));
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
      if (storedUnit) setIsCelsius(storedUnit === 'celsius');
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
    await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
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

  return (
    <WeatherContext.Provider
      value={{
        weatherData: weatherData as WeatherData[],
        recentSearches,
        favorites,
        isCelsius,
        isDarkMode,
        addRecentSearch,
        toggleFavorite,
        toggleTemperatureUnit,
        toggleDarkMode,
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
