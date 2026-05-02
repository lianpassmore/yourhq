import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { notifyNtfy } from '../lib/notify';

export default function LeadMagnetForm({
  source = 'lead-magnet',
  buttonText = 'Send Me The Guide',
  successTitle = 'Sorted!',
  successMessage = 'Your guide should have opened in a new tab.',
  pdfUrl = '',
}) {
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');

    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const company = form.company.value.trim();
    const role = form.role.value.trim();
    const phone = form.phone.value.trim();
    const referral_source = form.referral_source.value || null;

    const { error } = await supabase
      .from('leads')
      .insert({ name, email, company: company || null, role: role || null, phone: phone || null, source, referral_source });

    if (error) {
      console.error('Supabase error:', error);
      setStatus('error');
    } else {
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'CompleteRegistration');
      }
      setStatus('success');
      form.reset();
      notifyNtfy(
        `${name || 'Someone'} submitted a lead magnet form. (${source})`,
        'New Lead Magnet Signup'
      );
      if (pdfUrl) {
        window.open(pdfUrl, '_blank');
      }
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white rounded-3xl p-8 md:p-10 border border-carbon/10 shadow-subtle text-center">
        <h3 className="font-display font-bold text-headline uppercase text-carbon mb-4">{successTitle}</h3>
        <p className="text-body text-softGrey">{successMessage}</p>
        {pdfUrl && (
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
            className="inline-block mt-6 bg-carbon text-white px-8 py-4 rounded-full font-medium text-ui hover:bg-deepGreen transition-colors duration-300 shadow-subtle hover:shadow-elegant">
            Open the Guide
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-3xl p-8 md:p-10 border border-carbon/10 shadow-subtle">
      <div className="space-y-2">
        <label htmlFor="name" className="text-xs font-mono font-medium uppercase tracking-[0.15em] text-softGrey">Name *</label>
        <input type="text" name="name" id="name" placeholder="e.g., Sarah" required
          className="w-full border border-carbon/10 bg-white p-3 rounded-xl text-carbon focus:border-signal focus:outline-none transition-colors" />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-mono font-medium uppercase tracking-[0.15em] text-softGrey">Email *</label>
        <input type="email" name="email" id="email" placeholder="e.g., sarah@email.com" required
          className="w-full border border-carbon/10 bg-white p-3 rounded-xl text-carbon focus:border-signal focus:outline-none transition-colors" />
      </div>

      <div className="space-y-2">
        <label htmlFor="company" className="text-xs font-mono font-medium uppercase tracking-[0.15em] text-softGrey">Company <span className="normal-case font-normal">(optional)</span></label>
        <input type="text" name="company" id="company" placeholder="e.g., Smith Electrical Ltd"
          className="w-full border border-carbon/10 bg-white p-3 rounded-xl text-carbon focus:border-signal focus:outline-none transition-colors" />
      </div>

      <div className="space-y-2">
        <label htmlFor="role" className="text-xs font-mono font-medium uppercase tracking-[0.15em] text-softGrey">Role <span className="normal-case font-normal">(optional)</span></label>
        <input type="text" name="role" id="role" placeholder="e.g., Owner, Manager"
          className="w-full border border-carbon/10 bg-white p-3 rounded-xl text-carbon focus:border-signal focus:outline-none transition-colors" />
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-xs font-mono font-medium uppercase tracking-[0.15em] text-softGrey">Phone <span className="normal-case font-normal">(optional)</span></label>
        <input type="tel" name="phone" id="phone" placeholder="e.g., 021 123 4567"
          className="w-full border border-carbon/10 bg-white p-3 rounded-xl text-carbon focus:border-signal focus:outline-none transition-colors" />
      </div>

      <div className="space-y-2">
        <label htmlFor="referral_source" className="text-xs font-mono font-medium uppercase tracking-[0.15em] text-softGrey">How did you hear about us? <span className="normal-case font-normal">(optional)</span></label>
        <select id="referral_source" name="referral_source"
          className="w-full border border-carbon/10 bg-white p-3 rounded-xl text-carbon focus:border-signal focus:outline-none transition-colors">
          <option value="">- Select one -</option>
          <option value="Google / Search">Google / Search</option>
          <option value="Facebook / Instagram">Facebook / Instagram</option>
          <option value="Word of mouth">Word of mouth</option>
          <option value="Network partner (accountant, bookkeeper, broker etc.)">Network partner (accountant, bookkeeper, broker etc.)</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <button type="submit" disabled={status === 'sending'}
        className="w-full bg-carbon text-white px-8 py-4 rounded-full font-medium text-ui hover:bg-deepGreen transition-colors duration-300 shadow-subtle hover:shadow-elegant disabled:opacity-50">
        {status === 'sending' ? 'Sending...' : buttonText}
      </button>

      {status === 'error' && (
        <p className="text-sm text-terracotta text-center">Something went wrong. Please try again.</p>
      )}

      <p className="text-xs text-center text-softGrey/70 pt-2">
        Your guide will open straight away. No spam. Unsubscribe anytime.
      </p>
    </form>
  );
}
