// apps/mobile/src/screens/EventDetailScreen.tsx
import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { spacing, radius, typography } from "@yombri/design-tokens";
import { useTheme } from "../providers/ThemeProvider";

import { Button } from "../components/primitives/Button";
import { ListItem } from "../components/primitives/ListItem";

type Params = { id?: string | string[] };

type EventDetail = {
  id: string;
  title: string;
  description: string;
  organizerName: string;
  startsAtLabel: string;
  endsAtLabel: string;
  locationName: string;
  whatToBring?: string;
  cancellationPolicy?: string;
};

function normalizeId(id?: string | string[]) {
  if (typeof id === "string") return id;
  if (Array.isArray(id)) return id[0];
  return undefined;
}

export function EventDetailScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams<Params>();

  const eventId = normalizeId(params.id);

  // Phase 1: static placeholder data only (no backend).
  const event: EventDetail | null = useMemo(() => {
    if (!eventId) return null;

    return {
      id: eventId,
      title: "Community Event",
      description:
        "This is a Phase 1 placeholder screen to validate tokens, primitives, and theme runtime. Backend content will be connected in Phase 2.",
      organizerName: "Organizer",
      startsAtLabel: "TBD",
      endsAtLabel: "TBD",
      locationName: "TBD (set in Phase 2)",
      whatToBring: "TBD",
      cancellationPolicy:
        "No formal penalties. We trust you to honor your commitment, but understand that life happens.",
    };
  }, [eventId]);

  const c = theme.colors;
  const outline = c.outline ?? c.surfaceVariant;

  if (!event) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.background,
          justifyContent: "center",
          alignItems: "center",
          padding: spacing.gap.lg,
        }}
      >
        <Text
          style={{
            fontFamily: typography.body.md.fontFamily,
            fontSize: typography.body.md.fontSize,
            lineHeight: typography.body.md.lineHeight,
            fontWeight: typography.body.md.fontWeight as unknown as "400",
            color: c.onBackground,
            textAlign: "center",
          }}
        >
          Event not found (missing id)
        </Text>

        <View style={{ height: spacing.gap.md }} />

        <Button variant="secondary" onPress={() => router.back()}>
          Go back
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.screen.xs,
          paddingVertical: spacing.gap.lg,
          gap: spacing.gap.lg,
        }}
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: c.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: outline,
            padding: spacing.gap.lg,
            gap: spacing.gap.sm,
          }}
        >
          <Text
            style={{
              fontFamily: typography.heading.md.fontFamily,
              fontSize: typography.heading.md.fontSize,
              lineHeight: typography.heading.md.lineHeight,
              fontWeight: typography.heading.md.fontWeight as unknown as "700",
              color: c.onSurface,
            }}
          >
            {event.title}
          </Text>

          <Text
            style={{
              fontFamily: typography.body.md.fontFamily,
              fontSize: typography.body.md.fontSize,
              lineHeight: typography.body.md.lineHeight,
              fontWeight: typography.body.md.fontWeight as unknown as "400",
              color: c.onSurfaceVariant,
            }}
          >
            Organized by {event.organizerName}
          </Text>

          <Text
            style={{
              fontFamily: typography.label.sm.fontFamily,
              fontSize: typography.label.sm.fontSize,
              lineHeight: typography.label.sm.lineHeight,
              fontWeight: typography.label.sm.fontWeight as unknown as "400",
              color: c.onSurfaceVariant,
            }}
          >
            Event ID: {event.id}
          </Text>
        </View>

        {/* Sections */}
        <View style={{ gap: spacing.gap.md }}>
          <ListItem
            title="When"
            subtitle={`${event.startsAtLabel} — ${event.endsAtLabel}`}
            onPress={() => {}}
          />

          <ListItem
            title="Where"
            subtitle={event.locationName}
            onPress={() => {}}
          />

          <View
            style={{
              backgroundColor: c.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: outline,
              padding: spacing.gap.lg,
              gap: spacing.gap.sm,
            }}
          >
            <Text
              style={{
                fontFamily: typography.label.md.fontFamily,
                fontSize: typography.label.md.fontSize,
                lineHeight: typography.label.md.lineHeight,
                fontWeight: typography.label.md.fontWeight as unknown as "600",
                color: c.onSurfaceVariant,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              About
            </Text>

            <Text
              style={{
                fontFamily: typography.body.md.fontFamily,
                fontSize: typography.body.md.fontSize,
                lineHeight: typography.body.md.lineHeight,
                fontWeight: typography.body.md.fontWeight as unknown as "400",
                color: c.onSurface,
              }}
            >
              {event.description}
            </Text>
          </View>

          {event.whatToBring ? (
            <ListItem
              title="What to bring"
              subtitle={event.whatToBring}
              onPress={() => {}}
            />
          ) : null}

          <View
            style={{
              backgroundColor: c.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: outline,
              padding: spacing.gap.lg,
              gap: spacing.gap.sm,
            }}
          >
            <Text
              style={{
                fontFamily: typography.label.md.fontFamily,
                fontSize: typography.label.md.fontSize,
                lineHeight: typography.label.md.lineHeight,
                fontWeight: typography.label.md.fontWeight as unknown as "600",
                color: c.onSurfaceVariant,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              If I don’t show
            </Text>

            <Text
              style={{
                fontFamily: typography.body.md.fontFamily,
                fontSize: typography.body.md.fontSize,
                lineHeight: typography.body.md.lineHeight,
                fontWeight: typography.body.md.fontWeight as unknown as "400",
                color: c.onSurface,
              }}
            >
              {event.cancellationPolicy ??
                "No formal penalties. We trust you to honor your commitment, but understand that life happens."}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View
        style={{
          paddingHorizontal: spacing.screen.xs,
          paddingVertical: spacing.gap.md,
          borderTopWidth: 1,
          borderTopColor: outline,
          backgroundColor: c.surface,
          gap: spacing.gap.sm,
        }}
      >
        <Button
          variant="primary"
          onPress={() => {
            // Phase 1: navigation-only, no backend check-in
            router.push(`/checkin?eventId=${event.id}`);
          }}
        >
          Go to Check-in (Phase 1 nav)
        </Button>

        <Button variant="secondary" onPress={() => router.back()}>
          Back
        </Button>
      </View>
    </View>
  );
}

export default EventDetailScreen;
