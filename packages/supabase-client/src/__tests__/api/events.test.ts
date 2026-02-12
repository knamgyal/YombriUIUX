import { getSupabaseClient, getCurrentUserId } from '../../client';
import {
  createEvent,
  getEventClusters,
  getEvent,
  getEventsByOrganizer,
} from '../../api/events';

jest.mock('../../client', () => ({
  getSupabaseClient: jest.fn(),
  getCurrentUserId: jest.fn(),
}));

describe('Events API', () => {
  let mockClient: any;
  let mockQueryBuilder: any;
  const mockAuthUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
  };

  // ADD THIS
  const mockEvent = {
    id: '660e8400-e29b-41d4-a716-446655440000',
    title: 'Test Event',
    description: 'Test Description',
    starts_at: '2026-02-15T18:00:00Z',
    ends_at: '2026-02-15T20:00:00Z',
    location: {
      lat: 37.7749,
      lng: -122.4194,
    },
    organizer_id: mockAuthUser.id,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    };

    mockClient = {
      rpc: jest.fn(),
      from: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    (getSupabaseClient as jest.Mock).mockReturnValue(mockClient);
    (getCurrentUserId as jest.Mock).mockResolvedValue(mockAuthUser.id);
  });

  describe('createEvent', () => {
    it('should create event and return event ID', async () => {
      const params = {
        title: 'Test Event',
        description: 'Test Description',
        starts_at: '2026-02-15T18:00:00Z',
        ends_at: '2026-02-15T20:00:00Z',
        lat: 37.7749,
        lng: -122.4194,
        address_label: 'San Francisco, CA',
        checkin_radius_m: 150,
      };

      mockClient.rpc.mockResolvedValue({
        data: mockEvent.id,
        error: null,
      });

      const eventId = await createEvent(params);

      expect(eventId).toBe(mockEvent.id);
      expect(mockClient.rpc).toHaveBeenCalledWith('create_event', {
        p_actor_id: mockAuthUser.id,
        p_title: params.title,
        p_description: params.description,
        p_starts_at: params.starts_at,
        p_ends_at: params.ends_at,
        p_lat: params.lat,
        p_lng: params.lng,
        p_address_label: params.address_label,
        p_checkin_radius_m: params.checkin_radius_m,
      });
    });

    it('should throw error on failure', async () => {
      const params = {
        title: 'Test Event',
        description: null,
        starts_at: '2026-02-15T18:00:00Z',
        ends_at: null,
        lat: 37.7749,
        lng: -122.4194,
        address_label: null,
      };

      mockClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'INVALID_START_TIME' },
      });

      await expect(createEvent(params)).rejects.toThrow(
        'Failed to create event'
      );
    });
  });

  describe('getEventClusters', () => {
    it('should return event clusters', async () => {
      const params = {
        minLat: 37.7,
        minLng: -122.5,
        maxLat: 37.8,
        maxLng: -122.4,
        zoom: 14,
      };

      const mockClusters = [
        {
          cell_id: 'cell_1',
          centroid_lat: 37.75,
          centroid_lng: -122.45,
          bucket: 'few' as const,
          sample_event_ids: [mockEvent.id],
        },
      ];

      mockClient.rpc.mockResolvedValue({
        data: mockClusters,
        error: null,
      });

      const clusters = await getEventClusters(params);

      expect(clusters).toEqual(mockClusters);
      expect(mockClient.rpc).toHaveBeenCalledWith('events_clusters', {
        p_min_lat: params.minLat,
        p_min_lng: params.minLng,
        p_max_lat: params.maxLat,
        p_max_lng: params.maxLng,
        p_zoom: params.zoom,
      });
    });

    it('should return empty array when no clusters', async () => {
      mockClient.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const clusters = await getEventClusters({
        minLat: 37.7,
        minLng: -122.5,
        maxLat: 37.8,
        maxLng: -122.4,
        zoom: 14,
      });

      expect(clusters).toEqual([]);
    });
  });

  describe('getEvent', () => {
    it('should return event by ID', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            ...mockEvent,
            location: { coordinates: [mockEvent.location.lng, mockEvent.location.lat] },
          },
          error: null,
        }),
      };

      mockClient.from.mockReturnValue(mockQueryBuilder);

      const event = await getEvent(mockEvent.id);

      expect(event).toEqual(mockEvent);
      expect(mockClient.from).toHaveBeenCalledWith('events');
    });

    it('should return null when event not found', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      };

      mockClient.from.mockReturnValue(mockQueryBuilder);

      const event = await getEvent('non-existent-id');

      expect(event).toBeNull();
    });
  });

  describe('getEventsByOrganizer', () => {
    it('should return events by organizer', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [
            {
              ...mockEvent,
              location: { coordinates: [mockEvent.location.lng, mockEvent.location.lat] },
            },
          ],
          error: null,
        }),
      };

      mockClient.from.mockReturnValue(mockQueryBuilder);

      const events = await getEventsByOrganizer(mockAuthUser.id);

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual(mockEvent);
    });
  });
});
