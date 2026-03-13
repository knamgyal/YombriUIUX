import { useEffect, useState } from 'react';
import { View, FlatList, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '@/src/components/primitives/Button';
import TOTPDisplay from '@/src/components/TOTPDisplay';
import QRDisplay from '@/src/components/QRDisplay';
import { EjectButton } from '@/src/components/EjectButton';
import { getSupabaseClient } from '@yombri/supabase-client';

type ParticipantRow = {
  event_id: string;
  user_id: string;
  status: string;
  checked_in_at?: string | null;
};

export default function EnhancedOrganizerDashboard() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();

  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadParticipants = async () => {
    if (!eventId) {
      setParticipants([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('event_participants')
        .select('event_id, user_id, status, checked_in_at')
        .eq('event_id', eventId)
        .eq('status', 'joined')
        .order('checked_in_at', { ascending: false });

      if (error) {
        console.error('Failed to load participants:', error);
        setParticipants([]);
      } else {
        setParticipants((data ?? []) as ParticipantRow[]);
      }
    } catch (err) {
      console.error('Failed to load participants:', err);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadParticipants();
  }, [eventId]);

  const handleEjectSuccess = () => {
    Alert.alert('Ejected', 'Participant removed from event.');
    void loadParticipants();
  };

  if (!eventId) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text>Missing eventId</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 24, borderBottomWidth: 1 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 24 }}>
          Event Dashboard
        </Text>

        <TOTPDisplay eventId={eventId} />
        <View style={{ height: 16 }} />
        <QRDisplay eventId={eventId} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ padding: 16, borderBottomWidth: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>
            Participants ({participants.length})
          </Text>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Loading participants...</Text>
          </View>
        ) : (
          <FlatList
            data={participants}
            keyExtractor={(item) => item.user_id}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 16,
                  borderBottomWidth: 1,
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{ fontWeight: '600', fontSize: 16 }}>
                    User {item.user_id.slice(-6)}
                  </Text>
                  <Text style={{ fontSize: 14, opacity: 0.7 }}>
                    Checked in:{' '}
                    {item.checked_in_at
                      ? new Date(item.checked_in_at).toLocaleString()
                      : 'Pending'}
                  </Text>
                </View>

                <EjectButton
                  eventId={eventId}
                  userId={item.user_id}
                  userName={`User ${item.user_id.slice(-6)}`}
                  onEject={handleEjectSuccess}
                />
              </View>
            )}
            ListEmptyComponent={
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
                <Text>No participants yet</Text>
              </View>
            }
          />
        )}
      </View>

      <View style={{ padding: 16, borderTopWidth: 1 }}>
        <Button
          style={{ width: '100%' }}
          onPress={() => router.push(`/(tabs)/chat?eventId=${eventId}`)}
          disabled={!participants.length}
        >
          Open Group Chat
        </Button>
      </View>
    </View>
  );
}
