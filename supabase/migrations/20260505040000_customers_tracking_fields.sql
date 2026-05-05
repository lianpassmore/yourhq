-- Tracking fields so the admin dashboard can show, per customer:
--   • Google Drive folder link
--   • Target launch date (timeframe)
--   • What's outstanding on Lian's side
--   • What we're waiting on from the client

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS business            text,
  ADD COLUMN IF NOT EXISTS google_drive_url    text,
  ADD COLUMN IF NOT EXISTS target_launch_date  date,
  ADD COLUMN IF NOT EXISTS outstanding         text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS waiting_on          text NOT NULL DEFAULT '';

-- Discovery trigger: also pull business name through to the customer row
-- when a discovery submission auto-creates one.
CREATE OR REPLACE FUNCTION public.handle_discovery_submission()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  normalized_email text := NULLIF(LOWER(TRIM(NEW.email)), '');
BEGIN
  IF normalized_email IS NULL THEN RETURN NEW; END IF;

  UPDATE public.customers
     SET build_stage = 'discovery_received',
         business    = COALESCE(NULLIF(business, ''), NEW.business)
   WHERE email = normalized_email
     AND build_stage IN ('paid', 'discovery_sent');

  -- Also fill in business on customers that already advanced past discovery,
  -- but don't roll back their stage.
  UPDATE public.customers
     SET business = COALESCE(NULLIF(business, ''), NEW.business)
   WHERE email = normalized_email
     AND business IS NULL OR business = '';

  INSERT INTO public.customers (source, email, name, business, phone, build_stage)
  VALUES (
    'discovery',
    normalized_email,
    NULLIF(NEW.name, ''),
    NEW.business,
    NEW.phone,
    'discovery_received'
  )
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';
