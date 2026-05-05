import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';

const BUILD_STAGES = [
  { value: 'paid',                label: 'Paid' },
  { value: 'discovery_sent',      label: 'Discovery sent' },
  { value: 'discovery_received',  label: 'Discovery received' },
  { value: 'design',              label: 'Design' },
  { value: 'build',               label: 'Build' },
  { value: 'review',              label: 'Client review' },
  { value: 'live',                label: 'Live' },
  { value: 'maintenance',         label: 'Maintenance' },
  { value: 'paused',              label: 'Paused' },
];

const stageLabel = (v) => BUILD_STAGES.find((s) => s.value === v)?.label || v;

const formatMoney = (cents, currency) => {
  if (cents == null) return '—';
  const code = (currency || 'nzd').toUpperCase();
  return `${code} $${(cents / 100).toFixed(2)}`;
};

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString('en-NZ', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

// ─────────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────────
function LoginForm({ onSignedIn }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else onSignedIn();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white border border-carbon/10 shadow-elegant p-8"
      >
        <h1 className="font-display text-3xl text-carbon mb-2">Admin</h1>
        <p className="text-softGrey text-ui mb-6">Sign in to your YourHQ dashboard.</p>

        <label className="block text-ui font-medium text-carbon mb-1">Email</label>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-carbon/20 px-3 py-2 mb-4 focus:outline-none focus:border-carbon"
        />

        <label className="block text-ui font-medium text-carbon mb-1">Password</label>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-carbon/20 px-3 py-2 mb-6 focus:outline-none focus:border-carbon"
        />

        {error && <p className="text-terracotta text-ui mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-carbon text-white py-3 font-medium uppercase tracking-widest text-ui hover:bg-deepGreen transition-colors disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Customer list
// ─────────────────────────────────────────────────────────────────
function CustomerList({ customers, onSelect, onSignOut, onAdd }) {
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.name, c.email, c.plan, c.build_stage]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q)),
    );
  }, [customers, query]);

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-carbon/10 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-carbon">Customers</h1>
            <p className="text-softGrey text-ui">{customers.length} total</p>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setAdding(true)}
              className="bg-carbon text-white px-4 py-2 text-ui uppercase tracking-widest hover:bg-deepGreen transition-colors"
            >
              + Add customer
            </button>
            <button
              onClick={onSignOut}
              className="text-ui uppercase tracking-widest text-softGrey hover:text-carbon"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        <input
          type="search"
          placeholder="Search name, email, plan, stage…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md border border-carbon/20 px-3 py-2 mb-6 bg-white focus:outline-none focus:border-carbon"
        />

        {adding && (
          <AddCustomerModal
            onClose={() => setAdding(false)}
            onAdded={(c) => { setAdding(false); onAdd(c); }}
          />
        )}

        <div className="bg-white border border-carbon/10 shadow-subtle overflow-x-auto">
          <table className="w-full text-ui">
            <thead className="bg-bone text-carbon uppercase tracking-wider text-xs">
              <tr>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Source</th>
                <th className="text-left px-4 py-3">Stage</th>
                <th className="text-left px-4 py-3">Target</th>
                <th className="text-left px-4 py-3">Waiting on</th>
                <th className="text-left px-4 py-3">Added</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-softGrey">
                    No customers yet.
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelect(c)}
                  className="border-t border-carbon/10 hover:bg-bone/40 cursor-pointer align-top"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-carbon">{c.business || c.name || '—'}</div>
                    <div className="text-softGrey">
                      {c.business && c.name ? `${c.name} · ` : ''}{c.email || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3"><SourceBadge customer={c} /></td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-carbon text-white px-2 py-1 text-xs uppercase tracking-wider">
                      {stageLabel(c.build_stage)}
                    </span>
                  </td>
                  <td className="px-4 py-3"><TargetCell date={c.target_launch_date} /></td>
                  <td className="px-4 py-3 text-carbon text-sm max-w-xs truncate" title={c.waiting_on}>
                    {c.waiting_on || <span className="text-softGrey">—</span>}
                  </td>
                  <td className="px-4 py-3 text-softGrey">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Customer detail
// ─────────────────────────────────────────────────────────────────
const DISCOVERY_GROUPS = [
  {
    title: 'Welcome & basics',
    fields: [
      ['Tier', 'tier'],
      ['Name', 'name'],
      ['Business', 'business'],
      ['How they heard about YourHQ', 'how_heard_about_yourhq'],
      ['Email', 'email'],
      ['Phone', 'phone'],
      ['Email for enquiries', 'email_for_enquiries'],
      ['Location', 'location'],
      ['Service areas', 'service_areas'],
      ['Customer or mobile service', 'customer_or_mobile_service'],
      ['Hours', 'hours'],
      ['Preferred domain', 'preferred_domain'],
      ['Existing website', 'existing_website_url'],
      ['Social profiles', 'social_profiles'],
      ['Logo status', 'logo_status'],
      ['Photos available', 'photos_available'],
    ],
  },
  {
    title: 'The business',
    fields: [
      ['What you do', 'what_you_do'],
      ['Main services or products', 'main_services_or_products'],
      ['Known for', 'known_for'],
      ['Qualifications', 'qualifications'],
      ['Ideal customer', 'ideal_customer'],
      ['Not for', 'not_for'],
      ['Point of difference', 'point_of_difference'],
      ['What you care about', 'what_you_care_about'],
      ['Years in business', 'years_in_business'],
      ['Why you do this work', 'why_you_do_this_work'],
    ],
  },
  {
    title: 'Story',
    fields: [
      ['Origin story', 'origin_story'],
      ['Why went out on own', 'why_went_out_on_own'],
      ['Defining moment or person', 'defining_moment_or_person'],
      ['Love about work', 'love_about_work'],
      ['How clients should feel', 'how_clients_should_feel'],
      ['Deeper purpose', 'deeper_purpose'],
      ['Unexpected thing', 'unexpected_thing'],
    ],
  },
  {
    title: 'Brand & voice',
    fields: [
      ['Brand guidelines', 'brand_guidelines'],
      ['Brand as physical space', 'brand_as_physical_space'],
      ['Three vibe words', 'three_vibe_words'],
      ['Brands admired', 'brands_admired'],
      ['What visitors should feel', 'what_visitors_should_feel'],
      ['Tone of voice', 'tone_of_voice'],
      ['Brand personality', 'brand_personality'],
      ['Brand colours', 'brand_colours'],
      ['Colours to avoid', 'colours_to_avoid'],
    ],
  },
  {
    title: 'Online presence & content',
    fields: [
      ['Most used platform', 'most_used_platform'],
      ['Media and press', 'media_and_press'],
      ['Content style', 'content_style'],
      ['Content autopilot interest', 'content_autopilot_interest'],
      ['Online presence — move away from', 'online_presence_move_away_from'],
    ],
  },
  {
    title: 'What the site needs to do',
    fields: [
      ['Main call to action', 'main_call_to_action'],
      ['Top customer questions', 'top_customer_questions'],
      ['Email capture interest', 'email_capture_interest'],
      ['Email marketing platform', 'email_marketing_platform'],
      ['Lead magnet idea', 'lead_magnet_idea'],
      ['Pricing approach', 'pricing_approach'],
    ],
  },
  {
    title: 'Integrations',
    fields: [
      ['Bookings system', 'bookings_system'],
      ['Deposits or upfront', 'deposits_or_upfront'],
      ['Stripe payments interest', 'stripe_payments_interest'],
      ['Digital products', 'digital_products'],
      ['Course or program', 'course_or_program'],
      ['Face of business or brand', 'face_of_business_or_brand'],
      ['Speaking and workshops', 'speaking_and_workshops'],
      ['Signature media', 'signature_media'],
      ['Audience routing', 'audience_routing'],
    ],
  },
  {
    title: 'Testimonials & social proof',
    fields: [
      ['Best client compliment', 'best_client_compliment'],
      ['Testimonials', 'testimonials'],
      ['Proud results', 'proud_results'],
      ['Logos and associations', 'logos_and_associations'],
    ],
  },
  {
    title: 'Wrap up',
    fields: [
      ['Other site wishes', 'other_site_wishes'],
      ["What didn't work before", 'what_didnt_work_before'],
      ['Upcoming changes', 'upcoming_changes'],
      ['Scope preference', 'scope_preference'],
    ],
  },
];

function CustomerDetail({ customer, onBack, onUpdate, onDelete }) {
  const [discovery, setDiscovery] = useState(null);
  const [discoveryLoading, setDiscoveryLoading] = useState(true);

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);

  const [stage, setStage] = useState(customer.build_stage);
  const [business,    setBusiness]    = useState(customer.business || '');
  const [driveUrl,    setDriveUrl]    = useState(customer.google_drive_url || '');
  const [targetDate,  setTargetDate]  = useState(customer.target_launch_date || '');
  const [outstanding, setOutstanding] = useState(customer.outstanding || '');
  const [waitingOn,   setWaitingOn]   = useState(customer.waiting_on  || '');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const dirty =
    stage       !== customer.build_stage ||
    business    !== (customer.business         || '') ||
    driveUrl    !== (customer.google_drive_url || '') ||
    targetDate  !== (customer.target_launch_date || '') ||
    outstanding !== (customer.outstanding || '') ||
    waitingOn   !== (customer.waiting_on  || '');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDiscoveryLoading(true);
      if (!customer.email) {
        setDiscovery(null);
        setDiscoveryLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('discovery_submissions')
        .select('*')
        .ilike('email', customer.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (error) console.error(error);
      setDiscovery(data || null);
      setDiscoveryLoading(false);
    })();
    return () => { cancelled = true; };
  }, [customer.email]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setNotesLoading(true);
      const { data, error } = await supabase
        .from('customer_notes')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) console.error(error);
      setNotes(data || []);
      setNotesLoading(false);
    })();
    return () => { cancelled = true; };
  }, [customer.id]);

  const addNote = async (body) => {
    const { data, error } = await supabase
      .from('customer_notes')
      .insert({ customer_id: customer.id, body })
      .select()
      .single();
    if (error) { alert('Add note failed: ' + error.message); return null; }
    setNotes((ns) => [data, ...ns]);
    return data;
  };

  const deleteNote = async (id) => {
    const { error } = await supabase.from('customer_notes').delete().eq('id', id);
    if (error) { alert('Delete failed: ' + error.message); return; }
    setNotes((ns) => ns.filter((n) => n.id !== id));
  };

  const save = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from('customers')
      .update({
        build_stage:        stage,
        business:           business    || null,
        google_drive_url:   driveUrl    || null,
        target_launch_date: targetDate  || null,
        outstanding,
        waiting_on:         waitingOn,
      })
      .eq('id', customer.id)
      .select()
      .single();
    setSaving(false);
    if (error) {
      alert('Save failed: ' + error.message);
      return;
    }
    setSavedAt(new Date());
    onUpdate(data);
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-carbon/10 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="text-ui uppercase tracking-widest text-softGrey hover:text-carbon"
          >
            ← Back
          </button>
          <div className="flex-1 text-center">
            <h1 className="font-display text-2xl text-carbon">
              {customer.business || customer.name || customer.email || 'Customer'}
            </h1>
            <p className="text-softGrey text-ui flex items-center justify-center gap-2 flex-wrap">
              {customer.business && customer.name && <span>{customer.name} ·</span>}
              <span>{customer.email}</span>
              <SourceBadge customer={customer} />
            </p>
          </div>
          <div className="text-right flex items-center gap-4">
            <CopyAllButton customer={customer} discovery={discovery} notes={notes} />
            {customer.source !== 'stripe' && (
              <button
                onClick={async () => {
                  if (!confirm(`Delete ${customer.name || customer.email}? This can't be undone.`)) return;
                  const { error } = await supabase.from('customers').delete().eq('id', customer.id);
                  if (error) { alert('Delete failed: ' + error.message); return; }
                  onDelete(customer.id);
                }}
                className="text-ui uppercase tracking-widest text-softGrey hover:text-terracotta"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: tracking column */}
        <section className="lg:col-span-1 space-y-6">

          <div className="bg-white border border-carbon/10 shadow-subtle p-6">
            <h2 className="font-display text-xl text-carbon mb-4">Tracking</h2>

            <label className="block text-ui font-medium text-carbon mb-1">Business name</label>
            <input
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder="e.g. Whangārei Plumbing Ltd"
              className="w-full border border-carbon/20 px-3 py-2 mb-4 bg-white"
            />

            <label className="block text-ui font-medium text-carbon mb-1">Google Drive folder</label>
            <input
              type="url"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/…"
              className="w-full border border-carbon/20 px-3 py-2 mb-2 bg-white font-mono text-xs"
            />
            {customer.google_drive_url && (
              <a
                href={customer.google_drive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-ui text-signal hover:underline mb-4"
              >
                Open in Drive ↗
              </a>
            )}

            <label className="block text-ui font-medium text-carbon mb-1 mt-2">Target launch date</label>
            <input
              type="date"
              value={targetDate || ''}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full border border-carbon/20 px-3 py-2 mb-1 bg-white"
            />
            <TargetDateHint date={targetDate} />

            <label className="block text-ui font-medium text-carbon mb-1 mt-4">Waiting on client</label>
            <textarea
              value={waitingOn}
              onChange={(e) => setWaitingOn(e.target.value)}
              rows={3}
              placeholder="What you need from them next…"
              className="w-full border border-carbon/20 px-3 py-2 mb-4 bg-white text-sm leading-6"
            />

            <label className="block text-ui font-medium text-carbon mb-1">Outstanding (my side)</label>
            <textarea
              value={outstanding}
              onChange={(e) => setOutstanding(e.target.value)}
              rows={3}
              placeholder="What's left for me to do…"
              className="w-full border border-carbon/20 px-3 py-2 bg-white text-sm leading-6"
            />
          </div>

          <div className="bg-white border border-carbon/10 shadow-subtle p-6">
            <h2 className="font-display text-xl text-carbon mb-4">Build progress</h2>

            <label className="block text-ui font-medium text-carbon mb-1">Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full border border-carbon/20 px-3 py-2 mb-4 bg-white"
            >
              {BUILD_STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <div className="flex items-center justify-between">
              <span className="text-ui text-softGrey">
                {savedAt
                  ? `Saved at ${savedAt.toLocaleTimeString('en-NZ')}`
                  : dirty
                    ? 'Unsaved changes'
                    : 'Up to date'}
              </span>
              <button
                onClick={save}
                disabled={!dirty || saving}
                className="bg-carbon text-white px-4 py-2 text-ui uppercase tracking-widest hover:bg-deepGreen transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          <NotesJournal
            notes={notes}
            loading={notesLoading}
            onAdd={addNote}
            onDelete={deleteNote}
          />

          <div className="bg-white border border-carbon/10 shadow-subtle p-6">
            <h2 className="font-display text-xl text-carbon mb-4">Payment</h2>
            <Field label="Plan"           value={customer.plan} />
            <Field label="Amount"         value={formatMoney(customer.amount_total, customer.currency)} />
            <Field label="Status"         value={customer.payment_status} />
            <Field label="Phone"          value={customer.phone} />
            <Field label="Stripe session" value={customer.stripe_session_id} mono />
            <Field label="Created"        value={formatDate(customer.created_at)} />
            <Field label="Updated"        value={formatDate(customer.updated_at)} />
          </div>
        </section>

        {/* RIGHT: discovery column */}
        <section className="lg:col-span-2 bg-white border border-carbon/10 shadow-subtle p-6">
          <h2 className="font-display text-xl text-carbon mb-4">Discovery interview</h2>

          {discoveryLoading && <p className="text-softGrey">Loading…</p>}

          {!discoveryLoading && !discovery && (
            <p className="text-softGrey">
              No discovery submission found for <span className="font-mono">{customer.email || '(no email)'}</span>.
            </p>
          )}

          {discovery && (
            <div className="space-y-8">
              <p className="text-ui text-softGrey">
                Submitted {formatDate(discovery.created_at)}
              </p>
              {DISCOVERY_GROUPS.map((g) => {
                const populated = g.fields.filter(([, key]) => discovery[key]);
                if (populated.length === 0) return null;
                return (
                  <div key={g.title}>
                    <h3 className="font-display text-lg text-carbon border-b border-carbon/10 pb-2 mb-3">
                      {g.title}
                    </h3>
                    <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
                      {populated.map(([label, key]) => (
                        <div key={key} className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-6">
                          <dt className="text-ui text-softGrey md:col-span-1">{label}</dt>
                          <dd className="text-ui text-carbon md:col-span-2 whitespace-pre-wrap">
                            {discovery[key]}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })}

              <BlankDiscoveryQuestions discovery={discovery} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function NotesJournal({ notes, loading, onAdd, onDelete }) {
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);
  const [collapsed, setCollapsed] = useState({}); // { dateKey: true/false }

  const submit = async () => {
    const body = draft.trim();
    if (!body) return;
    setAdding(true);
    const result = await onAdd(body);
    setAdding(false);
    if (result) setDraft('');
  };

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  const formatTimeOnly = (iso) =>
    new Date(iso).toLocaleTimeString('en-NZ', { hour: 'numeric', minute: '2-digit' });

  const dateKey = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Group notes by date, preserving newest-first order
  const groups = [];
  const seen = new Map();
  notes.forEach((n) => {
    const key = dateKey(n.created_at);
    if (!seen.has(key)) {
      const group = { key, notes: [] };
      seen.set(key, group);
      groups.push(group);
    }
    seen.get(key).notes.push(n);
  });

  const toggle = (key) => setCollapsed((c) => ({ ...c, [key]: !c[key] }));
  const collapseAll = () => {
    const next = {};
    groups.forEach((g) => { next[g.key] = true; });
    setCollapsed(next);
  };
  const expandAll = () => setCollapsed({});

  const allCollapsed = groups.length > 0 && groups.every((g) => collapsed[g.key]);

  return (
    <div className="bg-white border border-carbon/10 shadow-subtle p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl text-carbon">Notes</h2>
        {groups.length > 1 && (
          <button
            onClick={allCollapsed ? expandAll : collapseAll}
            className="text-ui uppercase tracking-widest text-softGrey hover:text-carbon"
          >
            {allCollapsed ? 'Expand all' : 'Collapse all'}
          </button>
        )}
      </div>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        rows={4}
        placeholder="Add a note… (⌘/Ctrl + Enter to save)"
        className="w-full border border-carbon/20 px-3 py-2 bg-white font-mono text-sm leading-6"
      />
      <div className="flex justify-end mt-2 mb-6">
        <button
          onClick={submit}
          disabled={adding || !draft.trim()}
          className="bg-carbon text-white px-4 py-2 text-ui uppercase tracking-widest hover:bg-deepGreen transition-colors disabled:opacity-60"
        >
          {adding ? 'Saving…' : 'Add note'}
        </button>
      </div>

      {loading && <p className="text-ui text-softGrey">Loading notes…</p>}

      {!loading && notes.length === 0 && (
        <p className="text-ui text-softGrey">No notes yet. Anything you save here is timestamped and locked in.</p>
      )}

      {!loading && groups.map((g) => {
        const isCollapsed = !!collapsed[g.key];
        return (
          <div key={g.key} className="mb-5 last:mb-0">
            <button
              onClick={() => toggle(g.key)}
              className="w-full flex items-center justify-between gap-3 py-2 border-b border-carbon/15 hover:text-terracotta transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="text-softGrey w-3 inline-block">{isCollapsed ? '▸' : '▾'}</span>
                <span className="font-mono text-xs uppercase tracking-widest text-carbon">{g.key}</span>
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-softGrey">
                {g.notes.length} {g.notes.length === 1 ? 'note' : 'notes'}
              </span>
            </button>

            {!isCollapsed && (
              <ol className="space-y-4 mt-3">
                {g.notes.map((n) => (
                  <li key={n.id} className="border-l-2 border-carbon/15 pl-4">
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <span className="font-mono text-xs uppercase tracking-widest text-softGrey">
                        {formatTimeOnly(n.created_at)}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm('Delete this note? This can\'t be undone.')) onDelete(n.id);
                        }}
                        className="text-xs text-softGrey hover:text-terracotta"
                        aria-label="Delete note"
                        title="Delete note"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-ui text-carbon whitespace-pre-wrap">{n.body}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BlankDiscoveryQuestions({ discovery }) {
  const [open, setOpen] = useState(false);

  const blanksByGroup = DISCOVERY_GROUPS
    .map((g) => ({
      title: g.title,
      blanks: g.fields.filter(([, key]) => !discovery[key]),
    }))
    .filter((g) => g.blanks.length > 0);

  const total = blanksByGroup.reduce((sum, g) => sum + g.blanks.length, 0);
  if (total === 0) {
    return (
      <div className="border-t border-carbon/10 pt-6 mt-6">
        <p className="text-ui text-softGrey">Every question was answered. Nice.</p>
      </div>
    );
  }

  return (
    <div className="border-t border-carbon/10 pt-6 mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="font-display text-lg text-carbon hover:text-terracotta transition-colors flex items-center gap-2"
      >
        <span>{open ? '▾' : '▸'}</span>
        <span>{total} unanswered question{total === 1 ? '' : 's'}</span>
        <span className="text-ui text-softGrey font-sans">— possible follow-ups</span>
      </button>

      {open && (
        <div className="mt-4 space-y-5">
          {blanksByGroup.map((g) => (
            <div key={g.title}>
              <h4 className="font-mono text-xs uppercase tracking-widest text-softGrey mb-2">
                {g.title}
              </h4>
              <ul className="space-y-1">
                {g.blanks.map(([label, key]) => (
                  <li key={key} className="text-ui text-carbon flex items-start gap-2">
                    <span className="text-softGrey">·</span>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CopyAllButton({ customer, discovery, notes = [] }) {
  const [copied, setCopied] = useState(false);

  const buildDump = () => {
    const lines = [];
    const heading = customer.business || customer.name || customer.email || 'Customer';
    lines.push(`# ${heading}`);
    if (customer.name && customer.business) lines.push(`Contact: ${customer.name}`);
    lines.push('');

    lines.push('## Customer');
    const c = [
      ['Email',          customer.email],
      ['Phone',          customer.phone],
      ['Source',         customer.source],
      ['Stage',          stageLabel(customer.build_stage)],
      ['Plan',           customer.plan],
      ['Amount',         formatMoney(customer.amount_total, customer.currency)],
      ['Payment status', customer.payment_status],
      ['Drive',          customer.google_drive_url],
      ['Target launch',  customer.target_launch_date],
      ['Created',        formatDate(customer.created_at)],
      ['Updated',        formatDate(customer.updated_at)],
    ];
    c.forEach(([k, v]) => { if (v) lines.push(`- **${k}:** ${v}`); });
    lines.push('');

    if (customer.waiting_on) {
      lines.push('## Waiting on client');
      lines.push(customer.waiting_on);
      lines.push('');
    }
    if (customer.outstanding) {
      lines.push('## Outstanding (my side)');
      lines.push(customer.outstanding);
      lines.push('');
    }
    if (notes.length > 0) {
      lines.push('## Notes');
      // Oldest first, so the journal reads chronologically
      [...notes].reverse().forEach((n) => {
        lines.push(`**${formatDate(n.created_at)}**`);
        lines.push(n.body);
        lines.push('');
      });
    }

    if (discovery) {
      lines.push('## Discovery interview');
      lines.push(`*Submitted ${formatDate(discovery.created_at)}*`);
      lines.push('');
      DISCOVERY_GROUPS.forEach((g) => {
        const populated = g.fields.filter(([, key]) => discovery[key]);
        if (populated.length === 0) return;
        lines.push(`### ${g.title}`);
        populated.forEach(([label, key]) => {
          lines.push(`**${label}**`);
          lines.push(discovery[key]);
          lines.push('');
        });
      });
    }

    return lines.join('\n').trim() + '\n';
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildDump());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      alert('Copy failed: ' + err.message);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-ui uppercase tracking-widest text-softGrey hover:text-carbon"
      title="Copy customer info + discovery answers to clipboard"
    >
      {copied ? '✓ Copied' : 'Copy all'}
    </button>
  );
}

function TargetCell({ date }) {
  if (!date) return <span className="text-softGrey">—</span>;
  const target = new Date(date + 'T00:00:00');
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((target - today) / 86400000);
  const formatted = target.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' });
  let cls;
  if (days < 0)        cls = 'text-terracotta font-medium';
  else if (days <= 7)  cls = 'text-deepGreen';
  else                 cls = 'text-carbon';
  return (
    <div>
      <div className={`text-ui ${cls}`}>{formatted}</div>
      <div className="text-xs text-softGrey">
        {days < 0 ? `${-days}d overdue` : days === 0 ? 'today' : `in ${days}d`}
      </div>
    </div>
  );
}

function TargetDateHint({ date }) {
  if (!date) return null;
  const target = new Date(date + 'T00:00:00');
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((target - today) / 86400000);
  let label, color;
  if (days < 0)        { label = `${-days} day${-days === 1 ? '' : 's'} overdue`;  color = 'text-terracotta'; }
  else if (days === 0) { label = 'Due today';                                       color = 'text-terracotta'; }
  else if (days <= 7)  { label = `In ${days} day${days === 1 ? '' : 's'}`;          color = 'text-deepGreen'; }
  else                 { label = `In ${days} days`;                                 color = 'text-softGrey'; }
  return <p className={`text-ui ${color} mb-2`}>{label}</p>;
}

function Field({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4 border-b border-carbon/5 py-2 last:border-b-0">
      <span className="text-ui text-softGrey">{label}</span>
      <span className={`text-ui text-carbon text-right ${mono ? 'font-mono text-xs break-all' : ''}`}>
        {value || '—'}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [authState, setAuthState] = useState('loading'); // loading | out | in
  const [customers, setCustomers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthState(data.session ? 'in' : 'out');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(session ? 'in' : 'out');
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authState !== 'in') return;
    (async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) setLoadError(error.message);
      else setCustomers(data || []);
    })();
  }, [authState]);

  const selected = customers.find((c) => c.id === selectedId) || null;

  const handleUpdate = (updated) => {
    setCustomers((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleAdd = (created) => {
    setCustomers((cs) => [created, ...cs]);
    setSelectedId(created.id);
  };

  const handleDelete = (id) => {
    setCustomers((cs) => cs.filter((c) => c.id !== id));
    setSelectedId(null);
  };

  if (authState === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-surface text-softGrey">Loading…</div>;
  }

  if (authState === 'out') {
    return <LoginForm onSignedIn={() => setAuthState('in')} />;
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <p className="text-terracotta text-ui">Couldn't load customers: {loadError}</p>
      </div>
    );
  }

  if (selected) {
    return (
      <CustomerDetail
        customer={selected}
        onBack={() => setSelectedId(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <CustomerList
      customers={customers}
      onSelect={(c) => setSelectedId(c.id)}
      onSignOut={() => supabase.auth.signOut()}
      onAdd={handleAdd}
    />
  );
}

// ─────────────────────────────────────────────────────────────────
// Source badge
// ─────────────────────────────────────────────────────────────────
function SourceBadge({ customer }) {
  if (customer.source === 'discovery') {
    return (
      <span
        className="inline-block bg-signal text-white px-2 py-1 text-xs uppercase tracking-wider"
        title="Came in via discovery interview"
      >
        Discovery
      </span>
    );
  }
  if (customer.source === 'gifted') {
    return (
      <span
        className="inline-block bg-terracotta text-white px-2 py-1 text-xs uppercase tracking-wider"
        title="Gifted — free build"
      >
        Gifted
      </span>
    );
  }
  if (customer.source === 'manual') {
    return (
      <span
        className="inline-block border border-carbon/30 text-softGrey px-2 py-1 text-xs uppercase tracking-wider"
        title="Manually added — not a Stripe payment"
      >
        Manual
      </span>
    );
  }
  const paid = customer.payment_status === 'paid';
  return (
    <span
      className={`inline-block px-2 py-1 text-xs uppercase tracking-wider ${
        paid ? 'bg-deepGreen text-white' : 'bg-bone text-carbon border border-carbon/20'
      }`}
      title={paid ? 'Paid via Stripe' : `Stripe — ${customer.payment_status || 'unknown'}`}
    >
      {paid ? 'Paid' : (customer.payment_status || 'Stripe')}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Add customer modal (manual entry)
// ─────────────────────────────────────────────────────────────────
function AddCustomerModal({ onClose, onAdded }) {
  const [source, setSource] = useState('manual'); // manual | gifted
  const [name,  setName]  = useState('');
  const [business, setBusiness] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [plan,  setPlan]  = useState('');
  const [amountNzd, setAmountNzd] = useState('');
  const [stage, setStage] = useState('paid');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const isGifted = source === 'gifted';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const cents = !isGifted && amountNzd ? Math.round(parseFloat(amountNzd) * 100) : null;

    const { data, error } = await supabase
      .from('customers')
      .insert({
        source,
        name:     name     || null,
        business: business || null,
        email:    email    || null,
        phone:    phone    || null,
        plan:     plan     || null,
        amount_total: Number.isFinite(cents) ? cents : null,
        currency: cents != null ? 'nzd' : null,
        build_stage:    isGifted ? (stage === 'paid' ? 'discovery_sent' : stage) : stage,
      })
      .select()
      .single();

    if (error) {
      setSaving(false);
      // Postgres unique violation = email already exists
      if (error.code === '23505') {
        setError(`A customer with that email already exists. Search for them in the list instead.`);
      } else {
        setError(error.message);
      }
      return;
    }

    // If the user typed an opening note, save it as the first journal entry.
    if (notes.trim()) {
      await supabase
        .from('customer_notes')
        .insert({ customer_id: data.id, body: notes.trim() });
    }

    setSaving(false);
    onAdded(data);
  };

  return (
    <div
      className="fixed inset-0 bg-carbon/40 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-carbon/10 shadow-elegant w-full max-w-lg p-6"
      >
        <h2 className="font-display text-2xl text-carbon mb-1">Add customer</h2>
        <p className="text-softGrey text-ui mb-6">
          For customers paid offline, or for free builds you're gifting.
        </p>

        <div className="flex gap-2 mb-6">
          {[
            { value: 'manual', label: 'Manual' },
            { value: 'gifted', label: 'Gifted' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSource(opt.value)}
              className={`flex-1 px-4 py-2 text-ui uppercase tracking-widest border transition-colors ${
                source === opt.value
                  ? 'bg-carbon text-white border-carbon'
                  : 'bg-white text-softGrey border-carbon/20 hover:text-carbon'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-ui font-medium text-carbon mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-carbon/20 px-3 py-2" />
          </div>
          <div>
            <label className="block text-ui font-medium text-carbon mb-1">Business name</label>
            <input value={business} onChange={(e) => setBusiness(e.target.value)} className="w-full border border-carbon/20 px-3 py-2" />
          </div>
          <div>
            <label className="block text-ui font-medium text-carbon mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-carbon/20 px-3 py-2" />
          </div>
          <div>
            <label className="block text-ui font-medium text-carbon mb-1">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-carbon/20 px-3 py-2" />
          </div>
          <div>
            <label className="block text-ui font-medium text-carbon mb-1">Plan</label>
            <input value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Foundation, Build, etc." className="w-full border border-carbon/20 px-3 py-2" />
          </div>
          {!isGifted && (
            <div>
              <label className="block text-ui font-medium text-carbon mb-1">Amount (NZD)</label>
              <input type="number" step="0.01" value={amountNzd} onChange={(e) => setAmountNzd(e.target.value)} placeholder="0.00" className="w-full border border-carbon/20 px-3 py-2" />
            </div>
          )}
          <div>
            <label className="block text-ui font-medium text-carbon mb-1">Stage</label>
            <select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full border border-carbon/20 px-3 py-2 bg-white">
              {BUILD_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <label className="block text-ui font-medium text-carbon mb-1">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full border border-carbon/20 px-3 py-2 mb-4 font-mono text-sm leading-6" />

        {error && <p className="text-terracotta text-ui mb-4">{error}</p>}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-ui uppercase tracking-widest text-softGrey hover:text-carbon">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="bg-carbon text-white px-4 py-2 text-ui uppercase tracking-widest hover:bg-deepGreen transition-colors disabled:opacity-60">
            {saving ? 'Saving…' : 'Add customer'}
          </button>
        </div>
      </form>
    </div>
  );
}
