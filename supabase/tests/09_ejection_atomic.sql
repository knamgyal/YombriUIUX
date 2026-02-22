\set ON_ERROR_STOP on
BEGIN;

CREATE SCHEMA IF NOT EXISTS test;

CREATE OR REPLACE FUNCTION test.set_auth(p_sub uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', p_sub::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  EXECUTE 'SET LOCAL ROLE authenticated';
END;
$$;

CREATE OR REPLACE FUNCTION test.reset_auth()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE 'RESET ROLE';
  PERFORM set_config('request.jwt.claim.sub', '', true);
  PERFORM set_config('request.jwt.claim.role', '', true);
END;
$$;

CREATE OR REPLACE FUNCTION test.assert_throws(p_sql text, p_msg text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  BEGIN
    EXECUTE p_sql;
    RAISE EXCEPTION 'ASSERT_THROWS failed: %', p_msg;
  EXCEPTION WHEN others THEN
    RETURN;
  END;
END;
$$;

CREATE OR REPLACE FUNCTION test.assert_eq_int(p_got int, p_expected int, p_msg text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_got IS DISTINCT FROM p_expected THEN
    RAISE EXCEPTION 'ASSERT_EQ failed: %, got=%, expected=%', p_msg, p_got, p_expected;
  END IF;
END;
$$;

DO $$
BEGIN
  -- Function identity is name + argument types, not parameter names
  IF to_regprocedure('public.eject_user_from_event(uuid,uuid,uuid)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.eject_user_from_event(uuid,uuid,uuid)';
  END IF;

  IF to_regclass('auth.users') IS NULL THEN RAISE EXCEPTION 'Missing table: auth.users'; END IF;
  IF to_regclass('public.users') IS NULL THEN RAISE EXCEPTION 'Missing table: public.users'; END IF;

  IF to_regclass('public.events') IS NULL THEN RAISE EXCEPTION 'Missing table: public.events'; END IF;
  IF to_regclass('public.groups') IS NULL THEN RAISE EXCEPTION 'Missing table: public.groups'; END IF;
  IF to_regclass('public.group_members') IS NULL THEN RAISE EXCEPTION 'Missing table: public.group_members'; END IF;
  IF to_regclass('public.event_participants') IS NULL THEN RAISE EXCEPTION 'Missing table: public.event_participants'; END IF;
  IF to_regclass('public.messages') IS NULL THEN RAISE EXCEPTION 'Missing table: public.messages'; END IF;
END$$;


-- Resolve real IDs
SELECT id AS organizer_id   FROM auth.users WHERE email='organizer1@test.local'; \gset
SELECT id AS participant_id FROM auth.users WHERE email='participant1@test.local'; \gset

SELECT test.assert_eq_int((SELECT count(*)::int FROM auth.users WHERE email='organizer1@test.local'), 1, 'organizer auth user exists');
SELECT test.assert_eq_int((SELECT count(*)::int FROM auth.users WHERE email='participant1@test.local'), 1, 'participant auth user exists');

-- Ensure public.users rows exist (FK to auth.users)
INSERT INTO public.users (id)
VALUES ((:'organizer_id')::uuid), ((:'participant_id')::uuid)
ON CONFLICT (id) DO NOTHING;

-- Fixtures (must satisfy NOT NULL columns on events)
INSERT INTO public.events (
  id, organizer_id, title, starts_at, status, location, checkin_radius_m, created_at, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000101',
  (:'organizer_id')::uuid,
  'Test Event',
  now() + interval '1 day',
  'scheduled',
ST_SetSRID(ST_MakePoint(-77.0365, 38.8977), 4326)::geography,
  150,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- FIXED: groups insert matches your schema (no "name" column)
INSERT INTO public.groups (id, kind, event_id, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000201',
  'event'::group_kind,
  '00000000-0000-0000-0000-000000000101',
  (:'organizer_id')::uuid
)
ON CONFLICT (id) DO NOTHING;


-- Ensure membership exists (so revoke is meaningful)
INSERT INTO public.group_members (group_id, user_id)
VALUES
  ('00000000-0000-0000-0000-000000000201', (:'organizer_id')::uuid),
  ('00000000-0000-0000-0000-000000000201', (:'participant_id')::uuid)
ON CONFLICT DO NOTHING;

INSERT INTO public.event_participants (event_id, user_id, status)
VALUES
  ('00000000-0000-0000-0000-000000000101', (:'participant_id')::uuid, 'joined')
ON CONFLICT DO NOTHING;

SELECT test.assert_eq_int(
  (SELECT count(*)::int
   FROM public.event_participants
   WHERE event_id='00000000-0000-0000-0000-000000000101'::uuid
     AND user_id=(:'participant_id')::uuid
     AND status='joined'),
  1,
  'participant starts joined'
);



-- (Optional) a baseline message
INSERT INTO public.messages (group_id, sender_id, body)
VALUES ('00000000-0000-0000-0000-000000000201', (:'participant_id')::uuid, 'Before ejection')
ON CONFLICT DO NOTHING;

-- Allow authenticated role to call test helpers after SET LOCAL ROLE authenticated
GRANT USAGE ON SCHEMA test TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA test TO authenticated;


-- Eject (must be atomic)
SELECT test.set_auth((:'organizer_id')::uuid);

SELECT public.eject_user_from_event(
  '00000000-0000-0000-0000-000000000101'::uuid,
  (:'participant_id')::uuid,
  (:'organizer_id')::uuid
);


SELECT test.assert_eq_int(
  (SELECT count(*)::int
   FROM public.event_participants
   WHERE event_id='00000000-0000-0000-0000-000000000101'::uuid
     AND user_id=(:'participant_id')::uuid
     AND status='ejected'),
  1,
  'participant status updated to ejected'
);


-- Post-ejection: participant cannot INSERT message (RLS deny)
SELECT test.set_auth((:'participant_id')::uuid);

SELECT test.assert_throws(
  format(
    'INSERT INTO public.messages (group_id, sender_id, body) VALUES (%L, %L, %L)',
    '00000000-0000-0000-0000-000000000201',
    (:'participant_id')::uuid,
    'should fail'
  ),
  'ejected user cannot insert'
);

-- Idempotency: eject again should not error
SELECT test.set_auth((:'organizer_id')::uuid);

SELECT public.eject_user_from_event(
  '00000000-0000-0000-0000-000000000101',
  (:'participant_id')::uuid,
  (:'organizer_id')::uuid
);

SELECT test.reset_auth();
COMMIT;
