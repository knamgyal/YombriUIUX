-- Atomic ejection RPC (4.4)
CREATE OR REPLACE FUNCTION eject_user_from_event(
  p_event_id uuid,
  p_user_id uuid,
  p_ejector_id uuid
) RETURNS void AS $$
BEGIN
  -- Verify ejector is organizer
  PERFORM 1 FROM events WHERE id = p_event_id AND organizer_id = p_ejector_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not organizer';
  END IF;

  -- Atomic removal
  DELETE FROM group_members WHERE group_id IN (
    SELECT id FROM groups WHERE event_id = p_event_id
  ) AND user_id = p_user_id;

  UPDATE event_participants 
  SET status = 'ejected', updated_by = p_ejector_id 
  WHERE event_id = p_event_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS already grounds access in these tables
