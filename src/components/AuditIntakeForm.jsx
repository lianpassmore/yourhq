import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { notifyNtfy } from '../lib/notify';

// Shared, single-source-of-truth audit intake form.
// Used by both /audit-intake and /next-steps-web-audit (skipped version).
// Columns map 1:1 to the audit_intake Supabase table.
// Keep in sync with supabase/migrations/20260530000000_audit_intake.sql

const INPUT =
  'w-full border border-carbon/15 rounded-xl p-3.5 bg-surface text-carbon text-ui placeholder:text-softGrey/60 focus:outline-none focus:border-signal transition-colors';
const TEXTAREA = INPUT + ' resize-none min-h-[120px]';
const LABEL = 'block font-sans font-semibold text-ui text-carbon mb-2';
const HELPER = 'font-sans text-ui text-softGrey mt-2';
const REQ = '<span class="text-terracotta font-normal">required</span>';

// Field definitions per step. `name` matches the Supabase column.
const STEPS = [
  {
    title: 'Your Business',
    fields: [
      {
        name: 'website_url',
        label: 'Your website URL',
        type: 'url',
        required: true,
        placeholder: 'https://yourbusiness.co.nz',
        helper: 'This is the main thing I need to get started. I will find everything else from here.',
      },
      {
        name: 'primary_goal',
        label: 'What is the main thing you want your website to do right now?',
        type: 'textarea',
        required: true,
        placeholder: 'Be specific. Not just "get more clients" but who, doing what, from where.',
        helper: 'This is the most important question on the form. The more specific your answer, the sharper your audit will be.',
      },
      {
        name: 'ideal_client',
        label: 'Who is your ideal client?',
        type: 'textarea',
        required: true,
        placeholder: 'Describe your best ever customer. Who are they, what do they do, what made them a dream to work with?',
      },
    ],
  },
  {
    title: 'Your Website',
    fields: [
      {
        name: 'wants_more_of',
        label: 'What work do you want more of that you are not currently getting enough of?',
        type: 'textarea',
        required: true,
        placeholder: 'A specific type of client, a particular service, a certain location or industry.',
      },
      {
        name: 'wants_to_move_away',
        label: 'What do you want to move away from?',
        type: 'textarea',
        required: false,
        placeholder: 'Work you are done taking on, clients that are not the right fit, anything you are trying to phase out.',
        helper: 'Skip this if it does not apply.',
      },
      {
        name: 'big_objection',
        label: 'What is the number one reason people do not buy from you or do not follow through after making contact?',
        type: 'textarea',
        required: true,
        placeholder: 'Be honest. Price, trust, confusion about what you offer, something else entirely?',
        helper: 'This one is gold. Your answer goes directly into your homepage copy as a built-in rebuttal.',
      },
    ],
  },
  {
    title: 'Your Voice',
    fields: [
      {
        name: 'likes_about_site',
        label: 'What do you like about your current site? Anything you want to keep?',
        type: 'textarea',
        required: false,
        placeholder: 'Design, specific copy, a section that works well, a photo you love. Anything at all.',
        helper: 'Nothing? That is fine too.',
      },
      {
        name: 'desired_feeling',
        label: 'How do you want people to feel when they land on your site?',
        type: 'textarea',
        required: true,
        placeholder: 'Not what you want them to do. How you want them to feel. Reassured, impressed, like they have found their person, something else?',
      },
      {
        name: 'tone_exclusions',
        label: 'Any words, phrases, or tones you absolutely do not want on your site?',
        type: 'textarea',
        required: false,
        placeholder: "Industry jargon you hate, a competitor's style you want nothing to do with, anything that makes you cringe.",
        helper: 'Optional but useful. Skip if nothing comes to mind.',
      },
    ],
  },
];

// Contact fields live at the foot of Step 3.
const CONTACT_FIELDS = [
  { name: 'name', label: 'Your name', type: 'text', required: true, placeholder: 'Jane Smith' },
  {
    name: 'email',
    label: 'Your email address',
    type: 'email',
    required: true,
    placeholder: 'jane@yourbusiness.co.nz',
    helper: 'This is where your audit document will be sent.',
  },
  { name: 'business_name', label: 'Your business or brand name', type: 'text', required: true, placeholder: 'Smith Consulting' },
];

const ALL_FIELDS = [...STEPS.flatMap((s) => s.fields), ...CONTACT_FIELDS];

const EMPTY = Object.fromEntries(ALL_FIELDS.map((f) => [f.name, '']));

function Field({ field, value, onChange, error }) {
  const id = `audit-${field.name}`;
  return (
    <div>
      <label className={LABEL} htmlFor={id}>
        <span dangerouslySetInnerHTML={{ __html: field.label + (field.required ? ' ' + REQ : '') }} />
      </label>
      {field.type === 'textarea' ? (
        <textarea
          id={id}
          name={field.name}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          className={TEXTAREA + (error ? ' border-terracotta' : '')}
        />
      ) : (
        <input
          id={id}
          type={field.type}
          name={field.name}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          className={INPUT + (error ? ' border-terracotta' : '')}
        />
      )}
      {field.helper && <p className={HELPER}>{field.helper}</p>}
      {error && <p className="font-sans text-ui text-terracotta mt-2">This one is needed before we move on.</p>}
    </div>
  );
}

export default function AuditIntakeForm() {
  const [step, setStep] = useState(0); // 0,1,2
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | error
  const [hp, setHp] = useState(''); // honeypot

  const isLast = step === STEPS.length - 1;

  function update(name, value) {
    setData((d) => ({ ...d, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: false }));
  }

  // Which fields must be filled to leave the current step.
  function requiredForStep(i) {
    const fields = [...STEPS[i].fields];
    if (i === STEPS.length - 1) fields.push(...CONTACT_FIELDS);
    return fields.filter((f) => f.required);
  }

  function validateStep(i) {
    const missing = {};
    for (const f of requiredForStep(i)) {
      if (!data[f.name] || !data[f.name].trim()) missing[f.name] = true;
    }
    setErrors(missing);
    return Object.keys(missing).length === 0;
  }

  function next() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (hp) return; // bot
    if (!validateStep(step)) return;

    setStatus('sending');

    const row = {};
    for (const f of ALL_FIELDS) {
      const v = (data[f.name] || '').trim();
      row[f.name] = v || null;
    }
    row.status = 'received';

    const { error } = await supabase.from('audit_intake').insert(row);

    if (error) {
      console.error('Supabase error:', error);
      setStatus('error');
      return;
    }

    // Notify Lian (fire-and-forget).
    notifyNtfy(
      `${row.business_name || 'Someone'} just submitted their audit questions. Website: ${row.website_url || 'n/a'}`,
      'New Audit Intake',
      'yourhq-web-audit-questions',
    );

    // Send the confirmation email + mark any matching audit_payment as submitted.
    // Handled server-side (Resend secret) so this is best-effort and non-blocking.
    try {
      await supabase.functions.invoke('send-audit-confirmation', {
        body: { email: row.email, name: row.name },
      });
    } catch (err) {
      console.error('Confirmation email invoke failed (non-blocking):', err);
    }

    window.location.href = '/next-steps-web-audit?status=complete';
  }

  const stepDef = STEPS[step];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 md:p-12 shadow-elegant border border-carbon/5">
      {/* Honeypot */}
      <p className="hidden" aria-hidden="true">
        <label>
          Leave this blank:
          <input tabIndex="-1" autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
        </label>
      </p>

      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-badge text-softGrey">Step {step + 1} of {STEPS.length}</p>
          <p className="font-mono text-badge text-terracotta">{stepDef.title}</p>
        </div>
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={
                'h-1.5 flex-1 rounded-full transition-colors duration-300 ' +
                (i < step ? 'bg-carbon' : i === step ? 'bg-terracotta' : 'bg-carbon/15')
              }
            />
          ))}
        </div>
      </div>

      {/* Current step fields */}
      <div className="space-y-8">
        {stepDef.fields.map((f) => (
          <Field key={f.name} field={f} value={data[f.name]} onChange={update} error={errors[f.name]} />
        ))}

        {isLast && (
          <div className="border-t border-carbon/10 pt-8 space-y-8">
            <p className="font-mono text-badge text-deepGreen">Where To Send It</p>
            {CONTACT_FIELDS.map((f) => (
              <Field key={f.name} field={f} value={data[f.name]} onChange={update} error={errors[f.name]} />
            ))}
          </div>
        )}
      </div>

      {status === 'error' && (
        <p className="font-sans text-ui text-terracotta mt-6">
          Something went wrong sending that through. Please try again, or email your answers to lian@yourhq.co.nz.
        </p>
      )}

      {/* Controls */}
      <div className="mt-10 flex items-center justify-between gap-4">
        {step > 0 ? (
          <button
            type="button"
            onClick={back}
            className="font-mono text-badge text-softGrey border-b border-carbon/20 pb-1 hover:text-carbon hover:border-carbon transition-colors"
          >
            &larr; Back
          </button>
        ) : (
          <span />
        )}

        {isLast ? (
          <button
            type="submit"
            disabled={status === 'sending'}
            className="bg-signal text-white rounded-full px-8 py-3.5 text-ui font-medium hover:bg-carbon hover:shadow-float transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none"
          >
            {status === 'sending' ? 'Sending…' : 'Send My Answers Through'}
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="bg-signal text-white rounded-full px-10 py-3.5 text-ui font-medium hover:bg-carbon hover:shadow-float transition-all duration-300"
          >
            Next
          </button>
        )}
      </div>
    </form>
  );
}
