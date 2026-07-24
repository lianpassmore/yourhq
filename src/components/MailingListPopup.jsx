import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { notifyNtfy } from '../lib/notify';

const STORAGE_KEY = 'yourhq_popup_dismissed';
const DISMISS_DAYS = 7;
const SCROLL_DEPTH = 0.6; // fire once the visitor has read 60% of the page

/**
 * @param {{ excludePaths?: string[] }} props
 */
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

    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable >= SCROLL_DEPTH) {
        setVisible(true);
        window.removeEventListener('scroll', onScroll);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
    const referral_source = form.referral_source.value || null;

    const { error } = await supabase
      .from('leads')
      .insert({ name, email, source: 'mailing-list-popup', referral_source });

    if (error) {
      console.error('Supabase error:', error);
      setStatus('error');
    } else {
      setStatus('success');
      notifyNtfy(
        `${name || 'Someone'} signed up to the mailing list.`,
        'New Mailing List Signup'
      );
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
      <div className="absolute inset-0 bg-carbon/40" />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl border border-carbon/10 shadow-elegant w-full max-w-md p-6 sm:p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Close button */}
        <button onClick={dismiss} className="absolute top-4 right-4 text-softGrey hover:text-carbon transition-colors text-2xl leading-none" aria-label="Close">
          &times;
        </button>

        {status === 'success' ? (
          <div className="text-center py-4">
            <h3 className="font-display font-bold text-headline uppercase text-carbon mb-2">You're in!</h3>
            <p className="text-body text-softGrey">We'll keep you in the loop with tips on showing up online.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="inline-block bg-terracotta/10 border border-terracotta/40 px-3 py-0.5 mb-4 rounded-full">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-terracotta">Free Tips</span>
              </div>
              <h3 className="font-display font-bold text-headline uppercase text-carbon mb-2">Want to show up online?</h3>
              <p className="text-softGrey text-sm">Join the YourHQ mailing list. Practical tips for NZ small businesses. No spam, ever.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="popup-name" className="text-xs font-mono font-medium uppercase tracking-[0.15em] text-softGrey">Name</label>
                <input type="text" name="name" id="popup-name" placeholder="e.g., Sarah" required
                  className="w-full border border-carbon/10 bg-white p-3 rounded-xl text-carbon focus:border-deepGreen focus:outline-none transition-colors" />
              </div>

              <div className="space-y-2">
                <label htmlFor="popup-email" className="text-xs font-mono font-medium uppercase tracking-[0.15em] text-softGrey">Email</label>
                <input type="email" name="email" id="popup-email" placeholder="e.g., sarah@email.com" required
                  className="w-full border border-carbon/10 bg-white p-3 rounded-xl text-carbon focus:border-deepGreen focus:outline-none transition-colors" />
              </div>

              <div className="space-y-2">
                <label htmlFor="popup-referral" className="text-xs font-mono font-medium uppercase tracking-[0.15em] text-softGrey">How did you find us? <span className="text-softGrey/70 normal-case font-normal">(optional)</span></label>
                <select name="referral_source" id="popup-referral"
                  className="w-full border border-carbon/10 bg-white p-3 rounded-xl text-carbon focus:border-deepGreen focus:outline-none transition-colors">
                  <option value="">Select an option...</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Google Maps">Google Maps</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Word of Mouth">Word of Mouth</option>
                  <option value="Referral">Referral / Partner</option>
                  <option value="Blog / Article">Blog / Article</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button type="submit" disabled={status === 'sending'}
                className="w-full bg-carbon text-white px-8 py-4 rounded-full font-medium text-ui hover:bg-deepGreen transition-colors duration-300 shadow-subtle hover:shadow-elegant disabled:opacity-50">
                {status === 'sending' ? 'Signing up...' : 'Keep Me in the Loop'}
              </button>

              {status === 'error' && (
                <p className="text-sm text-terracotta text-center">Something went wrong. Please try again.</p>
              )}

              <p className="text-xs text-center text-softGrey/70">
                Unsubscribe anytime. We respect your inbox.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
