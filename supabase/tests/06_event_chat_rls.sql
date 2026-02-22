\set ON_ERROR_STOP on
BEGIN;

CREATE SCHEMA IF NOT EXISTS test;

-- Use request.jwt.claim.sub + request.jwt.claim.role (matches Supabase auth patterns)
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
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_got IS DISTINCT FROM p_expected THEN
    RAISE EXCEPTION 'ASSERT_EQ failed: %, got=%, expected=%', p_msg, p_got, p_expected;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION test.assert_throws(p_sql text, p_msg text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  BEGIN
    EXECUTE p_sql;
    RAISE EXCEPTION 'ASSERT_THROWS failed: % (statement succeeded but should fail)', p_msg;
  EXCEPTION WHEN others THEN
    RETURN;
  END;
END;
$$;

-- Fail fast if core tables missing
DO $$
BEGIN
  IF to_regclass('public.events') IS NULL THEN RAISE EXCEPTION 'Missing table: public.events'; END IF;
  IF to_regclass('public.groups') IS NULL THEN RAISE EXCEPTION 'Missing table: public.groups'; END IF;
  IF to_regclass('public.group_members') IS NULL THEN RAISE EXCEPTION 'Missing table: public.group_members'; END IF;
  IF to_regclass('public.event_participants') IS NULL THEN RAISE EXCEPTION 'Missing table: public.event_participants'; END IF;
  IF to_regclass('public.messages') IS NULL THEN RAISE EXCEPTION 'Missing table: public.messages'; END IF;
  IF to_regclass('public.users') IS NULL THEN RAISE EXCEPTION 'Missing table: public.users'; END IF;
  IF to_regclass('auth.users') IS NULL THEN RAISE EXCEPTION 'Missing table: auth.users'; END IF;
END$$;

-- -----------------------------------------
-- Resolve real auth user IDs (by email)
-- (requires you ran seed_section_a_users.mjs)
-- -----------------------------------------
SELECT id AS organizer_id FROM auth.users WHERE email = 'organizer1@test.local'; \gset
SELECT id AS participant_id FROM auth.users WHERE email = 'participant1@test.local'; \gset
SELECT id AS nonparticipant_id FROM auth.users WHERE email = 'nonparticipant1@test.local'; \gset

-- Assert they exist
SELECT test.assert_eq_int((SELECT count(*)::int FROM auth.users WHERE email='organizer1@test.local'), 1, 'organizer auth user exists');
SELECT test.assert_eq_int((SELECT count(*)::int FROM auth.users WHERE email='participant1@test.local'), 1, 'participant auth user exists');
SELECT test.assert_eq_int((SELECT count(*)::int FROM auth.users WHERE email='nonparticipant1@test.local'), 1, 'non-participant auth user exists');

-- Seed public.users rows (child FK to auth.users)
INSERT INTO public.users (id)
VALUES
  ((:'organizer_id')::uuid),
  ((:'participant_id')::uuid),
  ((:'nonparticipant_id')::uuid)
ON CONFLICT (id) DO NOTHING;

-- Deterministic IDs for event/group/message rows
-- event: 000...0101, group: 000...0201
INSERT INTO public.events (
  id,
  organizer_id,
  title,
  starts_at,
  status,
  location,
  checkin_radius_m,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000101',
  ((:'organizer_id')::uuid),
  'Test Event',
  now() + interval '1 day',
  'scheduled',
  ST_Point(-77.0365, 38.8977, 4326)::geography,
  150,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.groups (id, kind, event_id, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000201',
  'event'::group_kind,
  '00000000-0000-0000-0000-000000000101',
  (:'organizer_id')::uuid
)
ON CONFLICT (id) DO NOTHING;


-- Membership required for chat access
INSERT INTO public.group_members (group_id, user_id)
VALUES
  ('00000000-0000-0000-0000-000000000201', ((:'organizer_id')::uuid)),
  ('00000000-0000-0000-0000-000000000201', ((:'participant_id')::uuid))
ON CONFLICT DO NOTHING;

-- Replace your existing event_participants insert with this:
INSERT INTO public.event_participants (event_id, user_id, status)
VALUES
  ('00000000-0000-0000-0000-000000000101', (:'participant_id')::uuid, 'joined')
ON CONFLICT DO NOTHING;

SELECT test.assert_eq_int(
  (SELECT count(*)::int
   FROM public.event_participants
   WHERE event_id='00000000-0000-0000-0000-000000000101'
     AND user_id=(:'participant_id')::uuid
     AND status='joined'),
  1,
  'participant seeded as joined'
);

-- Allow authenticated role to call test helpers after SET LOCAL ROLE authenticated
GRANT USAGE ON SCHEMA test TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA test TO authenticated;


INSERT INTO public.messages (group_id, sender_id, body)
VALUES ('00000000-0000-0000-0000-000000000201', ((:'participant_id')::uuid), 'Hello!')
ON CONFLICT DO NOTHING;

-- TEST 1: Participant READ
SELECT test.set_auth((:'participant_id')::uuid);
SELECT test.assert_eq_int(
  (SELECT count(*)::int FROM public.messages WHERE group_id = '00000000-0000-0000-0000-000000000201'),
  1,
  'participant should read 1 message'
);

-- TEST 2: Participant INSERT
INSERT INTO public.messages (group_id, sender_id, body)
VALUES ('00000000-0000-0000-0000-000000000201', ((:'participant_id')::uuid), 'Reply');

-- TEST 3: Non-participant READ
SELECT test.set_auth((:'nonparticipant_id')::uuid);
SELECT test.assert_eq_int(
  (SELECT count(*)::int FROM public.messages WHERE group_id = '00000000-0000-0000-0000-000000000201'),
  0,
  'non-participant should read 0 messages'
);

-- TEST 4: Non-participant INSERT
SELECT test.assert_throws(
  $$INSERT INTO public.messages (group_id, sender_id, body)
    VALUES ('00000000-0000-0000-0000-000000000201', (SELECT id FROM auth.users WHERE email='nonparticipant1@test.local'), 'Intruder')$$,
  'non-participant insert should fail'
);

SELECT test.reset_auth();
COMMIT;
