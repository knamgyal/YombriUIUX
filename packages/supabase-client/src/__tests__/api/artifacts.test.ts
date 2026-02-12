import { getSupabaseClient, getCurrentUserId } from '../../client';
import {
  appendLegacyArtifact,
  getUserArtifacts,
} from '../../api/artifacts';

jest.mock('../../client', () => ({
  getSupabaseClient: jest.fn(),
  getCurrentUserId: jest.fn(),
}));

describe('Artifacts API', () => {
  let mockClient: any;
  let mockQueryBuilder: any;
  const mockAuthUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
  };

  // ADD THIS
  const mockEvent = {
    id: '660e8400-e29b-41d4-a716-446655440000',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    };

    mockClient = {
      rpc: jest.fn(),
      from: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    (getSupabaseClient as jest.Mock).mockReturnValue(mockClient);
    (getCurrentUserId as jest.Mock).mockResolvedValue(mockAuthUser.id);
  });

  describe('appendLegacyArtifact', () => {
    it('should append artifact after check-in', async () => {
      const params = {
        eventId: mockEvent.id,
        payload: { action: 'attended', notes: 'Great event!' },
      };

      const mockArtifact = {
        id: '880e8400-e29b-41d4-a716-446655440000',
        user_id: mockAuthUser.id,
        event_id: mockEvent.id,
        sequence_id: 1,
        previous_hash: null,
        payload: params.payload,
        payload_hash: 'hash123',
        created_at: '2026-02-15T18:10:00Z',
      };

      mockClient.rpc.mockResolvedValue({
        data: mockArtifact,
        error: null,
      });

      const artifact = await appendLegacyArtifact(params);

      expect(artifact).toEqual(mockArtifact);
      expect(artifact.sequence_id).toBe(1);
      expect(artifact.previous_hash).toBeNull();
      expect(mockClient.rpc).toHaveBeenCalledWith('append_legacy_artifact', {
        p_actor_id: mockAuthUser.id,
        p_event_id: params.eventId,
        p_payload: params.payload,
      });
    });

    it('should throw error if not checked in', async () => {
      mockClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'PERMISSION_DENIED: User not checked into event' },
      });

      await expect(
        appendLegacyArtifact({
          eventId: mockEvent.id,
          payload: { test: true },
        })
      ).rejects.toThrow('Failed to append artifact');
    });

    it('should throw error if payload too large', async () => {
      mockClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'INVALID_INPUT: Payload too large' },
      });

      const largePayload = { data: 'x'.repeat(200000) };

      await expect(
        appendLegacyArtifact({
          eventId: mockEvent.id,
          payload: largePayload,
        })
      ).rejects.toThrow('Failed to append artifact');
    });
  });

  describe('getUserArtifacts', () => {
    it('should return user artifacts in sequence order', async () => {
      const mockArtifacts = [
        {
          id: '881e8400-e29b-41d4-a716-446655440000',
          user_id: mockAuthUser.id,
          event_id: mockEvent.id,
          sequence_id: 1,
          previous_hash: null,
          payload: { action: 'attended' },
          payload_hash: 'hash1',
          created_at: '2026-02-15T18:10:00Z',
        },
        {
          id: '882e8400-e29b-41d4-a716-446655440000',
          user_id: mockAuthUser.id,
          event_id: mockEvent.id,
          sequence_id: 2,
          previous_hash: 'hash1',
          payload: { action: 'attended' },
          payload_hash: 'hash2',
          created_at: '2026-02-16T19:00:00Z',
        },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockArtifacts,
          error: null,
        }),
      };

      mockClient.from.mockReturnValue(mockQueryBuilder);

      const artifacts = await getUserArtifacts(mockAuthUser.id);

      expect(artifacts).toEqual(mockArtifacts);
      expect(artifacts[0].sequence_id).toBe(1);
      expect(artifacts[1].sequence_id).toBe(2);
      expect(artifacts[1].previous_hash).toBe(artifacts[0].payload_hash);
    });

    it('should return empty array when no artifacts', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      mockClient.from.mockReturnValue(mockQueryBuilder);

      const artifacts = await getUserArtifacts(mockAuthUser.id);

      expect(artifacts).toEqual([]);
    });
  });
});
