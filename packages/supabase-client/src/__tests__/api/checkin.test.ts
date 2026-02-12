import { getSupabaseClient, getCurrentUserId } from '../../client';
import {
  verifyCheckin,
  verifyCheckinTotp,
  syncOfflineCheckin,
  issueOfflineTicket,
  mintEventToken,
} from '../../api/checkin';

jest.mock('../../client', () => ({
  getSupabaseClient: jest.fn(),
  getCurrentUserId: jest.fn(),
}));

describe('Check-in API', () => {
  let mockClient: any;
  const mockAuthUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
  };

  const mockEvent = {
    id: '660e8400-e29b-41d4-a716-446655440000',
  };

  const mockCheckinResult = {
    id: '770e8400-e29b-41d4-a716-446655440000',
    user_id: mockAuthUser.id,
    event_id: mockEvent.id,
    checkin_method: 'geo',
    verified_at: '2026-02-15T18:05:00Z',
    initially_offline: false,
    offline_synced_at: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      rpc: jest.fn(),
      from: jest.fn(),
    };

    (getSupabaseClient as jest.Mock).mockReturnValue(mockClient);
    (getCurrentUserId as jest.Mock).mockResolvedValue(mockAuthUser.id);
  });

  describe('verifyCheckin', () => {
    it('should verify check-in with location', async () => {
      const params = {
        eventId: mockEvent.id,
        lat: 37.7749,
        lng: -122.4194,
      };

      mockClient.rpc.mockResolvedValue({
        data: [mockCheckinResult],
        error: null,
      });

      const result = await verifyCheckin(params);

      expect(result).toEqual(mockCheckinResult);
      expect(mockClient.rpc).toHaveBeenCalledWith('verify_check_in', {
        p_actor_id: mockAuthUser.id,
        p_event_id: params.eventId,
        p_lat: params.lat,
        p_lng: params.lng,
        p_event_token: null,
      });
    });

    it('should verify check-in with token', async () => {
      const params = {
        eventId: mockEvent.id,
        eventToken: 'test-token-123',
      };

      mockClient.rpc.mockResolvedValue({
        data: [{ ...mockCheckinResult, checkin_method: 'qr' }],
        error: null,
      });

      const result = await verifyCheckin(params);

      expect(result.checkin_method).toBe('qr');
      expect(mockClient.rpc).toHaveBeenCalledWith('verify_check_in', {
        p_actor_id: mockAuthUser.id,
        p_event_id: params.eventId,
        p_lat: null,
        p_lng: null,
        p_event_token: params.eventToken,
      });
    });

    it('should throw error on verification failure', async () => {
      mockClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'VERIFICATION_FAILED' },
      });

      await expect(
        verifyCheckin({ eventId: mockEvent.id, lat: 40.0, lng: -74.0 })
      ).rejects.toThrow('Checkin failed');
    });
  });

  describe('verifyCheckinTotp', () => {
    it('should verify check-in with TOTP code', async () => {
      const params = {
        eventId: mockEvent.id,
        code: 123456,
        clientTime: '2026-02-15T18:05:00Z',
      };

      mockClient.rpc.mockResolvedValue({
        data: [{ ...mockCheckinResult, checkin_method: 'totp' }],
        error: null,
      });

      const result = await verifyCheckinTotp(params);

      expect(result.checkin_method).toBe('totp');
      expect(mockClient.rpc).toHaveBeenCalledWith('verify_check_in_totp', {
        p_actor_id: mockAuthUser.id,
        p_event_id: params.eventId,
        p_code: params.code,
        p_client_time: params.clientTime,
      });
    });

    it('should throw error on invalid TOTP code', async () => {
      mockClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'VERIFICATION_FAILED' },
      });

      await expect(
        verifyCheckinTotp({
          eventId: mockEvent.id,
          code: 999999,
          clientTime: '2026-02-15T18:05:00Z',
        })
      ).rejects.toThrow('TOTP checkin failed');
    });

    it('should throw error on rate limit', async () => {
      mockClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RATE_LIMIT_EXCEEDED' },
      });

      await expect(
        verifyCheckinTotp({
          eventId: mockEvent.id,
          code: 123456,
          clientTime: '2026-02-15T18:05:00Z',
        })
      ).rejects.toThrow('TOTP checkin failed');
    });
  });

  describe('syncOfflineCheckin', () => {
    it('should sync offline check-in with valid ticket', async () => {
      const params = {
        eventId: mockEvent.id,
        method: 'geo' as const,
        occurredAt: '2026-02-15T18:00:00Z',
        ticket: 'valid-ticket-123',
      };

      mockClient.rpc.mockResolvedValue({
        data: [
          {
            ...mockCheckinResult,
            initially_offline: true,
            offline_synced_at: '2026-02-15T18:10:00Z',
          },
        ],
        error: null,
      });

      const result = await syncOfflineCheckin(params);

      expect(result.initially_offline).toBe(true);
      expect(result.offline_synced_at).toBe('2026-02-15T18:10:00Z');
      expect(mockClient.rpc).toHaveBeenCalledWith('sync_offline_check_in', {
        p_actor_id: mockAuthUser.id,
        p_event_id: params.eventId,
        p_method: params.method,
        p_occurred_at: params.occurredAt,
        p_ticket: params.ticket,
      });
    });

    it('should throw error on expired ticket', async () => {
      mockClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'VERIFICATION_FAILED: Ticket expired' },
      });

      await expect(
        syncOfflineCheckin({
          eventId: mockEvent.id,
          method: 'geo',
          occurredAt: '2026-02-15T08:00:00Z',
          ticket: 'expired-ticket',
        })
      ).rejects.toThrow('Offline sync failed');
    });
  });

  describe('issueOfflineTicket', () => {
    it('should issue offline ticket', async () => {
      const params = {
        eventId: mockEvent.id,
        ttlHours: 24,
      };

      mockClient.rpc.mockResolvedValue({
        data: [
          {
            ticket: 'offline-ticket-abc123',
            expires_at: '2026-02-16T18:00:00Z',
          },
        ],
        error: null,
      });

      const result = await issueOfflineTicket(params);

      expect(result.ticket).toBe('offline-ticket-abc123');
      expect(result.expires_at).toBe('2026-02-16T18:00:00Z');
      expect(mockClient.rpc).toHaveBeenCalledWith('issue_offline_ticket', {
        p_actor_id: mockAuthUser.id,
        p_event_id: params.eventId,
        p_ttl_hours: params.ttlHours,
      });
    });
  });

  describe('mintEventToken', () => {
    it('should mint event token', async () => {
      const params = {
        eventId: mockEvent.id,
        ttlSeconds: 300,
      };

      mockClient.rpc.mockResolvedValue({
        data: [
          {
            token: 'event-token-xyz789',
            issued_at: '2026-02-15T18:00:00Z',
            expires_at: '2026-02-15T18:05:00Z',
          },
        ],
        error: null,
      });

      const result = await mintEventToken(params);

      expect(result.token).toBe('event-token-xyz789');
      expect(result.issued_at).toBe('2026-02-15T18:00:00Z');
      expect(result.expires_at).toBe('2026-02-15T18:05:00Z');
    });
  });
});
