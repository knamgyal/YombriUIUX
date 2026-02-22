-- public.follows: DB-enforced integrity + RLS
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Follower can see their own follow edges (optional; adjust to your product)
CREATE POLICY follows_select_own
ON public.follows
FOR SELECT
TO authenticated
USING (follower_id = auth.uid());

-- Only follower can insert (trust boundary)
CREATE POLICY follows_insert_own
ON public.follows
FOR INSERT
TO authenticated
WITH CHECK (follower_id = auth.uid());

-- Only follower can delete their follow
CREATE POLICY follows_delete_own
ON public.follows
FOR DELETE
TO authenticated
USING (follower_id = auth.uid());

CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON public.follows (follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON public.follows (following_id);
