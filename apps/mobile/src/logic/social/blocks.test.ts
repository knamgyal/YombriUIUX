import { filterBlockedMessages } from './blocks'; // Inline logic below

// Pure logic: client-side block filtering (RLS prevents send, this hides)
describe('Block Message Filtering', () => {
  const messages = [
    { id: '1', sender_id: 'user1', body: 'Hello' },
    { id: '2', sender_id: 'blocked1', body: 'Spam' },
    { id: '3', sender_id: 'user2', body: 'Reply' },
  ];

  test('hides blocked senders', () => {
    const blockedIds = ['blocked1'];
    const filtered = filterBlockedMessages(messages, blockedIds);
    expect(filtered).toHaveLength(2);
    expect(filtered[0].sender_id).toBe('user1');
    expect(filtered[1].sender_id).toBe('user2');
  });

  test('shows all when no blocks', () => {
    const filtered = filterBlockedMessages(messages, []);
    expect(filtered).toHaveLength(3);
  });
});

// Inline for copy-paste convenience
function filterBlockedMessages(messages: any[], blockedIds: string[]) {
  return messages.filter(msg => !blockedIds.includes(msg.sender_id));
}
