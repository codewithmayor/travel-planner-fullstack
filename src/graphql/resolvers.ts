import { suggestCities } from '../services/cityService';
import { getWeatherForecast, cacheCity } from '../services/weatherService';
import { rankActivities } from '../services/activityService';
import { getHealth } from '../services/healthService';

export const resolvers = {
  Query: {
    suggestCities: async (_: any, { query }: { query: string }) => {
      const cities = await suggestCities(query);
      cities.forEach(cacheCity);
      return cities;
    },
    weather: async (_: any, { cityId }: { cityId: string }) => {
      return getWeatherForecast(cityId);
    },
    activities: async (_: any, { cityId }: { cityId: string }) => {
      return rankActivities(cityId);
    },
    health: async () => {
      return getHealth();
    },
  },
}; 