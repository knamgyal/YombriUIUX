import { View, Text, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView } from 'expo-camera';
import { Button } from '@yombri/native-runtime';
import { colors, spacing, typography } from '@yombri/design-tokens';
import { supabaseClient } from '@yombri/supabase-client';
import { useLocation } from '../hooks/useLocation';
import { useCamera } from '../hooks/useCamera';
import { useAnalytics } from '../hooks/useAnalytics';
import { useNetInfo } from '@react-native-community/netinfo';

type CheckInMethod = 'magic' | 'totp' | 'qr';

export function CheckInScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const netInfo = useNetInfo();
  const { trackEvent } = useAnalytics();
  
  const { status: locationStatus, getCurrentLocation, requestPermission: requestLocation } = useLocation();
  const { status: cameraStatus, requestPermission: requestCamera } = useCamera();
  
  const [method, setMethod] = useState<CheckInMethod>('magic');
  const [isChecking, setIsChecking] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [scanningQR, setScanningQR] = useState(false);
  const [searchingSignal, setSearchingSignal] = useState(false);

  useEffect(() => {
    if (method === 'magic') {
      initiateSignalSearch();
    }
  }, [method]);

  const initiateSignalSearch = async () => {
    setSearchingSignal(true);
    
    if (locationStatus !== 'granted') {
      await requestLocation();
    }
    
    setTimeout(() => setSearchingSignal(false), 2000);
  };

  const handleMagicCheckIn = async () => {
    trackEvent({ type: 'checkin_attempt', eventId, method: 'geo' });
    setIsChecking(true);

    let location = null;
    if (locationStatus === 'granted') {
      location = await getCurrentLocation();
    }

    try {
      const result = await supabaseClient.checkin.verifyCheckIn({
        eventId,
        location: location
          ? {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy || undefined,
            }
          : undefined,
      });

      if (result.success) {
        trackEvent({ 
          type: 'checkin_success', 
          eventId, 
          method: result.offline ? 'offline' : 'geo' 
        });
        router.replace(`/impact-moment?eventId=${eventId}`);
      } else {
        trackEvent({ 
          type: 'checkin_failure', 
          eventId, 
          method: 'geo', 
          reason: result.error || 'unknown' 
        });
        
        if (netInfo.isConnected === false) {
          Alert.alert(
            'Offline Check-In',
            'You appear to be offline. Check-in has been queued and will sync when you are back online.',
            [{ text: 'OK', onPress: () => router.replace(`/impact-moment?eventId=${eventId}&offline=true`) }]
          );
        } else {
          Alert.alert('Check-In Failed', result.error || 'Please try manual code instead.');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Network error. Check-in has been queued for offline sync.');
      router.replace(`/impact-moment?eventId=${eventId}&offline=true`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleTOTPCheckIn = async () => {
    if (totpCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code.');
      return;
    }

    trackEvent({ type: 'checkin_attempt', eventId, method: 'totp' });
    setIsChecking(true);

    try {
      const result = await supabaseClient.checkin.verifyCheckInTotp({
        eventId,
        code: totpCode,
      });

      if (result.success) {
        trackEvent({ type: 'checkin_success', eventId, method: 'totp' });
        router.replace(`/impact-moment?eventId=${eventId}`);
      } else {
        trackEvent({ 
          type: 'checkin_failure', 
          eventId, 
          method: 'totp', 
          reason: result.error || 'unknown' 
        });

        if (result.error?.includes('cooldown')) {
          Alert.alert(
            'Too Many Attempts',
            'Please wait 5 minutes before trying again.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Invalid Code', result.error || 'Please check the code and try again.');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsChecking(false);
      setTotpCode('');
    }
  };

  const handleQRScan = async (data: string) => {
    setScanningQR(false);
    trackEvent({ type: 'checkin_attempt', eventId, method: 'qr' });
    setIsChecking(true);

    try {
      const result = await supabaseClient.checkin.verifyCheckIn({
        eventId,
        token: data,
      });

      if (result.success) {
        trackEvent({ type: 'checkin_success', eventId, method: 'qr' });
        router.replace(`/impact-moment?eventId=${eventId}`);
      } else {
        trackEvent({ 
          type: 'checkin_failure', 
          eventId, 
          method: 'qr', 
          reason: result.error || 'unknown' 
        });
        Alert.alert('Invalid QR Code', result.error || 'Please try again.');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const openQRScanner = async () => {
    if (cameraStatus !== 'granted') {
      const granted = await requestCamera();
      if (granted !== 'granted') {
        Alert.alert(
          'Camera Required',
          'Camera access is needed to scan QR codes. Enable in Settings or use manual code instead.'
        );
        return;
      }
    }
    setScanningQR(true);
  };

  if (scanningQR) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.neutral[900] }}>
        <CameraView
          style={{ flex: 1 }}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={(result) => {
            if (result.data) {
              handleQRScan(result.data);
            }
          }}
        />
        <View className="absolute bottom-0 left-0 right-0 p-6 items-center">
          <Button onPress={() => setScanningQR(false)} variant="secondary">
            Cancel
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.neutral[50] }}>
      <View className="flex-1 justify-center" style={{ padding: spacing.grid }}>
        {method === 'magic' && (
          <View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.neutral[900],
                textAlign: 'center',
              }}
              className="mb-4"
            >
              {searchingSignal ? 'Searching for check-in signal...' : 'Ready to Check In'}
            </Text>

            <Text
              style={{
                fontSize: typography.body.size,
                color: colors.neutral[600],
                textAlign: 'center',
              }}
              className="mb-8"
            >
              {searchingSignal 
                ? 'Looking for location signal'
                : locationStatus === 'granted'
                ? 'Tap to confirm your presence'
                : 'Location permission required for auto check-in'}
            </Text>

            {searchingSignal ? (
              <ActivityIndicator size="large" color={colors.brand.emerald} />
            ) : (
              <>
                <Button
                  onPress={handleMagicCheckIn}
                  disabled={isChecking}
                  variant="primary"
                  className="mb-4"
                >
                  {isChecking ? 'Checking In...' : 'Check In Now'}
                </Button>

                <Button onPress={openQRScanner} variant="secondary" className="mb-2">
                  Scan QR Code
                </Button>

                <Button onPress={() => setMethod('totp')} variant="secondary">
                  Use Manual Code
                </Button>
              </>
            )}
          </View>
        )}

        {method === 'totp' && (
          <View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.neutral[900],
                textAlign: 'center',
              }}
              className="mb-4"
            >
              Enter Manual Code
            </Text>

            <Text
              style={{
                fontSize: typography.body.size,
                color: colors.neutral[600],
                textAlign: 'center',
              }}
              className="mb-8"
            >
              Ask the organizer for the 6-digit code
            </Text>

            <TextInput
              value={totpCode}
              onChangeText={(text) => setTotpCode(text.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="000000"
              style={{
                fontSize: 32,
                fontWeight: '700',
                textAlign: 'center',
                color: colors.neutral[900],
                backgroundColor: colors.neutral[100],
                borderRadius: 12,
                padding: 20,
                letterSpacing: 8,
              }}
              className="mb-6"
            />

            <Button
              onPress={handleTOTPCheckIn}
              disabled={isChecking || totpCode.length !== 6}
              variant="primary"
              className="mb-4"
            >
              {isChecking ? 'Verifying...' : 'Verify Code'}
            </Button>

            <Button onPress={() => setMethod('magic')} variant="secondary">
              Back to Auto Check-In
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}
