# SAFETY EXTRACTION — YourHQ Website
**Document type:** Masters thesis safety design audit
**Compiled:** March 2026
**Auditor:** Claude Code (automated extraction from codebase + git history)
**Working directory:** `/Users/boss/yourhq-website`

---

## 1. PROJECT IDENTITY

**Project name:** YourHQ Website

**What it does:** A founder-led website design and hosting service targeting New Zealand small businesses, offering tiered packages (Starter, Launch, Growth) that include an AI-powered voice interview ("The Drive-Home Interview") to gather business content for website builds.

**Who the users are:** Kiwi small business owners — tradies (electricians, plumbers, builders), creatives, and independent professionals purchasing a website service. They are post-transaction users (they have already paid via Stripe) who are asked to speak with an AI agent about their business story.

**Vulnerability level:** LOW-to-MODERATE. This is a B2B service context rather than a therapeutic or research context. The emotional stakes for users are:
- Mild vulnerability: users are sharing their personal business story, origin narrative, and professional identity
- Some sensitivity in questions like "Why did you go independent?" and "What do your best customers say about you?" — these invite personal disclosure
- No clinical, grief, trauma, or mental health content is solicited or expected
- Financial vulnerability exists (user has just paid; fear of wasted money is a real stressor)
- No explicit targeting of Māori, Pasifika, or other culturally vulnerable groups, though language choices suggest a broad NZ audience including these communities

**Date range built:** Commits span up to March 2026 (last privacy policy update: March 2026; fair use policy: March 2, 2026)

**Tech stack:**
| Layer | Technology |
|---|---|
| Frontend framework | Astro 5.16.4 (static site generation) |
| UI components | React 19.2.1 |
| Styling | Tailwind CSS 3.4.18 |
| AI voice agent | ElevenLabs ConvAI (`@elevenlabs/react` ^0.12.1) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Payments | Stripe (webhook via Supabase Edge Function) |
| Hosting | Vercel (global edge network) |
| Analytics | Google Analytics (G-F9GHN7JTE2), Facebook Pixel (2047022552508111) |
| Notifications | ntfy.sh (internal push notifications) |
| Runtime (backend) | Deno (Supabase Edge Functions) |

---

## 2. SYSTEM PROMPTS & AI INSTRUCTIONS

### 2.1 Finding: The ElevenLabs Agent System Prompt Is NOT In This Codebase

**This is the most important finding in this section.**

The AI agent used in this project (ElevenLabs ConvAI, agent ID: `agent_8801kbr4e3s1f32vwgejq4wdcezp`) is configured entirely within the ElevenLabs platform dashboard. **No system prompt, persona definition, or AI instruction text exists anywhere in this repository.**

The codebase only contains:
1. The agent ID (a reference string)
2. The HTML embed code and React SDK calls to launch the agent
3. A documentation file describing the *intended* behaviour (not the actual prompt)

This means the actual instructions governing what the AI says, how it handles edge cases, what it avoids, and how it closes conversations are **invisible to this audit** without ElevenLabs dashboard access.

---

### 2.2 The ElevenLabs Widget Embed (All Confirmation Pages + Discovery Interview)

**File paths where agent is embedded:**
- `src/pages/discovery-interview.astro` (line 131)
- `src/pages/confirmation-launch.astro` (line 210)
- `src/pages/confirmation-growth.astro` (equivalent lines)
- `src/pages/confirmation-starter.astro` (equivalent lines)
- `src/pages/confirmation-refresh.astro` (equivalent lines)

**Exact embed code (from `src/pages/confirmation-launch.astro`, lines 210–211):**
```html
<elevenlabs-convai agent-id="agent_8801kbr4e3s1f32vwgejq4wdcezp"></elevenlabs-convai>
<script is:inline src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
```

No dynamic prompt injection or system message override is passed into the widget at call time. The agent ID alone determines all behaviour — configuration lives on ElevenLabs servers.

---

### 2.3 The VoiceAgent React Component (Custom Implementation)

**File path:** `src/components/VoiceAgent.jsx`
**Note:** This is a *second* integration method using the ElevenLabs React SDK — distinct from the HTML widget embed above. It appears on some pages. The same agent ID is used.

**Full component code:**
```jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';

export default function VoiceAgent({ agentId, staticPlan, staticName }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [urlParams, setUrlParams] = useState({ name: '', plan: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setUrlParams({
        name: params.get('name') || params.get('customer_name') || staticName || '',
        plan: params.get('plan') || params.get('package') || staticPlan || '',
      });
    }
  }, [staticName, staticPlan]);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to YourHQ Assistant');
    },
    onDisconnect: () => {
      console.log('Disconnected from YourHQ Assistant');
      setHasPermission(false);
    },
    onMessage: (message) => {
      console.log('Message:', message);
    },
    onError: (error) => {
      console.error('VoiceAgent Error:', error);
      setHasPermission(false);
    },
  });

  const { status, isSpeaking } = conversation;

  const requestMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      return true;
    } catch (err) {
      console.error('Mic permission denied:', err);
      alert('Please allow microphone access to start the interview.');
      return false;
    }
  };

  const toggleConversation = useCallback(async () => {
    if (status === 'connecting' || status === 'disconnecting') {
      console.log('Connection in progress, please wait...');
      return;
    }

    if (status === 'connected') {
      try {
        await conversation.endSession();
      } catch (error) {
        console.error('Error ending session:', error);
      } finally {
        setHasPermission(false);
      }
    } else {
      const permitted = await requestMic();
      if (permitted) {
        try {
          console.log('Starting session with agent ID:', agentId);
          await conversation.startSession({
            agentId: agentId,
          });
          console.log('Session started successfully');
        } catch (error) {
          console.error('Failed to start session:', error);
          alert('Failed to connect to the voice agent. Please check your internet connection and try again.');
          setHasPermission(false);
        }
      }
    }
  }, [conversation, status, agentId]);

  // ... (render JSX, status indicators, start/end button)
}
```

**Code comments explaining design rationale:** None beyond `console.log` debug messages. No inline comments explaining safety choices.

---

### 2.4 Intended AI Behaviour (Documented in AI_AGENT_PERSONALIZATION.md)

**File path:** `AI_AGENT_PERSONALIZATION.md`

This file documents intended (not enforced-in-code) AI behaviour. Full relevant text:

```markdown
# AI Agent Personalization - Implementation Summary

## How It Works

### 2. Personalized Greeting
The AI agent greets customers by name:
- **With name**: "Kia ora John Smith! Thanks for choosing the Launch package..."
- **Without name**: "Kia ora! Thanks for choosing YourHQ... Before we dive in, what's your name?"

### 3. Package-Specific Questions
The agent adjusts its interview questions based on the package:

**Starter** (One-page site):
- Keeps it short and focused
- Essential info only: business name, services, contact details

**Launch** (5-page site):
- Standard 15-minute interview
- Services, customers, service areas, differentiators

**Growth** (Premium site):
- Comprehensive 18-20 minute interview
- Everything from Launch plus: booking system needs, blog topics, Instagram integration
```

**Why it was written this way:** The file describes a personalization system, not a safety system. No rationale is given for the greeting language choice ("Kia ora") — it appears as a default design choice, not a documented cultural decision.

---

### 2.5 User-Facing Instructions That Frame AI Behaviour

**File path:** `src/pages/discovery-interview.astro` (lines 50–88)

The page frames the AI interaction for users before they start. This is the closest thing in the codebase to a "pre-conversation safety protocol":

```html
<h2>What this is</h2>
<p>
  You're about to speak with the <strong>YourHQ Assistant</strong> — an AI interview tool
  trained to capture your business details and story for your website. This isn't a live call.
  It takes about 10–15 minutes.
</p>

<h2>Before you start</h2>
<ul>
  <li>Find a reasonably quiet spot (car with windows up is perfect).</li>
  <li>Don't overthink it — speak naturally, like you're telling a friend about your business.</li>
  <li>Tap the blue button in the bottom right corner to begin.</li>
</ul>

<!-- Privacy Notice (Micro-copy) -->
<div class="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
  <p>
    <strong>Privacy Notice:</strong> By starting, you consent to your voice being recorded
    and processed to generate website copy. We don't clone voices. We don't sell data.
  </p>
</div>
```

**Note:** The privacy notice is styled in `text-xs text-gray-400` — the smallest font size and lightest colour in the Tailwind configuration. It is visually de-emphasised relative to the rest of the page.

---

## 3. SAFETY MECHANISMS

### 3.1 Conversation Boundaries

**What topics the AI avoids or redirects:** Unknown — not encoded in this codebase. The ElevenLabs agent system prompt (dashboard-only) would define this. Based on code context, the agent is scoped to business information gathering (business name, services, story, customers, visuals, pricing). There is no in-code mechanism to detect, block, or redirect off-topic conversation.

**Keyword triggers or sentiment detection:** None found in the codebase.

**What happens when users go off-topic or into distress:** No handler exists in code. The `onMessage` callback in `VoiceAgent.jsx` only logs to console (`console.log('Message:', message)`). No message content is evaluated client-side for safety signals.

**Escalation paths:** One human fallback is provided — not triggered by the AI, but offered as a static alternative on the page:

```html
<!-- From src/pages/discovery-interview.astro, line 93 -->
<p>Need help? Text us at <span class="text-carbon font-bold">022 172 5793</span></p>

<!-- From src/pages/confirmation-launch.astro, lines 179–186 -->
<a href="sms:0221725793">Text: 022 172 5793</a>
<a href="mailto:hello@yourhq.co.nz">Email Us</a>
```

This is an *alternative channel*, not a crisis escalation path. It is not surfaced dynamically based on user distress.

---

### 3.2 Opening and Closing Protocols

**How the conversation starts:**

1. User lands on a confirmation page or `discovery-interview.astro` after payment
2. Page displays static instructions (text, not interactive)
3. A single-sentence privacy notice appears (in small grey text)
4. User taps a button labelled "Start Interview"
5. Browser requests microphone permission (`navigator.mediaDevices.getUserMedia`)
6. On permission grant, ElevenLabs session starts
7. Agent greets by name if URL parameter is present: `"Kia ora, [Name]. Ready for your interview?"`

There is no:
- Informed consent checkbox or click-through
- Explanation of how long data is retained
- Option to proceed anonymously
- Warm-up or settling period before substantive questions begin

**How the conversation ends:**

The conversation ends when:
1. User taps "End Interview" button (explicit user action), OR
2. ElevenLabs session times out or disconnects

On end, the `elevenlabs-convai:call-ended` event fires and an ntfy.sh notification is sent to the operator:

```javascript
// src/pages/confirmation-launch.astro, lines 213–229
widget.addEventListener('elevenlabs-convai:call-ended', () => {
  const name = new URLSearchParams(window.location.search).get('name');
  const message = name
    ? `${name.charAt(0).toUpperCase() + name.slice(1)} just completed their discovery interview. (Launch)`
    : 'Someone just completed their discovery interview. (Launch)';
  fetch('https://ntfy.sh/yourhq-discovery', {
    method: 'POST',
    body: message,
    headers: { 'Title': 'Discovery Interview Completed', 'Priority': 'high', 'Tags': 'tada' },
  }).catch(() => {});
});
```

There is no:
- Closing ritual or summary read back to user
- Thank-you message generated by the AI at conversation end (may exist in ElevenLabs prompt, but not confirmed in code)
- Next-steps guidance provided at conversation end
- UI state change after interview completes (the page does not update to confirm completion)

**Is there a consent flow before the conversation begins?**
Partial. The privacy notice (`src/pages/discovery-interview.astro`, line 82–86) states "By starting, you consent..." — this is implied/passive consent, not an active consent mechanism. The user does not click "I agree" or confirm they have read the notice. The act of pressing "Start Interview" is treated as consent.

---

### 3.3 Emotional Safety

**How the AI handles distress, crying, anger, or silence:** Not addressed anywhere in the codebase. No detection, no fallback, no escalation path.

**Check-in mechanisms during conversation:** None. The conversation is a single uninterrupted session. There is no pause prompt, no mid-interview check-in, and no ability for the operator to monitor in real time.

**Pause or stop capability:** Yes — the "End Interview" button is always visible during a session. The button is rendered in `hibiscus` (pink) colour when active and labelled "End Interview" clearly. This provides a visible, immediate exit mechanism.

```jsx
// src/components/VoiceAgent.jsx — end session handler
if (status === 'connected') {
  try {
    await conversation.endSession();
  } catch (error) {
    console.error('Error ending session:', error);
  } finally {
    setHasPermission(false);
  }
}
```

**Crisis resources:** None. No mental health resources, crisis lines (e.g., Lifeline NZ: 0800 543 354), or referral pathways are present anywhere in the codebase, including the privacy policy, legal page, or any UI component.

---

### 3.4 Data Handling

**Where conversation data is stored:**
- Voice audio and transcripts are processed and stored by ElevenLabs (third-party)
- Form submission data is stored in Supabase (`leads` table)
- Payment data is handled by Stripe (never stored by YourHQ)
- Operator notifications are sent via ntfy.sh (third-party push notification service)

**Supabase configuration:**
```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
)
```

The anonymous key is used for public form submissions. This key is also present in `.env.local` (which is NOT listed in `.gitignore` — see Section 4: Gaps).

**Row Level Security (RLS):** Referenced in the privacy policy (`src/pages/privacy.astro`, line 54): "We implement **Row Level Security (RLS)** policies, meaning your data is cryptographically segregated." However, **no RLS migration files, SQL schema, or policy definitions exist in this repository**. The Supabase schema is managed externally via the Supabase dashboard or migrations not committed here.

**Encryption:** Supabase default encryption at rest; Stripe PCI DSS Level 1. No additional encryption layer is implemented in application code.

**Can users delete their data?**
The privacy policy states (line 91): "Request that your data be deleted from our servers (subject to us needing to keep billing records for tax purposes)." The mechanism for requesting deletion is by email to the Privacy Officer (`hello@yourhq.co.nz`). There is no self-service deletion UI or automated deletion workflow in the codebase.

**Data region / sovereignty:**
- Supabase project URL: `https://ysfdezkuujkjakifrlhd.supabase.co` (region not determinable from URL alone; Supabase NZ region is `ap-southeast-2`)
- Vercel: global edge network (not NZ-specific)
- ElevenLabs: data centre location not specified in privacy policy
- No explicit statement that data is hosted in New Zealand or Australia

**Who has access:**
- Business owner (Lian/YourHQ Limited)
- Supabase admins (authenticated users per RLS policy)
- ElevenLabs (voice data)
- Stripe (payment data)
- ntfy.sh (notification messages including customer names)
- Vercel (static file hosting, no user data beyond access logs)

---

### 3.5 Cultural Safety

**Te reo Māori usage:**

| Term | Meaning | Where used | Context |
|---|---|---|---|
| `Kia ora` | Hello / Thank you | `AI_AGENT_PERSONALIZATION.md`, `discovery-interview.astro` (line 143) | AI greeting |
| `korero` | Conversation / talk | `confirmation-launch.astro` (line 73), `confirmation-growth.astro` | Used as noun: "have a korero with our AI Agent" |
| `Whangārei` | Place name (city in Northland) | Footer (multiple pages) | Company location — macron used correctly |
| `Kiwi` | New Zealander (colloquial) | Throughout — homepage, footer, meta tags | Used in phrases like "Kiwi small businesses" |

**Cultural greetings/protocols:**
"Kia ora" is used as the default AI greeting. This is a common, everyday usage across NZ society — it is not ceremonial or protocol-specific. No karakia (prayer/incantation), mihimihi (greeting speech), or formal cultural protocols are incorporated.

**Acknowledgment of researcher/kaupapa:**
None. There is no positionality statement, no acknowledgment of the cultural context of the research, and no reference to kaupapa Māori methodology in the codebase or its documentation.

**Māori/Pasifika values referenced:**
Implicitly, the phrase "Data Sovereignty" in the privacy policy echoes Indigenous data sovereignty discourse (a prominent concept in Te Ao Māori / Pasifika data rights movements). However, this framing is applied to business data ownership rather than cultural/community data sovereignty. No explicit connection to Māori Data Sovereignty principles (e.g., Te Mana Raraunga framework) is made.

**Was te reo removed at any point?**
Git history does not contain any commits that would indicate te reo was added and then removed. The commit messages are not descriptive enough to determine this (see Section 5).

---

## 4. WHAT'S NOT THERE (GAPS)

These are safety features one might reasonably expect in a system handling voice data and personal stories, that are **absent** from this codebase:

### 4.1 No Active Consent Mechanism
The privacy notice on `discovery-interview.astro` uses implied consent ("By starting, you consent...") rendered in small grey text. Under NZ Privacy Act 2020 and best practice for voice data collection, an active acknowledgment (checkbox, click-through, or explicit "I agree") would be expected. This is especially notable given that voice data is categorised as biometric-adjacent.

### 4.2 No System Prompt in the Repository
The most significant safety-relevant document — the ElevenLabs agent system prompt that governs AI behaviour, topic scope, escalation, and closing ritual — is entirely outside version control. There is no way to audit, version, or review changes to the AI's instructions from this codebase alone.

### 4.3 No Crisis Resources
No crisis line numbers, mental health references, or emergency contacts are present anywhere in the codebase. The business information interview could, in principle, surface personal distress (e.g., a business owner discussing why they went independent following redundancy or illness). No protocol exists for this.

### 4.4 No Content Moderation or Topic Boundaries in Code
There are no keyword filters, sentiment classifiers, or topic restriction mechanisms applied to conversation content at the application layer. All content decisions are delegated to the ElevenLabs platform.

### 4.5 No Mid-Session Wellbeing Check
There is no pause capability initiated by the AI, no mid-session check ("How are you going? Want to take a break?"), and no monitoring of session duration to flag unusually long or potentially distressing conversations.

### 4.6 No Transcript Review Workflow
No UI, notification, or workflow exists for the operator to review voice transcripts before using them for website copy. The operator is notified that an interview completed (via ntfy.sh), but has no in-platform view of transcript content.

### 4.7 Self-Service Data Deletion Not Available
Data deletion requires contacting the Privacy Officer by email. There is no API endpoint, user portal, or automated deletion workflow. Users cannot self-serve.

### 4.8 No Data Region Guarantee
The privacy policy does not specify in which AWS/Supabase region data is stored. For a NZ-based service invoking data sovereignty language, the absence of a regional data storage commitment (e.g., "Data stored in ap-southeast-2 Sydney") is a gap.

### 4.9 `.env.local` Not in `.gitignore`
The `.gitignore` file lists `.env` and `.env.production` but **not** `.env.local`. The file `.env.local` contains the Supabase URL and anonymous key. While the anon key is designed to be public (it is scoped by RLS), committing it to version control creates a permanent record and signals a weak secrets management practice.

### 4.10 No Accessibility or Inclusive Design for AI Interaction
There is no text-only fallback described as equivalent to the voice interview (the written form exists but is described as "option B"). No guidance exists for users who may have speech impediments, language barriers (e.g., English as a second language), or hearing impairments.

### 4.11 No Age or Capacity Verification
The interview is positioned as a post-payment onboarding step. No mechanism verifies that the person completing the interview is the account holder or has capacity to consent.

---

## 5. DESIGN DECISIONS LOG

### 5.1 Git Log — Safety-Related Commits

Command run: `git log --all --oneline --grep="safe" --grep="crisis" --grep="consent" --grep="boundary" --grep="protocol" --grep="trigger" --grep="escalat" --grep="privacy" --grep="delete" --grep="sovereign"`

**Result: No matching commits found.**

This means none of the safety-related design decisions (privacy notice wording, consent approach, voice data handling, te reo usage) were captured in git commit messages.

### 5.2 Full Git Log (Most Recent 20 Commits)
```
e11de39 "lian"
8be7940 "update"
6d0126d "dne"
bb64cd5 "update"
bbff711 "update"
8ef8623 Fix JSX syntax error in DiscoveryForm placeholder string
66c68a6 "update"
81651bf "send"
5ca409a "update"
5e3927b "x"
5ed4c50 "f"
98360d6 "udpate"
bc10771 "update"
2b5e510 "update"
e0ea1bb "x"
e685b06 "f"
c63f3af "g"
3b86ddc "update"
f23b129 "llms"
da4fe76 "s"
```

**Observation:** Commit messages are almost entirely non-descriptive single words ("update", "x", "f", "g", "dne", "lian"). The one exception is `8ef8623 Fix JSX syntax error in DiscoveryForm placeholder string` — a technical bug fix. No design rationale, safety decisions, or iteration history is captured in git history.

### 5.3 Code Comments Related to Safety

Searched all source files for safety-related comments. **None found.** No `// TODO: safety`, `// FIXME: consent`, or explanatory comments about why design choices were made appear anywhere in the codebase.

### 5.4 Documentation Files

**AI_AGENT_PERSONALIZATION.md** contains one relevant sentence under "Support":
> "If you notice the agent not using names or asking wrong package questions: [troubleshooting steps]"

This is a technical troubleshooting note, not a safety design decision.

**STRIPE_SETUP.md** describes URL parameter configuration. No safety content.

**README.md** is the default Astro starter readme. No project-specific content.

---

## 6. USER-FACING SAFETY COPY

### 6.1 Privacy Notice (Micro-copy — Discovery Interview Page)

**File:** `src/pages/discovery-interview.astro` (lines 82–86)
**Visual weight:** `text-xs text-gray-400` (smallest size, lightest colour)

```
Privacy Notice: By starting, you consent to your voice being recorded and processed to
generate website copy. We don't clone voices. We don't sell data.
```

### 6.2 Privacy Policy Page

**File:** `src/pages/privacy.astro`
**URL:** `/privacy`
**Accessible from:** Footer link (all pages)

**Key user-facing text (verbatim):**

> YourHQ operates under the New Zealand Privacy Act 2020. Beyond legal compliance, our core philosophy is **Data Sovereignty**: We are the caretakers of your digital assets, but you remain the owner.

> **ElevenLabs:** Used for our AI Interview Agent. Your voice data is processed solely to transcribe information for your website build. We do not use your voice to clone your identity.

> **When you speak with our AI Agent (Lian's Digital Voice):**
> - The conversation is recorded and transcribed to generate website copy.
> - These recordings are stored securely within our private logs.
> - We do not share these recordings with third parties for marketing purposes.

> **Under the NZ Privacy Act, you have the right to:**
> - Ask for a copy of any personal information we hold about you.
> - Ask for it to be corrected if you think it is wrong.
> - Request that your data be deleted from our servers (subject to us needing to keep billing records for tax purposes).

**Privacy Officer Contact:**
```
YourHQ Limited
Email: hello@yourhq.co.nz
Phone: 022 172 5793
Northland, New Zealand
Last updated: March 2026
```

### 6.3 Terms & FAQ Page

**File:** `src/pages/legal.astro`
**URL:** `/legal`

Key user-facing statements relating to safety and rights:

> "You own your domain, content, and design from day one."

> "No lock-in contracts. You can cancel anytime with 30 days' notice. You keep your domain, content, and design — we'll help you move to any provider you choose."

> "We will never charge you extra without discussing it first."

> "No surprises. No bill shock. You're always in control."

**The "Love Your Launch" Guarantee (Refund policy):**
> "We send you a private preview link on Day 5. If you don't love it, you can request a refund of your setup fee before the site goes live."

### 6.4 Error Messages / Fallback Responses

**Microphone permission denied (VoiceAgent.jsx, line ~40):**
```javascript
alert('Please allow microphone access to start the interview.');
```

**Connection failure (VoiceAgent.jsx, line ~57):**
```javascript
alert('Failed to connect to the voice agent. Please check your internet connection and try again.');
```

Both are native browser `alert()` dialogs. No custom styling, no empathetic framing, no alternative pathway offered.

**Honeypot bot detection (all form components):**
Silent success is returned to the bot. No user-facing message. Human users never see this path.

### 6.5 Confirmation Page Framing Copy

**File:** `src/pages/confirmation-launch.astro` (line 73)

> "Scroll down to have a korero with our AI Agent. It'll ask you about your business, capture your story, and gather everything we need to build your site."

> "Takes 15 minutes max"
> "You can do this on your drive home, during lunch, or anytime that suits."

The framing normalises the AI interaction as casual and low-stakes. The word "korero" (conversation/chat in te reo Māori) softens the transactional nature of the data collection.

### 6.6 Discovery Interview Framing Copy

**File:** `src/pages/discovery-interview.astro` (lines 31–36)

> "No forms. No typing. Just talk.
> Your digital assistant is ready to capture what makes your business you."

This positions the AI as a tool that serves the user's self-expression, not one that interrogates them. The phrase "what makes your business you" invites personal/identity-level disclosure.

---

## APPENDIX A: COMPLETE FILE INVENTORY OF SAFETY-RELEVANT FILES

| File | Relevance |
|---|---|
| `src/pages/discovery-interview.astro` | Primary AI interaction page; privacy notice; opening protocol |
| `src/pages/confirmation-launch.astro` | Post-payment AI interview; session end notification |
| `src/pages/confirmation-growth.astro` | Post-payment AI interview (Growth tier) |
| `src/pages/confirmation-starter.astro` | Post-payment AI interview (Starter tier) |
| `src/pages/confirmation-refresh.astro` | Post-payment AI interview (Refresh tier) |
| `src/pages/privacy.astro` | Privacy policy; data sovereignty; voice data handling; user rights |
| `src/pages/legal.astro` | Terms of trade; refund policy; fair use |
| `src/components/VoiceAgent.jsx` | AI session lifecycle management; mic permission; error handling |
| `src/lib/supabase.js` | Database client configuration |
| `src/lib/notify.js` | ntfy.sh notification utility |
| `supabase/functions/stripe-webhook/index.ts` | Payment webhook; signature verification |
| `AI_AGENT_PERSONALIZATION.md` | Documented (not enforced) AI behaviour spec |
| `.env.local` | Contains Supabase credentials (not in .gitignore) |

---

## APPENDIX B: EXTERNAL SYSTEMS THAT HOLD SAFETY-RELEVANT CONFIGURATION

These systems contain safety-related configuration that is **not accessible via this codebase**:

| System | What it holds |
|---|---|
| ElevenLabs Dashboard | Full system prompt, persona definition, topic boundaries, conversation closure ritual, all AI instructions for agent `agent_8801kbr4e3s1f32vwgejq4wdcezp` |
| Supabase Dashboard | Row Level Security policies; database schema; access control rules |
| Vercel Dashboard | Deployment configuration; environment variables in production |
| Stripe Dashboard | Payment link configuration; customer data fields passed to confirmation URLs |

---

*End of SAFETY_EXTRACTION.md*
*Generated: March 23, 2026*
*All file paths are absolute within the repository `/Users/boss/yourhq-website`*
