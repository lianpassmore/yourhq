# YourHQ Site Map
# May 2026

Visibility column key:
- **Nav** → linked from main navigation
- **Footer** → linked from footer only
- **Indexed** → public, indexable by search, not in nav/footer
- **Hidden** → `noindex={true}`, not linked anywhere
- **Stripe redirect** → public, reached only after a Stripe checkout

---

## 1. Primary navigation

| Path | File | Visibility | Purpose |
|---|---|---|---|
| `/` | `index.astro` | Nav (Home) | Homepage. Hero, Meet Lian, Two Kinds of Build, How I Work, Is This For You, And Who It Isn't, 7-step overview, Caretaker model, pricing snapshot, Forever Fresh, final CTA. |
| `/how-it-works` | `how-it-works.astro` | Nav | The Promise + 7-step timeline + What I Need / Don't Need + I Stay + FAQ + CTA. |
| `/pricing` | `pricing.astro` | Nav | Build hero ($1,800), Power-Ups grid, Not My Lane referrals, three Caretaker tiers, on-demand updates explainer, pause/cancel, Love It or Leave It, comparison table, why subscription, pricing FAQ. |
| `/who-we-build-for` | `who-we-build-for.astro` | Nav | Consolidated audience page replacing tradies/creatives/professionals niches. The Identity, Is This You, Who I've Built For, Who This Isn't For, testimonials, CTA. |
| `/ecosystem` | `ecosystem.astro` | Nav (as "Your Digital Ecosystem") | Only education/SEO page. The Numbers, Signals vs Source, Ecosystem map, Two Kinds of Site, Tech Stack with house analogy, One-Inbox model, Not Our Lane, FAQ. |
| `/portfolio` | `portfolio.astro` | Nav | DreamStorm origin + four client builds with scroll-on-hover screenshot frames + What Every Build Has in Common. |
| `/our-story` | `our-story.astro` | Nav | Founder narrative. Origin, The Belief, The Master's, The Personal Bit (dad), The Work, Where This Is Going (global), Nic as Connector, Values. |

## 2. Footer + utility pages

| Path | File | Visibility | Purpose |
|---|---|---|---|
| `/contact` | `contact.astro` | Footer | "Ready to Hand This Over?" hero, Steps 1-4 left column, contact details, full intake form (name, where based, business, what do you do, current online presence, email, phone, anything else, referral source), skip-to-interview CTA. |
| `/network` | `network.astro` | Footer | YourHQ Network referral program for accountants/brokers/etc. Updated with new $1,800 / $99 pricing. |
| `/refer` | `refer.astro` | Footer | Refer-a-friend program. "1st month free" updated to $199 (new top tier). |
| `/google-guide` | `google-guide.astro` | Footer | Free guide on getting found on Google. Tagline updated to new positioning. |
| `/guide` | `guide.astro` | Footer | "5 Signs You Need a Website" lead magnet. Tagline updated. |
| `/blog` | `blog/` | Footer | Blog index + posts (auto-generated from `src/content/`). |
| `/legal` | `legal.astro` | Footer | Terms of Trade & Fair Use Policy (May 2026). 12 numbered sections, $175/hr additional-work rate. |
| `/privacy` | `privacy.astro` | Footer | Privacy Policy (May 2026). Data sovereignty framing, tech stack transparency, NZ Privacy Act basis. |
| `/faq` | `faq.astro` | Not currently linked | Standalone FAQ. 7 grouped sections (Process, Build, Ownership, Pricing, Working With Lian, Global Clients, Honest Ones) with sticky jump-link bar. **Suggest linking from footer.** |

## 3. Caretaker tier landings

Reached after the build is approved. Each is a public landing with a Stripe subscription CTA.

| Path | File | Visibility | Tier | Stripe |
|---|---|---|---|---|
| `/foundation` | `foundation.astro` | Indexed (linked from `/pricing`) | Foundation. $99/mo. | `6oUeVcdOG…` |
| `/capture` | `capture.astro` | Indexed (linked from `/pricing`) | Capture. $149/mo. | `5kQ9ASbGy…` |
| `/commerce` | `commerce.astro` | Indexed (linked from `/pricing`) | Commerce. $199/mo. | `dRmbJ025Y…` |

## 4. Stripe redirect destinations

Reached only after a Stripe payment. Wired in Stripe dashboard, not from internal nav.

| Path | File | Triggered by | Then leads to |
|---|---|---|---|
| `/next-steps` | `next-steps.astro` | After Build payment | `/discovery-interview` |
| `/subscription-confirmed` | `subscription-confirmed.astro` | After Caretaker subscription | Customer portal + go-live |
| `/discovery-interview` | `discovery-interview.astro` | Linked from `/next-steps` and `/contact` | The ElevenLabs voice agent + written form |

## 5. SEO landings (indexed, unlinked from nav/footer)

These exist for organic search and external campaigns. Not in main nav or footer. Each links into the funnel via Build Stripe URL or `/pricing`.

| Path | File | Targets |
|---|---|---|
| `/nz-website-design` | `nz-website-design.astro` | "website design NZ" and city-name searches. Comparison table, 7-step brief, audience cards linking to niche pages, NZ-cities band, FAQ. |
| `/tradies` | `tradies.astro` | "websites for tradies NZ" and trade-specific searches. |
| `/creatives` | `creatives.astro` | "websites for cafes NZ", "wellness studio website", photographer/designer searches. |
| `/professionals` | `professionals.astro` | "physio website NZ", accountant/lawyer/consultant searches. Includes compliance note. |

## 6. Hidden / referral-only

Not in nav, not in footer. `noindex={true}` so they don't appear in search. Reached only by direct link.

| Path | File | Purpose |
|---|---|---|
| `/one-pager` | `one-pager.astro` | $1,590 referral product. Editorial magazine styling. Send the link to word-of-mouth referrals only. |
| `/login` | `login.astro` | Old client-login page. Replaced by Stripe customer portal. Kept for reference only. |

## 7. Deprecated (kept but `noindex`'d)

Old confirmation pages that no longer match the live flow. New flow uses `/next-steps` and `/subscription-confirmed`. Files retained in case of bookmarked links. Safe to delete in a future cleanup.

| Path | File |
|---|---|
| `/confirmation-launch` | `confirmation-launch.astro` |
| `/confirmation-growth` | `confirmation-growth.astro` |
| `/confirmation-starter` | `confirmation-starter.astro` |
| `/confirmation-start` | `confirmation-start.astro` |
| `/confirmation-refresh` | `confirmation-refresh.astro` |

## 8. Stripe checkout URLs (for reference)

| Product | URL |
|---|---|
| The Build | `https://buy.stripe.com/00w00i6me14s4BLev9dZ604` |
| Power-Ups | `https://buy.stripe.com/3cI14mfWO8wU7NXgDhdZ609` |
| Caretaker — Foundation | `https://buy.stripe.com/6oUeVcdOGcNad8haeTdZ605` |
| Caretaker — Capture | `https://buy.stripe.com/5kQ9ASbGybJ60lvev9dZ607` |
| Caretaker — Commerce | `https://buy.stripe.com/dRmbJ025YfZm6JT4UzdZ606` |
| Content-Autopilot Monthly | `https://buy.stripe.com/8x29AS8um3cAecldr5dZ608` |
| One-Pager (referral only) | `https://buy.stripe.com/eVq6oG4e628w7NX4UzdZ603` |
| Customer Portal | `https://billing.stripe.com/p/login/00waEWh0S14s3xH4UzdZ600` |

## 9. The customer journey

```
Marketing entry points
  ├─ Organic search → /, /ecosystem, /nz-website-design, /tradies, /creatives, /professionals
  ├─ Referral → /one-pager (silent) or word-of-mouth → /
  └─ Direct → /

Discovery + qualification
  ├─ /pricing (cost transparency)
  ├─ /how-it-works (process)
  ├─ /portfolio (proof)
  ├─ /our-story (founder)
  └─ /faq (objection handling)

Conversion
  ├─ Contact form (/contact) → 1-business-day reply
  └─ Direct buy → Build Stripe URL

Post-payment (Stripe redirects)
  Build paid → /next-steps → /discovery-interview
  Site approved → Caretaker tier sent (/foundation, /capture, /commerce)
  Subscription paid → /subscription-confirmed → site goes live

Ongoing
  Customer portal (Stripe billing.stripe.com) for subscription management
  On-demand updates by text/email — handled by Lian
  Annual design refresh on 12-month anniversary
```

---

Last updated: May 2026
