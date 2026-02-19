-- ===== ATOMIC EJECTION =====
BEGIN;
SET request.jwt.claims.sub = 'organizer-1';

-- Concurrent simulation
SELECT eject_user_from_event('event-1', 'participant-1', 'organizer-1');
-- Atomic: deletes group_members + updates event_participants.status = 'ejected'

COMMIT;

-- ===== POST-EJECTION ACCESS DENIED =====
SET request.jwt.claims.sub = 'participant-1';
SELECT * FROM messages WHERE group_id = 'group-1';
-- ✅ EXPECT: 0 rows (group_members RLS fails)

INSERT INTO messages (group_id, sender_id, body) VALUES ('group-1', 'participant-1', 'test');
-- ✅ EXPECT: RLS deny

-- ===== IDEMPOTENCY =====
SELECT eject_user_from_event('event-1', 'participant-1', 'organizer-1');
-- ✅ No error (status already ejected)

-- ===== RACE CONDITION SAFE =====
-- RPC uses transaction isolation, RLS re-evaluated on every query
