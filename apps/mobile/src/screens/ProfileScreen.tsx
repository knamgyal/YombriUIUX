import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import {
  getCurrentUserId,
  getSupabaseClient,
  getEventsByOrganizer,
  getUserArtifacts,
  getOfflineQueue,
} from '@yombri/supabase-client';

import { useTheme } from '../../src/providers/ThemeProvider';

type UserProfile = {
  id: string;
  handle: string | null;
  display_name: string | null;
  created_at?: string | null;
};

type ParticipantEvent = {
  event_id: string;
  status: 'joined' | 'checked_in' | 'ejected' | string;
  checked_in_at?: string | null;
  created_at?: string | null;
  event?: {
    id: string;
    title: string;
    description?: string | null;
    starts_at: string;
    ends_at?: string | null;
    address_label?: string | null;
  } | null;
};

type OrganizerEvent = {
  id: string;
  title: string;
  description?: string | null;
  starts_at: string;
  ends_at?: string | null;
  address_label?: string | null;
};

type Artifact = {
  id: string;
  event_id: string;
  sequence_id: number;
  created_at: string;
  payload: Record<string, unknown>;
  previous_hash?: string | null;
};

type OfflineQueueItem = {
  id: string;
  retryCount?: number;
  payload?: {
    event_id?: string;
    method?: string;
    occurred_at?: string;
  };
};

type Palette = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  divider: string;
  text: string;
  textMuted: string;
  textSoft: string;
  primary: string;
  primaryText: string;
  danger: string;
  avatarBg: string;
  statBg: string;
};

function formatDate(date?: string | null) {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleString();
  } catch {
    return '—';
  }
}

function isUpcoming(date?: string | null) {
  if (!date) return false;
  return new Date(date).getTime() >= Date.now();
}

function getPalette(themeApi: any): Palette {
  const colors = themeApi?.theme?.colors ?? themeApi?.colors ?? {};

  return {
    bg: colors.background ?? '#0B1020',
    surface: colors.card ?? colors.surface ?? '#121A30',
    surfaceAlt: colors.surfaceAlt ?? colors.elevated ?? '#16203A',
    border: colors.border ?? '#1E2947',
    divider: colors.divider ?? '#263252',
    text: colors.text ?? '#FFFFFF',
    textMuted: colors.textMuted ?? '#9BA7C2',
    textSoft: colors.textSoft ?? '#7F8AA3',
    primary: colors.primary ?? '#5B7FFF',
    primaryText: colors.primaryText ?? '#FFFFFF',
    danger: colors.danger ?? '#FF7A7A',
    avatarBg: colors.avatarBg ?? colors.primaryMuted ?? '#31406B',
    statBg: colors.statBg ?? 'transparent',
  };
}

function Section({
  title,
  right,
  children,
  styles,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {right}
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Stat({
  label,
  value,
  styles,
}: {
  label: string;
  value: string | number;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Row({
  title,
  subtitle,
  rightText,
  onPress,
  danger,
  styles,
}: {
  title: string;
  subtitle?: string;
  rightText?: string;
  onPress?: () => void;
  danger?: boolean;
  styles: ReturnType<typeof createStyles>;
}) {
  const content = (
    <View style={styles.row}>
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, danger && styles.dangerText]}>{title}</Text>
        {!!subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      {!!rightText && <Text style={styles.rowRight}>{rightText}</Text>}
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const themeApi = useTheme() as any;
  const insets = useSafeAreaInsets();
  const palette = useMemo(() => getPalette(themeApi), [themeApi]);
  const styles = useMemo(() => createStyles(palette, insets.top, insets.bottom), [palette, insets.top, insets.bottom]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [participantEvents, setParticipantEvents] = useState<ParticipantEvent[]>([]);
  const [organizerEvents, setOrganizerEvents] = useState<OrganizerEvent[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([]);
  const [groupCount, setGroupCount] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);
  const [locationStatus, setLocationStatus] = useState<'granted' | 'denied' | 'undetermined'>(
    'undetermined'
  );

  const client = useMemo(() => getSupabaseClient(), []);

  const loadProfile = useCallback(async () => {
    const currentUserId = await getCurrentUserId();
    setUserId(currentUserId);

    const [
      profileRes,
      participantRes,
      organizerRes,
      artifactsRes,
      offlineRes,
      groupCountRes,
      blockedRes,
      locationPerm,
    ] = await Promise.all([
      client
        .from('users')
        .select('id, handle, display_name, created_at')
        .eq('id', currentUserId)
        .single(),

      client
        .from('event_participants')
        .select(
          `
          event_id,
          status,
          checked_in_at,
          created_at,
          event:events (
            id,
            title,
            description,
            starts_at,
            ends_at,
            address_label
          )
        `
        )
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false }),

      getEventsByOrganizer(currentUserId),
      getUserArtifacts(currentUserId),
      getOfflineQueue(),

      client
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUserId),

      client
        .from('user_blocks')
        .select('*', { count: 'exact', head: true })
        .eq('blocker_id', currentUserId),

      Location.getForegroundPermissionsAsync(),
    ]);

    if (profileRes.error) throw profileRes.error;
    if (participantRes.error) throw participantRes.error;

    setProfile(profileRes.data as UserProfile);
    setParticipantEvents((participantRes.data as ParticipantEvent[]) ?? []);
    setOrganizerEvents((organizerRes as OrganizerEvent[]) ?? []);
    setArtifacts((artifactsRes as Artifact[]) ?? []);
    setOfflineQueue((offlineRes as OfflineQueueItem[]) ?? []);
    setGroupCount(groupCountRes.count ?? 0);
    setBlockedCount(blockedRes.count ?? 0);
    setLocationStatus(
      locationPerm.status === 'granted'
        ? 'granted'
        : locationPerm.status === 'denied'
        ? 'denied'
        : 'undetermined'
    );
  }, [client]);

  const loadAll = useCallback(async () => {
    try {
      await loadProfile();
    } catch (error: any) {
      Alert.alert('Profile load failed', error?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadProfile]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAll();
  }, [loadAll]);

  const upcomingEvents = participantEvents.filter((item) => isUpcoming(item.event?.starts_at));
  const pastEvents = participantEvents.filter(
    (item) => item.event?.starts_at && !isUpcoming(item.event?.starts_at)
  );
  const checkedInCount = participantEvents.filter((item) => item.status === 'checked_in').length;
  const organizerCount = organizerEvents.length;

  const handleEditProfile = useCallback(() => {
    router.push('/(tabs)/profile/edit');
  }, []);


  const handleBlockedUsers = useCallback(() => {
    Alert.alert('Blocked users', 'Hook this into a blocked-users list screen.');
  }, []);

  const handleOfflineQueue = useCallback(() => {
    Alert.alert('Offline queue', 'Hook this into your pending sync details screen.');
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Sign out failed', error?.message ?? 'Please try again.');
    }
  }, [client]);

  if (loading) {
    return (
      <View style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.loadingText}>Loading profile…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.primary} />}
      >
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.display_name?.[0] || profile?.handle?.[0] || 'Y').toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name}>{profile?.display_name || 'Your profile'}</Text>
          <Text style={styles.handle}>@{profile?.handle || 'set-your-handle'}</Text>
          <Text style={styles.meta}>Member since {formatDate(profile?.created_at)}</Text>

          <TouchableOpacity style={styles.primaryButton} onPress={handleEditProfile}>
            <Text style={styles.primaryButtonText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        <Section title="At a glance" styles={styles}>
          <View style={styles.statsRow}>
            <Stat label="Joined" value={participantEvents.length} styles={styles} />
            <Stat label="Checked in" value={checkedInCount} styles={styles} />
            <Stat label="Groups" value={groupCount} styles={styles} />
            <Stat label="Organized" value={organizerCount} styles={styles} />
          </View>
        </Section>

        <Section
          title="My events"
          right={<Text style={styles.sectionHint}>{upcomingEvents.length} upcoming</Text>}
          styles={styles}
        >
          {participantEvents.length === 0 ? (
            <Text style={styles.emptyText}>No event activity yet.</Text>
          ) : (
            <>
              {upcomingEvents.slice(0, 3).map((item) => (
                <Row
                  key={`upcoming-${item.event_id}`}
                  title={item.event?.title || 'Untitled event'}
                  subtitle={`${formatDate(item.event?.starts_at)} • ${item.event?.address_label || 'No location label'}`}
                  rightText={item.status}
                  styles={styles}
                />
              ))}

              {pastEvents.slice(0, 3).map((item) => (
                <Row
                  key={`past-${item.event_id}`}
                  title={item.event?.title || 'Untitled event'}
                  subtitle={`Checked in ${formatDate(item.checked_in_at || item.created_at)}`}
                  rightText={item.status}
                  styles={styles}
                />
              ))}
            </>
          )}
        </Section>

        <Section title="Organizer tools" styles={styles}>
          {organizerEvents.length === 0 ? (
            <Text style={styles.emptyText}>You are not organizing any events yet.</Text>
          ) : (
            organizerEvents.slice(0, 5).map((event) => (
              <Row
                key={event.id}
                title={event.title}
                subtitle={`${formatDate(event.starts_at)} • ${event.address_label || 'No location label'}`}
                rightText="Manage"
                styles={styles}
              />
            ))
          )}
        </Section>

        <Section
          title="Artifacts"
          right={<Text style={styles.sectionHint}>{artifacts.length} total</Text>}
          styles={styles}
        >
          {artifacts.length === 0 ? (
            <Text style={styles.emptyText}>No legacy artifacts yet.</Text>
          ) : (
            artifacts.slice(0, 5).map((artifact) => (
              <Row
                key={artifact.id}
                title={`Artifact #${artifact.sequence_id}`}
                subtitle={formatDate(artifact.created_at)}
                rightText={String(artifact.payload?.action || 'entry')}
                styles={styles}
              />
            ))
          )}
        </Section>

        <Section title="Offline activity" styles={styles}>
          <Row
            title="Pending check-ins"
            subtitle={
              offlineQueue.length > 0
                ? `${offlineQueue.length} item(s) waiting to sync`
                : 'Everything is synced'
            }
            rightText={offlineQueue.length > 0 ? 'Review' : 'Clear'}
            onPress={handleOfflineQueue}
            styles={styles}
          />
          {offlineQueue.slice(0, 3).map((item) => (
            <Row
              key={item.id}
              title={item.payload?.event_id || 'Unknown event'}
              subtitle={`Retries: ${item.retryCount ?? 0}`}
              rightText={item.payload?.method || 'offline'}
              styles={styles}
            />
          ))}
        </Section>

        <Section title="Privacy & safety" styles={styles}>
          <Row
            title="Blocked users"
            subtitle="Manage who can interact with you"
            rightText={String(blockedCount)}
            onPress={handleBlockedUsers}
            styles={styles}
          />
          <Row
            title="Location permission"
            subtitle="Used for geofence check-ins"
            rightText={locationStatus}
            styles={styles}
          />
        </Section>

        <Section title="Account" styles={styles}>
          <Row title="User ID" subtitle={userId || '—'} styles={styles} />
          <Row
            title="Sign out"
            subtitle="End this session on this device"
            onPress={handleSignOut}
            danger
            styles={styles}
          />
        </Section>
      </ScrollView>
    </View>
  );
}

function createStyles(colors: Palette, insetTop: number, insetBottom: number) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    container: {
      paddingTop: Math.max(insetTop, 12),
      paddingHorizontal: 16,
      paddingBottom: Math.max(insetBottom + 24, 40),
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    loadingText: {
      marginTop: 12,
      color: colors.textMuted,
      fontSize: 15,
    },
    heroCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 20,
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: colors.avatarBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    avatarText: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '700',
    },
    name: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '700',
      textAlign: 'center',
    },
    handle: {
      color: colors.textMuted,
      fontSize: 15,
      marginTop: 4,
    },
    meta: {
      color: colors.textSoft,
      fontSize: 13,
      marginTop: 6,
      marginBottom: 14,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
    },
    primaryButtonText: {
      color: colors.primaryText,
      fontWeight: '600',
    },
    section: {
      marginBottom: 16,
    },
    sectionHeader: {
      marginBottom: 8,
      paddingHorizontal: 2,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    sectionHint: {
      color: colors.textMuted,
      fontSize: 12,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    statsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    statItem: {
      width: '25%',
      paddingVertical: 18,
      alignItems: 'center',
      backgroundColor: colors.statBg,
    },
    statValue: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
    },
    statLabel: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 4,
    },
    row: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowBody: {
      flex: 1,
      paddingRight: 12,
    },
    rowTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    rowSubtitle: {
      color: colors.textMuted,
      fontSize: 13,
      marginTop: 4,
    },
    rowRight: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    emptyText: {
      color: colors.textMuted,
      padding: 16,
      fontSize: 14,
    },
    dangerText: {
      color: colors.danger,
    },
  });
}
