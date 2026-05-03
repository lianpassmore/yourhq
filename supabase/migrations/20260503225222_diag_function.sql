CREATE OR REPLACE FUNCTION public._diag_discovery_policies()
RETURNS TABLE(policyname text, permissive text, roles name[], cmd text, qual text, with_check text, rls_enabled boolean, rls_forced boolean)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT p.policyname::text, p.permissive::text, p.roles, p.cmd::text, p.qual::text, p.with_check::text,
         c.relrowsecurity, c.relforcerowsecurity
    FROM pg_policies p
    JOIN pg_class c ON c.relname = p.tablename AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = p.schemaname)
   WHERE p.schemaname = 'public' AND p.tablename = 'discovery_submissions';
$$;

GRANT EXECUTE ON FUNCTION public._diag_discovery_policies() TO anon;
NOTIFY pgrst, 'reload schema';
