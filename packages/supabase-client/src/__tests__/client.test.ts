// Mock before any imports
jest.mock('@supabase/supabase-js');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

import { createClient } from '@supabase/supabase-js';
import {
  initializeSupabase,
  getSupabaseClient,
  getCurrentUserId,
  isAuthenticated,
  __resetClientForTesting,
} from '../client';

describe('Supabase Client', () => {
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the singleton
    __resetClientForTesting();

    // Create mock client
    mockClient = {
      auth: {
        getUser: jest.fn(),
        getSession: jest.fn(),
      },
      from: jest.fn(),
    };

    // Setup createClient to return mock
    (createClient as jest.MockedFunction<typeof createClient>).mockReturnValue(mockClient as any);
  });

  describe('initializeSupabase', () => {
    it('should create client with correct config', () => {
      const url = 'https://test.supabase.co';
      const key = 'test-anon-key';

      const client = initializeSupabase(url, key);

      expect(createClient).toHaveBeenCalledWith(url, key, expect.any(Object));
      expect(client).toBe(mockClient);
    });

    it('should return same instance on subsequent calls', () => {
      const url = 'https://test.supabase.co';
      const key = 'test-anon-key';

      const client1 = initializeSupabase(url, key);
      const client2 = initializeSupabase(url, key);

      expect(client1).toBe(client2);
      expect(createClient).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSupabaseClient', () => {
    it('should throw error if not initialized', () => {
      expect(() => getSupabaseClient()).toThrow(
        'Supabase client not initialized'
      );
    });

    it('should return client after initialization', () => {
      initializeSupabase('https://test.supabase.co', 'key');
      const client = getSupabaseClient();
      expect(client).toBe(mockClient);
    });
  });

  describe('getCurrentUserId', () => {
    it('should return user ID when authenticated', async () => {
      const mockUser = { id: 'user-123' };
      
      initializeSupabase('https://test.supabase.co', 'key');
      
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const userId = await getCurrentUserId();

      expect(userId).toBe('user-123');
    });

    it('should throw error when not authenticated', async () => {
      initializeSupabase('https://test.supabase.co', 'key');
      
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(getCurrentUserId()).rejects.toThrow(
        'User not authenticated'
      );
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when session exists', async () => {
      initializeSupabase('https://test.supabase.co', 'key');
      
      mockClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'token',
            user: { id: 'user-123' },
          },
        },
        error: null,
      });

      const authenticated = await isAuthenticated();

      expect(authenticated).toBe(true);
    });

    it('should return false when no session', async () => {
      initializeSupabase('https://test.supabase.co', 'key');
      
      mockClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const authenticated = await isAuthenticated();

      expect(authenticated).toBe(false);
    });
  });
});
