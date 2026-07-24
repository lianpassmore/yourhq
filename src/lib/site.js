// Sitewide constants. One place to change the booking link and contact details.
// BOOKING_URL is where every "Book a chat" CTA points — now an on-site page that
// embeds the scheduler inline (see src/pages/book.astro), instead of sending people to Google.
export const BOOKING_URL = '/book';
// The raw Google Calendar appointment scheduler, embedded inline on /book.
export const BOOKING_EMBED_URL = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ3eAR8aL11MuP2UrcEWYTnG5MxyOY7x6GJk8HyzJuP-JPjXTVgabPozYoSDYNYPmZjCjVrh9FbC?gv=true';
export const PHONE = '027 566 8803';
export const PHONE_HREF = 'sms:0275668803';
// International format, for schema.org / structured data. Keep in sync with PHONE.
export const PHONE_INTL = '+64-27-566-8803';
export const EMAIL = 'lian@yourhq.co.nz';
