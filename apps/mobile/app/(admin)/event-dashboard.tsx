import { useEffect, useState } from 'react';
import { View, FlatList, Text, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '@/src/components/primitives/Button';
import { TOTPDisplay } from '@/src/components/TOTPDisplay';
import { QRDisplay } from '@/src/components/QRDisplay';
import { EjectButton } from '@/src/components/EjectButton';
import { OrganizerDashboardScreen } from '../../src/screens/OrganizerDashboardScreen';
import { getSupabaseClient } from '@yombri/supabase-client';
import type { SupabaseParticipant } from '@yombri/supabase-client'; // Assuming participant type

// Enhanced dashboard with ejection (Phase 4.4)
export default function EnhancedOrganizerDashboard() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [participants, setParticipants] = useState<SupabaseParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  const loadParticipants = async () => {
    if (!eventId) return;
    
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('event_participants')
      .select(`
        *,
        profiles!user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('event_id', eventId)
      .eq('status', 'joined')
      .order('checked_in_at', { ascending: false });

    if (error) {
      console.error('Failed to load participants:', error);
    } else {
      setParticipants(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadParticipants();
  }, [eventId]);

  const handleEjectSuccess = () => {
    Alert.alert('Ejected', 'Participant removed from event.');
    loadParticipants();
  };

  return (
    <View className="flex-1 bg-background">
      {/* Existing Phase 3: TOTP + QR */}
      <View className="p-6 bg-muted/50 border-b">
        <Text className="text-2xl font-bold text-center mb-6">Event Dashboard</Text>
        <TOTPDisplay eventId={eventId as string} />
        <QRDisplay eventId={eventId as string} />
      </View>

      {/* NEW Phase 4.4: Participants + Eject */}
      <View className="flex-1">
        <View className="p-4 border-b">
          <Text className="text-lg font-semibold">
            Participants ({participants.length})
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <Text>Loading participants...</Text>
          </View>
        ) : (
          <FlatList
            data={participants}
            keyExtractor={(item) => item.user_id}
            renderItem={({ item }) => (
              <View className="flex-row items-center justify-between p-4 border-b">
                <View className="flex-1">
                  <Text className="font-semibold text-base">
                    {item.profiles?.full_name || `User ${item.user_id.slice(-6)}`}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Checked in: {item.checked_in_at ? 
                      new Date(item.checked_in_at).toLocaleString() : 
                      'Pending'
                    }
                  </Text>
                </View>
                <EjectButton
                  eventId={eventId as string}
                  userId={item.user_id}
                  userName={item.profiles?.full_name || 'Attendee'}
                  onEject={handleEjectSuccess}
                />
              </View>
            )}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center p-8">
                <Text className="text-muted-foreground">No participants yet</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Navigation to chat */}
      <View className="p-4 bg-background border-t">
        <Button 
          className="w-full"
          onPress={() => {
            // Navigate to event chat
            // router.push(`/chat?eventId=${eventId}`);
          }}
          disabled={!participants.length}
        >
          Open Group Chat
        </Button>
      </View>
    </View>
  );
}
