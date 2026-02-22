BEGIN;

ALTER TABLE public.totp_attempts
  ADD COLUMN IF NOT EXISTS failed_attempts integer NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0);

UPDATE public.totp_attempts
SET failed_attempts = COALESCE(failed_attempts, failed_count);

COMMIT;
