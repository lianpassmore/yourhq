# Stripe Payment Link Configuration

This guide explains how to configure your Stripe payment links to pass customer information (name and package) to the YourHQ confirmation pages, which will then personalize the AI agent conversation.

## Overview

When customers complete a purchase through Stripe, they should be redirected to the appropriate confirmation page with their name and package information in the URL. This allows:

1. Personalized greeting on the confirmation page
2. AI agent to use their name in the conversation
3. AI agent to ask package-specific questions

## Step-by-Step Setup

### 1. Update Stripe Payment Links

For each payment link in Stripe, you need to configure the success URL to include customer data.

#### Current Payment Links (from pricing.astro):
- **Starter Package**: `https://buy.stripe.com/dRmbJ0cKC6oMecl2Mr`
- **Launch Package**: `https://buy.stripe.com/00waEWh0S14s3xH4Uz`
- **Growth Package**: `https://buy.stripe.com/fZu9ASdOG5kI7NXbiX`

### 2. Configure Success URLs in Stripe Dashboard

Go to each Payment Link in Stripe and update the "After payment" settings:

#### For Starter Package:
```
https://yourhq.co.nz/confirmation-starter?name={CUSTOMER_NAME}&plan=Starter
```

#### For Launch Package:
```
https://yourhq.co.nz/confirmation-launch?name={CUSTOMER_NAME}&plan=Launch
```

#### For Growth Package:
```
https://yourhq.co.nz/confirmation-growth?name={CUSTOMER_NAME}&plan=Growth
```

#### For Refresh Package:
```
https://yourhq.co.nz/confirmation-refresh?name={CUSTOMER_NAME}&plan=Refresh
```

### 3. Stripe Variable Substitution

Stripe will automatically replace `{CUSTOMER_NAME}` with the customer's name from the checkout form.

**Available Stripe variables:**
- `{CUSTOMER_NAME}` - Customer's full name
- `{CUSTOMER_EMAIL}` - Customer's email address
- `{CHECKOUT_SESSION_ID}` - Unique session ID

### 4. How It Works

When a customer named "John Smith" purchases the Launch package:

1. They complete payment on Stripe
2. Stripe redirects them to: `https://yourhq.co.nz/confirmation-launch?name=John+Smith&plan=Launch`
3. The confirmation page loads
4. The VoiceAgent component reads the URL parameters
5. When they click "Start Interview", the AI agent greets them:
   > "Kia ora John Smith! Thanks for choosing the Launch package. I'm Lian's AI assistant..."

### 5. Testing

To test without making a real purchase:

1. Navigate directly to: `https://yourhq.co.nz/confirmation-launch?name=Test+User&plan=Launch`
2. Click the "Start Interview" button
3. The AI should greet you by name

## URL Parameter Support

The VoiceAgent component accepts multiple parameter formats:

- `?name=John+Smith` (preferred)
- `?customer_name=John+Smith` (alternative)
- `?plan=Launch` (preferred)
- `?package=Launch` (alternative)

## Package Names

Use these exact package names in the URLs:
- `Starter` - One-page website
- `Launch` - 5-page website for tradies/retail
- `Growth` - Premium website with booking system
- `Refresh` - Annual refresh for existing clients

## AI Agent Behavior by Package

### Starter Package
- Focuses on essential information only
- Shorter interview (10-12 minutes)
- Questions: Business name, what you do, contact info, service areas

### Launch Package
- Standard interview (15 minutes)
- Questions: Services, target customers, service areas, differentiators, photo sources

### Growth Package
- Comprehensive interview (18-20 minutes)
- Questions: Everything from Launch, plus booking system needs, blog topics, Instagram integration

### Refresh Package
- Focuses on what's changed
- Questions: New services, team changes, visual updates, new photos

## Fallback Behavior

If no name is provided:
- AI will ask for the customer's name first
- Then proceed with package-specific questions

If no package is provided:
- AI will use the `staticPlan` prop from the component (already configured in confirmation pages)

## Troubleshooting

### Name not appearing in greeting
1. Check the URL in the browser address bar - is `?name=` present?
2. Check browser console for errors
3. Verify Stripe payment link has the correct success URL with `{CUSTOMER_NAME}`

### Wrong package questions being asked
1. Check the URL parameter: `?plan=` should match the package name exactly
2. Verify the `staticPlan` prop in the confirmation page's VoiceAgent component

### AI not using the custom prompt
1. The ElevenLabs agent configuration may override custom prompts
2. Check the agent configuration in the ElevenLabs dashboard
3. Ensure the agent ID is correct in each confirmation page

## Files Modified

- `/src/components/VoiceAgent.jsx` - Enhanced to read URL parameters and customize greeting
- `/src/components/PersonalizedGreeting.jsx` - New component for displaying user name on page
- `/src/pages/confirmation-*.astro` - All confirmation pages use VoiceAgent with staticPlan

## Next Steps (Optional Enhancements)

1. **Use PersonalizedGreeting component**: Add the PersonalizedGreeting component to confirmation page headers to show "Welcome, [Name]!" instead of generic text
2. **Capture additional data**: Add email parameter for pre-filling contact forms
3. **Track in analytics**: Log successful parameter passing for debugging
4. **Zapier integration**: Send customer data to other systems (CRM, email marketing)

## Example Implementation

Here's how the Starter confirmation page currently uses VoiceAgent:

```astro
<VoiceAgent
    client:only="react"
    agentId="agent_8801kbr4e3s1f32vwgejq4wdcezp"
    staticPlan="Starter"
/>
```

To add name support, update to:

```astro
<VoiceAgent
    client:only="react"
    agentId="agent_8801kbr4e3s1f32vwgejq4wdcezp"
    staticPlan="Starter"
    staticName=""
/>
```

The component will automatically check URL parameters first, then fall back to staticName/staticPlan if URL params aren't present.
