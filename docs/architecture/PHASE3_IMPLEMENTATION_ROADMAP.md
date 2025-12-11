# Phase 3 Implementation Roadmap

**California Puzzle Game - Domain Store Migration**

**Created:** 2025-12-10
**Status:** Ready for Implementation
**Estimated Timeline:** 3 days (24 hours)

---

## Quick Reference

- **Architecture Design**: `OPTIMIZED_STORE_ARCHITECTURE.md`
- **Domain Analysis**: `STUDY_DOMAIN_STORE_ARCHITECTURE.md`
- **Consumer Analysis**: `STUDY_STORE_CONSUMERS_ANALYSIS.md`
- **Current Status**: StoreCoordinator complete (24 subscriptions), Domain stores pending

---

## Implementation Sequence

### Day 1: Foundation Stores (6-8 hours)

#### Task 1.1: Create Directory Structure (15 min)

```bash
mkdir -p src/stores/study-domain
mkdir -p src/stores/study-domain/__tests__
```

#### Task 1.2: Implement studySettingsStore.ts (1 hour)

- **Priority**: Highest (no dependencies)
- **LOC**: ~60
- **Tests**: Unit tests for settings CRUD
- **Validation**: All getters/setters work

#### Task 1.3: Implement sessionStore.ts (2 hours)

- **Priority**: High (foundation for session tracking)
- **LOC**: ~80
- **Dependencies**: studySettingsStore (for defaults)
- **Events Emitted**: SESSION_STARTED, SESSION_PAUSED, SESSION_RESUMED, SESSION_COMPLETED
- **Events Consumed**: REVIEW_DUE
- **Tests**:
  - Session lifecycle (start/pause/resume/end)
  - Event emission verification
  - Metrics calculation
- **Validation**: All 4 session events emit correctly

#### Task 1.4: Implement countyProgressStore.ts (2 hours)

- **Priority**: High (core tracking)
- **LOC**: ~100
- **Events Emitted**: COUNTY_MASTERY_CHANGED
- **Events Consumed**: COUNTY_STUDIED, REVIEW_COMPLETED
- **Tests**:
  - Progress tracking
  - Mastery level calculation
  - Event handling
- **Validation**: Mastery levels calculate correctly

#### Task 1.5: Implement spacedRepetitionStore.ts (2.5 hours)

- **Priority**: Medium (SM-2 algorithm complexity)
- **LOC**: ~120
- **Events Emitted**: REVIEW_COMPLETED, REVIEW_DUE
- **Events Consumed**: COUNTY_STUDIED
- **Tests**:
  - SM-2 algorithm accuracy
  - Card creation and updates
  - Due card calculations
- **Validation**: SM-2 intervals match expected values

---

### Day 2: Aggregate Stores (6-8 hours)

#### Task 2.1: Implement progressStore.ts (2 hours)

- **Priority**: High (aggregate progress)
- **LOC**: ~90
- **Events Emitted**: PROGRESS_UPDATED, STREAK_UPDATED, MILESTONE_REACHED
- **Events Consumed**: COUNTY_STUDIED, SESSION_COMPLETED, REVIEW_COMPLETED
- **Tests**:
  - Overall progress calculation
  - Regional progress aggregation
  - Streak tracking logic
  - Milestone detection
- **Validation**: Streak calculations accurate

#### Task 2.2: Implement goalsStore.ts (2.5 hours)

- **Priority**: Medium (depends on many events)
- **LOC**: ~110
- **Events Emitted**: GOAL_CREATED, GOAL_PROGRESS, GOAL_COMPLETED, GOAL_FAILED
- **Events Consumed**: All major events (8 types)
- **Tests**:
  - Goal CRUD operations
  - Progress tracking
  - Completion detection
  - Failure handling
- **Validation**: All goal types work correctly

#### Task 2.3: Implement statisticsStore.ts (2.5 hours)

- **Priority**: Medium (aggregate calculations)
- **LOC**: ~100
- **Events Emitted**: STATISTICS_CALCULATED
- **Events Consumed**: Most events (for aggregation)
- **Tests**:
  - Session recording
  - Aggregate calculations
  - Chart data generation
  - Achievement tracking
- **Validation**: Statistics match expected calculations

#### Task 2.4: Integration Testing (1 hour)

- Run all 24 StoreCoordinator subscription tests
- Verify event flow end-to-end
- Test debouncing behavior
- Validate error handling

---

### Day 3: Consumer Migration & Validation (8-10 hours)

#### Task 3.1: Migrate useStudyNavigation Hook (2 hours)

- **File**: `src/hooks/useStudyNavigation.ts`
- **Changes**:
  - Replace useStudyStore with domain stores
  - Use selective subscriptions
  - Reconstruct progress object for compatibility
- **Tests**: Update hook tests, verify no breaking changes
- **Validation**: Navigation guards work, study readiness accurate

#### Task 3.2: Migrate storeIntegration Library (3 hours)

- **File**: `src/lib/storeIntegration.ts`
- **Changes**:
  - Replace facade subscriptions with domain stores
  - Use shallow comparison instead of JSON.stringify
  - Optionally migrate to event-based sync
- **Tests**: Integration tests for Supabase sync
- **Validation**: All sync operations work, no memory leaks

#### Task 3.3: Update Tests (2 hours)

- Migrate or update facade tests
- Ensure all domain stores have >90% coverage
- Add missing edge case tests
- Run full test suite
- **Validation**: 0 test failures, coverage >90%

#### Task 3.4: Final Validation (2 hours)

- End-to-end study mode testing
- Performance benchmarking
- Memory leak detection
- Error boundary testing
- Documentation review
- **Validation**: All success criteria met

#### Task 3.5: Add Deprecation Warnings (1 hour)

- Add console.warn to studyStore facade
- Update JSDoc with migration guidance
- Create migration guide snippet
- **Validation**: Warnings appear in dev mode

---

## Success Criteria Checklist

### Code Quality

- [ ] All 7 domain stores implemented
- [ ] 0 TypeScript errors
- [ ] 0 ESLint errors/warnings
- [ ] All files Prettier formatted
- [ ] Clean git history with meaningful commits

### Testing

- [ ] Unit tests: >90% coverage per store
- [ ] Integration tests: All 24 subscriptions verified
- [ ] E2E tests: Study mode workflow complete
- [ ] 0 test failures
- [ ] 0 console errors in dev mode

### Performance

- [ ] Study mode load: <200ms (baseline maintained)
- [ ] State updates: <50ms (improved from ~100ms)
- [ ] Memory usage: No increase
- [ ] Bundle size: Measured (expect -2KB)
- [ ] No memory leaks detected

### Migration

- [ ] useStudyNavigation migrated successfully
- [ ] storeIntegration migrated successfully
- [ ] No breaking changes to component APIs
- [ ] Deprecation warnings added to facade

### Documentation

- [ ] Architecture design complete (OPTIMIZED_STORE_ARCHITECTURE.md)
- [ ] Implementation roadmap complete (this file)
- [ ] JSDoc comments on all public APIs
- [ ] Migration guide available

---

## Implementation Guidelines

### Store Implementation Template

```typescript
/**
 * [StoreName] - [Purpose]
 *
 * Events Emitted: [List]
 * Events Consumed: [List]
 * Persistence: localStorage key '[storage-key]'
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storeCoordinator } from '../storeCoordinator';
import { StudyEventType, /* types */ } from '../../types/study-domain.types';

interface [StoreName]State {
  // State

  // Actions

  // Cleanup
  _cleanup: () => void;
}

export const use[StoreName] = create<[StoreName]State>()(
  persist(
    (set, get) => {
      const unsubscribers: (() => void)[] = [];

      // Event handlers
      const handleEvent = (event) => {
        set((state) => {
          // Update state
          const newState = { ...state, /* changes */ };

          // Emit events if needed
          storeCoordinator.publish(
            StudyEventType.EVENT_NAME,
            { /* payload */ },
            '[StoreName]'
          );

          return newState;
        });
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

        // Actions

        // Cleanup
        _cleanup: () => {
          unsubscribers.forEach(unsub => unsub());
        }
      };
    },
    {
      name: '[storage-key]',
      partialize: (state) => {
        // Only persist relevant fields
        const { _cleanup, ...persistedState } = state;
        return persistedState;
      }
    }
  )
);
```

### Test Template

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { use[StoreName] } from '../[storeName]';
import { storeCoordinator } from '../../storeCoordinator';
import { StudyEventType } from '../../../types/study-domain.types';

describe('[storeName]', () => {
  beforeEach(() => {
    // Reset store
    use[StoreName].setState(initialState);

    // Clear coordinator
    storeCoordinator.clearAll();
  });

  afterEach(() => {
    // Cleanup subscriptions
    use[StoreName].getState()._cleanup();
  });

  describe('Actions', () => {
    it('should [action description]', () => {
      // Arrange
      const listener = vi.fn();
      storeCoordinator.subscribe(
        StudyEventType.EVENT_NAME,
        listener,
        'test'
      );

      // Act
      use[StoreName].getState().actionName(params);

      // Assert
      expect(listener).toHaveBeenCalled();
      expect(use[StoreName].getState()).toMatchObject({
        // expected state
      });
    });
  });

  describe('Event Handlers', () => {
    it('should handle EVENT_NAME', () => {
      // Arrange
      // Act
      storeCoordinator.publish(
        StudyEventType.EVENT_NAME,
        { /* payload */ },
        'test'
      );

      // Assert
      expect(use[StoreName].getState()).toMatchObject({
        // expected state after event
      });
    });
  });
});
```

---

## Risk Mitigation

### High-Frequency Event Testing

```typescript
it('should handle rapid COUNTY_STUDIED events', async () => {
  // Fire 100 events rapidly
  for (let i = 0; i < 100; i++) {
    storeCoordinator.publish(
      StudyEventType.COUNTY_STUDIED,
      { countyCode: 'ALA', correct: true, responseTimeMs: 5000 },
      'test'
    );
  }

  // Wait for debounce
  await vi.waitFor(
    () => {
      const progress = useCountyProgressStore.getState().getCountyProgress('ALA');
      expect(progress?.studyCount).toBe(1);
    },
    { timeout: 1000 }
  );
});
```

### Memory Leak Detection

```typescript
it('should not leak memory on repeated subscriptions', () => {
  const initialSubscriptionCount = storeCoordinator.getSubscriptionStats().length;

  // Create and destroy 100 stores
  for (let i = 0; i < 100; i++) {
    const cleanup = use[StoreName].getState()._cleanup;
    cleanup();
  }

  const finalSubscriptionCount = storeCoordinator.getSubscriptionStats().length;
  expect(finalSubscriptionCount).toBe(initialSubscriptionCount);
});
```

### Error Boundary Testing

```typescript
it('should handle subscriber errors gracefully', () => {
  const errorHandler = vi.fn();
  storeCoordinator.onError(errorHandler);

  // Subscribe with failing handler
  storeCoordinator.subscribe(
    StudyEventType.SESSION_STARTED,
    () => {
      throw new Error('Subscriber error');
    },
    'test'
  );

  // Publish event
  storeCoordinator.publish(
    StudyEventType.SESSION_STARTED,
    { sessionId: 'test', mode: 'flashcards' },
    'test'
  );

  // Error handler should be called
  expect(errorHandler).toHaveBeenCalled();
});
```

---

## Performance Monitoring

### Benchmarking Script

```typescript
// scripts/benchmark-stores.ts
import { performance } from 'perf_hooks';
import { useSessionStore } from '../src/stores/study-domain/sessionStore';

const iterations = 1000;

// Benchmark state updates
const startTime = performance.now();
for (let i = 0; i < iterations; i++) {
  useSessionStore.getState().startSession('flashcards', {});
  useSessionStore.getState().endSession('test');
}
const endTime = performance.now();

console.log(`Average state update: ${(endTime - startTime) / iterations}ms`);
```

### Memory Profiling

```typescript
// In browser console
const before = performance.memory.usedJSHeapSize;

// Perform operations
for (let i = 0; i < 1000; i++) {
  // ... operations
}

const after = performance.memory.usedJSHeapSize;
console.log(`Memory increase: ${(after - before) / 1024 / 1024}MB`);
```

---

## Rollback Plan

If critical issues are discovered:

1. **Immediate Rollback**
   - Revert consumer migrations (2 files)
   - Keep domain stores (for future use)
   - No data loss (facade still functional)

2. **Investigation**
   - Review error logs
   - Identify root cause
   - Add specific tests for issue

3. **Fix & Re-deploy**
   - Apply fix to domain stores
   - Re-run test suite
   - Re-migrate consumers

---

## Communication Plan

### Commit Messages

- `feat(stores): implement [storeName] domain store`
- `test(stores): add [storeName] unit tests`
- `refactor(hooks): migrate useStudyNavigation to domain stores`
- `refactor(lib): migrate storeIntegration to domain stores`
- `docs(architecture): add Phase 3 implementation guide`

### Pull Request

- Title: `feat: Phase 3 - Migrate to Domain Store Architecture`
- Description: Reference this roadmap and architecture design
- Checklist: All success criteria items
- Screenshots: Before/after performance metrics

---

## Next Steps

1. ✅ Review this roadmap
2. ⏭️ Create feature branch: `feature/phase3-domain-stores`
3. ⏭️ Begin Day 1 tasks (foundation stores)
4. ⏭️ Daily standup: Progress, blockers, ETA
5. ⏭️ Code review after each store implementation
6. ⏭️ Final PR review before merge

---

**Roadmap Status**: ✅ Complete
**Ready for**: Implementation start
**Coordination**: Stored in hive memory at `hive/design/roadmap`

---

_Generated by Coder Agent_
_Hive Mind Swarm - California Puzzle Game Store Optimization_
