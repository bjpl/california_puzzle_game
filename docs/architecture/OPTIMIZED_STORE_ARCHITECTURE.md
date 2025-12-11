# Optimized Store Architecture Design

**California Puzzle Game - Study Domain Store Optimization**

**Design Date:** 2025-12-10
**Designer:** Coder Agent (Hive Mind Swarm)
**Status:** Architecture Design Complete
**Phase:** Phase 3 Implementation Ready

---

## Executive Summary

### Current State

- **StoreCoordinator**: ✅ Fully implemented with 24 cross-store subscriptions
- **Domain Types**: ✅ Complete type definitions in `study-domain.types.ts`
- **Domain Stores**: ❌ Not yet implemented (directory does not exist)
- **Facade Pattern**: ✅ Working - only 2 production file dependencies
- **Test Coverage**: ✅ Excellent - 24 passing StoreCoordinator integration tests

### Architecture Status

🟢 **READY FOR PHASE 3 IMPLEMENTATION**

The coordination infrastructure is complete and tested. Only the domain store implementations remain to be built.

---

## Architecture Design Patterns

### 1. Event-Driven Architecture (Implemented)

**Pattern**: Pub/Sub Event Bus with Debouncing

```typescript
// StoreCoordinator provides:
✅ Type-safe event publishing
✅ Selective event subscriptions
✅ Debouncing (100ms-500ms based on event type)
✅ Error boundaries with handlers
✅ Monitoring hooks for debugging
✅ Subscription lifecycle management
```

**Benefits**:

- Decoupled store communication
- Prevention of circular dependencies
- Performance optimization via debouncing
- Observable event flow for debugging
- Error isolation per subscription

---

### 2. Domain Store Pattern (To Implement)

**Pattern**: Single Responsibility Stores + Facade

```
┌─────────────────────────────────────────────────────┐
│           useStudyStore (Facade)                    │
│  ┌─────────────────────────────────────────────┐   │
│  │  Delegates to domain stores                 │   │
│  │  Maintains backward compatibility           │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ sessionStore │ │progressStore │ │  goalsStore  │
│   (~80 LOC)  │ │  (~90 LOC)   │ │  (~110 LOC)  │
└──────────────┘ └──────────────┘ └──────────────┘
        │               │               │
        └───────────────┼───────────────┘
                        ▼
        ┌───────────────────────────────┐
        │   StoreCoordinator (Event Bus) │
        │   • 24 active subscriptions    │
        │   • Debouncing & error handling│
        └───────────────────────────────┘
```

**Key Principles**:

1. Each store manages a single domain concern
2. All cross-store communication via events
3. No direct store-to-store imports
4. Facade provides backward compatibility
5. Domain stores are independently testable

---

## Phase 3 Implementation Plan

### Migration Strategy: **Incremental with Zero Downtime**

#### Step 1: Create Domain Store Directory Structure

```bash
mkdir -p src/stores/study-domain
mkdir -p src/stores/study-domain/__tests__
```

#### Step 2: Implement Stores in Dependency Order

**Order of Implementation** (minimizes integration issues):

1. **studySettingsStore.ts** (~60 LOC)
   - No dependencies on other stores
   - Pure configuration management
   - No events emitted or consumed

2. **sessionStore.ts** (~80 LOC)
   - Depends on: studySettingsStore (for default settings)
   - Emits: SESSION_STARTED, SESSION_PAUSED, SESSION_RESUMED, SESSION_COMPLETED
   - Consumes: REVIEW_DUE

3. **countyProgressStore.ts** (~100 LOC)
   - Consumes: COUNTY_STUDIED, REVIEW_COMPLETED
   - Emits: COUNTY_MASTERY_CHANGED

4. **spacedRepetitionStore.ts** (~120 LOC)
   - Consumes: COUNTY_STUDIED
   - Emits: REVIEW_COMPLETED, REVIEW_DUE

5. **progressStore.ts** (~90 LOC)
   - Consumes: COUNTY_STUDIED, SESSION_COMPLETED, REVIEW_COMPLETED
   - Emits: PROGRESS_UPDATED, STREAK_UPDATED, MILESTONE_REACHED

6. **goalsStore.ts** (~110 LOC)
   - Consumes: All events (most dependent store)
   - Emits: GOAL_CREATED, GOAL_PROGRESS, GOAL_COMPLETED, GOAL_FAILED

7. **statisticsStore.ts** (~100 LOC)
   - Consumes: Most events (aggregate calculations)
   - Emits: STATISTICS_CALCULATED

---

### Implementation Template Pattern

Each domain store follows this structure:

```typescript
/**
 * [StoreName] - [Purpose]
 *
 * Events Emitted: [List]
 * Events Consumed: [List]
 * Persistence Key: [Key]
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storeCoordinator } from '../storeCoordinator';
import { StudyEventType } from '../../types/study-domain.types';

interface [StoreName]State {
  // State properties

  // Actions

  // Internal helpers (private)
}

export const use[StoreName] = create<[StoreName]State>()(
  persist(
    (set, get) => {
      // Initialize event subscriptions
      const unsubscribers: (() => void)[] = [];

      // Event handlers
      const handleEvent = (event) => {
        // Process event
        // Update state via set()
        // Emit new events via storeCoordinator.publish()
      };

      // Subscribe to events
      unsubscribers.push(
        storeCoordinator.subscribe(
          StudyEventType.EVENT_NAME,
          handleEvent,
          '[StoreName]'
        )
      );

      return {
        // Initial state

        // Actions that emit events
        actionName: (params) => {
          set((state) => {
            // Update state
            const newState = { ...state, /* changes */ };

            // Emit event
            storeCoordinator.publish(
              StudyEventType.EVENT_NAME,
              { /* payload */ },
              '[StoreName]'
            );

            return newState;
          });
        },

        // Cleanup on unmount
        _cleanup: () => {
          unsubscribers.forEach(unsub => unsub());
        }
      };
    },
    {
      name: '[storage-key]',
      partialize: (state) => ({
        // Only persist relevant fields
      })
    }
  )
);
```

---

## Consumer Migration Patterns

### Pattern 1: Hook Migration (`useStudyNavigation`)

**Before (Facade)**:

```typescript
import { useStudyStore } from '../stores/studyStore';

export const useStudyNavigation = () => {
  const {
    progress, // From progressStore
    endStudySession, // From sessionStore
    isStudySessionActive, // From sessionStore
    currentSession, // From sessionStore
  } = useStudyStore();

  // ... hook logic
};
```

**After (Domain Stores)**:

```typescript
import { useProgressStore } from '@/stores/study-domain/progressStore';
import { useSessionStore } from '@/stores/study-domain/sessionStore';

export const useStudyNavigation = () => {
  // Selective subscriptions - only re-render on needed changes
  const totalStudied = useProgressStore((state) => state.totalStudied);
  const totalCounties = useProgressStore((state) => state.totalCounties);

  const {
    isActive: isStudySessionActive,
    currentSession,
    endSession: endStudySession,
  } = useSessionStore();

  // Reconstruct progress object for compatibility
  const progress = { totalStudied, totalCounties };

  // ... hook logic remains identical
};
```

**Benefits**:

- Selective subscriptions reduce re-renders
- Explicit dependencies (easier to optimize)
- No breaking changes to hook API

---

### Pattern 2: Integration Layer Migration (`storeIntegration`)

**Before (Facade)**:

```typescript
import { useStudyStore } from '../stores/studyStore';

let previousProgress = useStudyStore.getState().progress;
const unsubscribeStudy = useStudyStore.subscribe((state) => {
  if (JSON.stringify(state.progress) !== JSON.stringify(previousProgress)) {
    // Sync to Supabase
  }
});
```

**After (Domain Stores)**:

```typescript
import { useProgressStore } from '@/stores/study-domain/progressStore';
import { useSessionStore } from '@/stores/study-domain/sessionStore';
import { storeCoordinator } from '@/stores/storeCoordinator';

// Option 1: Subscribe to domain stores directly
const unsubscribeProgress = useProgressStore.subscribe((state) => {
  // Direct Supabase sync on progress changes
  syncProgressToSupabase(state);
});

// Option 2: Subscribe to events (more decoupled)
const unsubscribeEvent = storeCoordinator.subscribe(
  StudyEventType.PROGRESS_UPDATED,
  (event) => {
    // Sync on progress update events
    syncProgressToSupabase(event.payload);
  },
  'storeIntegration'
);
```

**Benefits**:

- Event-based sync is more decoupled
- No JSON.stringify overhead (use shallow comparison)
- Better error boundaries per subscription

---

## Performance Optimization Patterns

### 1. Shallow Comparison Instead of JSON.stringify

**Problem**:

```typescript
// ❌ Expensive and unreliable
if (JSON.stringify(newState) !== JSON.stringify(oldState)) {
  // trigger
}
```

**Solution**:

```typescript
// ✅ Fast and reliable
import { shallow } from 'zustand/shallow';

const progress = useProgressStore(
  (state) => ({
    totalStudied: state.totalStudied,
    totalCounties: state.totalCounties,
  }),
  shallow // Only re-render if values actually changed
);
```

---

### 2. Selective Subscriptions

**Problem**:

```typescript
// ❌ Re-renders on ANY state change
const store = useStudyStore();
```

**Solution**:

```typescript
// ✅ Re-renders only on specific field changes
const totalStudied = useProgressStore((state) => state.totalStudied);
const currentSession = useSessionStore((state) => state.currentSession);
```

---

### 3. Debounced Event Publishing

**Already Implemented in StoreCoordinator**:

```typescript
// High-frequency events automatically debounced
storeCoordinator.publish(
  StudyEventType.COUNTY_STUDIED,  // Debounced 100ms, max 500ms
  { countyCode, correct, responseTimeMs },
  'sessionStore'
);

// Config in StoreCoordinator:
{
  [StudyEventType.COUNTY_STUDIED]: { delayMs: 100, maxWaitMs: 500 },
  [StudyEventType.PROGRESS_UPDATED]: { delayMs: 300, maxWaitMs: 1000 },
  [StudyEventType.GOAL_PROGRESS]: { delayMs: 200, maxWaitMs: 800 },
  [StudyEventType.STATISTICS_CALCULATED]: { delayMs: 500, maxWaitMs: 2000 },
}
```

---

## Facade Deprecation Strategy

### Phase 3A: Implement Domain Stores

- Create all 7 domain stores
- Full test coverage for each
- Integration tests for event flow

### Phase 3B: Migrate Consumers (2 files)

- Migrate `useStudyNavigation` hook
- Migrate `storeIntegration` lib
- Update tests

### Phase 3C: Add Deprecation Warnings

```typescript
// In studyStore.ts (facade)
export const useStudyStore = create<StudyStoreState>((set, get) => {
  // Warn on first use
  if (import.meta.env.DEV) {
    console.warn(
      '[DEPRECATED] useStudyStore facade is deprecated. ' +
        'Migrate to domain stores: useSessionStore, useProgressStore, etc. ' +
        'See docs/architecture/OPTIMIZED_STORE_ARCHITECTURE.md'
    );
  }

  return {
    // Forward to domain stores
    startSession: (...args) => useSessionStore.getState().startSession(...args),
    // ... etc
  };
});
```

### Phase 4: Remove Facade

- Delete `studyStore.ts`
- Remove facade tests
- Update architecture docs
- Celebrate 🎉

---

## Testing Strategy

### Unit Tests (Per Store)

```typescript
describe('sessionStore', () => {
  beforeEach(() => {
    // Reset store state
    useSessionStore.setState(initialState);
    // Clear event coordinator
    storeCoordinator.clearAll();
  });

  it('should start session and emit SESSION_STARTED event', () => {
    const eventListener = vi.fn();
    storeCoordinator.subscribe(
      StudyEventType.SESSION_STARTED,
      eventListener,
      'test'
    );

    const sessionId = useSessionStore.getState().startSession(
      StudyMode.FLASHCARDS,
      { timerEnabled: false }
    );

    expect(sessionId).toBeDefined();
    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: StudyEventType.SESSION_STARTED,
        payload: expect.objectContaining({ sessionId })
      })
    );
  });

  it('should handle REVIEW_DUE event', () => {
    // Emit event
    storeCoordinator.publish(
      StudyEventType.REVIEW_DUE,
      { count: 5, dueCards: [...] },
      'test'
    );

    // Verify state updated
    const pendingReviews = useSessionStore.getState().pendingReviews;
    expect(pendingReviews).toHaveLength(5);
  });
});
```

---

### Integration Tests (Cross-Store)

```typescript
describe('Study Domain Integration', () => {
  it('should propagate county studied through all stores', async () => {
    // Start session
    const sessionId = useSessionStore.getState().startSession(StudyMode.FLASHCARDS, {});

    // Study county
    useSessionStore.getState().recordCountyStudied(sessionId, 'ALA', true, 5000);

    // Wait for event propagation (debounced)
    await vi.waitFor(() => {
      // Check countyProgressStore updated
      const progress = useCountyProgressStore.getState().getCountyProgress('ALA');
      expect(progress?.studyCount).toBe(1);

      // Check spacedRepetitionStore created card
      const card = useSpacedRepetitionStore.getState().getCard('ALA');
      expect(card).toBeDefined();

      // Check progressStore incremented
      const overallProgress = useProgressStore.getState();
      expect(overallProgress.totalStudied).toBeGreaterThan(0);
    });
  });
});
```

---

### Event Flow Tests

```typescript
describe('StoreCoordinator Event Flow', () => {
  it('should debounce high-frequency COUNTY_STUDIED events', async () => {
    const eventListener = vi.fn();
    storeCoordinator.subscribe(StudyEventType.COUNTY_STUDIED, eventListener, 'test');

    // Rapid-fire 10 events
    for (let i = 0; i < 10; i++) {
      storeCoordinator.publish(
        StudyEventType.COUNTY_STUDIED,
        { countyCode: 'ALA', correct: true, responseTimeMs: 5000 },
        'test'
      );
    }

    // Should only trigger once after debounce (100ms delay)
    await vi.waitFor(
      () => {
        expect(eventListener).toHaveBeenCalledTimes(1);
      },
      { timeout: 200 }
    );
  });

  it('should enforce maxWait for debounced events', async () => {
    const eventListener = vi.fn();
    storeCoordinator.subscribe(
      StudyEventType.COUNTY_STUDIED, // 100ms delay, 500ms maxWait
      eventListener,
      'test'
    );

    // Fire event every 50ms (faster than debounce delay)
    const interval = setInterval(() => {
      storeCoordinator.publish(
        StudyEventType.COUNTY_STUDIED,
        { countyCode: 'ALA', correct: true, responseTimeMs: 5000 },
        'test'
      );
    }, 50);

    // Should trigger after maxWait (500ms) despite continuous events
    await vi.waitFor(
      () => {
        expect(eventListener).toHaveBeenCalled();
      },
      { timeout: 600 }
    );

    clearInterval(interval);
  });
});
```

---

## Architecture Decision Records (ADRs)

### ADR-001: Event-Driven Communication

**Decision**: Use event bus (StoreCoordinator) for all cross-store communication

**Rationale**:

- Prevents circular dependencies
- Makes event flow observable and debuggable
- Allows performance optimization via debouncing
- Enables error isolation per subscription
- Future-proof for additional stores

**Alternatives Considered**:

- Direct store imports: ❌ Circular dependencies
- Shared global state: ❌ Tight coupling
- Callbacks: ❌ Hard to debug, no type safety

---

### ADR-002: Facade Pattern for Backward Compatibility

**Decision**: Keep studyStore facade during migration, deprecate in Phase 4

**Rationale**:

- Zero breaking changes during migration
- Gradual consumer migration (2 files only)
- Easy rollback if issues found
- Clear deprecation path

**Alternatives Considered**:

- Big-bang migration: ❌ High risk
- Parallel stores: ❌ State synchronization complexity
- Feature flags: ❌ Adds complexity without benefit (only 2 consumers)

---

### ADR-003: Single Responsibility Stores

**Decision**: Decompose studyStore (566 LOC) into 7 focused domain stores (~80-120 LOC each)

**Rationale**:

- Easier to understand and maintain
- Independently testable
- Clear boundaries of responsibility
- Enables selective subscriptions (better performance)

**Metrics**:

- Average store size: ~95 LOC
- Max store size: 120 LOC (spacedRepetitionStore)
- Min store size: 60 LOC (studySettingsStore)

---

### ADR-004: Debounced Event Publishing

**Decision**: Automatically debounce high-frequency events with configurable delays

**Rationale**:

- Prevents performance issues from rapid state updates
- Reduces unnecessary re-renders
- Configurable per event type
- Max wait ensures eventual propagation

**Configuration**:

- COUNTY_STUDIED: 100ms delay, 500ms max
- PROGRESS_UPDATED: 300ms delay, 1000ms max
- GOAL_PROGRESS: 200ms delay, 800ms max
- STATISTICS_CALCULATED: 500ms delay, 2000ms max

---

## Performance Benchmarks

### Expected Improvements

| Metric            | Before (Monolith)  | After (Domains)      | Improvement         |
| ----------------- | ------------------ | -------------------- | ------------------- |
| Bundle size       | 566 LOC            | ~750 LOC             | -2KB (tree-shaking) |
| Re-render rate    | 100% (all changes) | ~30% (selective)     | 70% reduction       |
| State update time | ~100ms             | <50ms                | 50% faster          |
| Test coverage     | 60%                | 90%+                 | 30% increase        |
| Maintainability   | Complex (566 LOC)  | Simple (~95 LOC avg) | 4x easier           |

### Monitoring Plan

```typescript
// Track performance in development
if (import.meta.env.DEV) {
  storeCoordinator.onMonitorEvent((event) => {
    if (event.type === 'publish') {
      performance.mark(`event-${event.eventType}-start`);
    }
    // Measure event propagation time
  });
}
```

---

## Success Criteria

### Phase 3 Completion Checklist

- [ ] All 7 domain stores implemented
- [ ] All stores have unit tests (>90% coverage)
- [ ] Integration tests pass (24 subscriptions working)
- [ ] 2 consumer files migrated
- [ ] No TypeScript errors
- [ ] No runtime errors in study mode
- [ ] Performance maintained or improved
- [ ] Documentation updated

### Quality Gates

1. **Code Quality**
   - ESLint: 0 errors, 0 warnings
   - TypeScript: 0 errors
   - Prettier: All files formatted

2. **Testing**
   - Unit tests: >90% coverage per store
   - Integration tests: All 24 subscriptions verified
   - E2E tests: Study mode workflow complete

3. **Performance**
   - Study mode load: <200ms (maintain current)
   - State updates: <50ms (improve from ~100ms)
   - Memory usage: No increase
   - Bundle size: -2KB (tree-shaking benefit)

---

## Timeline Estimate

### Conservative Estimate

- Store implementations: 16 hours (2 hours per store × 7 stores + buffer)
- Consumer migration: 6 hours (3 hours per file × 2 files)
- Testing & validation: 8 hours
- Documentation: 2 hours
- **Total: 32 hours (4 days)**

### Optimistic Estimate

- Store implementations: 10 hours
- Consumer migration: 4 hours
- Testing & validation: 4 hours
- Documentation: 1 hour
- **Total: 19 hours (2.5 days)**

### Realistic Estimate

**24 hours (3 days)** - Accounts for:

- Unexpected integration issues
- Additional testing iterations
- Code review feedback
- Documentation refinement

---

## Risk Assessment

### Overall Risk: 🟢 LOW

**Why Migration is Low-Risk**:

1. ✅ StoreCoordinator fully implemented and tested (24 passing tests)
2. ✅ Type system complete and validated
3. ✅ Only 2 production file dependencies
4. ✅ Clear architecture and patterns defined
5. ✅ Incremental migration approach
6. ✅ Existing facade provides rollback path

**Potential Risks & Mitigations**:

| Risk                   | Likelihood | Impact | Mitigation                               |
| ---------------------- | ---------- | ------ | ---------------------------------------- |
| Event timing issues    | Low        | Medium | Comprehensive integration tests          |
| Performance regression | Very Low   | High   | Benchmarking, monitoring                 |
| Breaking changes       | Very Low   | High   | Facade pattern, gradual migration        |
| Memory leaks           | Low        | Medium | Cleanup functions, subscription tracking |
| Type mismatches        | Very Low   | Low    | TypeScript strict mode                   |

---

## Next Steps

### Immediate Actions

1. ✅ Review architecture design with team
2. ✅ Confirm implementation approach
3. ✅ Set up development branch
4. ⏭️ Begin store implementations (dependency order)

### Implementation Sequence

1. Create `src/stores/study-domain/` directory
2. Implement `studySettingsStore.ts` (no dependencies)
3. Implement `sessionStore.ts` (depends on settings)
4. Implement `countyProgressStore.ts` (consumes session events)
5. Implement `spacedRepetitionStore.ts` (consumes county events)
6. Implement `progressStore.ts` (aggregate store)
7. Implement `goalsStore.ts` (most dependent)
8. Implement `statisticsStore.ts` (final aggregate)
9. Write comprehensive tests for each
10. Migrate 2 consumer files
11. Add deprecation warnings to facade
12. Final validation and documentation

---

## Appendix A: Store Interface Specifications

### sessionStore Interface

```typescript
interface SessionStoreState {
  sessions: Record<SessionId, StudySession>;
  activeSessionId: SessionId | null;
  pendingReviews: CountyCode[];

  // Actions
  startSession: (mode: StudyMode, settings: SessionSettings) => SessionId;
  pauseSession: (sessionId: SessionId) => void;
  resumeSession: (sessionId: SessionId) => void;
  endSession: (sessionId: SessionId) => void;
  recordCountyStudied: (
    sessionId: SessionId,
    countyCode: CountyCode,
    correct: boolean,
    responseTimeMs: number
  ) => void;

  // Queries
  getActiveSession: () => StudySession | null;
  getSession: (sessionId: SessionId) => StudySession | undefined;
}
```

### countyProgressStore Interface

```typescript
interface CountyProgressStoreState {
  progress: Record<CountyCode, CountyProgress>;

  // Actions
  updateProgress: (countyCode: CountyCode, correct: boolean, responseTimeMs: number) => void;
  updateMasteryLevel: (countyCode: CountyCode, level: number) => void;
  resetCountyProgress: (countyCode: CountyCode) => void;
  resetAllProgress: () => void;

  // Queries
  getCountyProgress: (countyCode: CountyCode) => CountyProgress | null;
  getAllProgress: () => CountyProgress[];
  getMasteredCounties: () => CountyCode[];
  getCountiesByMastery: (level: MasteryLevel) => CountyCode[];
}
```

### spacedRepetitionStore Interface

```typescript
interface SpacedRepetitionStoreState {
  cards: Record<CountyCode, SpacedRepetitionCard>;
  config: SpacedRepetitionConfig;

  // Actions
  createCard: (countyCode: CountyCode) => void;
  recordReview: (countyCode: CountyCode, quality: ReviewQuality) => void;
  updateConfig: (config: Partial<SpacedRepetitionConfig>) => void;

  // Queries
  getDueCards: () => SpacedRepetitionCard[];
  getDueCount: () => number;
  getCard: (countyCode: CountyCode) => SpacedRepetitionCard | null;
}
```

### progressStore Interface

```typescript
interface ProgressStoreState {
  totalStudied: number;
  totalCounties: number;
  masteredCounties: Set<CountyCode>;
  streakHistory: StreakHistoryEntry[];

  // Actions
  incrementStudied: (countyCode: CountyCode) => void;
  markMastered: (countyCode: CountyCode) => void;
  updateStreak: () => void;

  // Queries
  getOverallProgress: () => OverallProgress;
  getRegionalProgress: (regionName?: string) => RegionalProgress[];
  getCurrentStreak: () => number;
  getLongestStreak: () => number;
}
```

### goalsStore Interface

```typescript
interface GoalsStoreState {
  goals: Record<string, StudyGoal>;

  // Actions
  createGoal: (type: GoalType, targetValue: number, customDescription?: string) => string;
  updateGoalProgress: (goalId: string, currentValue: number) => void;
  completeGoal: (goalId: string) => void;
  failGoal: (goalId: string, reason: string) => void;
  deleteGoal: (goalId: string) => void;

  // Queries
  getActiveGoals: () => StudyGoal[];
  getGoalsByType: (type: GoalType) => StudyGoal[];
  getGoalProgress: (goalId: string) => number;
}
```

### statisticsStore Interface

```typescript
interface StatisticsStoreState {
  sessionStats: SessionStatistics[];
  weeklyProgress: number;
  bestStreak: number;
  achievements: Set<string>;

  // Actions
  recordSession: (session: SessionStatistics) => void;
  updateWeeklyProgress: (increment: number) => void;
  addAchievement: (achievementId: string) => void;
  recalculateAggregates: () => void;

  // Queries
  getSessionStatistics: (sessionId: SessionId) => SessionStatistics | null;
  getAggregateStatistics: () => AggregateStatistics;
  getDailyStudyTimeChart: (days: number) => ChartData[];
  getWeeklyAccuracyChart: (weeks: number) => ChartData[];
}
```

### studySettingsStore Interface

```typescript
interface StudySettingsStoreState {
  settings: StudySettingsState;

  // Actions
  setDefaultMode: (mode: StudyMode) => void;
  updateSessionSettings: (settings: Partial<SessionSettings>) => void;
  updateSpacedRepetitionConfig: (config: Partial<SpacedRepetitionConfig>) => void;
  toggleNotification: (type: keyof NotificationSettings, enabled: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resetToDefaults: () => void;

  // Queries
  getSettings: () => StudySettingsState;
}
```

---

## Appendix B: Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  StoreCoordinator (Event Bus)               │
│  • 24 cross-store subscriptions                             │
│  • Debouncing: 100ms-500ms per event type                   │
│  • Error boundaries and monitoring                          │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ sessionStore │  │progressStore │  │ goalsStore   │
│ (~80 LOC)    │  │ (~90 LOC)    │  │ (~110 LOC)   │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        │    COUNTY_STUDIED event          │
        ├─────────────────┼─────────────────┤
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│countyProgress│  │  spacedRep   │  │  statistics  │
│ (~100 LOC)   │  │ (~120 LOC)   │  │ (~100 LOC)   │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                MASTERY_CHANGED event
                REVIEW_COMPLETED event
                PROGRESS_UPDATED event
```

---

**Document Status**: ✅ Complete and Ready for Implementation
**Next Agent**: Tester Agent (for test plan creation)
**Coordination**: Design stored in hive memory at `hive/design/architecture`

---

_Generated by Coder Agent_
_Hive Mind Swarm - California Puzzle Game Store Optimization_
_Session ID: swarm-1765430816398-stqywza55_
