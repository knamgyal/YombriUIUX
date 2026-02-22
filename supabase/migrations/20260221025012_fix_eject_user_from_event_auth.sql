CREATE OR REPLACE FUNCTION public.eject_user_from_event(
  p_event_id uuid,
  p_user_id uuid,
  p_ejector_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, yombri
SET row_security = off
AS $$
BEGIN
  -- Allow organizer OR event admin
  PERFORM 1
  FROM public.events e
  WHERE e.id = p_event_id
    AND e.organizer_id = p_ejector_id;

  IF NOT FOUND THEN
    IF NOT yombri.is_event_admin(p_event_id, p_ejector_id) THEN
      RAISE EXCEPTION 'PERMISSION_DENIED';
    END IF;
  END IF;

  -- Remove from the event's group(s)
  DELETE FROM public.group_members gm
  USING public.groups g
  WHERE gm.group_id = g.id
    AND g.event_id = p_event_id
    AND gm.user_id = p_user_id;

  -- Ensure participant ends up ejected; clear check-in fields to satisfy your CHECK constraint
  INSERT INTO public.event_participants (event_id, user_id, status, checked_in_at, checkin_method)
  VALUES (p_event_id, p_user_id, 'ejected', NULL, NULL)
  ON CONFLICT (event_id, user_id) DO UPDATE
  SET status = 'ejected',
      checked_in_at = NULL,
      checkin_method = NULL;
END;
$$;

ALTER FUNCTION public.eject_user_from_event(uuid,uuid,uuid) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.eject_user_from_event(uuid,uuid,uuid) TO authenticated;
