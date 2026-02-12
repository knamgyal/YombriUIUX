import { getSupabaseClient, getCurrentUserId } from '../client';
import type { Message, UserBlock } from '../types';

export async function sendMessage(
  groupId: string,
  body: string
): Promise<Message> {
  const client = getSupabaseClient();
  const senderId = await getCurrentUserId();

  const { data, error } = await client
    .from('messages')
    .insert({
      group_id: groupId,
      sender_id: senderId,
      body,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }

  return data as Message;
}

export async function getGroupMessages(
  groupId: string,
  limit: number = 50,
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

  if (error) {
    throw new Error(`Failed to get messages: ${error.message}`);
  }

  return ((data || []) as Message[]).reverse();
}

export async function blockUser(blockedId: string): Promise<void> {
  const client = getSupabaseClient();
  const blockerId = await getCurrentUserId();

  const { error } = await client.from('user_blocks').insert({
    blocker_id: blockerId,
    blocked_id: blockedId,
  });

  if (error) {
    throw new Error(`Failed to block user: ${error.message}`);
  }
}

export async function unblockUser(blockedId: string): Promise<void> {
  const client = getSupabaseClient();
  const blockerId = await getCurrentUserId();

  const { error } = await client
    .from('user_blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);

  if (error) {
    throw new Error(`Failed to unblock user: ${error.message}`);
  }
}

export async function getBlockedUsers(): Promise<UserBlock[]> {
  const client = getSupabaseClient();
  const blockerId = await getCurrentUserId();

  const { data, error } = await client
    .from('user_blocks')
    .select('*')
    .eq('blocker_id', blockerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get blocked users: ${error.message}`);
  }

  return (data || []) as UserBlock[];
}
