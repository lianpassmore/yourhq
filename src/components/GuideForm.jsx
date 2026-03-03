import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function GuideForm() {
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');

    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const business = form.business.value.trim();
    const referral_source = form.referral_source.value || null;

    const { error } = await supabase
      .from('leads')
      .insert({ name, email, business, source: 'guide', referral_source });

    if (error) {
      console.error('Supabase error:', error);
      setStatus('error');
    } else {
      setStatus('success');
      form.reset();
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-paper p-8 border-2 border-carbon shadow-hard text-center">
        <h3 className="text-2xl font-extrabold mb-4">You're in!</h3>
        <p className="text-gray-600">Check your inbox — the guide is on its way.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-paper p-8 border-2 border-carbon shadow-hard">
      <div className="space-y-2">
        <label htmlFor="name" className="text-xs font-bold uppercase tracking-wide text-gray-500">Name</label>
        <input type="text" name="name" id="name" placeholder="e.g., Sarah" required
          className="w-full border-2 border-gray-300 p-3 text-carbon focus:border-signal focus:outline-none transition-colors" />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-gray-500">Email</label>
        <input type="email" name="email" id="email" placeholder="e.g., sarah@email.com" required
          className="w-full border-2 border-gray-300 p-3 text-carbon focus:border-signal focus:outline-none transition-colors" />
      </div>

      <div className="space-y-2">
        <label htmlFor="business" className="text-xs font-bold uppercase tracking-wide text-gray-500">What kind of business do you run?</label>
        <input type="text" name="business" id="business" placeholder="e.g., Plumber, Salon, Physio clinic"
          className="w-full border-2 border-gray-300 p-3 text-carbon focus:border-signal focus:outline-none transition-colors" />
      </div>

      <div className="space-y-2">
        <label htmlFor="referral_source" className="text-xs font-bold uppercase tracking-wide text-gray-500">How did you hear about us? <span className="normal-case font-normal">(optional)</span></label>
        <select id="referral_source" name="referral_source"
          className="w-full border-2 border-gray-300 p-3 text-carbon focus:border-signal focus:outline-none transition-colors bg-white">
          <option value="">— Select one —</option>
          <option value="Google / Search">Google / Search</option>
          <option value="Facebook / Instagram">Facebook / Instagram</option>
          <option value="Word of mouth">Word of mouth</option>
          <option value="Network partner (accountant, bookkeeper, broker etc.)">Network partner (accountant, bookkeeper, broker etc.)</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <button type="submit" disabled={status === 'sending'}
        className="w-full bg-signal text-white px-8 py-4 font-bold uppercase tracking-widest shadow-hard hover:shadow-none hover:translate-y-[2px] transition-all disabled:opacity-50">
        {status === 'sending' ? 'Sending...' : 'Send Me The Guide'}
      </button>

      {status === 'error' && (
        <p className="text-sm text-red-600 text-center">Something went wrong. Please try again.</p>
      )}

      <p className="text-xs text-center text-gray-400 pt-2">
        We respect your inbox. You'll get the guide + a few helpful emails. No spam, ever.
      </p>
    </form>
  );
}
