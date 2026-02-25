import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'yourhq_popup_dismissed';
const DISMISS_DAYS = 7;
const DELAY_MS = 8000;

export default function MailingListPopup({ excludePaths = [] }) {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  useEffect(() => {
    // Don't show on excluded paths
    if (excludePaths.some(p => window.location.pathname.startsWith(p))) return;

    // Don't show if dismissed recently
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_DAYS) return;
    }

    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setVisible(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');

    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();

    const { error } = await supabase
      .from('leads')
      .insert({ name, email, source: 'mailing-list-popup' });

    if (error) {
      console.error('Supabase error:', error);
      setStatus('error');
    } else {
      setStatus('success');
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        setVisible(false);
      }, 3000);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={dismiss}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-carbon/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white border-2 border-carbon shadow-hard w-full max-w-md p-8" onClick={e => e.stopPropagation()}>

        {/* Close button */}
        <button onClick={dismiss} className="absolute top-4 right-4 text-gray-400 hover:text-carbon transition-colors text-2xl leading-none" aria-label="Close">
          &times;
        </button>

        {status === 'success' ? (
          <div className="text-center py-4">
            <h3 className="text-2xl font-extrabold mb-2">You're in!</h3>
            <p className="text-gray-600">We'll keep you in the loop with tips on showing up online.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="inline-block bg-frangipani/20 border border-frangipani px-3 py-0.5 mb-4 rounded-full">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-carbon">Free Tips</span>
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight mb-2">Want to show up online?</h3>
              <p className="text-gray-500 text-sm">Join the YourHQ mailing list. Practical tips for NZ small businesses. No spam, ever.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="popup-name" className="text-xs font-bold uppercase tracking-wide text-gray-500">Name</label>
                <input type="text" name="name" id="popup-name" placeholder="e.g., Sarah" required
                  className="w-full border-2 border-gray-300 p-3 text-carbon focus:border-signal focus:outline-none transition-colors" />
              </div>

              <div className="space-y-2">
                <label htmlFor="popup-email" className="text-xs font-bold uppercase tracking-wide text-gray-500">Email</label>
                <input type="email" name="email" id="popup-email" placeholder="e.g., sarah@email.com" required
                  className="w-full border-2 border-gray-300 p-3 text-carbon focus:border-signal focus:outline-none transition-colors" />
              </div>

              <button type="submit" disabled={status === 'sending'}
                className="w-full bg-signal text-white px-8 py-4 font-bold uppercase tracking-widest shadow-hard hover:shadow-none hover:translate-y-[2px] transition-all disabled:opacity-50">
                {status === 'sending' ? 'Signing up...' : 'Keep Me in the Loop'}
              </button>

              {status === 'error' && (
                <p className="text-sm text-red-600 text-center">Something went wrong. Please try again.</p>
              )}

              <p className="text-xs text-center text-gray-400">
                Unsubscribe anytime. We respect your inbox.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
