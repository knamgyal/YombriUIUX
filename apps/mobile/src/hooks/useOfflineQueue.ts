import { useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  getOfflineQueue,
  removeFromQueue,
  updateQueueItem,
  syncOfflineCheckin,
  type QueuedCheckin,
} from '@yombri/supabase-client';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueuedCheckin[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadQueue = useCallback(async () => {
    const items = await getOfflineQueue();
    setQueue(items);
  }, []);

  const processQueue = useCallback(async () => {
    if (isSyncing) {
      return;
    }

    setIsSyncing(true);

    try {
      const items = await getOfflineQueue();

      for (const item of items) {
        if (item.retryCount >= MAX_RETRIES) {
          continue;
        }

        try {
          await syncOfflineCheckin({
            eventId: item.event_id,
            method: item.method,
            occurredAt: item.occurred_at,
            ticket: item.ticket,
          });

          await removeFromQueue(item.id);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';

          await updateQueueItem(item.id, {
            retryCount: item.retryCount + 1,
            lastError: errorMessage,
          });

          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY_MS)
          );
        }
      }
    } finally {
      setIsSyncing(false);
      await loadQueue();
    }
  }, [isSyncing, loadQueue]);

  useEffect(() => {
    loadQueue();

    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          processQueue();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [loadQueue, processQueue]);

  return {
    queue,
    isSyncing,
    processQueue,
    reload: loadQueue,
  };
}
