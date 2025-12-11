# California Puzzle Game - Store Architecture Testing Strategy

**Document Type:** Test Strategy & Quality Assurance Plan
**Date Created:** December 10, 2025
**Author:** QA Specialist Agent (Tester)
**Status:** Active Development
**Version:** 1.0.0

---

## Executive Summary

This document provides a comprehensive testing strategy for the California Puzzle Game's store architecture optimization. The testing plan focuses on validating the decomposed domain stores (7 stores) and their event-driven coordination patterns through the StoreCoordinator.

### Testing Goals

1. **Validate Domain Decomposition**: Ensure each of 7 domain stores operates correctly in isolation
2. **Verify Event Coordination**: Test cross-store communication via StoreCoordinator event bus
3. **Ensure State Consistency**: Validate state synchronization across all stores
4. **Performance Validation**: Confirm architecture improvements meet performance targets
5. **Regression Prevention**: Maintain existing 2,130+ test coverage while adding new tests

---

## Current Test Coverage Analysis

### Existing Test Infrastructure (72 Test Files)

```
tests/
├── unit/stores/
│   ├── storeCoordinator.test.ts (284 lines) ✅ EXCELLENT
│   ├── studyStore.test.ts ⚠️ NEEDS MIGRATION
│   ├── achievementStore.test.ts (1,002 lines) ✅
│   ├── gameSettingsStore.test.ts (810 lines) ✅
│   └── [7 more store tests] ✅
├── integration/
│   └── storeCoordinator.integration.test.ts (1,200 lines) ✅ FLAGSHIP TEST
└── [60 other test files across components, hooks, services] ✅
```

### Test Quality Assessment

| Category                         | Status      | Quality | Notes                                        |
| -------------------------------- | ----------- | ------- | -------------------------------------------- |
| **StoreCoordinator Unit Tests**  | ✅ Complete | A+      | 24 test scenarios covering event propagation |
| **StoreCoordinator Integration** | ✅ Complete | A+      | 1,200 lines, tests all 7 domain stores       |
| **Domain Store Unit Tests**      | ⚠️ Partial  | B+      | Study domain stores lack individual tests    |
| **Event Flow Tests**             | ✅ Good     | A       | Covered in integration tests                 |
| **Performance Tests**            | ⚠️ Missing  | C       | No benchmark tests for architecture          |
| **Migration Tests**              | ❌ Missing  | N/A     | Need migration validation tests              |

---

## Testing Gap Analysis

### Critical Gaps

1. **Domain Store Unit Tests** (7 stores need individual test files)
   - `sessionStore.test.ts` ❌ MISSING
   - `countyProgressStore.test.ts` ❌ MISSING
   - `spacedRepetitionStore.test.ts` ❌ MISSING
   - `progressStore.test.ts` ❌ MISSING
   - `goalsStore.test.ts` ❌ MISSING
   - `statisticsStore.test.ts` ❌ MISSING
   - `studySettingsStore.test.ts` ❌ MISSING

2. **Performance Benchmark Tests**
   - Event propagation latency measurement ❌
   - Store subscription overhead ❌
   - Memory usage comparison (monolith vs decomposed) ❌
   - Bundle size impact ❌

3. **Migration Validation Tests**
   - Data migration from old studyStore ❌
   - Backward compatibility checks ❌
   - State shape transformation validation ❌

4. **Architecture-Specific Tests**
   - Event debouncing behavior ✅ Covered in integration tests
   - Circular dependency prevention ❌
   - Store initialization order ❌
   - Cleanup/teardown lifecycle ✅ Covered

---

## Recommended Test Strategy

### Phase 1: Domain Store Unit Tests (HIGH PRIORITY)

**Goal:** Create isolated unit tests for each of the 7 domain stores

#### Test Template (per store)

```typescript
/**
 * @test {StoreName} Domain Store
 * @description Tests isolated store behavior without cross-store dependencies
 * @coverage State mutations, actions, selectors, edge cases
 */
describe('{StoreName}', () => {
  beforeEach(() => {
    // Reset store to initial state
    useStoreUnderTest.setState({ ...initialState });
    vi.clearAllMocks();
  });

  describe('State Initialization', () => {
    it('should initialize with default state');
  });

  describe('Core Actions', () => {
    it('should handle {action1}');
    it('should handle {action2}');
  });

  describe('Event Publishing', () => {
    it('should publish {EVENT_TYPE} when {condition}');
  });

  describe('Event Subscriptions', () => {
    it('should handle {EVENT_TYPE} subscription');
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined inputs');
    it('should handle concurrent operations');
    it('should handle error conditions');
  });

  describe('State Persistence', () => {
    it('should persist state to localStorage');
    it('should load state from localStorage');
  });
});
```

#### Estimated Test Counts per Store

| Store                 | Estimated Tests   | Priority |
| --------------------- | ----------------- | -------- |
| sessionStore          | 30-40 tests       | CRITICAL |
| countyProgressStore   | 35-45 tests       | CRITICAL |
| spacedRepetitionStore | 40-50 tests       | HIGH     |
| progressStore         | 25-35 tests       | HIGH     |
| goalsStore            | 30-40 tests       | MEDIUM   |
| statisticsStore       | 25-30 tests       | MEDIUM   |
| studySettingsStore    | 15-20 tests       | LOW      |
| **TOTAL**             | **200-260 tests** | -        |

### Phase 2: Integration Test Enhancements (MEDIUM PRIORITY)

**Goal:** Enhance existing integration tests with architecture-specific scenarios

#### New Integration Test Scenarios

1. **Complete Study Flow End-to-End** (ALREADY EXISTS ✅)
   - Location: `tests/integration/storeCoordinator.integration.test.ts`
   - Coverage: Session → County Study → Review → Goals → Statistics
   - Status: 1,200 lines, 24 scenarios

2. **Concurrent Session Management**

   ```typescript
   it('should handle multiple concurrent sessions', async () => {
     // Start 3 sessions simultaneously
     const session1 = sessionStore.startSession(StudyMode.FLASHCARDS);
     const session2 = sessionStore.startSession(StudyMode.MAP_EXPLORATION);
     const session3 = sessionStore.startSession(StudyMode.GRID_STUDY);

     // Verify isolation and coordination
     expect(sessionStore.sessions.size).toBe(3);
     expect(statisticsStore.totalSessions).toBe(3);
   });
   ```

3. **Event Storm Resilience**

   ```typescript
   it('should handle rapid event bursts without dropping events', async () => {
     // Publish 100 COUNTY_STUDIED events rapidly
     for (let i = 0; i < 100; i++) {
       storeCoordinator.publish(StudyEventType.COUNTY_STUDIED, {...});
     }

     // Verify debouncing and processing
     await storeCoordinator.flush();
     expect(progressStore.totalStudied).toBeGreaterThan(0);
   });
   ```

4. **Error Propagation and Recovery**

   ```typescript
   it('should isolate subscriber errors and continue processing', async () => {
     // Subscribe with failing handler
     storeCoordinator.subscribe(StudyEventType.SESSION_STARTED, () => {
       throw new Error('Subscriber failed');
     });

     // Publish event
     sessionStore.startSession(StudyMode.FLASHCARDS);

     // Verify other subscribers still called
     expect(statisticsStore.totalSessions).toBe(1);
   });
   ```

### Phase 3: Performance Benchmark Tests (MEDIUM PRIORITY)

**Goal:** Establish performance baselines and regression detection

#### Performance Test Suite

```typescript
/**
 * @test Store Architecture Performance Benchmarks
 * @description Measures event propagation latency, subscription overhead, and memory usage
 */
describe('Store Architecture Performance', () => {
  describe('Event Propagation Latency', () => {
    it('should propagate events in <10ms (p95)', async () => {
      const latencies: number[] = [];

      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        storeCoordinator.publish(StudyEventType.COUNTY_STUDIED, {...});
        await storeCoordinator.flush();
        const end = performance.now();
        latencies.push(end - start);
      }

      const p95 = calculatePercentile(latencies, 95);
      expect(p95).toBeLessThan(10); // 10ms p95 latency
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory after 1000 events', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 1000; i++) {
        storeCoordinator.publish(StudyEventType.COUNTY_STUDIED, {...});
        await storeCoordinator.flush();
      }

      global.gc?.(); // Force garbage collection
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;

      expect(memoryGrowth).toBeLessThan(5 * 1024 * 1024); // <5MB growth
    });
  });

  describe('Subscription Overhead', () => {
    it('should handle 100 concurrent subscriptions efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        storeCoordinator.subscribe(StudyEventType.SESSION_STARTED, () => {});
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(50); // <50ms for 100 subscriptions
    });
  });

  describe('Bundle Size Impact', () => {
    it('should maintain reasonable bundle size', () => {
      // Use dynamic imports to measure bundle size
      // This would require integration with build tools
    });
  });
});
```

### Phase 4: Migration Validation Tests (LOW PRIORITY)

**Goal:** Ensure safe migration from monolithic studyStore to decomposed architecture

#### Migration Test Suite

```typescript
/**
 * @test Migration from Monolithic studyStore
 * @description Validates data migration and backward compatibility
 */
describe('Study Store Migration', () => {
  describe('Data Migration', () => {
    it('should migrate existing studyStore state to domain stores', () => {
      const legacyState = {
        sessions: [...],
        countyProgress: [...],
        // ... old state shape
      };

      const migratedState = migrateStudyStore(legacyState);

      expect(sessionStore.getState()).toEqual(migratedState.session);
      expect(countyProgressStore.getState()).toEqual(migratedState.countyProgress);
    });
  });

  describe('Backward Compatibility', () => {
    it('should support legacy API for gradual migration', () => {
      // Facade pattern - old API delegates to new stores
      const session = legacyStudyStore.startSession('flashcards');
      expect(sessionStore.activeSessionId).toBe(session.id);
    });
  });

  describe('State Shape Transformation', () => {
    it('should transform nested state to flat domain stores', () => {
      // Test state normalization
    });
  });
});
```

---

## Test Execution Strategy

### Test Pyramid for Store Architecture

```
         /\
        /E2E\         ← 5-10 tests (full game flows)
       /------\
      /Integr.\      ← 50-75 tests (cross-store coordination)
     /----------\
    /   Unit     \   ← 200-260 tests (isolated store behaviors)
   /--------------\
```

### Test Organization

```
tests/
├── unit/stores/study/              ← NEW: Domain store unit tests
│   ├── sessionStore.test.ts        ← 30-40 tests
│   ├── countyProgressStore.test.ts ← 35-45 tests
│   ├── spacedRepetitionStore.test.ts ← 40-50 tests
│   ├── progressStore.test.ts       ← 25-35 tests
│   ├── goalsStore.test.ts          ← 30-40 tests
│   ├── statisticsStore.test.ts     ← 25-30 tests
│   └── studySettingsStore.test.ts  ← 15-20 tests
├── integration/
│   ├── storeCoordinator.integration.test.ts ✅ EXISTING
│   └── architecture-performance.test.ts ← NEW: Performance benchmarks
└── migration/                      ← NEW: Migration tests
    └── studyStore-migration.test.ts
```

### Continuous Integration (CI) Test Execution

#### Fast Feedback Loop (Pre-commit)

```bash
# Run unit tests only (~30 seconds)
npm test -- tests/unit/stores/study/ --run
```

#### Full Test Suite (Pre-push)

```bash
# Run all tests with coverage (~2-3 minutes)
npm run test:coverage
```

#### Nightly Performance Benchmarks

```bash
# Run performance tests separately (resource-intensive)
npm test -- tests/integration/architecture-performance.test.ts --run
```

---

## Test Quality Metrics

### Coverage Targets

| Area                      | Current | Target | Priority |
| ------------------------- | ------- | ------ | -------- |
| **sessionStore**          | 0%      | 90%+   | CRITICAL |
| **countyProgressStore**   | 0%      | 90%+   | CRITICAL |
| **spacedRepetitionStore** | 0%      | 85%+   | HIGH     |
| **progressStore**         | 0%      | 85%+   | HIGH     |
| **goalsStore**            | 0%      | 80%+   | MEDIUM   |
| **statisticsStore**       | 0%      | 80%+   | MEDIUM   |
| **studySettingsStore**    | 0%      | 75%+   | LOW      |
| **storeCoordinator**      | 95%+    | 95%+   | MAINTAIN |

### Performance Benchmarks (Target Values)

| Metric                               | Target | Measurement           |
| ------------------------------------ | ------ | --------------------- |
| **Event Propagation Latency (p95)**  | <10ms  | performance.now()     |
| **Event Propagation Latency (p99)**  | <25ms  | performance.now()     |
| **Memory Growth (1000 events)**      | <5MB   | process.memoryUsage() |
| **Subscription Overhead (100 subs)** | <50ms  | performance.now()     |
| **Bundle Size Impact**               | <10KB  | Build analysis        |

### Test Reliability Targets

- **Flaky Test Rate**: <1% (max 20 flaky tests out of 2,130+)
- **Test Execution Time**: <5 minutes for full suite
- **Test Coverage**: 85%+ overall (lines, branches, functions)

---

## Test Implementation Plan

### Priority 1: Critical Path Tests (Week 1)

**Goal:** Validate core functionality of most critical stores

1. **sessionStore.test.ts** (30-40 tests)
   - Session lifecycle (start, pause, resume, end)
   - Event publishing (SESSION_STARTED, SESSION_COMPLETED)
   - County recording during session
   - Session metrics calculation

2. **countyProgressStore.test.ts** (35-45 tests)
   - Per-county progress tracking
   - Mastery level calculations
   - Response time analytics
   - Event publishing (COUNTY_STUDIED, COUNTY_MASTERY_CHANGED)

3. **Integration Test Enhancements**
   - Add concurrent session test
   - Add event storm resilience test
   - Add error isolation test

**Deliverables:**

- 3 new test files (~100-130 tests total)
- Coverage reports for critical stores
- Integration test enhancements

### Priority 2: Extended Coverage (Week 2)

**Goal:** Complete unit test coverage for remaining stores

4. **spacedRepetitionStore.test.ts** (40-50 tests)
   - SM-2 algorithm correctness
   - Review queue management
   - Card scheduling
   - Event publishing (REVIEW_COMPLETED, REVIEW_DUE)

5. **progressStore.test.ts** (25-35 tests)
   - Overall progress aggregation
   - Streak tracking
   - Milestone detection
   - Event publishing (PROGRESS_UPDATED, STREAK_UPDATED, MILESTONE_REACHED)

6. **goalsStore.test.ts** (30-40 tests)
   - Goal creation and management
   - Progress tracking
   - Completion detection
   - Event publishing (GOAL_CREATED, GOAL_PROGRESS, GOAL_COMPLETED, GOAL_FAILED)

**Deliverables:**

- 3 new test files (~95-125 tests total)
- Coverage reports showing 80%+ for all stores

### Priority 3: Statistics & Settings (Week 3)

**Goal:** Complete remaining store tests and add performance benchmarks

7. **statisticsStore.test.ts** (25-30 tests)
   - Session statistics aggregation
   - Chart data generation
   - Achievement tracking
   - Event publishing (STATISTICS_CALCULATED)

8. **studySettingsStore.test.ts** (15-20 tests)
   - Settings persistence
   - Default value handling
   - Validation logic

9. **Performance Benchmark Suite**
   - Event propagation latency tests
   - Memory usage tests
   - Subscription overhead tests

**Deliverables:**

- 2 new test files (~40-50 tests)
- Performance benchmark suite
- Complete test documentation

### Priority 4: Migration & Documentation (Week 4)

**Goal:** Add migration tests and finalize documentation

10. **Migration Validation Tests**
    - Data migration tests
    - Backward compatibility tests
    - State transformation tests

11. **Test Documentation**
    - Update TEST_SUITE_EVALUATION.md
    - Create test execution guides
    - Document performance baselines

**Deliverables:**

- Migration test suite
- Updated test documentation
- Test execution playbooks

---

## Test Tooling & Infrastructure

### Test Frameworks & Libraries

```json
{
  "testFramework": "Vitest 4.0.15",
  "testingLibrary": "@testing-library/react",
  "userInteractions": "@testing-library/user-event",
  "mocking": "vitest vi.fn()",
  "assertions": "expect (Vitest built-in)",
  "performance": "performance.now(), process.memoryUsage()"
}
```

### Test Configuration (vitest.config.ts)

```typescript
// Relevant configuration for store tests
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      branches: 75,
      functions: 80,
      statements: 80,
      include: ['src/stores/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.test.tsx'],
    },
  },
});
```

### Mock Strategies

1. **Logger Mocking** (Consistent across all tests)

```typescript
vi.mock('../../src/utils/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  studyLogger: {
    /* same */
  },
}));
```

2. **StoreCoordinator Mocking** (For isolated unit tests)

```typescript
vi.mock('../../src/stores/storeCoordinator', () => ({
  storeCoordinator: {
    publish: vi.fn(),
    subscribe: vi.fn(() => vi.fn()), // Returns unsubscribe function
  },
}));
```

3. **LocalStorage Mocking** (For persistence tests)

```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
global.localStorage = localStorageMock;
```

---

## Success Criteria

### Completion Criteria (Definition of Done)

✅ **Unit Tests**

- [ ] All 7 domain stores have dedicated test files
- [ ] Each store achieves target coverage (75-90%)
- [ ] All tests pass consistently (0 flaky tests)
- [ ] Edge cases and error conditions covered

✅ **Integration Tests**

- [ ] StoreCoordinator integration tests maintained (24 scenarios)
- [ ] 3+ new integration scenarios added (concurrent sessions, event storms, error isolation)
- [ ] Full end-to-end study flow validated

✅ **Performance Tests**

- [ ] Event propagation latency benchmarks established
- [ ] Memory usage tests passing (<5MB growth)
- [ ] Subscription overhead tests passing (<50ms)
- [ ] Performance regression detection enabled

✅ **Documentation**

- [ ] Test strategy documented (this document)
- [ ] Test execution guides created
- [ ] Performance baselines documented
- [ ] Test coverage reports generated

### Quality Gates

**Before Merge:**

1. All unit tests pass (0 failures)
2. Coverage meets targets (80%+ overall)
3. Integration tests pass (0 failures)
4. Performance benchmarks pass (latency <10ms p95)
5. No new flaky tests introduced

**Before Production:**

1. Full test suite passes 3 consecutive times
2. E2E tests pass (if applicable)
3. Performance benchmarks validated on production-like environment
4. Test documentation reviewed and approved

---

## Risk Assessment & Mitigation

### Testing Risks

| Risk                                | Probability | Impact | Mitigation                                         |
| ----------------------------------- | ----------- | ------ | -------------------------------------------------- |
| **Flaky tests due to event timing** | Medium      | High   | Use `storeCoordinator.flush()`, avoid `setTimeout` |
| **Test execution time too long**    | Medium      | Medium | Parallelize tests, mock slow operations            |
| **Insufficient edge case coverage** | Low         | High   | Code review checklist, mutation testing            |
| **Performance test instability**    | High        | Medium | Run on dedicated hardware, use percentiles         |
| **Migration test gaps**             | Medium      | High   | Manual QA validation, staged rollout               |

### Mitigation Strategies

1. **Flaky Test Prevention**
   - Always use `await storeCoordinator.flush()` after event publishing
   - Set debounce delays to 0ms in tests
   - Use deterministic date/time mocks

2. **Performance Test Reliability**
   - Run performance tests separately from unit tests
   - Use statistical measures (p95, p99) instead of max values
   - Warm up JIT compiler before measurements

3. **Test Execution Optimization**
   - Use Vitest's thread pool for parallelization
   - Mock expensive operations (network, file I/O)
   - Split large test files into smaller, focused files

---

## Appendix: Test Examples

### Example 1: sessionStore Unit Test

```typescript
/**
 * @test Session Store Unit Tests
 * @description Tests session lifecycle and event publishing
 */
describe('sessionStore', () => {
  let publishSpy: MockInstance;

  beforeEach(() => {
    useSessionStore.setState({
      currentSession: null,
      isActive: false,
      isPaused: false,
    });
    publishSpy = vi.spyOn(storeCoordinator, 'publish');
  });

  describe('startSession', () => {
    it('should create new session and publish SESSION_STARTED', () => {
      const sessionId = useSessionStore.getState().startSession(StudyMode.FLASHCARDS);

      expect(sessionId).toBeDefined();
      expect(useSessionStore.getState().isActive).toBe(true);
      expect(publishSpy).toHaveBeenCalledWith(
        StudyEventType.SESSION_STARTED,
        expect.objectContaining({
          sessionId,
          mode: StudyMode.FLASHCARDS,
        }),
        'sessionStore'
      );
    });

    it('should generate unique session IDs', () => {
      const id1 = useSessionStore.getState().startSession(StudyMode.FLASHCARDS);
      useSessionStore.getState().endSession();
      const id2 = useSessionStore.getState().startSession(StudyMode.MAP_EXPLORATION);

      expect(id1).not.toBe(id2);
    });
  });

  describe('recordCountyStudied', () => {
    it('should update session metrics and publish COUNTY_STUDIED', () => {
      const sessionId = useSessionStore.getState().startSession(StudyMode.FLASHCARDS);

      useSessionStore.getState().recordCountyStudied('ALA', true, 2500);

      expect(publishSpy).toHaveBeenCalledWith(
        StudyEventType.COUNTY_STUDIED,
        expect.objectContaining({
          sessionId,
          countyCode: 'ALA',
          correct: true,
          responseTimeMs: 2500,
        }),
        'sessionStore'
      );
    });
  });
});
```

### Example 2: Integration Test (Concurrent Sessions)

```typescript
/**
 * @test Concurrent Session Management
 * @description Tests multiple simultaneous study sessions
 */
describe('Concurrent Sessions', () => {
  beforeEach(() => {
    // Reset all stores
    useSessionStore.setState({ ...initialState });
    useStatisticsStore.setState({ ...initialState });
  });

  it('should handle multiple concurrent sessions', async () => {
    // Start 3 sessions simultaneously
    const session1 = useSessionStore.getState().startSession(StudyMode.FLASHCARDS);
    const session2 = useSessionStore.getState().startSession(StudyMode.MAP_EXPLORATION);
    const session3 = useSessionStore.getState().startSession(StudyMode.GRID_STUDY);

    await storeCoordinator.flush();

    // Verify sessions are isolated
    expect(useSessionStore.getState().sessions.size).toBe(3);

    // Study counties in each session
    useSessionStore.getState().recordCountyStudied(session1, 'ALA', true, 2000);
    useSessionStore.getState().recordCountyStudied(session2, 'SF', true, 1500);
    useSessionStore.getState().recordCountyStudied(session3, 'SCL', false, 3000);

    await storeCoordinator.flush();

    // Verify statistics aggregated correctly
    const stats = useStatisticsStore.getState();
    expect(stats.totalSessions).toBe(3);
    expect(stats.sessionHistory.length).toBe(3);
  });
});
```

### Example 3: Performance Benchmark Test

```typescript
/**
 * @test Event Propagation Performance
 * @description Measures event processing latency
 */
describe('Event Propagation Performance', () => {
  it('should propagate events in <10ms (p95)', async () => {
    const latencies: number[] = [];

    for (let i = 0; i < 100; i++) {
      const start = performance.now();

      storeCoordinator.publish(
        StudyEventType.COUNTY_STUDIED,
        {
          sessionId: 'test-session',
          countyCode: `COUNTY_${i}`,
          correct: true,
          responseTimeMs: 2000,
          timestamp: new Date(),
        },
        'testStore'
      );

      await storeCoordinator.flush();

      const end = performance.now();
      latencies.push(end - start);
    }

    const p95 = calculatePercentile(latencies, 95);
    const p99 = calculatePercentile(latencies, 99);

    expect(p95).toBeLessThan(10); // 10ms p95
    expect(p99).toBeLessThan(25); // 25ms p99

    console.log(`Event Propagation Latency:
      - p50: ${calculatePercentile(latencies, 50).toFixed(2)}ms
      - p95: ${p95.toFixed(2)}ms
      - p99: ${p99.toFixed(2)}ms
      - max: ${Math.max(...latencies).toFixed(2)}ms
    `);
  });
});

function calculatePercentile(values: number[], percentile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}
```

---

## Conclusion

This comprehensive testing strategy provides a structured approach to validating the California Puzzle Game's store architecture optimization. By following this plan, we ensure:

1. **Complete Coverage**: All 7 domain stores thoroughly tested
2. **High Quality**: Unit, integration, and performance tests
3. **Reliable Execution**: Minimized flaky tests, fast feedback
4. **Performance Validation**: Benchmark tests prevent regressions
5. **Maintainability**: Well-organized, documented test suite

**Estimated Effort:**

- Week 1 (Critical): 100-130 new tests (sessionStore, countyProgressStore, integration)
- Week 2 (Extended): 95-125 new tests (spacedRepetitionStore, progressStore, goalsStore)
- Week 3 (Statistics): 40-50 new tests (statisticsStore, studySettingsStore) + performance
- Week 4 (Migration): Migration tests + documentation

**Total New Tests:** ~235-305 tests
**Total Test Suite:** 2,130+ existing + 235-305 new = **2,365-2,435 tests**

---

**Document Prepared By:** QA Specialist Agent (Tester)
**Coordination Protocol:** Stored in hive/testing/architecture-strategy
**Next Steps:** Share with Architect and Coder agents for implementation planning
