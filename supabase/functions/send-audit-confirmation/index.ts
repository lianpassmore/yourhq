// @ts-nocheck
// Invoked by the /audit-intake form after a successful insert.
// 1. Sends the "your audit is underway" confirmation via Resend.
// 2. Marks any matching audit_payments row as form_submitted = true
//    (done here with the service role so the anon client never touches
//    audit_payments).
//
// Deploy:  supabase functions deploy send-audit-confirmation --no-verify-jwt
// Secrets needed: RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
);

const FROM = 'YourHQ <hello@yourhq.co.nz>';
const SUBJECT = 'Your audit is underway';
const BODY =
  'Your answers are in and I am on it. Your audit document will be in your inbox within five working days. ' +
  'If anything comes up in the meantime, text or email directly. 022 172 5793 or hello@yourhq.co.nz';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { email, name } = await req.json();
    const to = (email || '').trim().toLowerCase();
    if (!to) {
      return new Response(JSON.stringify({ error: 'No email' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Mark the matching payment as submitted (so it won't be nudged as abandoned).
    const { error: updErr } = await supabase
      .from('audit_payments')
      .update({ form_submitted: true })
      .eq('email', to)
      .eq('form_submitted', false);
    if (updErr) console.error('audit_payments update failed:', updErr);

    // Send the confirmation email.
    if (RESEND_API_KEY) {
      const greeting = name ? `Hi ${name},` : 'Hi,';
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
          text: `${greeting}\n\n${BODY}`,
          html: `<p>${greeting}</p><p>${BODY}</p>`,
        }),
      });
      if (!res.ok) console.error('Resend send failed:', await res.text());
    } else {
      console.error('RESEND_API_KEY not set; skipped confirmation email.');
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-audit-confirmation error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
