import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { notifyNtfy, notifyOwner } from '../lib/notify';
import { looksLikeBot, HONEYPOT_NAMES, HONEYPOT_STYLE } from '../lib/antibot';

// Maps to the quote_requests table. See:
// supabase/migrations/20260724000000_quote_requests.sql

const GOAL_OPTIONS = [
  'Call or message me',
  'Book an appointment or job',
  'Buy something',
  'Send an enquiry',
  "Just see that I'm the real deal",
  'Not sure yet',
];

const FEATURE_OPTIONS = [
  'Take bookings or appointments online',
  'Sell products',
  'Sell courses or teach people online',
  'Take payments or deposits',
  'Show off my work (photos, projects, before and afters)',
  'Share updates, articles, or news',
  'Collect emails so I can keep in touch',
  'A members-only or clients-only area',
  'Let people request a quote (like this)',
  "None of these, I just need to look sorted online",
];

const CONTENT_OPTIONS = [
  "I've got good photos and know what I want to say",
  "I've got some bits but it needs help",
  'Basically nothing, please handle it',
];

const LABEL = 'block font-sans font-semibold text-ui text-carbon mb-1';
const HELPER = 'font-sans text-ui text-softGrey mb-3';
const INPUT =
  'w-full border border-carbon/15 rounded-xl p-3.5 bg-white text-carbon text-ui placeholder:text-softGrey/60 focus:outline-none focus:border-deepGreen transition-colors';
const TEXTAREA = INPUT + ' resize-none min-h-[110px]';
const STEP = 'font-mono text-badge text-deepGreen mb-4';

function Choice({ type, name, value, label, checked, onChange }) {
  return (
    <label
      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
        checked ? 'border-deepGreen bg-deepGreen/5' : 'border-carbon/10 bg-white hover:border-carbon/30'
      }`}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 accent-deepGreen"
      />
      <span className="font-sans text-ui text-carbon leading-snug">{label}</span>
    </label>
  );
}

export default function QuoteForm() {
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [goal, setGoal] = useState('');
  const [features, setFeatures] = useState([]);
  const [content, setContent] = useState('');
  const startedAt = useRef(Date.now());

  function toggleFeature(v) {
    setFeatures((curr) => (curr.includes(v) ? curr.filter((x) => x !== v) : [...curr, v]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;

    // Invisible bot check — silently accept so bots don't retry or see an error.
    if (looksLikeBot(startedAt.current, HONEYPOT_NAMES.map((n) => form[n]?.value))) {
      setStatus('success');
      return;
    }

    setStatus('sending');

    const name = form.name.value.trim();
    const business_name = form.business_name.value.trim() || null;
    const email = form.email.value.trim();
    const phone = form.phone.value.trim() || null;
    const links = form.links.value.trim() || null;
    const audience = form.audience.value.trim() || null;
    const notes = form.notes.value.trim() || null;

    const row = {
      name,
      business_name,
      email,
      phone,
      links,
      audience,
      primary_goal: goal || null,
      features,
      content_status: content || null,
      notes,
      status: 'received',
    };

    const { error } = await supabase.from('quote_requests').insert(row);

    if (error) {
      console.error('Supabase error:', error);
      setStatus('error');
      return;
    }

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead');
    }

    setStatus('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Push notification (kept alongside email).
    notifyNtfy(
      `${name || 'Someone'} requested a quote${business_name ? ` (${business_name})` : ''}.`,
      'New Quote Request',
      'yourhq-quote',
    );

    // Email Lian the full submission.
    notifyOwner({
      subject: `Quote request — ${business_name || name || 'someone'}`,
      intro: `${name || 'Someone'} asked for a quote through /request-a-quote.`,
      fields: [
        { label: 'Name', value: name },
        { label: 'Business', value: business_name || '—' },
        { label: 'Email', value: email },
        { label: 'Phone', value: phone || '—' },
        { label: 'Links', value: links || '—' },
        { label: 'Wants to reach', value: audience || '—' },
        { label: 'Main goal', value: goal || '—' },
        { label: 'Sounds like them', value: features.length ? features.join(', ') : '—' },
        { label: 'Words & photos', value: content || '—' },
        { label: 'Anything else', value: notes || '—' },
      ],
      replyTo: email,
      source: 'request-a-quote',
    });

    // Confirmation email to the submitter (best-effort, non-blocking).
    try {
      await supabase.functions.invoke('send-quote-confirmation', {
        body: { email, name },
      });
    } catch (err) {
      console.error('Quote confirmation invoke failed (non-blocking):', err);
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white rounded-2xl p-8 sm:p-10 md:p-14 shadow-elegant border border-carbon/5 text-center">
        <div className="w-16 h-16 rounded-full bg-deepGreen/10 text-deepGreen flex items-center justify-center mx-auto text-3xl mb-6">
          ✓
        </div>
        <h3 className="font-display font-bold text-headline uppercase text-carbon mb-4">Got it.</h3>
        <p className="font-sans text-body text-softGrey max-w-md mx-auto">
          I&rsquo;ll have a look at everything you&rsquo;ve sent, do a bit of digging, and email your quote
          within two working days. It&rsquo;ll come from{' '}
          <a href="mailto:lian@yourhq.co.nz" className="text-carbon border-b border-carbon/30 hover:border-carbon transition-colors">
            lian@yourhq.co.nz
          </a>
          , so keep an eye out.
        </p>
        <p className="font-sans text-ui text-softGrey/80 mt-6">
          If anything&rsquo;s urgent in the meantime, text me:{' '}
          <a href="sms:0275668803" className="text-carbon font-medium">027 566 8803</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 md:p-12 shadow-elegant border border-carbon/5 space-y-12">
      {/* Honeypots — hidden from humans, bait for bots. Leave empty. */}
      <div aria-hidden="true" style={HONEYPOT_STYLE}>
        <label>
          Don&rsquo;t fill this in if you&rsquo;re human
          <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
        <label>
          Address
          <input type="text" name="address" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {/* Q1 — Who are you? */}
      <div>
        <p className={STEP}>01</p>
        <p className={LABEL}>Who are you?</p>
        <p className={HELPER}>Name, business name, and the best email for the quote.</p>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="q-name" className="sr-only">Your name</label>
            <input id="q-name" type="text" name="name" required placeholder="Your name *" className={INPUT} />
          </div>
          <div>
            <label htmlFor="q-business" className="sr-only">Business name</label>
            <input id="q-business" type="text" name="business_name" placeholder="Business or brand name" className={INPUT} />
          </div>
          <div>
            <label htmlFor="q-email" className="sr-only">Email</label>
            <input id="q-email" type="email" name="email" required placeholder="Best email *" className={INPUT} />
          </div>
          <div>
            <label htmlFor="q-phone" className="sr-only">Phone</label>
            <input id="q-phone" type="tel" name="phone" placeholder="Phone (optional)" className={INPUT} />
          </div>
        </div>
      </div>

      {/* Q2 — Where can I see you now? */}
      <div>
        <p className={STEP}>02</p>
        <label htmlFor="q-links" className={LABEL}>Where can I see you now?</label>
        <p className={HELPER}>
          Drop any links: current website, Facebook, Instagram, Google listing. Old and embarrassing is fine,
          that&rsquo;s the point.
        </p>
        <textarea id="q-links" name="links" className={TEXTAREA} placeholder="yoursite.co.nz, facebook.com/you, @you on Instagram..." />
      </div>

      {/* Q3 — Who do you most want to reach? */}
      <div>
        <p className={STEP}>03</p>
        <label htmlFor="q-audience" className={LABEL}>Who do you most want this website to reach?</label>
        <p className={HELPER}>
          Homeowners in Northland, brides planning a wedding, other businesses, tourists, locals. Just describe
          them how you&rsquo;d describe them to a mate.
        </p>
        <input id="q-audience" type="text" name="audience" className={INPUT} placeholder="e.g. Busy homeowners around Whangārei who want it done properly" />
      </div>

      {/* Q4 — The one thing (single choice) */}
      <div>
        <p className={STEP}>04</p>
        <p className={LABEL}>When someone lands on your site, what&rsquo;s the one thing you&rsquo;d love them to do?</p>
        <p className={HELPER}>Pick the closest one.</p>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {GOAL_OPTIONS.map((opt) => (
            <Choice
              key={opt}
              type="radio"
              name="primary_goal_choice"
              value={opt}
              label={opt}
              checked={goal === opt}
              onChange={() => setGoal(opt)}
            />
          ))}
        </div>
      </div>

      {/* Q5 — Which sound like you? (multi) */}
      <div>
        <p className={STEP}>05</p>
        <p className={LABEL}>Which of these sound like you?</p>
        <p className={HELPER}>Tick anything that might apply, even if you&rsquo;re only half sure.</p>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {FEATURE_OPTIONS.map((opt) => (
            <Choice
              key={opt}
              type="checkbox"
              name="features"
              value={opt}
              label={opt}
              checked={features.includes(opt)}
              onChange={() => toggleFeature(opt)}
            />
          ))}
        </div>
      </div>

      {/* Q6 — Words and photos (single choice) */}
      <div>
        <p className={STEP}>06</p>
        <p className={LABEL}>Words and photos: what have you got?</p>
        <p className={HELPER}>No wrong answer, all three are normal.</p>
        <div className="space-y-2.5">
          {CONTENT_OPTIONS.map((opt) => (
            <Choice
              key={opt}
              type="radio"
              name="content_status_choice"
              value={opt}
              label={opt}
              checked={content === opt}
              onChange={() => setContent(opt)}
            />
          ))}
        </div>
      </div>

      {/* Q7 — Anything else? */}
      <div>
        <p className={STEP}>07</p>
        <label htmlFor="q-notes" className={LABEL}>Anything else you want me to know?</label>
        <p className={HELPER}>
          Deadlines, budget worries, things you hate about your current site, a competitor whose site you
          secretly rate. All useful, nothing held against you.
        </p>
        <textarea id="q-notes" name="notes" className={TEXTAREA} placeholder="Optional, but handy." />
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full bg-carbon text-white px-8 py-4 rounded-full font-medium text-ui hover:bg-deepGreen transition-colors duration-300 shadow-subtle hover:shadow-elegant disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : "Send it. I'll take it from here."}
        </button>

        {status === 'error' && (
          <p className="text-sm text-terracotta text-center mt-4">
            Something went wrong sending that through. Please try again, or email your answers to{' '}
            <a href="mailto:lian@yourhq.co.nz" className="underline">lian@yourhq.co.nz</a>.
          </p>
        )}

        <p className="text-xs text-center text-softGrey/70 mt-4">
          No call, no obligation. Just a quote in your inbox within two working days.
        </p>
      </div>
    </form>
  );
}
