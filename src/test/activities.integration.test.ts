import request from 'supertest';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from '../types/graphql';

// Mock the resolvers to avoid external API calls
const mockResolvers = {
  Query: {
    suggestCities: jest.fn().mockResolvedValue([
      { id: 1, name: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35 }
    ]),
    weather: jest.fn().mockResolvedValue({
      cityId: 1,
      daily: [
        {
          date: '2023-01-01',
          temperatureMax: 2,
          temperatureMin: 0,
          precipitation: 2,
          weatherCode: 1,
          windSpeed: 25,
          uvIndex: 8,
        },
        {
          date: '2023-01-02',
          temperatureMax: 3,
          temperatureMin: 1,
          precipitation: 2,
          weatherCode: 1,
          windSpeed: 25,
          uvIndex: 8,
        },
        {
          date: '2023-01-03',
          temperatureMax: 4,
          temperatureMin: 2,
          precipitation: 2,
          weatherCode: 1,
          windSpeed: 25,
          uvIndex: 8,
        },
        {
          date: '2023-01-04',
          temperatureMax: 5,
          temperatureMin: 3,
          precipitation: 2,
          weatherCode: 1,
          windSpeed: 25,
          uvIndex: 8,
        },
        {
          date: '2023-01-05',
          temperatureMax: 6,
          temperatureMin: 4,
          precipitation: 2,
          weatherCode: 1,
          windSpeed: 25,
          uvIndex: 8,
        },
        {
          date: '2023-01-06',
          temperatureMax: 7,
          temperatureMin: 5,
          precipitation: 2,
          weatherCode: 1,
          windSpeed: 25,
          uvIndex: 8,
        },
        {
          date: '2023-01-07',
          temperatureMax: 8,
          temperatureMin: 6,
          precipitation: 2,
          weatherCode: 1,
          windSpeed: 25,
          uvIndex: 8,
        },
      ],
    }),
    activities: jest.fn().mockResolvedValue([
      { activity: 'Skiing', score: 0, reason: '0 points: Cold temperatures, snow conditions, low wind' },
      { activity: 'Surfing', score: 0, reason: '0 points: Warm weather, low rain, moderate wind, safe UV' },
      { activity: 'OutdoorSightseeing', score: 0, reason: '0 points: Mild temperatures, low rain, light breeze, moderate UV' },
      { activity: 'IndoorSightseeing', score: 0, reason: '0 points: Poor outdoor conditions (rain, cold, storms, high wind)' },
    ]),
    health: jest.fn().mockResolvedValue({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: 1000,
      version: '1.0.0',
      checks: {
        database: { status: 'healthy' },
        externalApi: { status: 'healthy', responseTime: 50 },
        cache: { status: 'healthy' },
      },
    }),
  },
};

describe('activities integration', () => {
  let server: ApolloServer;
  let url: string;

  beforeAll(async () => {
    server = new ApolloServer({ typeDefs, resolvers: mockResolvers });
    const { url: serverUrl } = await startStandaloneServer(server, {
      listen: { port: 0 },
    });
    url = serverUrl;
  });

  afterAll(async () => {
    await server.stop();
  });

  it('returns ranked activities', async () => {
    // First, get cityId
    const cityRes = await request(url)
      .post('/graphql')
      .send({ query: '{ suggestCities(query: "Paris") { id name } }' });
    
    expect(cityRes.body.data.suggestCities).toBeDefined();
    const cityId = cityRes.body.data.suggestCities[0].id;
    
    // Then, get activities
    const res = await request(url)
      .post('/graphql')
      .send({ query: `{ activities(cityId: "${cityId}") { activity score reason } }` });
    
    expect(res.body.data.activities).toBeDefined();
    expect(res.body.data.activities.length).toBe(4);
  });
}); 