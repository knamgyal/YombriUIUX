-- ============================================
-- FIX: TOTP - Remove Column Ambiguity
-- ============================================

drop function if exists yombri.verify_check_in_totp(uuid, uuid, integer, timestamptz);

create or replace function yombri.verify_check_in_totp(
  p_actor_id uuid,
  p_event_id uuid,
  p_code integer,
  p_client_time timestamptz default now()
)
returns table(
  event_id uuid,
  user_id uuid,
  status public.participant_status,
  checked_in_at timestamptz,
  checkin_method public.checkin_method
)
language plpgsql
security definer
set search_path = pg_catalog, public, yombri, extensions
as $$
declare
  v_event record;
  v_participant record;
  v_totp_secret bytea;
  v_expected_code int;
  v_attempt_record record;
  v_event_id_param uuid := p_event_id;
  v_actor_id_param uuid := p_actor_id;
  v_code_valid boolean := false;
  v_offset int;
  v_window int := 1;
  v_new_failed_count int;
  v_new_cooldown timestamptz;
begin
  if p_actor_id is null then
    raise exception 'AUTHENTICATION_REQUIRED';
  end if;

  if p_code is null then
    raise exception 'VERIFICATION_FAILED' using hint = 'TOTP code required';
  end if;

  -- Get event
  select * into v_event
  from public.events e
  where e.id = v_event_id_param
    and e.deleted_at is null;

  if not found then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  -- Check rate limiting
  select * into v_attempt_record
  from public.event_checkin_attempts eca
  where eca.event_id = v_event_id_param
    and eca.user_id = v_actor_id_param;

  if v_attempt_record.failed_count >= 3 and 
     v_attempt_record.cooldown_until > now() then
    raise exception 'RATE_LIMIT_EXCEEDED' using hint = 'Too many failed attempts';
  end if;

  -- Get TOTP secret
  select totp_secret into strict v_totp_secret
  from public.event_secrets es
  where es.event_id = v_event_id_param;

  -- Validate TOTP with time window
  for v_offset in -v_window..v_window loop
    v_expected_code := yombri.totp_code(v_totp_secret, p_client_time, 30, 6, v_offset);
    if p_code = v_expected_code then
      v_code_valid := true;
      exit;
    end if;
  end loop;

  -- If code invalid, record failure
  if not v_code_valid then
    -- Calculate new values
    if v_attempt_record.event_id is not null then
      v_new_failed_count := v_attempt_record.failed_count + 1;
      if v_new_failed_count >= 3 then
        v_new_cooldown := now() + interval '5 minutes';
      else
        v_new_cooldown := now() + interval '1 minute';
      end if;
      
      -- Update existing record
      update public.event_checkin_attempts eca
      set 
        failed_count = v_new_failed_count,
        last_failed_at = now(),
        cooldown_until = v_new_cooldown,
        updated_at = now()
      where eca.event_id = v_event_id_param
        and eca.user_id = v_actor_id_param;
    else
      -- Insert new record (use dynamic SQL to avoid ambiguity)
      execute 'insert into public.event_checkin_attempts (event_id, user_id, failed_count, cooldown_until, last_failed_at) values ($1, $2, $3, $4, $5)'
      using v_event_id_param, v_actor_id_param, 1, now() + interval '1 minute', now();
    end if;
    
    raise exception 'VERIFICATION_FAILED' using hint = 'Invalid TOTP code';
  end if;

  -- Valid code - reset attempts
  delete from public.event_checkin_attempts eca
  where eca.event_id = v_event_id_param
    and eca.user_id = v_actor_id_param;

  -- Ensure participant exists (use dynamic SQL)
  execute 'insert into public.event_participants (event_id, user_id, status) values ($1, $2, $3::public.participant_status) on conflict (event_id, user_id) do nothing'
  using v_event_id_param, v_actor_id_param, 'joined';

  -- Get participant
  select * into v_participant
  from public.event_participants ep
  where ep.event_id = v_event_id_param
    and ep.user_id = v_actor_id_param;

  if v_participant.status = 'ejected' then
    raise exception 'PERMISSION_DENIED';
  end if;

  -- If already checked in, return existing
  if v_participant.status = 'checked_in' then
    return query
    select 
      v_event_id_param,
      v_actor_id_param,
      'checked_in'::public.participant_status,
      v_participant.checked_in_at,
      v_participant.checkin_method;
    return;
  end if;

  -- Mark as checked in
  update public.event_participants ep
  set 
    status = 'checked_in',
    checked_in_at = now(),
    checkin_method = 'totp'
  where ep.event_id = v_event_id_param
    and ep.user_id = v_actor_id_param;

  return query
  select 
    v_event_id_param,
    v_actor_id_param,
    'checked_in'::public.participant_status,
    now(),
    'totp'::public.checkin_method;
end;
$$;

comment on function yombri.verify_check_in_totp is
  'TOTP-based check-in with rate limiting. Validates codes within ±30 second window.';
