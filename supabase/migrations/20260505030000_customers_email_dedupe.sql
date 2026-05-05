-- Make email the natural key for the customers table.
--
-- Why: a single person can come in through multiple paths (discovery form,
-- Stripe checkout, manual add) and we were creating a new row each time,
-- producing duplicates. Email is the one consistent identifier across paths,
-- so we normalize it (lowercase + trim) and add a unique constraint.

-- ─────────────────────────────────────────────────────────────────
-- 1. Normalize all existing emails: lowercase + trim, empty → NULL
-- ─────────────────────────────────────────────────────────────────
UPDATE public.customers
   SET email = NULLIF(LOWER(TRIM(email)), '')
 WHERE email IS DISTINCT FROM NULLIF(LOWER(TRIM(email)), '');

-- ─────────────────────────────────────────────────────────────────
-- 2. Merge duplicate rows by email.
--    Keeper = highest-priority source (stripe > gifted > manual > discovery),
--    ties broken by oldest. Missing fields are filled in from the others;
--    notes are concatenated. Other rows are then deleted.
-- ─────────────────────────────────────────────────────────────────
DO $$
DECLARE
  dup_email text;
  keeper_id uuid;
  other     public.customers%ROWTYPE;
BEGIN
  FOR dup_email IN
    SELECT email FROM public.customers
     WHERE email IS NOT NULL
     GROUP BY email HAVING COUNT(*) > 1
  LOOP
    SELECT id INTO keeper_id FROM public.customers
      WHERE email = dup_email
      ORDER BY
        CASE source WHEN 'stripe'    THEN 1
                    WHEN 'gifted'    THEN 2
                    WHEN 'manual'    THEN 3
                    WHEN 'discovery' THEN 4
                    ELSE 5 END,
        created_at ASC
      LIMIT 1;

    FOR other IN
      SELECT * FROM public.customers
      WHERE email = dup_email AND id <> keeper_id
      ORDER BY created_at ASC
    LOOP
      UPDATE public.customers k SET
        stripe_customer_id = COALESCE(k.stripe_customer_id, other.stripe_customer_id),
        stripe_session_id  = COALESCE(k.stripe_session_id,  other.stripe_session_id),
        name           = COALESCE(NULLIF(k.name, ''),           other.name),
        phone          = COALESCE(NULLIF(k.phone, ''),          other.phone),
        amount_total   = COALESCE(k.amount_total,               other.amount_total),
        currency       = COALESCE(NULLIF(k.currency, ''),       other.currency),
        plan           = COALESCE(NULLIF(k.plan, ''),           other.plan),
        payment_status = COALESCE(NULLIF(k.payment_status, ''), other.payment_status),
        internal_notes = TRIM(BOTH E'\n' FROM
          COALESCE(NULLIF(k.internal_notes, ''), '')
          || CASE WHEN NULLIF(other.internal_notes, '') IS NOT NULL
                  THEN E'\n--- merged from duplicate ---\n' || other.internal_notes
                  ELSE '' END
        )
      WHERE k.id = keeper_id;

      DELETE FROM public.customers WHERE id = other.id;
    END LOOP;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────
-- 3. Unique constraint on email (NULLs are allowed and don't collide)
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_email_unique;
ALTER TABLE public.customers ADD  CONSTRAINT customers_email_unique UNIQUE (email);

-- ─────────────────────────────────────────────────────────────────
-- 4. Normalize email on every future write
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.normalize_customer_email()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.email := NULLIF(LOWER(TRIM(NEW.email)), '');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS customers_normalize_email ON public.customers;
CREATE TRIGGER customers_normalize_email
  BEFORE INSERT OR UPDATE OF email ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.normalize_customer_email();

-- ─────────────────────────────────────────────────────────────────
-- 5. Discovery trigger: case-insensitive match, ON CONFLICT safe
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_discovery_submission()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  normalized_email text := NULLIF(LOWER(TRIM(NEW.email)), '');
BEGIN
  IF normalized_email IS NULL THEN RETURN NEW; END IF;

  UPDATE public.customers
     SET build_stage = 'discovery_received'
   WHERE email = normalized_email
     AND build_stage IN ('paid', 'discovery_sent');

  INSERT INTO public.customers (source, email, name, phone, build_stage)
  VALUES (
    'discovery',
    normalized_email,
    COALESCE(NULLIF(NEW.name, ''), NEW.business),
    NEW.phone,
    'discovery_received'
  )
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';
