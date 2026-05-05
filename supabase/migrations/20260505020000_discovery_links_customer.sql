-- When a discovery submission arrives, link it to a customer:
--   • If a customer already exists with that email, bump their build stage to
--     'discovery_received' (only when earlier in the pipeline — don't roll back
--     later stages like design/build/live).
--   • If no customer exists yet, auto-create one with source = 'discovery' so
--     the lead shows up in the dashboard.
--
-- The trigger runs SECURITY DEFINER so anon's INSERT into discovery_submissions
-- can write to the customers table.

CREATE OR REPLACE FUNCTION public.handle_discovery_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RETURN NEW;
  END IF;

  UPDATE public.customers
     SET build_stage = 'discovery_received'
   WHERE email = NEW.email
     AND build_stage IN ('paid', 'discovery_sent');

  IF NOT EXISTS (SELECT 1 FROM public.customers WHERE email = NEW.email) THEN
    INSERT INTO public.customers (source, email, name, phone, build_stage)
    VALUES (
      'discovery',
      NEW.email,
      COALESCE(NULLIF(NEW.name, ''), NEW.business),
      NEW.phone,
      'discovery_received'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS discovery_submissions_link_customer ON public.discovery_submissions;
CREATE TRIGGER discovery_submissions_link_customer
  AFTER INSERT ON public.discovery_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_discovery_submission();

NOTIFY pgrst, 'reload schema';
