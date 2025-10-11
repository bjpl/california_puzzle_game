# Supabase Integration - Quick Start Guide

**For:** Developers implementing Supabase integration
**Time:** 15 minutes setup
**Prerequisites:** Supabase account (free tier works)

---

## Step 1: Create Supabase Project (5 min)

### 1.1 Sign Up / Log In

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (recommended)

### 1.2 Create New Project

1. Click "New Project"
2. Fill in details:
   - **Name:** `california-puzzle-game`
   - **Database Password:** Generate strong password (save it!)
   - **Region:** Choose closest to users (US West recommended)
   - **Pricing Plan:** Free tier (sufficient for development)

3. Click "Create new project"
4. Wait 2-3 minutes for setup

### 1.3 Get API Credentials

1. Go to **Settings → API**
2. Copy these values:

   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## Step 2: Configure Project (2 min)

### 2.1 Create Environment File

Create `.env.local` in project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Enable features
VITE_SUPABASE_SYNC_ENABLED=true
VITE_SUPABASE_SYNC_INTERVAL=30000
```

**Important:**
- Replace `xxxxxxxxxxxxx` with your actual project URL
- Replace the anon key with your actual key
- **Never commit `.env.local` to git** (already in `.gitignore`)

### 2.2 Update .env.example

Already done! See `.env.example` for reference.

---

## Step 3: Run Database Migration (3 min)

### 3.1 Open SQL Editor

1. In Supabase dashboard → **SQL Editor**
2. Click "New query"

### 3.2 Run Migration Script

1. Copy contents of `supabase/migrations/001_initial_schema.sql`
2. Paste into SQL Editor
3. Click "Run" (or press Cmd/Ctrl + Enter)

### 3.3 Verify Tables Created

1. Go to **Table Editor**
2. You should see these tables:
   - `profiles`
   - `game_settings`
   - `game_stats`
   - `game_sessions`
   - `achievements`
   - `leaderboard`

---

## Step 4: Enable Anonymous Auth (1 min)

### 4.1 Configure Auth Settings

1. Go to **Authentication → Settings**
2. Scroll to "Auth Providers"
3. Ensure **"Anonymous sign-ins"** is **ENABLED**
4. Click "Save" if you made changes

---

## Step 5: Test Integration (4 min)

### 5.1 Install Dependencies

```bash
# Already installed via package.json
npm install
```

### 5.2 Start Development Server

```bash
npm run dev
```

### 5.3 Verify in Browser

1. Open browser console (F12)
2. Look for Supabase logs:

   ```
   [Supabase] Client initialized successfully
   [Auth] Creating anonymous session...
   [Auth] Anonymous session created: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

3. Play the game, make some changes

### 5.4 Verify Data in Supabase

1. Go to **Table Editor** in Supabase dashboard
2. Click on `profiles` table
3. You should see a new row with your anonymous user
4. Check other tables (`game_settings`, `game_stats`, etc.)

---

## Common Issues & Solutions

### Issue: "Supabase not configured" message

**Cause:** Environment variables not loaded

**Solution:**
1. Ensure `.env.local` exists in project root
2. Restart dev server (`Ctrl+C`, then `npm run dev`)
3. Clear browser cache

### Issue: "Authentication failed" error

**Cause:** Anonymous auth not enabled

**Solution:**
1. Go to Supabase dashboard → **Authentication → Settings**
2. Enable "Anonymous sign-ins"
3. Save changes
4. Refresh your app

### Issue: "Row Level Security" error

**Cause:** RLS policies not applied

**Solution:**
1. Re-run the migration script in SQL Editor
2. Verify policies exist: **Authentication → Policies**
3. Each table should have policies listed

### Issue: Tables not appearing

**Cause:** Migration script failed

**Solution:**
1. Check SQL Editor for error messages (red text)
2. Ensure you're in the correct project
3. Try running migration again (it's idempotent)

---

## Architecture Overview

### Data Flow (Simplified)

```
User plays game
    ↓
Zustand store updated (immediate)
    ↓
localStorage saved (synchronous, ~1ms)
    ↓
Sync queue (async, non-blocking)
    ↓
Supabase (background, when online, ~100ms)
```

### Key Points

- **LocalStorage is primary** - game works offline
- **Supabase is backup** - syncs when online
- **Anonymous by default** - no login required
- **Privacy-first** - minimal data collection

---

## Next Steps for Developers

### Phase 1: Foundation (Current)
- ✅ Database schema created
- ✅ Environment configured
- ✅ Anonymous auth enabled
- ⬜ Implement client initialization
- ⬜ Implement auth service

### Phase 2: Sync Implementation
- ⬜ Create sync manager
- ⬜ Implement settings sync
- ⬜ Implement stats sync
- ⬜ Add conflict resolution

### Phase 3: Testing
- ⬜ Unit tests
- ⬜ Integration tests
- ⬜ Offline/online scenarios

---

## Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Type checking
npm run typecheck

# Lint code
npm run lint
```

---

## File Structure Reference

```
california_puzzle_game/
├── .env.local                    # Your credentials (not committed)
├── .env.example                  # Template
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── src/
│   └── services/supabase/        # To be created
│       ├── client.ts
│       ├── auth.ts
│       └── sync.ts
└── docs/
    ├── architecture/
    │   ├── SUPABASE_INTEGRATION_ARCHITECTURE.md
    │   └── ARCHITECTURE_SUMMARY.md
    └── SUPABASE_QUICKSTART.md    # This file
```

---

## Security Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] `.env.local` NOT in git
- [ ] RLS policies enabled on all tables
- [ ] Anonymous auth enabled
- [ ] HTTPS enforced (automatic with Supabase)
- [ ] CSP headers include Supabase domain
- [ ] Service role key NOT exposed in client code

---

## Useful Supabase Dashboard Links

| Feature | Location |
|---------|----------|
| SQL Editor | `https://supabase.com/dashboard/project/{id}/sql` |
| Table Editor | `https://supabase.com/dashboard/project/{id}/editor` |
| Auth Settings | `https://supabase.com/dashboard/project/{id}/auth/users` |
| API Credentials | `https://supabase.com/dashboard/project/{id}/settings/api` |
| Database Logs | `https://supabase.com/dashboard/project/{id}/logs/postgres-logs` |

---

## Resources

### Documentation
- [Supabase Official Docs](https://supabase.com/docs)
- [Anonymous Auth Guide](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Project Docs
- **Full Architecture:** `docs/architecture/SUPABASE_INTEGRATION_ARCHITECTURE.md`
- **Quick Summary:** `docs/architecture/ARCHITECTURE_SUMMARY.md`
- **Database Schema:** `supabase/migrations/001_initial_schema.sql`

---

## Support

### Issues & Questions
- Architecture questions → See `SUPABASE_INTEGRATION_ARCHITECTURE.md`
- Database schema → See `001_initial_schema.sql` comments
- Implementation help → Contact coder agent

### Debugging
1. Check browser console for logs (search for `[Supabase]`)
2. Check Supabase dashboard → Logs
3. Verify network requests in DevTools → Network tab
4. Test with `localStorage.clear()` for fresh state

---

**Setup Status:** ✅ Complete
**Next:** Implement Supabase client (`src/services/supabase/client.ts`)

---

_Last updated: 2025-10-11_
_For latest version, see: `docs/SUPABASE_QUICKSTART.md`_
