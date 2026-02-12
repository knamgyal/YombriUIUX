-- ============================================
-- ROLE GRANTS FOR AUTHENTICATED USERS
-- ============================================

-- Ensure authenticated role exists
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
    raise notice '✓ Created authenticated role';
  end if;
  
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
    raise notice '✓ Created anon role';
  end if;
  
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
    raise notice '✓ Created service_role';
  end if;
end $$;

-- Grant schema access
grant usage on schema public to authenticated, anon, service_role;
grant usage on schema yombri to authenticated, anon, service_role;
grant usage on schema extensions to authenticated, anon, service_role;

-- Authenticated: Can interact with tables (via RLS)
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema public to authenticated;
grant execute on all functions in schema yombri to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Anon: Read-only access (for public discovery)
grant select on all tables in schema public to anon;
grant execute on all functions in schema public to anon;
grant execute on all functions in schema yombri to anon;

-- Service role: Full access (bypasses RLS)
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
grant execute on all functions in schema yombri to service_role;

-- Default privileges for future objects
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant select on tables to anon;

alter default privileges in schema public
  grant all on tables to service_role;

alter default privileges in schema public
  grant usage, select on sequences to authenticated;

alter default privileges in schema public
  grant all on sequences to service_role;

alter default privileges in schema public
  grant execute on functions to authenticated, anon, service_role;

alter default privileges in schema yombri
  grant execute on functions to authenticated, anon, service_role;


