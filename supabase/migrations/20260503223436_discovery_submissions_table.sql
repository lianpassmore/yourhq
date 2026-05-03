-- Discovery interview submissions — one row per submission, one column per question.
-- Run in Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.discovery_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  tier text NOT NULL,

  -- Module 01 — Welcome
  name text,
  business text NOT NULL,
  how_heard_about_yourhq text,

  -- Module 02 — The Basics
  email text,
  phone text,
  email_for_enquiries text,
  location text,
  service_areas text,
  customer_or_mobile_service text,
  hours text,
  preferred_domain text,
  existing_website_url text,
  social_profiles text,
  logo_status text,
  photos_available text,

  -- Module 03 — The Business (also used in starter short variant)
  what_you_do text,
  main_services_or_products text,
  known_for text,
  qualifications text,
  ideal_customer text,
  not_for text,
  point_of_difference text,
  what_you_care_about text,

  -- Starter-only short variant
  years_in_business text,
  why_you_do_this_work text,

  -- Module 04 — Your Story
  origin_story text,
  why_went_out_on_own text,
  defining_moment_or_person text,
  love_about_work text,
  how_clients_should_feel text,
  deeper_purpose text,
  unexpected_thing text,

  -- Module 05 — Brand & Voice
  brand_guidelines text,
  brand_as_physical_space text,
  three_vibe_words text,
  brands_admired text,
  what_visitors_should_feel text,
  tone_of_voice text,
  brand_personality text,
  brand_colours text,
  colours_to_avoid text,

  -- Module 06 — Online Presence & Content
  most_used_platform text,
  media_and_press text,
  content_style text,
  content_autopilot_interest text,
  online_presence_move_away_from text,

  -- Module 07 — What the Site Needs to Do
  main_call_to_action text,
  top_customer_questions text,
  email_capture_interest text,
  email_marketing_platform text,
  lead_magnet_idea text,
  pricing_approach text,

  -- Module 08 — Integrations
  bookings_system text,
  deposits_or_upfront text,
  stripe_payments_interest text,
  digital_products text,
  course_or_program text,
  face_of_business_or_brand text,
  speaking_and_workshops text,
  signature_media text,
  audience_routing text,

  -- Module 09 — Testimonials & Social Proof
  best_client_compliment text,
  testimonials text,
  proud_results text,
  logos_and_associations text,

  -- Module 10 — Wrap Up
  other_site_wishes text,
  what_didnt_work_before text,
  upcoming_changes text,
  scope_preference text
);

CREATE INDEX IF NOT EXISTS discovery_submissions_created_at_idx
  ON public.discovery_submissions (created_at DESC);

ALTER TABLE public.discovery_submissions ENABLE ROW LEVEL SECURITY;

-- Anonymous inserts only (matches the existing leads table pattern).
DROP POLICY IF EXISTS "anon insert discovery_submissions" ON public.discovery_submissions;
CREATE POLICY "anon insert discovery_submissions"
  ON public.discovery_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);
