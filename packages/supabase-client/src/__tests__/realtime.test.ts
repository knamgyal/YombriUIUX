let channelMock: jest.Mock;
let subscribeMock: jest.Mock;
let unsubscribeMock: jest.Mock;

const makeMockChannel = () => {
  subscribeMock = jest.fn();
  unsubscribeMock = jest.fn();
  return {
    subscribe: subscribeMock,
    unsubscribe: unsubscribeMock,
    on: jest.fn(),
  };
};

const mockChannel = makeMockChannel();

jest.mock('../client', () => {
  channelMock = jest.fn(() => mockChannel);

  return {
    getSupabaseClient: jest.fn(() => ({
      channel: channelMock,
    })),
    getCurrentUserId: jest.fn(),
  };
});

import { joinEventChannel, leaveChannel } from '../utils/realtime';
import { getCurrentUserId } from '../client';

describe('utils/realtime (wrapper only)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('joinEventChannel throws if not authenticated', async () => {
    (getCurrentUserId as unknown as jest.Mock).mockResolvedValueOnce(null);

    await expect(joinEventChannel('event-1')).rejects.toThrow('Must be authenticated');
    expect(channelMock).toHaveBeenCalledTimes(0);
  });

  test('joinEventChannel calls client.channel with correct name + params', async () => {
    (getCurrentUserId as unknown as jest.Mock).mockResolvedValueOnce('user-1');

    await joinEventChannel('event-1');

    expect(channelMock).toHaveBeenCalledTimes(1);
    expect(channelMock).toHaveBeenCalledWith('event:event-1:messages', {
      params: { event_id: 'event-1' },
    });
  });

  test('subscribe callback covers both log and no-log branches', async () => {
    (getCurrentUserId as unknown as jest.Mock).mockResolvedValueOnce('user-1');

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const oldEnv = process.env.NODE_ENV;

    try {
      await joinEventChannel('event-1');

      expect(subscribeMock).toHaveBeenCalledTimes(1);
      const cb = subscribeMock.mock.calls[0]?.[0];
      expect(typeof cb).toBe('function');

      // Branch 1: test env => no log even if SUBSCRIBED
      process.env.NODE_ENV = 'test';
      cb('SUBSCRIBED');
      expect(logSpy).toHaveBeenCalledTimes(0);

      // Branch 2: non-test env + SUBSCRIBED => log (covers the remaining branch/line)
      process.env.NODE_ENV = 'production';
      cb('SUBSCRIBED');
      expect(logSpy).toHaveBeenCalledTimes(1);

      // Branch 3: non-SUBSCRIBED => no extra log
      cb('CHANNEL_ERROR');
      expect(logSpy).toHaveBeenCalledTimes(1);
    } finally {
      process.env.NODE_ENV = oldEnv;
      logSpy.mockRestore();
    }
  });

  test('unsubscribe function calls channel.unsubscribe', async () => {
    (getCurrentUserId as unknown as jest.Mock).mockResolvedValueOnce('user-1');

    const res = await joinEventChannel('event-1');
    res.unsubscribe();

    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });

  test('leaveChannel unsubscribes', () => {
    const ch = { unsubscribe: jest.fn() };
    leaveChannel(ch as any);
    expect(ch.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
