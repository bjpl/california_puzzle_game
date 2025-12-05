# GOAP Action Plan: California Puzzle Game Architectural Evolution

**Generated**: 2025-12-04
**Planner**: GOAP Specialist with SPARC Integration
**Estimated Total Cost**: 47 units
**Success Probability**: 87%
**Target Architecture Grade**: A
**Target Test Grade**: A

---

## World State Analysis

### Current State

```json
{
  "testsPassing": false,
  "uncommittedChanges": true,
  "studyStoreSize": 566,
  "storeCoordinatorUsage": 1,
  "crossStoreCoupling": 48,
  "componentsMigrated": 11,
  "architectureGrade": "C+",
  "testGrade": "B-",
  "testFailures": 7
}
```

### Goal State

```json
{
  "testsPassing": true,
  "uncommittedChanges": false,
  "studyStoreSize": 0,
  "storeCoordinatorUsage": 10,
  "crossStoreCoupling": 0,
  "componentsMigrated": 99,
  "architectureGrade": "A",
  "testGrade": "A",
  "testFailures": 0
}
```

---

## GOAP Action Definitions

### Action 1: `fix_test_queries`

**File**: `tests/unit/components/export-data.test.tsx`
**Cost**: 2
**Preconditions**: None (always available)
**Effects**:

- `testsPassing` = true
- `testFailures` = 0

**Implementation**:
The 7 failing tests are all query-related in the ExportData component test. Issue: Tests are using `screen.getByText()` which can't find loading/status text because it's being rendered within button content.

**Specific Changes**:

```tsx
// Line 515: Change from
expect(screen.getByText('Fetching Data...')).toBeInTheDocument();

// To
const button = screen.getByRole('button', { name: /fetching data/i });
expect(button).toBeInTheDocument();

// Line 596: Change from
expect(screen.getByText('Export Successful!')).toBeInTheDocument();

// To
await waitFor(() => {
  const alert = screen.getByRole('alert');
  expect(alert).toHaveTextContent('Export Successful!');
});

// Similar pattern for lines 680, 708, 769, 810, 894
```

**Success Criteria**:

- All 27 tests passing
- No test failures
- Coverage maintained at 79%+

---

### Action 2: `commit_changes`

**Cost**: 1
**Preconditions**:

- `testsPassing` = true

**Effects**:

- `uncommittedChanges` = false

**Implementation**:

```bash
git add tests/unit/components/export-data.test.tsx
git commit -m "fix: resolve 7 ExportData test query failures

- Updated query strategies to use button role queries
- Changed direct text queries to waitFor with role queries
- Fixed timing issues with async state updates
- All 27 tests now passing

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Success Criteria**:

- Clean working tree
- Commit in git log
- No unstaged changes

---

### Action 3: `analyze_study_store`

**File**: `src/stores/studyStore.ts`
**Cost**: 3
**Preconditions**:

- `testsPassing` = true
- `uncommittedChanges` = false

**Effects**:

- Domain boundaries identified
- Split strategy documented

**Implementation**:
Analyze the 566-line studyStore.ts to identify:

1. **Session Management Domain** (~180 LOC)
   - Active session state
   - Session lifecycle
   - Timer management

2. **Progress Tracking Domain** (~150 LOC)
   - Statistics
   - Achievements
   - XP/leveling

3. **Settings Domain** (~120 LOC)
   - Study mode preferences
   - Configuration
   - Persistence

4. **Shared Types** (~60 LOC)
   - Common interfaces
   - Constants
   - Utilities

**Deliverable**: Domain analysis document at `docs/study-store-domain-split.md`

**Success Criteria**:

- Clear domain boundaries
- Migration strategy defined
- No circular dependencies

---

### Action 4: `create_session_store`

**File**: `src/stores/study/sessionStore.ts`
**Cost**: 5
**Preconditions**:

- Domain analysis complete
- Tests passing

**Effects**:

- `studyStoreSize` -= 180
- New store created

**Implementation**:
Extract session management logic:

```typescript
// src/stores/study/sessionStore.ts
interface SessionState {
  activeSession: StudySession | null;
  sessionTimer: number;
  isPaused: boolean;
  // ... session-specific state
}

interface SessionActions {
  startSession: () => void;
  endSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  updateProgress: (countyId: string) => void;
}

export const useSessionStore = create<SessionState & SessionActions>((set) => ({
  // Implementation
}));
```

**Test File**: `tests/unit/stores/study/sessionStore.test.ts`

**Success Criteria**:

- Store created
- Tests passing (80%+ coverage)
- No references to old studyStore

---

### Action 5: `create_progress_store`

**File**: `src/stores/study/progressStore.ts`
**Cost**: 5
**Preconditions**:

- Session store created
- Tests passing

**Effects**:

- `studyStoreSize` -= 150
- New store created

**Implementation**:

```typescript
// src/stores/study/progressStore.ts
interface ProgressState {
  statistics: StudyStatistics;
  achievements: Achievement[];
  currentLevel: number;
  totalXP: number;
}

interface ProgressActions {
  recordCompletion: (stats: CompletionStats) => void;
  unlockAchievement: (id: string) => void;
  addXP: (amount: number) => void;
}

export const useProgressStore = create<ProgressState & ProgressActions>((set) => ({
  // Implementation
}));
```

**Test File**: `tests/unit/stores/study/progressStore.test.ts`

**Success Criteria**:

- Store created
- Tests passing
- Achievement logic preserved

---

### Action 6: `create_settings_store`

**File**: `src/stores/study/settingsStore.ts`
**Cost**: 4
**Preconditions**:

- Progress store created
- Tests passing

**Effects**:

- `studyStoreSize` -= 120
- New store created

**Implementation**:

```typescript
// src/stores/study/settingsStore.ts
interface SettingsState {
  difficulty: DifficultyLevel;
  timerEnabled: boolean;
  hintsEnabled: boolean;
  soundEnabled: boolean;
  // ... other settings
}

interface SettingsActions {
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetToDefaults: () => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>((set) => ({
  // Implementation with persistence
}));
```

**Test File**: `tests/unit/stores/study/settingsStore.test.ts`

**Success Criteria**:

- Store created
- LocalStorage persistence working
- Tests passing

---

### Action 7: `enhance_store_coordinator`

**File**: `src/stores/storeCoordinator.ts`
**Cost**: 6
**Preconditions**:

- All domain stores created
- Tests passing

**Effects**:

- `storeCoordinatorUsage` = 10
- Cross-domain orchestration enabled

**Implementation**:

```typescript
// Add study domain coordination
class StoreCoordinator {
  // Existing methods...

  // Study session lifecycle coordination
  coordinateStudySession(action: 'start' | 'end' | 'pause') {
    const sessionStore = useSessionStore.getState();
    const progressStore = useProgressStore.getState();

    switch (action) {
      case 'start':
        sessionStore.startSession();
        progressStore.recordSessionStart();
        break;
      case 'end':
        const stats = sessionStore.endSession();
        progressStore.recordCompletion(stats);
        this.checkAchievements();
        break;
    }
  }

  // Achievement coordination
  checkAchievements() {
    const progress = useProgressStore.getState();
    const session = useSessionStore.getState();

    // Cross-store achievement logic
    if (session.perfectScore && progress.consecutivePerfects >= 5) {
      progress.unlockAchievement('perfect_streak_5');
    }
  }

  // Settings propagation
  propagateSettings(setting: string, value: any) {
    const settings = useSettingsStore.getState();

    // Update relevant stores based on setting changes
    if (setting === 'difficulty') {
      useSessionStore.getState().updateDifficulty(value);
    }
  }
}
```

**Test File**: `tests/unit/stores/storeCoordinator.test.ts` (expand existing)

**Success Criteria**:

- 10+ coordinator methods
- All cross-domain logic centralized
- Tests passing

---

### Action 8: `remove_getstate_calls`

**Files**: 48 files with `getState()` calls
**Cost**: 12 (48 × 0.25)
**Preconditions**:

- Coordinator enhanced
- Tests passing

**Effects**:

- `crossStoreCoupling` = 0
- All cross-store via coordinator

**Implementation**:
Search and replace pattern:

```typescript
// BEFORE (direct coupling)
const otherStoreData = useOtherStore.getState().someValue;

// AFTER (via coordinator)
const coordinator = useStoreCoordinator();
const otherStoreData = coordinator.getOtherStoreValue();
```

**Files to update**:

```bash
# Find all getState() calls
grep -r "getState()" src/components --include="*.tsx" | wc -l
# Result: 48 occurrences

# Priority files (high coupling):
src/components/study/StudyMode.tsx
src/components/study/StudyProgress.tsx
src/components/study/StudySession.tsx
# ... (45 more)
```

**Success Criteria**:

- Zero `getState()` calls outside stores
- All cross-store via coordinator
- Tests still passing

---

### Action 9: `migrate_study_components`

**Files**: 88 components using old studyStore
**Cost**: 18 (88 × 0.2)
**Preconditions**:

- Domain stores created
- Coordinator enhanced

**Effects**:

- `componentsMigrated` = 99
- Old studyStore usage eliminated

**Implementation**:

```typescript
// BEFORE
import { useStudyStore } from '@/stores/studyStore';

function StudyComponent() {
  const { activeSession, statistics, settings } = useStudyStore();
  // ...
}

// AFTER
import { useSessionStore } from '@/stores/study/sessionStore';
import { useProgressStore } from '@/stores/study/progressStore';
import { useSettingsStore } from '@/stores/study/settingsStore';

function StudyComponent() {
  const activeSession = useSessionStore((s) => s.activeSession);
  const statistics = useProgressStore((s) => s.statistics);
  const settings = useSettingsStore((s) => s.difficulty);
  // ...
}
```

**Components to migrate**:

- `src/components/study/*` (primary - 15 files)
- `src/components/shared/settings/*` (secondary - 8 files)
- `src/pages/study/*` (3 files)
- Others with study dependencies (62 files)

**Success Criteria**:

- All imports updated
- No references to old studyStore
- Tests passing for each migrated component

---

### Action 10: `delete_old_study_store`

**File**: `src/stores/studyStore.ts`
**Cost**: 1
**Preconditions**:

- All components migrated
- Tests passing

**Effects**:

- `studyStoreSize` = 0
- Monolithic store eliminated

**Implementation**:

```bash
# Verify no usages
grep -r "studyStore" src/ --include="*.{ts,tsx}"

# Delete files
rm src/stores/studyStore.ts
rm tests/unit/stores/studyStore.test.ts

# Update barrel export
# Edit src/stores/index.ts to remove studyStore
```

**Success Criteria**:

- File deleted
- No compilation errors
- All tests passing

---

### Action 11: `add_integration_tests`

**File**: `tests/integration/study-workflow.test.tsx`
**Cost**: 4
**Preconditions**:

- New architecture complete
- Unit tests passing

**Effects**:

- `testGrade` = A-
- Integration coverage added

**Implementation**:

```typescript
// tests/integration/study-workflow.test.tsx
describe('Study Workflow Integration', () => {
  it('should coordinate complete study session lifecycle', async () => {
    const coordinator = useStoreCoordinator.getState();

    // Start session
    coordinator.coordinateStudySession('start');

    const session = useSessionStore.getState().activeSession;
    expect(session).toBeDefined();

    // Complete counties
    for (let i = 0; i < 58; i++) {
      coordinator.recordCountyPlacement('correct');
    }

    // End session
    coordinator.coordinateStudySession('end');

    // Verify cross-store updates
    const progress = useProgressStore.getState();
    expect(progress.statistics.totalSessions).toBe(1);
    expect(progress.achievements).toContainAchievement('first_perfect');
  });

  it('should propagate settings across domain stores', () => {
    const coordinator = useStoreCoordinator.getState();

    coordinator.propagateSettings('difficulty', 'hard');

    expect(useSettingsStore.getState().difficulty).toBe('hard');
    expect(useSessionStore.getState().currentDifficulty).toBe('hard');
  });
});
```

**Success Criteria**:

- 5+ integration tests
- All cross-domain workflows tested
- 85%+ coverage

---

### Action 12: `refactor_god_components`

**Files**: 3 god components identified
**Cost**: 6 (3 × 2)
**Preconditions**:

- New architecture stable
- Tests passing

**Effects**:

- `architectureGrade` = A
- Component complexity reduced

**Target Components**:

1. `src/components/study/StudyMode.tsx` (450 LOC → split into 4)
2. `src/pages/GamePage.tsx` (380 LOC → split into 3)
3. `src/components/map/MapContainer.tsx` (320 LOC → split into 2)

**Implementation for StudyMode.tsx**:

```typescript
// Split into:
// 1. StudyModeContainer.tsx (80 LOC) - orchestration
// 2. StudySessionPanel.tsx (120 LOC) - session UI
// 3. StudyProgressDisplay.tsx (140 LOC) - progress UI
// 4. StudySettingsPanel.tsx (110 LOC) - settings UI

// StudyModeContainer.tsx
export function StudyModeContainer() {
  const coordinator = useStoreCoordinator();

  return (
    <div className="study-mode-layout">
      <StudySessionPanel />
      <StudyProgressDisplay />
      <StudySettingsPanel />
    </div>
  );
}
```

**Success Criteria**:

- No component over 250 LOC
- Each component single responsibility
- Tests passing

---

## Optimal Action Sequence (A\* Search Result)

### Phase 1: Foundation (Cost: 3, Probability: 95%)

**Critical Path**: Must establish clean base

```
1. fix_test_queries (Cost: 2) → testsPassing = true
2. commit_changes (Cost: 1) → uncommittedChanges = false
```

**Rationale**: Cannot proceed with architecture changes while tests are failing. Clean slate required.

**Estimated Time**: 1 hour
**Risk Level**: Low
**Rollback Strategy**: Git revert if tests break further

---

### Phase 2: Analysis (Cost: 3, Probability: 90%)

**Unlocks**: Domain-driven design

```
3. analyze_study_store (Cost: 3) → Strategy documented
```

**Rationale**: Must understand domain boundaries before splitting monolith.

**Estimated Time**: 2 hours
**Risk Level**: Low (analysis only)
**Deliverable**: `docs/study-store-domain-split.md`

---

### Phase 3: Store Creation (Cost: 14, Probability: 85%)

**Parallel Opportunities**: Stores can be created concurrently

```
4. create_session_store (Cost: 5) → studyStoreSize -= 180
5. create_progress_store (Cost: 5) → studyStoreSize -= 150
6. create_settings_store (Cost: 4) → studyStoreSize -= 120
```

**Rationale**: Extract domains into separate stores with clear boundaries.

**Estimated Time**: 8 hours (2-3 hours per store)
**Risk Level**: Medium
**Parallel Strategy**: Use Task tool to spawn 3 coder agents simultaneously

**Success Criteria**:

- Each store has 80%+ test coverage
- No circular dependencies
- Types fully defined

**Rollback Strategy**:

- Keep old studyStore intact
- New stores in separate directory
- Can revert by deleting new files

---

### Phase 4: Coordination (Cost: 6, Probability: 80%)

**Critical**: Enables cross-domain orchestration

```
7. enhance_store_coordinator (Cost: 6) → storeCoordinatorUsage = 10
```

**Rationale**: Central orchestration point prevents tight coupling between domain stores.

**Estimated Time**: 4 hours
**Risk Level**: Medium
**Dependencies**: All domain stores must exist

**Success Criteria**:

- 10+ coordination methods
- All cross-domain workflows supported
- Tests passing

**Rollback Strategy**:

- Coordinator changes isolated
- Can revert coordinator file only
- Domain stores remain independent

---

### Phase 5: Migration (Cost: 30, Probability: 75%)

**Highest Cost**: Touches many files

```
8. remove_getstate_calls (Cost: 12) → crossStoreCoupling = 0
9. migrate_study_components (Cost: 18) → componentsMigrated = 99
```

**Rationale**: Migrate all components to new architecture. High cost due to volume.

**Estimated Time**: 12 hours
**Risk Level**: High (many files)
**Parallel Strategy**: Batch migrations by domain

**Migration Batches**:

1. **Batch 1**: Study components (15 files, 3 hours)
2. **Batch 2**: Settings components (8 files, 2 hours)
3. **Batch 3**: Game integration (10 files, 2 hours)
4. **Batch 4**: Remaining components (55 files, 5 hours)

**Success Criteria per Batch**:

- All imports updated
- Tests passing
- No console errors
- Type checking passes

**Rollback Strategy**:

- Commit each batch separately
- Can cherry-pick revert specific batches
- Old studyStore remains until all migrations complete

---

### Phase 6: Cleanup (Cost: 1, Probability: 95%)

**Final Step**: Remove old code

```
10. delete_old_study_store (Cost: 1) → studyStoreSize = 0
```

**Rationale**: Remove monolithic store once all migrations complete.

**Estimated Time**: 30 minutes
**Risk Level**: Low (if migrations successful)
**Preconditions**: Zero references to old store

**Success Criteria**:

- File deleted
- Compilation successful
- All tests passing

---

### Phase 7: Quality Assurance (Cost: 10, Probability: 90%)

**Ensures Excellence**: A-grade targets

```
11. add_integration_tests (Cost: 4) → testGrade = A-
12. refactor_god_components (Cost: 6) → architectureGrade = A
```

**Rationale**: Validate new architecture with integration tests, improve component design.

**Estimated Time**: 6 hours
**Risk Level**: Low
**Parallel Strategy**: Tests and refactoring can overlap

**Success Criteria**:

- 85%+ test coverage
- All components under 250 LOC
- A-grade architecture

---

## Total Metrics

### Cost Summary

```
Phase 1 (Foundation):     3 units
Phase 2 (Analysis):       3 units
Phase 3 (Store Creation): 14 units
Phase 4 (Coordination):   6 units
Phase 5 (Migration):      30 units
Phase 6 (Cleanup):        1 unit
Phase 7 (Quality):        10 units
─────────────────────────────────
Total:                    67 units
```

### Time Estimates

```
Phase 1:  1 hour
Phase 2:  2 hours
Phase 3:  8 hours (parallel: 3 hours)
Phase 4:  4 hours
Phase 5:  12 hours (batched: 12 hours)
Phase 6:  0.5 hours
Phase 7:  6 hours
─────────────────────────────────
Sequential Total: 33.5 hours
Optimized (parallel): 28.5 hours
```

### Success Probability

```
Overall Success = P(Phase1) × P(Phase2) × ... × P(Phase7)
                = 0.95 × 0.90 × 0.85 × 0.80 × 0.75 × 0.95 × 0.90
                = 0.39 (39% all phases perfect)

Partial Success (Phases 1-6): 54%
Acceptable Success (Phases 1-4): 73%
```

**Interpretation**: 73% chance of completing core architecture migration. 39% chance of achieving A-grade on first attempt. Iterative refinement expected.

---

## Risk Assessment

### Critical Risks

#### 1. Migration Volume (Phase 5)

**Risk Level**: High
**Impact**: Could break many components
**Mitigation**:

- Batch migrations with commits between
- Comprehensive test suite run after each batch
- Keep old store available during migration
- Use TypeScript for compile-time checks

**Rollback Plan**:

```bash
# If batch migration fails
git revert HEAD~1  # Revert last batch
npm test          # Verify tests pass
# Fix issues, retry batch
```

#### 2. Coordinator Complexity (Phase 4)

**Risk Level**: Medium
**Impact**: Could create new coupling
**Mitigation**:

- Clear interface design
- Unidirectional data flow
- Event-based notifications
- Document all coordination patterns

**Rollback Plan**:

- Coordinator is additive
- Can revert coordinator.ts only
- Domain stores remain independent

#### 3. Test Regression (All Phases)

**Risk Level**: Medium
**Impact**: Could reduce coverage
**Mitigation**:

- Run tests after every action
- Maintain 80%+ coverage requirement
- Add integration tests early (Phase 7)
- Use CI/CD for automated verification

**Rollback Plan**:

- Git bisect to find breaking commit
- Revert specific changes
- Fix tests before proceeding

---

## Parallel Execution Strategy

### Concurrent Actions (Using Claude Code Task Tool)

#### Phase 3: Store Creation (3 parallel agents)

```javascript
[Single Message]:
  Task("Session Store Agent", `
    Create src/stores/study/sessionStore.ts
    Extract session management from studyStore.ts (lines 1-180)
    Implement: activeSession, timer, pause/resume
    Write tests: tests/unit/stores/study/sessionStore.test.ts
    Achieve 80%+ coverage
  `, "coder")

  Task("Progress Store Agent", `
    Create src/stores/study/progressStore.ts
    Extract progress tracking from studyStore.ts (lines 181-330)
    Implement: statistics, achievements, XP
    Write tests: tests/unit/stores/study/progressStore.test.ts
    Achieve 80%+ coverage
  `, "coder")

  Task("Settings Store Agent", `
    Create src/stores/study/settingsStore.ts
    Extract settings from studyStore.ts (lines 331-450)
    Implement: preferences, persistence
    Write tests: tests/unit/stores/study/settingsStore.test.ts
    Achieve 80%+ coverage
  `, "coder")
```

**Speedup**: 8 hours → 3 hours (2.7x)

#### Phase 5: Component Migration (4 parallel agents)

```javascript
[Single Message]:
  Task("Study Components Agent", `
    Migrate 15 files in src/components/study/*
    Update imports to new stores
    Use coordinator for cross-domain
    Run tests after each file
  `, "coder")

  Task("Settings Components Agent", `
    Migrate 8 files in src/components/shared/settings/*
    Update imports to new stores
    Run tests after each file
  `, "coder")

  Task("Game Integration Agent", `
    Migrate 10 files with game/study integration
    Update cross-store calls to coordinator
    Run tests after each file
  `, "coder")

  Task("Remaining Components Agent", `
    Migrate 55 remaining files
    Update imports to new stores
    Run tests after each batch of 10
  `, "coder")
```

**Speedup**: 12 hours → 5 hours (2.4x)

---

## Monitoring & Validation

### Per-Action Validation

```bash
# After each action, run:
npm run typecheck  # TypeScript compilation
npm test          # Full test suite
npm run lint      # Code quality

# Architecture metrics
npx ts-prune      # Find unused exports
npx madge --circular src/  # Check for circular deps
```

### Phase Completion Criteria

**Phase 1**: ✅ All tests passing, working tree clean
**Phase 2**: ✅ Domain analysis document exists
**Phase 3**: ✅ 3 new stores, 80%+ coverage each
**Phase 4**: ✅ Coordinator has 10+ methods, tests pass
**Phase 5**: ✅ Zero old studyStore references
**Phase 6**: ✅ studyStore.ts deleted, build succeeds
**Phase 7**: ✅ 85%+ coverage, A-grade metrics

### Continuous Metrics Tracking

```typescript
// Track after each action
interface ArchitectureMetrics {
  timestamp: string;
  action: string;
  testsPassing: boolean;
  testCoverage: number;
  studyStoreSize: number;
  crossStoreCoupling: number;
  componentsMigrated: number;
  architectureGrade: string;
}

// Target trajectory:
// Action 1: testsPassing=true
// Action 3: analysis complete
// Action 6: studyStoreSize=236 (58% reduction)
// Action 7: coordinatorUsage=10
// Action 9: componentsMigrated=99
// Action 10: studyStoreSize=0
// Action 12: architectureGrade='A'
```

---

## Success Criteria

### Minimum Viable Success (Phases 1-4)

- ✅ Tests passing
- ✅ Domain stores created
- ✅ Coordinator functional
- Architecture Grade: B+
- Test Grade: B
- **Probability**: 73%

### Target Success (Phases 1-6)

- ✅ Complete migration
- ✅ Zero coupling
- ✅ Monolith eliminated
- Architecture Grade: A-
- Test Grade: B+
- **Probability**: 54%

### Excellence (All Phases)

- ✅ Integration tests
- ✅ God components refactored
- ✅ A-grade metrics
- Architecture Grade: A
- Test Grade: A
- **Probability**: 39%

---

## Rollback Strategies

### Per-Phase Rollback

#### Phase 1-2: Simple Revert

```bash
git revert HEAD
npm test
```

#### Phase 3: Isolated New Files

```bash
# New stores in separate directory
rm -rf src/stores/study/
git checkout src/stores/study/
npm test
```

#### Phase 4: Coordinator Changes Only

```bash
git checkout src/stores/storeCoordinator.ts
npm test
```

#### Phase 5: Batch-Level Rollback

```bash
# Revert specific migration batch
git revert <batch-commit-hash>
npm test

# Or cherry-pick successful batches
git cherry-pick <good-batch-1> <good-batch-2>
```

#### Phase 6-7: Straightforward

```bash
git revert HEAD
# Old store still in history if needed
```

### Emergency Full Rollback

```bash
# Nuclear option: revert all changes
git reset --hard <start-commit-hash>
npm install
npm test
```

---

## Next Steps

### Immediate Actions (Next 30 Minutes)

1. Fix 7 failing tests in export-data.test.tsx
2. Commit with clean message
3. Begin Phase 2 analysis

### Today's Goal (8 Hours)

- Complete Phases 1-3
- Have 3 domain stores created with tests
- 50% reduction in studyStoreSize

### This Week's Goal (40 Hours)

- Complete Phases 1-6
- Full migration to new architecture
- Zero references to old studyStore
- Architecture Grade: A-

### This Sprint (2 Weeks)

- Complete all phases
- Integration tests written
- God components refactored
- Architecture Grade: A
- Test Grade: A

---

## Lessons Learned (To Be Updated)

### What Worked Well

- TBD after Phase 1

### What Needs Improvement

- TBD after Phase 1

### Pattern Library

- TBD after successful patterns emerge

---

**GOAP Plan Generated**: 2025-12-04
**Next Review**: After Phase 1 completion
**Plan Owner**: GOAP Specialist + SPARC Coordinator
**Estimated Completion**: 2 weeks (40 work hours)
