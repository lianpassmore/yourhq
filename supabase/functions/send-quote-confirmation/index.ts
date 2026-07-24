// @ts-nocheck
// Invoked by the /request-a-quote form after a successful insert.
// Sends the submitter the "your quote is on its way" confirmation via Resend.
// Subject + body are fixed here server-side; the client only supplies the
// destination email + name (same trust model as send-audit-confirmation).
//
// Deploy:  supabase functions deploy send-quote-confirmation --no-verify-jwt
// Secret needed: RESEND_API_KEY

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const FROM = 'YourHQ <lian@yourhq.co.nz>';
const SUBJECT = 'Your YourHQ quote is on its way';
const BODY =
  "Thanks for sending your details through. I'll have a proper look at everything you've given me, do a bit of digging into your links, " +
  "and email your personal quote within two working days. It'll come from this address, so keep an eye out. " +
  "If anything's urgent in the meantime, text me on 027 566 8803.";
const SIGN = '— Lian, YourHQ';

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

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not set; skipped quote confirmation.');
      return new Response(JSON.stringify({ ok: false, skipped: true }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

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
        text: `${greeting}\n\n${BODY}\n\n${SIGN}`,
        html: `<p>${greeting}</p><p>${BODY}</p><p>${SIGN}</p>`,
      }),
    });
    if (!res.ok) console.error('Resend send failed:', await res.text());

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-quote-confirmation error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
