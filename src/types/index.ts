// City suggestion type
export type CitySuggestion = {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
};

// Weather forecast type
export type WeatherForecast = {
  cityId: string;
  daily: Array<{
    date: string;
    temperatureMax: number;
    temperatureMin: number;
    precipitation: number;
    weatherCode: number;
    windSpeed: number;
    uvIndex: number;
  }>;
};

// Activity ranking type
export type ActivityRanking = {
  activity: 'Skiing' | 'Surfing' | 'IndoorSightseeing' | 'OutdoorSightseeing';
  score: number;
  reason: string;
}; 