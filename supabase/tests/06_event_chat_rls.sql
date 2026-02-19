-- Setup: Fresh test environment
-- run_all_tests.sh executes this with isolated schema

BEGIN;
SET ROLE authenticated;

-- Test users
INSERT INTO profiles (id, full_name) VALUES 
  ('organizer-1', 'Organizer'),
  ('participant-1', 'Alice'),
  ('non-participant-1', 'Bob');

-- Test event + group
INSERT INTO events (id, organizer_id, title) VALUES 
  ('event-1', 'organizer-1', 'Test Event');

INSERT INTO groups (id, event_id, name) VALUES 
  ('group-1', 'event-1', 'Event Chat');

INSERT INTO event_participants (event_id, user_id, status) VALUES 
  ('event-1', 'participant-1', 'joined'),
  ('event-1', 'organizer-1', 'organizer');

INSERT INTO messages (id, group_id, sender_id, body) VALUES 
  ('msg-1', 'group-1', 'participant-1', 'Hello!');

-- ===== TEST 1: Participant READ =====
SET request.jwt.claims.sub = 'participant-1';
SELECT * FROM messages WHERE group_id = 'group-1';
-- ✅ EXPECT: 1 row (msg-1)

-- ===== TEST 2: Participant INSERT =====
INSERT INTO messages (group_id, sender_id, body) 
VALUES ('group-1', 'participant-1', 'Reply');
-- ✅ EXPECT: Success

-- ===== TEST 3: Non-participant READ =====
SET request.jwt.claims.sub = 'non-participant-1';
SELECT * FROM messages WHERE group_id = 'group-1';
-- ✅ EXPECT: 0 rows (RLS deny)

-- ===== TEST 4: Non-participant INSERT =====
INSERT INTO messages (group_id, sender_id, body) 
VALUES ('group-1', 'non-participant-1', 'Intruder');
-- ✅ EXPECT: RLS violation

-- ===== TEST 5: Realtime subscription =====
-- Verify via Supabase dashboard or logs:
-- participant-1 subscribes to event:event-1:messages → receives broadcasts
-- non-participant-1 subscription denied (SELECT permission check)

COMMIT;
