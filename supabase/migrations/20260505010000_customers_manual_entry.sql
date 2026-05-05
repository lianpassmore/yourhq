-- Allow Lian to add customers manually from the admin dashboard, and mark
-- the source (stripe vs manual) so paid customers stay distinguishable.

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'stripe';

CREATE INDEX IF NOT EXISTS customers_source_idx ON public.customers (source);

-- Authenticated users (Lian) can INSERT and DELETE manual customer rows.
GRANT INSERT, DELETE ON public.customers TO authenticated;

DROP POLICY IF EXISTS "authenticated insert customers" ON public.customers;
CREATE POLICY "authenticated insert customers"
  ON public.customers FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated delete customers" ON public.customers;
CREATE POLICY "authenticated delete customers"
  ON public.customers FOR DELETE TO authenticated USING (true);

NOTIFY pgrst, 'reload schema';
