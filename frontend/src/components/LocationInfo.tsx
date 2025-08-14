import React, { useState, useEffect } from 'react';
import { useLocation } from '../contexts/LocationContext';
import { CitySuggestion } from '../types';
import { calculateDistance, estimateTravelTime, formatDistance, checkLocationStatus } from '../utils/locationUtils';

interface LocationInfoProps {
  city: CitySuggestion;
}

export const LocationInfo: React.FC<LocationInfoProps> = ({ city }) => {
  const { userLocation, locationError, isLoadingLocation, requestLocation } = useLocation();
  const [locationStatus, setLocationStatus] = useState<any>(null);

  useEffect(() => {
    // Check location status when component mounts
    const status = checkLocationStatus();
    setLocationStatus(status);
  }, []);

  if (!userLocation) {
    return (
      <div className="location-info">
        <div className="location-prompt">
          <span className="location-icon">📍</span>
          <span className="location-text">
            <button 
              onClick={requestLocation}
              disabled={isLoadingLocation}
              className="location-button"
            >
              {isLoadingLocation ? 'Getting location...' : 'Share your location'}
            </button>
            {' '}to see distance from {city.name}
          </span>
        </div>
        
        {locationError && (
          <div className="location-error">
            <div className="error-message">{locationError}</div>
            <div className="location-help">
              <strong>Debug Info:</strong>
              <ul className="debug-list">
                <li>Geolocation supported: {locationStatus?.geolocationSupported ? 'Yes' : 'No'}</li>
                <li>Permission status: {locationStatus?.permission || 'Unknown'}</li>
                <li>Protocol: {window.location.protocol}</li>
                <li>Hostname: {window.location.hostname}</li>
              </ul>
              <strong>Try this:</strong>
              <ol className="help-steps">
                <li>Check if your browser supports geolocation</li>
                <li>Make sure location services are enabled on your device</li>
                <li>Try refreshing the page and clicking the button again</li>
                <li>Check browser settings for location permissions</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    );
  }

  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    city.latitude,
    city.longitude
  );

  const travelTime = estimateTravelTime(distance);
  const formattedDistance = formatDistance(distance);

  return (
    <div className="location-info">
      <div className="location-details">
        <span className="location-icon">📍</span>
        <span className="location-text">
          ~{formattedDistance} from your location
        </span>
        <span className="travel-time">
          ({travelTime})
        </span>
      </div>
    </div>
  );
}; 