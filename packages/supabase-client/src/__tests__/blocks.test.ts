import {
  filterBlockedMessages,
  makeEventMessagesChannel,
  makeDmChannel,
  canShowEjectButton,
} from '../utils/social';

describe('utils/social (pure logic)', () => {
  test('makeEventMessagesChannel formats correctly', () => {
    expect(makeEventMessagesChannel('event-1')).toBe('event:event-1:messages');
  });

  test('makeEventMessagesChannel trims', () => {
    expect(makeEventMessagesChannel('  event-1  ')).toBe('event:event-1:messages');
  });

  test('makeEventMessagesChannel requires id', () => {
    expect(() => makeEventMessagesChannel('')).toThrow();
    expect(() => makeEventMessagesChannel('   ')).toThrow();
  });

  test('makeEventMessagesChannel throws on blank', () => {
  expect(() => makeEventMessagesChannel('')).toThrow();
  expect(() => makeEventMessagesChannel('   ')).toThrow();
  });

  test('makeDmChannel throws on missing ids', () => {
  expect(() => makeDmChannel('', 'b')).toThrow();
  expect(() => makeDmChannel('a', '')).toThrow();
  });

  test('makeDmChannel sorts deterministically', () => {
    expect(makeDmChannel('b', 'a')).toBe('dm:a_b');
    expect(makeDmChannel('a', 'b')).toBe('dm:a_b');
  });

  test('makeDmChannel rejects self', () => {
    expect(() => makeDmChannel('a', 'a')).toThrow();
  });

  test('filterBlockedMessages hides blocked senders but keeps own', () => {
    const messages = [
      { id: '1', sender_id: 'alice', body: 'mine' },
      { id: '2', sender_id: 'bob', body: 'blocked' },
      { id: '3', sender_id: 'charlie', body: 'ok' },
    ];

    const res = filterBlockedMessages({
      messages,
      blockedSenderIds: ['bob', 'alice'], // alice should NOT hide self
      currentUserId: 'alice',
    });

    expect(res.map((m) => m.sender_id)).toEqual(['alice', 'charlie']);
  });

  test('filterBlockedMessages drops malformed messages safely', () => {
    const messages: any[] = [{ id: 'x' }, null, { sender_id: '' }, { sender_id: 'ok' }];
    const res = filterBlockedMessages({
      messages,
      blockedSenderIds: [],
      currentUserId: 'me',
    });
    expect(res).toHaveLength(1);
    expect(res[0].sender_id).toBe('ok');
  });

  test('canShowEjectButton: organizer, self, non-organizer cases', () => {
    expect(
      canShowEjectButton({
        isOrganizer: true,
        organizerId: 'org',
        currentUserId: 'org',
        targetUserId: 'user',
      })
    ).toBe(true);

    expect(
      canShowEjectButton({
        isOrganizer: true,
        organizerId: 'org',
        currentUserId: 'org',
        targetUserId: 'org',
      })
    ).toBe(false);

    expect(
      canShowEjectButton({
        isOrganizer: false,
        organizerId: 'org',
        currentUserId: 'user',
        targetUserId: 'someone',
      })
    ).toBe(false);

    expect(
      canShowEjectButton({
        isOrganizer: true,
        organizerId: 'org',
        currentUserId: 'not-org',
        targetUserId: 'user',
      })
    ).toBe(false);
  });
});
