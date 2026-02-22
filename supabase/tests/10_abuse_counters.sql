\set ON_ERROR_STOP on
BEGIN;

CREATE SCHEMA IF NOT EXISTS test;

CREATE OR REPLACE FUNCTION test.assert_true(p_ok boolean, p_msg text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT p_ok THEN
    RAISE EXCEPTION 'ASSERT_TRUE failed: %', p_msg;
  END IF;
END;
$$;

-- Interest flood: require index for per-user window queries
DO $$
DECLARE
  idx_exists boolean;
BEGIN
  IF to_regclass('public.interest_signals') IS NULL THEN
    RAISE EXCEPTION 'Missing table: public.interest_signals';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname='public'
      AND tablename='interest_signals'
      AND indexdef ILIKE '%(user_id%'
      AND indexdef ILIKE '%created_at%'
  ) INTO idx_exists;

  PERFORM test.assert_true(idx_exists, 'interest_signals must have (user_id, created_at) index');
END$$;

-- TOTP cooldown: require attempt tracking table AND required columns
DO $$
DECLARE
  has_failed_attempts boolean;
  has_cooldown_until boolean;
BEGIN
  IF to_regclass('public.totp_attempts') IS NULL THEN
    RAISE EXCEPTION 'Missing table: public.totp_attempts (required for DB-enforced cooldown)';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='totp_attempts' AND column_name='failed_attempts'
  ) INTO has_failed_attempts;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='totp_attempts' AND column_name='cooldown_until'
  ) INTO has_cooldown_until;

  PERFORM test.assert_true(has_failed_attempts, 'totp_attempts.failed_attempts column missing');
  PERFORM test.assert_true(has_cooldown_until, 'totp_attempts.cooldown_until column missing');
END$$;

COMMIT;
