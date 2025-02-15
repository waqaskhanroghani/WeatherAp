import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { WeatherData } from '../types/weather';

interface RecentSearchesProps {
  recentSearches: string[];
  isDarkMode: boolean;
  getWeatherByCity: (city: string) => WeatherData | null;
  getWeatherIcon: (condition: string) => string;
  getWeatherColor: (condition: string) => string;
  getTemperature: (temp: number) => string;
  onCitySelect: (city: WeatherData) => void;
}

export default function RecentSearches({
  recentSearches,
  isDarkMode,
  getWeatherByCity,
  getWeatherIcon,
  getWeatherColor,
  getTemperature,
  onCitySelect,
}: RecentSearchesProps) {
  if (recentSearches.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
        Recent Searches
      </Text>
      <View style={styles.scrollContainer}>
        {recentSearches.map((item) => {
          const cityData = getWeatherByCity(item);
          if (!cityData) return null;

          return (
            <TouchableOpacity
              key={item}
              style={[styles.recentItem, isDarkMode && styles.darkRecentItem]}
              onPress={() => onCitySelect(cityData)}>
              <Text style={[styles.recentCity, isDarkMode && styles.darkText]}>
                {item}
              </Text>
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
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  recentItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    marginBottom: 8,
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
  darkText: {
    color: '#fff',
  },
});
