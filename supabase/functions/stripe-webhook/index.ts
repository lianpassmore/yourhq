// @ts-nocheck
import Stripe from 'https://esm.sh/stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

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

    const name = session.customer_details?.name || 'Someone';
    const email = session.customer_details?.email || '';
    const amount = session.amount_total
      ? `NZD $${(session.amount_total / 100).toFixed(2)}`
      : '';
    const plan = session.metadata?.plan || '';

    const lines = [`${name} just paid!`];
    if (email) lines.push(`Email: ${email}`);
    if (amount) lines.push(`Amount: ${amount}`);
    if (plan) lines.push(`Plan: ${plan}`);

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
