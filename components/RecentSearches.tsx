import React, { memo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { WeatherData } from '../types/weather';

interface RecentSearchesProps {
  recentSearches: WeatherData[];
  isDarkMode: boolean;
  getWeatherIcon: (condition: string) => string;
  getWeatherColor: (condition: string) => string;
  getTemperature: (temp: number) => string;
  onCitySelect: (city: WeatherData) => void;
  onClearSearches?: () => void;
}

const RecentSearches = memo(({
  recentSearches,
  isDarkMode,
  getWeatherIcon,
  getWeatherColor,
  getTemperature,
  onCitySelect,
  onClearSearches,
}: RecentSearchesProps) => {
  if (recentSearches.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          Recent Searches
        </Text>
        {onClearSearches && (
          <TouchableOpacity onPress={onClearSearches}>
            <Text style={[styles.clearText, isDarkMode && styles.darkText]}>
              Clear
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={recentSearches}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.city}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.recentItem, isDarkMode && styles.darkRecentItem]}
            onPress={() => onCitySelect(item)}>
            <Text style={[styles.recentCity, isDarkMode && styles.darkText]}>
              {item.city}
            </Text>
            <FontAwesome
              name={getWeatherIcon(item.weather)}
              size={24}
              color={getWeatherColor(item.weather)}
            />
            <Text style={[styles.recentTemp, isDarkMode && styles.darkText]}>
              {getTemperature(item.temperature)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
});

RecentSearches.displayName = 'RecentSearches';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  clearText: {
    fontSize: 14,
    color: '#007AFF',
  },
  recentItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginLeft: 16,
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

export default RecentSearches;
