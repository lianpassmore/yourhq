import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { notifyNtfy } from '../lib/notify';

const INPUT = "w-full border-2 border-gray-200 p-3 text-carbon focus:outline-none transition-colors bg-white";
const TEXTAREA = "w-full border-2 border-gray-200 p-3 text-carbon focus:outline-none transition-colors resize-none bg-white";
const LABEL = "block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2";
const SECTION = "border-t-2 border-gray-100 pt-10";

const ACCENT = {
  starter: {
    focus: 'focus:border-carbon',
    btn: 'bg-carbon hover:bg-gray-800 text-white',
    badge: 'bg-carbon text-white',
    highlight: 'border-carbon/20 bg-gray-50',
  },
  launch: {
    focus: 'focus:border-signal',
    btn: 'bg-signal hover:bg-blue-700 text-white',
    badge: 'bg-signal text-white',
    highlight: 'border-signal/20 bg-signal/5',
  },
  growth: {
    focus: 'focus:border-hibiscus',
    btn: 'bg-hibiscus hover:bg-pink-600 text-white',
    badge: 'bg-hibiscus text-white',
    highlight: 'border-hibiscus/20 bg-hibiscus/5',
  },
};

export default function DiscoveryForm({ tier = 'launch' }) {
  const [status, setStatus] = useState('idle');
  const a = ACCENT[tier] || ACCENT.launch;
  const isStarter = tier === 'starter';
  const isGrowth = tier === 'growth';

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');

    const data = new FormData(e.target);

    // Pull out core fields
    const name = (data.get('name') || '').trim();
    const email = (data.get('email') || '').trim();
    const business = (data.get('business') || '').trim();

    // Build a formatted message from every field that has a value
    const lines = [];
    for (const [key, value] of data.entries()) {
      if (key === 'bot-field') continue;
      const v = (value || '').trim();
      if (v) lines.push(`${key}:\n${v}`);
    }
    const message = lines.join('\n\n---\n\n');

    const { error } = await supabase.from('leads').insert({
      name: name || null,
      email: email || null,
      business: business || null,
      message,
      source: `discovery-${tier}`,
    });

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
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto text-3xl">
          ✓
        </div>
        <h3 className="text-2xl font-extrabold tracking-tighter">Sorted — we've got it!</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          We've received your details and we'll get started. Keep an eye on your inbox — we'll be in touch within 1–2 business days.
        </p>
        <p className="text-sm text-gray-400">Questions? Text us: 022 172 5793</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">

      {/* Honeypot */}
      <p className="hidden" aria-hidden="true">
        <label>Leave this blank: <input name="bot-field" tabIndex="-1" autoComplete="off" /></label>
      </p>

      {/* ── YOUR DETAILS ── */}
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-extrabold tracking-tighter uppercase">Your Details</h3>
          <p className="text-sm text-gray-500 mt-1">So we know who we're building for.</p>
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
            <label className={LABEL} htmlFor="df-business">Business Name</label>
            <input
              type="text" id="df-business" name="business"
              placeholder="Jane's Plumbing"
              className={`${INPUT} ${a.focus}`}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className={LABEL} htmlFor="df-email">Your Email</label>
            <input
              type="email" id="df-email" name="email"
              placeholder="jane@example.com"
              className={`${INPUT} ${a.focus}`}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="df-phone">Phone / Text Number</label>
            <input
              type="tel" id="df-phone" name="Phone number"
              placeholder="021 123 456"
              className={`${INPUT} ${a.focus}`}
            />
          </div>
        </div>

        <div>
          <label className={LABEL} htmlFor="df-email-enquiries">Email for Customer Enquiries <span className="normal-case font-normal">(if different from above)</span></label>
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
              placeholder="Whangarei, NZ"
              className={`${INPUT} ${a.focus}`}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="df-areas">Areas you cover</label>
            <input
              type="text" id="df-areas" name="Service areas"
              placeholder="Northland, Auckland..."
              className={`${INPUT} ${a.focus}`}
            />
          </div>
        </div>

        <div>
          <label className={LABEL} htmlFor="df-travel">Do you travel to customers, or do they come to you?</label>
          <input
            type="text" id="df-travel" name="Customer or mobile service"
            placeholder="I travel to customers / They come to me / Both"
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
          <label className={LABEL} htmlFor="df-domain">Website address in mind? <span className="normal-case font-normal">(or we'll find the best .co.nz for you)</span></label>
          <input
            type="text" id="df-domain" name="Preferred domain"
            placeholder="janeplumbing.co.nz"
            className={`${INPUT} ${a.focus}`}
          />
        </div>
      </div>

      {/* ── STARTER ONLY ── */}
      {isStarter && (
        <div className={SECTION}>
          <div className="mb-6">
            <h3 className="text-base font-extrabold tracking-tighter uppercase">About You & Your Business</h3>
            <p className="text-sm text-gray-500 mt-1">Just enough to write a great About section for your one-page site.</p>
          </div>
          <div className="space-y-6">
            <div>
              <label className={LABEL}>How long have you been doing this work?</label>
              <textarea
                name="Years in business" rows={2}
                placeholder="e.g. 8 years, started straight out of school..."
                className={`${TEXTAREA} ${a.focus}`}
              />
            </div>
            <div>
              <label className={LABEL}>Is it just you running the show, or do you have a crew?</label>
              <textarea
                name="Team size" rows={2}
                placeholder="Just me / I have 2 staff..."
                className={`${TEXTAREA} ${a.focus}`}
              />
            </div>
            <div>
              <label className={LABEL}>Why did you get into this? Or — what's the best part of the job?</label>
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
          {/* Origin Story */}
          <div className={SECTION}>
            <div className="mb-6">
              <h3 className="text-base font-extrabold tracking-tighter uppercase">Your Story</h3>
              <p className="text-sm text-gray-500 mt-1">This is where we capture your voice. Write how you'd say it — not how you'd write it.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className={LABEL}>How long have you been doing this work?</label>
                <textarea
                  name="Years in business" rows={2}
                  placeholder="e.g. 12 years, started straight out of school..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Is it just you, or do you have a crew?</label>
                <textarea
                  name="Team size" rows={2}
                  placeholder="Just me, plus a part-timer on busy weeks..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>How did you end up doing this? What's your origin story?</label>
                <textarea
                  name="Origin story" rows={4}
                  placeholder="I used to work for a big firm, then..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>What made you go out on your own instead of working for someone else?</label>
                <textarea
                  name="Why you went out on your own" rows={3}
                  placeholder="I wanted to do things my way, with no one breathing down my neck..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>What do you actually love about this work? What gets you out of bed?</label>
                <textarea
                  name="What you love about the work" rows={4}
                  placeholder="Honestly, it's when a customer calls back six months later to say..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
            </div>
          </div>

          {/* The Customers */}
          <div className={SECTION}>
            <div className="mb-6">
              <h3 className="text-base font-extrabold tracking-tighter uppercase">Your Customers</h3>
              <p className="text-sm text-gray-500 mt-1">Help us write copy that speaks directly to the people you want to attract.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className={LABEL}>Who's your ideal customer? If you could clone your favourite client, who would that be?</label>
                <textarea
                  name="Ideal customer" rows={3}
                  placeholder="Homeowners in their 30s–50s who take pride in their property..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>What's usually going on in their life when they come looking for you? What problem are they trying to solve?</label>
                <textarea
                  name="Customer pain point" rows={3}
                  placeholder="They've usually got a leaky pipe and their usual guy isn't picking up..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>What's the best compliment a customer has ever given you?</label>
                <textarea
                  name="Best customer compliment" rows={3}
                  placeholder="They said it was the first time they'd felt like someone actually listened..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>If a customer was telling a mate about you, what would you want them to say?</label>
                <textarea
                  name="Word of mouth ideal quote" rows={3}
                  placeholder={'"Just ring Jane — she\'ll sort it out, no dramas."'}
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
            </div>
          </div>

          {/* The Offerings */}
          <div className={SECTION}>
            <div className="mb-6">
              <h3 className="text-base font-extrabold tracking-tighter uppercase">What You Do</h3>
              <p className="text-sm text-gray-500 mt-1">Plain English, no jargon.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className={LABEL}>In plain English, what do you actually do? Pretend I know nothing about your industry.</label>
                <textarea
                  name="What you do in plain English" rows={4}
                  placeholder="I fix leaky pipes, unblock drains, install hot water systems..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>What are your main services, products, or packages?</label>
                <textarea
                  name="Main services or products" rows={4}
                  placeholder="Residential plumbing, commercial fit-outs, emergency call-outs..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Is there one thing you're known for? Like "Oh, you need X? Go see [you]."</label>
                <textarea
                  name="What you're known for" rows={3}
                  placeholder="People come to me specifically for heat pump installs..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Any qualifications, licences, or certifications we should show off?</label>
                <textarea
                  name="Qualifications and certifications" rows={3}
                  placeholder="Master Plumber certified, Licensed Building Practitioner..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>What makes you different from the next person doing the same thing?</label>
                <textarea
                  name="Point of difference" rows={4}
                  placeholder="I actually show up on time. I explain everything before I start. I don't disappear after the job..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
            </div>
          </div>

          {/* Proud Moments */}
          <div className={SECTION}>
            <div className="mb-6">
              <h3 className="text-base font-extrabold tracking-tighter uppercase">Proud Moments</h3>
              <p className="text-sm text-gray-500 mt-1">Stories make websites memorable. Take your time with these.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className={LABEL}>What's one of the jobs you've been most proud of?</label>
                <textarea
                  name="Proudest job" rows={4}
                  placeholder="We did a full bathroom reno for this elderly couple in Dargaville..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>What's one of the biggest learnings you've had as a business owner?</label>
                <textarea
                  name="Biggest business learning" rows={3}
                  placeholder="Early on I was afraid to put my prices up, then I realised..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Is there a customer story that sticks with you?</label>
                <textarea
                  name="Memorable customer story" rows={4}
                  placeholder="There was this single mum who'd been quoted $8k by someone else..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
            </div>
          </div>

          {/* Vibe & Photos */}
          <div className={SECTION}>
            <div className="mb-6">
              <h3 className="text-base font-extrabold tracking-tighter uppercase">Vibe & Visuals</h3>
              <p className="text-sm text-gray-500 mt-1">Help us nail the look and feel.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className={LABEL}>If your business was a person, how would you describe their vibe?</label>
                <textarea
                  name="Business vibe or personality" rows={3}
                  placeholder="Reliable, no-nonsense, but warm. Like a good tradie mate you can trust..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className={LABEL}>Do you have a logo? <span className="normal-case font-normal">(Send it to hello@yourhq.co.nz)</span></label>
                  <input
                    type="text" name="Logo status"
                    placeholder="Yes / No / In progress"
                    className={`${INPUT} ${a.focus}`}
                  />
                </div>
                <div>
                  <label className={LABEL}>Brand colours <span className="normal-case font-normal">(if you have them)</span></label>
                  <input
                    type="text" name="Brand colours"
                    placeholder="Navy blue and white, or #003366..."
                    className={`${INPUT} ${a.focus}`}
                  />
                </div>
              </div>
              <div>
                <label className={LABEL}>Any colours you definitely don't want?</label>
                <input
                  type="text" name="Colours to avoid"
                  placeholder="Not orange, definitely not bright yellow..."
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className={LABEL}>Facebook page URL <span className="normal-case font-normal">(if you have one)</span></label>
                  <input
                    type="text" name="Facebook URL"
                    placeholder="facebook.com/yourbusiness"
                    className={`${INPUT} ${a.focus}`}
                  />
                </div>
                <div>
                  <label className={LABEL}>Instagram handle <span className="normal-case font-normal">(if you have one)</span></label>
                  <input
                    type="text" name="Instagram handle"
                    placeholder="@yourbusiness"
                    className={`${INPUT} ${a.focus}`}
                  />
                </div>
              </div>
              <div>
                <label className={LABEL}>Do you have photos of your work? Or are we working with what's on your socials?</label>
                <textarea
                  name="Photos available" rows={2}
                  placeholder="I've got some on my phone, nothing professional... / Just use my Facebook..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
            </div>
          </div>

          {/* Money & Action */}
          <div className={SECTION}>
            <div className="mb-6">
              <h3 className="text-base font-extrabold tracking-tighter uppercase">Pricing & Calls to Action</h3>
              <p className="text-sm text-gray-500 mt-1">How you want visitors to engage with your site.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className={LABEL}>How do you want to handle pricing on the site?</label>
                <input
                  type="text" name="Pricing approach"
                  placeholder="Specific prices / 'Starting from...' / 'Get in touch for a quote'"
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>When someone lands on your site, what's the main thing you want them to do?</label>
                <input
                  type="text" name="Main call to action"
                  placeholder="Call me / Fill out a form / Book online..."
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Is there anything you want to make really obvious? <span className="normal-case font-normal">(e.g. "Free quotes", "Same-day service")</span></label>
                <textarea
                  name="Key selling points to highlight" rows={3}
                  placeholder="Free quotes, no call-out fee, 24/7 emergency..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className={SECTION}>
            <div className="mb-6">
              <h3 className="text-base font-extrabold tracking-tighter uppercase">Google & SEO</h3>
              <p className="text-sm text-gray-500 mt-1">What people search for when they need someone like you.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className={LABEL}>When someone Googles what you do, what's the dream search phrase?</label>
                <input
                  type="text" name="Dream Google search phrase"
                  placeholder='"Plumber Whangarei" or "emergency plumber Northland"'
                  className={`${INPUT} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>What are the top questions people always ask before booking you?</label>
                <textarea
                  name="Top customer questions before booking" rows={5}
                  placeholder={"1. How much does it cost?\n2. How soon can you come out?\n3. Are you licensed?\n..."}
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
              <div>
                <label className={LABEL}>Any jobs you definitely DON'T want? <span className="normal-case font-normal">(We can write the site to filter these out.)</span></label>
                <textarea
                  name="Jobs to filter out" rows={2}
                  placeholder="No commercial work, no jobs outside Auckland..."
                  className={`${TEXTAREA} ${a.focus}`}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── GROWTH ONLY ── */}
      {isGrowth && (
        <div className={SECTION}>
          <div className="mb-6">
            <h3 className="text-base font-extrabold tracking-tighter uppercase">Booking System & Content</h3>
            <p className="text-sm text-gray-500 mt-1">Growth-specific features — let's get these sorted.</p>
          </div>
          <div className="space-y-6">
            <div>
              <label className={LABEL}>Do you already use a booking system? <span className="normal-case font-normal">(e.g. Timely, Fresha, Calendly)</span></label>
              <input
                type="text" name="Existing booking system"
                placeholder="Yes – Calendly / No – open to suggestions"
                className={`${INPUT} ${a.focus}`}
              />
            </div>
            <div>
              <label className={LABEL}>Would you like a blog or news section? <span className="normal-case font-normal">(Tips, updates, before/afters)</span></label>
              <textarea
                name="Blog or news section" rows={3}
                placeholder="Yes, I'd love to share tips and before/afters... / Not sure yet..."
                className={`${TEXTAREA} ${a.focus}`}
              />
            </div>
            <div>
              <label className={LABEL}>Is there anything else you want the site to do for you?</label>
              <textarea
                name="Anything else" rows={3}
                placeholder="A staff profiles section, a before/after gallery, something else entirely..."
                className={`${TEXTAREA} ${a.focus}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── SUBMIT ── */}
      <div className="pt-4 space-y-4">
        <button
          type="submit"
          disabled={status === 'sending'}
          className={`${a.btn} px-8 py-4 w-full font-bold uppercase tracking-widest shadow-hard hover:shadow-none hover:translate-y-[2px] transition-all disabled:opacity-50`}
        >
          {status === 'sending' ? 'Sending...' : 'Send to YourHQ →'}
        </button>

        {status === 'error' && (
          <p className="text-sm text-red-600 text-center">
            Something went wrong. Please try again or text us on{' '}
            <a href="sms:0221725793" className="underline">022 172 5793</a>.
          </p>
        )}

        <p className="text-xs text-gray-400 text-center">
          All fields are optional — fill in what you can. We'll follow up on anything we need.
        </p>
      </div>
    </form>
  );
}
