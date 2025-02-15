import React, { useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useWeather } from '../context/WeatherContext';
import { FontAwesome } from '@expo/vector-icons';
import { WeatherData } from '../types/weather';

const { width } = Dimensions.get('window');
const ASPECT_RATIO = 16 / 9;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

interface WeatherMapProps {
  selectedCity: WeatherData | null;
}

export default function WeatherMap({ selectedCity }: WeatherMapProps) {
  const mapRef = useRef<MapView>(null);
  const [mapRegion, setMapRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);

  const { 
    weatherData, 
    currentLocationWeather,
    getCurrentLocationWeather,
    addRecentSearch
  } = useWeather();

  const animateToRegion = useCallback((coordinates: { latitude: number; longitude: number }) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 1000); // 1 second animation
    }
  }, []);

  const handleLocationPress = useCallback(async () => {
    const weather = await getCurrentLocationWeather();
    if (weather && weather.coordinates) {
      addRecentSearch(weather.city);
      animateToRegion({
        latitude: weather.coordinates.lat,
        longitude: weather.coordinates.lon
      });
    }
  }, [getCurrentLocationWeather, addRecentSearch, animateToRegion]);

  useEffect(() => {
    if (selectedCity?.coordinates) {
      animateToRegion({
        latitude: selectedCity.coordinates.lat,
        longitude: selectedCity.coordinates.lon
      });
      setMapRegion({
        latitude: selectedCity.coordinates.lat,
        longitude: selectedCity.coordinates.lon,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
      return;
    }

    if (currentLocationWeather?.coordinates) {
      animateToRegion({
        latitude: currentLocationWeather.coordinates.lat,
        longitude: currentLocationWeather.coordinates.lon
      });
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
          setMapRegion({
            latitude: 0,
            longitude: 0,
            latitudeDelta: 45,
            longitudeDelta: 45,
          });
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
        setMapRegion(newRegion);
        animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      } catch (error) {
        console.error('Error getting location:', error);
        setMapRegion({
          latitude: 0,
          longitude: 0,
          latitudeDelta: 45,
          longitudeDelta: 45,
        });
      }
    })();
  }, [selectedCity, currentLocationWeather, animateToRegion]);

  if (!mapRegion) return null;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={mapRegion}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        rotateEnabled={false}
      >
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
            >
              <View style={[
                styles.markerContainer,
                isSelected && styles.selectedMarker
              ]}>
                <FontAwesome 
                  name={isSelected ? 'map-marker' : 'map-pin'} 
                  size={isSelected ? 40 : 30} 
                  color={isSelected ? '#FF0000' : isCurrentLocation ? '#4A90E2' : '#FFA500'} 
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

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
    height: width * (9/16),
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
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMarker: {
    transform: [{ scale: 1.2 }],
  },
});
