-- ===== TOTP COOLDOWN =====
-- verify_check_in_totp increments failed_attempts counter
-- After 3 fails: cooldown_until = NOW() + interval '5 minutes'

SELECT failed_attempts, cooldown_until FROM totp_attempts 
WHERE user_id = 'abuser-1' AND event_id = 'event-1';
-- Test window ±30s tolerance already in Phase 3

-- ===== EJECTION RATE =====
-- Trigger logs to analytics_events
-- Edge Function alerts if >10 ejections/hour per organizer

-- ===== INTEREST FLOOD =====
-- interest_signals has rate_limit_window (24h, 10 signals)
CREATE INDEX ON interest_signals (user_id, created_at);
-- RLS: COUNT(*) OVER window <= 10
