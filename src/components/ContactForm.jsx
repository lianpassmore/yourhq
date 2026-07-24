import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { notifyNtfy, notifyOwner } from '../lib/notify';
import { looksLikeBot, HONEYPOT_NAMES, HONEYPOT_STYLE } from '../lib/antibot';

export default function ContactForm() {
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const startedAt = useRef(Date.now());

  async function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;

    // Invisible bot check (honeypots + submit-time trap). Silently "succeed"
    // so bots don't retry or learn they were caught.
    if (looksLikeBot(startedAt.current, HONEYPOT_NAMES.map((n) => form[n]?.value))) {
      setStatus('success');
      return;
    }

    setStatus('sending');

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim() || null,
      where_based: form.where_based.value.trim(),
      company: form.company.value.trim(),
      role: form.role.value.trim(),
      current_online_presence: form.current_online_presence.value.trim(),
      notes: form.notes.value.trim() || null,
      referral_source: form.referral_source.value || null,
      source: 'contact'
      // `notes` now carries the "What's prompted this?" answer.
    };

    const { error } = await supabase.from('leads').insert(payload);

    if (error) {
      console.error('Supabase error:', error);
      setStatus('error');
    } else {
      setStatus('success');
      form.reset();
      notifyNtfy(
        `${payload.name || 'Someone'} sent a contact message.`,
        'New Contact Form'
      );
      notifyOwner({
        subject: `Contact form — ${payload.company || payload.name || 'someone'}`,
        intro: `${payload.name || 'Someone'} sent a message through the contact form.`,
        fields: [
          { label: 'Name', value: payload.name },
          { label: 'Business', value: payload.company },
          { label: 'What they do', value: payload.role },
          { label: 'Based', value: payload.where_based },
          { label: 'Email', value: payload.email },
          { label: 'Phone', value: payload.phone || '—' },
          { label: 'Current presence', value: payload.current_online_presence },
          { label: "What's prompted this", value: payload.notes || '—' },
          { label: 'Heard about us', value: payload.referral_source || '—' },
        ],
        replyTo: payload.email,
        source: 'contact',
      });
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-lg w-full text-center py-12">
        <h3 className="font-display font-bold text-headline uppercase text-carbon mb-4">Got it.</h3>
        <p className="text-body text-softGrey">I'll be in touch within one business day. Keep an eye on your texts and inbox.</p>
      </div>
    );
  }

  const labelCls = "text-xs font-mono font-medium uppercase tracking-[0.15em] text-softGrey";
  const inputCls = "w-full border border-carbon/10 bg-white p-3 rounded-xl text-carbon focus:border-deepGreen focus:outline-none transition-colors";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl w-full space-y-6">
      {/* Honeypots — hidden from humans, bait for bots. Leave empty. */}
      <div aria-hidden="true" style={HONEYPOT_STYLE}>
        <label>Don't fill this out if you're human: <input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
        <label>Address: <input name="address" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className={labelCls}>Your name <span className="text-terracotta">*</span></label>
          <input type="text" id="name" name="name" required className={inputCls} placeholder="Jane Doe" />
        </div>
        <div className="space-y-2">
          <label htmlFor="where_based" className={labelCls}>Where are you based? <span className="text-terracotta">*</span></label>
          <input type="text" id="where_based" name="where_based" required className={inputCls} placeholder="City, country" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="company" className={labelCls}>Your business / brand name <span className="text-terracotta">*</span></label>
        <input type="text" id="company" name="company" required className={inputCls} placeholder="Your business or personal brand" />
      </div>

      <div className="space-y-2">
        <label htmlFor="role" className={labelCls}>What do you do? <span className="text-terracotta">*</span></label>
        <input type="text" id="role" name="role" required className={inputCls} placeholder="e.g. I'm a physiotherapist / I run a cafe / I'm a business coach" />
      </div>

      <div className="space-y-2">
        <label htmlFor="current_online_presence" className={labelCls}>What's your current online presence? <span className="text-terracotta">*</span></label>
        <input type="text" id="current_online_presence" name="current_online_presence" required className={inputCls} placeholder="e.g. Just Instagram / Old website from 2019 / Nothing yet" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="email" className={labelCls}>Email <span className="text-terracotta">*</span></label>
          <input type="email" id="email" name="email" required className={inputCls} placeholder="jane@example.com" />
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className={labelCls}>Phone <span className="font-normal normal-case text-softGrey/70">(optional)</span></label>
          <input type="tel" id="phone" name="phone" className={inputCls} placeholder="027 566 8803" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className={labelCls}>What's prompted this? <span className="text-terracotta">*</span></label>
        <textarea id="notes" name="notes" required className={`${inputCls} h-32`} placeholder="A sentence or two is plenty. Old site that needs sorting, no site at all, just curious. All good answers."></textarea>
      </div>

      <div className="space-y-2">
        <label htmlFor="referral_source" className={labelCls}>How did you hear about us? <span className="font-normal normal-case text-softGrey/70">(optional)</span></label>
        <select id="referral_source" name="referral_source" className={`${inputCls} bg-white`}>
          <option value="">Select one</option>
          <option value="Google / Search">Google / Search</option>
          <option value="AI tool (ChatGPT, Claude, etc.)">AI tool (ChatGPT, Claude, etc.)</option>
          <option value="Facebook / Instagram">Facebook / Instagram</option>
          <option value="Word of mouth">Word of mouth</option>
          <option value="Network partner (accountant, bookkeeper, broker etc.)">Network partner (accountant, bookkeeper, broker etc.)</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-carbon text-white px-8 py-4 rounded-full font-medium text-ui hover:bg-deepGreen transition-colors duration-300 shadow-subtle hover:shadow-elegant disabled:opacity-50"
      >
        {status === 'sending' ? 'Sending...' : 'Send It Through'}
      </button>

      {status === 'error' && (
        <p className="text-sm text-terracotta text-center">Something went wrong. Please try again, or text 027 566 8803.</p>
      )}
    </form>
  );
}
