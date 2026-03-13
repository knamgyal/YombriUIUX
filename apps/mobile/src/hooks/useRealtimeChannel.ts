import { useEffect } from 'react';
import { onNewGroupMessage } from '@yombri/supabase-client';
import type { Message } from '@yombri/supabase-client';

export function useEventMessages(
  groupId: string | undefined,
  onNewMessage: (message: Message) => void
) {
  useEffect(() => {
    if (!groupId) return;

    const sub = onNewGroupMessage(groupId, onNewMessage);

    return () => {
      sub.unsubscribe();
    };
  }, [groupId, onNewMessage]);
}
