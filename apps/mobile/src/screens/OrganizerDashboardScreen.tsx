import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing } from '@yombri/design-tokens';
import { supabaseClient } from '@yombri/supabase-client';
import { TOTPDisplay } from '../components/TOTPDisplay';
import { QRDisplay } from '../components/QRDisplay';

export function OrganizerDashboardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [eventTitle, setEventTitle] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEventSecret();
    }
  }, [id]);

  const loadEventSecret = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseClient
        .getClient()
        .from('events')
        .select('title, secret_key')
        .eq('id', id)
        .single();

      if (data && !error) {
        setEventTitle(data.title);
        setSecretKey(data.secret_key);
      }
    } catch (err) {
      console.error('Failed to load event secret:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.neutral[900] }}>
        <ActivityIndicator size="large" color={colors.brand.emerald} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.neutral[900] }}>
      <ScrollView contentContainerStyle={{ padding: spacing.grid }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.neutral[50],
            textAlign: 'center',
          }}
          className="mb-2"
        >
          {eventTitle}
        </Text>
        
        <Text
          style={{
            fontSize: 14,
            color: colors.neutral[400],
            textAlign: 'center',
          }}
          className="mb-8"
        >
          Organizer Dashboard
        </Text>

        <View className="mb-8">
          <TOTPDisplay secretKey={secretKey} />
        </View>

        <Text
          style={{
            fontSize: 12,
            color: colors.neutral[500],
            textAlign: 'center',
            fontWeight: '600',
            letterSpacing: 1,
          }}
          className="mb-4"
        >
          OR
        </Text>

        <QRDisplay eventId={id} />

        <View 
          className="mt-8 p-4 rounded-lg"
          style={{ backgroundColor: colors.neutral[800] }}
        >
          <Text
            style={{
              fontSize: 13,
              color: colors.neutral[300],
              lineHeight: 20,
            }}
          >
            Attendees can check in by:{'\n'}
            • Scanning the QR code{'\n'}
            • Entering the 6-digit code manually{'\n'}
            • Using location if within range{'\n\n'}
            All methods work offline.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
