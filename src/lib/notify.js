export function notifyNtfy(message, title = 'New Form Submission') {
  fetch('https://ntfy.sh/yourhq-form', {
    method: 'POST',
    body: message,
    headers: { Title: title, Priority: 'high', Tags: 'bell' },
  }).catch(() => {});
}
