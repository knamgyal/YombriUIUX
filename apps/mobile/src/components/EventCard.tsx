import { View, Text } from 'react-native';
import { Card } from '@yombri/native-runtime';
import { colors, spacing, typography } from '@yombri/design-tokens';

interface EventCardProps {
  title: string;
  organizerName: string;
  startTime: string;
  location: string;
  description?: string;
  onPress: () => void;
}

export function EventCard({
  title,
  organizerName,
  startTime,
  location,
  description,
  onPress,
}: EventCardProps) {
  return (
    <Card onPress={onPress} className="mb-4">
      <View className="p-4">
        <Text
          style={{ 
            fontSize: typography.body.size, 
            fontWeight: '600',
            color: colors.neutral[900],
          }}
          className="mb-2"
        >
          {title}
        </Text>
        
        <View className="mb-3">
          <Text
            style={{ 
              fontSize: typography.label.size,
              color: colors.neutral[600],
            }}
          >
            Organized by {organizerName}
          </Text>
          <Text
            style={{ 
              fontSize: typography.label.size,
              color: colors.neutral[600],
            }}
            className="mt-1"
          >
            {startTime} • {location}
          </Text>
        </View>

        {description && (
          <Text
            style={{ 
              fontSize: typography.body.size,
              color: colors.neutral[700],
            }}
            numberOfLines={2}
          >
            {description}
          </Text>
        )}
      </View>
    </Card>
  );
}
