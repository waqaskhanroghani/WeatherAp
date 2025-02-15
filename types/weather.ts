export interface WeatherData {
  city: string;
  temperature: number;
  weather: string;
  humidity: number;
  windSpeed: number;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface WeatherContextType {
  weatherData: WeatherData[];
  recentSearches: string[];
  favorites: string[];
  isCelsius: boolean;
  isDarkMode: boolean;
  addRecentSearch: (city: string) => void;
  toggleFavorite: (city: string) => void;
  toggleTemperatureUnit: () => void;
  toggleDarkMode: () => void;
}
