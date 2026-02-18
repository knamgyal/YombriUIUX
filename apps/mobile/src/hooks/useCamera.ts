import { useState } from 'react';
import { Camera, CameraView } from 'expo-camera';

export type CameraPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface UseCameraResult {
  status: CameraPermissionStatus;
  isLoading: boolean;
  requestPermission: () => Promise<CameraPermissionStatus>;
  error: string | null;
}

export function useCamera(): UseCameraResult {
  const [permissionResponse, requestPermission] = Camera.useCameraPermissions();
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
      } else if (result.canAskAgain === false) {
        setError('Camera permission permanently denied. Enable in Settings.');
        return 'denied';
      } else {
        setError('Camera permission not granted.');
        return 'denied';
      }
    } catch (err) {
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
