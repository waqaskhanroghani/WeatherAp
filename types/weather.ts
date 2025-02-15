export interface Coordinates {
  lat: number;
  lon: number;
}

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  weather: 'Sunny' | 'Cloudy' | 'Rainy' | 'Clear' | 'Partly Cloudy' | 'Thunderstorm' | 'Foggy' | 'Windy';
  humidity: number;
  windSpeed: number;
  coordinates?: Coordinates;
  lastUpdated?: number;
}

export interface WeatherContextType {
  weatherData: WeatherData[];
  recentSearches: string[];
  favorites: string[];
  isCelsius: boolean;
  isDarkMode: boolean;
  isOffline: boolean;
  currentLocation: Coordinates | null;
  lastSearchedCity: string | null;
  addRecentSearch: (city: string) => void;
  toggleFavorite: (city: string) => void;
  toggleTemperatureUnit: () => void;
  toggleDarkMode: () => void;
  setCurrentLocation: (location: Coordinates) => void;
  refreshWeatherData: () => Promise<void>;
  getCachedWeatherData: () => Promise<WeatherData | null>;
}
