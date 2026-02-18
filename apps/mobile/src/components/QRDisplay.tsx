import { View, Text, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import QRCode from 'react-native-qrcode-svg';
import { colors, spacing } from '@yombri/design-tokens';
import { supabaseClient } from '@yombri/supabase-client';

interface QRDisplayProps {
  eventId: string;
}

export function QRDisplay({ eventId }: QRDisplayProps) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const mintToken = async () => {
      try {
        const result = await supabaseClient.checkin.mintEventToken(eventId);
        if (mounted) {
          if (result.success && result.token) {
            setToken(result.token);
            setError(null);
          } else {
            setError('Failed to generate QR code');
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Network error');
          setIsLoading(false);
        }
      }
    };

    mintToken();
    const interval = setInterval(mintToken, 60000); // Refresh every 60s

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [eventId]);

  if (isLoading) {
    return (
      <View className="items-center justify-center p-8">
        <ActivityIndicator size="large" color={colors.brand.emerald} />
      </View>
    );
  }

  if (error || !token) {
    return (
      <View className="items-center justify-center p-8">
        <Text style={{ color: colors.semantic.error }}>
          {error || 'Failed to load QR code'}
        </Text>
      </View>
    );
  }

  return (
    <View className="items-center p-6 rounded-lg" style={{ backgroundColor: colors.neutral[50] }}>
      <Text
        style={{
          fontSize: 12,
          color: colors.neutral[600],
          fontWeight: '600',
          letterSpacing: 1,
        }}
        className="mb-4"
      >
        SCAN TO CHECK IN
      </Text>
      
      <QRCode
        value={token}
        size={240}
        color={colors.neutral[900]}
        backgroundColor={colors.neutral[50]}
        ecl="H"
      />
      
      <Text
        style={{
          fontSize: 11,
          color: colors.neutral[500],
        }}
        className="mt-4"
      >
        Code refreshes automatically
      </Text>
    </View>
  );
}
