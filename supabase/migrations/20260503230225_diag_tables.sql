CREATE OR REPLACE FUNCTION public._diag_tables()
RETURNS TABLE(
  table_name text,
  rls_enabled boolean,
  policy_count bigint,
  policy_summary text,
  anon_grants text
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    c.relname::text AS table_name,
    c.relrowsecurity AS rls_enabled,
    COALESCE(p.cnt, 0) AS policy_count,
    COALESCE(p.summary, '') AS policy_summary,
    COALESCE(g.grants, '') AS anon_grants
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN (
    SELECT tablename, COUNT(*) AS cnt,
           string_agg(policyname || ' (' || cmd || ')', ', ') AS summary
    FROM pg_policies WHERE schemaname = 'public'
    GROUP BY tablename
  ) p ON p.tablename = c.relname
  LEFT JOIN (
    SELECT table_name, string_agg(privilege_type, ',') AS grants
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public' AND grantee = 'anon'
    GROUP BY table_name
  ) g ON g.table_name = c.relname
  WHERE n.nspname = 'public' AND c.relkind = 'r'
  ORDER BY c.relname;
$$;

GRANT EXECUTE ON FUNCTION public._diag_tables() TO anon;
NOTIFY pgrst, 'reload schema';
