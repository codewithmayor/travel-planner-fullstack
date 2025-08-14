// Test setup file for Jest

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.OPEN_METEO_BASE_URL = 'https://api.open-meteo.com';
process.env.PORT = '4000';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock process.exit to prevent tests from exiting
const originalExit = process.exit;
beforeAll(() => {
  (process as any).exit = jest.fn();
});

afterAll(() => {
  process.exit = originalExit;
});

// Global test utilities
(global as any).testUtils = {
  // Helper to create mock weather data
  createMockWeatherData: (days: number = 7) => ({
    daily: {
      time: Array.from({ length: days }, (_, i) => `2025-08-${14 + i}`),
      temperature_2m_max: Array.from({ length: days }, () => 25),
      temperature_2m_min: Array.from({ length: days }, () => 15),
      precipitation_sum: Array.from({ length: days }, () => 0),
      weathercode: Array.from({ length: days }, () => 1),
      windspeed_10m_max: Array.from({ length: days }, () => 12),
      uv_index_max: Array.from({ length: days }, () => 6),
    },
  }),

  // Helper to create mock city data
  createMockCityData: (count: number = 1) => ({
    results: Array.from({ length: count }, (_, i) => ({
      id: 2643743 + i,
      name: `City ${i + 1}`,
      country: `Country ${i + 1}`,
      latitude: 51.5074 + i * 0.1,
      longitude: -0.1278 + i * 0.1,
      admin1: `Admin ${i + 1}`,
    })),
  }),

  // Helper to create mock health data
  createMockHealthData: (status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy') => ({
    status,
    timestamp: new Date().toISOString(),
    uptime: 123.45,
    version: '1.2.3',
    checks: {
      database: {
        status: 'healthy',
        responseTime: 0,
      },
      externalApi: {
        status: status === 'healthy' ? 'healthy' : 'unhealthy',
        responseTime: status === 'healthy' ? 45.2 : 5000,
      },
      cache: {
        status: 'healthy',
        responseTime: 0,
      },
    },
  }),

  // Helper to create mock activity data
  createMockActivityData: () => [
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
  ],

  // Helper to wait for async operations
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to create mock fetch response
  createMockFetchResponse: (data: any, ok: boolean = true, status: number = 200) => ({
    ok,
    status,
    json: async () => data,
  } as Response),
}; 