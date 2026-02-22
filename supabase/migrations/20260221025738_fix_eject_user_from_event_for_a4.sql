BEGIN;

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
  -- Verify ejector is organizer (matches the A4 test setup)
  PERFORM 1
  FROM public.events e
  WHERE e.id = p_event_id
    AND e.organizer_id = p_ejector_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PERMISSION_DENIED';
  END IF;

  -- Remove from all groups for this event (so messages INSERT RLS denies afterwards)
  DELETE FROM public.group_members gm
  USING public.groups g
  WHERE gm.group_id = g.id
    AND g.event_id = p_event_id
    AND gm.user_id = p_user_id;

  -- Mark participant ejected; clear check-in fields to satisfy your CHECK constraint
  UPDATE public.event_participants ep
  SET status = 'ejected'::participant_status,
      checked_in_at = NULL,
      checkin_method = NULL
  WHERE ep.event_id = p_event_id
    AND ep.user_id = p_user_id;

  -- Idempotent by design: DELETE/UPDATE affecting 0 rows is not an error.
END;
$$;

-- Production discipline for SECURITY DEFINER: don't leave EXECUTE to PUBLIC.
REVOKE ALL ON FUNCTION public.eject_user_from_event(uuid,uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.eject_user_from_event(uuid,uuid,uuid) TO authenticated;

COMMIT;
