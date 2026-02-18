import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '@yombri/native-runtime';
import { colors, spacing, typography } from '@yombri/design-tokens';
import { supabaseClient } from '@yombri/supabase-client';
import { useAnalytics } from '../hooks/useAnalytics';

interface EventDetail {
  id: string;
  title: string;
  description: string;
  organizer_id: string;
  organizer_name: string;
  starts_at: string;
  ends_at: string;
  location_name: string;
  what_to_bring?: string;
  cancellation_policy?: string;
}

export function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trackEvent } = useAnalytics();
  
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    setIsLoading(true);
    try {
      const userId = await supabaseClient.getCurrentUserId();
      
      const result = await supabaseClient.events.getEventById(id);
      if (result.success && result.event) {
        const eventData = result.event as EventDetail;
        setEvent(eventData);
        setIsOrganizer(userId === eventData.organizer_id);
        
        // Check if user has joined
        const { data: participation } = await supabaseClient
          .getClient()
          .from('event_participants')
          .select('status')
          .eq('event_id', id)
          .eq('user_id', userId)
          .single();
        
        setHasJoined(participation?.status === 'confirmed');
      }
    } catch (err) {
      console.error('Failed to load event:', err);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    try {
      const { error } = await supabaseClient
        .getClient()
        .from('event_participants')
        .insert({
          event_id: id,
          user_id: await supabaseClient.getCurrentUserId(),
          status: 'confirmed',
        });

      if (!error) {
        trackEvent({ type: 'event_joined', eventId: id });
        setHasJoined(true);
        Alert.alert('Success', 'You've joined this event!');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to join event');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.neutral[50] }}>
        <ActivityIndicator size="large" color={colors.brand.emerald} />
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.neutral[50] }}>
        <Text style={{ color: colors.semantic.error }}>Event not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.neutral[50] }}>
      <ScrollView contentContainerStyle={{ padding: spacing.grid }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: colors.neutral[900],
          }}
          className="mb-2"
        >
          {event.title}
        </Text>

        <Text
          style={{
            fontSize: typography.body.size,
            color: colors.neutral[600],
          }}
          className="mb-6"
        >
          Organized by {event.organizer_name}
        </Text>

        <View className="mb-6">
          <SectionHeader title="When" />
          <Text style={{ fontSize: typography.body.size, color: colors.neutral[800] }}>
            {new Date(event.starts_at).toLocaleString()} -{' '}
            {new Date(event.ends_at).toLocaleString()}
          </Text>
        </View>

        <View className="mb-6">
          <SectionHeader title="Where" />
          <Text style={{ fontSize: typography.body.size, color: colors.neutral[800] }}>
            {event.location_name}
          </Text>
        </View>

        <View className="mb-6">
          <SectionHeader title="About" />
          <Text style={{ fontSize: typography.body.size, color: colors.neutral[800] }}>
            {event.description}
          </Text>
        </View>

        {event.what_to_bring && (
          <View className="mb-6">
            <SectionHeader title="What to bring" />
            <Text style={{ fontSize: typography.body.size, color: colors.neutral[800] }}>
              {event.what_to_bring}
            </Text>
          </View>
        )}

        <View className="mb-6">
          <SectionHeader title="What happens if I don't show?" />
          <Text style={{ fontSize: typography.body.size, color: colors.neutral[800] }}>
            {event.cancellation_policy || 
              'No formal penalties. We trust you to honor your commitment, but understand that life happens.'}
          </Text>
        </View>
      </ScrollView>

      <View 
        className="p-4"
        style={{ 
          borderTopWidth: 1, 
          borderTopColor: colors.neutral[200],
          backgroundColor: colors.neutral[50],
        }}
      >
        {isOrganizer ? (
          <Button
            onPress={() => router.push(`/admin/event-dashboard?id=${id}`)}
            variant="primary"
          >
            Open Dashboard
          </Button>
        ) : hasJoined ? (
          <Button
            onPress={() => router.push(`/checkin?eventId=${id}`)}
            variant="primary"
          >
            Check In
          </Button>
        ) : (
          <Button onPress={handleJoinEvent} variant="primary">
            Join Event
          </Button>
        )}
      </View>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: '600',
        color: colors.neutral[500],
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}
      className="mb-2"
    >
      {title}
    </Text>
  );
}
