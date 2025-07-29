import { openMeteo } from '../datasources/openMeteo';
import { CitySuggestion, WeatherForecast } from '../types';

// In-memory city lookup cache (for demo; in prod, use a DB or persistent cache)
const cityCache = new Map<string, CitySuggestion>();

export const cacheCity = (city: CitySuggestion) => {
  cityCache.set(city.id.toString(), city);
};

export const getWeatherForecast = async (cityId: string): Promise<WeatherForecast> => {
  const city = cityCache.get(cityId);
  if (!city) throw new Error('City not found');
  const daily = await openMeteo.getWeather(city.latitude, city.longitude);
  return {
    cityId,
    daily: daily.time.map((date: string, i: number) => ({
      date,
      temperatureMax: daily.temperature_2m_max[i],
      temperatureMin: daily.temperature_2m_min[i],
      precipitation: daily.precipitation_sum[i],
      weatherCode: daily.weathercode[i],
    })),
  };
}; 