// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Estimate travel time based on distance
export const estimateTravelTime = (distance: number): string => {
  if (distance < 50) {
    return `${Math.round(distance)} min drive`;
  } else if (distance < 200) {
    return `${Math.round(distance / 80)}-${Math.round(distance / 60)} hour drive`;
  } else if (distance < 1000) {
    return `${Math.round(distance / 600)}-${Math.round(distance / 500)} hour drive`;
  } else {
    return `${Math.round(distance / 800)}-${Math.round(distance / 600)} hour flight`;
  }
};

// Format distance for display
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)} km`;
  } else {
    return `${Math.round(distance)} km`;
  }
};

// Check if geolocation is available and what the current permission status is
export const checkLocationStatus = async () => {
  const status = {
    geolocationSupported: false,
    permission: 'unknown' as 'granted' | 'denied' | 'prompt' | 'unknown',
    error: null as string | null
  };

  // Check if geolocation is supported
  if (!navigator.geolocation) {
    status.error = 'Geolocation is not supported by this browser';
    return status;
  }
  status.geolocationSupported = true;

  // Check permission status if available
  if ('permissions' in navigator) {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      status.permission = permissionStatus.state;
    } catch {
      status.permission = 'unknown';
    }
  }

  return status;
};

// Get user's current location with better error handling
export const getUserLocation = async (): Promise<{ latitude: number; longitude: number }> => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by this browser');
  }

  // Check current permission status
  const status = await checkLocationStatus();
  if (status.error) {
    throw new Error(status.error);
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = 'Location access denied';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please check your browser settings and allow location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please check your device location services and try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = `Location error: ${error.message}`;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: false,
        timeout: 20000, // Increased timeout to 20 seconds
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

// Mock location for development/testing (optional)
export const getMockLocation = (): { latitude: number; longitude: number } => {
  // Return a default location (e.g., London coordinates)
  return {
    latitude: 51.5074,
    longitude: -0.1278,
  };
}; 