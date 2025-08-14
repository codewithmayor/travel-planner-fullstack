import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSchema } from 'graphql';
import { readFileSync } from 'fs';
import { join } from 'path';
import { resolvers } from '../graphql/resolvers';

// Mock the services
jest.mock('../services/cityService');
jest.mock('../services/weatherService');
jest.mock('../services/activityService');
jest.mock('../services/healthService');

const mockCityService = require('../services/cityService');
const mockWeatherService = require('../services/weatherService');
const mockActivityService = require('../services/activityService');
const mockHealthService = require('../services/healthService');

describe('GraphQL Resolvers', () => {
  let server: ApolloServer;
  let url: string;

  beforeAll(async () => {
    // Read the schema file
    const schemaPath = join(__dirname, '../types/graphql.ts');
    const schemaContent = readFileSync(schemaPath, 'utf-8');
    
    // Extract the GraphQL schema string (this is a simplified approach)
    // In a real scenario, you'd want to properly parse the schema
    const schema = buildSchema(`
      type City {
        id: ID!
        name: String!
        country: String!
        latitude: Float!
        longitude: Float!
      }

      type WeatherDay {
        date: String!
        temperatureMax: Float!
        temperatureMin: Float!
        precipitation: Float!
        weatherCode: Int!
        windSpeed: Float!
        uvIndex: Float!
      }

      type WeatherForecast {
        cityId: ID!
        daily: [WeatherDay!]!
      }

      type ActivityRanking {
        activity: String!
        score: Int!
        reason: String!
      }

      type HealthCheck {
        status: String!
        responseTime: Float!
      }

      type HealthChecks {
        database: HealthCheck!
        externalApi: HealthCheck!
        cache: HealthCheck!
      }

      type Health {
        status: String!
        timestamp: String!
        uptime: Float!
        version: String!
        checks: HealthChecks!
      }

      type Query {
        suggestCities(query: String!): [City!]!
        weather(cityId: ID!): WeatherForecast!
        activities(cityId: ID!): [ActivityRanking!]!
        health: Health!
      }
    `);

    server = new ApolloServer({
      typeDefs: schema,
      resolvers,
    });

    const { url: serverUrl } = await startStandaloneServer(server, {
      listen: { port: 0 },
    });
    url = serverUrl;
  });

  afterAll(async () => {
    await server.stop();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('suggestCities', () => {
    it('should return city suggestions when query is provided', async () => {
      const mockCities = [
        {
          id: '2643743',
          name: 'London',
          country: 'United Kingdom',
          latitude: 51.5074,
          longitude: -0.1278,
        },
        {
          id: '5128581',
          name: 'New York',
          country: 'United States',
          latitude: 40.7128,
          longitude: -74.0060,
        },
      ];

      mockCityService.suggestCities.mockResolvedValue(mockCities);

      const response = await server.executeOperation({
        query: `
          query SuggestCities($query: String!) {
            suggestCities(query: $query) {
              id
              name
              country
              latitude
              longitude
            }
          }
        `,
        variables: { query: 'London' },
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.suggestCities).toEqual(mockCities);
      }
      expect(mockCityService.suggestCities).toHaveBeenCalledWith('London');
    });

    it('should handle empty query gracefully', async () => {
      mockCityService.suggestCities.mockResolvedValue([]);

      const response = await server.executeOperation({
        query: `
          query SuggestCities($query: String!) {
            suggestCities(query: $query) {
              id
              name
              country
              latitude
              longitude
            }
          }
        `,
        variables: { query: '' },
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.suggestCities).toEqual([]);
      }
    });

    it('should handle service errors gracefully', async () => {
      mockCityService.suggestCities.mockRejectedValue(new Error('API Error'));

      const response = await server.executeOperation({
        query: `
          query SuggestCities($query: String!) {
            suggestCities(query: $query) {
              id
              name
              country
              latitude
              longitude
            }
          }
        `,
        variables: { query: 'Invalid' },
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeDefined();
        expect(response.body.singleResult.errors?.[0].message).toContain('API Error');
      }
    });
  });

  describe('weather', () => {
    it('should return weather forecast for a valid city ID', async () => {
      const mockWeather = {
        cityId: '2643743',
        daily: [
          {
            date: '2025-08-14',
            temperatureMax: 25,
            temperatureMin: 15,
            precipitation: 0,
            weatherCode: 1,
            windSpeed: 12,
            uvIndex: 6,
          },
        ],
      };

      mockWeatherService.getWeatherForecast.mockResolvedValue(mockWeather);

      const response = await server.executeOperation({
        query: `
          query GetWeather($cityId: ID!) {
            weather(cityId: $cityId) {
              cityId
              daily {
                date
                temperatureMax
                temperatureMin
                precipitation
                weatherCode
                windSpeed
                uvIndex
              }
            }
          }
        `,
        variables: { cityId: '2643743' },
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.weather).toEqual(mockWeather);
      }
      expect(mockWeatherService.getWeatherForecast).toHaveBeenCalledWith('2643743');
    });

    it('should handle invalid city ID gracefully', async () => {
      mockWeatherService.getWeatherForecast.mockRejectedValue(new Error('City not found'));

      const response = await server.executeOperation({
        query: `
          query GetWeather($cityId: ID!) {
            weather(cityId: $cityId) {
              cityId
              daily {
                date
                temperatureMax
                temperatureMin
                precipitation
                weatherCode
                windSpeed
                uvIndex
              }
            }
          }
        `,
        variables: { cityId: 'invalid' },
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeDefined();
        expect(response.body.singleResult.errors?.[0].message).toContain('City not found');
      }
    });
  });

  describe('activities', () => {
    it('should return ranked activities for a valid city ID', async () => {
      const mockActivities = [
        {
          activity: 'Surfing',
          score: 8,
          reason: '32 points: Warm weather, low rain, moderate wind, safe UV',
        },
        {
          activity: 'OutdoorSightseeing',
          score: 7,
          reason: '28 points: Mild temperatures, low rain, light breeze, moderate UV',
        },
        {
          activity: 'Skiing',
          score: 2,
          reason: '6 points: Cold temperatures, snow conditions, low wind',
        },
        {
          activity: 'IndoorSightseeing',
          score: 1,
          reason: '2 points: Poor outdoor conditions (rain, cold, storms, high wind)',
        },
      ];

      mockActivityService.rankActivities.mockResolvedValue(mockActivities);

      const response = await server.executeOperation({
        query: `
          query GetActivities($cityId: ID!) {
            activities(cityId: $cityId) {
              activity
              score
              reason
            }
          }
        `,
        variables: { cityId: '2643743' },
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.activities).toEqual(mockActivities);
      }
      expect(mockActivityService.rankActivities).toHaveBeenCalledWith('2643743');
    });

    it('should handle service errors gracefully', async () => {
      mockActivityService.rankActivities.mockRejectedValue(new Error('Weather data unavailable'));

      const response = await server.executeOperation({
        query: `
          query GetActivities($cityId: ID!) {
            activities(cityId: $cityId) {
              activity
              score
              reason
            }
          }
        `,
        variables: { cityId: '2643743' },
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeDefined();
        expect(response.body.singleResult.errors?.[0].message).toContain('Weather data unavailable');
      }
    });
  });

  describe('health', () => {
    it('should return health status when all systems are healthy', async () => {
      const mockHealth = {
        status: 'healthy',
        timestamp: '2025-08-14T12:00:00.000Z',
        uptime: 123.45,
        version: '1.2.3',
        checks: {
          database: {
            status: 'healthy',
            responseTime: 0,
          },
          externalApi: {
            status: 'healthy',
            responseTime: 45.2,
          },
          cache: {
            status: 'healthy',
            responseTime: 0,
          },
        },
      };

      mockHealthService.getHealth.mockResolvedValue(mockHealth);

      const response = await server.executeOperation({
        query: `
          query GetHealth {
            health {
              status
              timestamp
              uptime
              version
              checks {
                database {
                  status
                  responseTime
                }
                externalApi {
                  status
                  responseTime
                }
                cache {
                  status
                  responseTime
                }
              }
            }
          }
        `,
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.health).toEqual(mockHealth);
      }
      expect(mockHealthService.getHealth).toHaveBeenCalled();
    });

    it('should return degraded status when some systems are unhealthy', async () => {
      const mockHealth = {
        status: 'degraded',
        timestamp: '2025-08-14T12:00:00.000Z',
        uptime: 123.45,
        version: '1.2.3',
        checks: {
          database: {
            status: 'healthy',
            responseTime: 0,
          },
          externalApi: {
            status: 'unhealthy',
            responseTime: 5000,
          },
          cache: {
            status: 'healthy',
            responseTime: 0,
          },
        },
      };

      mockHealthService.getHealth.mockResolvedValue(mockHealth);

      const response = await server.executeOperation({
        query: `
          query GetHealth {
            health {
              status
              checks {
                externalApi {
                  status
                  responseTime
                }
              }
            }
          }
        `,
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        expect((response.body.singleResult.data as any)?.health.status).toBe('degraded');
        expect((response.body.singleResult.data as any)?.health.checks.externalApi.status).toBe('unhealthy');
      }
    });

    it('should handle health service errors gracefully', async () => {
      mockHealthService.getHealth.mockRejectedValue(new Error('Health check failed'));

      const response = await server.executeOperation({
        query: `
          query GetHealth {
            health {
              status
              timestamp
              uptime
              version
              checks {
                database {
                  status
                  responseTime
                }
                externalApi {
                  status
                  responseTime
                }
                cache {
                  status
                  responseTime
                }
              }
            }
          }
        `,
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeDefined();
        expect(response.body.singleResult.errors?.[0].message).toContain('Health check failed');
      }
    });
  });
}); 