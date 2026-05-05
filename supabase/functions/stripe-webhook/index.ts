// @ts-nocheck
import Stripe from 'https://esm.sh/stripe@14';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
);

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('No signature', { status: 400 });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const rawEmail = session.customer_details?.email || '';
    const email    = rawEmail.trim().toLowerCase() || null;
    const name     = session.customer_details?.name  || 'Someone';
    const phone    = session.customer_details?.phone || '';
    const amount   = session.amount_total
      ? `NZD $${(session.amount_total / 100).toFixed(2)}`
      : '';
    const plan = session.metadata?.plan || '';

    // Stripe-side fields we always want to write/refresh
    const stripeFields = {
      stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
      stripe_session_id:  session.id,
      name,
      phone,
      amount_total:   session.amount_total,
      currency:       session.currency,
      plan,
      payment_status: session.payment_status,
      source:         'stripe',
    };

    // Merge into an existing row by email if we have one; otherwise insert.
    let dbError = null;
    if (email) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        // Update existing customer — leave build_stage and internal_notes alone
        // so Lian's manual progress tracking isn't overwritten.
        const { error } = await supabase
          .from('customers')
          .update(stripeFields)
          .eq('id', existing.id);
        dbError = error;
      } else {
        const { error } = await supabase
          .from('customers')
          .insert({ email, ...stripeFields });
        dbError = error;
      }
    } else {
      // No email — insert without dedupe, keyed only by stripe_session_id
      const { error } = await supabase
        .from('customers')
        .insert(stripeFields);
      dbError = error;
    }

    if (dbError) console.error('Failed to write customer:', dbError);

    const lines = [`${name} just paid!`];
    if (rawEmail) lines.push(`Email: ${rawEmail}`);
    if (amount)   lines.push(`Amount: ${amount}`);
    if (plan)     lines.push(`Plan: ${plan}`);

    await fetch('https://ntfy.sh/yourhq-payment', {
      method: 'POST',
      body: lines.join('\n'),
      headers: {
        'Title': 'Payment Received',
        'Priority': 'urgent',
        'Tags': 'moneybag',
      },
    });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
