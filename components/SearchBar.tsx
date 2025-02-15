import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import weatherJson from '../data/weatherData.json';
import { WeatherData } from '../types/weather';
import { useWeather } from '../context/WeatherContext';

interface SearchBarProps {
  onSelectCity: (city: WeatherData) => void;
  isDarkMode: boolean;
}

export default function SearchBar({ onSelectCity, isDarkMode }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<WeatherData[]>([]);
  const { isCelsius } = useWeather();

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    const searchLower = text.toLowerCase().trim();
    const matches = weatherJson.cities.filter(city => 
      city.city.toLowerCase().includes(searchLower) ||
      city.country.toLowerCase().includes(searchLower)
    );
    setSuggestions(matches);
  };

  const handleCitySelect = (city: WeatherData) => {
    onSelectCity(city);
    setSearchQuery('');
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const getTemperature = (temp: number) => {
    if (isCelsius) return `${temp}°C`;
    return `${Math.round((temp * 9) / 5 + 32)}°F`;
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return 'sun-o';
      case 'cloudy': return 'cloud';
      case 'rainy': return 'umbrella';
      case 'thunderstorm': return 'bolt';
      case 'foggy': return 'align-center';
      case 'windy': return 'flag';
      case 'clear': return 'star';
      default: return 'question';
    }
  };

  const getWeatherColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return '#FFD700';
      case 'cloudy': return '#808080';
      case 'rainy': return '#4169E1';
      case 'thunderstorm': return '#483D8B';
      case 'foggy': return '#B8B8B8';
      case 'windy': return '#87CEEB';
      case 'clear': return '#00BFFF';
      default: return '#666666';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchInputContainer, isDarkMode && styles.darkInput]}>
        <FontAwesome name="search" size={20} color={isDarkMode ? '#888' : '#666'} />
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkText]}
          placeholder="Search city or country..."
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="words"
          autoCorrect={false}
        />
        {searchQuery !== '' && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => handleSearch('')}
          >
            <FontAwesome name="times-circle" size={20} color={isDarkMode ? '#888' : '#666'} />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery !== '' && suggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, isDarkMode && styles.darkSuggestions]}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => `${item.city}-${item.country}`}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.suggestionItem, isDarkMode && styles.darkSuggestionItem]}
                onPress={() => handleCitySelect(item)}
              >
                <View style={styles.cityInfo}>
                  <Text style={[styles.cityName, isDarkMode && styles.darkText]}>
                    {item.city}
                  </Text>
                  <Text style={[styles.countryName, isDarkMode && styles.darkText]}>
                    {item.country}
                  </Text>
                </View>
                <View style={styles.weatherInfo}>
                  <FontAwesome 
                    name={getWeatherIcon(item.weather)} 
                    size={20} 
                    color={getWeatherColor(item.weather)}
                    style={styles.weatherIcon}
                  />
                  <Text style={[styles.temperature, isDarkMode && styles.darkText]}>
                    {getTemperature(item.temperature)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  darkInput: {
    backgroundColor: '#333',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  clearButton: {
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkSuggestions: {
    backgroundColor: '#333',
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkSuggestionItem: {
    borderBottomColor: '#444',
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
  },
  countryName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherIcon: {
    marginRight: 4,
  },
  temperature: {
    fontSize: 16,
    fontWeight: '500',
  },
});
