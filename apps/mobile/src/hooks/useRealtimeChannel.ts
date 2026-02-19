import { useEffect, useRef } from 'react';
import { onNewEventMessage } from '@yombri/supabase-client';

export function useEventMessages(eventId: string, onNewMessage: (message: any) => void) {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    unsubscribeRef.current = onNewEventMessage(eventId, onNewMessage);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [eventId, onNewMessage]);
}
