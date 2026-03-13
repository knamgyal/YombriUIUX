import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { colors, spacing } from "@yombri/design-tokens";
import { getSupabaseClient } from "@yombri/supabase-client";
import TOTPDisplay from "../components/TOTPDisplay";
import QRDisplay from "../components/QRDisplay";

export function OrganizerDashboardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = id as string;

  const [eventTitle, setEventTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadEvent() {
      setIsLoading(true);
      try {
        const client = getSupabaseClient();
        const { data, error } = await client.from("events").select("title").eq("id", eventId).single();
        if (!mounted) return;
        if (error) throw error;
        setEventTitle(data?.title ?? "");
      } catch (e) {
        if (!mounted) return;
        setEventTitle("");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    }

    if (eventId) loadEvent();
    return () => {
      mounted = false;
    };
  }, [eventId]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.neutral900 }}>
        <ActivityIndicator size="large" color={colors.brand.emerald} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.neutral900 }}>
      <ScrollView contentContainerStyle={{ padding: spacing.grid }}>
        <Text style={{ fontSize: 24, fontWeight: 700, color: colors.neutral50, textAlign: "center" }} className="mb-2">
          {eventTitle}
        </Text>
        <Text style={{ fontSize: 14, color: colors.neutral400, textAlign: "center" }} className="mb-8">
          Organizer Dashboard
        </Text>

        <View className="mb-8">
          <TOTPDisplay eventId={eventId} />
        </View>

        <Text style={{ fontSize: 12, color: colors.neutral500, textAlign: "center", fontWeight: 600, letterSpacing: 1 }} className="mb-4">
          OR
        </Text>

        <QRDisplay eventId={eventId} />
      </ScrollView>
    </View>
  );
}
