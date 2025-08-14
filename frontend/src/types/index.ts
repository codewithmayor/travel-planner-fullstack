export interface CitySuggestion {
  id: string;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface WeatherDay {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  uvIndex: number;
}

export interface WeatherForecast {
  cityId: string;
  daily: WeatherDay[];
}

export interface ActivityRanking {
  activity: string;
  score: number;
  reason: string;
}

export interface HealthCheck {
  status: string;
  responseTime?: number;
}

export interface HealthChecks {
  database: HealthCheck;
  externalApi: HealthCheck;
  cache: HealthCheck;
}

export interface Health {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
  checks: HealthChecks;
} 