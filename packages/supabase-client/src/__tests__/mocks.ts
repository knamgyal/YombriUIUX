import type { SupabaseClient } from '@supabase/supabase-js';

export const createMockSupabaseClient = () => ({
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn((table: string) => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
  rpc: jest.fn(),
  channel: jest.fn(),
});

export const mockAuthUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockEvent = {
  id: '660e8400-e29b-41d4-a716-446655440000',
  organizer_id: mockAuthUser.id,
  title: 'Test Event',
  description: 'Test Description',
  starts_at: '2026-02-15T18:00:00Z',
  ends_at: '2026-02-15T20:00:00Z',
  status: 'scheduled' as const,
  location: { lat: 37.7749, lng: -122.4194 },
  address_label: 'San Francisco, CA',
  checkin_radius_m: 150,
  deleted_at: null,
  created_at: '2026-02-11T00:00:00Z',
  updated_at: '2026-02-11T00:00:00Z',
};

export const mockCheckinResult = {
  event_id: mockEvent.id,
  user_id: mockAuthUser.id,
  status: 'checked_in' as const,
  checked_in_at: '2026-02-15T18:05:00Z',
  checkin_method: 'geo' as const,
};
