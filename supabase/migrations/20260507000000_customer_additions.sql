-- "More from the customer" — supplementary info Lian gathers from the
-- customer outside the formal discovery interview. Stored separately so
-- discovery_submissions stays the customer's untouched record.

CREATE TABLE IF NOT EXISTS public.customer_additions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  topic       text NOT NULL,
  body        text NOT NULL
);

CREATE INDEX IF NOT EXISTS customer_additions_customer_id_idx
  ON public.customer_additions (customer_id, created_at DESC);

ALTER TABLE public.customer_additions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.customer_additions FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_additions TO authenticated;

DROP POLICY IF EXISTS "authenticated read customer_additions" ON public.customer_additions;
CREATE POLICY "authenticated read customer_additions"
  ON public.customer_additions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated insert customer_additions" ON public.customer_additions;
CREATE POLICY "authenticated insert customer_additions"
  ON public.customer_additions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated update customer_additions" ON public.customer_additions;
CREATE POLICY "authenticated update customer_additions"
  ON public.customer_additions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated delete customer_additions" ON public.customer_additions;
CREATE POLICY "authenticated delete customer_additions"
  ON public.customer_additions FOR DELETE TO authenticated USING (true);

NOTIFY pgrst, 'reload schema';
