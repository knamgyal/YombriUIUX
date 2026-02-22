CREATE OR REPLACE FUNCTION public.eject_user_from_event(
  p_event_id uuid,
  p_user_id uuid,
  p_ejector_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
BEGIN
  -- Authorization (match what your policies use elsewhere)
  IF NOT yombri.is_event_admin(p_event_id, p_ejector_id) THEN
    RAISE EXCEPTION 'PERMISSION_DENIED';
  END IF;

  -- Remove from the event group so message INSERT RLS denies afterwards
  DELETE FROM public.group_members gm
  USING public.groups g
  WHERE gm.group_id = g.id
    AND g.event_id = p_event_id
    AND gm.user_id = p_user_id;

  -- Ensure participant is ejected; clear check-in fields to satisfy your CHECK constraint
  INSERT INTO public.event_participants (event_id, user_id, status, checked_in_at, checkin_method)
  VALUES (p_event_id, p_user_id, 'ejected', NULL, NULL)
  ON CONFLICT (event_id, user_id) DO UPDATE
  SET status = 'ejected',
      checked_in_at = NULL,
      checkin_method = NULL;
END;
$$;

-- Ensure it’s owned by a privileged role (optional if already postgres)
ALTER FUNCTION public.eject_user_from_event(uuid,uuid,uuid) OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.eject_user_from_event(uuid,uuid,uuid) TO authenticated;
