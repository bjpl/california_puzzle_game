# Supabase Integration - Architecture Summary

**Project:** California Counties Puzzle Game
**Version:** 1.0.0
**Date:** 2025-10-11
**Architect:** System Architect Agent

---

## Quick Reference

### Core Principles

1. **Progressive Enhancement** - App works fully without Supabase
2. **Anonymous-First** - No registration required
3. **Privacy-First** - Minimal data collection, GDPR/CCPA compliant
4. **Offline-First** - LocalStorage primary, Supabase syncs when online
5. **Non-Blocking** - All sync operations run in background

---

## Key Architecture Decisions

### 1. Authentication Strategy

**Decision:** Anonymous Supabase Authentication

**Why:**
- No user registration friction
- Privacy-friendly (no email/password required)
- Easy upgrade path to full accounts later
- Maintains existing localStorage-based game state

**Implementation:**
```typescript
// Auto-creates anonymous user on first visit
const { user } = await supabase.auth.signInAnonymously();
```

### 2. Data Storage Pattern

**Decision:** Dual-Layer Storage (LocalStorage + Supabase)

**Flow:**
```
User Action
    ↓
Zustand Store (immediate)
    ↓
LocalStorage (synchronous)
    ↓
Sync Queue (asynchronous)
    ↓
Supabase (background, when online)
```

**Why:**
- Instant UI updates (no network latency)
- Works offline seamlessly
- Resilient to network failures
- Maintains PWA offline-first philosophy

### 3. Conflict Resolution

**Decision:** Last-Write-Wins with Version Control

**Strategy:**
- Compare timestamps on both local and remote data
- Newest change wins
- Version number increments on each update
- Conflicts logged for review

**Edge Cases:**
- Multiple devices editing simultaneously → Last write wins
- Offline edits sync when back online → Merged with latest remote

### 4. Sync Engine Design

**Decision:** Queue-Based Background Sync

**Features:**
- Operations queued locally if offline
- Automatic sync every 30 seconds when online
- Batch operations to reduce network calls
- Retry logic with exponential backoff

**Implementation:**
```typescript
class SyncManager {
  - syncQueue: Operation[]
  - startAutoSync(interval)
  - sync() // Manual trigger
  - processQueue() // Batch upload
}
```

### 5. Security Model

**Decision:** Row Level Security (RLS) on all tables

**Policies:**
- Users can ONLY access their own data
- Anonymous users get full CRUD on their records
- Leaderboard is read-only for all, write for owner
- Service role bypasses RLS (server-side only)

---

## File Structure

### New Files to Create

```
src/
├── services/supabase/
│   ├── client.ts           # Supabase client (lazy init)
│   ├── auth.ts             # Anonymous auth service
│   ├── database.ts         # DB operations
│   ├── sync.ts             # Sync engine
│   └── types.ts            # TypeScript types
│
├── hooks/
│   ├── useSupabase.ts      # Main hook
│   ├── useSupabaseAuth.ts  # Auth state
│   └── useSupabaseSync.ts  # Sync status
│
└── utils/sync/
    ├── syncManager.ts      # Orchestration
    ├── conflictResolver.ts # Conflict logic
    └── networkMonitor.ts   # Online/offline
```

### Files to Update

```
.env.example                 # Add Supabase vars
vite.config.ts              # Code splitting for Supabase
src/utils/storage.ts        # Integrate sync manager
src/stores/gameStore.ts     # Add sync hooks
```

---

## Database Schema Overview

### Tables

1. **profiles** - User profile metadata
2. **game_settings** - User preferences (synced with localStorage)
3. **game_stats** - Performance metrics
4. **game_sessions** - Individual gameplay records
5. **achievements** - Achievement tracking
6. **leaderboard** - (Optional) Global rankings

### Relationships

```
auth.users (Supabase Auth)
    ↓
    └─ profiles (1:1)
       ├─ game_settings (1:1)
       ├─ game_stats (1:1)
       ├─ game_sessions (1:N)
       ├─ achievements (1:N)
       └─ leaderboard (1:N)
```

---

## Environment Configuration

### Required Environment Variables

```bash
# .env.local (not committed)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional
VITE_SUPABASE_SYNC_ENABLED=true
VITE_SUPABASE_SYNC_INTERVAL=30000
VITE_SUPABASE_REALTIME_ENABLED=false
```

### Safety

- ✅ **Anon key is safe** to expose in client (public key)
- ✅ **RLS policies** prevent unauthorized access
- ❌ **Never expose service_role key** (stays on server only)

---

## Performance Impact

### Bundle Size

- **Supabase SDK:** ~50KB gzipped
- **Strategy:** Lazy load, code split
- **Impact:** Minimal (loaded only if configured)

### Runtime Performance

- **Local operations:** 0ms overhead (localStorage still primary)
- **Sync operations:** Background, non-blocking
- **Network:** Batched, debounced (max 1 request per 30s)

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create database schema in Supabase
- [ ] Set up Supabase client with lazy initialization
- [ ] Implement anonymous authentication
- [ ] Environment variable configuration

### Phase 2: Core Sync (Week 2)
- [ ] Build sync manager with queue
- [ ] Implement settings sync
- [ ] Implement stats sync
- [ ] Implement achievement sync

### Phase 3: Testing (Week 3)
- [ ] Unit tests for auth & sync
- [ ] Integration tests for offline/online
- [ ] E2E tests for conflict resolution
- [ ] Performance benchmarks

### Phase 4: Production (Week 4)
- [ ] Production Supabase project setup
- [ ] Monitoring & logging
- [ ] Gradual rollout with feature flag
- [ ] Documentation for users

---

## Testing Strategy

### Critical Test Scenarios

1. **Offline Game Play**
   - Play game entirely offline
   - Verify localStorage works
   - Go online → verify sync completes

2. **Multi-Device Sync**
   - Make changes on Device A
   - Open on Device B
   - Verify data syncs correctly

3. **Conflict Resolution**
   - Edit same data on two devices while offline
   - Bring both online
   - Verify conflict resolution (last-write-wins)

4. **Error Handling**
   - Network failures during sync
   - Invalid Supabase credentials
   - Database constraints violations

---

## Monitoring & Success Metrics

### Key Metrics to Track

1. **Sync Success Rate** → Target: >99%
2. **Average Sync Latency** → Target: <2 seconds
3. **Conflict Rate** → Target: <1%
4. **Anonymous User Retention** → Track weekly active users
5. **Error Rate** → Target: <0.1%

### Logging Points

- Auth success/failure
- Sync start/complete/error
- Conflict resolution events
- Network state changes
- Database operations

---

## Future Enhancements (Post-MVP)

1. **Account Upgrade**: Convert anonymous → email/password
2. **Realtime Sync**: Live updates across devices
3. **Social Features**: Share achievements, multiplayer
4. **Advanced Analytics**: Personal progress dashboard
5. **Cloud Export**: Download game data backup

---

## Risk Mitigation

### Identified Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase outage | Medium | LocalStorage continues working |
| Sync conflicts | Low | Last-write-wins + logging |
| Network issues | Low | Queue + retry logic |
| Bundle size | Low | Code splitting + lazy load |
| Data privacy | High | Anonymous auth + RLS |

---

## Security Checklist

- ✅ Environment variables for credentials
- ✅ Row Level Security on all tables
- ✅ Anonymous authentication only
- ✅ No PII collection
- ✅ HTTPS enforced
- ✅ Content Security Policy updated
- ✅ Session auto-refresh

---

## Developer Quick Start

### 1. Setup Supabase Project

```bash
# Create project at supabase.com
# Copy URL and anon key
# Add to .env.local
```

### 2. Run Database Migration

```bash
# In Supabase SQL editor, run:
# supabase/migrations/001_initial_schema.sql
```

### 3. Test Locally

```bash
npm run dev
# App should initialize anonymous auth
# Check browser console for "[Supabase]" logs
```

### 4. Verify Sync

```bash
# Play game, make changes
# Check Supabase dashboard → Tables
# Verify data appears in tables
```

---

## Architecture Diagrams

### System Architecture
See: `SUPABASE_INTEGRATION_ARCHITECTURE.md` Section 1.1

### Data Flow
See: `SUPABASE_INTEGRATION_ARCHITECTURE.md` Section 1.2

### Authentication Flow
See: `SUPABASE_INTEGRATION_ARCHITECTURE.md` Section 4.1

### Sync Flow
See: `SUPABASE_INTEGRATION_ARCHITECTURE.md` Section 6.1

---

## Related Documentation

- **Full Architecture:** `docs/architecture/SUPABASE_INTEGRATION_ARCHITECTURE.md`
- **Database Schema:** `supabase/migrations/001_initial_schema.sql`
- **API Reference:** (To be created by API Docs agent)
- **User Guide:** (To be created post-implementation)

---

## Contact & Questions

- **Architecture Questions:** Review `SUPABASE_INTEGRATION_ARCHITECTURE.md`
- **Implementation Questions:** Contact Coder Agent
- **Database Questions:** Review `001_initial_schema.sql`
- **Testing Questions:** Contact Tester Agent

---

**Status:** Architecture Design Complete ✅
**Next Step:** Implementation Phase (Coder Agent)
**Estimated Timeline:** 4 weeks to production-ready

---

_This is a living document. Update as architecture evolves._
