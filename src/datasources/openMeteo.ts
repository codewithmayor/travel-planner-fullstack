import { z } from 'zod';

const BASE_URL = process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com';
const CACHE_TTL = 60 * 5 * 1000; // 5 minutes

const cache = new Map<string, { data: any; expires: number }>();

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const geocodeSchema = z.object({
  results: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      country: z.string(),
      admin1: z.string().optional(),
      latitude: z.number(),
      longitude: z.number(),
    })
  ),
});

const weatherSchema = z.object({
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    precipitation_sum: z.array(z.number()),
    weathercode: z.array(z.number()),
  }),
});

class OpenMeteoDataSource {
  private async fetchWithRetry(url: string, retries = 2): Promise<any> {
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        if (i === retries) throw err;
        await sleep(200 * (i + 1));
      }
    }
  }

  private getCache(key: string) {
    const entry = cache.get(key);
    if (entry && entry.expires > Date.now()) return entry.data;
    cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any) {
    cache.set(key, { data, expires: Date.now() + CACHE_TTL });
  }

  async geocodeCity(query: string) {
    const key = `geocode:${query}`;
    const cached = this.getCache(key);
    if (cached) return cached;
    const url = `${GEOCODING_URL}/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
    const data = await this.fetchWithRetry(url);
    const parsed = geocodeSchema.safeParse(data);
    if (!parsed.success) throw new Error('Invalid geocode response');
    this.setCache(key, parsed.data.results);
    return parsed.data.results;
  }

  async getWeather(lat: number, lon: number) {
    const key = `weather:${lat},${lon}`;
    const cached = this.getCache(key);
    if (cached) return cached;
    const url = `${BASE_URL}/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&forecast_days=7&timezone=auto`;
    const data = await this.fetchWithRetry(url);
    const parsed = weatherSchema.safeParse(data);
    if (!parsed.success) throw new Error('Invalid weather response');
    this.setCache(key, parsed.data.daily);
    return parsed.data.daily;
  }
}

export const openMeteo = new OpenMeteoDataSource(); 