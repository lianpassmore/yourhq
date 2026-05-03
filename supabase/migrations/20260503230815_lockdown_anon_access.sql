-- Lock down anon (public) access across all public tables.
-- Only the website's two intake tables remain open, and only for INSERT.

-- ─────────────────────────────────────────────────────────────────
-- leads — anon can INSERT only. Read access via service role only.
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow anon read" ON public.leads;
DROP POLICY IF EXISTS "Allow anon select" ON public.leads;
DROP POLICY IF EXISTS "anon select leads" ON public.leads;

REVOKE ALL ON public.leads FROM anon, authenticated;
GRANT INSERT ON public.leads TO anon;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────
-- discovery_submissions — anon can INSERT only.
-- ─────────────────────────────────────────────────────────────────
REVOKE ALL ON public.discovery_submissions FROM anon, authenticated;
GRANT INSERT ON public.discovery_submissions TO anon;

ALTER TABLE public.discovery_submissions ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────
-- Marketing/automation tables — fully locked down for anon + authenticated.
-- Service role still has full access (it always bypasses RLS and grants).
-- Marketing dashboard will need to be reconnected via service role
-- (server-side) or via Supabase Auth + new policies, when revisited.
-- ─────────────────────────────────────────────────────────────────
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'broadcasts', 'campaigns', 'email_events', 'events',
    'flow_enrollments', 'flows', 'prospects', 'templates', 'tenants'
  ]
  LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────
-- Drop diagnostic helpers — no longer needed.
-- ─────────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public._diag_tables();
DROP FUNCTION IF EXISTS public._diag_discovery_policies();

NOTIFY pgrst, 'reload schema';
