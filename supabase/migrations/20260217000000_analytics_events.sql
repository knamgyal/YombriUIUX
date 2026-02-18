-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying by user and time
CREATE INDEX idx_analytics_events_user_created 
  ON analytics_events(user_id, created_at DESC);

-- Index for querying by event type
CREATE INDEX idx_analytics_events_type_created 
  ON analytics_events(event_type, created_at DESC);

-- RLS: Users can only insert their own events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY analytics_insert_own 
  ON analytics_events 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- No read access for regular users (admin/analytics service only)
CREATE POLICY analytics_no_read 
  ON analytics_events 
  FOR SELECT 
  USING (false);
