import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { notifyNtfy } from '../lib/notify';

export default function ContactForm() {
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');

    const form = e.target;

    if (form['bot-field'].value) {
      setStatus('success');
      return;
    }

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
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-lg w-full text-center py-12">
        <h3 className="font-display font-bold text-headline uppercase text-carbon mb-4">Got it.</h3>
        <p className="text-body text-softGrey">Lian or Nic will be in touch within one business day. Keep an eye on your texts.</p>
      </div>
    );
  }

  const labelCls = "text-xs font-mono font-medium uppercase tracking-[0.15em] text-softGrey";
  const inputCls = "w-full border border-carbon/10 bg-white p-3 rounded-xl text-carbon focus:border-signal focus:outline-none transition-colors";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl w-full space-y-6">
      <p className="hidden">
        <label>Don't fill this out if you're human: <input name="bot-field" /></label>
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className={labelCls}>Your name <span className="text-signal">*</span></label>
          <input type="text" id="name" name="name" required className={inputCls} placeholder="Jane Doe" />
        </div>
        <div className="space-y-2">
          <label htmlFor="where_based" className={labelCls}>Where are you based? <span className="text-signal">*</span></label>
          <input type="text" id="where_based" name="where_based" required className={inputCls} placeholder="City, country" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="company" className={labelCls}>Your business / brand name <span className="text-signal">*</span></label>
        <input type="text" id="company" name="company" required className={inputCls} placeholder="Your business or personal brand" />
      </div>

      <div className="space-y-2">
        <label htmlFor="role" className={labelCls}>What do you do? <span className="text-signal">*</span></label>
        <input type="text" id="role" name="role" required className={inputCls} placeholder="e.g. I'm a physiotherapist / I run a cafe / I'm a business coach" />
      </div>

      <div className="space-y-2">
        <label htmlFor="current_online_presence" className={labelCls}>What's your current online presence? <span className="text-signal">*</span></label>
        <input type="text" id="current_online_presence" name="current_online_presence" required className={inputCls} placeholder="e.g. Just Instagram / Old website from 2019 / Nothing yet" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="email" className={labelCls}>Email <span className="text-signal">*</span></label>
          <input type="email" id="email" name="email" required className={inputCls} placeholder="jane@example.com" />
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className={labelCls}>Phone <span className="font-normal normal-case text-softGrey/70">(optional)</span></label>
          <input type="tel" id="phone" name="phone" className={inputCls} placeholder="027 566 8803" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className={labelCls}>Anything else you'd like to tell me? <span className="font-normal normal-case text-softGrey/70">(optional)</span></label>
        <textarea id="notes" name="notes" className={`${inputCls} h-32`} placeholder="Anything that helps me understand where you're at."></textarea>
      </div>

      <div className="space-y-2">
        <label htmlFor="referral_source" className={labelCls}>How did you hear about us? <span className="font-normal normal-case text-softGrey/70">(optional)</span></label>
        <select id="referral_source" name="referral_source" className={`${inputCls} bg-white`}>
          <option value="">Select one</option>
          <option value="Google / Search">Google / Search</option>
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
