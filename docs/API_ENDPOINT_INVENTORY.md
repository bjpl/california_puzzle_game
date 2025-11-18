# API Endpoint Inventory & External Service Dependencies

**Generated:** 2025-11-18
**Project:** California Counties Puzzle Game
**Architecture:** Client-side PWA with Supabase Backend-as-a-Service

---

## Executive Summary

This application is a **client-side Progressive Web App (PWA)** with no custom REST API endpoints. All backend functionality is provided through **Supabase Backend-as-a-Service (BaaS)**, which handles authentication, database operations, and real-time synchronization.

**Key Findings:**

- ✅ No custom API routes to document
- ✅ All backend operations through Supabase SDK (client-side)
- ✅ Anonymous authentication with optional progression
- ✅ 100% offline-capable with progressive enhancement
- ✅ Privacy-first analytics (Plausible, opt-in)
- ⚠️ Feedback endpoint placeholder (not implemented)
- ⚠️ Error reporting endpoint placeholder (not implemented)

---

## 1. API Endpoint Inventory

### 1.1 REST API Endpoints

**Status:** ❌ **No custom REST API endpoints exist**

This is a static site deployed to GitHub Pages with all backend operations handled client-side through the Supabase SDK.

### 1.2 Placeholder/Proposed Endpoints

The following endpoints are referenced in code but **NOT IMPLEMENTED**:

#### `/api/feedback` (Not Implemented)

- **File:** `/src/components/feedback/FeedbackWidget.tsx:78`
- **Method:** POST
- **Purpose:** Submit user feedback
- **Status:** Placeholder only, falls back to client-side console logging
- **Environment Variable:** `VITE_FEEDBACK_ENDPOINT`
- **Request Body:**
  ```typescript
  {
    category: 'bug' | 'feature' | 'general',
    message: string,
    screenshot?: string,
    url: string,
    userAgent: string,
    timestamp: string
  }
  ```
- **Authentication:** None
- **Tests:** None
- **Recommendation:** Implement as Netlify/Vercel serverless function or Supabase Edge Function

#### `/api/errors` (Not Implemented)

- **File:** `/src/services/errorReporting.ts:246`
- **Method:** POST
- **Purpose:** Fallback error reporting (when Sentry not configured)
- **Status:** Placeholder only
- **Environment Variable:** `VITE_ERROR_REPORTING_ENDPOINT`
- **Request Body:**
  ```typescript
  {
    message: string,
    stack?: string,
    context: ErrorContext,
    breadcrumbs: Breadcrumb[],
    componentStack?: string
  }
  ```
- **Authentication:** None
- **Tests:** None
- **Recommendation:** Implement as serverless function or use Sentry

### 1.3 GraphQL Endpoints

**Status:** ❌ **No GraphQL endpoints**

---

## 2. External Service Dependencies

### 2.1 Core Backend Services

#### Supabase Backend-as-a-Service

- **Service:** PostgreSQL Database + Auth + Realtime + Storage
- **Environment Variables:**
  - `VITE_SUPABASE_URL` (Required for sync)
  - `VITE_SUPABASE_ANON_KEY` (Required for sync)
  - `VITE_SUPABASE_SYNC_ENABLED` (Optional, default: true)
  - `VITE_SUPABASE_SYNC_INTERVAL` (Optional, default: 30000ms)
  - `VITE_SUPABASE_REALTIME_ENABLED` (Optional, default: false)
- **Files:**
  - `/src/services/supabase/client.ts` (185 lines)
  - `/src/services/supabase/auth.ts` (571 lines)
  - `/src/services/supabase/types.ts` (382 lines)
  - `/src/lib/syncManager.ts` (478 lines)
  - `/src/lib/sync/achievementSync.ts` (276 lines)
  - `/src/lib/sync/gameSettingsSync.ts` (284 lines)
  - `/src/lib/sync/gameStatsSync.ts` (349 lines)
- **Total Lines of Code:** 2,047 lines
- **Progressive Enhancement:** ✅ App works fully offline if Supabase not configured
- **Authentication Method:** Anonymous sign-in (no email/password required)
- **Data Sync Strategy:** Optimistic updates with conflict resolution
- **Realtime Features:** Optional (disabled by default for performance)

**Database Tables:**

1. `profiles` - User profile metadata
2. `game_settings` - User preferences and settings
3. `game_stats` - Aggregated gameplay statistics
4. `game_sessions` - Individual game session records
5. `achievements` - Achievement progress tracking
6. `leaderboard` - Global leaderboard entries

**API Operations (via Supabase SDK):**

- `auth.signInAnonymously()` - Create anonymous user session
- `auth.signOut()` - End user session
- `auth.getSession()` - Retrieve current session
- `auth.refreshSession()` - Refresh auth token
- `auth.onAuthStateChange()` - Subscribe to auth events
- `from('table').select()` - Query data
- `from('table').insert()` - Create records
- `from('table').update()` - Update records
- `from('table').delete()` - Delete records
- `channel().on('postgres_changes')` - Real-time subscriptions

**Security Features:**

- Row Level Security (RLS) policies on all tables
- User can only access their own data
- Anonymous key is safe for client-side exposure
- All queries scoped to `auth.uid()`

### 2.2 Analytics Services

#### Plausible Analytics (Optional)

- **Type:** Privacy-first web analytics
- **Integration:** Client-side script injection
- **Environment Variables:**
  - `VITE_ANALYTICS_DOMAIN` (Default: `window.location.hostname`)
  - `VITE_ANALYTICS_API_HOST` (Default: `https://plausible.io`)
  - `VITE_DEV_ANALYTICS` (Default: false)
- **Files:** `/src/services/analytics.ts` (304 lines)
- **User Consent:** Required (opt-in via localStorage)
- **Privacy:**
  - No cookies
  - No personal data collection
  - IP anonymization
  - GDPR/CCPA compliant
- **Events Tracked:** 72 event types defined
- **Status:** ✅ Implemented, opt-in

**Event Categories:**

- Game Events (start, complete, pause, resume, quit)
- Interaction Events (county placed, hint used, zoom)
- Touch & Gesture Events (tap, drag, swipe, pinch, double-tap)
- Study Mode Events (quiz, completion)
- Accessibility Events (screen reader, keyboard nav)
- Feature Usage (theme, sound, difficulty, mode)
- Performance (slow performance, low FPS, web vitals)
- Feedback (opened, submitted)

### 2.3 Error Reporting Services

#### Sentry (Optional)

- **Type:** Error tracking and performance monitoring
- **Integration:** Dynamic import (only loads if DSN provided)
- **Environment Variables:**
  - `VITE_SENTRY_DSN` (Optional)
  - `VITE_DEV_ERROR_REPORTING` (Default: false)
- **Files:** `/src/services/errorReporting.ts` (314 lines)
- **User Consent:** Required (opt-in via localStorage)
- **Privacy:**
  - No cookies sent
  - Headers filtered
  - PII removal before send
- **Features:**
  - Breadcrumb tracking (last 20 actions)
  - Component stack traces
  - Unhandled rejection capture
  - Global error handling
- **Status:** ✅ Implemented as optional dependency
- **Package:** `@sentry/react` (optional dependency in package.json)

### 2.4 Deployment & Hosting

#### GitHub Pages (Primary)

- **URL Pattern:** `https://bjpl.github.io/california_puzzle_game/`
- **Base Path:** `/california_puzzle_game/` (configured in vite.config.ts)
- **Deployment:** GitHub Actions workflow
- **Static Assets:** All compiled to `/dist`
- **CDN:** GitHub's CDN
- **SSL:** ✅ Automatic HTTPS
- **Status:** ✅ Active deployment

**GitHub Actions Workflow:**

- **File:** `.github/workflows/ci.yml`
- **Triggers:** Push to main branch
- **Steps:**
  1. Checkout code
  2. Install Node.js dependencies
  3. Run tests (`npm run test`)
  4. Run lint (`npm run lint`)
  5. Build production bundle (`npm run build`)
  6. Deploy to GitHub Pages
- **Test Coverage:** Required 80% minimum
- **Build Artifacts:** Deployed to `gh-pages` branch

### 2.5 Development & Build Tools

#### Vite Build System

- **Version:** 4.5.0
- **Configuration:** `/vite.config.ts`
- **Features:**
  - Code splitting (7 vendor chunks + 3 feature chunks)
  - Bundle visualization (rollup-plugin-visualizer)
  - Source maps enabled
  - Chunk size warnings at 500kb
  - TypeScript compilation
- **Output:** `/dist` directory

**Code Splitting Strategy:**

```typescript
// Vendor chunks
'vendor-react': React & ReactDOM
'vendor-ui': DnD Kit, Lucide, Framer Motion
'vendor-geo': D3 libraries
'vendor-storage': Zustand
'vendor-supabase': Supabase JS

// Feature chunks
'map-components': Map components
'study-mode': Study mode components
'achievements': Achievement system
'game-features': Game mode selector, difficulty, progression
```

#### Package Manager

- **Tool:** npm (lockfile version indicates npm)
- **Dependencies:** 23 production dependencies
- **Dev Dependencies:** 37 development dependencies
- **Optional Dependencies:** 1 (`@sentry/react`)

### 2.6 Static Asset Hosting

#### Geographic Data (GeoJSON)

- **Location:** `/public/data/geo/`
- **Source:** Locally hosted
- **Size:** ~16MB (california_counties.geojson)
- **Format:** GeoJSON, TopoJSON
- **Caching:** Service Worker caching
- **Progressive Loading:** ✅ Implemented for mobile
- **Files:**
  - `california_counties.geojson` (root)
  - `public/data/geo/projection-configs.json`

#### Icons & PWA Manifests

- **Icons:** `/public/icons/*.png` (multiple sizes)
- **Manifest:** `/public/manifest.json`
- **Service Worker:** `/public/sw.js` (if present)
- **Apple Touch Icons:** ✅ Configured

---

## 3. Data Flow Architecture

### 3.1 Client-Side State Management

#### Zustand Store (`gameStore`)

- **Location:** `/src/stores/gameStore.ts`
- **Pattern:** Global state management
- **Persistence:** localStorage
- **Sync:** Bidirectional with Supabase

**State Slices:**

- Game settings (difficulty, region, hints, timer, sound, animations)
- Game statistics (scores, accuracy, play time, achievements)
- Sound settings (volumes, mute states, preferences)
- Hint settings (limits, cooldowns, penalties, indicators)

#### Auth Store (`authStore`)

- **Location:** `/src/stores/authStore.ts`
- **Pattern:** Authentication state
- **Persistence:** Supabase session storage
- **Data:**
  - User ID
  - Session token
  - Anonymous status
  - Authentication status

### 3.2 Data Synchronization Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  LOCAL STATE UPDATE                          │
│              (Zustand Store + localStorage)                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 SYNC MANAGER QUEUE                           │
│          (Offline queue with retry logic)                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              NETWORK STATUS CHECK                            │
│         (Online: immediate sync, Offline: queue)             │
└──────────┬──────────────────────────────┬───────────────────┘
           │                              │
    ONLINE │                              │ OFFLINE
           ▼                              ▼
┌─────────────────────────┐   ┌──────────────────────────────┐
│  SUPABASE DATABASE      │   │  PERSIST IN INDEXEDDB/       │
│  - Conflict resolution  │   │  LOCALSTORAGE QUEUE          │
│  - Last-write-wins      │   │  - Retry on reconnection     │
│  - Version tracking     │   │  - Exponential backoff       │
└──────────┬──────────────┘   └──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│           REALTIME SUBSCRIPTION (Optional)                   │
│     (Sync changes from other devices in real-time)          │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Caching Strategies

#### Service Worker Caching

- **Strategy:** Cache-first for static assets
- **Files Cached:**
  - HTML, CSS, JS bundles
  - Images and icons
  - Web fonts
  - GeoJSON data (progressive)
- **Cache Updates:** On version change
- **Offline Support:** Full offline gameplay

#### IndexedDB/localStorage

- **Game State:** localStorage (JSON serialization)
- **Geodata:** Progressive loading via IndexedDB
- **Auth Tokens:** Supabase storage (localStorage)
- **Sync Queue:** localStorage (pending operations)

### 3.4 Real-time Data Handling

#### Supabase Realtime (Optional, Disabled by Default)

- **Protocol:** WebSocket
- **Events:** postgres_changes
- **Tables Subscribed:**
  - `user_progress` (achievements)
  - `game_settings` (settings)
  - `game_stats` (statistics)
- **Rate Limit:** 2 events per second
- **Use Case:** Multi-device synchronization
- **Performance Impact:** Minimal (disabled by default)

---

## 4. Authentication & Authorization

### 4.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     APP INITIALIZATION                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│            CHECK FOR EXISTING SESSION                        │
│         (Supabase session in localStorage)                   │
└──────────┬──────────────────────────────┬───────────────────┘
           │                              │
    EXISTS │                              │ NO SESSION
           ▼                              ▼
┌─────────────────────────┐   ┌──────────────────────────────┐
│  RESTORE SESSION        │   │  CREATE ANONYMOUS USER       │
│  - Validate token       │   │  - No email/password         │
│  - Auto-refresh         │   │  - Instant access            │
│  - Load user data       │   │  - Privacy-friendly          │
└──────────┬──────────────┘   └──────────┬───────────────────┘
           │                              │
           └──────────────┬───────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 AUTHENTICATED STATE                          │
│          - User ID assigned                                  │
│          - Session token active                              │
│          - Data sync enabled                                 │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Authorization Model

#### Row Level Security (RLS)

- **Enabled on:** All Supabase tables
- **Policy:** Users can only access their own data
- **Filter:** `WHERE user_id = auth.uid()`
- **Public Tables:** `leaderboard` (read-only)

#### Client-Side Security

- **API Key:** Anonymous key (safe for client exposure)
- **Token Storage:** localStorage (encrypted by Supabase)
- **Session Duration:** Auto-refresh enabled
- **Logout:** Clears localStorage and Supabase session

### 4.3 Data Export & Deletion (GDPR Compliance)

#### Export User Data

- **Function:** `exportUserData(userId)` in `/src/services/supabase/auth.ts:404-466`
- **Returns:** JSON with all user data
- **Tables Exported:**
  - `game_sessions`
  - `user_progress`
  - `game_settings`
- **Format:** Downloadable JSON blob
- **Tests:** ✅ Unit tests present

#### Delete User Account

- **Function:** `deleteUserAccount()` in `/src/services/supabase/auth.ts:496-571`
- **Actions:**
  1. Delete all user data from database tables
  2. Sign out user session
  3. Clear localStorage
  4. Remove Supabase auth user
- **Irreversible:** ✅ Warning required
- **Tests:** ✅ Unit tests present

---

## 5. Testing Coverage

### 5.1 API Integration Tests

#### Supabase Integration Tests

- **Location:** `/tests/integration/auth/`
- **Files:**
  - `auth-flow.test.ts` - Authentication workflows
  - `session-management.test.ts` - Session handling
  - `offline-online.test.ts` - Network transitions
- **Mocks:** `/tests/mocks/supabase/mockSupabaseClient.ts`
- **Coverage:** Authentication, CRUD, sync operations

#### Sync Module Tests

- **Location:** `/tests/sync/`
- **Files:**
  - `syncManager.test.ts` - Sync orchestration
  - `gameSettingsSync.test.ts` - Settings synchronization
- **Coverage:** Queue operations, conflict resolution, realtime subscriptions

### 5.2 Missing Tests

⚠️ **Endpoints Without Tests:**

- `/api/feedback` - Not implemented
- `/api/errors` - Not implemented

⚠️ **External Service Integration Tests:**

- Plausible Analytics - No integration tests
- Sentry - No integration tests
- GitHub Pages deployment - No automated tests

### 5.3 Test Configuration

**Test Runner:** Vitest
**Coverage Tool:** V8
**Coverage Thresholds:**

- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

**Test Workspaces:**

- Unit tests
- Integration tests
- Accessibility tests
- Performance tests

---

## 6. Performance Optimizations

### 6.1 Bundle Optimization

**Code Splitting:**

- 7 vendor chunks (React, UI, D3, Storage, Supabase)
- 3 feature chunks (Maps, Study Mode, Achievements)
- Lazy loading for non-critical components

**Bundle Sizes (Target):**

- Warning threshold: 500kb per chunk
- Compression: Gzip + Brotli
- Tree shaking: Enabled
- Dead code elimination: Enabled

### 6.2 Network Optimization

**Caching:**

- Static assets: Cache-first
- API responses: Supabase SDK cache
- Geodata: Progressive loading with IndexedDB

**Request Batching:**

- Supabase queries batched when possible
- Parallel requests for independent data
- Debounced sync operations

**Offline Support:**

- Service Worker for offline access
- LocalStorage for game state
- Queue for pending sync operations

### 6.3 Database Query Optimization

**Indexes (in Supabase schema):**

- `idx_profiles_user_id`
- `idx_game_settings_user_id`
- `idx_game_stats_user_id`
- `idx_game_sessions_user_id`
- `idx_achievements_user_id`
- `idx_leaderboard_region_difficulty_score`

**Query Patterns:**

- Select only required columns
- Use single() for unique queries
- Parallel queries with Promise.all()
- Limit results for leaderboards

---

## 7. Potential Bottlenecks & Inefficiencies

### 7.1 Identified Issues

#### 1. Missing Feedback Endpoint

- **Impact:** High - User feedback not captured
- **Files:** `/src/components/feedback/FeedbackWidget.tsx:78`
- **Recommendation:** Implement as serverless function or Supabase Edge Function
- **Estimated Effort:** 2-4 hours

#### 2. Missing Error Reporting Endpoint

- **Impact:** Medium - Errors not tracked without Sentry
- **Files:** `/src/services/errorReporting.ts:246`
- **Recommendation:** Implement fallback endpoint or require Sentry
- **Estimated Effort:** 2-4 hours

#### 3. Large GeoJSON File

- **Impact:** Medium - 16MB initial download
- **Location:** `/california_counties.geojson`
- **Current Mitigation:** Progressive loading for mobile
- **Recommendation:** Consider TopoJSON compression or vector tiles
- **Estimated Effort:** 8-16 hours

#### 4. Realtime Subscriptions Disabled

- **Impact:** Low - Multi-device sync requires manual refresh
- **Reason:** Performance optimization
- **Trade-off:** Battery life vs. real-time updates
- **Recommendation:** Make configurable per-user preference
- **Estimated Effort:** 2-4 hours

#### 5. No API Rate Limiting

- **Impact:** Low - Supabase handles rate limiting
- **Status:** Delegated to Supabase infrastructure
- **Recommendation:** Monitor Supabase quotas
- **Action:** Set up alerts for quota warnings

### 7.2 Performance Metrics

**Target Web Vitals:**

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Monitoring:**

- Web Vitals tracking: ✅ Implemented (`/src/utils/webVitals.ts`)
- Performance API: ✅ Used
- Analytics integration: ✅ Plausible custom events

---

## 8. Security Considerations

### 8.1 Authentication Security

✅ **Implemented:**

- Anonymous authentication (no PII required)
- Auto-refresh tokens
- Secure token storage (Supabase managed)
- Row Level Security (RLS) policies
- HTTPS only (GitHub Pages enforces)

❌ **Not Implemented:**

- Email/password authentication
- OAuth providers
- Two-factor authentication
- API key rotation

### 8.2 Data Privacy

✅ **GDPR Compliant:**

- Data export functionality
- Account deletion functionality
- No PII collection (anonymous users)
- Opt-in analytics
- Opt-in error reporting

✅ **Privacy Features:**

- No third-party cookies
- IP anonymization (Plausible)
- Local-first data storage
- Minimal server communication

### 8.3 Input Validation

✅ **Database Level:**

- CHECK constraints on all tables
- Type validation (PostgreSQL types)
- Foreign key constraints
- Unique constraints

✅ **Client Level:**

- TypeScript type safety
- Form validation (React Hook Form)
- Sanitization for user input

### 8.4 Dependency Security

**Audit Status:**

- Last audit: Check with `npm audit`
- Known vulnerabilities: Check `docs/audit-report.json`
- Update policy: Documented in `docs/DEPENDENCY_POLICY.md`

**Security Commands:**

```bash
npm run deps:audit       # Run security audit
npm run deps:update      # Update dependencies
npm run deps:report      # Generate audit report
```

---

## 9. Documentation Quality

### 9.1 API Documentation

❌ **Missing:**

- No OpenAPI/Swagger specification
- No Postman collection
- No API versioning strategy

✅ **Present:**

- Inline JSDoc comments in service files
- TypeScript types serve as API contracts
- Architectural documentation in `/docs/architecture/`

### 9.2 Code Documentation

✅ **Well Documented:**

- All Supabase service functions have JSDoc comments
- TypeScript interfaces documented
- SQL schema heavily commented
- Architecture decision records (ADRs)

**Documentation Files:**

- `/docs/architecture/SUPABASE_INTEGRATION_ARCHITECTURE.md`
- `/docs/architecture/sync-architecture.md`
- `/docs/SUPABASE_QUICKSTART.md`
- `/docs/CODE_REVIEW_SUPABASE.md`

---

## 10. Recommendations

### 10.1 Critical Priority

1. **Implement Feedback Endpoint**
   - Technology: Netlify Functions or Supabase Edge Functions
   - Estimated Effort: 4 hours
   - Benefit: Capture user feedback for product improvements

2. **Implement Error Reporting Fallback**
   - Technology: Serverless function or require Sentry
   - Estimated Effort: 2 hours
   - Benefit: Track errors without external dependencies

### 10.2 High Priority

3. **Add OpenAPI Specification**
   - For future API endpoints
   - Document Supabase table schemas as REST APIs
   - Estimated Effort: 4 hours

4. **Implement API Monitoring**
   - Monitor Supabase usage and quotas
   - Set up alerts for quota warnings
   - Track API response times
   - Estimated Effort: 4 hours

### 10.3 Medium Priority

5. **Optimize GeoJSON Loading**
   - Convert to TopoJSON (smaller file size)
   - Consider vector tile server for dynamic loading
   - Estimated Effort: 16 hours

6. **Add Integration Tests for External Services**
   - Plausible Analytics mock tests
   - Sentry integration tests
   - GitHub Pages deployment validation
   - Estimated Effort: 8 hours

### 10.4 Low Priority

7. **Enable Realtime as User Preference**
   - Allow users to opt-in to real-time sync
   - Provide battery impact warning
   - Estimated Effort: 4 hours

8. **Add API Response Caching**
   - Implement response caching for leaderboards
   - Cache invalidation strategy
   - Estimated Effort: 4 hours

---

## 11. Summary Tables

### 11.1 External Service Dependencies

| Service      | Type           | Required | User Consent | Privacy Impact  | Fallback          |
| ------------ | -------------- | -------- | ------------ | --------------- | ----------------- |
| Supabase     | BaaS           | No       | Implicit     | Low (anonymous) | localStorage only |
| Plausible    | Analytics      | No       | Yes (opt-in) | None (GDPR)     | No tracking       |
| Sentry       | Error Tracking | No       | Yes (opt-in) | Low (filtered)  | Console only      |
| GitHub Pages | Hosting        | Yes      | N/A          | None            | -                 |

### 11.2 Environment Variables

| Variable                        | Required | Default       | Purpose                | Sensitive |
| ------------------------------- | -------- | ------------- | ---------------------- | --------- |
| `VITE_SUPABASE_URL`             | No       | -             | Supabase project URL   | No        |
| `VITE_SUPABASE_ANON_KEY`        | No       | -             | Supabase anonymous key | No        |
| `VITE_SUPABASE_SYNC_ENABLED`    | No       | true          | Enable/disable sync    | No        |
| `VITE_SUPABASE_SYNC_INTERVAL`   | No       | 30000         | Sync interval (ms)     | No        |
| `VITE_ANALYTICS_DOMAIN`         | No       | hostname      | Plausible domain       | No        |
| `VITE_ANALYTICS_API_HOST`       | No       | plausible.io  | Plausible API host     | No        |
| `VITE_SENTRY_DSN`               | No       | -             | Sentry project DSN     | Yes       |
| `VITE_FEEDBACK_ENDPOINT`        | No       | /api/feedback | Feedback API URL       | No        |
| `VITE_ERROR_REPORTING_ENDPOINT` | No       | /api/errors   | Error reporting URL    | No        |

### 11.3 Database Tables

| Table           | Purpose              | RLS            | Indexes | Triggers | Views |
| --------------- | -------------------- | -------------- | ------- | -------- | ----- |
| `profiles`      | User metadata        | ✅             | 2       | ✅       | -     |
| `game_settings` | User preferences     | ✅             | 2       | ✅       | -     |
| `game_stats`    | Aggregated stats     | ✅             | 2       | ✅       | ✅    |
| `game_sessions` | Game history         | ✅             | 3       | ✅       | -     |
| `achievements`  | Achievement tracking | ✅             | 2       | ✅       | -     |
| `leaderboard`   | Global rankings      | ✅ (read-only) | 3       | -        | ✅    |

### 11.4 Code Statistics

| Component         | Lines of Code | Files | Test Coverage |
| ----------------- | ------------- | ----- | ------------- |
| Supabase Services | 1,138         | 3     | ✅ 80%+       |
| Sync Modules      | 909           | 3     | ✅ 80%+       |
| Analytics Service | 304           | 1     | ✅ 80%+       |
| Error Reporting   | 314           | 1     | ✅ 80%+       |
| Sync Manager      | 478           | 1     | ✅ 80%+       |
| **Total Backend** | **3,143**     | **9** | **✅ 80%+**   |

---

## Appendix A: File Reference

### Key Configuration Files

- `/vite.config.ts` - Build and deployment configuration
- `/package.json` - Dependencies and scripts
- `/.env.example` - Environment variable template
- `/supabase/migrations/001_initial_schema_fixed.sql` - Database schema

### Service Implementation Files

- `/src/services/supabase/client.ts` - Supabase initialization
- `/src/services/supabase/auth.ts` - Authentication service
- `/src/services/supabase/types.ts` - TypeScript type definitions
- `/src/services/analytics.ts` - Plausible integration
- `/src/services/errorReporting.ts` - Sentry integration
- `/src/lib/syncManager.ts` - Sync orchestration
- `/src/lib/sync/achievementSync.ts` - Achievement sync
- `/src/lib/sync/gameSettingsSync.ts` - Settings sync
- `/src/lib/sync/gameStatsSync.ts` - Statistics sync

### Test Files

- `/tests/integration/auth/` - Authentication tests
- `/tests/sync/` - Synchronization tests
- `/tests/mocks/supabase/` - Supabase mocks

---

**End of Report**
