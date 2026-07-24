-- Request a Quote funnel: /request-a-quote submissions.
-- The written path to a proposal, for people who'd rather not call.
-- Same anon-insert-only pattern as audit_intake and discovery_submissions:
-- the website form (anon) can INSERT only; Lian reads via the dashboard.

CREATE TABLE IF NOT EXISTS public.quote_requests (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     timestamptz NOT NULL DEFAULT now(),

  -- Q1 — Who are you?
  name           text NOT NULL,
  business_name  text,
  email          text NOT NULL,
  phone          text,

  -- Q2 — Where can I see you now? (the research question)
  links          text,

  -- Q3 — Who do you most want this website to reach?
  audience       text,

  -- Q4 — The one thing you'd love a visitor to do (single choice → primary CTA)
  primary_goal   text,

  -- Q5 — Which of these sound like you? (multi choice → build scope)
  features       text[] NOT NULL DEFAULT '{}',

  -- Q6 — Words and photos: what have you got? (single choice → copy/content scope)
  content_status text,

  -- Q7 — Anything else you want me to know?
  notes          text,

  status         text NOT NULL DEFAULT 'received'
);

CREATE INDEX IF NOT EXISTS quote_requests_created_at_idx
  ON public.quote_requests (created_at DESC);

REVOKE ALL ON public.quote_requests FROM anon, authenticated;
GRANT INSERT ON public.quote_requests TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon insert quote_requests" ON public.quote_requests;
CREATE POLICY "anon insert quote_requests"
  ON public.quote_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
