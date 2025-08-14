import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserLocation } from '../utils/locationUtils';

interface LocationContextType {
  userLocation: { latitude: number; longitude: number } | null;
  locationError: string | null;
  isLoadingLocation: boolean;
  requestLocation: () => Promise<void>;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const requestLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    try {
      const location = await getUserLocation();
      setUserLocation(location);
      // Store in localStorage for future use
      localStorage.setItem('userLocation', JSON.stringify(location));
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Failed to get location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const clearLocation = () => {
    setUserLocation(null);
    setLocationError(null);
    localStorage.removeItem('userLocation');
  };

  // Try to restore location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        setUserLocation(location);
      } catch (error) {
        // Invalid saved location, remove it
        localStorage.removeItem('userLocation');
      }
    }
  }, []);

  const value: LocationContextType = {
    userLocation,
    locationError,
    isLoadingLocation,
    requestLocation,
    clearLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}; 