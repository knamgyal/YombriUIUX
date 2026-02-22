BEGIN;

DROP POLICY IF EXISTS event_participants_select_self_or_admin
ON public.event_participants;

CREATE POLICY event_participants_select_self_or_admin
ON public.event_participants
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR yombri.is_event_admin(event_id, auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = event_id
      AND e.organizer_id = auth.uid()
  )
);

COMMIT;
