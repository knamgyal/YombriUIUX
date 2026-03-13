import { useState } from 'react';
import { useCameraPermissions } from 'expo-camera';

export type CameraPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface UseCameraResult {
  status: CameraPermissionStatus;
  isLoading: boolean;
  requestPermission: () => Promise<CameraPermissionStatus>;
  error: string | null;
}

export function useCamera(): UseCameraResult {
  const [permissionResponse, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status: CameraPermissionStatus = permissionResponse?.granted
    ? 'granted'
    : permissionResponse?.canAskAgain === false
      ? 'denied'
      : 'undetermined';

  const handleRequestPermission = async (): Promise<CameraPermissionStatus> => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await requestPermission();
      setIsLoading(false);

      if (result.granted) {
        return 'granted';
      }

      if (result.canAskAgain === false) {
        setError('Camera permission permanently denied. Enable in Settings.');
        return 'denied';
      }

      setError('Camera permission not granted.');
      return 'denied';
    } catch {
      setIsLoading(false);
      setError('Failed to request camera permission.');
      return 'denied';
    }
  };

  return {
    status,
    isLoading,
    requestPermission: handleRequestPermission,
    error,
  };
}
