# Privacy Policy

**Last Updated: October 16, 2025**

## Introduction

California Counties Puzzle Game ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you use our game.

**TL;DR:** We use **anonymous accounts** by default (no email/password required). Your game data is encrypted and only visible to you. You can delete your account anytime.

## Information We Collect

### Account & Game Data (Supabase Cloud Storage) ⭐ NEW

**Anonymous Account (Created Automatically):**

When you first play, we automatically create an **anonymous account** for you (no email or password required):

**What We Store:**

- **Anonymous User ID** - Random UUID (e.g., `a1b2c3d4-...`), not linked to you personally
- **Game Progress** - Scores, counties completed, achievements unlocked
- **Settings** - Sound preferences, difficulty level, theme choice
- **Session Data** - Game start/end times, accuracy, hints used

**What We DON'T Store:**

- ❌ **No email address** (unless you upgrade to a real account)
- ❌ **No password** (anonymous accounts don't have passwords)
- ❌ **No name or personal information**
- ❌ **No payment details** (game is free)
- ❌ **No location data**

**Security:**

- ✅ **Encrypted in transit** (HTTPS/TLS 1.3)
- ✅ **Encrypted at rest** (PostgreSQL encryption)
- ✅ **Row-Level Security** - You can only see your own data, even if someone gets our API key
- ✅ **Auto-session refresh** - Tokens refresh automatically, you stay logged in

**Data Location:** Hosted on Supabase (https://supabase.com/privacy)

**Upgrade to Real Account (Optional):**
If you want to sync across devices or keep your progress long-term, you can upgrade to a real account (requires email). This is **completely optional**.

### Analytics Data (Optional)

If you consent, we collect anonymous usage analytics through Plausible Analytics:

- **Game Interactions**: County placements, hints used, game completions
- **Touch Gestures**: Tap, swipe, pinch-zoom events (no personal data)
- **Performance Metrics**: FPS, load times, Core Web Vitals
- **Device Information**: Screen size, browser type (anonymized)
- **Accessibility Features**: Which features are used (to improve them)

**What we DON'T collect:**

- Personal information (name, email, phone)
- IP addresses (anonymized automatically)
- Cookies
- Cross-site tracking data
- Location data
- User accounts or identifiers

### Error Reports (Optional)

If you consent, we collect technical error data through Sentry:

- **Error Messages**: JavaScript errors and stack traces
- **Browser Context**: Browser type, viewport size
- **Page URL**: Where the error occurred
- **Session ID**: Anonymous session identifier (not linked to you)

**What we DON'T include:**

- Personal information
- User input or form data
- Authentication tokens
- Sensitive data

### Feedback (Voluntary)

If you submit feedback through our widget:

- **Message**: Your feedback text
- **Category**: Bug, feature, or general feedback
- **Screenshot**: Optional screenshot you capture
- **Technical Context**: URL, browser info, timestamp

**Feedback is completely voluntary** and you control what information to include.

## How We Use Information

We use collected information to:

1. **Improve the Game**: Understand how players use features
2. **Fix Bugs**: Identify and resolve technical issues
3. **Enhance Performance**: Optimize loading times and responsiveness
4. **Improve Accessibility**: Make the game more accessible
5. **Respond to Feedback**: Address user concerns and requests

## Data Storage and Security

### Cloud Storage (Supabase)

- **Encrypted Database**: Game progress stored in encrypted PostgreSQL database
- **Anonymous Accounts**: No email/password required to start playing
- **Row-Level Security (RLS)**: You can only access your own data
- **Automatic Backups**: Your data is backed up daily (disaster recovery)
- **Secure Transmission**: All data sent over HTTPS/TLS 1.3

### Local Storage (Your Browser)

- **Session Tokens**: Authentication tokens cached in localStorage (encrypted JWTs)
- **Offline Cache**: Game assets cached for offline play (Service Worker)
- **Privacy Settings**: Your analytics preferences stored locally

### Data Retention

- **Active Accounts**: Data kept while you use the game
- **Inactive Anonymous Accounts**: Auto-deleted after 90 days of inactivity
- **Registered Accounts**: Kept until you delete your account
- **Analytics Data**: Retained for 12 months, then deleted

### How to Delete Your Account & Data

You have the **right to delete** all your data at any time:

**Method 1: In-App (Coming Soon)**

1. Go to Settings → Privacy
2. Click "Delete My Account"
3. Confirm deletion
4. All data deleted within 24 hours

**Method 2: Manual (Until feature is added)**

1. Email us at privacy@example.com with subject "Delete Account"
2. Include your anonymous User ID (found in Settings)
3. We'll delete your data within 24 hours

**What Gets Deleted:**

- All game progress (scores, achievements, stats)
- All settings and preferences
- All session records
- Anonymous user account

**Note:** Deletion is **permanent and cannot be undone**.

## Third-Party Services

We use privacy-friendly third-party services:

### Plausible Analytics (Optional)

- **Purpose**: Website analytics
- **Privacy**: No cookies, GDPR compliant, IP anonymization
- **Location**: EU servers
- **Policy**: https://plausible.io/privacy

### Sentry (Optional)

- **Purpose**: Error reporting
- **Privacy**: No PII, minimal data collection
- **Location**: US servers (Privacy Shield certified)
- **Policy**: https://sentry.io/privacy/

## Your Rights

You have the right to:

1. **Opt-Out**: Disable analytics and error reporting anytime
2. **Data Access**: Request access to data we've collected (though we collect very little)
3. **Data Deletion**: Request deletion of your data
4. **Withdraw Consent**: Change your privacy preferences anytime

### How to Opt-Out

1. Click the "Privacy Settings" button in the game
2. Toggle off "Analytics" and "Error Reporting"
3. Click "Save Preferences"

Your choice is saved in browser storage and respected immediately.

## Children's Privacy

This game is educational and suitable for all ages. We do not knowingly collect personal information from children under 13. If you're under 13, please ask a parent or guardian before submitting feedback.

## Cookies

We **do not use cookies** for tracking. We only use:

- **Local Storage**: To save your game progress and privacy preferences
- **Session Storage**: To maintain game state during your session

Both are stored locally in your browser and never sent to servers.

## Changes to This Policy

We may update this Privacy Policy occasionally. Changes will be posted on this page with an updated "Last Updated" date.

## Data Protection Laws

This Privacy Policy complies with:

- **GDPR** (General Data Protection Regulation) - EU
- **CCPA** (California Consumer Privacy Act) - California, USA
- **COPPA** (Children's Online Privacy Protection Act) - USA

## Contact Us

For privacy concerns or questions:

- **Email**: privacy@example.com (security and privacy issues)
- **Feedback Widget**: Use the in-game feedback button (general feedback)
- **GitHub Issues**: https://github.com/bjpl/california_puzzle_game/issues (bug reports)

**Security Concerns:** For security vulnerabilities, please email security@example.com or create a private security advisory on GitHub.

## Data Processing Details

### Legal Basis (GDPR)

We process data based on:

1. **Consent**: You explicitly opt-in to analytics and error reporting
2. **Legitimate Interest**: Improving game functionality and fixing bugs

### Data Controller

California Counties Puzzle Game

### Data Processors

- Plausible Analytics (EU)
- Sentry (US - Privacy Shield certified)

## Your California Privacy Rights (CCPA)

California residents have additional rights:

1. **Right to Know**: What personal information we collect
2. **Right to Delete**: Request deletion of your information
3. **Right to Opt-Out**: Opt-out of data "sales" (though we don't sell data)
4. **Right to Non-Discrimination**: Same service regardless of privacy choices

## Transparency

We believe in radical transparency:

- ✅ Open-source code (review our implementation)
- ✅ Privacy-first analytics (no cookies, no tracking)
- ✅ Clear opt-in/opt-out mechanism
- ✅ Minimal data collection
- ✅ No third-party advertising or tracking

## Summary

**What we collect**: Anonymous usage statistics (if you consent)
**What we DON'T collect**: Personal information, IP addresses, cookies
**Your control**: Easy opt-out anytime
**Our commitment**: Privacy-first, GDPR/CCPA compliant

---

_This game is an educational project. We prioritize privacy and learning over data collection._
