-- Website Audit funnel: intake answers + payment tracking for the abandoned-form nudge.
-- Follows the same anon-insert-only pattern as discovery_submissions.

-- ─────────────────────────────────────────────────────────────────
-- audit_intake — the eight (nine) answers from /audit-intake.
-- anon (the website form) can INSERT only. Lian reads via the dashboard.
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_intake (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  name                text NOT NULL,
  email               text NOT NULL,
  business_name       text NOT NULL,
  website_url         text NOT NULL,
  primary_goal        text NOT NULL,
  ideal_client        text NOT NULL,
  wants_more_of       text NOT NULL,
  wants_to_move_away  text,
  big_objection       text NOT NULL,
  likes_about_site    text,
  desired_feeling     text NOT NULL,
  tone_exclusions     text,
  status              text NOT NULL DEFAULT 'received'
);

REVOKE ALL ON public.audit_intake FROM anon, authenticated;
GRANT INSERT ON public.audit_intake TO anon;

ALTER TABLE public.audit_intake ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon insert audit_intake" ON public.audit_intake;
CREATE POLICY "anon insert audit_intake"
  ON public.audit_intake
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────
-- audit_payments — one row per audit checkout (written by the Stripe
-- webhook with the service role). NO anon access. Drives the
-- abandoned-form email when form_submitted stays false past 48h.
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_payments (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           timestamptz NOT NULL DEFAULT now(),
  email                text NOT NULL,
  stripe_session_id    text UNIQUE,
  form_submitted       boolean NOT NULL DEFAULT false,
  abandoned_email_sent boolean NOT NULL DEFAULT false
);

-- Service role only (it bypasses RLS + grants). Lock out anon/authenticated.
REVOKE ALL ON public.audit_payments FROM anon, authenticated;
ALTER TABLE public.audit_payments ENABLE ROW LEVEL SECURITY;

-- Lookups by email (form-submitted match) and by the abandoned-check scan.
CREATE INDEX IF NOT EXISTS audit_payments_email_idx ON public.audit_payments (email);
CREATE INDEX IF NOT EXISTS audit_payments_pending_idx
  ON public.audit_payments (created_at)
  WHERE form_submitted = false AND abandoned_email_sent = false;

NOTIFY pgrst, 'reload schema';
