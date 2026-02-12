import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OfflineCheckinPayload } from '../types';

const OFFLINE_QUEUE_KEY = '@yombri/offline_checkin_queue';

export interface QueuedCheckin extends OfflineCheckinPayload {
  id: string;
  queuedAt: string;
  retryCount: number;
  lastError?: string;
}

export async function enqueueOfflineCheckin(
  payload: OfflineCheckinPayload
): Promise<void> {
  const queue = await getOfflineQueue();

  const queuedItem: QueuedCheckin = {
    ...payload,
    id: crypto.randomUUID(),
    queuedAt: new Date().toISOString(),
    retryCount: 0,
  };

  queue.push(queuedItem);
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export async function getOfflineQueue(): Promise<QueuedCheckin[]> {
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as QueuedCheckin[];
  } catch {
    return [];
  }
}

export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getOfflineQueue();
  const filtered = queue.filter((item) => item.id !== id);
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
}

export async function updateQueueItem(
  id: string,
  updates: Partial<QueuedCheckin>
): Promise<void> {
  const queue = await getOfflineQueue();
  const index = queue.findIndex((item) => item.id === id);

  if (index === -1) {
    return;
  }

  queue[index] = { ...queue[index], ...updates };
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export async function clearOfflineQueue(): Promise<void> {
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
}
