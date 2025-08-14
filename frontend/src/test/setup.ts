// Frontend test setup file for Jest

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.REACT_APP_API_URL = 'http://localhost:4000';

// Mock fetch globally for frontend tests
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
(global as any).localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
(global as any).sessionStorage = sessionStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

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

// Global test utilities for frontend
(global as any).testUtils = {
  // Helper to create mock GraphQL response
  createMockGraphQLResponse: (data: any, errors?: any[]) => ({
    data,
    errors,
  }),

  // Helper to create mock Apollo Client
  createMockApolloClient: () => ({
    query: jest.fn(),
    mutate: jest.fn(),
    watchQuery: jest.fn(),
    subscribe: jest.fn(),
  }),

  // Helper to create mock user location
  createMockUserLocation: () => ({
    latitude: 51.5074,
    longitude: -0.1278,
  }),

  // Helper to create mock city data
  createMockCityData: (count: number = 1) => Array.from({ length: count }, (_, i) => ({
    id: `2643743${i}`,
    name: `City ${i + 1}`,
    country: `Country ${i + 1}`,
    latitude: 51.5074 + i * 0.1,
    longitude: -0.1278 + i * 0.1,
  })),

  // Helper to create mock weather data
  createMockWeatherData: (days: number = 7) => ({
    cityId: '2643743',
    daily: Array.from({ length: days }, (_, i) => ({
      date: `2025-08-${14 + i}`,
      temperatureMax: 25,
      temperatureMin: 15,
      precipitation: 0,
      weatherCode: 1,
      windSpeed: 12,
      uvIndex: 6,
    })),
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

  // Helper to render components with providers
  renderWithProviders: (component: React.ReactElement, providers: any[] = []) => {
    const { render } = require('@testing-library/react');
    let result = component;
    
    // Wrap with providers in reverse order
    providers.reverse().forEach(provider => {
      result = provider(result);
    });
    
    return render(result);
  },
};

// Make this a module
export {}; 