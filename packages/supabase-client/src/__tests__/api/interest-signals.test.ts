import { getSupabaseClient, getCurrentUserId } from '../../client';
import { signalInterest } from '../../api/interest-signals';

jest.mock('../../client', () => ({
  getSupabaseClient: jest.fn(),
  getCurrentUserId: jest.fn(),
}));

describe('Interest Signals API', () => {
  let mockClient: any;
  const mockAuthUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      rpc: jest.fn(),
    };

    (getSupabaseClient as jest.Mock).mockReturnValue(mockClient);
    (getCurrentUserId as jest.Mock).mockResolvedValue(mockAuthUser.id);
  });
  
  describe('signalInterest', () => {
    it('should signal interest with valid location', async () => {
      const params = {
        lat: 37.7749,
        lng: -122.4194,
      };

      const mockSignalId = '770e8400-e29b-41d4-a716-446655440000';

      mockClient.rpc.mockResolvedValue({
        data: mockSignalId,
        error: null,
      });

      const signalId = await signalInterest(params);

      expect(signalId).toBe(mockSignalId);
      expect(mockClient.rpc).toHaveBeenCalledWith('signal_interest', {
        p_actor_id: mockAuthUser.id,
        p_lat: params.lat,
        p_lng: params.lng,
      });
    });

    it('should throw error on invalid coordinates', async () => {
      mockClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'INVALID_COORDINATES' },
      });

      await expect(
        signalInterest({ lat: 999, lng: -122.4194 })
      ).rejects.toThrow('Failed to signal interest');
    });

    it('should throw error on rate limit', async () => {
      mockClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RATE_LIMIT_EXCEEDED: Daily limit reached' },
      });

      await expect(
        signalInterest({ lat: 37.7749, lng: -122.4194 })
      ).rejects.toThrow('Failed to signal interest');
    });
  });
});
