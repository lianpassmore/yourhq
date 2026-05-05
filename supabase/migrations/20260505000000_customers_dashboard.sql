-- Customers dashboard schema
-- One row per Stripe checkout completion. Lian uses /admin to track build progress.

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Stripe identifiers
  stripe_customer_id text,
  stripe_session_id  text UNIQUE,

  -- Customer details (from Stripe checkout)
  email    text,
  name     text,
  phone    text,

  -- Payment details
  amount_total integer,    -- cents
  currency     text,
  plan         text,       -- session.metadata.plan
  payment_status text,     -- session.payment_status

  -- Build tracking (Lian-managed)
  build_stage text NOT NULL DEFAULT 'paid',
  internal_notes text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS customers_email_idx       ON public.customers (email);
CREATE INDEX IF NOT EXISTS customers_created_at_idx  ON public.customers (created_at DESC);
CREATE INDEX IF NOT EXISTS customers_build_stage_idx ON public.customers (build_stage);

-- updated_at auto-bump
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customers_set_updated_at ON public.customers;
CREATE TRIGGER customers_set_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────
-- RLS: authenticated users can read & update; inserts only via service role (webhook).
-- Public signups must be DISABLED in Supabase Auth so only Lian's user exists.
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.customers FROM anon, authenticated;
GRANT SELECT, UPDATE ON public.customers TO authenticated;

DROP POLICY IF EXISTS "authenticated read customers" ON public.customers;
CREATE POLICY "authenticated read customers"
  ON public.customers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated update customers" ON public.customers;
CREATE POLICY "authenticated update customers"
  ON public.customers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────
-- Open up discovery_submissions for authenticated SELECT so the dashboard
-- can show interview answers next to a customer (matched by email).
-- ─────────────────────────────────────────────────────────────────
GRANT SELECT ON public.discovery_submissions TO authenticated;

DROP POLICY IF EXISTS "authenticated read discovery_submissions" ON public.discovery_submissions;
CREATE POLICY "authenticated read discovery_submissions"
  ON public.discovery_submissions FOR SELECT TO authenticated USING (true);

NOTIFY pgrst, 'reload schema';
