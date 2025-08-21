import { z } from 'zod';
import https from 'node:https';
import dnsPromises from 'node:dns/promises';

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
    windspeed_10m_max: z.array(z.number()),
    uv_index_max: z.array(z.number()),
  }),
});

async function httpsJsonViaIPv4(urlString: string, timeoutMs = 10000): Promise<any> {
  const urlObj = new URL(urlString);
  const originalHost = urlObj.hostname;
  const pathWithQuery = `${urlObj.pathname}${urlObj.search}`;

  const lookup = await dnsPromises.lookup(originalHost, { family: 4 });

  const options: https.RequestOptions = {
    host: lookup.address,
    servername: originalHost,
    method: 'GET',
    path: pathWithQuery,
    headers: {
      Host: originalHost,
      'User-Agent': 'TravelPlanner/1.0',
      Accept: 'application/json',
    },
    timeout: timeoutMs,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const statusCode = res.statusCode || 0;
      const chunks: Uint8Array[] = [];

      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf-8');
        if (statusCode < 200 || statusCode >= 300) {
          reject(new Error(`HTTP ${statusCode}: ${res.statusMessage || ''}`));
          return;
        }
        try {
          const json = JSON.parse(body);
          resolve(json);
        } catch (e) {
          reject(new Error('Failed to parse JSON response'));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Request timeout'));
    });
    req.on('error', (e) => reject(e));
    req.end();
  });
}

class OpenMeteoDataSource {
  private async fetchWithRetry(url: string, retries = 2): Promise<any> {
    for (let i = 0; i <= retries; i++) {
      try {
        return await httpsJsonViaIPv4(url);
      } catch (err: unknown) {
        if (i === retries) {
          if (err instanceof Error) {
            throw new Error(`Network error: ${err.message || (err as any).code || 'Unknown error'}`);
          } else {
            throw new Error(`Unknown error occurred: ${String(err)}`);
          }
        }
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
    const url = `${BASE_URL}/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max,uv_index_max&forecast_days=7&timezone=auto`;
    const data = await this.fetchWithRetry(url);
    const parsed = weatherSchema.safeParse(data);
    if (!parsed.success) throw new Error('Invalid weather response');
    this.setCache(key, parsed.data.daily);
    return parsed.data.daily;
  }
}

export const openMeteo = new OpenMeteoDataSource(); 