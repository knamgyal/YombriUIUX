import { View, Text, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import QRCode from 'react-native-qrcode-svg';
import { mintEventToken } from '@yombri/supabase-client';
import { useTheme } from '../providers/ThemeProvider';

type Props = { eventId: string };

export default function QRDisplay({ eventId }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function mint() {
      try {
        const t = await mintEventToken({ eventId });
        if (!mounted) return;

        setToken(t.token);
        setError(null);
      } catch (e: any) {
        if (!mounted) return;

        setError(e?.message ?? 'Failed to generate QR code');
      } finally {
        if (!mounted) return;

        setIsLoading(false);
      }
    }

    void mint();

    const interval = setInterval(() => {
      void mint();
    }, 60_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [eventId]);

  if (isLoading) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (error || !token) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: c.onSurfaceVariant, textAlign: 'center' }}>
          {error ?? 'Failed to load QR code'}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        alignItems: 'center',
        padding: 24,
        borderRadius: 12,
        backgroundColor: c.surface,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          color: c.onSurfaceVariant,
          fontWeight: '600',
          letterSpacing: 1,
          marginBottom: 16,
        }}
      >
        SCAN TO CHECK IN
      </Text>

      <QRCode
        value={token}
        size={240}
        color={c.onSurface}
        backgroundColor={c.surface}
        ecl="H"
      />

      <Text
        style={{
          fontSize: 11,
          color: c.onSurfaceVariant,
          marginTop: 16,
        }}
      >
        Code refreshes automatically
      </Text>
    </View>
  );
}
