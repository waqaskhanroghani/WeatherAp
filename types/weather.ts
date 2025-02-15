export interface Coordinates {
  lat: number;
  lon: number;
}

export interface WeatherData {
  city: string;
  temperature: number;
  weather: string;
  humidity: number;
  windSpeed: number;
  coordinates: Coordinates;
  lastUpdated?: string;
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
