import { View, Text } from 'react-native';
import { useTheme } from '@yombri/native-runtime';
import type { Message } from '@yombri/supabase-client';
import { Button } from './primitives/Button';

interface Props {
  message: Message;
  isOwn: boolean;
  isBlocked?: boolean;
  onBlockUser?: (userId: string) => void;
}

export function ChatMessage({ message, isOwn, isBlocked, onBlockUser }: Props) {
  const theme = useTheme();

  if (isBlocked) {
    return (
      <View className="px-4 py-2">
        <Text className="text-muted-foreground text-sm italic">
          Message hidden (blocked user)
        </Text>
      </View>
    );
  }

  return (
    <View className={`flex-row ${isOwn ? 'flex-row-reverse' : ''} px-4 py-2`}>
      <View className={`max-w-[70%] p-3 rounded-2xl ${isOwn ? 'bg-primary' : 'bg-muted'}`}>
        <Text className={`text-sm ${isOwn ? 'text-primary-foreground' : 'text-foreground'}`}>
          {message.body}
        </Text>
        <Text className="text-xs text-muted-foreground mt-1">
          {new Date(message.created_at).toLocaleTimeString()}
        </Text>
      </View>
      {!isOwn && onBlockUser && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-2"
          onPress={() => onBlockUser(message.sender_id)}
        >
          Block
        </Button>
      )}
    </View>
  );
}
