import { useEffect, useState } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView } from 'expo-camera';
import { useNetInfo } from '@react-native-community/netinfo';

import { Button } from '@yombri/native-runtime';
import { typography } from '@yombri/design-tokens';
import { verifyCheckin, verifyCheckinTotp } from '@yombri/supabase-client';

import { useTheme } from '../providers/ThemeProvider';
import { useLocation } from '../hooks/useLocation';
import { useCamera } from '../hooks/useCamera';
import { useAnalytics } from '../hooks/useAnalytics';

type CheckInMethod = 'magic' | 'totp' | 'qr';

export function CheckInScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const netInfo = useNetInfo();
  const { trackEvent } = useAnalytics();
  const { theme } = useTheme();

  const {
    status: locationStatus,
    getCurrentLocation,
    requestPermission: requestLocation,
  } = useLocation();

  const {
    status: cameraStatus,
    requestPermission: requestCamera,
  } = useCamera();

  const [method, setMethod] = useState<CheckInMethod>('magic');
  const [isChecking, setIsChecking] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [scanningQR, setScanningQR] = useState(false);
  const [searchingSignal, setSearchingSignal] = useState(false);

  const c = theme.colors;

  useEffect(() => {
    if (method === 'magic') {
      void initiateSignalSearch();
    }
  }, [method]);

  const initiateSignalSearch = async () => {
    setSearchingSignal(true);

    try {
      if (locationStatus !== 'granted') {
        await requestLocation();
      }
    } finally {
      setTimeout(() => setSearchingSignal(false), 2000);
    }
  };

  const handleMagicCheckIn = async () => {
    if (!eventId) {
      Alert.alert('Missing event', 'No event id was provided for check-in.');
      return;
    }

    trackEvent({ type: 'checkin_attempt', eventId, method: 'geo' });
    setIsChecking(true);

    let location = null;
    if (locationStatus === 'granted') {
      location = await getCurrentLocation();
    }

    try {
      const result = await verifyCheckin({
        eventId,
        lat: location?.coords?.latitude,
        lng: location?.coords?.longitude,
      });

      if (result.success) {
        trackEvent({
          type: 'checkin_success',
          eventId,
          method: result.offline ? 'offline' : 'geo',
        });
        router.replace(`/impact-moment?eventId=${eventId}`);
      } else {
        trackEvent({
          type: 'checkin_failure',
          eventId,
          method: 'geo',
          reason: result.error || 'unknown',
        });

        if (netInfo.isConnected === false) {
          Alert.alert(
            'Offline Check-In',
            'You appear to be offline. Check-in has been queued and will sync when you are back online.',
            [
              {
                text: 'OK',
                onPress: () =>
                  router.replace(`/impact-moment?eventId=${eventId}&offline=true`),
              },
            ]
          );
        } else {
          Alert.alert('Check-In Failed', result.error || 'Please try manual code instead.');
        }
      }
    } catch {
      Alert.alert('Error', 'Network error. Check-in has been queued for offline sync.');
      router.replace(`/impact-moment?eventId=${eventId}&offline=true`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleTOTPCheckIn = async () => {
    if (!eventId) {
      Alert.alert('Missing event', 'No event id was provided for check-in.');
      return;
    }

    if (totpCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code.');
      return;
    }

    trackEvent({ type: 'checkin_attempt', eventId, method: 'totp' });
    setIsChecking(true);

    try {
      const result = await verifyCheckinTotp({
        eventId,
        code: Number(totpCode),
        clientTime: new Date().toISOString(),
      });

      if (result.success) {
        trackEvent({ type: 'checkin_success', eventId, method: 'totp' });
        router.replace(`/impact-moment?eventId=${eventId}`);
      } else {
        trackEvent({
          type: 'checkin_failure',
          eventId,
          method: 'totp',
          reason: result.error || 'unknown',
        });

        if (result.error?.toLowerCase().includes('cooldown')) {
          Alert.alert(
            'Too Many Attempts',
            'Please wait 5 minutes before trying again.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Invalid Code', result.error || 'Please check the code and try again.');
        }
      }
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsChecking(false);
      setTotpCode('');
    }
  };

  const handleQRScan = async (data: string) => {
    if (!eventId) {
      Alert.alert('Missing event', 'No event id was provided for check-in.');
      return;
    }

    setScanningQR(false);
    trackEvent({ type: 'checkin_attempt', eventId, method: 'qr' });
    setIsChecking(true);

    try {
      const result = await verifyCheckin({
        eventId,
        eventToken: data,
      });

      if (result.success) {
        trackEvent({ type: 'checkin_success', eventId, method: 'qr' });
        router.replace(`/impact-moment?eventId=${eventId}`);
      } else {
        trackEvent({
          type: 'checkin_failure',
          eventId,
          method: 'qr',
          reason: result.error || 'unknown',
        });
        Alert.alert('Invalid QR Code', result.error || 'Please try again.');
      }
    } catch {
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
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <CameraView
          style={{ flex: 1 }}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={(result) => {
            if (result.data) {
              void handleQRScan(result.data);
            }
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 24,
            alignItems: 'center',
          }}
        >
          <Button onPress={() => setScanningQR(false)} variant="secondary">
            Cancel
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        {method === 'magic' && (
          <View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: c.onBackground,
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              {searchingSignal ? 'Searching for check-in signal...' : 'Ready to Check In'}
            </Text>

            <Text
              style={{
                fontSize: typography.body.md.fontSize,
                lineHeight: typography.body.md.lineHeight,
                color: c.onSurfaceVariant,
                textAlign: 'center',
                marginBottom: 32,
              }}
            >
              {searchingSignal
                ? 'Looking for location signal'
                : locationStatus === 'granted'
                  ? 'Tap to confirm your presence'
                  : 'Location permission required for auto check-in'}
            </Text>

            {searchingSignal ? (
              <ActivityIndicator size="large" color={c.primary} />
            ) : (
              <>
                <Button
                  onPress={handleMagicCheckIn}
                  disabled={isChecking}
                  variant="primary"
                >
                  {isChecking ? 'Checking In...' : 'Check In Now'}
                </Button>

                <View style={{ height: 12 }} />

                <Button onPress={openQRScanner} variant="secondary">
                  Scan QR Code
                </Button>

                <View style={{ height: 8 }} />

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
                color: c.onBackground,
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              Enter Manual Code
            </Text>

            <Text
              style={{
                fontSize: typography.body.md.fontSize,
                lineHeight: typography.body.md.lineHeight,
                color: c.onSurfaceVariant,
                textAlign: 'center',
                marginBottom: 32,
              }}
            >
              Ask the organizer for the 6-digit code
            </Text>

            <TextInput
              value={totpCode}
              onChangeText={(text) => setTotpCode(text.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="000000"
              placeholderTextColor={c.onSurfaceVariant}
              style={{
                fontSize: 32,
                fontWeight: '700',
                textAlign: 'center',
                color: c.onSurface,
                backgroundColor: c.surfaceVariant,
                borderRadius: 12,
                padding: 20,
                letterSpacing: 8,
                marginBottom: 24,
              }}
            />

            <Button
              onPress={handleTOTPCheckIn}
              disabled={isChecking || totpCode.length !== 6}
              variant="primary"
            >
              {isChecking ? 'Verifying...' : 'Verify Code'}
            </Button>

            <View style={{ height: 16 }} />

            <Button onPress={() => setMethod('magic')} variant="secondary">
              Back to Auto Check-In
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}

export default CheckInScreen;
