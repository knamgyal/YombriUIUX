-- ============================================
-- FIX: Event Token Nonces Schema
-- ============================================

-- Make used_at nullable (it should only be set when token is actually used)
alter table public.event_token_nonces 
  alter column used_at drop not null,
  alter column used_at drop default;

-- Rename nonce to token for consistency with function names
alter table public.event_token_nonces 
  rename column nonce to token;

-- Update comment
comment on table public.event_token_nonces is 
  'Track event check-in tokens (QR codes). Tokens expire and can only be used once.';

comment on column public.event_token_nonces.token is 
  'The actual token value (signed with event secret)';

comment on column public.event_token_nonces.used_at is 
  'Timestamp when token was consumed. NULL = not yet used.';

  -- ============================================
-- Token Functions (Updated)
-- ============================================

drop function if exists yombri.mint_event_token(uuid, uuid, integer);
drop function if exists yombri.verify_event_token(uuid, text);

-- Mint token for QR check-in
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
  v_nonce_value text;
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

  v_nonce_value := encode(extensions.gen_random_bytes(16), 'hex');

  select token_secret into v_secret
  from public.event_secrets
  where event_secrets.event_id = p_event_id;

  if v_secret is null then
    v_secret := extensions.gen_random_bytes(32);
    insert into public.event_secrets (event_id, token_secret)
    values (p_event_id, v_secret)
    on conflict (event_id) do update
    set token_secret = excluded.token_secret;
  end if;

  v_hmac := extensions.hmac(v_nonce_value::bytea, v_secret, 'sha256');
  v_token := v_nonce_value || encode(v_hmac, 'hex');

  -- Insert token (used_at is NULL initially)
  insert into public.event_token_nonces (event_id, token, expires_at)
  values (p_event_id, v_token, now() + (p_ttl_seconds || ' seconds')::interval);

  return v_token;
end;
$$;

comment on function yombri.mint_event_token is
  'Generates a signed token for event check-in (QR code). Admin only.';

-- Verify token
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

  -- Mark as used
  update public.event_token_nonces etn
  set used_at = now()
  where etn.event_id = p_event_id 
    and etn.token = p_token;

  return true;
end;
$$;

comment on function yombri.verify_event_token is
  'Verifies an event token (from QR code) and marks it as used. Returns true if valid.';

