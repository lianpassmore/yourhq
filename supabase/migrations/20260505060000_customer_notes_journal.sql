-- Customer notes as a journal: each save is its own timestamped entry,
-- not an editable single field. Lets Lian build up a running history of
-- comms, decisions, and follow-ups per customer.

CREATE TABLE IF NOT EXISTS public.customer_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  body        text NOT NULL
);

CREATE INDEX IF NOT EXISTS customer_notes_customer_id_idx
  ON public.customer_notes (customer_id, created_at DESC);

ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.customer_notes FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.customer_notes TO authenticated;

DROP POLICY IF EXISTS "authenticated read customer_notes" ON public.customer_notes;
CREATE POLICY "authenticated read customer_notes"
  ON public.customer_notes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated insert customer_notes" ON public.customer_notes;
CREATE POLICY "authenticated insert customer_notes"
  ON public.customer_notes FOR INSERT TO authenticated WITH CHECK (true);

-- Allow delete so a typo'd entry can be removed; updates are deliberately
-- not allowed so saved notes stay immutable.
DROP POLICY IF EXISTS "authenticated delete customer_notes" ON public.customer_notes;
CREATE POLICY "authenticated delete customer_notes"
  ON public.customer_notes FOR DELETE TO authenticated USING (true);

-- Backfill: migrate any existing internal_notes content into the journal
-- as a single timestamped entry per customer, dated to the customer's
-- last update. The internal_notes column is left in place for safety but
-- the UI will stop using it.
INSERT INTO public.customer_notes (customer_id, created_at, body)
SELECT id, COALESCE(updated_at, created_at), internal_notes
  FROM public.customers
 WHERE internal_notes IS NOT NULL AND internal_notes <> '';

NOTIFY pgrst, 'reload schema';
