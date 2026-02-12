-- ============================================
-- 4️⃣ FAILURE MODE TESTING
-- ============================================

begin;

-- Ensure extensions are available
create extension if not exists pgcrypto with schema extensions;
create extension if not exists postgis;

do $$
declare
  v_user_id uuid := extensions.gen_random_uuid();
  v_event_id uuid;
  v_totp_secret bytea;
  v_code int;
  v_bad_code int;  -- Will be set after valid code calculation
  v_result record;
  v_attempt_count int;
begin
  -- Create auth.users FIRST
  insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  values (v_user_id, 'failure_test@example.com', extensions.crypt('password', extensions.gen_salt('bf')), now(), now(), now())
  on conflict (id) do nothing;

  perform pg_sleep(0.1);

  v_event_id := yombri.create_event(
    p_actor_id => v_user_id,
    p_title => 'Failure Test Event',
    p_description => 'Testing failure modes',
    p_starts_at => now() + interval '1 hour',
    p_ends_at => now() + interval '3 hours',
    p_lat => 37.7749,
    p_lng => -122.4194,
    p_address_label => 'San Francisco, CA',
    p_checkin_radius_m => 150
  );

  -- Get TOTP secret
  select totp_secret into v_totp_secret
  from public.event_secrets
  where event_id = v_event_id;

  -- Calculate valid TOTP code
  v_code := yombri.totp_code(v_totp_secret, now(), 30, 6, 0);
  
  -- Set bad code (ensure it's different from valid code)
  v_bad_code := (v_code + 111111) % 1000000;
  
  raise notice 'Valid TOTP code: %, Invalid code: %', v_code, v_bad_code;

  -- Test 1: Out of geofence
  raise notice '--- Test: Out of geofence ---';

  begin
    select * into v_result
    from yombri.verify_check_in(
      p_actor_id => v_user_id,
      p_event_id => v_event_id,
      p_lat => 40.7128,  -- New York (far from SF)
      p_lng => -74.0060
    );

    raise exception 'Should have failed for out-of-geofence check-in';
  exception
    when others then
      if sqlerrm like '%VERIFICATION_FAILED%' then
        raise notice 'PASS: Out-of-geofence correctly rejected';
      else
        raise exception 'Unexpected error: %', sqlerrm;
      end if;
  end;

  -- Test 2: Invalid TOTP code
  raise notice '--- Test: Invalid TOTP code ---';

  begin
    select * into v_result
    from yombri.verify_check_in_totp(
      p_actor_id => v_user_id,
      p_event_id => v_event_id,
      p_code => v_bad_code,
      p_client_time => now()
    );

    raise exception 'Should have failed for invalid TOTP';

  exception
    when others then
      raise notice 'DEBUG: Caught SQLSTATE=%, SQLERRM=%', sqlstate, sqlerrm;
      assert sqlerrm like '%VERIFICATION_FAILED%', 'Expected VERIFICATION_FAILED, got: ' || sqlerrm;
      raise notice 'PASS: Invalid TOTP correctly rejected';
  end;

    -- Test 3: Rate limiting
  raise notice '--- Test: Rate limiting ---';

  -- Manually record 3 failed attempts (bypassing exception rollback)
  for i in 1..3 loop
    perform yombri.record_failed_totp_attempt(v_event_id, v_user_id);
    raise notice 'Failed attempt % recorded', i;
  end loop;

  -- Check failed count (should be 4: 1 from Test 2 + 3 from Test 3)
  select failed_count into v_attempt_count
  from public.event_checkin_attempts
  where event_id = v_event_id and user_id = v_user_id;

  raise notice 'DEBUG: Failed attempt count = %', coalesce(v_attempt_count::text, 'NULL');

  assert v_attempt_count is not null, 'Attempt record not found';
  assert v_attempt_count >= 3, 'Failed count should be 3+, got: ' || v_attempt_count::text;

  -- Next attempt (even with valid code) should be rate limited
  begin
    select * into v_result
    from yombri.verify_check_in_totp(
      p_actor_id => v_user_id,
      p_event_id => v_event_id,
      p_code => v_code,  -- Use VALID code
      p_client_time => now()
    );

    raise exception 'Should have failed due to rate limit';
  exception
    when others then
      if sqlerrm like '%RATE_LIMIT_EXCEEDED%' then
        raise notice 'PASS: Rate limiting works correctly';
      else
        raise exception 'Expected RATE_LIMIT_EXCEEDED, got: %', sqlerrm;
      end if;
  end;

  -- Test 4: Wait for cooldown (optional - can be slow)
  -- Uncomment if you want to test cooldown expiry
  /*
  raise notice '--- Test: Cooldown expiry ---';
  raise notice 'Waiting 6 minutes for cooldown to expire...';
  perform pg_sleep(360);

  -- Clear the failed count
  delete from public.event_checkin_attempts
  where event_id = v_event_id and user_id = v_user_id;

  -- Should work now
  select * into v_result
  from yombri.verify_check_in_totp(
    p_actor_id => v_user_id,
    p_event_id => v_event_id,
    p_code => yombri.totp_code(v_totp_secret, now(), 30, 6, 0),
    p_client_time => now()
  );

  assert v_result.status = 'checked_in', 'Should succeed after cooldown';
  raise notice 'PASS: Check-in works after cooldown';
  */

  raise notice '========================================';
  raise notice '✅ All failure mode tests passed';
  raise notice '========================================';

end $$;

rollback;
