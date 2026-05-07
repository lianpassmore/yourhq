-- Meeting transcripts: full text of calls / meetings with the customer.
-- Long-form, editable (you'll paste a raw transcript and likely tidy it).

CREATE TABLE IF NOT EXISTS public.customer_transcripts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  meeting_date date,
  title        text NOT NULL,
  body         text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS customer_transcripts_customer_id_idx
  ON public.customer_transcripts (customer_id, meeting_date DESC NULLS LAST, created_at DESC);

ALTER TABLE public.customer_transcripts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.customer_transcripts FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_transcripts TO authenticated;

DROP POLICY IF EXISTS "authenticated read customer_transcripts" ON public.customer_transcripts;
CREATE POLICY "authenticated read customer_transcripts"
  ON public.customer_transcripts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated insert customer_transcripts" ON public.customer_transcripts;
CREATE POLICY "authenticated insert customer_transcripts"
  ON public.customer_transcripts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated update customer_transcripts" ON public.customer_transcripts;
CREATE POLICY "authenticated update customer_transcripts"
  ON public.customer_transcripts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated delete customer_transcripts" ON public.customer_transcripts;
CREATE POLICY "authenticated delete customer_transcripts"
  ON public.customer_transcripts FOR DELETE TO authenticated USING (true);

NOTIFY pgrst, 'reload schema';
