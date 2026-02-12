-- ============================================
-- GROUP MANAGEMENT HELPER FUNCTIONS
-- ============================================

-- Add user to event's group
create or replace function yombri.add_event_group_member(
  p_event_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, yombri, extensions
as $$
declare
  v_group_id uuid;
begin
  -- Validate inputs
  if p_event_id is null or p_user_id is null then
    raise exception 'INVALID_INPUT' using hint = 'Event ID and User ID required';
  end if;
  
  -- Get event's default group
  select id into v_group_id
  from public.groups
  where event_id = p_event_id and kind = 'event'
  limit 1;
  
  if v_group_id is null then
    raise exception 'EVENT_NOT_FOUND' using hint = 'Event does not have a group';
  end if;
  
  -- Add user to group (idempotent)
  insert into public.group_members (group_id, user_id)
  values (v_group_id, p_user_id)
  on conflict (group_id, user_id) do nothing;
end;
$$;

comment on function yombri.add_event_group_member(uuid, uuid) is
  'Adds a user to an event''s group. Used for managing event group membership.';


-- Remove user from event's group
create or replace function yombri.remove_event_group_member(
  p_event_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, yombri, extensions
as $$
declare
  v_group_id uuid;
begin
  if p_event_id is null or p_user_id is null then
    raise exception 'INVALID_INPUT' using hint = 'Event ID and User ID required';
  end if;
  
  select id into v_group_id
  from public.groups
  where event_id = p_event_id and kind = 'event'
  limit 1;
  
  if v_group_id is null then
    return; -- No group, nothing to remove
  end if;
  
  delete from public.group_members
  where group_id = v_group_id and user_id = p_user_id;
end;
$$;

comment on function yombri.remove_event_group_member(uuid, uuid) is
  'Removes a user from an event''s group.';


-- Get group members
create or replace function yombri.get_event_group_members(
  p_event_id uuid
)
returns table(
  user_id uuid,
  joined_at timestamptz
)
language plpgsql
security definer
set search_path = pg_catalog, public, yombri, extensions
as $$
declare
  v_group_id uuid;
begin
  select id into v_group_id
  from public.groups
  where event_id = p_event_id and kind = 'event'
  limit 1;
  
  if v_group_id is null then
    return; -- No group, return empty
  end if;
  
  return query
  select gm.user_id, gm.created_at
  from public.group_members gm
  where gm.group_id = v_group_id
  order by gm.created_at;
end;
$$;

comment on function yombri.get_event_group_members(uuid) is
  'Returns all members of an event''s group.';
