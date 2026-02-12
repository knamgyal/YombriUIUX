-- ============================================
-- FIX: Token Minting and TOTP
-- ============================================

-- Drop existing functions
drop function if exists yombri.totp_code(bytea, timestamptz, integer, integer, integer);
drop function if exists yombri.mint_event_token(uuid, uuid, integer);

-- TOTP code generation (fixed type casting)
create or replace function yombri.totp_code(
  p_secret bytea,
  p_time timestamptz,
  p_period_seconds integer default 30,
  p_digits integer default 6,
  p_offset integer default 0
)
returns integer
language plpgsql
immutable
as $$
declare
  v_time_counter bigint;
  v_hmac bytea;
  v_offset integer;
  v_code bigint;
begin
  v_time_counter := (extract(epoch from p_time)::bigint / p_period_seconds) + p_offset;
  
  v_hmac := extensions.hmac(
    decode(lpad(to_hex(v_time_counter), 16, '0'), 'hex'),
    p_secret,
    'sha1'
  );
  
  v_offset := (get_byte(v_hmac, 19) & 15);
  
  v_code := (
    ((get_byte(v_hmac, v_offset) & 127) << 24) |
    (get_byte(v_hmac, v_offset + 1) << 16) |
    (get_byte(v_hmac, v_offset + 2) << 8) |
    get_byte(v_hmac, v_offset + 3)
  );
  
  -- Use power() and cast to avoid double precision
  return (v_code % power(10, p_digits)::bigint)::integer;
end;
$$;

comment on function yombri.totp_code is
  'Generates a TOTP code based on RFC 6238 specification.';

-- Token minting (QR codes)
create or replace function yombri.mint_event_token(
  p_actor_id uuid,
  p_event_id uuid,
  p_ttl_seconds integer default 3600
)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public, yombri, extensions
as $$
declare
  v_event record;
  v_is_admin boolean;
  v_token text;
  v_nonce text;
  v_secret bytea;
  v_hmac bytea;
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

  select exists(
    select 1 from public.event_admins ea
    where ea.event_id = p_event_id and ea.user_id = p_actor_id
  ) into v_is_admin;

  if not v_is_admin then
    raise exception 'PERMISSION_DENIED';
  end if;

  v_nonce := encode(extensions.gen_random_bytes(16), 'hex');

  select token_secret into v_secret
  from public.event_secrets
  where event_id = p_event_id;

  if v_secret is null then
    v_secret := extensions.gen_random_bytes(32);
    insert into public.event_secrets (event_id, token_secret)
    values (p_event_id, v_secret)
    on conflict (event_id) do update
    set token_secret = excluded.token_secret;
  end if;

  v_hmac := extensions.hmac(v_nonce::bytea, v_secret, 'sha256');
  v_token := v_nonce || encode(v_hmac, 'hex');

  insert into public.event_token_nonces (event_id, token, expires_at)
  values (p_event_id, v_token, now() + (p_ttl_seconds || ' seconds')::interval);

  return v_token;
end;
$$;

comment on function yombri.mint_event_token is
  'Generates a signed token for event check-in (QR code). Admin only.';
