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

CREATE OR REPLACE FUNCTION test.assert_eq_int(p_got int, p_expected int, p_msg text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF p_got IS DISTINCT FROM p_expected THEN
    RAISE EXCEPTION 'ASSERT_EQ failed: %, got=%, expected=%', p_msg, p_got, p_expected;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION test.assert_throws(p_sql text, p_msg text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  BEGIN
    EXECUTE p_sql;
    RAISE EXCEPTION 'ASSERT_THROWS failed: % (statement succeeded but should fail)', p_msg;
  EXCEPTION WHEN others THEN
    RETURN;
  END;
END;
$$;

DO $$
BEGIN
  IF to_regclass('auth.users') IS NULL THEN RAISE EXCEPTION 'Missing table: auth.users'; END IF;
  IF to_regclass('public.users') IS NULL THEN RAISE EXCEPTION 'Missing table: public.users'; END IF;
  IF to_regclass('public.events') IS NULL THEN RAISE EXCEPTION 'Missing table: public.events'; END IF;
  IF to_regclass('public.groups') IS NULL THEN RAISE EXCEPTION 'Missing table: public.groups'; END IF;
  IF to_regclass('public.group_members') IS NULL THEN RAISE EXCEPTION 'Missing table: public.group_members'; END IF;
  IF to_regclass('public.user_blocks') IS NULL THEN RAISE EXCEPTION 'Missing table: public.user_blocks'; END IF;
  IF to_regclass('public.messages') IS NULL THEN RAISE EXCEPTION 'Missing table: public.messages'; END IF;
END$$;

-- Resolve IDs (requires seed_section_a_users.mjs ran)
SELECT id AS organizer_id FROM auth.users WHERE email='organizer1@test.local'; \gset
SELECT id AS alice_id     FROM auth.users WHERE email='participant1@test.local'; \gset
SELECT id AS bob_id       FROM auth.users WHERE email='nonparticipant1@test.local'; \gset

-- Ensure public.users exist (FK to auth.users)
INSERT INTO public.users (id)
VALUES ((:'organizer_id')::uuid), ((:'alice_id')::uuid), ((:'bob_id')::uuid)
ON CONFLICT (id) DO NOTHING;

-- Ensure event exists (must satisfy NOT NULL cols in your schema)
INSERT INTO public.events (
  id, organizer_id, title, starts_at, status, location, checkin_radius_m, created_at, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000101',
  (:'organizer_id')::uuid,
  'Test Event',
  now() + interval '1 day',
  'scheduled',
  ST_Point(-77.0365, 38.8977, 4326)::geography,
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

-- Ensure membership for organizer/alice/bob (so block semantics are the variable)
INSERT INTO public.group_members (group_id, user_id)
VALUES
  ('00000000-0000-0000-0000-000000000201', (:'organizer_id')::uuid),
  ('00000000-0000-0000-0000-000000000201', (:'alice_id')::uuid),
  ('00000000-0000-0000-0000-000000000201', (:'bob_id')::uuid)
ON CONFLICT DO NOTHING;

-- Allow authenticated role to call test helpers after SET LOCAL ROLE authenticated
GRANT USAGE ON SCHEMA test TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA test TO authenticated;

-- Alice blocks Bob
SELECT test.set_auth((:'alice_id')::uuid);

INSERT INTO public.user_blocks (blocker_id, blocked_id)
VALUES ((:'alice_id')::uuid, (:'bob_id')::uuid)
ON CONFLICT DO NOTHING;

-- Bob tries to send (should be denied if your “block prevents send” is DB-enforced)
SELECT test.set_auth((:'bob_id')::uuid);

SELECT test.assert_throws(
  format(
    'INSERT INTO public.messages (group_id, sender_id, body) VALUES (%L, %L, %L)',
    '00000000-0000-0000-0000-000000000201',
    (:'bob_id')::uuid,
    'Spam'
  ),
  'blocked user insert should fail (RLS)'
);

SELECT test.reset_auth();
COMMIT;
