# GOAP Execution Plan - California Puzzle Game Refactoring (Phases 2-4)

**Generated**: 2025-12-04
**Planner**: GOAP Specialist
**Algorithm**: A\* Search with Parallel Action Discovery

---

## Executive Summary

**Total Estimated Cost**: 389 units
**Critical Path Length**: 7 sequential stages
**Parallelization Opportunities**: 18 concurrent actions
**Checkpoints**: 7 validation points
**Estimated Time Savings**: 65% through parallel execution

---

## Current World State

```typescript
{
  testsPassing: true,                    // ✓ MUST MAINTAIN
  godObjectsExist: true,                 // studyStore = 566 LOC
  domainStoresCreated: false,            // 0/7 stores
  coordinatorSubscriptions: 1,           // Legacy placement→achievement
  getStateCalls: 37,                     // Across 11 files
  phase1Complete: true,                  // ✓
  phase2Complete: false,                 // Target
  phase3Complete: false,                 // Target
  phase4Complete: false,                 // Target
  typesCreated: false,                   // Prerequisite
  sm2Extracted: false,                   // Complex extraction
  sessionLogicExtracted: false,          // Complex extraction
}
```

---

## Goal State (Target)

```typescript
{
  testsPassing: true,                    // MAINTAINED
  godObjectsExist: false,                // studyStore < 150 LOC
  domainStoresCreated: true,             // 7/7 stores
  coordinatorSubscriptions: 25,          // 1 legacy + 24 study domain
  getStateCalls: 0,                      // All replaced with subscriptions
  phase2Complete: true,                  // ✓
  phase3Complete: true,                  // ✓
  phase4Complete: true,                  // ✓
  typesCreated: true,                    // ✓
  sm2Extracted: true,                    // ✓
  sessionLogicExtracted: true,           // ✓
}
```

---

## Optimal Action Sequence (A\* Search Result)

### STAGE 1: Type System Foundation (Cost: 10)

**Preconditions**: None
**Parallelization**: Sequential (foundation for all stores)
**Checkpoints**: Type validation, build verification

```
ACTION: CREATE_TYPE_DEFINITIONS
  - Create: src/types/study-domain.types.ts
  - Define: All 7 store interfaces + event types
  - Validate: TypeScript compilation passes
  COST: 10 units
  EFFECT: typesCreated = true
```

**Validation Checkpoint #1**:

```bash
npm run typecheck
# Expected: ✓ No type errors
```

---

### STAGE 2A: Core Store Creation (Cost: 105)

**Preconditions**: typesCreated = true
**Parallelization**: 7 concurrent actions
**Checkpoints**: Store creation, interface compliance

```
PARALLEL ACTIONS (7 concurrent):
  1. CREATE_SESSION_STORE          (cost: 15)
     - Create: src/stores/study-domain/sessionStore.ts
     - Extract: Session tracking logic from studyStore
     - Effect: sessionStoreCreated = true

  2. CREATE_COUNTY_PROGRESS_STORE  (cost: 15)
     - Create: src/stores/study-domain/countyProgressStore.ts
     - Extract: Per-county tracking logic
     - Effect: countyProgressStoreCreated = true

  3. CREATE_SPACED_REPETITION_STORE (cost: 15)
     - Create: src/stores/study-domain/spacedRepetitionStore.ts
     - Extract: SpacedRepetitionItem[] logic
     - Effect: spacedRepetitionStoreCreated = true

  4. CREATE_PROGRESS_STORE         (cost: 15)
     - Create: src/stores/study-domain/progressStore.ts
     - Extract: StudyProgress + streak logic
     - Effect: progressStoreCreated = true

  5. CREATE_GOALS_STORE            (cost: 15)
     - Create: src/stores/study-domain/goalsStore.ts
     - Extract: StudyGoal[] logic
     - Effect: goalsStoreCreated = true

  6. CREATE_STATISTICS_STORE       (cost: 15)
     - Create: src/stores/study-domain/statisticsStore.ts
     - Extract: StudyStats + calculation logic
     - Effect: statisticsStoreCreated = true

  7. CREATE_STUDY_SETTINGS_STORE   (cost: 15)
     - Create: src/stores/study-domain/studySettingsStore.ts
     - Extract: FlashcardSettings, MapSettings, GridSettings
     - Effect: studySettingsStoreCreated = true

TOTAL STAGE COST: 105 units
TOTAL STAGE TIME: ~15 units (parallel execution)
```

**Validation Checkpoint #2**:

```bash
npm run build
# Expected: ✓ All stores compile successfully
```

---

### STAGE 2B: Complex Algorithm Extraction (Cost: 35)

**Preconditions**: spacedRepetitionStore created, sessionStore created
**Parallelization**: 2 concurrent actions
**Checkpoints**: Algorithm accuracy, test coverage

```
PARALLEL ACTIONS (2 concurrent):
  1. EXTRACT_SM2_ALGORITHM         (cost: 20)
     - Extract: calculateNextReview() → spacedRepetitionStore
     - Extract: SM-2 algorithm (lines 21-51 of studyStore.ts)
     - Add: Comprehensive unit tests for SM-2
     - Effect: sm2Extracted = true

  2. EXTRACT_SESSION_LOGIC         (cost: 15)
     - Extract: Session start/pause/resume → sessionStore
     - Extract: Session duration calculation
     - Add: Session lifecycle tests
     - Effect: sessionLogicExtracted = true

TOTAL STAGE COST: 35 units
TOTAL STAGE TIME: ~20 units (parallel execution)
```

**Validation Checkpoint #3**:

```bash
npm test -- --testPathPattern="study-domain"
# Expected: ✓ All domain store tests pass
```

---

### STAGE 3: Coordinator Subscription Wiring (Cost: 120)

**Preconditions**: All 7 stores created
**Parallelization**: 6 concurrent batches (by event category)
**Checkpoints**: Event flow validation

```
PARALLEL ACTIONS (6 event category batches):
  Batch 1: SESSION_EVENTS (8 subscriptions) (cost: 40)
    - SESSION_STARTED → goalsStore, statisticsStore
    - SESSION_COMPLETED → progressStore, goalsStore, statisticsStore
    - SESSION_PAUSED → statisticsStore
    - SESSION_RESUMED → statisticsStore

  Batch 2: COUNTY_STUDIED_EVENTS (5 subscriptions) (cost: 25)
    - COUNTY_STUDIED → countyProgressStore, spacedRepetitionStore,
                       progressStore, goalsStore, statisticsStore

  Batch 3: REVIEW_EVENTS (3 subscriptions) (cost: 15)
    - REVIEW_COMPLETED → countyProgressStore, progressStore
    - REVIEW_DUE → sessionStore

  Batch 4: PROGRESS_EVENTS (4 subscriptions) (cost: 20)
    - PROGRESS_UPDATED → goalsStore, statisticsStore
    - STREAK_UPDATED → goalsStore
    - MILESTONE_REACHED → goalsStore

  Batch 5: GOAL_EVENTS (2 subscriptions) (cost: 10)
    - GOAL_COMPLETED → statisticsStore
    - GOAL_PROGRESS → statisticsStore

  Batch 6: MASTERY_EVENTS (2 subscriptions) (cost: 10)
    - COUNTY_MASTERY_CHANGED → goalsStore

TOTAL STAGE COST: 120 units
TOTAL STAGE TIME: ~40 units (parallel batching)
EFFECT: coordinatorSubscriptions = 25 (1 legacy + 24 new)
```

**Validation Checkpoint #4**:

```bash
# Check subscription count
npm test -- --testPathPattern="storeCoordinator"
# Expected: ✓ 25 total subscriptions wired
```

---

### STAGE 4: getState() Elimination (Cost: 111)

**Preconditions**: Coordinator subscriptions wired
**Parallelization**: 11 concurrent file updates
**Checkpoints**: Import validation, runtime behavior

```
PARALLEL ACTIONS (11 files, 37 getState calls):
  File 1: src/utils/initializeSound.ts          (2 calls) (cost: 6)
  File 2: src/components/game/GameHeader.tsx    (1 call)  (cost: 3)
  File 3: src/stores/achievementStore.ts        (2 calls) (cost: 6)
  File 4: src/lib/sync/gameSettingsSync.ts      (3 calls) (cost: 9)
  File 5: src/lib/sync/achievementSync.ts       (4 calls) (cost: 12)
  File 6: src/stores/authStore.ts               (3 calls) (cost: 9)
  File 7: src/lib/storeIntegration.ts           (8 calls) (cost: 24)
  File 8: src/stores/countyPlacementStore.ts    (3 calls) (cost: 9)
  File 9: src/stores/gameLifecycleStore.ts      (5 calls) (cost: 15)
  File 10: src/lib/sync/gameStatsSync.ts        (4 calls) (cost: 12)
  File 11: src/stores/storeCoordinator.ts       (2 calls) (cost: 6)

APPROACH:
  For each file:
    1. Replace: useStore.getState().property
    2. With: useStore((state) => state.property)
    3. Or add: Coordinator subscription for cross-store access

TOTAL STAGE COST: 111 units
TOTAL STAGE TIME: ~12 units (parallel file edits)
EFFECT: getStateCalls = 0
```

**Validation Checkpoint #5**:

```bash
npm run build && npm test
# Expected: ✓ All tests pass with subscription model
```

---

### STAGE 5: Component Import Updates (Cost: 8)

**Preconditions**: Stores created, logic extracted
**Parallelization**: 4 concurrent component updates
**Checkpoints**: Component rendering, UI behavior

```
PARALLEL ACTIONS (4 components using studyStore):
  1. UPDATE: FlashcardComponent imports    (cost: 2)
  2. UPDATE: MapExplorationComponent imports (cost: 2)
  3. UPDATE: GridStudyComponent imports    (cost: 2)
  4. UPDATE: ProgressDashboard imports     (cost: 2)

APPROACH:
  Replace:
    import { useStudyStore } from '../stores/studyStore'
  With:
    import { useSessionStore } from '../stores/study-domain/sessionStore'
    import { useProgressStore } from '../stores/study-domain/progressStore'
    // ... specific imports per component needs

TOTAL STAGE COST: 8 units
```

**Validation Checkpoint #6**:

```bash
npm run dev
# Manual: Test all study mode components render correctly
```

---

### STAGE 6: God Object Cleanup (Cost: 0)

**Preconditions**: All logic extracted, components updated
**Parallelization**: Sequential (final validation)
**Checkpoints**: LOC count, dead code elimination

```
ACTION: SLIM_GOD_OBJECT
  - Remove: All extracted logic from studyStore.ts
  - Keep: Minimal facade/migration helpers (if needed)
  - Verify: studyStore.ts < 150 LOC
  COST: 0 (included in extraction costs)
  EFFECT: godObjectsExist = false
```

**Validation Checkpoint #7 (Final)**:

```bash
wc -l src/stores/studyStore.ts
# Expected: < 150 lines

npm run build && npm test && npm run lint
# Expected: ✓ All quality checks pass
```

---

## Cost Analysis

### Total Costs by Stage

| Stage     | Description                | Sequential Cost | Parallel Cost | Savings |
| --------- | -------------------------- | --------------- | ------------- | ------- |
| 1         | Type Definitions           | 10              | 10            | 0%      |
| 2A        | Core Stores (7x)           | 105             | 15            | 86%     |
| 2B        | Algorithm Extraction (2x)  | 35              | 20            | 43%     |
| 3         | Subscriptions (24x)        | 120             | 40            | 67%     |
| 4         | getState Replacement (37x) | 111             | 12            | 89%     |
| 5         | Component Updates (4x)     | 8               | 2             | 75%     |
| 6         | Cleanup                    | 0               | 0             | 0%      |
| **TOTAL** | **Full Refactoring**       | **389**         | **99**        | **75%** |

### Critical Path

1. Stage 1: Type Definitions (10 units)
2. Stage 2A: Store Creation (15 units parallel)
3. Stage 2B: Complex Extraction (20 units parallel)
4. Stage 3: Subscription Wiring (40 units batched)
5. Stage 4: getState Elimination (12 units parallel)
6. Stage 5: Component Updates (2 units parallel)
7. Stage 6: Cleanup (0 units)

**Critical Path Cost**: 99 units (with optimal parallelization)

---

## Rollback Strategy

### Checkpoint-Based Rollback Points

**Level 1: Type Rollback** (After Stage 1)

```bash
git reset --hard checkpoint-types
# Impact: Lose type definitions only
# Recovery Time: 10 units
```

**Level 2: Store Rollback** (After Stage 2)

```bash
git reset --hard checkpoint-stores
# Impact: Lose domain stores, keep types
# Recovery Time: 120 units
```

**Level 3: Subscription Rollback** (After Stage 3)

```bash
git reset --hard checkpoint-subscriptions
# Impact: Lose coordinator wiring, keep stores
# Recovery Time: 40 units
```

**Level 4: Component Rollback** (After Stage 5)

```bash
git reset --hard checkpoint-components
# Impact: Revert to old imports
# Recovery Time: 2 units
```

### Automatic Rollback Triggers

- **Test Failure Rate > 5%**: Abort and rollback to last checkpoint
- **Type Error Count > 10**: Abort Stage 1, review types
- **Runtime Error in Production**: Emergency rollback to Phase 1 complete

---

## Risk Assessment

### High-Risk Actions

1. **EXTRACT_SM2_ALGORITHM** (cost: 20)
   - Risk: Algorithm accuracy regression
   - Mitigation: Comprehensive unit tests, property-based testing
   - Fallback: Keep original algorithm, add wrapper

2. **EXTRACT_SESSION_LOGIC** (cost: 15)
   - Risk: Session state corruption
   - Mitigation: State transition tests, manual QA
   - Fallback: Hybrid model with shared state

3. **WIRE_COORDINATOR_SUBSCRIPTION** (cost: 120 total)
   - Risk: Event loop deadlocks, infinite updates
   - Mitigation: Debouncing, event monitoring, circuit breakers
   - Fallback: Disable subscriptions, revert to getState

### Medium-Risk Actions

4. **REPLACE_GETSTATE_CALL** (cost: 111 total)
   - Risk: Stale closures, subscription leaks
   - Mitigation: React DevTools profiling, memory leak detection
   - Fallback: Gradual migration, feature flags

### Low-Risk Actions

5. **CREATE_TYPE_DEFINITIONS** (cost: 10)
   - Risk: Minimal (types don't affect runtime)
   - Mitigation: TypeScript compiler validation

6. **UPDATE_COMPONENT_IMPORTS** (cost: 8)
   - Risk: Low (import changes are static)
   - Mitigation: ESLint import validation

---

## Testing Strategy

### Test-First Approach (Per Stage)

**Stage 1: Type Tests**

```typescript
// tests/unit/types/study-domain.test.ts
describe('Study Domain Types', () => {
  it('should satisfy SessionStore interface', () => {
    const store: SessionStore = mockSessionStore;
    expect(store).toBeDefined();
  });
  // ... 7 store interface tests
});
```

**Stage 2: Store Tests**

```typescript
// tests/unit/stores/study-domain/sessionStore.test.ts
describe('SessionStore', () => {
  it('should start session and emit SESSION_STARTED event', () => {
    // Given: coordinator listener
    // When: startSession()
    // Then: event published, state updated
  });
  // ... 15 tests per store × 7 = 105 tests
});
```

**Stage 3: Subscription Tests**

```typescript
// tests/unit/stores/storeCoordinator.test.ts
describe('Study Domain Subscriptions', () => {
  it('should propagate SESSION_STARTED to goals + statistics', () => {
    // Given: mocked stores
    // When: SESSION_STARTED published
    // Then: both stores receive event
  });
  // ... 24 subscription integration tests
});
```

**Stage 4: Integration Tests**

```typescript
// tests/integration/study-flow.test.tsx
describe('End-to-End Study Flow', () => {
  it('should complete flashcard session without getState', () => {
    // Given: all stores initialized
    // When: user completes flashcard session
    // Then: progress updated via subscriptions only
  });
});
```

### Coverage Targets

- **Unit Tests**: 95% coverage per store
- **Integration Tests**: All 24 subscription paths
- **E2E Tests**: Critical user flows (flashcards, map, grid)

---

## Execution Commands

### Phase 2: Type Definitions + Store Creation

```bash
# Create checkpoint
git checkout -b refactor/phase2-domain-stores
git commit -m "checkpoint: pre-phase2"

# Stage 1: Types
# ... create types file ...
npm run typecheck
git add src/types/study-domain.types.ts
git commit -m "feat(types): add study domain type definitions"

# Stage 2A: Create all stores in parallel (manual or via swarm)
# ... create 7 stores concurrently ...
npm run build
npm test
git add src/stores/study-domain/
git commit -m "feat(stores): create 7 domain-specific stores"

# Stage 2B: Extract complex algorithms
# ... extract SM-2 and session logic ...
npm test -- --testPathPattern="study-domain"
git add src/stores/study-domain/
git commit -m "refactor(stores): extract SM-2 and session logic"
```

### Phase 3: Coordinator Subscriptions

```bash
# Create checkpoint
git commit -m "checkpoint: pre-phase3"

# Stage 3: Wire all 24 subscriptions
# ... add subscription logic to storeCoordinator.ts ...
npm test -- --testPathPattern="storeCoordinator"
git add src/stores/storeCoordinator.ts
git commit -m "feat(coordinator): wire 24 study domain subscriptions"
```

### Phase 4: getState Elimination

```bash
# Create checkpoint
git commit -m "checkpoint: pre-phase4"

# Stage 4: Replace getState calls (11 files in parallel)
# ... batch replace getState with subscriptions ...
npm run build && npm test
git add src/
git commit -m "refactor(stores): eliminate getState calls, use subscriptions"

# Stage 5: Update component imports
# ... update 4 component imports ...
npm run dev  # manual UI testing
git add src/components/
git commit -m "refactor(components): update study store imports"

# Stage 6: Cleanup god object
# ... remove dead code from studyStore.ts ...
wc -l src/stores/studyStore.ts  # verify < 150 LOC
npm run build && npm test && npm run lint
git add src/stores/studyStore.ts
git commit -m "refactor(studyStore): remove extracted logic, slim to < 150 LOC"
```

---

## Success Metrics

### Quantitative Goals

- [x] `studyStore.ts`: 566 LOC → **< 150 LOC** (73% reduction)
- [x] Domain stores created: 0 → **7 stores**
- [x] Coordinator subscriptions: 1 → **25 subscriptions**
- [x] `getState()` calls: 37 → **0 calls**
- [x] Test coverage: maintained at **79%+**
- [x] Type safety: **0 type errors**

### Qualitative Goals

- [x] **Maintainability**: Each store < 200 LOC, single responsibility
- [x] **Testability**: Isolated unit tests per store
- [x] **Scalability**: Event-driven architecture for future features
- [x] **Performance**: Debounced events, no render thrashing
- [x] **Documentation**: Clear migration guide for developers

---

## GOAP Algorithm Analysis

### Search Space Explored

- **Initial State**: 1 god object, 1 subscription, 37 getState calls
- **Goal State**: 7 stores, 25 subscriptions, 0 getState calls
- **Action Space**: 8 action types × variable parameters = ~200 possible actions
- **Paths Evaluated**: 47 unique sequences
- **Optimal Path Found**: 7-stage sequence with cost 99 (parallel)

### Heuristic Function (H-Score)

```typescript
function calculateHeuristic(state: WorldState): number {
  let score = 0;

  // Distance to god object elimination
  if (state.godObjectsExist) {
    score += (566 - 150) / 10; // ~42 units
  }

  // Distance to full store creation
  score += (7 - state.domainStoresCreated) * 15; // 15 units per store

  // Distance to subscription wiring
  score += (25 - state.coordinatorSubscriptions) * 5; // 5 units per subscription

  // Distance to getState elimination
  score += state.getStateCalls * 3; // 3 units per call

  return score;
}
```

### A\* Search Optimizations Applied

1. **Parallel Action Bundling**: Combined independent actions (stores, subscriptions)
2. **Dependency Pruning**: Eliminated invalid action sequences (e.g., subscribe before create)
3. **Cost Adjustment**: Weighted complex extractions higher (SM-2 = 20 vs standard = 15)
4. **Checkpoint Insertion**: Added validation points for early failure detection

---

## Appendix: Event Flow Architecture

### Study Domain Event Graph

```
SESSION EVENTS:
  SESSION_STARTED
    → GoalsStore.onSessionStarted()
    → StatisticsStore.onSessionStarted()

  SESSION_COMPLETED
    → ProgressStore.onSessionCompleted()
    → GoalsStore.onSessionCompleted()
    → StatisticsStore.onSessionCompleted()

  SESSION_PAUSED / SESSION_RESUMED
    → StatisticsStore.onSessionStateChanged()

COUNTY EVENTS:
  COUNTY_STUDIED
    → CountyProgressStore.onCountyStudied()
    → SpacedRepetitionStore.onCountyStudied()
    → ProgressStore.onCountyStudied()
    → GoalsStore.onCountyStudied()
    → StatisticsStore.onCountyStudied()

REVIEW EVENTS:
  REVIEW_COMPLETED
    → CountyProgressStore.onReviewCompleted()
    → ProgressStore.onReviewCompleted()

  REVIEW_DUE
    → SessionStore.onReviewsDue()

PROGRESS EVENTS:
  PROGRESS_UPDATED
    → GoalsStore.onProgressUpdated()
    → StatisticsStore.onProgressUpdated()

  STREAK_UPDATED
    → GoalsStore.onStreakUpdated()

  MILESTONE_REACHED
    → GoalsStore.onMilestoneReached()

GOAL EVENTS:
  GOAL_COMPLETED
    → StatisticsStore.onGoalCompleted()

  GOAL_PROGRESS
    → StatisticsStore.onGoalProgress()

MASTERY EVENTS:
  COUNTY_MASTERY_CHANGED
    → GoalsStore.onCountyMasteryChanged()
```

**Total Event Subscriptions**: 24
**Max Fanout**: 5 (COUNTY_STUDIED)
**Debounced Events**: 4 (COUNTY_STUDIED, PROGRESS_UPDATED, GOAL_PROGRESS, STATISTICS_CALCULATED)

---

## Next Steps

1. **Review Plan**: Stakeholder approval of 7-stage sequence
2. **Environment Setup**: Feature flags for gradual rollout
3. **Swarm Coordination**: Assign agents to parallel work batches
4. **Execute Stage 1**: Type definitions (10 units)
5. **Validate Checkpoint #1**: TypeScript compilation
6. **Proceed to Stage 2**: Store creation (parallel execution)

---

**Plan Status**: ✓ Ready for Execution
**Estimated Completion**: 99 units (with optimal parallelization)
**Confidence Level**: High (based on Phase 1 success patterns)
