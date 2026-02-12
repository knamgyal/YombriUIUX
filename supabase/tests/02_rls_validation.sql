-- ============================================
-- 2️⃣ RLS / DATABASE VALIDATION
-- ============================================

begin;

-- Ensure extensions are available
create extension if not exists pgcrypto with schema extensions;
create extension if not exists postgis;

-- Setup test users
do $$
declare
  v_user1 uuid := '00000000-0000-0000-0000-000000000001';
  v_user2 uuid := '00000000-0000-0000-0000-000000000002';
  v_organizer uuid := '00000000-0000-0000-0000-000000000003';
  v_event_id uuid;
begin
  -- Create auth.users with properly qualified pgcrypto functions
  insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  values 
    (v_user1, 'user1@test.com', 
     extensions.crypt('password', extensions.gen_salt('bf')), 
     now(), now(), now()),
    (v_user2, 'user2@test.com', 
     extensions.crypt('password', extensions.gen_salt('bf')), 
     now(), now(), now()),
    (v_organizer, 'organizer@test.com', 
     extensions.crypt('password', extensions.gen_salt('bf')), 
     now(), now(), now())
  on conflict (id) do nothing;
  
  perform pg_sleep(0.1);
  
  v_event_id := yombri.create_event(
    p_actor_id => v_organizer,
    p_title => 'Test Event',
    p_description => 'Test Description',
    p_starts_at => now() + interval '1 day',
    p_ends_at => now() + interval '2 days',
    p_lat => 37.7749,
    p_lng => -122.4194,
    p_address_label => 'San Francisco, CA',
    p_checkin_radius_m => 150
  );
  
  raise notice 'Created test event: %', v_event_id;
end $$;

-- Test: Users can only read their own profile
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-000000000001"}';

do $$
declare
  v_count int;
begin
  -- Should see own profile
  select count(*) into v_count
  from public.users
  where id = '00000000-0000-0000-0000-000000000001'::uuid;
  
  assert v_count = 1, 'User should see their own profile';
  
  -- Should NOT see other profiles
  select count(*) into v_count
  from public.users
  where id = '00000000-0000-0000-0000-000000000002'::uuid;
  
  assert v_count = 0, 'User should NOT see other profiles';
  
  raise notice 'PASS: User RLS works correctly';
end $$;

reset role;

-- Test: Events are publicly discoverable
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-000000000001"}';

do $$
declare
  v_count int;
begin
  -- Should see scheduled events
  select count(*) into v_count
  from public.events
  where status = 'scheduled' and deleted_at is null;
  
  assert v_count >= 1, 'User should see scheduled events';
  
  raise notice 'PASS: Event discovery RLS works';
end $$;

reset role;

-- Test: Direct event writes should fail
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-000000000001"}';

do $$
begin
  -- Try to insert event directly (should fail)
  begin
    insert into public.events (organizer_id, title, starts_at, location, status)
    values (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'Illegal Event',
      now() + interval '1 day',
      st_setsrid(st_makepoint(-122.4194, 37.7749), 4326)::geography,
      'scheduled'
    );
    
    raise exception 'Should not reach here - direct insert should fail';
  exception
    when insufficient_privilege then
      raise notice 'PASS: Direct event insert blocked by RLS';
  end;
end $$;

reset role;

-- Test: Event participants - user can read own, organizer can read all
do $$
declare
  v_user1 uuid := '00000000-0000-0000-0000-000000000001';
  v_user2 uuid := '00000000-0000-0000-0000-000000000002';
  v_organizer uuid := '00000000-0000-0000-0000-000000000003';
  v_event_id uuid;
  v_count int;
begin
  -- Get test event
  select id into v_event_id from public.events limit 1;
  
  -- Create participants via direct insert (using security definer context)
  insert into public.event_participants (event_id, user_id, status)
  values 
    (v_event_id, v_user1, 'joined'),
    (v_event_id, v_user2, 'joined');
  
  -- Test as user1 - should see only own participation
  set local role authenticated;
  set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-000000000001"}';
  
  select count(*) into v_count
  from public.event_participants
  where event_id = v_event_id;
  
  assert v_count = 1, format('User should see only own participation, got %s', v_count);
  
  reset role;
  
  -- Test as organizer - should see all participants
  set local role authenticated;
  set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-000000000003"}';
  
  select count(*) into v_count
  from public.event_participants
  where event_id = v_event_id;
  
  assert v_count = 2, format('Organizer should see all participants, got %s', v_count);
  
  reset role;
  
  raise notice 'PASS: Event participants RLS works correctly';
end $$;

-- Test: Legacy artifacts - read only, write via function only
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-000000000001"}';

do $$
begin
  -- Try to insert artifact directly (should fail)
  begin
    insert into public.legacy_artifacts (user_id, event_id, sequence_id, payload, payload_hash)
    values (
      '00000000-0000-0000-0000-000000000001'::uuid,
      extensions.gen_random_uuid(),
      1,
      '{"test": true}'::jsonb,
      'hash'
    );
    
    raise exception 'Should not reach here - direct artifact insert should fail';
  exception
    when insufficient_privilege then
      raise notice 'PASS: Direct artifact insert blocked by RLS';
  end;
end $$;

reset role;

-- Test: Messages - can only read from groups you're in, excluding blocked users
do $$
declare
  v_user1 uuid := '00000000-0000-0000-0000-000000000001';
  v_user2 uuid := '00000000-0000-0000-0000-000000000002';
  v_event_id uuid;
  v_group_id uuid;
  v_message_id uuid;
  v_count int;
begin
  select id into v_event_id from public.events limit 1;
  
  -- Get or create group
  select id into v_group_id from public.groups where event_id = v_event_id;
  
  -- Add both users to group
  perform yombri.add_event_group_member(v_event_id, v_user1);
  perform yombri.add_event_group_member(v_event_id, v_user2);
  
  -- User2 sends message
  set local role authenticated;
  set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-000000000002"}';
  
  insert into public.messages (group_id, sender_id, body)
  values (v_group_id, v_user2, 'Test message')
  returning id into v_message_id;
  
  reset role;
  
  -- User1 should see the message
  set local role authenticated;
  set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-000000000001"}';
  
  select count(*) into v_count
  from public.messages
  where id = v_message_id;
  
  assert v_count = 1, 'User1 should see message from User2';
  
  reset role;
  
  -- User1 blocks User2
  set local role authenticated;
  set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-000000000001"}';
  
  insert into public.user_blocks (blocker_id, blocked_id)
  values (v_user1, v_user2)
  on conflict do nothing;
  
  -- User1 should NOT see messages from User2 anymore
  select count(*) into v_count
  from public.messages
  where id = v_message_id;
  
  assert v_count = 0, format('User1 should NOT see message from blocked User2, got %s', v_count);
  
  reset role;
  
  raise notice 'PASS: Message and blocking RLS works correctly';
end $$;

-- Test: Sensitive tables completely blocked
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-000000000001"}';

do $$
declare
  v_count int;
begin
  -- Should not read event secrets
  select count(*) into v_count from public.event_secrets;
  assert v_count = 0, 'Direct access to event_secrets should be blocked';
  
  -- Should not read interest signals
  select count(*) into v_count from public.interest_signals;
  assert v_count = 0, 'Direct access to interest_signals should be blocked';
  
  -- Should not read audit events
  select count(*) into v_count from public.audit_events;
  assert v_count = 0, 'Direct access to audit_events should be blocked';
  
  raise notice 'PASS: Sensitive tables blocked by RLS';
end $$;

reset role;

rollback;
