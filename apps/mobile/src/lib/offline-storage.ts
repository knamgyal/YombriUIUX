import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_TICKET_PREFIX = '@yombri/offline_ticket:';

export async function storeOfflineTicket(
  eventId: string,
  ticket: string,
  expiresAt: string
): Promise<void> {
  const key = `${OFFLINE_TICKET_PREFIX}${eventId}`;
  const data = { ticket, expiresAt };
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export async function getOfflineTicket(
  eventId: string
): Promise<{ ticket: string; expiresAt: string } | null> {
  const key = `${OFFLINE_TICKET_PREFIX}${eventId}`;
  const raw = await AsyncStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    const data = JSON.parse(raw);
    const expiresAt = new Date(data.expiresAt);

    if (expiresAt < new Date()) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function clearOfflineTicket(eventId: string): Promise<void> {
  const key = `${OFFLINE_TICKET_PREFIX}${eventId}`;
  await AsyncStorage.removeItem(key);
}
