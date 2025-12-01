# Analytics & Feedback Setup Guide

## Overview

This guide explains how to set up analytics, error reporting, and feedback collection for the California Counties Puzzle Game.

## Features

### 1. Privacy-First Analytics (Plausible)

**Why Plausible?**

- No cookies
- GDPR compliant out-of-the-box
- Lightweight (<1KB script)
- EU-hosted servers
- Open-source

**Events Tracked:**

- Game interactions (start, complete, pause)
- County placements and removals
- Touch gestures (tap, swipe, pinch)
- Hint usage
- Study mode progress
- Accessibility feature usage
- Performance metrics

### 2. Error Reporting (Sentry)

**Features:**

- Automatic error capture
- Stack traces
- Breadcrumb tracking
- Session replay
- Performance monitoring

### 3. Feedback Widget

**Features:**

- In-game feedback form
- Screenshot capture
- Category selection
- Email submission

## Setup Instructions

### Step 1: Create Plausible Account

1. Sign up at [plausible.io](https://plausible.io) (or self-host)
2. Add your website domain
3. No API key needed! Plausible works without authentication

### Step 2: Create Sentry Account (Optional)

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project
3. Copy your DSN (looks like: `https://xxx@sentry.io/xxx`)

### Step 3: Configure Environment Variables

Create `.env.local` file:

```bash
# Plausible Analytics
VITE_ANALYTICS_DOMAIN=your-domain.com

# Sentry Error Reporting (Optional)
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx

# Feedback Endpoint
VITE_FEEDBACK_ENDPOINT=https://your-api.com/feedback
```

### Step 4: Install Dependencies

```bash
# Sentry SDK (optional)
npm install @sentry/react

# Screenshot capture for feedback (optional)
npm install html2canvas
```

### Step 5: Deploy

Analytics and error reporting will automatically initialize based on your environment variables.

## Self-Hosted Analytics

### Option 1: Self-Hosted Plausible

```bash
# Using Docker
docker run -d \
  --name plausible \
  -p 8000:8000 \
  -v plausible-data:/var/lib/plausible \
  plausible/analytics:latest
```

Update `.env.local`:

```bash
VITE_ANALYTICS_API_HOST=https://your-plausible-instance.com
```

### Option 2: Umami Analytics

```bash
# Using Docker
docker run -d \
  --name umami \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  ghcr.io/umami-software/umami:latest
```

### Option 3: No Analytics

Leave environment variables empty. The game works perfectly without analytics!

## Custom Feedback Endpoint

### Option 1: Netlify Function

Create `netlify/functions/feedback.js`:

```javascript
exports.handler = async (event) => {
  const feedback = JSON.parse(event.body);

  // Send email via SendGrid, Mailgun, etc.
  await sendEmail({
    to: 'feedback@yourdomain.com',
    subject: `Feedback: ${feedback.category}`,
    body: feedback.message,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};
```

### Option 2: Vercel API Route

Create `api/feedback.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const feedback = req.body;

  // Process feedback
  await saveFeedback(feedback);

  res.status(200).json({ success: true });
}
```

### Option 3: Email Direct (No Backend)

Use [Formspree](https://formspree.io/) or [EmailJS](https://www.emailjs.com/):

```bash
VITE_FEEDBACK_ENDPOINT=https://formspree.io/f/YOUR_FORM_ID
```

## Event Tracking Examples

### Track Game Start

```typescript
import { trackEvent, AnalyticsEvent } from './services/analytics';

function startGame() {
  trackEvent(AnalyticsEvent.GAME_START, {
    difficulty: 'easy',
    mode: 'classic',
  });

  // Start game logic...
}
```

### Track Touch Gesture

```typescript
function handleSwipe(direction: string) {
  trackEvent(AnalyticsEvent.SWIPE_GESTURE, {
    direction,
    element: 'county-card',
  });
}
```

### Track Accessibility Feature

```typescript
function enableHighContrast() {
  trackEvent(AnalyticsEvent.HIGH_CONTRAST_ENABLED, {
    source: 'settings-menu',
  });
}
```

## Funnel Tracking

Funnels help identify where users drop off:

```typescript
import { trackFunnel, FunnelStage } from './services/analytics';

// Game load
trackFunnel(FunnelStage.GAME_LOAD);

// First interaction
trackFunnel(FunnelStage.GAME_START);

// Progress milestones
trackFunnel(FunnelStage.FIRST_COUNTY_PLACED);
trackFunnel(FunnelStage.HALF_COMPLETE);
trackFunnel(FunnelStage.GAME_COMPLETE);
```

## Performance Monitoring

```typescript
import { usePerformanceMonitoring } from './hooks/usePerformanceMonitoring';

function GameComponent() {
  const { metrics, measureInteraction } = usePerformanceMonitoring({
    enableFpsMonitoring: true,
    fpsThreshold: 30,
  });

  const handleCountyPlace = async () => {
    await measureInteraction('county_placement', async () => {
      // Place county logic
    });
  };

  return (
    <div>
      <div>FPS: {metrics.fps}</div>
      {/* Game UI */}
    </div>
  );
}
```

## Privacy Compliance

### GDPR Checklist

- ✅ Cookie consent banner
- ✅ Clear privacy policy
- ✅ Easy opt-out mechanism
- ✅ No personal data collection
- ✅ Data processing transparency
- ✅ User rights (access, deletion)

### CCPA Checklist

- ✅ Privacy notice
- ✅ Opt-out option
- ✅ No sale of personal data
- ✅ Non-discrimination policy

## Testing

### Test Analytics Locally

```bash
# Enable analytics in development
VITE_DEV_ANALYTICS=true npm run dev
```

### Test Error Reporting

```typescript
// Trigger test error
throw new Error('Test error for Sentry');
```

### Test Feedback Widget

1. Click feedback button
2. Fill out form
3. Check console for submission
4. Verify endpoint receives data

## Monitoring

### Plausible Dashboard

- **Real-time visitors**
- **Top pages**
- **Event breakdown**
- **Conversion funnels**

### Sentry Dashboard

- **Error trends**
- **Affected users**
- **Performance issues**
- **Release tracking**

## Cost Estimates

### Plausible (Paid)

- **Free**: Self-hosted
- **Cloud**: $9/month (up to 10k pageviews)

### Sentry (Paid)

- **Free Tier**: 5k errors/month
- **Team**: $26/month (50k errors/month)

### Alternatives (Free)

- **Umami**: Free (self-hosted)
- **Matomo**: Free (self-hosted)
- **Simple Analytics**: Free tier available

## Troubleshooting

### Analytics not tracking

1. Check consent is granted
2. Verify domain in Plausible settings
3. Check browser console for errors
4. Ensure script loads (Network tab)

### Sentry not capturing errors

1. Check DSN is correct
2. Verify error reporting consent
3. Check Sentry quota limits
4. Review beforeSend filter

### Feedback not submitting

1. Check endpoint URL
2. Verify CORS settings
3. Check network console
4. Test endpoint directly

## Best Practices

1. **Minimal Data**: Only track what you need
2. **User Consent**: Always get opt-in consent
3. **Transparency**: Explain what you track
4. **Easy Opt-Out**: One-click disable
5. **Regular Audits**: Review collected data quarterly
6. **Documentation**: Keep this guide updated

## Resources

- [Plausible Docs](https://plausible.io/docs)
- [Sentry Docs](https://docs.sentry.io/)
- [GDPR Compliance](https://gdpr.eu/)
- [CCPA Overview](https://oag.ca.gov/privacy/ccpa)
- [Web Analytics Guide](https://www.smashingmagazine.com/2020/07/privacy-focused-web-analytics/)

## Support

- **Documentation**: This file
- **Issues**: GitHub Issues
- **Email**: support@example.com
