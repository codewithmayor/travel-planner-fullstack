import { getWeatherForecast } from './weatherService';
import { ActivityRanking } from '../types';

export const rankActivities = async (cityId: string): Promise<ActivityRanking[]> => {
  const forecast = await getWeatherForecast(cityId);
  const days = forecast.daily;

  // Enhanced scoring system (1-10 scale)
  let skiingScore = 0, surfingScore = 0, outdoorScore = 0, indoorScore = 0;
  let skiingReason = '', surfingReason = '', outdoorReason = '', indoorReason = '';

  days.forEach(day => {
    // Skiing: Optimal range -15°C to 2°C, snow, low wind
    let skiingPoints = 0;
    if (day.temperatureMin >= -15 && day.temperatureMax <= 2) skiingPoints += 1;
    if (day.weatherCode >= 70 && day.weatherCode <= 79) skiingPoints += 2; // Snow
    if (day.windSpeed < 20) skiingPoints += 1; // Low wind
    skiingScore += skiingPoints;

    // Surfing: 18-35°C, low rain, moderate wind, safe UV
    let surfingPoints = 0;
    if (day.temperatureMax >= 18 && day.temperatureMax <= 35) surfingPoints += 1;
    if (day.precipitation < 2) surfingPoints += 2; // Low rain
    if (day.windSpeed < 25) surfingPoints += 1; // Moderate wind
    if (day.uvIndex < 8) surfingPoints += 1; // Safe UV
    surfingScore += surfingPoints;

    // Outdoor Sightseeing: 10-28°C, low rain, light breeze, moderate UV
    let outdoorPoints = 0;
    if (day.temperatureMax >= 10 && day.temperatureMax <= 28) outdoorPoints += 1;
    if (day.precipitation < 2) outdoorPoints += 2; // Low rain
    if (day.windSpeed >= 5 && day.windSpeed <= 15) outdoorPoints += 1; // Light breeze
    if (day.uvIndex >= 3 && day.uvIndex <= 7) outdoorPoints += 1; // Moderate UV
    outdoorScore += outdoorPoints;

    // Indoor Sightseeing: Bad weather conditions
    let indoorPoints = 0;
    if (day.precipitation > 3) indoorPoints += 1; // Heavy rain
    if (day.temperatureMax < 0) indoorPoints += 1; // Extreme cold
    if (day.weatherCode > 60) indoorPoints += 1; // Storms
    if (day.windSpeed > 30) indoorPoints += 1; // High wind
    indoorScore += indoorPoints;
  });

  // Convert to 1-10 scale (max 4 points per day * 7 days = 28 max)
  const convertToScale = (score: number) => {
    if (score === 0) return 0;
    const scaled = Math.round((score / 28) * 10);
    return Math.min(scaled, 10); // Cap at 10
  };

  skiingReason = `${skiingScore} points: Cold temperatures, snow conditions, low wind`;
  surfingReason = `${surfingScore} points: Warm weather, low rain, moderate wind, safe UV`;
  outdoorReason = `${outdoorScore} points: Mild temperatures, low rain, light breeze, moderate UV`;
  indoorReason = `${indoorScore} points: Poor outdoor conditions (rain, cold, storms, high wind)`;

  return [
    { activity: 'Skiing', score: convertToScale(skiingScore), reason: skiingReason },
    { activity: 'Surfing', score: convertToScale(surfingScore), reason: surfingReason },
    { activity: 'OutdoorSightseeing', score: convertToScale(outdoorScore), reason: outdoorReason },
    { activity: 'IndoorSightseeing', score: convertToScale(indoorScore), reason: indoorReason },
  ];
}; 