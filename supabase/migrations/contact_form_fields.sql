-- Contact form expansion to match FINAL website copy spec.
-- Run in Supabase SQL editor.

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS where_based text,
  ADD COLUMN IF NOT EXISTS current_online_presence text,
  ADD COLUMN IF NOT EXISTS notes text;

-- Existing columns reused:
--   name                   -> Name (required)
--   email                  -> Email (required, kept NOT NULL)
--   phone                  -> Phone (optional)
--   company                -> Business / Brand Name (required)
--   role                   -> What do you do (required)
--   referral_source        -> How did you hear about us (optional)
--   source                 -> 'contact' (set automatically)
