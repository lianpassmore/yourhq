// @ts-nocheck
// Scheduled hourly. Finds people who paid for an audit but never submitted
// the intake form, and nudges them once.
//
// Fires for audit_payments rows where:
//   form_submitted = false AND abandoned_email_sent = false AND created_at < now() - 48h
// Sends a Resend email, then flips abandoned_email_sent = true so it only goes once.
//
// Deploy:   supabase functions deploy check-abandoned-audits --no-verify-jwt
// Schedule: run hourly via Supabase cron (pg_cron / dashboard schedule).
// Secrets:  RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
);

const FROM = 'YourHQ <lian@yourhq.co.nz>';
const SUBJECT = 'One last thing for your audit';
const BODY =
  'You are all paid up but I am still missing your answers before I can get started. ' +
  'Fill them in here when you are ready: https://yourhq.co.nz/audit-intake?order=confirmed. ' +
  'Any questions, text me on 027 566 8803. Lian.';

Deno.serve(async () => {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: pending, error } = await supabase
    .from('audit_payments')
    .select('id, email')
    .eq('form_submitted', false)
    .eq('abandoned_email_sent', false)
    .lt('created_at', cutoff);

  if (error) {
    console.error('Query failed:', error);
    return new Response(JSON.stringify({ error: 'Query failed' }), { status: 500 });
  }

  let sent = 0;
  for (const row of pending ?? []) {
    const to = (row.email || '').trim().toLowerCase();
    if (!to) continue;

    let ok = false;
    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM,
          to,
          subject: SUBJECT,
          text: BODY,
          html: `<p>${BODY}</p>`,
        }),
      });
      ok = res.ok;
      if (!ok) console.error('Resend send failed:', await res.text());
    } else {
      console.error('RESEND_API_KEY not set; cannot send abandoned email.');
    }

    // Only flip the flag if the send succeeded, so a transient failure retries next hour.
    if (ok) {
      const { error: updErr } = await supabase
        .from('audit_payments')
        .update({ abandoned_email_sent: true })
        .eq('id', row.id);
      if (updErr) console.error('Flag update failed:', updErr);
      else sent++;
    }
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
