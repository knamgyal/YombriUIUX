import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, TextInput, View } from 'react-native';
import { Button } from '@/src/components/primitives/Button';
import { ChatMessage } from '@/src/components/ChatMessage';
import { useEventMessages } from '@/src/hooks/useRealtimeChannel';
import { getGroupMessages, sendMessage, getEventGroup } from '@yombri/supabase-client';
import { useAnalytics } from '@/src/hooks/useAnalytics';
import type { Message } from '@yombri/supabase-client';

export default function EventChat() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [groupId, setGroupId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    let cancelled = false;

    async function loadGroup() {
      if (!eventId) return;
      setLoading(true);
      try {
        const group = await getEventGroup(eventId);
        if (!cancelled) {
          setGroupId(group?.id);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadGroup();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      if (!groupId) return;
      const fetched = await getGroupMessages(groupId, 50);
      if (!cancelled) {
        setMessages(fetched);
        trackEvent('chat_history_loaded');
      }
    }

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [groupId, trackEvent]);

  const handleIncomingMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  useEventMessages(groupId, handleIncomingMessage);

  const send = async () => {
    if (!newMessage.trim() || !groupId) return;

    try {
      await sendMessage(groupId, newMessage.trim());
      setNewMessage('');
      trackEvent('message_sent');
    } catch (error) {
      console.error('Send failed:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <Button onPress={() => router.back()}>Loading chat...</Button>
      </View>
    );
  }

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
