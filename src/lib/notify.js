export function notifyNtfy(message, title = 'New Form Submission', topic = 'yourhq-form') {
  fetch(`https://ntfy.sh/${topic}`, {
    method: 'POST',
    body: message,
    headers: { Title: title, Priority: 'high', Tags: 'bell' },
  }).catch(() => {});
}
