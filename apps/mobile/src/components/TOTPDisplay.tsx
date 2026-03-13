import { View, Text } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { typography } from '@yombri/design-tokens';
import { getEventTotpCode } from '@yombri/supabase-client';
import { useTheme } from '../providers/ThemeProvider';

type Props = { eventId: string };

export default function TOTPDisplay({ eventId }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  const [code, setCode] = useState<string>('------');
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function refresh() {
      try {
        const res = await getEventTotpCode(eventId);
        if (!alive) return;

        setCode(res.code);
        setSecondsLeft(res.seconds_left);
        setError(null);

        const msUntilNext = Math.max(250, res.seconds_left * 1000 + 150);
        timer = setTimeout(refresh, msUntilNext);
      } catch (e: any) {
        if (!alive) return;

        setError(e?.message ?? 'Failed to load code');
        timer = setTimeout(refresh, 2000);
      }
    }

    void refresh();

    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [eventId]);

  const formatted = useMemo(() => code.match(/.{1,3}/g)?.join(' ') ?? code, [code]);

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        borderRadius: 12,
        backgroundColor: c.surface,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          color: c.onSurfaceVariant,
          fontWeight: '600',
          letterSpacing: 1,
          marginBottom: 8,
        }}
      >
        VISUAL CHECK-IN CODE
      </Text>

      <Text
        style={{
          fontSize: 48,
          fontWeight: '700',
          color: c.onSurface,
          letterSpacing: 8,
          marginBottom: 16,
        }}
      >
        {formatted}
      </Text>

      {!!error && (
        <Text
          style={{
            fontSize: typography.label.md.fontSize,
            lineHeight: typography.label.md.lineHeight,
            color: c.onSurfaceVariant,
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          {error}
        </Text>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            height: 4,
            width: 120,
            borderRadius: 999,
            marginRight: 8,
            backgroundColor: c.surfaceVariant,
          }}
        />
        <View
          style={{
            height: 4,
            width: (Math.min(30, Math.max(0, secondsLeft)) / 30) * 100,
            borderRadius: 999,
            backgroundColor: secondsLeft <= 10 ? c.primary : c.primary,
          }}
        />
        <Text
          style={{
            fontSize: typography.label.md.fontSize,
            lineHeight: typography.label.md.lineHeight,
            color: c.onSurfaceVariant,
            marginLeft: 8,
          }}
        >
          {secondsLeft}s
        </Text>
      </View>
    </View>
  );
}
