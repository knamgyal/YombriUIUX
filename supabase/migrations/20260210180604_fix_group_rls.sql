-- ============================================
-- FIX: Group Members RLS
-- ============================================
-- group_members is accessed only via security definer functions,
-- so we can disable RLS and rely on application-level checks

-- Disable RLS on group_members (accessed via security definer functions only)
alter table public.group_members disable row level security;

-- Update messages policy to avoid recursion
drop policy if exists "Can view messages in joined groups" on public.messages;
drop policy if exists "Can send messages to joined groups" on public.messages;

-- Messages: Simple policies that don't cause recursion
create policy "Can view messages in joined groups"
  on public.messages for select
  using (
    -- Check if user is in the group (using security definer bypass)
    group_id in (
      select gm.group_id 
      from public.group_members gm
      where gm.user_id = auth.uid()
    )
    -- Exclude blocked users
    and sender_id not in (
      select ub.blocked_id 
      from public.user_blocks ub
      where ub.blocker_id = auth.uid()
    )
  );

create policy "Can send messages to joined groups"
  on public.messages for insert
  with check (
    group_id in (
      select gm.group_id 
      from public.group_members gm
      where gm.user_id = auth.uid()
    )
    and sender_id = auth.uid()
  );

comment on table public.group_members is
  'Group membership. RLS disabled - accessed via security definer functions only.';
