import {
  makeEventMessagesChannel,
  makeDmChannel,
  filterBlockedMessages,
  canShowEjectButton,
} from '../utils/social';

describe('utils/social branch coverage (nullish + guard branches)', () => {
  test('makeEventMessagesChannel: defined path', () => {
    expect(makeEventMessagesChannel('event-1')).toBe('event:event-1:messages');
  });

  test('makeEventMessagesChannel: nullish path (undefined) throws', () => {
    expect(() => makeEventMessagesChannel(undefined as any)).toThrow();
  });

  test('makeEventMessagesChannel: whitespace path throws', () => {
    expect(() => makeEventMessagesChannel('   ')).toThrow();
  });

  test('makeDmChannel: defined path sorts', () => {
    expect(makeDmChannel('b', 'a')).toBe('dm:a_b');
  });

  test('makeDmChannel: nullish path (undefined) throws', () => {
    expect(() => makeDmChannel(undefined as any, 'b')).toThrow();
    expect(() => makeDmChannel('a', undefined as any)).toThrow();
  });

  test('makeDmChannel: self throws', () => {
    expect(() => makeDmChannel('a', 'a')).toThrow();
  });

  test('filterBlockedMessages: nullish lists are handled', () => {
    const res1 = filterBlockedMessages({
      messages: undefined as any,
      blockedSenderIds: undefined as any,
      currentUserId: 'me',
    });
    expect(res1).toEqual([]);

    const res2 = filterBlockedMessages({
      messages: [{ sender_id: 'ok' }] as any,
      blockedSenderIds: null as any,
      currentUserId: 'me',
    });
    expect(res2).toHaveLength(1);
    expect(res2[0].sender_id).toBe('ok');
  });

  test('filterBlockedMessages: takes both “own message” and “blocked message” branches', () => {
    const res = filterBlockedMessages({
      messages: [
        { sender_id: 'me', body: 'mine' },
        { sender_id: 'blocked', body: 'nope' },
        { sender_id: 'other', body: 'ok' },
      ] as any,
      blockedSenderIds: ['blocked'],
      currentUserId: 'me',
    });

    expect(res.map((m: any) => m.sender_id)).toEqual(['me', 'other']);
  });

  test('canShowEjectButton: missing ids return false', () => {
    expect(
      canShowEjectButton({
        isOrganizer: true,
        organizerId: '',
        currentUserId: 'org',
        targetUserId: 'user',
      })
    ).toBe(false);

    expect(
      canShowEjectButton({
        isOrganizer: true,
        organizerId: 'org',
        currentUserId: '',
        targetUserId: 'user',
      })
    ).toBe(false);

    expect(
      canShowEjectButton({
        isOrganizer: true,
        organizerId: 'org',
        currentUserId: 'org',
        targetUserId: '',
      })
    ).toBe(false);
  });
});
