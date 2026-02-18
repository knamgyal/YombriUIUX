import { View, Text, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '@yombri/native-runtime';
import { colors, spacing } from '@yombri/design-tokens';
import { supabaseClient } from '@yombri/supabase-client';
import { useAnalytics } from '../hooks/useAnalytics';

interface EventData {
  title: string;
  theme_sponsor?: string;
}

export function ImpactMomentScreen() {
  const router = useRouter();
  const { eventId, offline } = useLocalSearchParams<{ eventId: string; offline?: string }>();
  const { trackEvent } = useAnalytics();
  
  const [event, setEvent] = useState<EventData | null>(null);
  const [artifactId, setArtifactId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEventAndCreateArtifact();
  }, [eventId]);

  const loadEventAndCreateArtifact = async () => {
    setIsLoading(true);
    
    try {
      // Load event data
      const eventResult = await supabaseClient.events.getEventById(eventId);
      if (eventResult.success && eventResult.event) {
        setEvent(eventResult.event as EventData);
      }

      // Create artifact (if online)
      if (offline !== 'true') {
        const artifactResult = await supabaseClient.artifacts.appendArtifact({
          eventId,
          payload: {
            type: 'event_participation',
            timestamp: new Date().toISOString(),
          },
        });

        if (artifactResult.success && artifactResult.artifact) {
          const newArtifactId = artifactResult.artifact.id;
          setArtifactId(newArtifactId);
          trackEvent({ 
            type: 'artifact_created', 
            eventId, 
            artifactId: newArtifactId 
          });
        }
      }
    } catch (err) {
      console.error('Failed to create impact moment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.neutral[50] }}>
        <ActivityIndicator size="large" color={colors.brand.emerald} />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.neutral[50], padding: spacing.grid }}>
      <View 
        className="w-20 h-20 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: colors.brand.emerald + '20' }}
      >
        <Text style={{ fontSize: 40 }}>✓</Text>
      </View>

      <Text
        style={{
          fontSize: 28,
          fontWeight: '700',
          color: colors.neutral[900],
          textAlign: 'center',
        }}
        className="mb-4"
      >
        You were there
      </Text>

      {offline === 'true' ? (
        <Text
          style={{
            fontSize: 16,
            color: colors.neutral[600],
            textAlign: 'center',
          }}
          className="mb-8"
        >
          Check-in recorded. Will sync when online.
        </Text>
      ) : (
        <Text
          style={{
            fontSize: 16,
            color: colors.neutral[600],
            textAlign: 'center',
          }}
          className="mb-8"
        >
          Thanks for showing up{event?.title ? ` to ${event.title}` : ''}.
        </Text>
      )}

      {event?.theme_sponsor && (
        <View 
          className="p-4 rounded-lg mb-8"
          style={{ backgroundColor: colors.neutral[100] }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.neutral[500],
              letterSpacing: 1,
              textAlign: 'center',
            }}
            className="mb-1"
          >
            ENABLED BY
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.neutral[800],
              textAlign: 'center',
            }}
          >
            {event.theme_sponsor}
          </Text>
        </View>
      )}

      <Button
        onPress={() => router.replace('/profile')}
        variant="primary"
      >
        View Your Legacy
      </Button>
    </View>
  );
}
