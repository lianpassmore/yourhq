-- Drop any existing policies and apply a permissive insert policy without role restriction.
-- Matches the pattern Supabase uses for public form submissions.

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'discovery_submissions' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.discovery_submissions', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.discovery_submissions ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.discovery_submissions TO anon, authenticated;

CREATE POLICY "Anyone can insert discovery submissions"
  ON public.discovery_submissions
  FOR INSERT
  WITH CHECK (true);
