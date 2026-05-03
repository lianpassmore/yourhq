-- Ensure anon clients (the website form) can insert into discovery_submissions.
-- Re-applies grant + RLS policy in case the table pre-existed without them.

GRANT INSERT ON public.discovery_submissions TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

ALTER TABLE public.discovery_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon insert discovery_submissions" ON public.discovery_submissions;
CREATE POLICY "anon insert discovery_submissions"
  ON public.discovery_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);
