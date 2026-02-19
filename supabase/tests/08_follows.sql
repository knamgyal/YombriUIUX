-- Constraints (pre-migration)
ALTER TABLE follows ADD CONSTRAINT unique_follow UNIQUE(follower_id, following_id);
ALTER TABLE follows ADD CONSTRAINT no_self_follow 
  CHECK (follower_id != following_id);

-- ===== RLS + Integrity =====
SET request.jwt.claims.sub = 'alice';
INSERT INTO follows (follower_id, following_id) VALUES ('alice', 'bob');
-- ✅ Success

INSERT INTO follows (follower_id, following_id) VALUES ('alice', 'bob'); 
-- ✅ UNIQUE violation

INSERT INTO follows (follower_id, following_id) VALUES ('alice', 'alice');
-- ✅ CHECK violation

-- Block overrides follow (app logic)
DELETE FROM follows WHERE follower_id = 'alice' AND following_id = 'bob';
INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ('alice', 'bob');
-- Follow remains deleted, block prevents re-follow
