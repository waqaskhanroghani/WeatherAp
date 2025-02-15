import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useWeather } from "../../context/WeatherContext";
import * as Location from "expo-location";
import { WeatherData } from "../../types/weather";
import SearchBar from "../../components/SearchBar";
import WeatherMap from "../../components/WeatherMap";
import RecentSearches from "../../components/RecentSearches";

export default function WeatherScreen() {
  const {
    weatherData,
    recentSearches,
    recentSearchesData,
    favorites,
    isCelsius,
    isDarkMode,
    isOffline,
    currentLocationWeather,
    lastUpdated,
    addRecentSearch,
    clearRecentSearches,
    toggleFavorite,
    toggleTemperatureUnit,
    getWeatherByCity,
    refreshWeather,
    getCurrentLocationWeather,
  } = useWeather();

  const [selectedCity, setSelectedCity] = useState<WeatherData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    const initializeWeather = async () => {
      try {
        if (recentSearches.length > 0) {
          const lastCity = getWeatherByCity(recentSearches[0]);
          if (lastCity) {
            setSelectedCity(lastCity);
          }
        } else {
          const location = await getCurrentLocationWeather();
          if (location) {
            setSelectedCity(location);
          }
        }
      } catch (error) {
        console.error('Error initializing weather:', error);
        setLocationError('Unable to get weather data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeWeather();
  }, []);

  const handleCitySelect = useCallback(async (city: WeatherData) => {
    try {
      setSelectedCity(city);
      await addRecentSearch(city.city);
    } catch (error) {
      console.error('Error selecting city:', error);
      setLocationError('Unable to select city. Please try again.');
    }
  }, [addRecentSearch]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshWeather();
      if (selectedCity) {
        const refreshedCity = getWeatherByCity(selectedCity.city);
        if (refreshedCity) {
          setSelectedCity(refreshedCity);
        }
      }
    } catch (error) {
      console.error('Error refreshing weather:', error);
      setLocationError('Unable to refresh weather data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshWeather, selectedCity, getWeatherByCity]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
        return "sun-o";
      case "cloudy":
        return "cloud";
      case "rainy":
        return "cloud-rain";
      case "stormy":
        return "bolt";
      case "snowy":
        return "snowflake-o";
      default:
        return "question-circle-o";
    }
  };

  const getWeatherColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
        return "#FFD700";
      case "cloudy":
        return "#808080";
      case "rainy":
        return "#4682B4";
      case "stormy":
        return "#483D8B";
      case "snowy":
        return "#87CEEB";
      default:
        return "#000000";
    }
  };

  const getTemperature = (temp: number) => {
    if (isCelsius) return `${Math.round(temp)}°C`;
    return `${Math.round((temp * 9) / 5 + 32)}°F`;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <ActivityIndicator size="large" color={isDarkMode ? "#fff" : "#000"} />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBarWrapper}>
          <SearchBar onSelectCity={handleCitySelect} isDarkMode={isDarkMode} />
        </View>
        <TouchableOpacity
          style={styles.unitToggle}
          onPress={toggleTemperatureUnit}>
          <Text style={styles.unitText}>{isCelsius ? "°C" : "°F"}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[1]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? "#fff" : "#000"}
          />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            <RecentSearches
              recentSearches={recentSearchesData}
              isDarkMode={isDarkMode}
              getWeatherIcon={getWeatherIcon}
              getWeatherColor={getWeatherColor}
              getTemperature={getTemperature}
              onCitySelect={handleCitySelect}
              onClearSearches={clearRecentSearches}
            />

            {selectedCity && (
              <>
                <View
                  style={[
                    styles.weatherCard,
                    isDarkMode && styles.darkWeatherCard,
                    { backgroundColor: getWeatherColor(selectedCity.weather) + "20" },
                  ]}>
                  <View style={styles.weatherHeader}>
                    <View>
                      <Text style={[styles.cityName, isDarkMode && styles.darkText]}>
                        {selectedCity.city}
                      </Text>
                      <Text
                        style={[styles.countryName, isDarkMode && styles.darkText]}>
                        {selectedCity.country}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(selectedCity.city)}
                      style={styles.favoriteButton}>
                      <FontAwesome
                        name={
                          favorites.includes(selectedCity.city) ? "star" : "star-o"
                        }
                        size={24}
                        color={
                          favorites.includes(selectedCity.city)
                            ? "#FFD700"
                            : isDarkMode
                            ? "#fff"
                            : "#000"
                        }
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.weatherInfo}>
                    <FontAwesome
                      name={getWeatherIcon(selectedCity.weather)}
                      size={64}
                      color={getWeatherColor(selectedCity.weather)}
                      style={styles.weatherIcon}
                    />
                    <Text style={[styles.temperature, isDarkMode && styles.darkText]}>
                      {getTemperature(selectedCity.temperature)}
                    </Text>
                    <Text
                      style={[
                        styles.weatherCondition,
                        isDarkMode && styles.darkText,
                      ]}>
                      {selectedCity.weather}
                    </Text>
                  </View>

                  <View style={styles.weatherDetails}>
                    <View style={styles.detailItem}>
                      <FontAwesome
                        name="tint"
                        size={20}
                        color={isDarkMode ? "#fff" : "#000"}
                      />
                      <Text
                        style={[styles.detailText, isDarkMode && styles.darkText]}>
                        {selectedCity.humidity}%
                      </Text>
                      <Text
                        style={[styles.detailLabel, isDarkMode && styles.darkText]}>
                        Humidity
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <FontAwesome
                        name="location-arrow"
                        size={20}
                        color={isDarkMode ? "#fff" : "#000"}
                      />
                      <Text
                        style={[styles.detailText, isDarkMode && styles.darkText]}>
                        {selectedCity.windSpeed} km/h
                      </Text>
                      <Text
                        style={[styles.detailLabel, isDarkMode && styles.darkText]}>
                        Wind Speed
                      </Text>
                    </View>
                  </View>
                </View>

                <WeatherMap selectedCity={selectedCity} />
              </>
            )}

            {locationError !== "" && (
              <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
                {locationError}
              </Text>
            )}
          </>
        )}
        renderItem={() => null}
      />

      {isOffline && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>
            You are offline. Showing cached data.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  darkContainer: {
    backgroundColor: "#1a1a1a",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
    gap: 8,
  },
  searchBarWrapper: {
    flex: 1,
  },
  unitToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  unitText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  recentContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  recentItem: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: "center",
    minWidth: 100,
  },
  darkRecentItem: {
    backgroundColor: "#333",
  },
  recentCity: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  recentTemp: {
    fontSize: 14,
    marginTop: 4,
  },
  weatherCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  darkWeatherCard: {
    backgroundColor: "#333",
  },
  weatherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  cityName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  countryName: {
    fontSize: 16,
    color: "#666",
  },
  favoriteButton: {
    padding: 8,
  },
  weatherIcon: {
    marginBottom: 10,
    alignSelf: "center",
  },
  temperature: {
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  weatherCondition: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  weatherDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 20,
  },
  detailItem: {
    alignItems: "center",
  },
  detailText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  errorText: {
    color: "#ff0000",
    textAlign: "center",
    marginTop: 10,
  },
  offlineBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ff9800",
    padding: 8,
  },
  offlineText: {
    color: "#fff",
    textAlign: "center",
  },
  darkText: {
    color: "#fff",
  },
});
