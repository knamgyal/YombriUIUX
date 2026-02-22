BEGIN;

CREATE TABLE IF NOT EXISTS public.totp_attempts (
  user_id         uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  failed_count    integer NOT NULL DEFAULT 0 CHECK (failed_count >= 0),
  cooldown_until  timestamptz,
  last_attempt_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_totp_attempts_cooldown_until
  ON public.totp_attempts (cooldown_until)
  WHERE cooldown_until IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_totp_attempts_last_attempt_at
  ON public.totp_attempts (last_attempt_at);

COMMIT;
