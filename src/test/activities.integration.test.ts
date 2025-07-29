import nock from 'nock';
import request from 'supertest';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from '../types/graphql';
import { resolvers } from '../graphql/resolvers';

describe('activities integration', () => {
  const baseUrl = 'https://geocoding-api.open-meteo.com';
  let server: ApolloServer;
  let url: string;

  beforeAll(async () => {
    server = new ApolloServer({ typeDefs, resolvers });
    const { url: serverUrl } = await startStandaloneServer(server, {
      listen: { port: 0 },
    });
    url = serverUrl;
  });

  afterEach(() => nock.cleanAll());

  it('returns ranked activities', async () => {
    // Mock geocode
    nock(baseUrl)
      .get(/search/)
      .reply(200, {
        results: [
          { id: 1, name: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35 },
        ],
      });
    // Mock weather
    nock('https://api.open-meteo.com')
      .get(/forecast/)
      .reply(200, {
        daily: {
          time: ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05', '2023-01-06', '2023-01-07'],
          temperature_2m_max: [2, 3, 4, 5, 6, 7, 8],
          temperature_2m_min: [0, 1, 2, 3, 4, 5, 6],
          precipitation_sum: [2, 2, 2, 2, 2, 2, 2],
          weathercode: [1, 1, 1, 1, 1, 1, 1],
        },
      });
    // First, get cityId
    const cityRes = await request(url)
      .post('/graphql')
      .send({ query: '{ suggestCities(query: "Paris") { id name } }' });
    const cityId = cityRes.body.data.suggestCities[0].id;
    // Then, get activities
    const res = await request(url)
      .post('/graphql')
      .send({ query: `{ activities(cityId: "${cityId}") { activity score reason } }` });
    expect(res.body.data.activities).toBeDefined();
    expect(res.body.data.activities.length).toBe(4);
  });
}); 