import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { FlatList, TextInput, View } from 'react-native';
import { Button } from '@/src/components/primitives/Button';
import { ChatMessage } from '@/src/components/ChatMessage';
import { useEventMessages } from '@/src/hooks/useRealtimeChannel';
import { 
  getGroupMessages, 
  sendMessage,
  getEventGroup 
} from '@yombri/supabase-client';
import { useAnalytics } from '@/src/hooks/useAnalytics';
import type { Message } from '@yombri/supabase-client';

export default function EventChat() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [groupId, setGroupId] = useState<string>('');
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    loadMessages();
    loadGroup();
  }, [eventId]);

  useEventMessages(eventId!, (message) => {
    setMessages(prev => [message, ...prev]);
  });

  const loadMessages = async () => {
    if (!groupId) return;
    const fetched = await getGroupMessages(groupId, 50);
    setMessages(fetched);
    trackEvent('chat_history_loaded');
  };

  const loadGroup = async () => {
    const group = await getEventGroup(eventId!);
    if (group) {
      setGroupId(group.id);
    }
  };

  const send = async () => {
    if (!newMessage.trim() || !groupId) return;
    
    try {
      const message = await sendMessage(groupId, newMessage.trim());
      setMessages(prev => [message, ...prev]);
      setNewMessage('');
      trackEvent('message_sent');
    } catch (error) {
      console.error('Send failed:', error);
    }
  };

  if (!groupId) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <Button onPress={() => router.back()}>No chat yet</Button>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={messages}
        renderItem={({ item }) => <ChatMessage message={item} isOwn={false} />}
        keyExtractor={(item) => item.id}
        className="flex-1"
      />
      <View className="flex-row p-4 bg-background border-t">
        <TextInput
          className="flex-1 p-3 border rounded-xl mr-2 text-base"
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          onSubmitEditing={send}
        />
        <Button onPress={send} disabled={!newMessage.trim()}>
          Send
        </Button>
      </View>
    </View>
  );
}
