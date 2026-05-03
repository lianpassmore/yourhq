import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { notifyNtfy } from '../lib/notify';

// Maps form field `name` attributes → discovery_submissions table columns.
// Keep in sync with supabase/migrations/discovery_submissions_table.sql
const FIELD_TO_COLUMN = {
  // Module 01
  'name': 'name',
  'business': 'business',
  'How you heard about YourHQ': 'how_heard_about_yourhq',
  // Module 02
  'email': 'email',
  'Phone number': 'phone',
  'Email for customer enquiries': 'email_for_enquiries',
  'Location': 'location',
  'Service areas': 'service_areas',
  'Customer or mobile service': 'customer_or_mobile_service',
  'Hours': 'hours',
  'Preferred domain': 'preferred_domain',
  'Existing website URL': 'existing_website_url',
  'Social profiles': 'social_profiles',
  'Logo status': 'logo_status',
  'Photos available': 'photos_available',
  // Module 03 (and shared with starter short variant)
  'What you do in plain English': 'what_you_do',
  'Main services or products': 'main_services_or_products',
  "What you're known for": 'known_for',
  'Qualifications and certifications': 'qualifications',
  'Ideal customer': 'ideal_customer',
  'Not for': 'not_for',
  'Point of difference': 'point_of_difference',
  'What you care about': 'what_you_care_about',
  // Starter-only
  'Years in business': 'years_in_business',
  'Why you do this work': 'why_you_do_this_work',
  // Module 04
  'Origin story': 'origin_story',
  'Why you went out on your own': 'why_went_out_on_own',
  'Defining moment or person': 'defining_moment_or_person',
  'What you love about the work': 'love_about_work',
  'How clients should feel after': 'how_clients_should_feel',
  'Deeper purpose': 'deeper_purpose',
  'Unexpected thing about you': 'unexpected_thing',
  // Module 05
  'Brand guidelines': 'brand_guidelines',
  'Brand as a physical space': 'brand_as_physical_space',
  'Three vibe words': 'three_vibe_words',
  'Brands you admire': 'brands_admired',
  'What visitors should feel': 'what_visitors_should_feel',
  'Tone of voice': 'tone_of_voice',
  'Brand personality': 'brand_personality',
  'Brand colours': 'brand_colours',
  'Colours to avoid': 'colours_to_avoid',
  // Module 06
  'Most-used platform': 'most_used_platform',
  'Media and press': 'media_and_press',
  'Content style': 'content_style',
  'Content Autopilot interest': 'content_autopilot_interest',
  'Online presence: move away from': 'online_presence_move_away_from',
  // Module 07
  'Main call to action': 'main_call_to_action',
  'Top customer questions': 'top_customer_questions',
  'Email capture interest': 'email_capture_interest',
  'Email marketing platform': 'email_marketing_platform',
  'Lead magnet idea': 'lead_magnet_idea',
  'Pricing approach': 'pricing_approach',
  // Module 08
  'Bookings system': 'bookings_system',
  'Deposits or upfront payments': 'deposits_or_upfront',
  'Stripe payments interest': 'stripe_payments_interest',
  'Digital products': 'digital_products',
  'Course or program': 'course_or_program',
  'Face of business or brand': 'face_of_business_or_brand',
  'Speaking and workshops': 'speaking_and_workshops',
  'Signature media': 'signature_media',
  'Audience routing': 'audience_routing',
  // Module 09
  'Best client compliment': 'best_client_compliment',
  'Testimonials': 'testimonials',
  'Proud results': 'proud_results',
  'Logos and associations': 'logos_and_associations',
  // Module 10
  'Other site wishes': 'other_site_wishes',
  "What didn't work before": 'what_didnt_work_before',
  'Upcoming changes': 'upcoming_changes',
  'Scope preference': 'scope_preference',
};

const INPUT = "w-full border border-carbon/10 p-3 rounded-xl text-carbon focus:outline-none transition-colors bg-white";
const TEXTAREA = "w-full border border-carbon/10 p-3 rounded-xl text-carbon focus:outline-none transition-colors resize-none bg-white";
const LABEL = "block text-xs font-mono font-medium uppercase tracking-[0.15em] text-softGrey mb-2";
const SECTION = "border-t border-carbon/10 pt-10";

const ACCENT = {
  starter: {
    focus: 'focus:border-carbon',
    btn: 'bg-carbon hover:bg-deepGreen text-white',
    badge: 'bg-carbon text-white',
    highlight: 'border-carbon/10 bg-surface',
  },
  launch: {
    focus: 'focus:border-signal',
    btn: 'bg-carbon hover:bg-deepGreen text-white',
    badge: 'bg-signal text-white',
    highlight: 'border-signal/20 bg-signal/5',
  },
  growth: {
    focus: 'focus:border-terracotta',
    btn: 'bg-terracotta hover:bg-terracotta/90 text-white',
    badge: 'bg-terracotta text-white',
    highlight: 'border-terracotta/20 bg-terracotta/5',
  },
};

export default function DiscoveryForm({ tier = 'launch' }) {
  const [status, setStatus] = useState('idle');
  const a = ACCENT[tier] || ACCENT.launch;
  const isStarter = tier === 'starter';

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');

    const data = new FormData(e.target);

    if (data.get('bot-field')) {
      setStatus('success');
      return;
    }

    const row = { tier };
    for (const [key, value] of data.entries()) {
      if (key === 'bot-field') continue;
      const column = FIELD_TO_COLUMN[key];
      if (!column) continue;
      const v = (value || '').toString().trim();
      row[column] = v || null;
    }

    const name = row.name || '';

    const { error } = await supabase.from('discovery_submissions').insert(row);

    if (error) {
      console.error('Supabase error:', error);
      setStatus('error');
    } else {
      setStatus('success');
      notifyNtfy(
        `${name || 'Someone'} submitted the discovery form. (${tier})`,
        'Discovery Form Submitted'
      );
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full bg-deepGreen/10 text-deepGreen flex items-center justify-center mx-auto text-3xl">
          ✓
        </div>
        <h3 className="font-display font-bold text-headline uppercase text-carbon">Sorted - we've got it!</h3>
        <p className="text-body text-softGrey max-w-md mx-auto">
          We've received your details and we'll get started. Keep an eye on your inbox - we'll be in touch within 1–2 business days.
        </p>
        <p className="text-sm text-softGrey/70">Questions? Text us: 022 172 5793</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">

      {/* Honeypot */}
      <p className="hidden" aria-hidden="true">
        <label>Leave this blank: <input name="bot-field" tabIndex="-1" autoComplete="off" /></label>
      </p>

      {/* ── MODULE 01 — WELCOME + ORIENTATION ── */}
      <div className="space-y-6">
        <div>
          <h3 className="font-display font-bold text-accent uppercase tracking-tight text-carbon">Welcome</h3>
          <p className="text-sm text-softGrey mt-1">Just so we know who we're building for.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className={LABEL} htmlFor="df-name">Your Name</label>
            <input
              type="text" id="df-name" name="name"
              placeholder="Jane Smith"
              className={`${INPUT} ${a.focus}`}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="df-business">
              Business or Brand Name <span className="text-terracotta normal-case font-normal">*required</span>
            </label>
            <input
              type="text" id="df-business" name="business" required
              placeholder="Jane's Plumbing / Jane Smith Coaching"
              className={`${INPUT} ${a.focus}`}
            />
          </div>
        </div>

        <div>
          <label className={LABEL} htmlFor="df-heard">How did you hear about YourHQ?</label>
          <input
            type="text" id="df-heard" name="How you heard about YourHQ"
            placeholder="A friend / Instagram / Google / Nic..."
            className={`${INPUT} ${a.focus}`}
          />
        </div>
      </div>

      {/* ── MODULE 02 — THE BASICS ── */}
      <div className={SECTION}>
        <div className="mb-6">
          <h3 className="font-display font-bold text-accent uppercase tracking-tight text-carbon">The Basics</h3>
          <p className="text-sm text-softGrey mt-1">Contact, location, domain, existing assets.</p>
        </div>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className={LABEL} htmlFor="df-email">Best Email</label>
              <input
                type="email" id="df-email" name="email"
                placeholder="jane@example.com"
                className={`${INPUT} ${a.focus}`}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="df-phone">Best Phone / Text Number</label>
              <input
                type="tel" id="df-phone" name="Phone number"
                placeholder="021 123 456"
                className={`${INPUT} ${a.focus}`}
              />
            </div>
          </div>

          <div>
            <label className={LABEL} htmlFor="df-email-enquiries">Email for Customer Enquiries <span className="normal-case font-normal">(if different)</span></label>
            <input
              type="email" id="df-email-enquiries" name="Email for customer enquiries"
              placeholder="enquiries@yourbusiness.co.nz"
              className={`${INPUT} ${a.focus}`}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className={LABEL} htmlFor="df-location">Where are you based?</label>
              <input
                type="text" id="df-location" name="Location"
                placeholder="Whangārei, NZ"
                className={`${INPUT} ${a.focus}`}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="df-areas">Areas you cover</label>
              <input
                type="text" id="df-areas" name="Service areas"
                placeholder="Northland, Auckland, NZ-wide, global..."
                className={`${INPUT} ${a.focus}`}
              />
            </div>
          </div>

          <div>
            <label className={LABEL} htmlFor="df-travel">Do you travel to clients, do they come to you, or a bit of both?</label>
            <input
              type="text" id="df-travel" name="Customer or mobile service"
              placeholder="I travel to clients / They come to me / Both / Online only"
              className={`${INPUT} ${a.focus}`}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="df-hours">Hours / Availability</label>
            <input
              type="text" id="df-hours" name="Hours"
              placeholder="Mon–Fri 8am–5pm, or by appointment..."
              className={`${INPUT} ${a.focus}`}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="df-domain">Domain name? <span className="normal-case font-normal">(or we'll find the best one for you)</span></label>
            <input
              type="text" id="df-domain" name="Preferred domain"
              placeholder="janeplumbing.co.nz"
              className={`${INPUT} ${a.focus}`}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="df-existing-site">Existing website? <span className="normal-case font-normal">(even if it's old or half-finished, we'll raid it for content)</span></label>
            <input
              type="text" id="df-existing-site" name="Existing website URL"
              placeholder="https://oldsite.co.nz"
              className={`${INPUT} ${a.focus}`}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="df-socials">Social profiles <span className="normal-case font-normal">(Facebook, Instagram, LinkedIn, TikTok, YouTube. Drop links or handles)</span></label>
            <textarea
              id="df-socials" name="Social profiles" rows={3}
              placeholder="@janesplumbing on Insta, facebook.com/janesplumbing, linkedin.com/in/jane..."
              className={`${TEXTAREA} ${a.focus}`}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className={LABEL} htmlFor="df-logo">Logo? <span className="normal-case font-normal">(send to hello@yourhq.co.nz)</span></label>
              <input
                type="text" id="df-logo" name="Logo status"
                placeholder="Yes / No / In progress / Starting fresh"
                className={`${INPUT} ${a.focus}`}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="df-photos">Photos available?</label>
              <input
                type="text" id="df-photos" name="Photos available"
                placeholder="Phone photos / Use my socials / Pro shots..."
                className={`${INPUT} ${a.focus}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── STARTER VARIANT — short version, stop here ── */}
      {isStarter && (
        <div className={SECTION}>
          <div className="mb-6">
            <h3 className="font-display font-bold text-accent uppercase tracking-tight text-carbon">About You & Your Business</h3>
            <p className="text-sm text-softGrey mt-1">Just enough to write a great About section for your one-page site.</p>
          </div>
          <div className="space-y-6">
            <div>
              <label className={LABEL}>In plain English: what do you actually do?</label>
              <textarea
                name="What you do in plain English" rows={3}
                placeholder="I fix leaky pipes, unblock drains, install hot water systems..."
                className={`${TEXTAREA} ${a.focus}`}
              />
            </div>
            <div>
              <label className={LABEL}>How long have you been doing this work?</label>
              <textarea
                name="Years in business" rows={2}
                placeholder="e.g. 8 years, started straight out of school..."
                className={`${TEXTAREA} ${a.focus}`}
              />
            </div>
            <div>
              <label className={LABEL}>Why did you get into this? Or, what's the best part of the job?</label>
              <textarea
                name="Why you do this work" rows={4}
                placeholder="Tell us in your own words. No right or wrong answer..."
                className={`${TEXTAREA} ${a.focus}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── LAUNCH + GROWTH FULL INTERVIEW ── */}
      {!isStarter && (
        <>
          {/* ── MODULE 03 — THE BUSINESS ── */}
          <div className={SECTION}>
            <div className="mb-6">
              <h3 className="font-display font-bold text-accent uppercase tracking-tight text-carbon">The Business</h3>
              <p className="text-sm text-softGrey mt-1">What you do, who you serve, what makes you different.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className={LABEL}>In plain English: what do you actually do? <span className="normal-case font-normal">(pretend we know nothing about your industry)</span></label>
                <textarea
                  name="What you do in plain English" rows={4}
                  placeholder="I fix leaky pipes, unblock drains, install hot water systems..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Main services, products, or packages?</label>
                <textarea
                  name="Main services or products" rows={4}
                  placeholder="Residential plumbing, commercial fit-outs, emergency call-outs..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>One thing you're especially known for? <span className="normal-case font-normal">("Oh, you need X? Go see them.")</span></label>
                <textarea
                  name="What you're known for" rows={3}
                  placeholder="People come to me specifically for heat pump installs..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Qualifications, licences, or certifications worth showing?</label>
                <textarea
                  name="Qualifications and certifications" rows={3}
                  placeholder="Master Plumber certified, Licensed Building Practitioner..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Who's your ideal client? <span className="normal-case font-normal">(if you could clone your favourite, who'd they be?)</span></label>
                <textarea
                  name="Ideal customer" rows={3}
                  placeholder="Homeowners in their 30s–50s who take pride in their property..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Anyone this site is definitely NOT for?</label>
                <textarea
                  name="Not for" rows={2}
                  placeholder="No commercial work, no jobs outside Auckland..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>What makes you different? Why pick you over a competitor?</label>
                <textarea
                  name="Point of difference" rows={4}
                  placeholder="I actually show up on time. I explain everything before I start..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>What do you care about that maybe other people in your industry don't?</label>
                <textarea
                  name="What you care about" rows={3}
                  placeholder="Honest pricing, no upselling, treating apprentices well..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
            </div>
          </div>

          {/* ── MODULE 04 — THE STORY ── */}
          <div className={SECTION}>
            <div className="mb-6">
              <h3 className="font-display font-bold text-accent uppercase tracking-tight text-carbon">Your Story</h3>
              <p className="text-sm text-softGrey mt-1">The most important section. Write how you'd say it. Only share what you're comfortable putting online.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className={LABEL}>How did you end up doing this work?</label>
                <textarea
                  name="Origin story" rows={4}
                  placeholder="I used to work for a big firm, then..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>What made you want to do this yourself rather than work for someone else?</label>
                <textarea
                  name="Why you went out on your own" rows={3}
                  placeholder="I wanted to do things my way..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>A moment, or a person, that shaped why you do what you do?</label>
                <textarea
                  name="Defining moment or person" rows={3}
                  placeholder="My old boss taught me that..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>What do you love about this work? What gets you out of bed?</label>
                <textarea
                  name="What you love about the work" rows={4}
                  placeholder="Honestly, it's when a customer calls back six months later to say..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>When someone leaves after working with you, what do you want them to feel?</label>
                <textarea
                  name="How clients should feel after" rows={3}
                  placeholder="Like they finally got someone who actually listened..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>If your business had a deeper purpose beyond the work itself, what would it be?</label>
                <textarea
                  name="Deeper purpose" rows={3}
                  placeholder="Helping people feel proud of where they live..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>What do you want people to know about you that they might not expect?</label>
                <textarea
                  name="Unexpected thing about you" rows={3}
                  placeholder="I'm a classically trained pianist / I used to teach high school..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
            </div>
          </div>

          {/* ── MODULE 05 — BRAND + VOICE ── */}
          <div className={SECTION}>
            <div className="mb-6">
              <h3 className="font-display font-bold text-accent uppercase tracking-tight text-carbon">Brand & Voice</h3>
              <p className="text-sm text-softGrey mt-1">Helps us nail the look, feel, and tone.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className={LABEL}>Got brand guidelines or a style guide? <span className="normal-case font-normal">(send to hello@yourhq.co.nz)</span></label>
                <input
                  type="text" name="Brand guidelines"
                  placeholder="Yes / No / Just a logo and some colours"
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>If your brand was a physical space (café, studio, shop, home) what would walking in feel like?</label>
                <textarea
                  name="Brand as a physical space" rows={3}
                  placeholder="Warm timber, plants, coffee on the bench, someone humming..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Three words that describe the vibe you want?</label>
                <input
                  type="text" name="Three vibe words"
                  placeholder="Warm, capable, no-nonsense"
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Brands, websites, or aesthetics you admire? <span className="normal-case font-normal">(even outside your industry)</span></label>
                <textarea
                  name="Brands you admire" rows={3}
                  placeholder="Allbirds, Karen Walker, that local café that gets the typography right..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>When someone lands on your site, what do you want them to feel?</label>
                <textarea
                  name="What visitors should feel" rows={3}
                  placeholder="Calm, like they've found the right person..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>How do you naturally talk to clients? <span className="normal-case font-normal">(casual, professional, somewhere in between?)</span></label>
                <input
                  type="text" name="Tone of voice"
                  placeholder="Pretty casual but still professional..."
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>If your brand was a person, how would you describe them?</label>
                <textarea
                  name="Brand personality" rows={3}
                  placeholder="Confident but not arrogant. Warm but no-nonsense..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className={LABEL}>Brand colours <span className="normal-case font-normal">(if you have them)</span></label>
                  <input
                    type="text" name="Brand colours"
                    placeholder="Navy and white, or #003366..."
                    className={`${INPUT} ${a.focus}`}
                  />
                </div>
                <div>
                  <label className={LABEL}>Colours to avoid?</label>
                  <input
                    type="text" name="Colours to avoid"
                    placeholder="Not orange, definitely no bright yellow..."
                    className={`${INPUT} ${a.focus}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── MODULE 06 — ONLINE PRESENCE + CONTENT ── */}
          <div className={SECTION}>
            <div className="mb-6">
              <h3 className="font-display font-bold text-accent uppercase tracking-tight text-carbon">Online Presence & Content</h3>
              <p className="text-sm text-softGrey mt-1">Where you show up and what you create.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className={LABEL}>Which platform do you use most? Which feels most natural?</label>
                <textarea
                  name="Most-used platform" rows={2}
                  placeholder="Instagram for photos, LinkedIn for the serious stuff..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Podcast appearances, press mentions, speaking gigs, or media coverage?</label>
                <textarea
                  name="Media and press" rows={3}
                  placeholder="Featured in NZ Herald 2024, guested on the Better Business podcast..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Long-form posts, or short and punchy?</label>
                <input
                  type="text" name="Content style"
                  placeholder="Mostly short captions / Longer LinkedIn essays..."
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Want your social posts to automatically become blog articles? <span className="normal-case font-normal">(Content Autopilot Power-Up)</span></label>
                <input
                  type="text" name="Content Autopilot interest"
                  placeholder="Yes, Instagram and LinkedIn / No / Tell me more"
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Anything about your online presence you're embarrassed by or want to move away from?</label>
                <textarea
                  name="Online presence: move away from" rows={2}
                  placeholder="My old website is dire. Don't link to it..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
            </div>
          </div>

          {/* ── MODULE 07 — WHAT THE SITE NEEDS TO DO ── */}
          <div className={SECTION}>
            <div className="mb-6">
              <h3 className="font-display font-bold text-accent uppercase tracking-tight text-carbon">What the Site Needs to Do</h3>
              <p className="text-sm text-softGrey mt-1">Goals, calls to action, and email capture.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className={LABEL}>When someone lands on your site, what's the ONE thing you most want them to do?</label>
                <input
                  type="text" name="Main call to action"
                  placeholder="Call me / Fill out a form / Book online / Buy the thing..."
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Questions you get asked all the time we should just answer on the site?</label>
                <textarea
                  name="Top customer questions" rows={5}
                  placeholder={"1. How much does it cost?\n2. How soon can you come out?\n3. Are you licensed?"}
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Do you want to capture email addresses through the site?</label>
                <input
                  type="text" name="Email capture interest"
                  placeholder="Yes / No / Tell me more"
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Email marketing platform? <span className="normal-case font-normal">(ConvertKit, Mailchimp, etc. Leave blank if none)</span></label>
                <input
                  type="text" name="Email marketing platform"
                  placeholder="ConvertKit / Mailchimp / None yet"
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Something you could offer in exchange for an email? <span className="normal-case font-normal">(guide, checklist, free consult)</span></label>
                <textarea
                  name="Lead magnet idea" rows={3}
                  placeholder="A 'home maintenance checklist' PDF, free 15-min consult..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>How do you want to handle pricing on the site?</label>
                <input
                  type="text" name="Pricing approach"
                  placeholder="Show prices / 'Starting from...' / Get in touch only"
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
            </div>
          </div>

          {/* ── MODULE 08 — INTEGRATIONS ── */}
          <div className={SECTION}>
            <div className="mb-6">
              <h3 className="font-display font-bold text-accent uppercase tracking-tight text-carbon">Integrations</h3>
              <p className="text-sm text-softGrey mt-1">Only fill in what's relevant. Anything here may be a Power-Up. Lian will confirm scope and pricing.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className={LABEL}>Bookings system? <span className="normal-case font-normal">(Calendly, Acuity, Timely...)</span></label>
                <input
                  type="text" name="Bookings system"
                  placeholder="Calendly / Timely / None / Open to suggestions"
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Take deposits or payments upfront from clients?</label>
                <input
                  type="text" name="Deposits or upfront payments"
                  placeholder="Yes, 50% deposits / Sometimes / No"
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Want to take payments through the website?</label>
                <input
                  type="text" name="Stripe payments interest"
                  placeholder="Yes, session packs / digital products / No"
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Sell or plan to sell digital products? <span className="normal-case font-normal">(guides, templates, recordings)</span></label>
                <input
                  type="text" name="Digital products"
                  placeholder="A meditation pack, a hiring template..."
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Have or plan a course or program?</label>
                <input
                  type="text" name="Course or program"
                  placeholder="Yes, 6-week leadership course / Maybe one day / No"
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Are you the face of the business, or is the business the brand, or both?</label>
                <input
                  type="text" name="Face of business or brand"
                  placeholder="I am the brand / The business is the brand / Both"
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Do you speak, consult, run workshops, or appear on stages?</label>
                <textarea
                  name="Speaking and workshops" rows={2}
                  placeholder="Keynote at NZ Marketing Summit, run quarterly workshops..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>TEDx talk, keynote, podcast episode, or signature media moment to feature prominently?</label>
                <input
                  type="text" name="Signature media"
                  placeholder="TEDx Auckland 2023 / Keynote at..."
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Different kinds of clients who need different things from the site? <span className="normal-case font-normal">(e.g. speakers vs coaching clients vs community)</span></label>
                <textarea
                  name="Audience routing" rows={3}
                  placeholder="Speakers want my speaker reel, 1:1 clients want to book a discovery..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
            </div>
          </div>

          {/* ── MODULE 09 — TESTIMONIALS + SOCIAL PROOF ── */}
          <div className={SECTION}>
            <div className="mb-6">
              <h3 className="font-display font-bold text-accent uppercase tracking-tight text-carbon">Testimonials & Social Proof</h3>
              <p className="text-sm text-softGrey mt-1">The stuff that builds trust.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className={LABEL}>Best compliment a client has ever given you?</label>
                <textarea
                  name="Best client compliment" rows={3}
                  placeholder="It was the first time someone actually listened to me..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Written testimonials or reviews we can use? <span className="normal-case font-normal">(Google, Facebook, DMs, emails)</span></label>
                <textarea
                  name="Testimonials" rows={5}
                  placeholder="Paste any reviews here, or just say where to find them..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Results or outcomes you're particularly proud of? <span className="normal-case font-normal">(a project, a transformation, a number)</span></label>
                <textarea
                  name="Proud results" rows={4}
                  placeholder="Helped a client triple their revenue in 18 months..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Logos, media mentions, or associations to show? <span className="normal-case font-normal">("As seen in", "Member of"...)</span></label>
                <textarea
                  name="Logos and associations" rows={3}
                  placeholder="Master Plumbers member, featured in NZ Herald, ICF certified..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
            </div>
          </div>

          {/* ── MODULE 10 — WRAP UP ── */}
          <div className={SECTION}>
            <div className="mb-6">
              <h3 className="font-display font-bold text-accent uppercase tracking-tight text-carbon">Wrap Up</h3>
              <p className="text-sm text-softGrey mt-1">Last few. Anything we haven't covered.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className={LABEL}>Anything else you want on the site? <span className="normal-case font-normal">(seen something somewhere and thought "I want that")</span></label>
                <textarea
                  name="Other site wishes" rows={3}
                  placeholder="A staff profiles section, a before/after gallery..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Anything you've had on a website before that didn't work, or that you definitely don't want?</label>
                <textarea
                  name="What didn't work before" rows={3}
                  placeholder="A live chat widget that just stressed me out..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Anything about your business that's changing soon we should build in now?</label>
                <textarea
                  name="Upcoming changes" rows={3}
                  placeholder="Launching a second location in March, hiring a second coach..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>On a scale of "keep it simple" to "give me everything", where are you sitting?</label>
                <input
                  type="text" name="Scope preference"
                  placeholder="Keep it simple / Somewhere in the middle / Give me everything"
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── SUBMIT ── */}
      <div className="pt-4 space-y-4">
        <button
          type="submit"
          disabled={status === 'sending'}
          className={`${a.btn} px-8 py-4 w-full rounded-full font-medium text-ui transition-colors duration-300 shadow-subtle hover:shadow-elegant disabled:opacity-50`}
        >
          {status === 'sending' ? 'Sending...' : 'Send to YourHQ →'}
        </button>

        {status === 'error' && (
          <p className="text-sm text-terracotta text-center">
            Something went wrong. Please try again or text us on{' '}
            <a href="sms:0221725793" className="underline">022 172 5793</a>.
          </p>
        )}

        <p className="text-xs text-softGrey/70 text-center">
          Only your business or brand name is required. Fill in whatever else you can. We'll follow up on anything we need.
        </p>
      </div>
    </form>
  );
}
