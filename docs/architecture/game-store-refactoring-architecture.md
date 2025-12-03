# Game Store Refactoring Architecture

**Project:** California Puzzle Game
**Architect:** Claude Code System Architecture Designer
**Date:** December 2, 2025
**Status:** Architecture Design Phase

## Executive Summary

This document defines the architecture for refactoring `gameStore.ts` (880 lines, 73 methods, 11 concerns) into 7 specialized domain stores. The refactoring follows the **Single Responsibility Principle** while maintaining backward compatibility and improving maintainability.

### Goals
1. Reduce cognitive complexity from 880 lines to ~150 lines per store
2. Establish clear domain boundaries
3. Enable independent testing and maintenance
4. Maintain existing API surface for minimal migration impact
5. Improve TypeScript type safety and intellisense

### Non-Goals
- Changing the public API significantly
- Rewriting business logic
- Modifying existing components during this phase

---

## 1. Store Architecture Overview

### 1.1 Domain Store Breakdown

```
Current: gameStore.ts (880 lines, 11 concerns)
        ↓
        ↓ Refactor into 7 stores
        ↓
┌───────────────────────────────────────────────────────┐
│ 1. coreGameStore.ts      (~150 lines)                │
│    - Game lifecycle management                        │
│    - Mode selection and progression                   │
│    - Timer management                                 │
├───────────────────────────────────────────────────────┤
│ 2. countyPlacementStore.ts (~180 lines)              │
│    - County placement/removal/movement                │
│    - Placement accuracy calculations                  │
│    - Remaining/placed county tracking                 │
├───────────────────────────────────────────────────────┤
│ 3. scoringStore.ts       (~140 lines)                │
│    - Score calculation and updates                    │
│    - Streak management                                │
│    - Score multipliers                                │
├───────────────────────────────────────────────────────┤
│ 4. achievementStore.ts   (~160 lines)                │
│    - Achievement checking and unlocking               │
│    - Progress tracking                                │
│    - Achievement state management                     │
├───────────────────────────────────────────────────────┤
│ 5. hintStore.ts          (~200 lines)                │
│    - Hint system state                                │
│    - Player struggle analysis                         │
│    - Auto-suggestion logic                            │
├───────────────────────────────────────────────────────┤
│ 6. statisticsStore.ts    (~120 lines)                │
│    - Game statistics tracking                         │
│    - Personal bests                                   │
│    - Play time and accuracy                           │
├───────────────────────────────────────────────────────┤
│ 7. gameSettingsStore.ts  (~130 lines)                │
│    - Game settings                                    │
│    - Sound settings                                   │
│    - Gesture state                                    │
└───────────────────────────────────────────────────────┘
```

### 1.2 Architectural Principles

1. **Independent but Composable**: Each store can function independently
2. **Event-Driven Communication**: Stores communicate via subscriptions
3. **Shared State Pattern**: Common state (userId, gameActive) via composition
4. **Type Safety**: Strong TypeScript types with no `any`
5. **Persistence Strategy**: Per-store persistence configuration
6. **Middleware Consistency**: All stores use `devtools` + `persist`

---

## 2. Detailed Store Specifications

### 2.1 Core Game Store

**Responsibility**: Game lifecycle, mode management, timer

**File**: `src/stores/game/coreGameStore.ts`

#### Type Definitions

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  GameModeConfiguration,
  DifficultyLevel,
  CaliforniaRegion,
} from '@/types';

/**
 * Core game state - minimal lifecycle data
 */
export interface CoreGameState {
  // Lifecycle
  currentLevel: number;
  isGameActive: boolean;
  isPaused: boolean;
  timeElapsed: number;

  // Mode & Region
  currentMode: GameModeConfiguration;
  selectedRegion: CaliforniaRegion;
  difficulty: DifficultyLevel;
  availableModes: GameModeConfiguration[];

  // User context (shared)
  userId: string | null;
}

/**
 * Core game actions
 */
export interface CoreGameActions {
  // Lifecycle
  startGame: (region?: CaliforniaRegion, difficulty?: DifficultyLevel) => void;
  startGameWithMode: (mode: GameModeConfiguration) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;

  // Timer
  updateTimer: (deltaTime: number) => void;

  // Mode Management
  setCurrentMode: (mode: GameModeConfiguration) => void;
  updateModeProgress: (
    modeId: string,
    stars: number,
    score: number,
    completionTime?: number
  ) => void;
  unlockMode: (modeId: string) => void;

  // User
  setUserId: (userId: string | null) => void;
}

export type CoreGameStore = CoreGameState & CoreGameActions;
```

#### Implementation Pattern

```typescript
export const useCoreGameStore = create<CoreGameStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentLevel: 1,
        isGameActive: false,
        isPaused: false,
        timeElapsed: 0,
        currentMode: GAME_MODES[0],
        selectedRegion: CaliforniaRegion.BAY_AREA,
        difficulty: DifficultyLevel.EASY,
        availableModes: GAME_MODES,
        userId: null,

        // Actions (implementation from gameStore.ts)
        startGame: (region = CaliforniaRegion.BAY_AREA, difficulty = DifficultyLevel.EASY) => {
          // Emit event for other stores to react
          publishGameEvent('GAME_START', { region, difficulty });

          set({
            isGameActive: true,
            isPaused: false,
            selectedRegion: region,
            difficulty: difficulty,
            timeElapsed: 0,
          });
        },

        // ... other actions
      }),
      {
        name: 'california-puzzle-core-game',
        partialize: (state) => ({
          currentMode: state.currentMode,
          selectedRegion: state.selectedRegion,
          difficulty: state.difficulty,
          availableModes: state.availableModes,
          userId: state.userId,
        }),
      }
    ),
    { name: 'CoreGameStore' }
  )
);
```

---

### 2.2 County Placement Store

**Responsibility**: County drag-drop, placement validation, position tracking

**File**: `src/stores/game/countyPlacementStore.ts`

#### Type Definitions

```typescript
import { CountyPiece, Position, PlacementResult } from '@/types';

export interface CountyPlacementState {
  placedCounties: CountyPiece[];
  remainingCounties: CountyPiece[];

  // Placement tracking
  lastPlacement?: PlacementResult;
}

export interface CountyPlacementActions {
  placeCounty: (county: CountyPiece, position: Position) => PlacementResult;
  removeCounty: (countyId: string) => void;
  moveCounty: (countyId: string, position: Position) => void;

  // Utility
  initializeCounties: (counties: CountyPiece[]) => void;
  clearAllCounties: () => void;
  getCountyById: (id: string) => CountyPiece | undefined;
}

export type CountyPlacementStore = CountyPlacementState & CountyPlacementActions;
```

#### Key Logic

```typescript
placeCounty: (county: CountyPiece, position: Position): PlacementResult => {
  // Get current game context from coreGameStore (subscription)
  const { difficulty, currentMode } = useCoreGameStore.getState();

  // Calculate accuracy
  const accuracy = calculatePlacementAccuracy(
    county.targetPosition,
    position,
    currentMode.dropZoneTolerance
  );

  const isCorrect = accuracy > 0.8;

  const result: PlacementResult = {
    county,
    accuracy,
    distance: calculateDistance(county.targetPosition, position),
    isCorrect,
    scoreAwarded: 0, // Calculated by scoringStore
    timeToPlace: useCoreGameStore.getState().timeElapsed,
  };

  // Update placement state
  set((state) => ({
    placedCounties: [
      ...state.placedCounties,
      { ...county, isPlaced: true, currentPosition: position },
    ],
    remainingCounties: state.remainingCounties.filter(c => c.id !== county.id),
    lastPlacement: result,
  }));

  // Emit event for other stores (scoring, achievements, hints)
  publishGameEvent('COUNTY_PLACED', result);

  return result;
}
```

---

### 2.3 Scoring Store

**Responsibility**: Score calculation, streak tracking, multipliers

**File**: `src/stores/game/scoringStore.ts`

#### Type Definitions

```typescript
import { ScoreMultiplier, PlacementResult } from '@/types';

export interface ScoringState {
  score: number;
  streak: number;
  mistakes: number;

  // Multiplier tracking
  currentMultipliers?: ScoreMultiplier;
}

export interface ScoringActions {
  calculateScore: (placement: PlacementResult) => number;
  updateScore: (points: number) => void;
  updateStreak: (isCorrect: boolean) => void;
  applyScorePenalty: (penalty: number) => void;

  // Utility
  resetScore: () => void;
  getScoreMultipliers: () => ScoreMultiplier;
}

export type ScoringStore = ScoringState & ScoringActions;
```

#### Event Subscription Pattern

```typescript
// Subscribe to county placement events
subscribeToGameEvent('COUNTY_PLACED', (result: PlacementResult) => {
  const store = useScoringStore.getState();

  // Calculate score
  const points = store.calculateScore(result);

  // Update score and streak
  store.updateScore(points);
  store.updateStreak(result.isCorrect);
});

// Subscribe to hint usage events
subscribeToGameEvent('HINT_USED', (data: { cost: number }) => {
  useScoringStore.getState().applyScorePenalty(data.cost);
});
```

---

### 2.4 Achievement Store

**Responsibility**: Achievement unlocking, progress tracking, conditions

**File**: `src/stores/game/achievementStore.ts`

#### Type Definitions

```typescript
import { Achievement, AchievementCategory, PlacementResult } from '@/types';

export interface AchievementState {
  achievements: Achievement[];
  recentlyUnlocked: Achievement[];
}

export interface AchievementActions {
  checkAchievements: (placement?: PlacementResult) => Achievement[];
  unlockAchievement: (achievementId: string) => void;

  // Query
  getAchievementsByCategory: (category: AchievementCategory) => Achievement[];
  getAchievementProgress: (achievementId: string) => number;

  // Utility
  resetAchievements: () => void;
  clearRecentlyUnlocked: () => void;
}

export type AchievementStore = AchievementState & AchievementActions;
```

#### Achievement Checking Logic

```typescript
checkAchievements: (placement?: PlacementResult): Achievement[] => {
  const newlyUnlocked: Achievement[] = [];

  // Get context from other stores (non-circular)
  const { streak } = useScoringStore.getState();
  const { difficulty, selectedRegion } = useCoreGameStore.getState();
  const { remainingCounties } = useCountyPlacementStore.getState();

  set((state) => ({
    achievements: state.achievements.map((achievement) => {
      if (achievement.isUnlocked) return achievement;

      const shouldUnlock = evaluateAchievementCondition(achievement, {
        placement,
        streak,
        difficulty,
        selectedRegion,
        remainingCounties,
      });

      if (shouldUnlock) {
        newlyUnlocked.push({ ...achievement, isUnlocked: true });
        playSound(SoundType.ACHIEVEMENT);
      }

      return shouldUnlock
        ? { ...achievement, isUnlocked: true, unlockedAt: new Date() }
        : achievement;
    }),
    recentlyUnlocked: newlyUnlocked,
  }));

  return newlyUnlocked;
}
```

---

### 2.5 Hint Store

**Responsibility**: Hint system, struggle analysis, auto-suggestions

**File**: `src/stores/game/hintStore.ts`

#### Type Definitions

```typescript
import { HintSystemState, HintType, County, StruggleData, Position } from '@/types';

export interface HintStoreState {
  hintSystem: HintSystemState;
  currentHint?: County;
}

export interface HintStoreActions {
  getHint: () => County | null;
  useHint: (type: HintType, countyId: string, isAutoSuggested?: boolean) => void;
  updateHintSystem: (updates: Partial<HintSystemState>) => void;
  analyzePlayerStruggle: (countyId: string, position: Position, isCorrect: boolean) => void;
  resetHintSystem: () => void;

  // Query
  getStrugglingCounties: () => StruggleData[];
  canUseHint: () => boolean;
}

export type HintStore = HintStoreState & HintStoreActions;
```

#### Struggle Analysis Pattern

```typescript
analyzePlayerStruggle: (countyId: string, position: Position, isCorrect: boolean) => {
  if (isCorrect) {
    // Remove from struggling list
    set((state) => ({
      hintSystem: {
        ...state.hintSystem,
        strugglingCounties: state.hintSystem.strugglingCounties.filter(
          s => s.countyId !== countyId
        ),
      },
    }));
    return;
  }

  // Track struggle
  set((state) => {
    const existing = state.hintSystem.strugglingCounties.find(
      s => s.countyId === countyId
    );

    const updated: StruggleData = existing
      ? {
          ...existing,
          attempts: existing.attempts + 1,
          wrongPlacements: [...existing.wrongPlacements, position],
        }
      : {
          countyId,
          attempts: 1,
          lastAttemptAt: Date.now(),
          totalTimeSpent: 0,
          wrongPlacements: [position],
          suggestedHints: [],
        };

    // Auto-suggest hint after threshold
    if (updated.attempts >= state.hintSystem.autoSuggestThreshold) {
      publishGameEvent('HINT_SUGGESTED', { countyId });
    }

    return {
      hintSystem: {
        ...state.hintSystem,
        strugglingCounties: existing
          ? state.hintSystem.strugglingCounties.map(s =>
              s.countyId === countyId ? updated : s
            )
          : [...state.hintSystem.strugglingCounties, updated],
      },
    };
  });
}
```

---

### 2.6 Statistics Store

**Responsibility**: Game stats, personal bests, play time tracking

**File**: `src/stores/game/statisticsStore.ts`

#### Type Definitions

```typescript
import { GameStats, PlacementResult, CaliforniaRegion, DifficultyLevel } from '@/types';

export interface StatisticsState {
  stats: GameStats;
}

export interface StatisticsActions {
  updateStats: (placement: PlacementResult) => void;
  getPersonalBest: (region: CaliforniaRegion, difficulty: DifficultyLevel) => number;

  // Aggregate queries
  getTotalPlayTime: () => number;
  getAverageAccuracy: () => number;
  getCountiesLearned: () => Set<string>;

  // Utility
  resetStats: () => void;
  exportStats: () => string;
  importStats: (data: string) => void;
}

export type StatisticsStore = StatisticsState & StatisticsActions;
```

#### Stats Update Pattern

```typescript
// Subscribe to game end events
subscribeToGameEvent('GAME_END', () => {
  const { score, timeElapsed } = useCoreGameStore.getState();
  const { streak } = useScoringStore.getState();

  useStatisticsStore.setState((state) => ({
    stats: {
      ...state.stats,
      totalGamesPlayed: state.stats.totalGamesPlayed + 1,
      bestScore: Math.max(state.stats.bestScore, score),
      totalScore: state.stats.totalScore + score,
      totalPlayTime: state.stats.totalPlayTime + timeElapsed,
      longestStreak: Math.max(state.stats.longestStreak, streak),
    },
  }));
});
```

---

### 2.7 Game Settings Store

**Responsibility**: Settings, sound, gesture state

**File**: `src/stores/game/gameSettingsStore.ts`

#### Type Definitions

```typescript
import { GameSettings, SoundSettings, GestureState } from '@/types';

export interface GameSettingsState {
  settings: GameSettings;
  gestureState: GestureState;
}

export interface GameSettingsActions {
  // Settings
  updateSettings: (newSettings: Partial<GameSettings>) => void;

  // Sound
  updateSoundSettings: (newSettings: Partial<SoundSettings>) => void;
  toggleMute: () => void;
  startBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;

  // Gesture
  updateGestureState: (updates: Partial<GestureState>) => void;
  resetGestureState: () => void;
  setMapRotation: (rotation: number) => void;
  setMapZoom: (zoom: number) => void;
  setMapPan: (pan: { x: number; y: number }) => void;
}

export type GameSettingsStore = GameSettingsState & GameSettingsActions;
```

---

## 3. Inter-Store Communication

### 3.1 Event Bus Pattern

**File**: `src/stores/game/gameEventBus.ts`

```typescript
import { GameEvent, GameEventType } from '@/types';

type EventCallback = (data: any) => void;

class GameEventBus {
  private subscribers: Map<GameEventType, Set<EventCallback>> = new Map();

  subscribe(event: GameEventType, callback: EventCallback): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }

    this.subscribers.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(event)?.delete(callback);
    };
  }

  publish(event: GameEventType, data: any): void {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  clear(): void {
    this.subscribers.clear();
  }
}

export const gameEventBus = new GameEventBus();

// Helper functions
export function subscribeToGameEvent(
  event: GameEventType,
  callback: EventCallback
): () => void {
  return gameEventBus.subscribe(event, callback);
}

export function publishGameEvent(event: GameEventType, data: any): void {
  gameEventBus.publish(event, data);
}
```

### 3.2 Store Dependency Graph

```
┌─────────────────────┐
│  coreGameStore      │ (No dependencies)
│  - Game lifecycle   │
│  - Mode management  │
└──────────┬──────────┘
           │
           ├────────────────────────────┐
           ↓                            ↓
┌──────────────────────┐    ┌──────────────────────┐
│ countyPlacementStore │    │  gameSettingsStore   │
│  - Reads: difficulty │    │  (No dependencies)   │
│  - Reads: mode       │    └──────────────────────┘
└──────────┬───────────┘
           │
           ↓ (COUNTY_PLACED event)
           │
    ┌──────┴───────┬─────────────┬──────────────┐
    ↓              ↓             ↓              ↓
┌─────────┐  ┌──────────────┐ ┌──────────┐  ┌──────────────┐
│ scoring │  │ achievements │ │ hintStore│  │ statistics   │
│ Store   │  │ Store        │ │          │  │ Store        │
└─────────┘  └──────────────┘ └──────────┘  └──────────────┘
```

### 3.3 Shared State Access Pattern

```typescript
// BAD: Direct store imports create circular dependencies
import { useScoringStore } from './scoringStore';

// GOOD: Access via event data or getState()
export function checkAchievements() {
  // Get state without creating dependency
  const { streak } = useScoringStore.getState();

  // ... achievement logic
}

// BEST: Subscribe to events
subscribeToGameEvent('COUNTY_PLACED', (result: PlacementResult) => {
  // React to event without direct coupling
  checkAchievements(result);
});
```

---

## 4. Migration Strategy

### 4.1 Phase 1: Create New Stores (Week 1)

1. **Setup Infrastructure**
   - Create `src/stores/game/` directory
   - Create `gameEventBus.ts`
   - Create `types.ts` for shared types
   - Create `constants.ts` for defaults

2. **Create Stores (Parallel)**
   - `coreGameStore.ts`
   - `countyPlacementStore.ts`
   - `scoringStore.ts`
   - `achievementStore.ts`
   - `hintStore.ts`
   - `statisticsStore.ts`
   - `gameSettingsStore.ts`

3. **Test in Isolation**
   - Unit tests for each store
   - Event bus tests
   - Integration tests between stores

### 4.2 Phase 2: Compatibility Layer (Week 2)

**File**: `src/stores/game/index.ts`

```typescript
/**
 * Backward compatibility layer
 * Maintains old API while using new stores
 */
import { useCoreGameStore } from './coreGameStore';
import { useCountyPlacementStore } from './countyPlacementStore';
import { useScoringStore } from './scoringStore';
import { useAchievementStore } from './achievementStore';
import { useHintStore } from './hintStore';
import { useStatisticsStore } from './statisticsStore';
import { useGameSettingsStore } from './gameSettingsStore';
import type { GameStore } from '../gameStore';

/**
 * Composite hook that combines all stores
 * Maintains backward compatibility with gameStore API
 */
export function useGameStore(): GameStore {
  const core = useCoreGameStore();
  const placement = useCountyPlacementStore();
  const scoring = useScoringStore();
  const achievements = useAchievementStore();
  const hints = useHintStore();
  const stats = useStatisticsStore();
  const settings = useGameSettingsStore();

  return {
    // Core game state
    ...core,

    // County placement
    ...placement,

    // Scoring
    ...scoring,

    // Achievements
    ...achievements,

    // Hints
    ...hints,

    // Statistics
    ...stats,

    // Settings
    ...settings,
  };
}

// Export individual stores for new code
export {
  useCoreGameStore,
  useCountyPlacementStore,
  useScoringStore,
  useAchievementStore,
  useHintStore,
  useStatisticsStore,
  useGameSettingsStore,
};
```

### 4.3 Phase 3: Component Migration (Week 3)

1. **Identify Components**
   ```bash
   # Find all gameStore usage
   grep -r "useGameStore" src/components
   ```

2. **Migrate Gradually**
   ```typescript
   // Before:
   const { score, updateScore } = useGameStore();

   // After:
   const { score, updateScore } = useScoringStore();
   ```

3. **Update Tests**
   - Test individual stores
   - Test composite hook
   - Integration tests

### 4.4 Phase 4: Deprecation (Week 4)

1. Add deprecation warnings to old API
2. Update documentation
3. Remove old `gameStore.ts` after verification

---

## 5. File Structure

```
src/stores/
├── game/
│   ├── index.ts                    # Compatibility layer + exports
│   ├── types.ts                    # Shared types for game stores
│   ├── constants.ts                # Default values
│   ├── gameEventBus.ts             # Event communication
│   │
│   ├── coreGameStore.ts            # Game lifecycle
│   ├── countyPlacementStore.ts     # County placement
│   ├── scoringStore.ts             # Score calculation
│   ├── achievementStore.ts         # Achievements
│   ├── hintStore.ts                # Hint system
│   ├── statisticsStore.ts          # Statistics
│   └── gameSettingsStore.ts        # Settings & gestures
│
├── gameStore.ts                    # [DEPRECATED] Old monolithic store
├── studyStore.ts                   # Study mode (unchanged)
├── themeStore.ts                   # Theme (unchanged)
├── authStore.ts                    # Auth (unchanged)
└── toastStore.ts                   # Toasts (unchanged)
```

---

## 6. Testing Strategy

### 6.1 Unit Tests

**File**: `tests/stores/game/coreGameStore.test.ts`

```typescript
describe('coreGameStore', () => {
  beforeEach(() => {
    useCoreGameStore.setState({
      isGameActive: false,
      isPaused: false,
    });
  });

  it('should start game', () => {
    const { startGame, isGameActive } = useCoreGameStore.getState();

    startGame(CaliforniaRegion.BAY_AREA, DifficultyLevel.EASY);

    expect(useCoreGameStore.getState().isGameActive).toBe(true);
  });

  // ... more tests
});
```

### 6.2 Integration Tests

**File**: `tests/stores/game/integration.test.ts`

```typescript
describe('Game Store Integration', () => {
  it('should update score when county is placed', () => {
    // Setup
    const { startGame } = useCoreGameStore.getState();
    const { placeCounty } = useCountyPlacementStore.getState();
    const { score } = useScoringStore.getState();

    startGame();

    // Place county
    const result = placeCounty(mockCounty, mockPosition);

    // Verify score updated
    expect(useScoringStore.getState().score).toBeGreaterThan(0);
  });
});
```

---

## 7. Performance Considerations

### 7.1 Subscription Optimization

```typescript
// BAD: Re-renders on every state change
const gameState = useGameStore();

// GOOD: Only re-renders when score changes
const score = useGameStore(state => state.score);

// BETTER: Use individual stores
const score = useScoringStore(state => state.score);
```

### 7.2 Event Bus Performance

- Event callbacks should be lightweight
- Debounce high-frequency events (timer updates)
- Unsubscribe on component unmount

---

## 8. TypeScript Configuration

**File**: `tsconfig.json` (updates)

```json
{
  "compilerOptions": {
    "paths": {
      "@/stores/game": ["./src/stores/game"],
      "@/stores/game/*": ["./src/stores/game/*"]
    }
  }
}
```

---

## 9. Documentation Requirements

1. **API Documentation**: JSDoc for all public methods
2. **Migration Guide**: Step-by-step for component authors
3. **Architecture Decision Records**: Why we chose this approach
4. **Examples**: Common usage patterns

---

## 10. Success Metrics

- ✅ Each store < 200 lines
- ✅ No circular dependencies
- ✅ 100% type coverage
- ✅ All existing tests pass
- ✅ Zero runtime regressions
- ✅ Improved developer experience (IDE autocomplete)

---

## 11. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes | High | Compatibility layer + gradual migration |
| Event bus overhead | Medium | Performance profiling + debouncing |
| Circular dependencies | High | Clear dependency graph + linting |
| Complex state sync | Medium | Event-driven architecture + integration tests |

---

## 12. Next Steps

1. Review architecture with team
2. Create implementation tasks
3. Setup development branch
4. Begin Phase 1: Create new stores
5. Continuous testing and validation

---

## Appendix A: Type Definitions Summary

```typescript
// Core Types
export type CoreGameStore = CoreGameState & CoreGameActions;
export type CountyPlacementStore = CountyPlacementState & CountyPlacementActions;
export type ScoringStore = ScoringState & ScoringActions;
export type AchievementStore = AchievementState & AchievementActions;
export type HintStore = HintStoreState & HintStoreActions;
export type StatisticsStore = StatisticsState & StatisticsActions;
export type GameSettingsStore = GameSettingsState & GameSettingsActions;

// Composite Type (backward compatibility)
export type GameStore =
  CoreGameStore &
  CountyPlacementStore &
  ScoringStore &
  AchievementStore &
  HintStore &
  StatisticsStore &
  GameSettingsStore;
```

---

## Appendix B: Constants and Defaults

**File**: `src/stores/game/constants.ts`

```typescript
import { DifficultyLevel, CaliforniaRegion, GameStats } from '@/types';

export const DEFAULT_DIFFICULTY = DifficultyLevel.EASY;
export const DEFAULT_REGION = CaliforniaRegion.BAY_AREA;

export const DEFAULT_STATS: GameStats = {
  totalGamesPlayed: 0,
  totalScore: 0,
  bestScore: 0,
  averageAccuracy: 0,
  totalPlayTime: 0,
  favoriteDifficulty: DEFAULT_DIFFICULTY,
  favoriteRegion: DEFAULT_REGION,
  countiesLearned: new Set(),
  perfectPlacements: 0,
  longestStreak: 0,
};

export const ACCURACY_THRESHOLD = 0.8;
export const SCORE_BASE = 100;

// ... more constants
```

---

**Document Version**: 1.0
**Last Updated**: December 2, 2025
**Status**: Ready for Review
