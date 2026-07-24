// Lightweight, invisible bot protection for the public forms.
// Two layers, no third-party service, no friction for real people:
//   1. Honeypots  — hidden bait fields a human never sees. Any value = bot.
//   2. Time-trap  — a genuine human takes more than a couple of seconds to
//                   fill a form. Near-instant submits are automated.
//
// Usage in a form component:
//   const startedAt = useRef(Date.now());              // when the form mounted
//   ...render the hidden honeypot fields (see HONEYPOT_NAMES)...
//   if (looksLikeBot(startedAt.current, [hp1, hp2])) { fakeSuccess(); return; }

export const MIN_FILL_MS = 2500;

// Field names used for the hidden bait inputs. `bot-field` is the existing
// convention across the site; `address` is extra bait (spam bots love it).
export const HONEYPOT_NAMES = ['bot-field', 'address'];

// Inline style that hides an element from humans (off-screen, not display:none,
// so more naive bots still "see" and fill it) while keeping it out of the tab
// order and the accessibility tree.
export const HONEYPOT_STYLE = {
  position: 'absolute',
  left: '-9999px',
  top: 'auto',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
};

// Returns true when a submission looks automated.
// startedAt: ms timestamp captured when the form first rendered.
// honeypots: array of the current values of the hidden bait fields.
export function looksLikeBot(startedAt, honeypots = []) {
  if (honeypots.some((v) => v && String(v).trim() !== '')) return true;
  if (startedAt && Date.now() - startedAt < MIN_FILL_MS) return true;
  return false;
}
