import { useCallback } from 'react';
import Constants from 'expo-constants';
import { AnalyticsEvent, AnalyticsContext } from '../types/analytics';
import { supabaseClient } from '@yombri/supabase-client';

export function useAnalytics() {
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    const context: AnalyticsContext = {
      timestamp: Date.now(),
      sessionId: Constants.sessionId,
    };

    try {
      const user = await supabaseClient.getCurrentUserId();
      if (user) {
        (context as any).userId = user;
      }
    } catch {
      // User not authenticated, continue without userId
    }

    const payload = {
      event_type: event.type,
      event_data: event,
      context,
      created_at: new Date().toISOString(),
    };

    // Fire and forget - don't block UI
    supabaseClient
      .getClient()
      .from('analytics_events')
      .insert(payload)
      .then(() => {
        // Success - no action needed
      })
      .catch((err) => {
        // Log silently, don't throw
        console.warn('Analytics event failed:', err.message);
      });
  }, []);

  return { trackEvent };
}
