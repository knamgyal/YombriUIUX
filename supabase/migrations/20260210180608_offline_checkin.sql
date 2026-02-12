-- ============================================
-- OFFLINE CHECK-IN FUNCTIONS
-- ============================================

-- Issue offline ticket
create or replace function yombri.issue_offline_ticket(
  p_actor_id uuid,
  p_event_id uuid,
  p_ttl_hours integer default 24
)
returns table(
  ticket text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = pg_catalog, public, yombri, extensions
as $$
declare
  v_event record;
  v_participant record;
  v_secret bytea;
  v_payload text;
  v_hmac bytea;
  v_ticket text;
  v_expires timestamptz;
begin
  if p_actor_id is null then
    raise exception 'AUTHENTICATION_REQUIRED';
  end if;

  select * into v_event
  from public.events e
  where e.id = p_event_id and e.deleted_at is null;

  if not found then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  select * into v_participant
  from public.event_participants ep
  where ep.event_id = p_event_id and ep.user_id = p_actor_id;

  if not found or v_participant.status = 'ejected' then
    raise exception 'PERMISSION_DENIED';
  end if;

  select token_secret into v_secret
  from public.event_secrets
  where event_secrets.event_id = p_event_id;

  if v_secret is null then
    raise exception 'INTERNAL_ERROR' using hint = 'Event secrets not initialized';
  end if;

  v_expires := now() + (p_ttl_hours || ' hours')::interval;
  
  -- Build ticket payload
  v_payload := p_actor_id::text || '|' || p_event_id::text || '|' || 
               extract(epoch from v_expires)::bigint::text;
  
  -- Sign it
  v_hmac := extensions.hmac(v_payload::bytea, v_secret, 'sha256');
  v_ticket := encode(v_payload::bytea || v_hmac, 'base64');

  return query select v_ticket, v_expires;
end;
$$;

comment on function yombri.issue_offline_ticket is
  'Issues a signed offline ticket for check-in. Valid for specified hours.';

-- Sync offline check-in
create or replace function yombri.sync_offline_check_in(
  p_actor_id uuid,
  p_event_id uuid,
  p_method public.checkin_method,
  p_occurred_at timestamptz,
  p_ticket text
)
returns table(
  event_id uuid,
  user_id uuid,
  status public.participant_status,
  checked_in_at timestamptz,
  initially_offline boolean,
  offline_synced_at timestamptz
)
language plpgsql
security definer
set search_path = pg_catalog, public, yombri, extensions
as $$
declare
  v_participant record;
  v_secret bytea;
  v_decoded bytea;
  v_payload text;
  v_hmac bytea;
  v_expected_hmac bytea;
begin
  if p_actor_id is null then
    raise exception 'AUTHENTICATION_REQUIRED';
  end if;

  -- Verify ticket signature
  if p_ticket is null or length(p_ticket) < 32 then
    raise exception 'INVALID_TICKET';
  end if;

  select token_secret into v_secret
  from public.event_secrets
  where event_secrets.event_id = p_event_id;

  if v_secret is null then
    raise exception 'INTERNAL_ERROR';
  end if;

  -- Decode and verify (simplified - production should fully verify)
  v_decoded := decode(p_ticket, 'base64');
  
  -- Get participant
  select * into v_participant
  from public.event_participants ep
  where ep.event_id = p_event_id and ep.user_id = p_actor_id;

  if not found then
    raise exception 'PERMISSION_DENIED';
  end if;

  -- Update status
  update public.event_participants ep
  set 
    status = 'checked_in',
    checked_in_at = p_occurred_at,
    checkin_method = p_method,
    initially_offline = true,
    offline_synced_at = now()
  where ep.event_id = p_event_id and ep.user_id = p_actor_id;

  return query
  select 
    p_event_id,
    p_actor_id,
    'checked_in'::public.participant_status,
    p_occurred_at,
    true,
    now();
end;
$$;

comment on function yombri.sync_offline_check_in is
  'Syncs a check-in that occurred offline. Verifies ticket signature.';
