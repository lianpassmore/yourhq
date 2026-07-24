import { supabase } from './supabase';

export function notifyNtfy(message, title = 'New Form Submission', topic = 'yourhq-form') {
  fetch(`https://ntfy.sh/${topic}`, {
    method: 'POST',
    body: message,
    headers: { Title: title, Priority: 'high', Tags: 'bell' },
  }).catch(() => {});
}

// Emails Lian a summary of a form submission via the notify-owner edge
// function (Resend server-side). Fire-and-forget: never blocks or breaks
// the submission if the email fails.
//
// fields: array of { label, value } shown as a tidy table in the email.
// replyTo: the submitter's email, so Lian can reply straight from the alert.
export function notifyOwner({ subject, intro = '', fields = [], replyTo = null, source = null }) {
  return supabase.functions
    .invoke('notify-owner', {
      body: { subject, intro, fields, replyTo, source },
    })
    .catch((err) => {
      console.error('notifyOwner failed (non-blocking):', err);
    });
}
