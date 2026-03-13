import { getSupabaseClient, getCurrentUserId } from '../client';
import type { Message, UserBlock, Follow, Group } from '../types/social';
import { joinGroupMessagesChannel } from '../utils/realtime';

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

export async function getGroupMessages(
  groupId: string,
  limit = 50,
  beforeId?: string
): Promise<Message[]> {
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

export function onNewGroupMessage(
  groupId: string,
  callback: (message: Message) => void
): { unsubscribe: () => void } {
  return joinGroupMessagesChannel(groupId, callback);
}

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

export async function ejectFromEvent(eventId: string, userId: string): Promise<void> {
  const client = getSupabaseClient();
  const ejectorId = await getCurrentUserId();

  const { error } = await client.rpc('eject_user_from_event', {
    p_event_id: eventId,
    p_user_id: userId,
    p_ejector_id: ejectorId,
  });

  if (error) throw new Error(`Ejection failed: ${error.message}`);

  await client.from('analytics_events').insert({
    event: 'ejection_issued',
    metadata: { event_id: eventId, user_id: userId, ejector_id: ejectorId },
  });
}

export async function getEventGroup(eventId: string): Promise<Group | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('groups')
    .select('*')
    .eq('event_id', eventId)
    .eq('type', 'event')
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get event group: ${error.message}`);
  }
  return data as Group | null;
}
