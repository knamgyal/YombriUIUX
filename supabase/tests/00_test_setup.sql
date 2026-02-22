\set ON_ERROR_STOP on

-- ============================================
-- Test Environment Setup (NO auth schema writes)
-- ============================================

BEGIN;

-- Ensure roles exist (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
END $$;

-- Minimal grants for running SELECT/INSERT tests in your app schemas
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- If you have a dedicated app schema, keep this; otherwise remove it.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'yombri') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA yombri TO authenticated, anon';
  END IF;
END $$;

-- Extensions schema is commonly needed for gen_random_uuid()
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'extensions') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA extensions TO authenticated, anon';
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

DO $$
BEGIN
  PERFORM extensions.gen_random_uuid();
  -- auth.uid() should already exist in Supabase; we only verify we can call it.
  -- It will return NULL unless request.jwt.claim.sub is set. [web:304]
  PERFORM auth.uid();
  RAISE NOTICE '✓ Test environment ready (auth schema untouched)';
END $$;

COMMIT;
