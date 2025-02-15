import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useWeather } from '../context/WeatherContext';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const ASPECT_RATIO = 16 / 9;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function WeatherMap() {
  const [mapRegion, setMapRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);

  const { 
    weatherData, 
    selectedCity, 
    currentLocationWeather,
    getCurrentLocationWeather,
    addRecentSearch
  } = useWeather();

  const handleLocationPress = useCallback(async () => {
    const weather = await getCurrentLocationWeather();
    if (weather) {
      addRecentSearch(weather.city);
    }
  }, [getCurrentLocationWeather, addRecentSearch]);

  useEffect(() => {
    if (selectedCity?.coordinates) {
      setMapRegion({
        latitude: selectedCity.coordinates.lat,
        longitude: selectedCity.coordinates.lon,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
      return;
    }

    if (currentLocationWeather?.coordinates) {
      setMapRegion({
        latitude: currentLocationWeather.coordinates.lat,
        longitude: currentLocationWeather.coordinates.lon,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
      return;
    }

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          // Default to a central location if permission not granted
          setMapRegion({
            latitude: 0,
            longitude: 0,
            latitudeDelta: 45,
            longitudeDelta: 45,
          });
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        });
      } catch (error) {
        console.error('Error getting location:', error);
        // Default to a central location on error
        setMapRegion({
          latitude: 0,
          longitude: 0,
          latitudeDelta: 45,
          longitudeDelta: 45,
        });
      }
    })();
  }, [selectedCity, currentLocationWeather]);

  if (!mapRegion) return null;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Weather Data Markers */}
        {weatherData.map((city) => {
          if (!city.coordinates) return null;
          
          const isSelected = selectedCity?.city === city.city;
          const isCurrentLocation = currentLocationWeather?.city === city.city;
          
          return (
            <Marker
              key={city.city}
              coordinate={{
                latitude: city.coordinates.lat,
                longitude: city.coordinates.lon,
              }}
              title={city.city}
              description={`${city.temperature}°C - ${city.weather}`}
              pinColor={isSelected ? '#FF0000' : isCurrentLocation ? '#4A90E2' : '#FFA500'}
            />
          );
        })}
      </MapView>

      {/* Current Location Button */}
      <TouchableOpacity 
        style={styles.locationButton}
        onPress={handleLocationPress}
      >
        <FontAwesome name="location-arrow" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: width * (9/16), // 16:9 aspect ratio
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: 'white',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
