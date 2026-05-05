-- One-shot backfill: replay every existing discovery submission through the
-- same logic as the new-submission trigger, so already-paid customers who
-- submitted discovery before the trigger existed get linked properly.
--
-- For each email with one or more discovery rows, we use the most recent
-- submission and:
--   • bump matching customer's stage to 'discovery_received' (only when
--     currently 'paid' or 'discovery_sent' — never roll back later stages)
--   • fill in business name if missing
--   • create a customer row with source='discovery' if no match exists

DO $$
DECLARE
  d RECORD;
  normalized_email text;
BEGIN
  FOR d IN
    SELECT DISTINCT ON (LOWER(TRIM(email))) *
    FROM public.discovery_submissions
    WHERE email IS NOT NULL AND email <> ''
    ORDER BY LOWER(TRIM(email)), created_at DESC
  LOOP
    normalized_email := LOWER(TRIM(d.email));

    UPDATE public.customers
       SET build_stage = 'discovery_received',
           business    = COALESCE(NULLIF(business, ''), d.business)
     WHERE email = normalized_email
       AND build_stage IN ('paid', 'discovery_sent');

    UPDATE public.customers
       SET business = COALESCE(NULLIF(business, ''), d.business)
     WHERE email = normalized_email
       AND (business IS NULL OR business = '');

    INSERT INTO public.customers (source, email, name, business, phone, build_stage)
    VALUES (
      'discovery',
      normalized_email,
      NULLIF(d.name, ''),
      d.business,
      d.phone,
      'discovery_received'
    )
    ON CONFLICT (email) DO NOTHING;
  END LOOP;
END $$;
