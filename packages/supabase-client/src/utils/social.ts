export function makeEventMessagesChannel(eventId: string): string {
  const id = (eventId ?? '').trim();
  if (!id) throw new Error('eventId required');
  return `event:${id}:messages`;
}

export function makeDmChannel(userIdA: string, userIdB: string): string {
  const a = (userIdA ?? '').trim();
  const b = (userIdB ?? '').trim();
  if (!a || !b) throw new Error('Both user ids required');
  if (a === b) throw new Error('DM with self is not allowed');
  const [id1, id2] = [a, b].sort();
  return `dm:${id1}_${id2}`;
}

/**
 * Display-layer only (secondary safety).
 * Primary safety is RLS: blocked users shouldn't be able to send/see where disallowed.
 */
export function filterBlockedMessages<T extends { sender_id: string }>(params: {
  messages: T[];
  blockedSenderIds: string[];
  currentUserId: string;
}): T[] {
  const { messages, blockedSenderIds, currentUserId } = params;
  const blocked = new Set((blockedSenderIds ?? []).filter(Boolean));

  return (messages ?? []).filter((m) => {
    if (!m?.sender_id) return false;
    if (m.sender_id === currentUserId) return true; // never hide own
    return !blocked.has(m.sender_id);
  });
}

/**
 * UI gating only (NOT authorization). Real enforcement is RPC/RLS.
 */
export function canShowEjectButton(params: {
  isOrganizer: boolean;
  organizerId: string;
  currentUserId: string;
  targetUserId: string;
}): boolean {
  const { isOrganizer, organizerId, currentUserId, targetUserId } = params;
  if (!isOrganizer) return false;
  if (!organizerId || !currentUserId || !targetUserId) return false;
  if (currentUserId !== organizerId) return false;
  if (targetUserId === currentUserId) return false;
  return true;
}
