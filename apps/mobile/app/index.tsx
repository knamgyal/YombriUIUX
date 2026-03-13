import React from 'react';
import { Link } from 'expo-router';
import { SafeAreaView, View, Text, Pressable } from 'react-native';

const TEST_EVENT_ID = 'PUT_REAL_EVENT_ID_HERE';

function LaunchButton({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href as any} asChild>
      <Pressable
        style={{
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 12,
          backgroundColor: '#111827',
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>{label}</Text>
      </Pressable>
    </Link>
  );
}

export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F1419' }}>
      <View style={{ flex: 1, padding: 20, gap: 16, justifyContent: 'center' }}>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: '700' }}>
          Phase 4 Test Launcher
        </Text>

        <LaunchButton label="Impact Home" href="/(tabs)" />
        <LaunchButton label="Event Detail" href={`/(tabs)/events/${TEST_EVENT_ID}`} />
        <LaunchButton label="Event Chat" href={`/(tabs)/chat?eventId=${TEST_EVENT_ID}`} />
        <LaunchButton label="Check-in" href={`/checkin?eventId=${TEST_EVENT_ID}`} />
        <LaunchButton
          label="Organizer Dashboard"
          href={`/(admin)/event-dashboard?eventId=${TEST_EVENT_ID}`}
        />
      </View>
    </SafeAreaView>
  );
}
