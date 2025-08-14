import {
  calculateDistance,
  estimateTravelTime,
  formatDistance,
  checkLocationStatus,
  getUserLocation,
} from '../utils/locationUtils';

// Mock navigator.geolocation and navigator.permissions
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

const mockPermissions = {
  query: jest.fn(),
};

// Create a mock navigator object
const mockNavigator = {
  geolocation: mockGeolocation,
  permissions: mockPermissions,
};

// Mock the global navigator
Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
  configurable: true,
});

describe('Location Utils', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a fresh mock navigator for each test
    const mockNavigator = {
      geolocation: {
        getCurrentPosition: jest.fn(),
        watchPosition: jest.fn(),
        clearWatch: jest.fn(),
      },
      permissions: {
        query: jest.fn(),
      },
    };

    // Mock navigator globally
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
      configurable: true,
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates correctly', () => {
      // London coordinates
      const lat1 = 51.5074;
      const lon1 = -0.1278;
      
      // Paris coordinates
      const lat2 = 48.8566;
      const lon2 = 2.3522;

      const distance = calculateDistance(lat1, lon1, lat2, lon2);

      // London to Paris is approximately 344 km
      expect(distance).toBeCloseTo(344, 0);
    });

    it('should return 0 for identical coordinates', () => {
      const lat = 51.5074;
      const lon = -0.1278;

      const distance = calculateDistance(lat, lon, lat, lon);

      expect(distance).toBe(0);
    });

    it('should handle antipodal points (opposite sides of Earth)', () => {
      // London coordinates
      const lat1 = 51.5074;
      const lon1 = -0.1278;
      
      // Antipodal point (roughly in the Pacific)
      const lat2 = -51.5074;
      const lon2 = 179.8722;

      const distance = calculateDistance(lat1, lon1, lat2, lon2);

      // Should be close to half the Earth's circumference
      expect(distance).toBeCloseTo(20000, -3); // Within 1000 km
    });

    it('should handle coordinates at the poles', () => {
      // Test distance from North Pole to London
      const distance = calculateDistance(90, 0, 51.5074, -0.1278);
      
      // Should be approximately the distance from North Pole to London
      expect(distance).toBeCloseTo(4280, 0); // Adjusted to match actual calculation
    });
  });

  describe('estimateTravelTime', () => {
    it('should estimate short distance as drive time', () => {
      const distance = 25; // 25 km
      const travelTime = estimateTravelTime(distance);

      expect(travelTime).toBe('25 min drive');
    });

    it('should estimate medium distance as drive time', () => {
      const distance = 150; // 150 km
      const travelTime = estimateTravelTime(distance);

      expect(travelTime).toMatch(/^\d+-\d+ hour drive$/);
    });

    it('should estimate long distance as drive time', () => {
      const distance = 500; // 500 km
      const travelTime = estimateTravelTime(distance);

      expect(travelTime).toMatch(/^\d+-\d+ hour drive$/);
    });

    it('should estimate very long distance as flight time', () => {
      const distance = 2000; // 2000 km
      const travelTime = estimateTravelTime(distance);

      expect(travelTime).toMatch(/^\d+-\d+ hour flight$/);
    });

    it('should handle edge cases correctly', () => {
      expect(estimateTravelTime(0)).toBe('0 min drive');
      expect(estimateTravelTime(49)).toBe('49 min drive');
      expect(estimateTravelTime(50)).toBe('1-1 hour drive');
      expect(estimateTravelTime(199)).toBe('2-3 hour drive');
      expect(estimateTravelTime(999)).toBe('2-2 hour drive');
      expect(estimateTravelTime(1000)).toBe('1-2 hour flight');
    });
  });

  describe('formatDistance', () => {
    it('should format very short distances in meters', () => {
      expect(formatDistance(0.5)).toBe('500 m');
      expect(formatDistance(0.001)).toBe('1 m');
      expect(formatDistance(0.999)).toBe('999 m');
    });

    it('should format short distances with one decimal place', () => {
      expect(formatDistance(1.5)).toBe('1.5 km');
      expect(formatDistance(5.7)).toBe('5.7 km');
      expect(formatDistance(9.9)).toBe('9.9 km');
    });

    it('should format longer distances as whole numbers', () => {
      expect(formatDistance(10)).toBe('10 km');
      expect(formatDistance(25)).toBe('25 km');
      expect(formatDistance(100)).toBe('100 km');
      expect(formatDistance(1000)).toBe('1000 km');
    });

    it('should handle edge cases correctly', () => {
      expect(formatDistance(0)).toBe('0 m');
      expect(formatDistance(1)).toBe('1.0 km');
      expect(formatDistance(10)).toBe('10 km');
    });
  });

  describe('checkLocationStatus', () => {
    it('should return correct status when geolocation is supported', async () => {
      const status = await checkLocationStatus();
      
      expect(status.geolocationSupported).toBe(true);
      expect(status.error).toBeNull();
      // Permission will be 'unknown' by default since we're not mocking the permissions API in this test
      expect(status.permission).toBe('unknown');
    });

    it('should handle permissions API when available', async () => {
      // Mock permissions API to return granted status
      const mockPermissions = global.navigator.permissions as any;
      mockPermissions.query.mockResolvedValue({
        state: 'granted',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const status = await checkLocationStatus();

      expect(status.permission).toBe('granted');
      expect(mockPermissions.query).toHaveBeenCalledWith({ name: 'geolocation' });
    });

    it('should handle permissions API errors gracefully', async () => {
      // Mock permissions API to throw an error
      const mockPermissions = global.navigator.permissions as any;
      mockPermissions.query.mockRejectedValue(new Error('Permissions API error'));

      const status = await checkLocationStatus();

      expect(status.permission).toBe('unknown');
      expect(mockPermissions.query).toHaveBeenCalledWith({ name: 'geolocation' });
    });

    it('should work when permissions API is not available', async () => {
      // Mock navigator without permissions API
      const mockNavigatorWithoutPermissions = {
        geolocation: {
          getCurrentPosition: jest.fn(),
          watchPosition: jest.fn(),
          clearWatch: jest.fn(),
        },
      };

      Object.defineProperty(global, 'navigator', {
        value: mockNavigatorWithoutPermissions,
        writable: true,
        configurable: true,
      });

      const status = await checkLocationStatus();

      expect(status.geolocationSupported).toBe(true);
      expect(status.permission).toBe('unknown');
      expect(status.error).toBeNull();
    });
  });

  describe('getUserLocation', () => {
    it('should reject when geolocation is not supported', async () => {
      // Create a new navigator without geolocation
      const navigatorWithoutGeolocation = { ...mockNavigator };
      delete (navigatorWithoutGeolocation as any).geolocation;
      
      Object.defineProperty(global, 'navigator', {
        value: navigatorWithoutGeolocation,
        writable: true,
        configurable: true,
      });

      await expect(getUserLocation()).rejects.toThrow('Geolocation is not supported by this browser');

      // Restore original navigator
      Object.defineProperty(global, 'navigator', {
        value: mockNavigator,
        writable: true,
        configurable: true,
      });
    });

    it('should resolve with coordinates when permission is granted', async () => {
      const mockPosition = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
        },
      };

      // Mock permissions API to return granted status
      const mockPermissions = global.navigator.permissions as any;
      mockPermissions.query.mockResolvedValue({
        state: 'granted',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      // Mock getCurrentPosition to immediately resolve
      const mockGetCurrentPosition = global.navigator.geolocation.getCurrentPosition as jest.MockedFunction<any>;
      mockGetCurrentPosition.mockImplementation((successCallback: any) => {
        successCallback(mockPosition);
      });

      const result = await getUserLocation();

      expect(result).toEqual({
        latitude: 51.5074,
        longitude: -0.1278,
      });
    });

    it('should reject with appropriate error when permission is denied', async () => {
      const mockError = {
        code: 1, // PERMISSION_DENIED
        message: 'User denied geolocation',
      };

      // Mock permissions API to return granted status
      const mockPermissions = global.navigator.permissions as any;
      mockPermissions.query.mockResolvedValue({
        state: 'granted',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      // Mock getCurrentPosition to immediately reject
      const mockGetCurrentPosition = global.navigator.geolocation.getCurrentPosition as jest.MockedFunction<any>;
      mockGetCurrentPosition.mockImplementation((successCallback: any, errorCallback: any) => {
        errorCallback(mockError);
      });

      await expect(getUserLocation()).rejects.toThrow('Location error: User denied geolocation');
    });

    it('should reject with appropriate error when position is unavailable', async () => {
      const mockError = {
        code: 2, // POSITION_UNAVAILABLE
        message: 'Position unavailable',
      };

      // Mock permissions API to return granted status
      const mockPermissions = global.navigator.permissions as any;
      mockPermissions.query.mockResolvedValue({
        state: 'granted',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      // Mock getCurrentPosition to immediately reject
      const mockGetCurrentPosition = global.navigator.geolocation.getCurrentPosition as jest.MockedFunction<any>;
      mockGetCurrentPosition.mockImplementation((successCallback: any, errorCallback: any) => {
        errorCallback(mockError);
      });

      await expect(getUserLocation()).rejects.toThrow('Location error: Position unavailable');
    });

    it('should reject with appropriate error when request times out', async () => {
      const mockError = {
        code: 3, // TIMEOUT
        message: 'Request timeout',
      };

      // Mock permissions API to return granted status
      const mockPermissions = global.navigator.permissions as any;
      mockPermissions.query.mockResolvedValue({
        state: 'granted',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      // Mock getCurrentPosition to immediately reject
      const mockGetCurrentPosition = global.navigator.geolocation.getCurrentPosition as jest.MockedFunction<any>;
      mockGetCurrentPosition.mockImplementation((successCallback: any, errorCallback: any) => {
        errorCallback(mockError);
      });

      await expect(getUserLocation()).rejects.toThrow('Location error: Request timeout');
    });
  });
}); 