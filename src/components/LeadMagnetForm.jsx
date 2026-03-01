import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LeadMagnetForm({
  source = 'lead-magnet',
  buttonText = 'Send Me The Guide',
  successTitle = 'Sorted!',
  successMessage = 'Your guide should have opened in a new tab.',
  pdfUrl = null,
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

    const { error } = await supabase
      .from('leads')
      .insert({ name, email, company: company || null, role: role || null, phone: phone || null, source });

    if (error) {
      console.error('Supabase error:', error);
      setStatus('error');
    } else {
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'CompleteRegistration');
      }
      setStatus('success');
      form.reset();
      if (pdfUrl) {
        window.open(pdfUrl, '_blank');
      }
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-paper p-8 border-2 border-carbon shadow-hard text-center">
        <h3 className="text-2xl font-extrabold mb-4">{successTitle}</h3>
        <p className="text-gray-600">{successMessage}</p>
        {pdfUrl && (
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
            className="inline-block mt-6 bg-signal text-white px-8 py-4 font-bold uppercase tracking-widest shadow-hard hover:shadow-none hover:translate-y-[2px] transition-all">
            Open the Guide
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-paper p-8 border-2 border-carbon shadow-hard">
      <div className="space-y-2">
        <label htmlFor="name" className="text-xs font-bold uppercase tracking-wide text-gray-500">Name *</label>
        <input type="text" name="name" id="name" placeholder="e.g., Sarah" required
          className="w-full border-2 border-gray-300 p-3 text-carbon focus:border-signal focus:outline-none transition-colors" />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-gray-500">Email *</label>
        <input type="email" name="email" id="email" placeholder="e.g., sarah@email.com" required
          className="w-full border-2 border-gray-300 p-3 text-carbon focus:border-signal focus:outline-none transition-colors" />
      </div>

      <div className="space-y-2">
        <label htmlFor="company" className="text-xs font-bold uppercase tracking-wide text-gray-500">Company <span className="normal-case font-normal">(optional)</span></label>
        <input type="text" name="company" id="company" placeholder="e.g., Smith Electrical Ltd"
          className="w-full border-2 border-gray-300 p-3 text-carbon focus:border-signal focus:outline-none transition-colors" />
      </div>

      <div className="space-y-2">
        <label htmlFor="role" className="text-xs font-bold uppercase tracking-wide text-gray-500">Role <span className="normal-case font-normal">(optional)</span></label>
        <input type="text" name="role" id="role" placeholder="e.g., Owner, Manager"
          className="w-full border-2 border-gray-300 p-3 text-carbon focus:border-signal focus:outline-none transition-colors" />
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wide text-gray-500">Phone <span className="normal-case font-normal">(optional)</span></label>
        <input type="tel" name="phone" id="phone" placeholder="e.g., 021 123 4567"
          className="w-full border-2 border-gray-300 p-3 text-carbon focus:border-signal focus:outline-none transition-colors" />
      </div>

      <button type="submit" disabled={status === 'sending'}
        className="w-full bg-signal text-white px-8 py-4 font-bold uppercase tracking-widest shadow-hard hover:shadow-none hover:translate-y-[2px] transition-all disabled:opacity-50">
        {status === 'sending' ? 'Sending...' : buttonText}
      </button>

      {status === 'error' && (
        <p className="text-sm text-red-600 text-center">Something went wrong. Please try again.</p>
      )}

      <p className="text-xs text-center text-gray-400 pt-2">
        Your guide will open straight away. No spam. Unsubscribe anytime.
      </p>
    </form>
  );
}
