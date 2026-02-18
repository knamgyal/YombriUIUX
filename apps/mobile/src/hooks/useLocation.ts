import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface LocationResult {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
  };
  timestamp: number;
}

export interface UseLocationResult {
  status: LocationPermissionStatus;
  isLoading: boolean;
  requestPermission: () => Promise<LocationPermissionStatus>;
  getCurrentLocation: () => Promise<LocationResult | null>;
  error: string | null;
}

export function useLocation(): UseLocationResult {
  const [permissionResponse, requestPermission] = Location.useForegroundPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status: LocationPermissionStatus = permissionResponse?.granted
    ? 'granted'
    : permissionResponse?.canAskAgain === false
    ? 'denied'
    : 'undetermined';

  const handleRequestPermission = async (): Promise<LocationPermissionStatus> => {
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await requestPermission();
      setIsLoading(false);
      
      if (result.granted) {
        return 'granted';
      } else if (result.canAskAgain === false) {
        setError('Location permission permanently denied. Enable in Settings.');
        return 'denied';
      } else {
        setError('Location permission not granted.');
        return 'denied';
      }
    } catch (err) {
      setIsLoading(false);
      setError('Failed to request location permission.');
      return 'denied';
    }
  };

  const getCurrentLocation = async (): Promise<LocationResult | null> => {
    if (status !== 'granted') {
      setError('Location permission not granted.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 0,
      });

      setIsLoading(false);

      return {
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        },
        timestamp: location.timestamp,
      };
    } catch (err) {
      setIsLoading(false);
      setError('Failed to get current location. Please try again.');
      return null;
    }
  };

  return {
    status,
    isLoading,
    requestPermission: handleRequestPermission,
    getCurrentLocation,
    error,
  };
}