# COMPLETE GOAP REFACTORING PLAN

## California Puzzle Game - Store Migration Project

**Generated**: 2025-12-04
**Planner**: SPARC-GOAP Specialist
**Methodology**: Goal-Oriented Action Planning with A\* Search

---

## WORLD STATE DEFINITION

```typescript
interface WorldState {
  // Phase 1: Test Stability
  testsPass ing: boolean;              // false → true
  uncommittedChanges: boolean;        // true → false

  // Phase 2: Domain Store Creation
  sessionStoreExists: boolean;        // false → true
  countyProgressStoreExists: boolean; // false → true
  spacedRepetitionStoreExists: boolean; // false → true
  progressStoreExists: boolean;       // false → true
  goalsStoreExists: boolean;          // false → true
  statisticsStoreExists: boolean;     // false → true
  settingsStoreExists: boolean;       // false → true
  coordinatorSubscriptions: number;   // 1 → 24

  // Phase 3: Study Store Refactoring
  studyStoreLOC: number;              // 566 → 0
  studyStoreFacadeReady: boolean;     // false → true
  countyAnimationLOC: number;         // 984 → 200
  gameContainerLOC: number;           // 677 → 300

  // Phase 4: Component Migration
  getStateCalls: number;              // 37 → 0
  componentsMigrated: number;         // 0 → 81
  integrationTestsAdded: number;      // 0 → 12

  // Quality Metrics
  architectureGrade: string;          // "C+" → "A"
  testGrade: string;                  // "B-" → "A"
  testCoverage: number;               // 80% → 95%
}
```

---

## INITIAL STATE

```typescript
const INITIAL_STATE: WorldState = {
  testsPasssing: false, // 1 test failing
  uncommittedChanges: true, // export-data.test.tsx modified
  sessionStoreExists: false,
  countyProgressStoreExists: false,
  spacedRepetitionStoreExists: false,
  progressStoreExists: false,
  goalsStoreExists: false,
  statisticsStoreExists: false,
  settingsStoreExists: false,
  coordinatorSubscriptions: 1,
  studyStoreLOC: 566,
  studyStoreFacadeReady: false,
  countyAnimationLOC: 984,
  gameContainerLOC: 677,
  getStateCalls: 37,
  componentsMigrated: 0,
  integrationTestsAdded: 0,
  architectureGrade: 'C+',
  testGrade: 'B-',
  testCoverage: 80,
};
```

---

## GOAL STATE

```typescript
const GOAL_STATE: WorldState = {
  testsPasssing: true,
  uncommittedChanges: false,
  sessionStoreExists: true,
  countyProgressStoreExists: true,
  spacedRepetitionStoreExists: true,
  progressStoreExists: true,
  goalsStoreExists: true,
  statisticsStoreExists: true,
  settingsStoreExists: true,
  coordinatorSubscriptions: 24,
  studyStoreLOC: 0,
  studyStoreFacadeReady: true,
  countyAnimationLOC: 200,
  gameContainerLOC: 300,
  getStateCalls: 0,
  componentsMigrated: 81,
  integrationTestsAdded: 12,
  architectureGrade: 'A',
  testGrade: 'A',
  testCoverage: 95,
};
```

---

## COMPLETE ACTION DEFINITIONS (50 Actions)

### PHASE 1: TEST STABILIZATION (Cost: 15, Time: 2 hours)

#### Action 1: fix_export_data_test

```typescript
{
  name: "fix_export_data_test",
  preconditions: { testsPasssing: false },
  effects: { testsPasssing: true },
  cost: 10,
  estimatedTime: "1.5 hours",
  agentType: "tester",
  filePaths: ["tests/unit/components/export-data.test.tsx"],
  codeChanges: `
    Issue: screen.query* methods being called incorrectly
    Fix: Review test assertions and fix query method usage
    - Line 596: Fix query method call
    - Line 680: Fix query method call
    - Line 686: Fix query method call
    Add proper waitFor wrappers where needed
  `,
  rollbackProcedure: "git checkout HEAD -- tests/unit/components/export-data.test.tsx"
}
```

#### Action 2: commit_test_fixes

```typescript
{
  name: "commit_test_fixes",
  preconditions: { testsPasssing: true, uncommittedChanges: true },
  effects: { uncommittedChanges: false },
  cost: 5,
  estimatedTime: "0.5 hours",
  agentType: "coder",
  filePaths: ["tests/unit/components/export-data.test.tsx"],
  codeChanges: `
    Git commit with message:
    "fix: resolve export-data test query method calls

    - Fixed screen.query* method usage in lines 596, 680, 686
    - Added proper waitFor wrappers for async assertions
    - All 475 tests now passing

    🤖 Generated with Claude Code"
  `,
  rollbackProcedure: "git reset HEAD~1"
}
```

---

### PHASE 2: DOMAIN STORE CREATION (Cost: 180, Time: 24 hours)

#### Action 3: create_session_store

```typescript
{
  name: "create_session_store",
  preconditions: { testsPasssing: true, uncommittedChanges: false },
  effects: { sessionStoreExists: true },
  cost: 25,
  estimatedTime: "3 hours",
  agentType: "coder",
  filePaths: ["src/stores/session-store.ts", "tests/unit/stores/session-store.test.ts"],
  codeChanges: `
    Create new Zustand store:
    - State: currentSession, sessionHistory, isSessionActive
    - Actions: startSession, endSession, pauseSession, resumeSession
    - Selectors: getActiveSession, getSessionDuration, getSessionStats
    - Persistence: localStorage with 'session-state' key
    - Tests: 15 test cases covering all actions
  `,
  rollbackProcedure: `
    rm src/stores/session-store.ts
    rm tests/unit/stores/session-store.test.ts
  `
}
```

#### Action 4: create_county_progress_store

```typescript
{
  name: "create_county_progress_store",
  preconditions: { testsPasssing: true },
  effects: { countyProgressStoreExists: true },
  cost: 25,
  estimatedTime: "3 hours",
  agentType: "coder",
  filePaths: ["src/stores/county-progress-store.ts", "tests/unit/stores/county-progress-store.test.ts"],
  codeChanges: `
    Create new Zustand store:
    - State: countyProgress Map<countyId, ProgressData>
    - ProgressData: { attempts, successes, lastAttempt, mastery }
    - Actions: recordAttempt, updateMastery, resetProgress
    - Selectors: getCountyMastery, getMasteredCounties, getCountyStats
    - Persistence: localStorage with 'county-progress' key
    - Tests: 18 test cases
  `,
  rollbackProcedure: `
    rm src/stores/county-progress-store.ts
    rm tests/unit/stores/county-progress-store.test.ts
  `
}
```

#### Action 5: create_spaced_repetition_store

```typescript
{
  name: "create_spaced_repetition_store",
  preconditions: { countyProgressStoreExists: true },
  effects: { spacedRepetitionStoreExists: true },
  cost: 30,
  estimatedTime: "4 hours",
  agentType: "coder",
  filePaths: ["src/stores/spaced-repetition-store.ts", "tests/unit/stores/spaced-repetition-store.test.ts"],
  codeChanges: `
    Create SM-2 algorithm store:
    - State: repetitionData Map<itemId, SM2Data>
    - SM2Data: { efactor, interval, repetitions, nextReview }
    - Actions: recordReview, calculateNext, getNextItems
    - Selectors: getDueItems, getItemInterval, getRetentionRate
    - Algorithm: SuperMemo SM-2 implementation
    - Persistence: localStorage with 'spaced-repetition' key
    - Tests: 22 test cases including algorithm validation
  `,
  rollbackProcedure: `
    rm src/stores/spaced-repetition-store.ts
    rm tests/unit/stores/spaced-repetition-store.test.ts
  `
}
```

#### Action 6: create_progress_store

```typescript
{
  name: "create_progress_store",
  preconditions: { countyProgressStoreExists: true },
  effects: { progressStoreExists: true },
  cost: 20,
  estimatedTime: "2.5 hours",
  agentType: "coder",
  filePaths: ["src/stores/progress-store.ts", "tests/unit/stores/progress-store.test.ts"],
  codeChanges: `
    Create overall progress tracking store:
    - State: totalCountiesPlaced, correctPlacements, totalAttempts
    - Actions: recordPlacement, updateAccuracy, resetProgress
    - Selectors: getAccuracyRate, getCompletionRate, getProgressPercentage
    - Persistence: localStorage with 'progress' key
    - Tests: 12 test cases
  `,
  rollbackProcedure: `
    rm src/stores/progress-store.ts
    rm tests/unit/stores/progress-store.test.ts
  `
}
```

#### Action 7: create_goals_store

```typescript
{
  name: "create_goals_store",
  preconditions: { progressStoreExists: true },
  effects: { goalsStoreExists: true },
  cost: 25,
  estimatedTime: "3 hours",
  agentType: "coder",
  filePaths: ["src/stores/goals-store.ts", "tests/unit/stores/goals-store.test.ts"],
  codeChanges: `
    Create goal tracking store:
    - State: activeGoals, completedGoals, goalProgress
    - Goal types: daily, weekly, mastery, accuracy
    - Actions: createGoal, updateGoalProgress, completeGoal
    - Selectors: getActiveGoals, getGoalProgress, isGoalComplete
    - Persistence: localStorage with 'goals' key
    - Tests: 16 test cases
  `,
  rollbackProcedure: `
    rm src/stores/goals-store.ts
    rm tests/unit/stores/goals-store.test.ts
  `
}
```

#### Action 8: create_statistics_store

```typescript
{
  name: "create_statistics_store",
  preconditions: { progressStoreExists: true },
  effects: { statisticsStoreExists: true },
  cost: 25,
  estimatedTime: "3 hours",
  agentType: "coder",
  filePaths: ["src/stores/statistics-store.ts", "tests/unit/stores/statistics-store.test.ts"],
  codeChanges: `
    Create statistics aggregation store:
    - State: sessionStats, timeStats, accuracyStats, streakData
    - Actions: recordSessionEnd, updateStreak, calculateStats
    - Selectors: getAverageAccuracy, getLongestStreak, getTimeSpent
    - Persistence: localStorage with 'statistics' key
    - Tests: 14 test cases
  `,
  rollbackProcedure: `
    rm src/stores/statistics-store.ts
    rm tests/unit/stores/statistics-store.test.ts
  `
}
```

#### Action 9: create_settings_store

```typescript
{
  name: "create_settings_store",
  preconditions: { testsPasssing: true },
  effects: { settingsStoreExists: true },
  cost: 15,
  estimatedTime: "2 hours",
  agentType: "coder",
  filePaths: ["src/stores/settings-store.ts", "tests/unit/stores/settings-store.test.ts"],
  codeChanges: `
    Create user settings store:
    - State: studyModePreferences, displayOptions, notificationSettings
    - Actions: updateStudyPreference, toggleNotifications, resetSettings
    - Selectors: getStudyPreferences, getDisplayOptions
    - Persistence: localStorage with 'settings' key
    - Tests: 10 test cases
  `,
  rollbackProcedure: `
    rm src/stores/settings-store.ts
    rm tests/unit/stores/settings-store.test.ts
  `
}
```

#### Action 10-16: update_coordinator_subscriptions (7 actions)

```typescript
{
  name: "add_coordinator_session_subscriptions",
  preconditions: { sessionStoreExists: true },
  effects: { coordinatorSubscriptions: 4 },
  cost: 5,
  estimatedTime: "0.5 hours",
  agentType: "coder",
  filePaths: ["src/stores/storeCoordinator.ts"],
  codeChanges: `
    Add session store subscriptions to coordinator:
    - Subscribe to startSession → update statistics
    - Subscribe to endSession → record progress
    - Subscribe to pauseSession → save state
    - Subscribe to resumeSession → restore state
  `,
  rollbackProcedure: "git checkout HEAD -- src/stores/storeCoordinator.ts"
},
// Similar for each new store:
// - county-progress: 4 subscriptions
// - spaced-repetition: 3 subscriptions
// - progress: 4 subscriptions
// - goals: 3 subscriptions
// - statistics: 3 subscriptions
// - settings: 2 subscriptions
// Total: 23 new subscriptions (1 existing + 23 = 24)
```

---

### PHASE 3: STUDY STORE REFACTORING (Cost: 220, Time: 28 hours)

#### Action 17: create_study_store_facade

```typescript
{
  name: "create_study_store_facade",
  preconditions: {
    sessionStoreExists: true,
    countyProgressStoreExists: true,
    spacedRepetitionStoreExists: true,
    progressStoreExists: true,
    goalsStoreExists: true,
    statisticsStoreExists: true,
    settingsStoreExists: true
  },
  effects: { studyStoreFacadeReady: true },
  cost: 40,
  estimatedTime: "5 hours",
  agentType: "architect",
  filePaths: ["src/stores/study-store-facade.ts", "tests/unit/stores/study-store-facade.test.ts"],
  codeChanges: `
    Create facade that delegates to domain stores:

    // Facade pattern implementation
    export const useStudyStore = () => {
      const session = useSessionStore();
      const countyProgress = useCountyProgressStore();
      const spacedRep = useSpacedRepetitionStore();
      const progress = useProgressStore();
      const goals = useGoalsStore();
      const stats = useStatisticsStore();
      const settings = useSettingsStore();

      return {
        // Session methods
        startSession: session.startSession,
        endSession: session.endSession,

        // County progress methods
        recordAttempt: countyProgress.recordAttempt,
        getCountyMastery: countyProgress.getCountyMastery,

        // Spaced repetition methods
        getNextItems: spacedRep.getNextItems,
        recordReview: spacedRep.recordReview,

        // Progress methods
        recordPlacement: progress.recordPlacement,
        getAccuracyRate: progress.getAccuracyRate,

        // Goal methods
        getActiveGoals: goals.getActiveGoals,
        updateGoalProgress: goals.updateGoalProgress,

        // Statistics methods
        getAverageAccuracy: stats.getAverageAccuracy,
        getLongestStreak: stats.getLongestStreak,

        // Settings methods
        getStudyPreferences: settings.getStudyPreferences,
        updateStudyPreference: settings.updateStudyPreference,
      };
    };

    Tests: 25 test cases validating delegation
  `,
  rollbackProcedure: `
    rm src/stores/study-store-facade.ts
    rm tests/unit/stores/study-store-facade.test.ts
  `
}
```

#### Action 18-25: migrate_study_store_methods (8 actions)

```typescript
{
  name: "migrate_session_methods",
  preconditions: { studyStoreFacadeReady: true },
  effects: { studyStoreLOC: 495 },
  cost: 20,
  estimatedTime: "2.5 hours",
  agentType: "coder",
  filePaths: ["src/stores/study-store.ts"],
  codeChanges: `
    Move session-related code from study-store.ts to session-store.ts:
    - startStudySession → session.startSession
    - endStudySession → session.endSession
    - getCurrentSession → session.getActiveSession
    Delete ~71 LOC from study-store.ts
    Update imports in study-store.ts
  `,
  rollbackProcedure: "git checkout HEAD -- src/stores/study-store.ts"
},
// Similar actions for:
// - migrate_county_methods (70 LOC reduction)
// - migrate_spaced_repetition_methods (80 LOC reduction)
// - migrate_progress_methods (60 LOC reduction)
// - migrate_goals_methods (65 LOC reduction)
// - migrate_statistics_methods (75 LOC reduction)
// - migrate_settings_methods (50 LOC reduction)
// Total reduction: 566 LOC → 0 LOC
```

#### Action 26: delete_old_study_store

```typescript
{
  name: "delete_old_study_store_implementation",
  preconditions: { studyStoreLOC: 0 },
  effects: { studyStoreLOC: 0 },
  cost: 10,
  estimatedTime: "1 hour",
  agentType: "coder",
  filePaths: ["src/stores/study-store.ts"],
  codeChanges: `
    Replace study-store.ts content with:

    // Re-export facade for backward compatibility
    export { useStudyStore } from './study-store-facade';

    // This file is deprecated and will be removed in v2.0
    // All functionality has been moved to domain-specific stores
  `,
  rollbackProcedure: "git checkout HEAD -- src/stores/study-store.ts"
}
```

#### Action 27-28: extract_animation_code

```typescript
{
  name: "extract_animation_hooks",
  preconditions: { studyStoreFacadeReady: true },
  effects: { countyAnimationLOC: 600 },
  cost: 35,
  estimatedTime: "4.5 hours",
  agentType: "coder",
  filePaths: [
    "src/hooks/useCountyAnimation.ts",
    "tests/unit/hooks/useCountyAnimation.test.ts"
  ],
  codeChanges: `
    Extract animation logic from CountyFormationAnimation.tsx:
    - useCountyAnimation hook
    - useAnimationState hook
    - useAnimationTimeline hook
    Reduce CountyFormationAnimation.tsx by 384 LOC
    Add 20 test cases for hooks
  `,
  rollbackProcedure: `
    rm src/hooks/useCountyAnimation.ts
    rm tests/unit/hooks/useCountyAnimation.test.ts
    git checkout HEAD -- src/components/county/CountyFormationAnimation.tsx
  `
},
{
  name: "extract_animation_components",
  preconditions: { countyAnimationLOC: 600 },
  effects: { countyAnimationLOC: 200 },
  cost: 30,
  estimatedTime: "4 hours",
  agentType: "coder",
  filePaths: [
    "src/components/county/animation/AnimationCanvas.tsx",
    "src/components/county/animation/AnimationControls.tsx",
    "src/components/county/animation/AnimationTimeline.tsx"
  ],
  codeChanges: `
    Split CountyFormationAnimation.tsx into components:
    - AnimationCanvas.tsx (150 LOC)
    - AnimationControls.tsx (80 LOC)
    - AnimationTimeline.tsx (120 LOC)
    Main component reduced to 200 LOC (orchestration only)
    Add tests for each component
  `,
  rollbackProcedure: `
    rm -rf src/components/county/animation/
    git checkout HEAD -- src/components/county/CountyFormationAnimation.tsx
  `
}
```

#### Action 29: refactor_game_container

```typescript
{
  name: "refactor_game_container",
  preconditions: { studyStoreFacadeReady: true },
  effects: { gameContainerLOC: 300 },
  cost: 35,
  estimatedTime: "4.5 hours",
  agentType: "coder",
  filePaths: [
    "src/components/game/GameContainer.tsx",
    "src/hooks/useGameState.ts",
    "src/hooks/useCountyDragDrop.ts"
  ],
  codeChanges: `
    Extract hooks from GameContainer.tsx:
    - useGameState (game lifecycle, 120 LOC)
    - useCountyDragDrop (drag-drop logic, 157 LOC)
    Reduce GameContainer.tsx from 677 LOC to 300 LOC
    Add tests for extracted hooks
  `,
  rollbackProcedure: `
    rm src/hooks/useGameState.ts
    rm src/hooks/useCountyDragDrop.ts
    git checkout HEAD -- src/components/game/GameContainer.tsx
  `
}
```

---

### PHASE 4: COMPONENT MIGRATION (Cost: 380, Time: 48 hours)

#### Action 30-33: remove_getstate_calls (4 actions, 37 calls total)

```typescript
{
  name: "remove_getstate_batch_1",
  preconditions: { studyStoreFacadeReady: true },
  effects: { getStateCalls: 28 },
  cost: 25,
  estimatedTime: "3 hours",
  agentType: "coder",
  filePaths: [
    "src/utils/initializeSound.ts",
    "src/lib/sync/gameStatsSync.ts",
    "src/lib/sync/gameSettingsSync.ts"
  ],
  codeChanges: `
    Replace getState() calls with selectors:

    // Before
    const state = useStore.getState();
    const value = state.someValue;

    // After
    const value = useStore(state => state.someValue);

    Files affected:
    - initializeSound.ts: 2 calls
    - gameStatsSync.ts: 4 calls
    - gameSettingsSync.ts: 3 calls
    Total: 9 calls removed
  `,
  rollbackProcedure: "git checkout HEAD -- src/utils/initializeSound.ts src/lib/sync/"
},
// Similar for batches 2-4, removing all 37 calls
```

#### Action 34-40: migrate_tier1_components (11 components)

```typescript
{
  name: "migrate_tier1_components_batch_1",
  preconditions: { studyStoreFacadeReady: true, getStateCalls: 0 },
  effects: { componentsMigrated: 11 },
  cost: 40,
  estimatedTime: "5 hours",
  agentType: "coder",
  filePaths: [
    "src/components/game/GameHeader.tsx",
    "src/components/study/StudyMode.tsx",
    "src/components/study/EnhancedStudyMode.tsx",
    "src/components/game/GameComplete.tsx",
    "src/components/shared/settings/Statistics.tsx",
    // ... 6 more components
  ],
  codeChanges: `
    Tier 1: Core game components with direct store usage
    - Replace useStudyStore with domain store hooks
    - Update component tests
    - Verify no regressions

    Example:
    // Before
    const { startSession, progress } = useStudyStore();

    // After
    const startSession = useSessionStore(s => s.startSession);
    const progress = useProgressStore(s => s.getProgressPercentage());

    Components: 11 core game components
  `,
  rollbackProcedure: "git checkout HEAD -- src/components/game/ src/components/study/"
}
```

#### Action 41-44: migrate_tier2_components (22 components)

```typescript
{
  name: "migrate_tier2_components_batch_1",
  preconditions: { componentsMigrated: 11 },
  effects: { componentsMigrated: 18 },
  cost: 35,
  estimatedTime: "4.5 hours",
  agentType: "coder",
  filePaths: [
    "src/components/shared/settings/UserSettings.tsx",
    "src/components/game/achievements/AchievementGallery.tsx",
    // ... 5 more components per batch
  ],
  codeChanges: `
    Tier 2: UI components with indirect store usage
    - Update to use domain stores via facade
    - Add unit tests for new store integration
    - Performance check (no additional re-renders)

    Batches:
    - Batch 1: 7 components (settings, achievements)
    - Batch 2: 8 components (modals, feedback)
    - Batch 3: 7 components (map, county display)
    Total: 22 components
  `,
  rollbackProcedure: "git checkout HEAD -- src/components/"
}
```

#### Action 45-46: migrate_tier3_components (48 components)

```typescript
{
  name: "migrate_tier3_utility_components",
  preconditions: { componentsMigrated: 33 },
  effects: { componentsMigrated: 60 },
  cost: 50,
  estimatedTime: "6.5 hours",
  agentType: "coder",
  filePaths: [
    "src/components/ui/*.tsx",
    "src/components/shared/*.tsx",
    "src/components/county/*.tsx"
  ],
  codeChanges: `
    Tier 3: Utility and presentational components
    - Minimal store usage (mostly props-based)
    - Quick migration to domain stores where needed
    - Focus on leaf components

    Categories:
    - UI components: 15 components
    - Shared utilities: 12 components
    - County displays: 21 components
    Total: 48 components
  `,
  rollbackProcedure: "git checkout HEAD -- src/components/ui/ src/components/shared/ src/components/county/"
},
{
  name: "migrate_remaining_edge_cases",
  preconditions: { componentsMigrated: 60 },
  effects: { componentsMigrated: 81 },
  cost: 30,
  estimatedTime: "4 hours",
  agentType: "coder",
  filePaths: [
    "src/components/mobile/*.tsx",
    "src/components/accessibility/*.tsx",
    "src/components/analytics/*.tsx"
  ],
  codeChanges: `
    Final 21 components:
    - Mobile-specific components: 5
    - Accessibility components: 2
    - Analytics components: 3
    - Sync components: 3
    - Error boundaries: 2
    - Feedback/toast: 3
    - Other utilities: 3

    Handle edge cases and cross-cutting concerns
  `,
  rollbackProcedure: "git checkout HEAD -- src/components/"
}
```

#### Action 47-48: add_integration_tests

```typescript
{
  name: "add_store_integration_tests",
  preconditions: { componentsMigrated: 81 },
  effects: { integrationTestsAdded: 6 },
  cost: 40,
  estimatedTime: "5 hours",
  agentType: "tester",
  filePaths: [
    "tests/integration/stores/session-flow.test.ts",
    "tests/integration/stores/county-progress-flow.test.ts",
    "tests/integration/stores/spaced-repetition-flow.test.ts",
    "tests/integration/stores/goals-progress-flow.test.ts",
    "tests/integration/stores/statistics-aggregation.test.ts",
    "tests/integration/stores/coordinator-orchestration.test.ts"
  ],
  codeChanges: `
    Integration tests for store interactions:

    1. session-flow: Start session → record progress → end session
    2. county-progress-flow: Attempt → update mastery → spaced repetition
    3. spaced-repetition-flow: Review → calculate interval → schedule next
    4. goals-progress-flow: Set goal → track progress → complete goal
    5. statistics-aggregation: Multiple sessions → aggregate stats
    6. coordinator-orchestration: Cross-store updates via coordinator

    Each test: 15-20 test cases
    Total: ~100 integration test cases
  `,
  rollbackProcedure: "rm -rf tests/integration/stores/"
},
{
  name: "add_component_integration_tests",
  preconditions: { integrationTestsAdded: 6 },
  effects: { integrationTestsAdded: 12 },
  cost: 35,
  estimatedTime: "4.5 hours",
  agentType: "tester",
  filePaths: [
    "tests/integration/components/game-flow.test.tsx",
    "tests/integration/components/study-flow.test.tsx",
    "tests/integration/components/achievement-flow.test.tsx",
    "tests/integration/components/settings-flow.test.tsx",
    "tests/integration/components/statistics-flow.test.tsx",
    "tests/integration/components/goal-tracking-flow.test.tsx"
  ],
  codeChanges: `
    Component integration tests with new stores:

    1. game-flow: Full game session with all store interactions
    2. study-flow: Study mode with spaced repetition
    3. achievement-flow: Unlock achievements via progress
    4. settings-flow: Update settings → affect game behavior
    5. statistics-flow: View statistics from multiple stores
    6. goal-tracking-flow: Create → track → complete goals

    Each test: 12-15 test cases
    Total: ~80 component integration tests
  `,
  rollbackProcedure: "rm -rf tests/integration/components/"
}
```

#### Action 49: final_cleanup

```typescript
{
  name: "final_cleanup_and_validation",
  preconditions: {
    componentsMigrated: 81,
    integrationTestsAdded: 12,
    getStateCalls: 0
  },
  effects: {
    architectureGrade: "A",
    testGrade: "A",
    testCoverage: 95
  },
  cost: 45,
  estimatedTime: "6 hours",
  agentType: "reviewer",
  filePaths: [
    "src/stores/",
    "src/components/",
    "tests/"
  ],
  codeChanges: `
    Final validation and cleanup:

    1. Remove unused imports across all files
    2. Update JSDoc comments with new store references
    3. Run full test suite (target: 100% passing)
    4. Check test coverage (target: 95%+)
    5. Run linter and fix all warnings
    6. Performance audit (ensure no regression)
    7. Bundle size check (target: no increase)
    8. Update documentation:
       - Architecture diagrams
       - Store migration guide
       - Component usage examples
    9. Create migration changelog
    10. Verify architecture grade: A
    11. Verify test grade: A
    12. Final commit
  `,
  rollbackProcedure: "git reset --hard HEAD~1"
}
```

#### Action 50: create_rollback_safety_commit

```typescript
{
  name: "create_rollback_safety_commit",
  preconditions: {
    architectureGrade: "A",
    testGrade: "A"
  },
  effects: {},
  cost: 10,
  estimatedTime: "1 hour",
  agentType: "coder",
  filePaths: ["docs/migration-rollback-guide.md"],
  codeChanges: `
    Create comprehensive rollback documentation:

    1. Tag current state: git tag v1.0.0-pre-migration
    2. Document rollback for each phase
    3. Create rollback scripts:
       - rollback-phase-1.sh
       - rollback-phase-2.sh
       - rollback-phase-3.sh
       - rollback-phase-4.sh
       - rollback-all.sh
    4. Test rollback procedures in branch
    5. Document data migration (localStorage keys)
  `,
  rollbackProcedure: "N/A - this is the rollback mechanism"
}
```

---

## A\* SEARCH OPTIMAL PATH

### Path Constraints:

- Must complete Phase 1 before Phase 2 (tests must pass)
- Must complete all Phase 2 stores before Phase 3 (facade needs all stores)
- Must complete Phase 3 before Phase 4 (components need facade)
- Can parallelize within phases

### Critical Path (Sequential):

```
Action 1 → Action 2 → [Actions 3-16 in parallel] →
[Actions 17-29 in parallel] → [Actions 30-48 in parallel] →
Action 49 → Action 50
```

### Parallel Execution Opportunities:

**Phase 2 (Actions 3-16): 3 parallel streams**

- Stream A: Actions 3, 10 (session store + coordinator)
- Stream B: Actions 4, 5, 11, 12 (county + spaced rep + coordinators)
- Stream C: Actions 6, 7, 8, 9, 13, 14, 15, 16 (progress, goals, stats, settings + coordinators)

**Phase 3 (Actions 17-29): 3 parallel streams**

- Stream A: Actions 17, 18-25 (facade + migrations)
- Stream B: Actions 27-28 (animation extraction)
- Stream C: Action 29 (GameContainer refactor)

**Phase 4 (Actions 30-48): 4 parallel streams**

- Stream A: Actions 30-33 (getState removal)
- Stream B: Actions 34-40 (Tier 1 components)
- Stream C: Actions 41-44 (Tier 2 components)
- Stream D: Actions 45-46 (Tier 3 components)
- Stream E: Actions 47-48 (Integration tests)

---

## COST AND TIME ANALYSIS

### Total Costs:

- **Phase 1**: 15 (2 actions)
- **Phase 2**: 180 (14 actions)
- **Phase 3**: 220 (13 actions)
- **Phase 4**: 380 (19 actions)
- **Finalization**: 55 (2 actions)
- **TOTAL**: 850 cost units

### Total Time (Sequential):

- **Phase 1**: 2 hours
- **Phase 2**: 24 hours
- **Phase 3**: 28 hours
- **Phase 4**: 48 hours
- **Finalization**: 7 hours
- **TOTAL**: 109 hours (~14 working days)

### Total Time (With Parallelization):

- **Phase 1**: 2 hours (sequential)
- **Phase 2**: 9 hours (3 parallel streams)
- **Phase 3**: 11 hours (3 parallel streams)
- **Phase 4**: 14 hours (4-5 parallel streams)
- **Finalization**: 7 hours (sequential)
- **TOTAL**: 43 hours (~5.5 working days)

**Speedup**: 2.5x with parallelization

---

## SUCCESS PROBABILITY BY PHASE

### Phase 1: Test Stabilization

- **Probability**: 95%
- **Risk**: Low - straightforward test fixes
- **Mitigation**: Review test patterns before fixing

### Phase 2: Domain Store Creation

- **Probability**: 90%
- **Risk**: Medium - new stores must integrate correctly
- **Mitigation**:
  - Create tests before implementation
  - Use existing store patterns (Zustand)
  - Validate coordinator subscriptions

### Phase 3: Study Store Refactoring

- **Probability**: 85%
- **Risk**: Medium-High - complex refactoring with facade
- **Mitigation**:
  - Keep old store until facade is fully tested
  - Gradual migration with parallel systems
  - Comprehensive facade tests

### Phase 4: Component Migration

- **Probability**: 80%
- **Risk**: High - 81 components, many dependencies
- **Mitigation**:
  - Tier-based approach (critical first)
  - Automated migration scripts
  - Extensive integration testing
  - Rollback plan per tier

### Overall Success Probability:

```
P(success) = 0.95 × 0.90 × 0.85 × 0.80 = 0.58 (58%)
```

**With Mitigation Strategies**:

```
P(success) ≈ 0.85 (85%)
```

---

## COMPLETE ROLLBACK STRATEGY

### Phase-by-Phase Rollback:

#### Phase 1 Rollback:

```bash
git checkout HEAD -- tests/unit/components/export-data.test.tsx
git reset HEAD~1  # if committed
```

#### Phase 2 Rollback:

```bash
# Remove all new stores
rm -rf src/stores/session-store.ts
rm -rf src/stores/county-progress-store.ts
rm -rf src/stores/spaced-repetition-store.ts
rm -rf src/stores/progress-store.ts
rm -rf src/stores/goals-store.ts
rm -rf src/stores/statistics-store.ts
rm -rf src/stores/settings-store.ts
rm -rf tests/unit/stores/{session,county-progress,spaced-repetition,progress,goals,statistics,settings}-store.test.ts

# Revert coordinator changes
git checkout HEAD -- src/stores/storeCoordinator.ts

# Reset commits
git reset --hard HEAD~14
```

#### Phase 3 Rollback:

```bash
# Remove facade
rm src/stores/study-store-facade.ts
rm tests/unit/stores/study-store-facade.test.ts

# Restore original study store
git checkout HEAD -- src/stores/study-store.ts

# Remove extracted hooks
rm src/hooks/useCountyAnimation.ts
rm src/hooks/useGameState.ts
rm src/hooks/useCountyDragDrop.ts
rm -rf src/components/county/animation/

# Restore original components
git checkout HEAD -- src/components/county/CountyFormationAnimation.tsx
git checkout HEAD -- src/components/game/GameContainer.tsx

# Reset commits
git reset --hard HEAD~13
```

#### Phase 4 Rollback:

```bash
# Restore all component changes
git checkout HEAD -- src/components/
git checkout HEAD -- src/utils/
git checkout HEAD -- src/lib/

# Remove integration tests
rm -rf tests/integration/stores/
rm -rf tests/integration/components/

# Reset commits
git reset --hard HEAD~19
```

#### Complete Rollback:

```bash
# If tagged before migration
git reset --hard v1.0.0-pre-migration

# Or reset to specific commit
git reset --hard <commit-hash-before-migration>

# Force push if needed (careful!)
git push --force origin main
```

### Data Migration Rollback:

```typescript
// localStorage keys to clear if needed
const MIGRATION_KEYS = [
  'session-state',
  'county-progress',
  'spaced-repetition',
  'progress',
  'goals',
  'statistics',
  'settings',
];

// Rollback function
function rollbackLocalStorage() {
  MIGRATION_KEYS.forEach((key) => localStorage.removeItem(key));
  console.log('Migration data cleared from localStorage');
}
```

---

## QUALITY GATES

### After Each Phase:

1. **Run Full Test Suite**: All tests must pass
2. **Check Test Coverage**: Must not decrease
3. **Lint Check**: No new warnings
4. **Type Check**: No TypeScript errors
5. **Build Check**: Production build succeeds
6. **Performance Check**: No regression in benchmarks
7. **Bundle Size**: No significant increase

### Final Quality Gate (Action 49):

1. **Architecture Grade**: A (from C+)
2. **Test Grade**: A (from B-)
3. **Test Coverage**: ≥95% (from 80%)
4. **All Tests Passing**: 100%
5. **No Console Errors**: In development
6. **Accessibility**: No regressions
7. **Performance**: ≤5% regression acceptable
8. **Documentation**: Complete and accurate

---

## RISK MITIGATION MATRIX

| Risk                                 | Probability | Impact   | Mitigation                                    | Contingency                               |
| ------------------------------------ | ----------- | -------- | --------------------------------------------- | ----------------------------------------- |
| Test failures after Phase 2          | Medium      | High     | Comprehensive unit tests for each store       | Rollback Phase 2, fix tests incrementally |
| Facade breaks existing functionality | High        | Critical | Keep old study store during migration         | Parallel systems, gradual cutover         |
| Component migration breaks UI        | High        | High     | Tier-based migration, visual regression tests | Rollback per tier, fix and retry          |
| Performance degradation              | Medium      | Medium   | Benchmark each phase                          | Optimize selectors, use shallow equality  |
| Data loss during migration           | Low         | Critical | Backup localStorage before each phase         | Restore from backup                       |
| Integration test failures            | Medium      | Medium   | Write tests alongside migration               | Fix integration issues before proceeding  |
| Merge conflicts                      | Low         | Low      | Frequent commits, clear naming                | Resolve conflicts early                   |

---

## HEURISTIC FUNCTION FOR A\* SEARCH

```typescript
function heuristic(state: WorldState, goal: WorldState): number {
  let h = 0;

  // Phase weights (higher = more important)
  const PHASE_WEIGHTS = {
    tests: 100, // Highest priority
    stores: 80, // High priority
    facade: 60, // Medium-high priority
    migration: 40, // Medium priority
    cleanup: 20, // Lower priority
  };

  // Tests not passing = critical
  if (!state.testsPasssing) {
    h += PHASE_WEIGHTS.tests;
  }

  // Uncommitted changes = blocker
  if (state.uncommittedChanges) {
    h += PHASE_WEIGHTS.tests / 2;
  }

  // Missing stores
  const storesNeeded = [
    'sessionStoreExists',
    'countyProgressStoreExists',
    'spacedRepetitionStoreExists',
    'progressStoreExists',
    'goalsStoreExists',
    'statisticsStoreExists',
    'settingsStoreExists',
  ];
  const missingStores = storesNeeded.filter((s) => !state[s]).length;
  h += (missingStores * PHASE_WEIGHTS.stores) / 7;

  // Coordinator subscriptions
  const subscriptionDiff = goal.coordinatorSubscriptions - state.coordinatorSubscriptions;
  h += (subscriptionDiff / 23) * PHASE_WEIGHTS.stores;

  // Study store refactoring
  if (!state.studyStoreFacadeReady) {
    h += PHASE_WEIGHTS.facade;
  }
  const locDiff = state.studyStoreLOC;
  h += (locDiff / 566) * PHASE_WEIGHTS.facade;

  // Component migration
  const componentsDiff = goal.componentsMigrated - state.componentsMigrated;
  h += (componentsDiff / 81) * PHASE_WEIGHTS.migration;

  // getState calls
  h += (state.getStateCalls / 37) * PHASE_WEIGHTS.migration;

  // Integration tests
  const testsDiff = goal.integrationTestsAdded - state.integrationTestsAdded;
  h += (testsDiff / 12) * PHASE_WEIGHTS.cleanup;

  // Quality metrics
  if (state.architectureGrade !== 'A') {
    h += PHASE_WEIGHTS.cleanup;
  }
  if (state.testGrade !== 'A') {
    h += PHASE_WEIGHTS.cleanup;
  }

  return h;
}
```

---

## MONITORING AND METRICS

### Track Per Action:

- Execution time (actual vs estimated)
- Test pass rate before/after
- Coverage change
- LOC changed
- Files modified
- Rollback attempts

### Track Per Phase:

- Phase completion time
- Tests added/modified
- Coverage delta
- Performance impact
- Bundle size delta

### Overall Metrics:

- Total migration time
- Total test count (before/after)
- Coverage improvement
- Architecture grade improvement
- Test grade improvement
- Number of rollbacks needed
- Success rate per action type

---

## EXECUTION CHECKLIST

### Before Starting:

- [ ] Create feature branch: `feature/store-migration-goap`
- [ ] Tag current state: `v1.0.0-pre-migration`
- [ ] Backup localStorage data
- [ ] Document current metrics (tests, coverage, performance)
- [ ] Review all 50 actions
- [ ] Set up monitoring dashboard
- [ ] Prepare rollback scripts

### During Execution:

- [ ] Run quality gates after each phase
- [ ] Commit after each successful action
- [ ] Update progress tracking
- [ ] Monitor metrics
- [ ] Document any deviations
- [ ] Test rollback procedures

### After Completion:

- [ ] Final quality gate validation
- [ ] Performance comparison
- [ ] Documentation update
- [ ] Create migration report
- [ ] Tag final state: `v2.0.0-store-migration`
- [ ] Archive rollback branch
- [ ] Post-mortem analysis

---

## CONCLUSION

This GOAP plan provides:

- **50 well-defined actions** with preconditions and effects
- **Optimal execution path** via A\* search
- **Parallel execution opportunities** (2.5x speedup)
- **Comprehensive rollback strategy** for each phase
- **Risk mitigation** for all identified risks
- **Quality gates** to ensure success
- **Monitoring framework** for tracking progress

**Estimated Timeline**:

- Sequential: 109 hours (~14 working days)
- Parallel: 43 hours (~5.5 working days)
- Recommended: 6-7 working days with testing buffer

**Success Probability**: 85% with mitigation strategies

**Next Steps**:

1. Review and approve this plan
2. Set up monitoring and tracking
3. Create rollback safety commits
4. Execute Phase 1 (test stabilization)
5. Proceed phase by phase with quality gates

---

_Generated by SPARC-GOAP Planner_
_California Puzzle Game Refactoring Project_
_2025-12-04_
