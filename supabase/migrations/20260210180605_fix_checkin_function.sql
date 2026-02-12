-- ============================================
-- FIX: Check-in Functions
-- ============================================

-- Helper: Verify event token
create or replace function yombri.verify_event_token(
  p_event_id uuid,
  p_token text
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public, yombri, extensions
as $$
declare
  v_stored_record record;
begin
  select * into v_stored_record
  from public.event_token_nonces etn
  where etn.event_id = p_event_id
    and etn.token = p_token
    and etn.expires_at > now()
    and etn.used_at is null;

  if not found then
    return false;
  end if;

  update public.event_token_nonces etn
  set used_at = now()
  where etn.event_id = p_event_id 
    and etn.token = p_token;

  return true;
end;
$$;

-- Magic check-in (geo/token)
create or replace function yombri.verify_check_in(
  p_actor_id uuid,
  p_event_id uuid,
  p_lat double precision default null,
  p_lng double precision default null,
  p_event_token text default null
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
  v_method public.checkin_method;
  v_verified boolean := false;
  v_distance_m double precision;
  v_token_valid boolean;
  v_event_id_param uuid := p_event_id;
  v_actor_id_param uuid := p_actor_id;
begin
  if p_actor_id is null then
    raise exception 'AUTHENTICATION_REQUIRED';
  end if;

  select * into v_event
  from public.events e
  where e.id = v_event_id_param
    and e.deleted_at is null;

  if not found then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  if v_event.status != 'scheduled' then
    raise exception 'EVENT_NOT_ACTIVE';
  end if;

  select * into v_participant
  from public.event_participants ep
  where ep.event_id = v_event_id_param
    and ep.user_id = v_actor_id_param;

  if not found then
    execute 'insert into public.event_participants (event_id, user_id, status) values ($1, $2, $3::public.participant_status) on conflict (event_id, user_id) do nothing'
    using v_event_id_param, v_actor_id_param, 'joined';
    
    select * into v_participant
    from public.event_participants ep
    where ep.event_id = v_event_id_param
      and ep.user_id = v_actor_id_param;
  end if;

  if v_participant.status = 'ejected' then
    raise exception 'PERMISSION_DENIED';
  end if;

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

  if p_event_token is not null then
    v_token_valid := yombri.verify_event_token(v_event_id_param, p_event_token);
    
    if v_token_valid then
      v_verified := true;
      v_method := 'qr';
    end if;
    
  elsif p_lat is not null and p_lng is not null then
    if p_lat < -90 or p_lat > 90 or p_lng < -180 or p_lng > 180 then
      raise exception 'INVALID_COORDINATES';
    end if;
    
    select st_distance(
      v_event.location,
      st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography
    ) into v_distance_m;
    
    if v_distance_m <= v_event.checkin_radius_m then
      v_verified := true;
      v_method := 'geo';
    end if;
  end if;

  if not v_verified then
    raise exception 'VERIFICATION_FAILED';
  end if;

  update public.event_participants ep
  set 
    status = 'checked_in',
    checked_in_at = now(),
    checkin_method = v_method
  where ep.event_id = v_event_id_param
    and ep.user_id = v_actor_id_param;

  return query
  select 
    v_event_id_param,
    v_actor_id_param,
    'checked_in'::public.participant_status,
    now(),
    v_method;
end;
$$;

-- TOTP check-in
create or replace function yombri.verify_check_in_totp(
  p_actor_id uuid,
  p_event_id uuid,
  p_code integer,
  p_client_time timestamptz
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
begin
  if p_actor_id is null then
    raise exception 'AUTHENTICATION_REQUIRED';
  end if;

  select * into v_event
  from public.events e
  where e.id = v_event_id_param
    and e.deleted_at is null;

  if not found then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  select * into v_attempt_record
  from public.event_checkin_attempts eca
  where eca.event_id = v_event_id_param
    and eca.user_id = v_actor_id_param;

  if v_attempt_record.failed_count >= 3 and 
     v_attempt_record.cooldown_until > now() then
    raise exception 'RATE_LIMIT_EXCEEDED';
  end if;

  select totp_secret into v_totp_secret
  from public.event_secrets
  where event_secrets.event_id = v_event_id_param;

  if v_totp_secret is null then
    raise exception 'TOTP_NOT_CONFIGURED';
  end if;

  v_expected_code := yombri.totp_code(v_totp_secret, p_client_time, 30, 6, 0);

  if p_code != v_expected_code then
    insert into public.event_checkin_attempts (event_id, user_id, failed_count, cooldown_until)
    values (v_event_id_param, v_actor_id_param, 1, now() + interval '1 minute')
    on conflict (event_id, user_id) do update
    set 
      failed_count = event_checkin_attempts.failed_count + 1,
      cooldown_until = case 
        when event_checkin_attempts.failed_count + 1 >= 3 
        then now() + interval '5 minutes'
        else now() + interval '1 minute'
      end,
      last_attempt_at = now();
    
    raise exception 'VERIFICATION_FAILED';
  end if;

  delete from public.event_checkin_attempts
  where event_checkin_attempts.event_id = v_event_id_param
    and event_checkin_attempts.user_id = v_actor_id_param;

  select * into v_participant
  from public.event_participants ep
  where ep.event_id = v_event_id_param
    and ep.user_id = v_actor_id_param;

  if not found then
    execute 'insert into public.event_participants (event_id, user_id, status) values ($1, $2, $3::public.participant_status) on conflict (event_id, user_id) do nothing'
    using v_event_id_param, v_actor_id_param, 'joined';
    
    select * into v_participant
    from public.event_participants ep
    where ep.event_id = v_event_id_param
      and ep.user_id = v_actor_id_param;
  end if;

  if v_participant.status = 'ejected' then
    raise exception 'PERMISSION_DENIED';
  end if;

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
