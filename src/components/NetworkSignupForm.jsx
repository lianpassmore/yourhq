import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { notifyNtfy } from '../lib/notify';

const INTEREST_OPTIONS = [
  'Referring clients to YourHQ',
  'Free webinar for my clients',
  'Co-branded guides / resources',
  'Workshops or talks',
  'Just keeping in touch for now',
];

export default function NetworkSignupForm() {
  const [status, setStatus] = useState('idle');
  const [interests, setInterests] = useState([]);

  function toggleInterest(value) {
    setInterests((curr) =>
      curr.includes(value) ? curr.filter((v) => v !== value) : [...curr, value]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');

    const form = e.target;

    if (form['bot-field'].value) {
      setStatus('success');
      return;
    }

    const clientFocus = form.client_focus.value.trim();
    const generalNotes = form.notes.value.trim();
    const combinedNotes = [
      clientFocus && `Clients: ${clientFocus}`,
      generalNotes,
    ].filter(Boolean).join('\n\n') || null;

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim() || null,
      company: form.firm.value.trim(),
      role: form.role.value,
      where_based: form.region.value.trim() || null,
      notes: combinedNotes,
      tags: interests,
      source: 'network',
    };

    const { error } = await supabase.from('leads').insert(payload);

    if (error) {
      console.error('Supabase error:', error);
      setStatus('error');
    } else {
      setStatus('success');
      form.reset();
      setInterests([]);
      notifyNtfy(
        `${payload.name} (${payload.firm}) joined the YourHQ Network.`,
        'New Network Partner'
      );
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-bone text-carbon p-10 md:p-14 max-w-xl mx-auto rounded-2xl text-center shadow-elegant border border-carbon">
        <h3 className="font-display font-bold text-headline uppercase text-carbon mb-4">Welcome aboard.</h3>
        <p className="font-sans text-body text-softGrey">Nic will be in touch within one business day with your welcome kit and referral tools.</p>
      </div>
    );
  }

  const labelCls = "text-xs font-mono font-medium uppercase tracking-[0.15em] text-softGrey";
  const inputCls = "w-full border border-carbon/10 bg-white p-3 rounded-xl text-carbon focus:border-signal focus:outline-none transition-colors";

  return (
    <div className="bg-bone text-carbon p-8 md:p-12 max-w-2xl mx-auto rounded-2xl shadow-elegant border border-carbon text-left">
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="hidden">
          <label>Don't fill this out if you're human: <input name="bot-field" /></label>
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className={labelCls}>Your name <span className="text-signal">*</span></label>
            <input type="text" id="name" name="name" required className={inputCls} placeholder="Jane Doe" />
          </div>
          <div className="space-y-2">
            <label htmlFor="firm" className={labelCls}>Firm / Business <span className="text-signal">*</span></label>
            <input type="text" id="firm" name="firm" required className={inputCls} placeholder="e.g. Northland Accounting Co." />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="role" className={labelCls}>Your role <span className="text-signal">*</span></label>
            <select id="role" name="role" required className={`${inputCls} bg-white`} defaultValue="">
              <option value="" disabled>Select one</option>
              <option value="Accountant / Bookkeeper">Accountant / Bookkeeper</option>
              <option value="Mortgage Broker">Mortgage Broker</option>
              <option value="Bank BDM">Bank BDM</option>
              <option value="Insurance Broker">Insurance Broker</option>
              <option value="Business Coach">Business Coach</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="region" className={labelCls}>Region <span className="font-normal normal-case text-softGrey/70">(optional)</span></label>
            <input type="text" id="region" name="region" className={inputCls} placeholder="e.g. Whangārei, Auckland, NZ-wide" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="email" className={labelCls}>Email <span className="text-signal">*</span></label>
            <input type="email" id="email" name="email" required className={inputCls} placeholder="jane@firm.co.nz" />
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className={labelCls}>Phone <span className="font-normal normal-case text-softGrey/70">(optional)</span></label>
            <input type="tel" id="phone" name="phone" className={inputCls} placeholder="022 172 5793" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="client_focus" className={labelCls}>Who are your clients, mostly? <span className="font-normal normal-case text-softGrey/70">(optional)</span></label>
          <input type="text" id="client_focus" name="client_focus" className={inputCls} placeholder="e.g. Tradies, salons, small service businesses" />
        </div>

        <div className="space-y-3">
          <p className={labelCls}>What are you keen to explore? <span className="font-normal normal-case text-softGrey/70">(tick any)</span></p>
          <div className="grid sm:grid-cols-2 gap-2">
            {INTEREST_OPTIONS.map((option) => {
              const checked = interests.includes(option);
              return (
                <label
                  key={option}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${checked ? 'border-deepGreen bg-deepGreen/5' : 'border-carbon/10 bg-white hover:border-carbon/30'}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleInterest(option)}
                    className="mt-0.5 accent-deepGreen"
                  />
                  <span className="font-sans text-sm text-carbon leading-snug">{option}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="notes" className={labelCls}>Anything else? <span className="font-normal normal-case text-softGrey/70">(optional)</span></label>
          <textarea id="notes" name="notes" className={`${inputCls} h-28`} placeholder="Tell us where the gap is, or what your clients keep asking about."></textarea>
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full bg-deepGreen text-white px-8 py-4 rounded-full font-medium text-ui hover:bg-carbon transition-colors duration-300 shadow-subtle hover:shadow-elegant disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending...' : 'Join the Network'}
        </button>

        {status === 'error' && (
          <p className="text-sm text-terracotta text-center">Something went wrong. Please try again, or email nic@yourhq.co.nz.</p>
        )}
      </form>
    </div>
  );
}
