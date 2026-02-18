export type AnalyticsEvent =
  | { type: 'feed_viewed' }
  | { type: 'interest_started'; eventId?: string }
  | { type: 'interest_completed'; location: { lat: number; lng: number } }
  | { type: 'event_viewed'; eventId: string }
  | { type: 'event_joined'; eventId: string }
  | { type: 'checkin_attempt'; eventId: string; method: 'geo' | 'qr' | 'totp' }
  | { type: 'checkin_success'; eventId: string; method: 'geo' | 'qr' | 'totp' | 'offline' }
  | { type: 'checkin_failure'; eventId: string; method: 'geo' | 'qr' | 'totp'; reason: string }
  | { type: 'artifact_created'; eventId: string; artifactId: string };

export interface AnalyticsContext {
  userId?: string;
  timestamp: number;
  sessionId: string;
}
