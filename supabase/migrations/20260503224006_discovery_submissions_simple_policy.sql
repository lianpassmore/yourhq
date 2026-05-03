DROP POLICY IF EXISTS "Anyone can insert discovery submissions" ON public.discovery_submissions;
DROP POLICY IF EXISTS "anon insert discovery_submissions" ON public.discovery_submissions;

CREATE POLICY "Enable insert for all" ON public.discovery_submissions
  FOR INSERT TO anon, authenticated, public
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
