-- ============================================
-- 1️⃣ UNIT-LEVEL VALIDATION
-- ============================================

begin;

-- Test: Config getters return correct types
do $$
declare
  v_int int;
  v_float float;
  v_text text;
  v_bool boolean;
begin
  v_int := yombri.get_config_int('checkin_radius_default', 0);
  assert v_int = 150, 'Default checkin radius should be 150';
  
  v_float := yombri.get_config_float('grid_zoom_14', 0.0);
  assert v_float = 0.002, 'Grid zoom 14 should be 0.002';
  
  raise notice 'PASS: Config getters work correctly';
end $$;

-- Test: Base64 URL encoding/decoding
do $$
declare
  v_original bytea := 'test_data_12345'::bytea;
  v_encoded text;
  v_decoded bytea;
begin
  v_encoded := yombri.base64url_encode(v_original);
  v_decoded := yombri.base64url_decode(v_encoded);
  
  assert v_original = v_decoded, 'Base64 URL encode/decode should be reversible';
  assert v_encoded !~ '[+/=]', 'Base64 URL should not contain +/= characters';
  
  raise notice 'PASS: Base64 URL encoding works correctly';
end $$;

-- Test: Constant time compare
do $$
begin
  assert yombri.constant_time_compare('same', 'same') = true, 'Same strings should match';
  assert yombri.constant_time_compare('diff1', 'diff2') = false, 'Different strings should not match';
  assert yombri.constant_time_compare('', '') = true, 'Empty strings should match';
  
  raise notice 'PASS: Constant time compare works correctly';
end $$;

-- Test: TOTP code generation (deterministic)
do $$
declare
  v_secret bytea := decode('3132333435363738393031323334353637383930', 'hex');
  v_time timestamptz := '2024-01-01 00:00:00+00'::timestamptz;
  v_code1 int;
  v_code2 int;
begin
  v_code1 := yombri.totp_code(v_secret, v_time, 30, 6, 0);
  v_code2 := yombri.totp_code(v_secret, v_time, 30, 6, 0);
  
  assert v_code1 = v_code2, 'TOTP should be deterministic';
  assert v_code1 between 0 and 999999, 'TOTP should be 6 digits';
  
  raise notice 'PASS: TOTP generation is deterministic';
end $$;

-- Test: Payload size validation
do $$
declare
  v_small jsonb := '{"key": "value"}'::jsonb;
  v_large jsonb;
begin
  assert yombri.validate_payload_size(v_small, 1) = true, 'Small payload should pass';
  
  -- Create a large payload
  v_large := jsonb_build_object('data', repeat('x', 200000));
  assert yombri.validate_payload_size(v_large, 100) = false, 'Large payload should fail';
  
  raise notice 'PASS: Payload size validation works';
end $$;

-- Test: Interest signal location snapping
do $$
declare
  v_user_id uuid := extensions.gen_random_uuid();
  v_signal_id uuid;
  v_lat_before float := 37.123456;
  v_lng_before float := -122.654321;
  v_lat_after float;
  v_lng_after float;
begin
  -- Insert test user
  insert into auth.users (id, email) values (v_user_id, 'test_snap@example.com');
  
  -- Insert interest signal
  insert into public.interest_signals (user_id, location)
  values (v_user_id, st_setsrid(st_makepoint(v_lng_before, v_lat_before), 4326)::geography)
  returning id into v_signal_id;
  
  -- Check location was snapped
  select st_y(location::geometry), st_x(location::geometry)
  into v_lat_after, v_lng_after
  from public.interest_signals
  where id = v_signal_id;
  
  assert v_lat_after != v_lat_before, 'Latitude should be snapped';
  assert v_lng_after != v_lng_before, 'Longitude should be snapped';
  assert abs(v_lat_after - v_lat_before) <= 0.02, 'Snap should be within grid size';
  
  raise notice 'PASS: Interest signal location snapping works';
end $$;

rollback;
