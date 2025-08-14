import { rankActivities } from '../services/activityService';
import { getWeatherForecast } from '../services/weatherService';

// Mock the weather service
jest.mock('../services/weatherService');
const mockGetWeatherForecast = getWeatherForecast as jest.MockedFunction<typeof getWeatherForecast>;

describe('Activity Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rankActivities', () => {
    it('should rank activities with perfect weather conditions correctly', async () => {
      // Mock perfect weather for outdoor activities
      mockGetWeatherForecast.mockResolvedValue({
        cityId: '2643743',
        daily: [
          {
            date: '2025-08-14',
            temperatureMax: 25,
            temperatureMin: 18,
            precipitation: 0,
            weatherCode: 1, // Clear sky
            windSpeed: 12,
            uvIndex: 6,
          },
          {
            date: '2025-08-15',
            temperatureMax: 26,
            temperatureMin: 19,
            precipitation: 0.5,
            weatherCode: 2, // Partly cloudy
            windSpeed: 15,
            uvIndex: 7,
          },
        ],
      });

      const activities = await rankActivities('2643743');

      expect(activities).toHaveLength(4);
      
      // Surfing should score high (warm, low rain, moderate wind, safe UV)
      const surfing = activities.find(a => a.activity === 'Surfing');
      expect(surfing?.score).toBeGreaterThanOrEqual(4);
      expect(surfing?.reason).toContain('points: Warm weather, low rain, moderate wind, safe UV');

      // Outdoor sightseeing should score high (mild temps, low rain, light breeze, moderate UV)
      const outdoor = activities.find(a => a.activity === 'OutdoorSightseeing');
      expect(outdoor?.score).toBeGreaterThanOrEqual(4);
      expect(outdoor?.reason).toContain('points: Mild temperatures, low rain, light breeze, moderate UV');

      // Skiing should score low (too warm, no snow)
      const skiing = activities.find(a => a.activity === 'Skiing');
      expect(skiing?.score).toBeLessThanOrEqual(3);

      // Indoor should score low (no poor conditions)
      const indoor = activities.find(a => a.activity === 'IndoorSightseeing');
      expect(indoor?.score).toBeLessThanOrEqual(3);
    });

    it('should rank activities with poor weather conditions correctly', async () => {
      // Mock poor weather conditions
      mockGetWeatherForecast.mockResolvedValue({
        cityId: '2643743',
        daily: [
          {
            date: '2025-08-14',
            temperatureMax: 35,
            temperatureMin: 28,
            precipitation: 5,
            weatherCode: 95, // Thunderstorm
            windSpeed: 35,
            uvIndex: 10,
          },
          {
            date: '2025-08-15',
            temperatureMax: -5,
            temperatureMin: -10,
            precipitation: 8,
            weatherCode: 70, // Snow
            windSpeed: 25,
            uvIndex: 1,
          },
        ],
      });

      const activities = await rankActivities('2643743');

      // Indoor sightseeing should score high (lots of poor conditions)
      const indoor = activities.find(a => a.activity === 'IndoorSightseeing');
      expect(indoor?.score).toBeGreaterThanOrEqual(2);
      expect(indoor?.reason).toContain('points: Poor outdoor conditions');

      // Other activities should score lower due to poor conditions
      const surfing = activities.find(a => a.activity === 'Surfing');
      expect(surfing?.score).toBeLessThanOrEqual(4);

      const outdoor = activities.find(a => a.activity === 'OutdoorSightseeing');
      expect(outdoor?.score).toBeLessThanOrEqual(4);
    });

    it('should handle skiing conditions correctly', async () => {
      // Mock good skiing weather
      mockGetWeatherForecast.mockResolvedValue({
        cityId: '2643743',
        daily: [
          {
            date: '2025-08-14',
            temperatureMax: 0,
            temperatureMin: -8,
            precipitation: 0,
            weatherCode: 73, // Snow
            windSpeed: 15,
            uvIndex: 2,
          },
          {
            date: '2025-08-15',
            temperatureMax: 2,
            temperatureMin: -5,
            precipitation: 0,
            weatherCode: 71, // Snow
            windSpeed: 18,
            uvIndex: 3,
          },
        ],
      });

      const activities = await rankActivities('2643743');

      const skiing = activities.find(a => a.activity === 'Skiing');
      expect(skiing?.score).toBeGreaterThanOrEqual(3);
      expect(skiing?.reason).toContain('points: Cold temperatures, snow conditions, low wind');
    });

    it('should cap scores at 10 maximum', async () => {
      // Mock extremely favorable weather for all activities
      mockGetWeatherForecast.mockResolvedValue({
        cityId: '2643743',
        daily: Array(7).fill({
          date: '2025-08-14',
          temperatureMax: 22,
          temperatureMin: 15,
          precipitation: 0,
          weatherCode: 1, // Clear sky
          windSpeed: 10,
          uvIndex: 5,
        }),
      });

      const activities = await rankActivities('2643743');

      // All scores should be capped at 10
      activities.forEach(activity => {
        expect(activity.score).toBeLessThanOrEqual(10);
        expect(activity.score).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle edge case weather conditions', async () => {
      // Mock edge case weather
      mockGetWeatherForecast.mockResolvedValue({
        cityId: '2643743',
        daily: [
          {
            date: '2025-08-14',
            temperatureMax: 10, // Exactly at outdoor sightseeing minimum
            temperatureMin: 5,
            precipitation: 2, // Exactly at outdoor sightseeing maximum
            weatherCode: 3, // Cloudy
            windSpeed: 5, // Exactly at outdoor sightseeing minimum
            uvIndex: 3, // Exactly at outdoor sightseeing minimum
          },
        ],
      });

      const activities = await rankActivities('2643743');

      const outdoor = activities.find(a => a.activity === 'OutdoorSightseeing');
      expect(outdoor?.score).toBeGreaterThan(0);
      expect(outdoor?.reason).toContain('points: Mild temperatures, low rain, light breeze, moderate UV');
    });

    it('should return activities in correct order', async () => {
      // Mock mixed weather conditions
      mockGetWeatherForecast.mockResolvedValue({
        cityId: '2643743',
        daily: [
          {
            date: '2025-08-14',
            temperatureMax: 20,
            temperatureMin: 12,
            precipitation: 1,
            weatherCode: 2, // Partly cloudy
            windSpeed: 12,
            uvIndex: 5,
          },
        ],
      });

      const activities = await rankActivities('2643743');

      // Activities should be returned in the expected order
      expect(activities[0].activity).toBe('Skiing');
      expect(activities[1].activity).toBe('Surfing');
      expect(activities[2].activity).toBe('OutdoorSightseeing');
      expect(activities[3].activity).toBe('IndoorSightseeing');
    });

    it('should handle zero points correctly', async () => {
      // Mock weather that gives zero points for all activities
      mockGetWeatherForecast.mockResolvedValue({
        cityId: '2643743',
        daily: [
          {
            date: '2025-08-14',
            temperatureMax: 5, // Too cold for outdoor (10-28), too warm for skiing (-15 to 2), too cold for surfing (18-35)
            temperatureMin: 0, // Too warm for skiing
            precipitation: 2, // Exactly 2mm - not <2mm for surfing/outdoor, not >3mm for indoor
            weatherCode: 1, // Clear sky, not snow (70-79) or storms (>60)
            windSpeed: 25, // Exactly 25 - not <25 for surfing, not <20 for skiing, not 5-15 for outdoor
            uvIndex: 8, // Exactly 8 - not <8 for surfing, not 3-7 for outdoor
          },
          {
            date: '2025-08-15',
            temperatureMax: 5, // Same conditions
            temperatureMin: 0,
            precipitation: 2,
            weatherCode: 1,
            windSpeed: 25,
            uvIndex: 8,
          },
          {
            date: '2025-08-16',
            temperatureMax: 5, // Same conditions
            temperatureMin: 0,
            precipitation: 2,
            weatherCode: 1,
            windSpeed: 25,
            uvIndex: 8,
          },
          {
            date: '2025-08-17',
            temperatureMax: 5, // Same conditions
            temperatureMin: 0,
            precipitation: 2,
            weatherCode: 1,
            windSpeed: 25,
            uvIndex: 8,
          },
          {
            date: '2025-08-18',
            temperatureMax: 5, // Same conditions
            temperatureMin: 0,
            precipitation: 2,
            weatherCode: 1,
            windSpeed: 25,
            uvIndex: 8,
          },
          {
            date: '2025-08-19',
            temperatureMax: 5, // Same conditions
            temperatureMin: 0,
            precipitation: 2,
            weatherCode: 1,
            windSpeed: 25,
            uvIndex: 8,
          },
          {
            date: '2025-08-20',
            temperatureMax: 5, // Same conditions
            temperatureMin: 0,
            precipitation: 2,
            weatherCode: 1,
            windSpeed: 25,
            uvIndex: 8,
          },
        ],
      });

      const activities = await rankActivities('2643743');

      // All scores should be 0 when no points are earned
      activities.forEach(activity => {
        expect(activity.score).toBe(0);
        expect(activity.reason).toContain('0 points:');
      });
    });

    it('should calculate scores based on multiple days correctly', async () => {
      // Mock 7 days of weather data
      const dailyWeather = Array(7).fill(null).map((_, index) => ({
        date: `2025-08-${14 + index}`,
        temperatureMax: 25,
        temperatureMin: 18,
        precipitation: 0,
        weatherCode: 1,
        windSpeed: 12,
        uvIndex: 6,
      }));

      mockGetWeatherForecast.mockResolvedValue({
        cityId: '2643743',
        daily: dailyWeather,
      });

      const activities = await rankActivities('2643743');

      // With 7 days of perfect weather, scores should be high
      const surfing = activities.find(a => a.activity === 'Surfing');
      expect(surfing?.score).toBeGreaterThanOrEqual(8);
      
      // Reason should show total points accumulated
      expect(surfing?.reason).toContain('points:');
      expect(surfing?.reason).toContain('Warm weather, low rain, moderate wind, safe UV');
    });
  });
}); 