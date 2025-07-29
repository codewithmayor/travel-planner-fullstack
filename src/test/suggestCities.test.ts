import nock from 'nock';
import { suggestCities } from '../services/cityService';

describe('suggestCities', () => {
  const baseUrl = 'https://geocoding-api.open-meteo.com';
  afterEach(() => nock.cleanAll());

  it('returns city suggestions for valid query', async () => {
    nock(baseUrl)
      .get(/search/)
      .reply(200, {
        results: [
          { id: 1, name: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35 },
          { id: 2, name: 'Pari', country: 'Test', latitude: 0, longitude: 0 },
        ],
      });
    const res = await suggestCities('Par');
    expect(res.length).toBe(2);
    expect(res[0].name).toBe('Paris');
  });

  it('returns empty for empty/long query', async () => {
    expect(await suggestCities('')).toEqual([]);
    expect(await suggestCities('a'.repeat(100))).toEqual([]);
  });
}); 