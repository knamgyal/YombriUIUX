import type { OfflineCheckinPayload, CheckinMethod } from '../../types';

const payload: OfflineCheckinPayload = {
  event_id: 'event-123',
  user_id: 'user-123',
  method: 'totp' as CheckinMethod, // or the exact valid literal from src/types.ts
  occurred_at: new Date().toISOString(),
  ticket: 'ticket-123',
};

const newPayload: OfflineCheckinPayload = {
  event_id: 'event-456',
  user_id: 'user-123',
  method: 'totp' as CheckinMethod, // or the exact valid literal from src/types.ts
  occurred_at: new Date().toISOString(),
  ticket: 'ticket-456',
};
