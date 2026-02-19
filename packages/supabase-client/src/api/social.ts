import { getSupabaseClient, getCurrentUserId } from '../client';
import type { 
  Message, 
  UserBlock, 
  Follow, 
  Group 
} from '../types/social';
import { 
  joinEventChannel, 
  leaveChannel 
} from '../utils/realtime';

// Existing functions unchanged...
export async function sendMessage(groupId: string, body: string): Promise<Message> {
  const client = getSupabaseClient();
  const senderId = await getCurrentUserId();

  const { data, error } = await client
    .from('messages')
    .insert({ group_id: groupId, sender_id: senderId, body })
    .select()
    .single();

  if (error) throw new Error(`Failed to send message: ${error.message}`);
  return data as Message;
}

export async function getGroupMessages(groupId: string, limit = 50, beforeId?: string): Promise<Message[]> {
  const client = getSupabaseClient();

  let query = client
    .from('messages')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (beforeId) {
    const { data: beforeMessage } = await client
      .from('messages')
      .select('created_at')
      .eq('id', beforeId)
      .single();

    if (beforeMessage) {
      query = query.lt('created_at', beforeMessage.created_at);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to get messages: ${error.message}`);
  return ((data || []) as Message[]).reverse();
}

// NEW 4.1 Realtime message listener
export function onNewEventMessage(
  eventId: string, 
  callback: (message: Message) => void
): { unsubscribe: () => void } {
  const { channel, unsubscribe } = joinEventChannel(eventId);
  
  channel.on('broadcast', { event: 'new_message' }, ({ payload }) => {
    callback(payload as Message);
  });

  return { unsubscribe };
}

// NEW 4.3 Follow operations
export async function followUser(userId: string): Promise<Follow> {
  const client = getSupabaseClient();
  const followerId = await getCurrentUserId();

  const { data, error } = await client
    .from('follows')
    .insert({ follower_id: followerId, following_id: userId })
    .select()
    .single();

  if (error) throw new Error(`Failed to follow: ${error.message}`);
  return data as Follow;
}

export async function unfollowUser(userId: string): Promise<void> {
  const client = getSupabaseClient();
  const followerId = await getCurrentUserId();

  const { error } = await client
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', userId);

  if (error) throw new Error(`Failed to unfollow: ${error.message}`);
}

// Existing block functions unchanged...
export async function blockUser(blockedId: string): Promise<void> {
  const client = getSupabaseClient();
  const blockerId = await getCurrentUserId();

  const { error } = await client.from('user_blocks').insert({
    blocker_id: blockerId,
    blocked_id: blockedId,
  });

  if (error) throw new Error(`Failed to block user: ${error.message}`);
}

export async function unblockUser(blockedId: string): Promise<void> {
  const client = getSupabaseClient();
  const blockerId = await getCurrentUserId();

  const { error } = await client
    .from('user_blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);

  if (error) throw new Error(`Failed to unblock user: ${error.message}`);
}

export async function getBlockedUsers(): Promise<UserBlock[]> {
  const client = getSupabaseClient();
  const blockerId = await getCurrentUserId();

  const { data, error } = await client
    .from('user_blocks')
    .select('*')
    .eq('blocker_id', blockerId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to get blocked users: ${error.message}`);
  return data as UserBlock[];
}

// NEW 4.4 Organizer ejection (atomic)
export async function ejectFromEvent(eventId: string, userId: string): Promise<void> {
  const client = getSupabaseClient();
  const ejectorId = await getCurrentUserId();

  // Atomic: remove from both tables via RPC (RLS-protected)
  const { error } = await client.rpc('eject_user_from_event', {
    p_event_id: eventId,
    p_user_id: userId,
    p_ejector_id: ejectorId
  });

  if (error) throw new Error(`Ejection failed: ${error.message}`);

  // Log for abuse detection (Phase 6)
  await client.from('analytics_events').insert({
    event: 'ejection_issued',
    metadata: { event_id: eventId, user_id: userId, ejector_id: ejectorId }
  });
}

// NEW 4.2 Get event group (auto-created on event creation)
export async function getEventGroup(eventId: string): Promise<Group | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('groups')
    .select('*')
    .eq('event_id', eventId)
    .eq('type', 'event') // Assuming schema has group types
    .single();

  if (error && error.code !== 'PGRST116') { // No rows OK
    throw new Error(`Failed to get event group: ${error.message}`);
  }
  return data as Group | null;
}
