import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import { Button } from '@/src/components/primitives/Button';
import { UserActionButtons } from '@/src/components/UserActionButtons';
import { EventDetailScreen } from '../../src/screens/EventDetailScreen';
import { getSupabaseClient } from '@yombri/supabase-client';
import type { Event } from '@yombri/supabase-client';

interface EnhancedEventDetailProps {
  event: Event;
  isOrganizer: boolean;
  isParticipant: boolean;
  organizerProfile?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  isFollowingOrganizer?: boolean;
}

export default function EnhancedEventDetail() {
  const { id: eventId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [organizerProfile, setOrganizerProfile] = useState<any>(null);
  const [isFollowingOrganizer, setIsFollowingOrganizer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    const client = getSupabaseClient();
    const userId = await client.auth.getUser().then(({ data }) => data.user?.id);

    // Load event with organizer profile
    const { data: eventData } = await client
      .from('events')
      .select(`
        *,
        profiles:organizer_id (
          id,
          full_name,
          avatar_url
        ),
        event_participants (
          user_id,
          status
        )
      `)
      .eq('id', eventId)
      .single();

    if (eventData) {
      setEvent(eventData);
      setIsOrganizer(eventData.organizer_id === userId);
      setOrganizerProfile(eventData.profiles);

      const participant = eventData.event_participants?.find(
        (p: any) => p.user_id === userId
      );
      setIsParticipant(!!participant);

      // Check follow status (simplified)
      setIsFollowingOrganizer(false); // Fetch from follows table in prod
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading event...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <Text>Event not found</Text>
        <Button onPress={() => router.back()}>Back</Button>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Event header */}
      <View className="p-6 border-b bg-gradient-to-b from-muted to-background">
        <Text className="text-2xl font-bold mb-2">{event.title}</Text>
        <Text className="text-muted-foreground mb-4">{event.description}</Text>
        
        {/* Organizer info + Phase 4.3 actions */}
        {organizerProfile && (
          <View className="mb-6 p-4 bg-muted rounded-xl">
            <Text className="font-semibold mb-1">Organized by</Text>
            <Text className="text-lg mb-2">{organizerProfile.full_name}</Text>
            {!isOrganizer && (
              <UserActionButtons
                userId={organizerProfile.id}
                isFollowing={isFollowingOrganizer || false}
                onFollowChange={setIsFollowingOrganizer}
              />
            )}
          </View>
        )}
      </View>

      {/* Logistics (Phase 3 preserved) */}
      <View className="p-6 space-y-4">
        <View>
          <Text className="text-lg font-semibold mb-2">What to bring</Text>
          <Text>{event.what_to_bring || 'Your presence'}</Text>
        </View>
        
        <View>
          <Text className="text-lg font-semibold mb-2">If you don't show</Text>
          <Text>{event.flake_policy || 'No-shows impact organizer trust signals'}</Text>
        </View>
      </View>

      {/* Action buttons */}
      <View className="p-6 space-y-3">
        {isOrganizer ? (
          <Button 
            className="w-full mb-3"
            onPress={() => router.push(`/admin/event-dashboard?eventId=${eventId}`)}
          >
            Dashboard (TOTP/QR)
          </Button>
        ) : (
          <>
            <Button 
              className="w-full mb-3"
              onPress={() => router.push(`/checkin?eventId=${eventId}`)}
              disabled={isParticipant}
            >
              {isParticipant ? 'Checked In ✓' : 'Check In'}
            </Button>
            
            {/* NEW Phase 4.2: Group Chat */}
            <Button 
              variant="outline"
              className="w-full"
              onPress={() => router.push(`/chat?eventId=${eventId}`)}
              disabled={!isParticipant}
            >
              Group Chat
            </Button>
          </>
        )}
      </View>
    </ScrollView>
  );
}
