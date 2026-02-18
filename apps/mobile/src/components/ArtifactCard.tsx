import { View, Text } from 'react-native';
import { Card } from '@yombri/native-runtime';
import { colors, typography } from '@yombri/design-tokens';

interface ArtifactCardProps {
  sequenceId: number;
  eventTitle: string;
  timestamp: string;
  themeSponsor?: string;
}

export function ArtifactCard({
  sequenceId,
  eventTitle,
  timestamp,
  themeSponsor,
}: ArtifactCardProps) {
  const formattedId = `#${String(sequenceId).padStart(3, '0')}`;

  return (
    <Card className="mb-3">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.neutral[900],
            }}
          >
            Impact {formattedId}
          </Text>
          <View 
            className="px-2 py-1 rounded"
            style={{ backgroundColor: colors.brand.emerald + '20' }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                color: colors.brand.emerald,
                letterSpacing: 0.5,
              }}
            >
              VERIFIED
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: typography.body.size,
            color: colors.neutral[800],
            fontWeight: '500',
          }}
          className="mb-1"
        >
          {eventTitle}
        </Text>

        <Text
          style={{
            fontSize: typography.label.size,
            color: colors.neutral[600],
          }}
        >
          {new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {themeSponsor && (
          <View className="mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.neutral[200] }}>
            <Text
              style={{
                fontSize: 11,
                color: colors.neutral[500],
              }}
            >
              Enabled by {themeSponsor}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
