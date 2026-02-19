import { getSupabaseClient, getCurrentUserId } from '../client';

export interface RealtimeChannel {
  channel: any;
  unsubscribe: () => void;
}

function isTestEnv(): boolean {
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
}

export async function joinEventChannel(eventId: string): Promise<RealtimeChannel> {
  const client = getSupabaseClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('Must be authenticated');
  }

  const channelName = `event:${eventId}:messages`;
  const channel = client.channel(channelName, { params: { event_id: eventId } });

  channel.subscribe((status: string) => {
    // Silence logs in tests; keep runtime log if you still want it.
    if (!isTestEnv() && status === 'SUBSCRIBED') {
      // eslint-disable-next-line no-console
      console.log(`Joined ${channelName}`);
    }
  });

  return {
    channel,
    unsubscribe: () => channel.unsubscribe(),
  };
}

export function leaveChannel(channel: any): void {
  channel.unsubscribe();
}
