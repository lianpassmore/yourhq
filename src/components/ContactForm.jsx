import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ContactForm() {
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');

    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const business = form.business.value.trim();
    const message = form.message.value.trim();

    const { error } = await supabase
      .from('leads')
      .insert({ name, email, business, message, source: 'contact' });

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
      <div className="max-w-lg w-full text-center py-12">
        <h3 className="text-2xl font-extrabold mb-4">Message sent!</h3>
        <p className="text-gray-600">Nic (or the team) will be in touch within 48 business hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg w-full space-y-6">
      {/* Honeypot field for spam protection */}
      <p className="hidden">
        <label>Don't fill this out if you're human: <input name="bot-field" /></label>
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-xs font-bold uppercase tracking-wide text-gray-500">Name</label>
          <input type="text" id="name" name="name" required
            className="w-full border-2 border-gray-200 p-3 text-carbon focus:border-signal focus:outline-none transition-colors" placeholder="Jane Doe" />
        </div>
        <div className="space-y-2">
          <label htmlFor="business" className="text-xs font-bold uppercase tracking-wide text-gray-500">Business Name</label>
          <input type="text" id="business" name="business" required
            className="w-full border-2 border-gray-200 p-3 text-carbon focus:border-signal focus:outline-none transition-colors" placeholder="Jane's Electrical" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-gray-500">Email</label>
        <input type="email" id="email" name="email" required
          className="w-full border-2 border-gray-200 p-3 text-carbon focus:border-signal focus:outline-none transition-colors" placeholder="jane@example.com" />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-xs font-bold uppercase tracking-wide text-gray-500">What's your question?</label>
        <textarea id="message" name="message" required
          className="w-full border-2 border-gray-200 p-3 text-carbon focus:border-signal focus:outline-none transition-colors h-32" placeholder="I'm wondering about..."></textarea>
      </div>

      <button type="submit" disabled={status === 'sending'}
        className="bg-signal text-white px-8 py-4 w-full font-bold uppercase tracking-widest shadow-hard hover:shadow-none hover:translate-y-[2px] transition-all disabled:opacity-50">
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>

      {status === 'error' && (
        <p className="text-sm text-red-600 text-center">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
