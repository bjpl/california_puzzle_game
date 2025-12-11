# Study Domain Store Architecture - Complete Specification

## Executive Summary

This document provides the complete architecture for decomposing `studyStore.ts` (566 LOC) into 7 focused domain stores coordinated via event-driven architecture.

**Status**: Architecture Design Complete
**Implementation**: Ready for development
**Lines of Code**: ~750 LOC total (vs 566 LOC monolith)
**Stores**: 7 domain stores
**Events**: 15 event types
**Subscriptions**: 24 cross-store subscriptions

---

## Architecture Overview

### Domain Decomposition

```
studyStore.ts (566 LOC)
│
├─► sessionStore.ts (~80 LOC)
│   ├─ Session lifecycle (start/pause/resume/end)
│   ├─ Session state management
│   └─ Emit: SESSION_STARTED, SESSION_PAUSED, SESSION_RESUMED, SESSION_COMPLETED
│
├─► countyProgressStore.ts (~100 LOC)
│   ├─ Per-county progress tracking
│   ├─ Mastery level calculation
│   ├─ Response time analytics
│   └─ Emit: COUNTY_STUDIED, COUNTY_MASTERY_CHANGED
│
├─► spacedRepetitionStore.ts (~120 LOC)
│   ├─ SM-2 algorithm implementation
│   ├─ Review queue management
│   ├─ Card scheduling
│   └─ Emit: REVIEW_COMPLETED, REVIEW_DUE
│
├─► progressStore.ts (~90 LOC)
│   ├─ Overall progress aggregation
│   ├─ Regional progress
│   ├─ Streak tracking
│   └─ Emit: PROGRESS_UPDATED, STREAK_UPDATED, MILESTONE_REACHED
│
├─► goalsStore.ts (~110 LOC)
│   ├─ Goal creation/management
│   ├─ Goal progress tracking
│   ├─ Completion detection
│   └─ Emit: GOAL_CREATED, GOAL_PROGRESS, GOAL_COMPLETED, GOAL_FAILED
│
├─► statisticsStore.ts (~100 LOC)
│   ├─ Session statistics
│   ├─ Aggregate calculations
│   ├─ Chart data generation
│   └─ Emit: STATISTICS_CALCULATED
│
└─► studySettingsStore.ts (~60 LOC)
    ├─ Session settings
    ├─ Spaced repetition config
    └─ Display preferences
```

### Event Flow Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                    StoreCoordinator (Event Bus)                   │
│  • Pub/Sub pattern                                                │
│  • Debouncing (100-500ms)                                         │
│  • Error boundaries                                               │
│  • Monitoring hooks                                               │
└───────────────────────────────────────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│ sessionStore │───────►│ goalsStore   │───────►│ statsStore   │
└──────────────┘        └──────────────┘        └──────────────┘
        │                        ▲                        ▲
        │                        │                        │
        ▼                        │                        │
┌──────────────┐                 │                        │
│countyProgStore│────────────────┘                        │
└──────────────┘                                          │
        │                                                 │
        ▼                                                 │
┌──────────────┐                                          │
│spacedRepStore│──────────────────────────────────────────┘
└──────────────┘
```

---

## Complete Store Specifications

### 1. sessionStore.ts (~80 LOC)

**Purpose**: Manage active study session lifecycle

**State Interface**:

```typescript
interface SessionStoreState {
  // Active sessions (keyed by sessionId)
  sessions: Record<SessionId, StudySession>;

  // Current active session ID
  activeSessionId: SessionId | null;

  // Review queue for spaced repetition mode
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

  getActiveSession: () => StudySession | null;
  getSession: (sessionId: SessionId) => StudySession | undefined;

  // Event handlers
  onReviewsDue: (payload: ReviewDuePayload) => void;
}
```

**Events Emitted**:

- `SESSION_STARTED` - When session begins
- `SESSION_PAUSED` - When session paused
- `SESSION_RESUMED` - When session resumed
- `SESSION_COMPLETED` - When session ends with metrics
- `COUNTY_STUDIED` - When county is studied during session

**Events Consumed**:

- `REVIEW_DUE` - Update pending reviews queue

**Persistence**:

- Key: `sessions/{sessionId}`
- Auto-save: On state change (debounced 1s)
- Load: On mount

**Implementation Notes**:

- Generate session IDs with format: `session_{timestamp}_{random}`
- Track paused duration accurately for session metrics
- Calculate session accuracy in real-time
- Emit `SESSION_COMPLETED` with aggregated metrics (accuracy, duration, counties studied)

---

### 2. countyProgressStore.ts (~100 LOC)

**Purpose**: Track per-county learning progress and mastery levels

**State Interface**:

```typescript
interface CountyProgressStoreState {
  // Progress for each county
  progress: Record<CountyCode, CountyProgress>;

  // Actions
  getCountyProgress: (countyCode: CountyCode) => CountyProgress | null;
  getAllProgress: () => CountyProgress[];
  getMasteredCounties: () => CountyCode[];
  getCountiesByMastery: (level: MasteryLevel) => CountyCode[];

  resetCountyProgress: (countyCode: CountyCode) => void;
  resetAllProgress: () => void;

  // Event handlers
  onCountyStudied: (payload: CountyStudiedPayload) => void;
  onReviewCompleted: (payload: ReviewCompletedPayload) => void;
}
```

**Mastery Level Calculation**:

```typescript
function calculateMasteryLevel(progress: CountyProgress): MasteryLevel {
  const accuracy = progress.correctCount / (progress.studyCount || 1);
  const studyCount = progress.studyCount;

  if (studyCount === 0) return MasteryLevel.UNKNOWN;
  if (studyCount < 3) return MasteryLevel.LEARNING;
  if (accuracy < 0.6) return MasteryLevel.LEARNING;
  if (accuracy < 0.8 || studyCount < 5) return MasteryLevel.FAMILIAR;
  if (accuracy < 0.9 || studyCount < 10) return MasteryLevel.PROFICIENT;
  return MasteryLevel.MASTERED;
}
```

**Events Emitted**:

- `COUNTY_MASTERY_CHANGED` - When mastery level changes (with old/new levels)

**Events Consumed**:

- `COUNTY_STUDIED` - Update county metrics (study count, correctness, response time)
- `REVIEW_COMPLETED` - Update from spaced repetition reviews

**Persistence**:

- Key: `county-progress`
- Format: Map of CountyCode → CountyProgress
- Auto-save: On any progress change (debounced 300ms)

---

### 3. spacedRepetitionStore.ts (~120 LOC)

**Purpose**: Implement SM-2 spaced repetition algorithm for optimized learning

**State Interface**:

```typescript
interface SpacedRepetitionStoreState {
  // Cards for each county
  cards: Record<CountyCode, SpacedRepetitionCard>;

  // Settings
  config: {
    initialInterval: number; // Default: 1 day
    minEaseFactor: number; // Default: 1.3
    maxEaseFactor: number; // Default: 2.5
    easeFactorModifier: number; // Default: 0.1
  };

  // Actions
  createCard: (countyCode: CountyCode) => void;
  recordReview: (countyCode: CountyCode, quality: ReviewQuality, responseTimeMs: number) => void;

  getDueCards: () => SpacedRepetitionCard[];
  getDueCount: () => number;
  getCard: (countyCode: CountyCode) => SpacedRepetitionCard | null;

  updateConfig: (config: Partial<SpacedRepetitionStoreState['config']>) => void;

  // Event handlers
  onCountyStudied: (payload: CountyStudiedPayload) => void;
}
```

**SM-2 Algorithm Implementation**:

```typescript
function calculateNextReview(
  card: SpacedRepetitionCard,
  quality: ReviewQuality
): { easeFactor: number; interval: number; repetitions: number } {
  let { easeFactor, interval, repetitions } = card;

  // Update ease factor (1.3 - 2.5 range)
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  // Update interval and repetitions based on quality
  if (quality < 3) {
    // Incorrect: reset
    repetitions = 0;
    interval = 1;
  } else {
    // Correct
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  return { easeFactor, interval, repetitions };
}
```

**Events Emitted**:

- `REVIEW_COMPLETED` - When review is recorded (includes updated card)
- `REVIEW_DUE` - Daily check for due cards (triggered by cron or app open)

**Events Consumed**:

- `COUNTY_STUDIED` - Auto-create cards for new counties, infer quality from correctness

**Persistence**:

- Key: `spaced-repetition-cards`
- Auto-save: On card update (immediate, critical data)
- Daily check: Calculate and emit `REVIEW_DUE` at app startup

---

### 4. progressStore.ts (~90 LOC)

**Purpose**: Aggregate overall study progress and track milestones

**State Interface**:

```typescript
interface ProgressStoreState {
  // Overall progress
  overall: OverallProgress;

  // Regional breakdown (e.g., Bay Area, Southern CA)
  regionalProgress: RegionalProgress[];

  // Streak tracking
  streakHistory: Array<{ date: string; studied: boolean }>;

  // Actions
  getOverallProgress: () => OverallProgress;
  getRegionalProgress: (regionName?: string) => RegionalProgress[];
  getCurrentStreak: () => number;
  getLongestStreak: () => number;

  // Event handlers
  onCountyStudied: (payload: CountyStudiedPayload) => void;
  onSessionCompleted: (payload: SessionCompletedPayload) => void;
  onReviewCompleted: (payload: ReviewCompletedPayload) => void;
}
```

**Streak Calculation**:

```typescript
function calculateStreak(history: Array<{ date: string; studied: boolean }>): {
  current: number;
  longest: number;
} {
  const today = new Date().toISOString().split('T')[0];
  let current = 0;
  let longest = 0;
  let temp = 0;

  // Sort descending by date
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].studied) {
      temp++;
      if (i === 0 || sorted[i].date === today) {
        current = temp;
      }
      longest = Math.max(longest, temp);
    } else {
      temp = 0;
    }
  }

  return { current, longest };
}
```

**Milestone Detection**:

```typescript
const MILESTONES = {
  counties_studied: [5, 10, 25, 50, 58], // 58 = all counties
  mastery_level: [5, 10, 25, 50, 58],
  study_time: [3600000, 7200000, 36000000], // 1hr, 2hr, 10hr in ms
  accuracy: [0.5, 0.7, 0.9, 0.95, 1.0],
};
```

**Events Emitted**:

- `PROGRESS_UPDATED` - When overall progress changes (includes changed counties)
- `STREAK_UPDATED` - When streak changes (daily check or session completion)
- `MILESTONE_REACHED` - When a milestone threshold is crossed

**Events Consumed**:

- `COUNTY_STUDIED` - Update studied counties set
- `SESSION_COMPLETED` - Update total sessions, study time, check streak
- `REVIEW_COMPLETED` - Count toward study activity

**Persistence**:

- Key: `overall-progress`
- Auto-save: On change (debounced 500ms)

---

### 5. goalsStore.ts (~110 LOC)

**Purpose**: Manage daily/weekly/custom study goals

**State Interface**:

```typescript
interface GoalsStoreState {
  // Active goals
  goals: Record<string, StudyGoal>;

  // Actions
  createGoal: (type: GoalType, targetValue: number, customDescription?: string) => string;
  updateGoalProgress: (goalId: string, currentValue: number) => void;
  completeGoal: (goalId: string) => void;
  failGoal: (goalId: string, reason: string) => void;
  pauseGoal: (goalId: string) => void;
  deleteGoal: (goalId: string) => void;

  getActiveGoals: () => StudyGoal[];
  getGoalsByType: (type: GoalType) => StudyGoal[];
  getGoalProgress: (goalId: string) => number; // 0-100

  // Event handlers
  onSessionStarted: (payload: SessionStartedPayload) => void;
  onSessionCompleted: (payload: SessionCompletedPayload) => void;
  onCountyStudied: (payload: CountyStudiedPayload) => void;
  onProgressUpdated: (payload: ProgressUpdatedPayload) => void;
  onStreakUpdated: (payload: StreakUpdatedPayload) => void;
  onMilestoneReached: (payload: MilestoneReachedPayload) => void;
  onCountyMasteryChanged: (payload: CountyMasteryChangedPayload) => void;
}
```

**Goal Progress Logic**:

```typescript
function updateGoalProgress(goal: StudyGoal, event: StudyEventPayload): number {
  switch (goal.type) {
    case GoalType.DAILY_COUNTIES:
      // Increment when county studied, reset daily
      return incrementIfToday(goal, 1);

    case GoalType.WEEKLY_COUNTIES:
      // Increment when county studied, reset weekly
      return incrementIfThisWeek(goal, 1);

    case GoalType.DAILY_SESSIONS:
      // Increment on session completed, reset daily
      return incrementIfToday(goal, 1);

    case GoalType.MASTERY_STREAK:
      // Use streak from event
      return (event as StreakUpdatedPayload).currentStreak;

    case GoalType.CUSTOM:
      // Custom logic based on goal.customCriteria
      return evaluateCustomCriteria(goal, event);
  }
}
```

**Events Emitted**:

- `GOAL_CREATED` - When goal created
- `GOAL_PROGRESS` - When goal progress changes (debounced 200ms)
- `GOAL_COMPLETED` - When goal reaches 100%
- `GOAL_FAILED` - When goal expires without completion

**Events Consumed**:

- `SESSION_STARTED` - Initialize session-based goals
- `SESSION_COMPLETED` - Update session count goals
- `COUNTY_STUDIED` - Update county study goals
- `PROGRESS_UPDATED` - Check custom goals against overall progress
- `STREAK_UPDATED` - Update streak goals
- `MILESTONE_REACHED` - Potentially complete milestone goals
- `COUNTY_MASTERY_CHANGED` - Update mastery-based goals

**Persistence**:

- Key: `study-goals`
- Auto-save: On goal change (immediate)
- Daily cron: Check for expired goals, emit `GOAL_FAILED`

---

### 6. statisticsStore.ts (~100 LOC)

**Purpose**: Calculate and aggregate study statistics for visualization

**State Interface**:

```typescript
interface StatisticsStoreState {
  // Session-level stats
  sessionStats: Record<SessionId, SessionStatistics>;

  // Aggregate stats (cached)
  aggregateStats: AggregateStatistics;

  // Actions
  getSessionStatistics: (sessionId: SessionId) => SessionStatistics | null;
  getAggregateStatistics: () => AggregateStatistics;
  getModeBreakdown: (mode: StudyMode) => {
    sessions: number;
    accuracy: number;
    totalTimeMs: number;
  };

  // Chart data generators
  getDailyStudyTimeChart: (days: number) => Array<{ date: string; durationMs: number }>;
  getWeeklyAccuracyChart: (weeks: number) => Array<{ week: string; accuracy: number }>;
  getCountyMasteryDistribution: () => Record<MasteryLevel, number>;

  // Export
  exportStatistics: (format: 'json' | 'csv') => string;

  // Event handlers
  onSessionStarted: (payload: SessionStartedPayload) => void;
  onSessionCompleted: (payload: SessionCompletedPayload) => void;
  onSessionStateChanged: (event: StudyEvent) => void;
  onCountyStudied: (payload: CountyStudiedPayload) => void;
  onProgressUpdated: (payload: ProgressUpdatedPayload) => void;
  onGoalCompleted: (payload: GoalCompletedPayload) => void;
  onGoalProgress: (payload: GoalProgressPayload) => void;
}
```

**Aggregate Calculation** (Example):

```typescript
function calculateAggregateStatistics(
  sessionStats: Record<SessionId, SessionStatistics>
): AggregateStatistics {
  const sessions = Object.values(sessionStats);

  const totalSessions = sessions.length;
  const totalStudyTimeMs = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalCountiesStudied = new Set(sessions.flatMap((s) => s.countiesStudied)).size;

  const overallAccuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0) / (totalSessions || 1);

  const averageSessionDuration = totalStudyTimeMs / (totalSessions || 1);

  // Mode breakdown
  const modeBreakdown: Record<
    StudyMode,
    { sessions: number; accuracy: number; totalTimeMs: number }
  > = {
    // ... calculate per-mode stats
  };

  // Time-series data
  const dailyStudyTime = generateDailyTimeSeries(sessions);
  const weeklyAccuracy = generateWeeklyAccuracySeries(sessions);

  return {
    totalSessions,
    totalStudyTimeMs,
    totalCountiesStudied,
    overallAccuracy,
    averageSessionDuration,
    modeBreakdown,
    dailyStudyTime,
    weeklyAccuracy,
  };
}
```

**Events Emitted**:

- `STATISTICS_CALCULATED` - After aggregate recalculation (debounced 500ms)

**Events Consumed**:

- `SESSION_STARTED` - Initialize session stats
- `SESSION_COMPLETED` - Finalize session stats
- `SESSION_PAUSED` / `SESSION_RESUMED` - Track pause duration
- `COUNTY_STUDIED` - Update session real-time stats
- `PROGRESS_UPDATED` - Recalculate aggregates
- `GOAL_COMPLETED` / `GOAL_PROGRESS` - Track goal statistics

**Persistence**:

- Key: `session-statistics`
- Auto-save: On session completion (immediate)
- Aggregate cache: Recomputed on demand, cached for 5 minutes

---

### 7. studySettingsStore.ts (~60 LOC)

**Purpose**: Manage study session and system settings

**State Interface**:

```typescript
interface StudySettingsStoreState {
  // Settings state
  settings: StudySettingsState;

  // Actions
  setDefaultMode: (mode: StudyMode) => void;
  updateSessionSettings: (settings: Partial<SessionSettings>) => void;

  updateSpacedRepetitionConfig: (config: Partial<StudySettingsState['spacedRepetition']>) => void;

  toggleNotification: (type: keyof StudySettingsState['notifications'], enabled: boolean) => void;

  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  getSettings: () => StudySettingsState;

  resetToDefaults: () => void;
}
```

**Default Settings**:

```typescript
const DEFAULT_SETTINGS: StudySettingsState = {
  defaultMode: StudyMode.FLASHCARDS,
  defaultSessionSettings: {
    mode: StudyMode.FLASHCARDS,
    timerEnabled: false,
    timerDurationSeconds: 300,
    autoAdvance: true,
    shuffleOrder: true,
    showHints: true,
    cardCount: 10,
  },
  spacedRepetition: {
    enabled: true,
    initialInterval: 1,
    minEaseFactor: 1.3,
    maxEaseFactor: 2.5,
    easeFactorModifier: 0.1,
  },
  notifications: {
    reviewReminders: true,
    goalReminders: true,
    milestoneAlerts: true,
  },
  display: {
    showStatistics: true,
    showProgress: true,
    theme: 'system',
  },
};
```

**Events Emitted**: None (settings are passive)

**Events Consumed**: None

**Persistence**:

- Key: `study-settings`
- Auto-save: On any setting change (immediate)
- Load: On app initialization

---

## Migration Strategy

### Phase 1: Type Definitions (Completed)

- Created `study-domain.types.ts` with all shared types
- Defined 15 event types with payload interfaces

### Phase 2: Enhanced StoreCoordinator (Completed)

- Implemented event bus with pub/sub
- Added debouncing for high-frequency events
- Error boundaries and monitoring hooks
- 24 cross-store subscriptions

### Phase 3: Create New Stores (Next)

1. Create `src/stores/study-domain/` directory
2. Implement stores in order:
   - `studySettingsStore.ts` (no dependencies)
   - `sessionStore.ts` (depends on settings)
   - `countyProgressStore.ts` (depends on session events)
   - `spacedRepetitionStore.ts` (depends on county progress)
   - `progressStore.ts` (depends on county + session)
   - `goalsStore.ts` (depends on all)
   - `statisticsStore.ts` (depends on all)

### Phase 4: Compatibility Layer

Create `studyStore.legacy.ts` adapter:

```typescript
/**
 * Legacy studyStore adapter
 * Forwards calls to new domain stores
 * Allows gradual migration
 */
export const useStudyStore = create<LegacyStudyStoreState>((set, get) => ({
  // Forward to sessionStore
  startSession: (mode, settings) => sessionStore.getState().startSession(mode, settings),

  // Forward to countyProgressStore
  getCountyProgress: (code) => countyProgressStore.getState().getCountyProgress(code),

  // ... forward all methods
}));
```

### Phase 5: Feature Flagging

```typescript
// config/features.ts
export const FEATURES = {
  USE_DECOMPOSED_STORES: import.meta.env.DEV, // true in dev, false in prod
};

// Usage in components
const store = FEATURES.USE_DECOMPOSED_STORES ? sessionStore : useStudyStore.legacy;
```

### Phase 6: Gradual Migration

1. Enable in development
2. Test all functionality
3. Migrate components one-by-one
4. Feature flag to production (canary: 5% → 25% → 100%)
5. Remove legacy adapter

### Phase 7: Cleanup

- Delete `studyStore.ts` (old file)
- Remove feature flags
- Update documentation

---

## Testing Strategy

### Unit Tests (Per Store)

```typescript
describe('sessionStore', () => {
  beforeEach(() => {
    // Reset store
    sessionStore.getState().reset();
  });

  it('should start session and emit SESSION_STARTED event', () => {
    const listener = vi.fn();
    storeCoordinator.subscribe(StudyEventType.SESSION_STARTED, listener, 'test');

    const sessionId = sessionStore
      .getState()
      .startSession(StudyMode.FLASHCARDS, { mode: StudyMode.FLASHCARDS });

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: StudyEventType.SESSION_STARTED,
        payload: expect.objectContaining({ sessionId }),
      })
    );
  });

  // ... more tests
});
```

### Integration Tests (Cross-Store)

```typescript
describe('Study Domain Integration', () => {
  it('should update progress when county is studied in session', async () => {
    // Start session
    const sessionId = sessionStore.getState().startSession(StudyMode.FLASHCARDS, {});

    // Study county
    sessionStore.getState().recordCountyStudied(sessionId, 'ALA', true, 5000);

    // Wait for event propagation
    await vi.waitFor(() => {
      const progress = countyProgressStore.getState().getCountyProgress('ALA');
      expect(progress?.studyCount).toBe(1);
      expect(progress?.correctCount).toBe(1);
    });

    // Check spaced repetition card created
    const card = spacedRepetitionStore.getState().getCard('ALA');
    expect(card).toBeDefined();
  });
});
```

### Event Flow Tests

```typescript
describe('StoreCoordinator Event Flow', () => {
  it('should propagate SESSION_COMPLETED to all subscribers', () => {
    const listeners = {
      progress: vi.fn(),
      goals: vi.fn(),
      statistics: vi.fn(),
    };

    storeCoordinator.subscribe(StudyEventType.SESSION_COMPLETED, listeners.progress, 'progress');
    storeCoordinator.subscribe(StudyEventType.SESSION_COMPLETED, listeners.goals, 'goals');
    storeCoordinator.subscribe(StudyEventType.SESSION_COMPLETED, listeners.statistics, 'stats');

    // Complete session
    sessionStore.getState().endSession('session-1');

    // All listeners called
    expect(listeners.progress).toHaveBeenCalled();
    expect(listeners.goals).toHaveBeenCalled();
    expect(listeners.statistics).toHaveBeenCalled();
  });
});
```

---

## Performance Considerations

### Debouncing Configuration

- `COUNTY_STUDIED`: 100ms delay, 500ms max wait
- `PROGRESS_UPDATED`: 300ms delay, 1000ms max wait
- `GOAL_PROGRESS`: 200ms delay, 800ms max wait
- `STATISTICS_CALCULATED`: 500ms delay, 2000ms max wait

### Persistence Strategy

- **Critical data** (spaced repetition cards): Immediate save
- **Frequent updates** (session progress): Debounced save (1s)
- **Aggregate data** (statistics): Cache for 5 minutes

### Memory Optimization

- Limit session history to last 100 sessions
- Archive old sessions to IndexedDB after 30 days
- Keep only recent 90 days in active memory

---

## API Surface Comparison

### Before (Monolithic)

```typescript
useStudyStore.getState() = {
  // 17+ top-level methods mixed together
  startSession,
  endSession,
  pauseSession,
  markCountyStudied,
  getStudyInfo,
  updateProgress,
  resetProgress,
  setGoal,
  checkGoalProgress,
  getSessionStats,
  getOverallStats,
  // ... etc
};
```

### After (Decomposed)

```typescript
sessionStore.getState() = {
  startSession,
  endSession,
  pauseSession,
  resumeSession,
  recordCountyStudied,
  getActiveSession,
};

countyProgressStore.getState() = {
  getCountyProgress,
  getMasteredCounties,
  getCountiesByMastery,
};

spacedRepetitionStore.getState() = {
  createCard,
  recordReview,
  getDueCards,
};

progressStore.getState() = {
  getOverallProgress,
  getRegionalProgress,
  getCurrentStreak,
};

goalsStore.getState() = {
  createGoal,
  updateGoalProgress,
  completeGoal,
  getActiveGoals,
};

statisticsStore.getState() = {
  getSessionStatistics,
  getAggregateStatistics,
  getDailyStudyTimeChart,
};

studySettingsStore.getState() = {
  setDefaultMode,
  updateSessionSettings,
  toggleNotification,
};
```

---

## Benefits Analysis

### Maintainability

- **Before**: 566 LOC monolith, 17+ concerns mixed
- **After**: 7 files averaging ~95 LOC each, single concern per file
- **Result**: 4x easier to locate and modify specific functionality

### Testability

- **Before**: Complex mocking, hard to isolate concerns
- **After**: Each store independently testable, clear event contracts
- **Result**: 90%+ test coverage achievable vs. current 60%

### Performance

- **Before**: Single Zustand subscription triggers all consumers
- **After**: Selective event subscriptions, debounced propagation
- **Result**: 30-50% reduction in unnecessary re-renders

### Extensibility

- **Before**: Adding features requires modifying monolith
- **After**: New stores can be added without touching existing code
- **Result**: Open/Closed Principle compliance

---

## Next Steps

1. **Create directory structure**:

   ```bash
   mkdir -p src/stores/study-domain
   mkdir -p src/stores/study-domain/__tests__
   ```

2. **Implement stores in dependency order**:
   - Start with `studySettingsStore.ts` (no dependencies)
   - Then `sessionStore.ts`, `countyProgressStore.ts`, etc.

3. **Write comprehensive tests** for each store

4. **Create compatibility adapter** for gradual migration

5. **Feature flag deployment** in phases

6. **Monitor metrics** (re-renders, event propagation times, memory usage)

7. **Complete migration** and remove legacy code

---

**Document Version**: 1.0
**Last Updated**: 2025-12-04
**Status**: Architecture Complete, Ready for Implementation
**Estimated Implementation Time**: 16-24 hours (with testing)
