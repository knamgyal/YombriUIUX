import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { colors, spacing } from '@yombri/design-tokens';
import { supabaseClient } from '@yombri/supabase-client';
import { ArtifactCard } from '../components/ArtifactCard';

interface Artifact {
  id: string;
  sequence_id: number;
  event_title: string;
  created_at: string;
  theme_sponsor?: string;
}

export function ProfileScreen() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadArtifacts();
  }, []);

  const loadArtifacts = async () => {
    setIsLoading(true);
    try {
      const userId = await supabaseClient.getCurrentUserId();
      const { data, error } = await supabaseClient
        .getClient()
        .from('legacy_artifacts')
        .select(`
          id,
          sequence_id,
          created_at,
          events (
            title,
            themes (
              sponsor_name
            )
          )
        `)
        .eq('user_id', userId)
        .order('sequence_id', { ascending: false });

      if (data && !error) {
        const formatted = data.map((item: any) => ({
          id: item.id,
          sequence_id: item.sequence_id,
          event_title: item.events?.title || 'Unknown Event',
          created_at: item.created_at,
          theme_sponsor: item.events?.themes?.sponsor_name,
        }));
        setArtifacts(formatted);
      }
    } catch (err) {
      console.error('Failed to load artifacts:', err);
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
    <View className="flex-1" style={{ backgroundColor: colors.neutral[50] }}>
      <FlatList
        data={artifacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.grid }}
        ListHeaderComponent={
          <View className="mb-6">
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: colors.neutral[900],
              }}
              className="mb-2"
            >
              Your Legacy
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.neutral[600],
              }}
            >
              {artifacts.length} {artifacts.length === 1 ? 'impact' : 'impacts'} recorded
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text
              style={{
                fontSize: 16,
                color: colors.neutral[600],
                textAlign: 'center',
              }}
            >
              No impacts yet.{'\n'}Check in to your first event to start building your legacy.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ArtifactCard
            sequenceId={item.sequence_id}
            eventTitle={item.event_title}
            timestamp={item.created_at}
            themeSponsor={item.theme_sponsor}
          />
        )}
      />
    </View>
  );
}
