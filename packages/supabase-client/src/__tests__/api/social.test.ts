import { getSupabaseClient, getCurrentUserId } from '../../client';
import {
  getGroupMessages,
  sendMessage,
  blockUser,
  unblockUser,
} from '../../api/social';

jest.mock('../../client', () => ({
  getSupabaseClient: jest.fn(),
  getCurrentUserId: jest.fn(),
}));

describe('Social API', () => {
  let mockClient: any;
  let mockQueryBuilder: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };

    mockClient = {
      from: jest.fn().mockReturnValue(mockQueryBuilder),
      rpc: jest.fn(),
    };

    (getSupabaseClient as jest.Mock).mockReturnValue(mockClient);
    (getCurrentUserId as jest.Mock).mockResolvedValue('550e8400-e29b-41d4-a716-446655440000');
  });

  describe('getGroupMessages', () => {
  it('should return recent messages', async () => {
    // Mock returns them in one order
    const mockMessages = [
      {
        id: 'msg-2',
        content: 'Hi there',
        created_at: '2026-02-15T17:00:00Z',
      },
      {
        id: 'msg-1',
        content: 'Hello',
        created_at: '2026-02-15T20:00:00Z',
      },
    ];

    mockQueryBuilder.limit.mockResolvedValue({
      data: mockMessages,
      error: null,
    });

    const messages = await getGroupMessages('group-123');

    expect(messages).toHaveLength(2);
    // But the function returns them sorted (20:00 first, 17:00 second)
    expect(messages[0].created_at).toBe('2026-02-15T20:00:00Z');
    expect(messages[1].created_at).toBe('2026-02-15T17:00:00Z');
  });
});

});
