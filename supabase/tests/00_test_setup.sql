-- ============================================
-- Test Environment Setup
-- ============================================

-- Grant permissions to auth schema (if it exists)
do $$
begin
  grant usage on schema auth to postgres;
  grant all on all tables in schema auth to postgres;
  grant all on all sequences in schema auth to postgres;
  grant all on all functions in schema auth to postgres;
  
  raise notice '✓ Granted permissions to auth schema';
exception
  when undefined_object then
    raise notice 'ℹ auth schema does not exist yet';
  when others then
    raise notice '⚠ Could not grant auth schema permissions: %', sqlerrm;
end $$;

-- Create auth.uid() shim
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select (current_setting('request.jwt.claims', true)::json->>'sub')::uuid;
$$;

comment on function auth.uid() is 'Test shim for auth.uid() - reads from JWT claims';

-- Verify setup
do $$
begin
  perform extensions.gen_random_uuid();
  perform auth.uid();  -- Will return null without JWT, but function exists
  raise notice '✓ Test environment ready';
end $$;

-- ============================================
-- Grant Permissions for Testing
-- ============================================

-- Ensure roles exist
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
end $$;

-- Grant necessary permissions
grant usage on schema public to authenticated, anon;
grant usage on schema yombri to authenticated, anon;
grant usage on schema extensions to authenticated, anon;
grant usage on schema auth to authenticated, anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

grant execute on all functions in schema public to authenticated, anon;
grant execute on all functions in schema yombri to authenticated, anon;
grant execute on all functions in schema auth to authenticated, anon;

grant usage, select on all sequences in schema public to authenticated;

raise notice '✓ Granted permissions to authenticated and anon roles';

