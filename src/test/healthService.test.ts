import { getHealth } from '../services/healthService';
import { getWeatherForecast } from '../services/weatherService';

// Mock the weather service
jest.mock('../services/weatherService');
const mockGetWeatherForecast = getWeatherForecast as jest.MockedFunction<typeof getWeatherForecast>;

describe('Health Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock process.uptime
    jest.spyOn(process, 'uptime').mockReturnValue(123.45);
    // Mock process.env.npm_package_version
    process.env.npm_package_version = '1.2.3';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getHealth', () => {
    it('should return healthy status when all checks pass', async () => {
      // Mock successful weather API call
      mockGetWeatherForecast.mockResolvedValue({
        cityId: '2643743',
        daily: [
          {
            date: '2025-08-14',
            temperatureMax: 25,
            temperatureMin: 15,
            precipitation: 0,
            weatherCode: 1,
            windSpeed: 10,
            uvIndex: 5,
          },
        ],
      });

      const health = await getHealth();

      expect(health).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        uptime: 123.45,
        version: '1.2.3',
        checks: {
          database: {
            status: 'healthy',
            responseTime: 0,
          },
          externalApi: {
            status: 'healthy',
            responseTime: expect.any(Number),
          },
          cache: {
            status: 'healthy',
            responseTime: 0,
          },
        },
      });

      expect(health.status).toBe('healthy');
      expect(health.checks.externalApi.status).toBe('healthy');
      expect(health.checks.externalApi.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return degraded status when external API fails', async () => {
      // Mock failed weather API call
      mockGetWeatherForecast.mockRejectedValue(new Error('API Error'));

      const health = await getHealth();

      expect(health.status).toBe('degraded');
      expect(health.checks.externalApi.status).toBe('unhealthy');
      expect(health.checks.database.status).toBe('healthy');
      expect(health.checks.cache.status).toBe('healthy');
    });

    it('should handle missing package version gracefully', async () => {
      delete process.env.npm_package_version;
      
      mockGetWeatherForecast.mockResolvedValue({
        cityId: '2643743',
        daily: [
          {
            date: '2025-08-14',
            temperatureMax: 25,
            temperatureMin: 15,
            precipitation: 0,
            weatherCode: 1,
            windSpeed: 10,
            uvIndex: 5,
          },
        ],
      });

      const health = await getHealth();

      expect(health.version).toBe('1.0.0'); // Default fallback
      expect(health.status).toBe('healthy');
    });

    it('should return valid timestamp in ISO format', async () => {
      mockGetWeatherForecast.mockResolvedValue({
        cityId: '2643743',
        daily: [
          {
            date: '2025-08-14',
            temperatureMax: 25,
            temperatureMin: 15,
            precipitation: 0,
            weatherCode: 1,
            windSpeed: 10,
            uvIndex: 5,
          },
        ],
      });

      const health = await getHealth();
      const timestamp = new Date(health.timestamp);

      expect(timestamp.getTime()).not.toBeNaN();
      expect(health.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should measure external API response time accurately', async () => {
      // Mock a delay to test response time measurement
      mockGetWeatherForecast.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay
        return {
          cityId: '2643743',
          daily: [
            {
              date: '2025-08-14',
              temperatureMax: 25,
              temperatureMin: 15,
              precipitation: 0,
              weatherCode: 1,
              windSpeed: 10,
              uvIndex: 5,
            },
          ],
        };
      });

      const health = await getHealth();

      expect(health.checks.externalApi.responseTime).toBeGreaterThanOrEqual(50);
      expect(health.checks.externalApi.responseTime).toBeLessThan(100); // Should be close to 50ms
    });

    it('should handle database and cache as always healthy for now', async () => {
      mockGetWeatherForecast.mockResolvedValue({
        cityId: '2643743',
        daily: [
          {
            date: '2025-08-14',
            temperatureMax: 25,
            temperatureMin: 15,
            precipitation: 0,
            weatherCode: 1,
            windSpeed: 10,
            uvIndex: 5,
          },
        ],
      });

      const health = await getHealth();

      expect(health.checks.database.status).toBe('healthy');
      expect(health.checks.cache.status).toBe('healthy');
      expect(health.checks.database.responseTime).toBe(0);
      expect(health.checks.cache.responseTime).toBe(0);
    });
  });
}); 