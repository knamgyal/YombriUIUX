CREATE OR REPLACE FUNCTION public.eject_user_from_event(
  p_event_id uuid,
  p_user_id uuid,
  p_ejector_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- Authorization: only organizer (or swap this for your is_event_admin check)
  PERFORM 1
  FROM public.events e
  WHERE e.id = p_event_id
    AND e.organizer_id = p_ejector_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PERMISSION_DENIED';
  END IF;

  -- Remove from the event's group(s)
  DELETE FROM public.group_members gm
  USING public.groups g
  WHERE gm.group_id = g.id
    AND g.event_id = p_event_id
    AND gm.user_id = p_user_id;

  -- Mark ejected; clear check-in fields to satisfy event_participants_check
  UPDATE public.event_participants ep
  SET status = 'ejected',
      checked_in_at = NULL,
      checkin_method = NULL
  WHERE ep.event_id = p_event_id
    AND ep.user_id = p_user_id;

  -- Optional: idempotency: do nothing if the row doesn't exist
  -- (Leave as-is; UPDATE 0 rows is fine)
END;
$$;
