-- Helper function to record failed attempt (doesn't raise exception)
create or replace function yombri.record_failed_totp_attempt(
  p_event_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.event_checkin_attempts (event_id, user_id, failed_count, cooldown_until, last_failed_at)
  values (p_event_id, p_user_id, 1, now() + interval '1 minute', now())
  on conflict (event_id, user_id) 
  do update set
    failed_count = event_checkin_attempts.failed_count + 1,
    last_failed_at = now(),
    cooldown_until = case 
      when event_checkin_attempts.failed_count + 1 >= 3 
      then now() + interval '5 minutes'
      else now() + interval '1 minute'
    end,
    updated_at = now();
end;
$$;
