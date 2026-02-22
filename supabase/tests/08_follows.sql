\set ON_ERROR_STOP on
BEGIN;

RESET ROLE;
SET LOCAL search_path = public, pg_catalog;

CREATE SCHEMA IF NOT EXISTS test;

-- Helpers
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

-- Allow authenticated role to call test helpers after SET LOCAL ROLE authenticated
GRANT USAGE ON SCHEMA test TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA test TO authenticated;

-- Fail fast: verify required relations exist (catalog-based, schema-qualified)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth' AND c.relname = 'users' AND c.relkind IN ('r','p')
  ) THEN
    RAISE EXCEPTION 'Missing table: auth.users';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'users' AND c.relkind IN ('r','p')
  ) THEN
    RAISE EXCEPTION 'Missing table: public.users';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'follows' AND c.relkind IN ('r','p')
  ) THEN
    RAISE EXCEPTION 'Missing table: public.follows';
  END IF;
END $$;

-- Constraints (idempotent, collision-safe)
DO $$
BEGIN
  -- unique (follower_id, following_id)
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'follows'
      AND c.contype = 'u'
      AND c.conname = 'unique_follow'
  ) THEN
    ALTER TABLE public.follows
      ADD CONSTRAINT unique_follow UNIQUE (follower_id, following_id);
  END IF;

  -- no self-follow
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'follows'
      AND c.contype = 'c'
      AND c.conname = 'no_self_follow'
  ) THEN
    ALTER TABLE public.follows
      ADD CONSTRAINT no_self_follow CHECK (follower_id <> following_id);
  END IF;
END $$;

-- Resolve real IDs (requires seed_section_a_users.mjs ran)
SELECT id AS alice_id FROM auth.users WHERE email='participant1@test.local';
\gset
SELECT id AS bob_id FROM auth.users WHERE email='nonparticipant1@test.local';
\gset

SELECT test.assert_eq_int(
  (SELECT count(*)::int FROM auth.users WHERE email='participant1@test.local'),
  1,
  'alice auth user exists'
);

SELECT test.assert_eq_int(
  (SELECT count(*)::int FROM auth.users WHERE email='nonparticipant1@test.local'),
  1,
  'bob auth user exists'
);

-- Ensure public.users rows exist (FK to auth.users)
INSERT INTO public.users (id)
VALUES ((:'alice_id')::uuid), ((:'bob_id')::uuid)
ON CONFLICT (id) DO NOTHING;

-- Alice follows Bob
SELECT test.set_auth((:'alice_id')::uuid);

-- No ON CONFLICT here; we want the *second* insert to raise a uniqueness error.
INSERT INTO public.follows (follower_id, following_id)
VALUES ((:'alice_id')::uuid, (:'bob_id')::uuid);

SELECT test.assert_eq_int(
  (SELECT count(*)::int
   FROM public.follows
   WHERE follower_id = (:'alice_id')::uuid
     AND following_id = (:'bob_id')::uuid),
  1,
  'follow row exists'
);

-- Cannot follow twice (unique)
SELECT test.assert_throws(
  format(
    'INSERT INTO public.follows (follower_id, following_id) VALUES (%L, %L)',
    (:'alice_id')::uuid,
    (:'bob_id')::uuid
  ),
  'cannot follow twice'
);

-- Cannot follow self (check)
SELECT test.assert_throws(
  format(
    'INSERT INTO public.follows (follower_id, following_id) VALUES (%L, %L)',
    (:'alice_id')::uuid,
    (:'alice_id')::uuid
  ),
  'cannot follow self'
);

SELECT test.reset_auth();
COMMIT;
