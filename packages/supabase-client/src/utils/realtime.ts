import type { RealtimeChannel as SupabaseRealtimeChannel } from '@supabase/supabase-js';
import { getCurrentUserId, getSupabaseClient } from '../client';
import type { Message } from '../types/social';

export interface RealtimeChannelHandle {
  channel: SupabaseRealtimeChannel;
  unsubscribe: () => void;
}

function isTestEnv(): boolean {
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
}

export function joinGroupMessagesChannel(
  groupId: string,
  onInsert: (message: Message) => void
): RealtimeChannelHandle {
  const client = getSupabaseClient();
  const channelName = `group:${groupId}:messages`;

  const channel = client
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `group_id=eq.${groupId}`,
      },
      (payload) => {
        onInsert(payload.new as Message);
      }
    )
    .subscribe((status) => {
      if (!isTestEnv() && status === 'SUBSCRIBED') {
        console.log(`Joined ${channelName}`);
      }
    });

  return {
    channel,
    unsubscribe: () => {
      void channel.unsubscribe();
    },
  };
}

export async function joinEventChannel(
  eventId: string,
  onInsert: (message: Message) => void = () => {}
): Promise<RealtimeChannelHandle> {
  const actorId = await getCurrentUserId();

  if (!actorId) {
    throw new Error('Must be authenticated');
  }

  const client = getSupabaseClient();
  const channelName = `event:${eventId}`;

  const channel = client
    .channel(channelName)
    .subscribe((status) => {
      if (!isTestEnv() && status === 'SUBSCRIBED') {
        console.log(`Joined ${channelName}`);
      }
    });

  return {
    channel,
    unsubscribe: () => {
      void channel.unsubscribe();
    },
  };
}

export function leaveChannel(channel: SupabaseRealtimeChannel): void {
  void channel.unsubscribe();
}
