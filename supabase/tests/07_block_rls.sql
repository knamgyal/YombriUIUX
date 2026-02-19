-- ===== BLOCK PREVENTS SEND =====
SET request.jwt.claims.sub = 'alice';  -- blocker
INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ('alice', 'bob');

SET request.jwt.claims.sub = 'bob';    -- blocked
INSERT INTO messages (group_id, sender_id, body) VALUES ('group-1', 'bob', 'Spam');
-- ✅ EXPECT: RLS deny (user_blocks predicate in messages RLS)

-- ===== CLIENT FILTERING (secondary) =====
-- Organizer sees all messages (no blocks affect them)
SET request.jwt.claims.sub = 'organizer-1';
SELECT * FROM messages WHERE group_id = 'group-1';
-- ✅ EXPECT: All messages visible

-- Alice (blocker) query includes block filter
-- This is VIEW layer, not RLS (for performance)
-- RLS prevents bob from sending regardless

-- ===== HISTORICAL MESSAGES SAFE =====
-- Pre-block messages remain readable by others
SET request.jwt.claims.sub = 'participant-2';
SELECT * FROM messages WHERE group_id = 'group-1';
-- ✅ EXPECT: Sees bob's old messages
