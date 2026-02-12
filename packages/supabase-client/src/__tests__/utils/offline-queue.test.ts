jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  enqueueOfflineCheckin,
  getOfflineQueue,
  removeFromQueue,
  updateQueueItem,
  clearOfflineQueue,
} from '../../utils/offline-queue';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Offline Queue', () => {
  describe('enqueueOfflineCheckin', () => {
    it('should add check-in to queue', async () => {
      const payload = {
        event_id: 'event-123',
        latitude: 40.7128,
        longitude: -74.006,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await enqueueOfflineCheckin(payload);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@yombri/offline_checkin_queue');
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should append to existing queue', async () => {
      const existingQueue = [
        {
          id: 'existing-1',
          payload: { event_id: 'event-1' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      const newPayload = {
        event_id: 'event-2',
        latitude: 40.7128,
        longitude: -74.006,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingQueue)
      );
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await enqueueOfflineCheckin(newPayload);

      const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedQueue = JSON.parse(setItemCall[1]);

      expect(savedQueue).toHaveLength(2);
      
      // Check the structure
      const secondItem = savedQueue[1];
      if (secondItem.payload) {
        expect(secondItem.payload.event_id).toBe('event-2');
      } else {
        expect(secondItem.event_id).toBe('event-2');
      }
    });
  });

  describe('getOfflineQueue', () => {
    it('should return empty array when no queue exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const queue = await getOfflineQueue();

      expect(queue).toEqual([]);
    });

    it('should return parsed queue', async () => {
      const mockQueue = [
        {
          id: 'item-1',
          payload: { event_id: 'event-1' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockQueue)
      );

      const queue = await getOfflineQueue();

      expect(queue).toEqual(mockQueue);
    });

    it('should return empty array on parse error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-json');

      const queue = await getOfflineQueue();

      expect(queue).toEqual([]);
    });
  });

  describe('removeFromQueue', () => {
    it('should remove item by ID', async () => {
      const mockQueue = [
        {
          id: 'item-1',
          payload: { event_id: 'event-1' },
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'item-2',
          payload: { event_id: 'event-2' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockQueue)
      );
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await removeFromQueue('item-1');

      const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedQueue = JSON.parse(setItemCall[1]);

      expect(savedQueue).toHaveLength(1);
      expect(savedQueue[0].id).toBe('item-2');
    });
  });

  describe('updateQueueItem', () => {
    it('should update item properties', async () => {
      const mockQueue = [
        {
          id: 'item-1',
          payload: { event_id: 'event-1' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockQueue)
      );
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await updateQueueItem('item-1', { retryCount: 1 });

      const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedQueue = JSON.parse(setItemCall[1]);

      expect(savedQueue[0].retryCount).toBe(1);
    });

    it('should do nothing if item not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('[]');

      await updateQueueItem('non-existent-id', { retryCount: 1 });

      // Implementation doesn't call setItem when item not found
      expect(AsyncStorage.getItem).toHaveBeenCalled();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('clearOfflineQueue', () => {
    it('should remove queue from storage', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await clearOfflineQueue();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@yombri/offline_checkin_queue');
    });
  });
});
