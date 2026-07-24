// @ts-nocheck
// Generic "new submission" alert to Lian, via Resend.
// Invoked (fire-and-forget) by the high-intent website forms after a
// successful insert: contact, website audit, discovery brief, network
// partner, and request-a-quote.
//
// The destination is hardcoded server-side (lian@yourhq.co.nz) so this
// function can only ever email the owner — the client just supplies the
// summary. The submitter's email is used as reply-to so Lian can reply
// straight from the notification.
//
// Deploy:  supabase functions deploy notify-owner --no-verify-jwt
// Secret needed: RESEND_API_KEY

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const FROM = 'YourHQ Forms <lian@yourhq.co.nz>';
const OWNER = 'lian@yourhq.co.nz';

function esc(s: string) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { subject, intro, fields, replyTo, source } = await req.json();

    const safeSubject = (subject || 'New form submission').toString().slice(0, 200);
    const rows = Array.isArray(fields) ? fields : [];

    const textLines = [
      intro || '',
      '',
      ...rows.map((f) => `${f.label}: ${f.value ?? ''}`),
      '',
      source ? `Source: ${source}` : '',
    ].filter((l) => l !== null && l !== undefined);

    const htmlRows = rows
      .map(
        (f) =>
          `<tr><td style="padding:6px 16px 6px 0;vertical-align:top;color:#6B6B6B;font-size:13px;white-space:nowrap">${esc(
            f.label,
          )}</td><td style="padding:6px 0;vertical-align:top;color:#0B0B0C;font-size:14px">${esc(
            f.value,
          ).replace(/\n/g, '<br>')}</td></tr>`,
      )
      .join('');

    const html =
      `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px">` +
      (intro ? `<p style="font-size:15px;color:#0B0B0C">${esc(intro)}</p>` : '') +
      `<table style="border-collapse:collapse;margin-top:8px">${htmlRows}</table>` +
      (source
        ? `<p style="margin-top:20px;font-size:12px;color:#9A9A9A">Source: ${esc(source)}</p>`
        : '') +
      `</div>`;

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not set; skipped owner notification.');
      return new Response(JSON.stringify({ ok: false, skipped: true }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const payload: Record<string, unknown> = {
      from: FROM,
      to: OWNER,
      subject: safeSubject,
      text: textLines.join('\n'),
      html,
    };
    const rt = (replyTo || '').toString().trim();
    if (rt) payload.reply_to = rt;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('Resend send failed:', await res.text());
      return new Response(JSON.stringify({ ok: false }), {
        status: 502,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('notify-owner error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
