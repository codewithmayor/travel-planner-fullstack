import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_WEATHER } from '../graphql/queries';
import { WeatherForecast, CitySuggestion } from '../types';
import { LocationInfo } from './LocationInfo';

interface WeatherDisplayProps {
  city: CitySuggestion;
  onWeatherLoaded: (loaded: boolean) => void; // Callback to parent
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ city, onWeatherLoaded }) => {
  const { data, loading, error } = useQuery(GET_WEATHER, {
    variables: { cityId: city.id },
    skip: !city.id,
  });

  // Notify parent when weather loading state changes
  React.useEffect(() => {
    onWeatherLoaded(!loading && !error && !!data?.weather);
  }, [loading, error, data, onWeatherLoaded]);

  if (loading) {
    return (
      <div className="weather-display loading">
        <div className="loading-spinner">🌤️</div>
        <div>Loading weather for {city.name}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-display error">
        <div className="error-message">
          Error loading weather: {error.message}
        </div>
      </div>
    );
  }

  if (!data?.weather) {
    return null;
  }

  const weather = data.weather as WeatherForecast;

  const getWeatherIcon = (weatherCode: number) => {
    if (weatherCode >= 0 && weatherCode <= 3) return '☀️'; // Clear sky
    if (weatherCode >= 45 && weatherCode <= 48) return '🌫️'; // Foggy
    if (weatherCode >= 51 && weatherCode <= 55) return '🌧️'; // Drizzle
    if (weatherCode >= 56 && weatherCode <= 65) return '🌧️'; // Rain
    if (weatherCode >= 66 && weatherCode <= 77) return '🌨️'; // Snow
    if (weatherCode >= 80 && weatherCode <= 82) return '🌧️'; // Rain showers
    if (weatherCode >= 85 && weatherCode <= 86) return '🌨️'; // Snow showers
    if (weatherCode >= 95 && weatherCode <= 99) return '⛈️'; // Thunderstorm
    return '🌤️'; // Default
  };

  return (
    <div className="weather-display">
      <h2>7-Day Weather Forecast for {city.name}</h2>
      
      {/* Location Info */}
      <LocationInfo city={city} />
      
      <div className="weather-grid">
        {weather.daily.map((day, index) => (
          <div key={index} className="weather-day">
            <div className="weather-date">
              {new Date(day.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <div className="weather-icon">
              {getWeatherIcon(day.weatherCode)}
            </div>
            <div className="weather-temp">
              <div className="temp-max">{Math.round(day.temperatureMax)}°C</div>
              <div className="temp-min">{Math.round(day.temperatureMin)}°C</div>
            </div>
            <div className="weather-details">
              <div className="precipitation">
                💧 {day.precipitation.toFixed(1)}mm
              </div>
              <div className="wind">
                💨 {day.windSpeed.toFixed(0)} km/h
              </div>
              <div className="uv">
                ☀️ UV {day.uvIndex.toFixed(1)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 