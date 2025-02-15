import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useWeather } from '../context/WeatherContext';

const { width } = Dimensions.get('window');
const ASPECT_RATIO = 16 / 9;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function WeatherMap() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const { weatherData, selectedCity } = useWeather();

  useEffect(() => {
    if (selectedCity?.coordinates) {
      setLocation({
        latitude: selectedCity.coordinates.lat,
        longitude: selectedCity.coordinates.lon,
      });
      return;
    }

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, [selectedCity]);

  if (!location) return null;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
      >
        {/* Current Location or Selected City Marker */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title={selectedCity?.city || "Current Location"}
          description={selectedCity ? `${selectedCity.temperature}°C - ${selectedCity.weather}` : "You are here"}
        />

        {/* Weather Data Markers */}
        {weatherData.map((city) => {
          if (!city.coordinates || (selectedCity?.city === city.city)) return null;
          
          return (
            <Marker
              key={city.city}
              coordinate={{
                latitude: city.coordinates.lat,
                longitude: city.coordinates.lon,
              }}
              title={city.city}
              description={`${city.temperature}°C - ${city.weather}`}
            />
          );
        })}
      </MapView>
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
});
