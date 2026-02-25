import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Button } from '@yombri/native-runtime';
import { colors, spacing } from '@yombri/design-tokens';
import { supabaseClient } from '@yombri/supabase-client';
import { EventCard } from '../components/EventCard';
import { useLocation } from '../hooks/useLocation';
import { useAnalytics } from '../hooks/useAnalytics';

interface Event {
  id: string;
  title: string;
  organizer_name: string;
  starts_at: string;
  location_name: string;
  description: string;
}

export function HomeScreen() {
  const router = useRouter();
  const { trackEvent } = useAnalytics();
  const { status: locationStatus, getCurrentLocation, requestPermission } = useLocation();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignaling, setIsSignaling] = useState(false);

  useEffect(() => {
    trackEvent({ type: 'feed_viewed' });
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const result = await supabaseClient.events.listEvents({ limit: 50 });
      if (result.success && result.events) {
        setEvents(result.events as Event[]);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignalInterest = async () => {
    trackEvent({ type: 'interest_started' });
    setIsSignaling(true);

    if (locationStatus !== 'granted') {
      const granted = await requestPermission();
      if (granted !== 'granted') {
        Alert.alert(
          'Location Required',
          'We need your location to signal interest in nearby events. Enable location access in Settings.',
          [{ text: 'OK' }]
        );
        setIsSignaling(false);
        return;
      }
    }

    const location = await getCurrentLocation();
    if (!location) {
      Alert.alert('Error', 'Unable to get your location. Please try again.');
      setIsSignaling(false);
      return;
    }

    try {
      const result = await supabaseClient.interestSignals.signalInterest({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (result.success) {
        trackEvent({
          type: 'interest_completed',
          location: { lat: location.coords.latitude, lng: location.coords.longitude },
        });
        Alert.alert(
          'Interest Signaled',
          'Organizers in your area will see that you are ready for action.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to signal interest');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsSignaling(false);
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
    <View className="flex-1" style={{ backgroundColor: colors.neutral[50] }}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.grid }}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.neutral[900],
                textAlign: 'center',
              }}
              className="mb-2"
            >
              No events yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.neutral[600],
                textAlign: 'center',
              }}
              className="mb-6 px-8"
            >
              Signal that you're ready for action in your area
            </Text>
            <Button
              onPress={handleSignalInterest}
              disabled={isSignaling}
              variant="primary"
            >
              {isSignaling ? 'Signaling...' : 'Signal Interest'}
            </Button>
          </View>
        }
        renderItem={({ item }) => (
          <EventCard
            title={item.title}
            organizerName={item.organizer_name}
            startTime={new Date(item.starts_at).toLocaleString()}
            location={item.location_name}
            description={item.description}
            onPress={() => {
              trackEvent({ type: 'event_viewed', eventId: item.id });
              router.push(`/events/${item.id}`);
            }}
          />
        )}
      />
    </View>
  );
}
