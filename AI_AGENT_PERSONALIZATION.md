# AI Agent Personalization - Implementation Summary

## What Was Implemented

The AI voice agent on your confirmation pages now personalizes conversations based on customer name and package purchased.

## How It Works

### 1. URL Parameters
When customers are redirected from Stripe after payment, the URL includes their name and package:
```
https://yourhq.co.nz/confirmation-launch?name=John+Smith&plan=Launch
```

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

## Quick Test

To test without a real purchase, visit:
```
https://yourhq.co.nz/confirmation-launch?name=Test+User&plan=Launch
```

Then click "Start Interview" - the agent should say "Kia ora Test User!"

## What You Need to Do in Stripe

Update each Payment Link's success URL to include customer data:

### Starter Package Success URL:
```
https://yourhq.co.nz/confirmation-starter?name={CUSTOMER_NAME}&plan=Starter
```

### Launch Package Success URL:
```
https://yourhq.co.nz/confirmation-launch?name={CUSTOMER_NAME}&plan=Launch
```

### Growth Package Success URL:
```
https://yourhq.co.nz/confirmation-growth?name={CUSTOMER_NAME}&plan=Growth
```

Note: The Refresh package will be configured separately.

Stripe automatically replaces `{CUSTOMER_NAME}` with the actual customer name from checkout.

## Files Changed

1. **VoiceAgent.jsx** - Enhanced to:
   - Read name from URL (`?name=` or `?customer_name=`)
   - Read package from URL (`?plan=` or `?package=`)
   - Generate personalized greeting
   - Provide package-specific prompt context to AI

2. **PersonalizedGreeting.jsx** (NEW) - Optional component to show "Welcome, [Name]!" on page headers

3. **STRIPE_SETUP.md** (NEW) - Complete guide for configuring Stripe

## Backward Compatibility

Everything still works if URL parameters aren't provided:
- Agent will ask for the customer's name
- Uses the `staticPlan` prop from each confirmation page as fallback
- No breaking changes to existing flow

## Optional Enhancement

You can add the PersonalizedGreeting component to show the customer's name in the page header:

```astro
---
import PersonalizedGreeting from '../components/PersonalizedGreeting.jsx';
---

<h1>
  <PersonalizedGreeting
    client:only="react"
    packageName="Launch"
    fallbackGreeting="Payment Confirmed!"
  />
</h1>
```

This would show "Welcome, John Smith!" instead of "Payment Confirmed!" when a name is provided.

## Next Steps

1. ✅ Update Stripe Payment Links with new success URLs (see STRIPE_SETUP.md)
2. ✅ Test with a real purchase or use test URL
3. ⬜ (Optional) Add PersonalizedGreeting to confirmation page headers
4. ⬜ (Optional) Monitor ElevenLabs agent logs to verify personalization is working

## Support

If you notice the agent not using names or asking wrong package questions:
1. Check the URL in browser - does it have `?name=` and `?plan=`?
2. Check browser console for JavaScript errors
3. Verify Stripe success URLs are configured correctly
4. See STRIPE_SETUP.md troubleshooting section
