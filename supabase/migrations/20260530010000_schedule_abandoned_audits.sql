-- Schedule the abandoned-audit nudge to run hourly.
-- Invokes the check-abandoned-audits edge function, which is deployed
-- --no-verify-jwt so no auth token needs to live in this SQL.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Idempotent: drop any prior schedule of the same name before re-adding.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'check-abandoned-audits-hourly') THEN
    PERFORM cron.unschedule('check-abandoned-audits-hourly');
  END IF;
END $$;

SELECT cron.schedule(
  'check-abandoned-audits-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://ysfdezkuujkjakifrlhd.supabase.co/functions/v1/check-abandoned-audits',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);
