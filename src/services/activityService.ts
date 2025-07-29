import { getWeatherForecast } from './weatherService';
import { ActivityRanking } from '../types';

export const rankActivities = async (cityId: string): Promise<ActivityRanking[]> => {
  const forecast = await getWeatherForecast(cityId);
  const days = forecast.daily;

  // Simple scoring rules
  let skiing = 0, surfing = 0, indoor = 0, outdoor = 0;
  let skiingReason = '', surfingReason = '', indoorReason = '', outdoorReason = '';

  days.forEach(day => {
    // Skiing: cold, some precipitation (snow), not too warm
    if (day.temperatureMax < 5 && day.precipitation > 1) skiing++;
    // Surfing: warm, not much rain, not freezing
    if (day.temperatureMax > 18 && day.precipitation < 2) surfing++;
    // Outdoor: mild, not much rain
    if (day.temperatureMax > 10 && day.temperatureMax < 28 && day.precipitation < 2) outdoor++;
    // Indoor: bad weather
    if (day.precipitation > 3 || day.temperatureMax < 0 || day.weatherCode > 60) indoor++;
  });

  skiingReason = `${skiing} days with cold and precipitation`;
  surfingReason = `${surfing} days with warm, low-rain weather`;
  outdoorReason = `${outdoor} days with mild, dry weather`;
  indoorReason = `${indoor} days with poor outdoor conditions`;

  return [
    { activity: 'Skiing', score: skiing, reason: skiingReason },
    { activity: 'Surfing', score: surfing, reason: surfingReason },
    { activity: 'OutdoorSightseeing', score: outdoor, reason: outdoorReason },
    { activity: 'IndoorSightseeing', score: indoor, reason: indoorReason },
  ];
}; 