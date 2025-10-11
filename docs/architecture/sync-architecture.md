# Data Sync Architecture - California Puzzle Game

**Version:** 1.0.0
**Date:** 2025-10-11
**Status:** Design Phase
**Author:** SyncArchitect Agent

---

## Executive Summary

This document outlines the architecture for implementing data synchronization between localStorage and Supabase for the California Counties Puzzle Game. The design prioritizes **offline-first** functionality with **seamless cloud sync** for anonymous users.

### Key Design Decisions

1. **Offline-First Architecture**: localStorage remains the source of truth
2. **Last-Write-Wins Conflict Resolution**: Simple and predictable for single-user scenarios
3. **Optimistic Updates**: Immediate UI feedback with background sync
4. **Queue-Based Sync**: Persistent queue for offline changes
5. **Incremental Sync**: Only sync changed data to minimize bandwidth

---

## Current System Analysis

### 1. Authentication Infrastructure

**File:** `src/lib/supabase.ts`

**Status:** ✅ Complete (Phase 1)

**Features:**
- Anonymous authentication with Supabase
- Auto-refresh tokens
- Session persistence in localStorage (`california-puzzle-auth-token`)
- Health check and configuration validation
- Type-safe database client with custom schema

**Auth Store:** `src/stores/authStore.ts`
- Zustand store with devtools and persistence
- Auto-initialization on app load
- Session refresh on visibility/focus
- Auth state listeners for Supabase events

**Key Insight:** Anonymous auth provides persistent user IDs across sessions, enabling sync without user registration.

---

### 2. Database Schema

**File:** `supabase/migrations/001_initial_schema.sql`

**Tables for Sync:**

#### `game_settings`
- **Purpose:** User preferences and game configuration
- **Sync Priority:** High (user expects settings to persist)
- **Fields:** difficulty, region, show_hints, sound_settings, hint_settings, theme, language
- **Conflict Resolution:** Version-based (has `version` column)
- **Update Frequency:** Low (only when user changes settings)

#### `game_stats`
- **Purpose:** Aggregated player performance metrics
- **Sync Priority:** High (user's progress)
- **Fields:** total_games_played, total_score, best_score, counties_learned, streaks
- **Conflict Resolution:** Merge strategy (accumulate totals, max for best scores)
- **Update Frequency:** Medium (after each game session)

#### `game_sessions`
- **Purpose:** Individual gameplay records
- **Sync Priority:** Medium (historical data)
- **Fields:** region, difficulty, score, time_elapsed, placements, accuracy
- **Conflict Resolution:** Append-only (no conflicts, sessions are immutable)
- **Update Frequency:** Low (only at game end)

#### `achievements`
- **Purpose:** Player achievement tracking
- **Sync Priority:** Medium (user satisfaction)
- **Fields:** achievement_id, progress, is_unlocked, unlocked_at
- **Conflict Resolution:** Max progress (keep highest progress value)
- **Update Frequency:** Low (when achievements unlock)

#### `profiles`
- **Purpose:** Extended user profile information
- **Sync Priority:** Low (metadata)
- **Fields:** display_name, avatar_url, device_info, last_synced_at
- **Conflict Resolution:** Last-write-wins
- **Update Frequency:** Very low (rarely changes)

**Key Features:**
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data (`auth.uid() = user_id`)
- Automatic `updated_at` timestamps via triggers
- Version columns for conflict detection
- Indexes for performance optimization

---

### 3. Local Storage Management

**File:** `src/utils/storage.ts`

**Current Implementation:**
- Profile-based storage system
- localStorage wrapper with JSON serialization
- Custom date/Set serialization
- Event listener system for storage changes
- Storage migration system with version tracking
- Prefix: `california_puzzle_*`

**Zustand Stores:**

1. **authStore** (`src/stores/authStore.ts`)
   - Persists: user, session, initialized
   - Key: `california-puzzle-auth`

2. **gameStore** (`src/stores/gameStore.ts`)
   - Persists: settings, stats, achievements, gestureState, userId
   - Key: `california-puzzle-game`

3. **themeStore** (`src/stores/themeStore.ts`)
   - Persists: mode (light/dark/auto)
   - Key: `theme-storage`

4. **studyStore** (`src/stores/studyStore.ts`)
   - Persists: progress, studyInfo, spacedRepetition, sessions, goals, stats
   - Key: `california-study-store`

**Key Insight:** Zustand's persist middleware already handles localStorage, but lacks sync logic with Supabase.

---

## Sync Architecture Design

### Architecture Pattern: **Hybrid Offline-First**

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                       │
│  ┌───────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐ │
│  │GameStore  │  │StudyStore│  │AuthStore  │  │ThemeStore│ │
│  └─────┬─────┘  └────┬─────┘  └─────┬─────┘  └────┬─────┘ │
│        │             │               │             │        │
│        └─────────────┴───────────────┴─────────────┘        │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │         Sync Manager Layer            │
         │  ┌─────────────────────────────────┐  │
         │  │    Sync Orchestrator            │  │
         │  │  - Coordin sync operations      │  │
         │  │  - Handle online/offline states │  │
         │  │  - Manage sync intervals        │  │
         │  └──────────┬──────────────────────┘  │
         │             │                          │
         │    ┌────────┴────────┐                 │
         │    │                 │                 │
         │    ▼                 ▼                 │
         │  ┌─────┐         ┌──────┐             │
         │  │Queue│         │Merger│             │
         │  │Mgr  │         │Engine│             │
         │  └─────┘         └──────┘             │
         └────┬────────────────┬──────────────────┘
              │                │
    ┌─────────┴────────┐  ┌────┴─────────┐
    │                  │  │              │
    ▼                  ▼  ▼              ▼
┌─────────┐    ┌────────────────┐    ┌──────────┐
│LocalData│    │   Sync Queue   │    │ Supabase │
│(Source  │◄──►│  (IndexedDB)   │◄──►│ Database │
│of Truth)│    │                │    │ (Remote) │
└─────────┘    └────────────────┘    └──────────┘
```

---

## Core Components

### 1. Sync Manager (`src/lib/syncManager.ts`)

**Responsibilities:**
- Coordinate all sync operations
- Handle online/offline state detection
- Manage sync intervals and triggers
- Orchestrate conflict resolution

**Key Features:**
```typescript
class SyncManager {
  // Initialization
  initialize(userId: string): Promise<void>

  // Sync operations
  syncAll(): Promise<SyncResult>
  syncTable(table: SyncableTable): Promise<TableSyncResult>

  // Queue management
  queueOperation(operation: SyncOperation): Promise<void>
  processQueue(): Promise<void>

  // State management
  getStatus(): SyncStatus
  pauseSync(): void
  resumeSync(): void

  // Conflict resolution
  resolveConflict(conflict: DataConflict): Promise<ResolvedData>
}
```

**Sync Triggers:**
- On app startup (after auth initialization)
- On window focus/visibility change (if online)
- On periodic interval (default: 60 seconds when active)
- On manual user action (pull-to-refresh)
- On specific store mutations (debounced)

---

### 2. Sync Queue (`src/lib/syncQueue.ts`)

**Purpose:** Persist pending operations when offline

**Storage:** IndexedDB (more reliable than localStorage for queues)

**Schema:**
```typescript
interface QueuedOperation {
  id: string;                    // Unique operation ID
  userId: string;                // User who made the change
  table: SyncableTable;          // Target table
  operation: 'upsert' | 'delete';
  data: Record<string, unknown>; // Data payload
  timestamp: number;             // When queued
  retries: number;               // Retry attempts
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'failed';
}
```

**Features:**
- Persistent storage across sessions
- Automatic retry with exponential backoff
- Priority-based processing (settings > stats > sessions)
- Failed operation handling
- Queue size limits (max 1000 operations)

---

### 3. Conflict Resolver (`src/lib/conflictResolver.ts`)

**Strategies:**

#### Last-Write-Wins (Default)
- **Use Case:** game_settings, profiles
- **Logic:** Compare `updated_at` timestamps, keep latest
- **Pros:** Simple, predictable
- **Cons:** May lose data if offline for long periods

#### Merge Strategy (Custom per table)
- **Use Case:** game_stats
- **Logic:** Custom merge rules per field
  - `total_games_played`: sum values
  - `best_score`: max value
  - `counties_learned`: union of sets
  - `streaks`: max value
- **Pros:** Preserves all meaningful data
- **Cons:** More complex logic

#### Append-Only
- **Use Case:** game_sessions, achievements (with progress)
- **Logic:** Never conflict - all records are unique or mergeable
- **Pros:** No data loss
- **Cons:** Can't handle updates

#### Max Progress
- **Use Case:** achievements
- **Logic:** Keep highest progress value for each achievement
- **Pros:** Natural for progress tracking
- **Cons:** None for this use case

**Conflict Detection:**
```typescript
interface ConflictDetection {
  hasConflict(local: Data, remote: Data): boolean;
  detectChanges(local: Data, remote: Data): string[];
  getConflictStrategy(table: SyncableTable): ConflictStrategy;
}
```

---

### 4. Sync Adapter Layer (`src/lib/syncAdapters/`)

**Purpose:** Adapt between Zustand stores and Supabase tables

**Adapters:**

#### `GameSettingsAdapter`
```typescript
interface GameSettingsAdapter {
  // Convert Zustand state to Supabase row
  toDatabase(settings: GameSettings): GameSettingsRow;

  // Convert Supabase row to Zustand state
  fromDatabase(row: GameSettingsRow): GameSettings;

  // Merge local and remote settings
  merge(local: GameSettings, remote: GameSettingsRow): GameSettings;
}
```

#### `GameStatsAdapter`
```typescript
interface GameStatsAdapter {
  toDatabase(stats: GameStats): GameStatsRow;
  fromDatabase(row: GameStatsRow): GameStats;

  // Custom merge logic for stats
  merge(local: GameStats, remote: GameStatsRow): GameStats {
    return {
      total_games_played: local.totalGamesPlayed + remote.total_games_played,
      best_score: Math.max(local.bestScore, remote.best_score),
      counties_learned: new Set([
        ...local.countiesLearned,
        ...remote.counties_learned
      ]),
      // ... more merge logic
    };
  }
}
```

#### `SessionAdapter` (Append-only)
```typescript
interface SessionAdapter {
  toDatabase(session: GameSession): GameSessionRow;
  fromDatabase(row: GameSessionRow): GameSession;

  // No merge needed - append only
}
```

**Key Features:**
- Type-safe conversions
- Field name mapping (camelCase ↔ snake_case)
- Data validation
- Serialization of complex types (Sets, Dates)

---

## Data Flow

### Initial Sync (App Startup)

```
1. App starts
   ↓
2. Auth initializes (restore session or sign in anonymously)
   ↓
3. SyncManager.initialize(userId)
   ↓
4. Check online status
   ↓
5. If online: Pull remote data
   │  ├─ Fetch all tables for user
   │  ├─ Compare with local data
   │  ├─ Resolve conflicts
   │  └─ Update local stores
   ↓
6. If offline: Use local data only
   ↓
7. Process any queued operations
   ↓
8. Start periodic sync (if online)
```

### Write Operation (User Changes Settings)

```
User changes setting in UI
   ↓
Component calls store action
   ↓
Store updates immediately (optimistic)
   ↓
UI reflects change instantly
   ↓
Store triggers sync hook
   ↓
SyncManager queues operation
   ↓
If online:
│  ├─ Push to Supabase immediately
│  └─ Remove from queue on success
│
If offline:
   └─ Keep in queue for later sync
```

### Conflict Scenario

```
User has been offline for hours
   ↓
User makes changes locally
   ↓
User comes back online
   ↓
SyncManager starts sync
   ↓
Pull remote data
   ↓
Detect conflicts (local vs remote updated_at)
   ↓
Apply conflict resolution strategy
   │
   ├─ Last-Write-Wins: Compare timestamps
   │     └─ Keep newer version
   │
   ├─ Merge: Combine data intelligently
   │     └─ Custom logic per table
   │
   └─ Append: No conflict, add both
   ↓
Update local stores with resolved data
   ↓
Push merged data to Supabase
   ↓
Mark sync complete
```

---

## Sync Strategies by Table

### Game Settings
- **Strategy:** Last-Write-Wins with version check
- **Reason:** Settings are user preferences - respect latest choice
- **Conflict Detection:** Compare `version` column
- **Sync Frequency:** Immediate on change, debounced 5s

### Game Stats
- **Strategy:** Custom merge (accumulate totals, max best scores)
- **Reason:** Stats should never decrease, combine progress
- **Conflict Detection:** Compare `updated_at` and values
- **Sync Frequency:** After game end, debounced 30s

### Game Sessions
- **Strategy:** Append-only
- **Reason:** Historical records, no updates
- **Conflict Detection:** None (unique session IDs)
- **Sync Frequency:** After game end, batch upload

### Achievements
- **Strategy:** Max progress
- **Reason:** Progress should only increase
- **Conflict Detection:** Compare progress values
- **Sync Frequency:** On unlock, debounced 10s

### Study Progress
- **Strategy:** Custom merge (union sets, max streaks)
- **Reason:** Study data accumulates, never decreases
- **Conflict Detection:** Compare sets and counters
- **Sync Frequency:** After study session, debounced 30s

---

## Error Handling

### Network Errors
```typescript
class NetworkErrorHandler {
  async handleError(error: Error, operation: SyncOperation) {
    if (error instanceof NetworkError) {
      // Queue operation for retry
      await syncQueue.add(operation, { retries: 3 });

      // Notify user if appropriate
      if (operation.priority === 'high') {
        notifyUser('Changes will sync when online');
      }
    }
  }
}
```

### Database Errors
```typescript
class DatabaseErrorHandler {
  async handleError(error: Error, operation: SyncOperation) {
    if (error instanceof DatabaseError) {
      if (error.code === 'PGRST116') {
        // RLS policy violation - user not authorized
        logger.error('Sync failed: authorization issue');

        // Clear invalid session
        await authStore.refreshSession();
      }
    }
  }
}
```

### Conflict Errors
```typescript
class ConflictErrorHandler {
  async handleError(conflict: DataConflict) {
    // Log conflict for debugging
    logger.warn('Data conflict detected', conflict);

    // Apply resolution strategy
    const resolved = await conflictResolver.resolve(conflict);

    // Update both local and remote
    await updateLocalStore(resolved);
    await updateSupabase(resolved);

    return resolved;
  }
}
```

### Retry Logic
```typescript
const retryConfig = {
  maxRetries: 3,
  backoffMultiplier: 2,
  initialDelayMs: 1000,
  maxDelayMs: 30000
};

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 0
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries >= retryConfig.maxRetries) {
      throw error;
    }

    const delay = Math.min(
      retryConfig.initialDelayMs * Math.pow(retryConfig.backoffMultiplier, retries),
      retryConfig.maxDelayMs
    );

    await sleep(delay);
    return retryWithBackoff(fn, retries + 1);
  }
}
```

---

## Performance Considerations

### Optimization Strategies

1. **Debounced Sync**
   - Group rapid changes into single sync operation
   - Configurable delay per table (settings: 5s, stats: 30s)

2. **Incremental Sync**
   - Only sync changed data
   - Use `last_synced_at` timestamp to fetch delta
   - Reduce bandwidth and processing time

3. **Batch Operations**
   - Batch multiple queue items into single request
   - Supabase supports bulk upsert
   - Reduces API calls

4. **Selective Sync**
   - Only sync tables user has interacted with
   - Skip unchanged tables
   - Reduces unnecessary operations

5. **Compression**
   - Compress large payloads (sessions, study data)
   - Use gzip for API requests
   - Reduces bandwidth usage

6. **Caching**
   - Cache remote data in memory
   - Reduce repeated fetches
   - TTL: 60 seconds

### Performance Metrics

```typescript
interface SyncMetrics {
  lastSyncTime: number;
  syncDuration: number;
  operationsProcessed: number;
  conflictsResolved: number;
  bytesUploaded: number;
  bytesDownloaded: number;
  errorCount: number;
}
```

### Budget Limits

- **Max queue size:** 1000 operations
- **Max retry attempts:** 3 per operation
- **Sync interval:** 60 seconds (when active)
- **Debounce delays:** 5-30 seconds (per table)
- **Request timeout:** 10 seconds
- **Batch size:** 50 operations max

---

## Security Considerations

### Row Level Security (RLS)

All Supabase tables have RLS enabled:
```sql
CREATE POLICY "Users can view own data"
  ON table_name FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON table_name FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Data Validation

```typescript
class DataValidator {
  validate(data: unknown, schema: Schema): ValidationResult {
    // Validate data types
    // Check required fields
    // Sanitize user input
    // Prevent injection attacks
  }
}
```

### Session Management

- JWT tokens stored securely in localStorage
- Auto-refresh before expiration
- Secure token transmission (HTTPS only)
- Session timeout: 1 hour (Supabase default)

### Privacy

- Anonymous users have no PII
- User IDs are opaque UUIDs
- No cross-user data access
- GDPR compliant (user can delete all data)

---

## Migration Strategy

### Phase 1: Foundation ✅ Complete
- Anonymous authentication
- Database schema
- Type definitions

### Phase 2: Sync Implementation (Current)
1. Create sync manager core
2. Implement queue system (IndexedDB)
3. Build conflict resolver
4. Create sync adapters

### Phase 3: Integration
1. Hook into Zustand stores
2. Add sync triggers
3. Implement UI indicators
4. Error handling and logging

### Phase 4: Testing & Optimization
1. Unit tests for sync logic
2. Integration tests for offline scenarios
3. Performance profiling
4. User acceptance testing

### Phase 5: Launch
1. Feature flag rollout
2. Monitor error rates
3. Performance metrics
4. User feedback collection

---

## API Design

### SyncManager API

```typescript
// Initialize sync for user
await syncManager.initialize(userId);

// Manual sync trigger
const result = await syncManager.syncAll();
console.log(result);
// {
//   success: true,
//   tables: {
//     game_settings: { synced: 1, conflicts: 0 },
//     game_stats: { synced: 1, conflicts: 0 },
//     game_sessions: { synced: 5, conflicts: 0 }
//   },
//   duration: 1234
// }

// Sync specific table
await syncManager.syncTable('game_settings');

// Get sync status
const status = syncManager.getStatus();
console.log(status);
// {
//   online: true,
//   syncing: false,
//   lastSync: 1634567890123,
//   queueSize: 0,
//   error: null
// }

// Pause/resume sync
syncManager.pauseSync();
syncManager.resumeSync();

// Listen to sync events
syncManager.on('syncStart', () => console.log('Sync started'));
syncManager.on('syncComplete', (result) => console.log('Sync done', result));
syncManager.on('syncError', (error) => console.error('Sync failed', error));
```

### Store Integration

```typescript
// Game store with sync hook
export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ... existing store logic

        updateSettings: (newSettings: Partial<GameSettings>) => {
          set((state) => ({
            settings: { ...state.settings, ...newSettings }
          }));

          // Trigger sync
          syncManager.queueOperation({
            table: 'game_settings',
            operation: 'upsert',
            data: get().settings
          });
        }
      }),
      { name: 'california-puzzle-game' }
    )
  )
);
```

---

## Monitoring & Observability

### Logging Strategy

```typescript
// Structured logging
logger.info('Sync completed', {
  userId,
  duration: 1234,
  tables: ['game_settings', 'game_stats'],
  conflicts: 0,
  errors: 0
});

// Error tracking
logger.error('Sync failed', {
  userId,
  table: 'game_stats',
  error: error.message,
  stack: error.stack,
  retries: 3
});
```

### Metrics Collection

```typescript
interface SyncAnalytics {
  track(event: string, properties: Record<string, unknown>): void;
}

analytics.track('sync_completed', {
  duration: 1234,
  operations: 5,
  conflicts: 0,
  bandwidth: 12340
});
```

### Health Checks

```typescript
async function healthCheck(): Promise<HealthStatus> {
  return {
    sync: {
      enabled: true,
      lastSync: syncManager.getLastSyncTime(),
      queueSize: syncManager.getQueueSize(),
      errors: syncManager.getErrorCount()
    },
    database: {
      connected: await checkDatabaseConnection(),
      latency: await measureDatabaseLatency()
    },
    network: {
      online: navigator.onLine,
      type: navigator.connection?.effectiveType
    }
  };
}
```

---

## Testing Strategy

### Unit Tests
- Conflict resolution algorithms
- Sync queue operations
- Data adapters (to/from database)
- Error handling logic

### Integration Tests
- Full sync flow (pull → merge → push)
- Offline scenario (queue → online → process)
- Conflict resolution scenarios
- Multi-device sync

### E2E Tests
- User makes changes offline
- User comes online, changes sync
- User makes changes on multiple devices
- Conflict resolution user experience

### Performance Tests
- Sync 1000 operations
- Large payload sync (100KB+)
- Concurrent sync operations
- Network latency simulation

---

## Rollout Plan

### Week 1: Core Implementation
- [ ] SyncManager skeleton
- [ ] SyncQueue with IndexedDB
- [ ] Basic conflict resolver
- [ ] Settings adapter

### Week 2: Adapter Development
- [ ] GameStats adapter
- [ ] Session adapter
- [ ] Achievement adapter
- [ ] Study progress adapter

### Week 3: Integration
- [ ] Hook into Zustand stores
- [ ] Add sync triggers
- [ ] Online/offline detection
- [ ] Error handling

### Week 4: UI & Polish
- [ ] Sync status indicators
- [ ] Manual refresh control
- [ ] Error notifications
- [ ] Settings panel

### Week 5: Testing
- [ ] Unit test coverage
- [ ] Integration tests
- [ ] Performance profiling
- [ ] Bug fixes

### Week 6: Launch
- [ ] Feature flag (10% rollout)
- [ ] Monitor metrics
- [ ] Increase to 50%
- [ ] Full rollout

---

## Risks & Mitigations

### Risk: Data Loss
- **Mitigation:** Queue persists in IndexedDB (survives page refresh)
- **Fallback:** Export/import functionality

### Risk: Sync Conflicts
- **Mitigation:** Clear conflict resolution strategies
- **Fallback:** User can choose version in settings

### Risk: Performance Impact
- **Mitigation:** Debouncing, batching, selective sync
- **Fallback:** Disable sync option in settings

### Risk: API Rate Limits
- **Mitigation:** Batch operations, respect rate limits
- **Fallback:** Exponential backoff, queue operations

### Risk: User Confusion
- **Mitigation:** Clear UI indicators, helpful error messages
- **Fallback:** Comprehensive documentation

---

## Success Metrics

### Technical Metrics
- Sync success rate > 99%
- Average sync time < 2 seconds
- Conflict rate < 1%
- Queue processing time < 5 seconds
- Error rate < 0.1%

### User Experience Metrics
- Time to first sync < 1 second
- Offline functionality works seamlessly
- No data loss incidents
- User satisfaction > 4.5/5
- Support tickets < 10/month

### Business Metrics
- User retention improved
- Multi-device usage increased
- Premium conversion (future)
- Engagement metrics up

---

## Future Enhancements

### Phase 7: Advanced Features
1. **Real-time Sync** (Supabase Realtime)
   - Live updates across devices
   - Collaborative features

2. **Selective Sync**
   - User chooses what to sync
   - Reduce bandwidth for mobile users

3. **Account Migration**
   - Convert anonymous to registered
   - Preserve all data

4. **Conflict Resolution UI**
   - Let user choose version
   - Show diff of changes

5. **Sync Analytics Dashboard**
   - Show sync history
   - Data usage stats
   - Device list

---

## Architecture Decision Records (ADRs)

### ADR-001: Offline-First Architecture
**Status:** Accepted
**Date:** 2025-10-11

**Context:** Users may play without internet connectivity.

**Decision:** localStorage is the source of truth. Supabase is backup/sync target.

**Consequences:**
- ✅ Instant app startup
- ✅ Works offline
- ✅ No network dependency
- ❌ Requires sync logic
- ❌ Potential conflicts

---

### ADR-002: Last-Write-Wins for Settings
**Status:** Accepted
**Date:** 2025-10-11

**Context:** Settings rarely conflict in single-user scenarios.

**Decision:** Use simple last-write-wins with timestamp comparison.

**Consequences:**
- ✅ Simple to implement
- ✅ Predictable behavior
- ✅ Fast conflict resolution
- ❌ May lose changes if offline long time
- ❌ Not suitable for collaborative edits

---

### ADR-003: Merge Strategy for Stats
**Status:** Accepted
**Date:** 2025-10-11

**Context:** Stats should accumulate, never decrease.

**Decision:** Custom merge logic per field (sum, max, union).

**Consequences:**
- ✅ Never lose progress
- ✅ Combine data from multiple devices
- ✅ Mathematically sound
- ❌ More complex logic
- ❌ Requires careful testing

---

### ADR-004: IndexedDB for Queue
**Status:** Accepted
**Date:** 2025-10-11

**Context:** localStorage has size limits and performance issues.

**Decision:** Use IndexedDB for sync queue persistence.

**Consequences:**
- ✅ Larger storage capacity
- ✅ Better performance
- ✅ Survives crashes
- ❌ More complex API
- ❌ Browser compatibility (99%+ support)

---

### ADR-005: Debounced Sync
**Status:** Accepted
**Date:** 2025-10-11

**Context:** User may make rapid changes (e.g., adjusting volume).

**Decision:** Debounce sync operations with configurable delay.

**Consequences:**
- ✅ Reduces API calls
- ✅ Better performance
- ✅ Lower bandwidth usage
- ❌ Slight sync delay
- ❌ More complex state management

---

## Appendix

### A. Database Schema Reference

See: `supabase/migrations/001_initial_schema.sql`

Key tables:
- `profiles`
- `game_settings`
- `game_stats`
- `game_sessions`
- `achievements`
- `leaderboard`

### B. Zustand Store Reference

See:
- `src/stores/authStore.ts`
- `src/stores/gameStore.ts`
- `src/stores/studyStore.ts`
- `src/stores/themeStore.ts`

### C. Supabase Client Reference

See:
- `src/lib/supabase.ts`
- `src/types/auth.ts`

### D. Related Documents

- [Authentication Integration Plan](./authentication-plan.md)
- [Database Schema Documentation](./database-schema.md)
- [API Reference](./api-reference.md)

---

## Glossary

- **Offline-First:** Architecture where app works without network, sync happens in background
- **Optimistic Update:** UI updates immediately, sync happens asynchronously
- **Last-Write-Wins:** Conflict resolution where most recent change wins
- **Merge Strategy:** Intelligent combination of conflicting data
- **Sync Queue:** Persistent storage of pending sync operations
- **RLS:** Row Level Security - database-level access control
- **Debouncing:** Delaying execution until rapid changes stop

---

**Document End**

*This architecture document will be updated as implementation progresses and new requirements emerge.*
