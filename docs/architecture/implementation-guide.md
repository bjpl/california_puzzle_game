# Game Store Refactoring Implementation Guide

**Project:** California Puzzle Game
**Date:** December 2, 2025
**Phase:** Implementation Templates

This guide provides step-by-step instructions and code templates for implementing the game store refactoring.

---

## Table of Contents

1. [Setup Infrastructure](#1-setup-infrastructure)
2. [Event Bus Implementation](#2-event-bus-implementation)
3. [Store Templates](#3-store-templates)
4. [Testing Templates](#4-testing-templates)
5. [Migration Checklist](#5-migration-checklist)

---

## 1. Setup Infrastructure

### Step 1.1: Create Directory Structure

```bash
# Create directory structure
mkdir -p src/stores/game
mkdir -p tests/stores/game
mkdir -p docs/architecture
```

### Step 1.2: Create Shared Types File

**File:** `src/stores/game/types.ts`

```typescript
/**
 * Shared types for game stores
 * Re-exports from main types with store-specific additions
 */

// Re-export core types
export type {
  County,
  CountyPiece,
  Position,
  PlacementResult,
  GameState,
  GameSettings,
  SoundSettings,
  GestureState,
  Achievement,
  GameStats,
  ScoreMultiplier,
  HintSystemState,
  HintType,
  StruggleData,
  GameModeConfiguration,
  DifficultyLevel,
  CaliforniaRegion,
  AchievementCategory,
  GameEventType,
  GameEvent,
} from '@/types';

/**
 * Store initialization options
 */
export interface StoreInitOptions {
  userId?: string | null;
  persistKey: string;
  devtoolsName: string;
}

/**
 * Event callback type
 */
export type EventCallback<T = any> = (data: T) => void;

/**
 * Unsubscribe function
 */
export type UnsubscribeFn = () => void;
```

### Step 1.3: Create Constants File

**File:** `src/stores/game/constants.ts`

```typescript
/**
 * Shared constants and defaults for game stores
 */

import {
  DifficultyLevel,
  CaliforniaRegion,
  GameStats,
  GameSettings,
  SoundSettings,
  GestureState,
  AchievementCategory,
} from '@/types';
import { GAME_MODES } from '@/config/gameModes';

/**
 * Default game settings
 */
export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  masterVolume: 0.7,
  effectsVolume: 0.8,
  musicVolume: 0.5,
  muted: false,
  enableBackgroundMusic: true,
  enableClickSounds: true,
  enableGameSounds: true,
  enableAchievementSounds: true,
};

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  difficulty: DifficultyLevel.EASY,
  region: CaliforniaRegion.BAY_AREA,
  showHints: true,
  enableTimer: true,
  soundEnabled: true,
  animationsEnabled: true,
  autoAdvance: false,
  soundSettings: DEFAULT_SOUND_SETTINGS,
  hintSettings: {
    maxHintsPerLevel: 3,
    hintCooldownMs: 30000,
    scorePenaltyPerHint: 50,
    freeHintsAllowed: 1,
    autoSuggestThreshold: 3,
    enableVisualIndicators: true,
    enableEducationalHints: true,
  },
};

export const DEFAULT_STATS: GameStats = {
  totalGamesPlayed: 0,
  totalScore: 0,
  bestScore: 0,
  averageAccuracy: 0,
  totalPlayTime: 0,
  favoriteDifficulty: DifficultyLevel.EASY,
  favoriteRegion: CaliforniaRegion.BAY_AREA,
  countiesLearned: new Set(),
  perfectPlacements: 0,
  longestStreak: 0,
};

export const DEFAULT_GESTURE_STATE: GestureState = {
  rotation: 0,
  zoom: 1,
  pan: { x: 0, y: 0 },
  gestureEnabled: true,
};

/**
 * Game constants
 */
export const ACCURACY_THRESHOLD = 0.8;
export const SCORE_BASE = 100;
export const DEFAULT_DROP_ZONE_TOLERANCE = 50;

/**
 * Achievement definitions
 */
export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_county',
    name: 'First Steps',
    description: 'Place your first county correctly',
    icon: '🎯',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.COMPLETION,
  },
  {
    id: 'perfect_placement',
    name: 'Bullseye',
    description: 'Place a county with 100% accuracy',
    icon: '🎯',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.ACCURACY,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Place a county in under 3 seconds',
    icon: '⚡',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.SPEED,
  },
  {
    id: 'streak_10',
    name: 'On Fire',
    description: 'Get a 10-county streak',
    icon: '🔥',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.STREAK,
  },
  {
    id: 'bay_area_master',
    name: 'Bay Area Master',
    description: 'Complete Bay Area on Expert difficulty',
    icon: '🌉',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.COMPLETION,
  },
  {
    id: 'california_expert',
    name: 'California Expert',
    description: 'Complete all regions on Expert difficulty',
    icon: '🏆',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.COMPLETION,
  },
] as const;

/**
 * Default mode
 */
export const DEFAULT_MODE = GAME_MODES[0];
```

---

## 2. Event Bus Implementation

### Step 2.1: Create Event Bus

**File:** `src/stores/game/gameEventBus.ts`

```typescript
/**
 * Game Event Bus
 *
 * Provides decoupled communication between game stores
 * using the pub/sub pattern.
 *
 * Usage:
 *   // Publish
 *   publishGameEvent('COUNTY_PLACED', placementResult);
 *
 *   // Subscribe
 *   const unsubscribe = subscribeToGameEvent('COUNTY_PLACED', (result) => {
 *     console.log('County placed:', result);
 *   });
 *
 *   // Cleanup
 *   unsubscribe();
 */

import { GameEventType, GameEvent } from '@/types';
import { logger } from '@/utils/logger';

type EventCallback<T = any> = (data: T) => void;

class GameEventBus {
  private subscribers: Map<GameEventType, Set<EventCallback>> = new Map();
  private eventHistory: GameEvent[] = [];
  private maxHistorySize = 100;

  /**
   * Subscribe to game events
   *
   * @param event - Event type to listen for
   * @param callback - Function to call when event fires
   * @returns Unsubscribe function
   */
  subscribe<T = any>(event: GameEventType, callback: EventCallback<T>): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }

    this.subscribers.get(event)!.add(callback as EventCallback);

    logger.debug(`[EventBus] Subscribed to ${event}`);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(event);
      if (callbacks) {
        callbacks.delete(callback as EventCallback);
        logger.debug(`[EventBus] Unsubscribed from ${event}`);
      }
    };
  }

  /**
   * Publish game event to all subscribers
   *
   * @param event - Event type
   * @param data - Event data
   */
  publish<T = any>(event: GameEventType, data: T): void {
    const gameEvent: GameEvent = {
      type: event,
      timestamp: Date.now(),
      data: data as Record<string, unknown>,
    };

    // Add to history
    this.eventHistory.push(gameEvent);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify subscribers
    const callbacks = this.subscribers.get(event);
    if (callbacks && callbacks.size > 0) {
      logger.debug(`[EventBus] Publishing ${event} to ${callbacks.size} subscribers`, data);

      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error(`[EventBus] Error in ${event} callback:`, error);
        }
      });
    } else {
      logger.debug(`[EventBus] No subscribers for ${event}`);
    }
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.subscribers.clear();
    logger.debug('[EventBus] Cleared all subscriptions');
  }

  /**
   * Get event history (for debugging)
   */
  getHistory(): GameEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Get subscriber count for an event
   */
  getSubscriberCount(event: GameEventType): number {
    return this.subscribers.get(event)?.size || 0;
  }
}

/**
 * Singleton event bus instance
 */
export const gameEventBus = new GameEventBus();

/**
 * Helper: Subscribe to game event
 */
export function subscribeToGameEvent<T = any>(
  event: GameEventType,
  callback: EventCallback<T>
): () => void {
  return gameEventBus.subscribe(event, callback);
}

/**
 * Helper: Publish game event
 */
export function publishGameEvent<T = any>(event: GameEventType, data: T): void {
  gameEventBus.publish(event, data);
}

/**
 * Helper: Clear all event subscriptions
 */
export function clearAllEventSubscriptions(): void {
  gameEventBus.clear();
}

/**
 * Helper: Get event history (debugging)
 */
export function getEventHistory(): GameEvent[] {
  return gameEventBus.getHistory();
}
```

### Step 2.2: Create Event Bus Tests

**File:** `tests/stores/game/gameEventBus.test.ts`

```typescript
import {
  gameEventBus,
  subscribeToGameEvent,
  publishGameEvent,
  clearAllEventSubscriptions,
} from '@/stores/game/gameEventBus';
import { GameEventType } from '@/types';

describe('GameEventBus', () => {
  beforeEach(() => {
    clearAllEventSubscriptions();
  });

  afterEach(() => {
    clearAllEventSubscriptions();
  });

  it('should subscribe and receive events', () => {
    const callback = vi.fn();

    subscribeToGameEvent(GameEventType.COUNTY_PLACED, callback);
    publishGameEvent(GameEventType.COUNTY_PLACED, { countyId: 'test' });

    expect(callback).toHaveBeenCalledWith({ countyId: 'test' });
  });

  it('should unsubscribe correctly', () => {
    const callback = vi.fn();

    const unsubscribe = subscribeToGameEvent(GameEventType.COUNTY_PLACED, callback);
    unsubscribe();

    publishGameEvent(GameEventType.COUNTY_PLACED, { countyId: 'test' });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle multiple subscribers', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    subscribeToGameEvent(GameEventType.COUNTY_PLACED, callback1);
    subscribeToGameEvent(GameEventType.COUNTY_PLACED, callback2);

    publishGameEvent(GameEventType.COUNTY_PLACED, { countyId: 'test' });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should maintain event history', () => {
    publishGameEvent(GameEventType.GAME_START, { difficulty: 'easy' });
    publishGameEvent(GameEventType.COUNTY_PLACED, { countyId: 'test' });

    const history = gameEventBus.getHistory();

    expect(history).toHaveLength(2);
    expect(history[0].type).toBe(GameEventType.GAME_START);
    expect(history[1].type).toBe(GameEventType.COUNTY_PLACED);
  });

  it('should handle errors in callbacks gracefully', () => {
    const errorCallback = vi.fn(() => {
      throw new Error('Test error');
    });
    const successCallback = vi.fn();

    subscribeToGameEvent(GameEventType.COUNTY_PLACED, errorCallback);
    subscribeToGameEvent(GameEventType.COUNTY_PLACED, successCallback);

    expect(() => {
      publishGameEvent(GameEventType.COUNTY_PLACED, { countyId: 'test' });
    }).not.toThrow();

    expect(errorCallback).toHaveBeenCalled();
    expect(successCallback).toHaveBeenCalled();
  });
});
```

---

## 3. Store Templates

### Step 3.1: Core Game Store Template

**File:** `src/stores/game/coreGameStore.ts`

```typescript
/**
 * Core Game Store
 *
 * Manages game lifecycle, mode selection, and timer.
 * This is the foundation store that other stores depend on.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GameModeConfiguration, DifficultyLevel, CaliforniaRegion } from './types';
import { DEFAULT_MODE } from './constants';
import { publishGameEvent } from './gameEventBus';
import { GAME_MODES, getDifficultySettings } from '@/config/gameModes';
import { GameEventType } from '@/types';

/**
 * Core game state
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

  // User context
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

/**
 * Initial state
 */
const initialState: CoreGameState = {
  currentLevel: 1,
  isGameActive: false,
  isPaused: false,
  timeElapsed: 0,
  currentMode: DEFAULT_MODE,
  selectedRegion: CaliforniaRegion.BAY_AREA,
  difficulty: DifficultyLevel.EASY,
  availableModes: GAME_MODES,
  userId: null,
};

/**
 * Core Game Store
 */
export const useCoreGameStore = create<CoreGameStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        startGame: (region = CaliforniaRegion.BAY_AREA, difficulty = DifficultyLevel.EASY) => {
          set({
            isGameActive: true,
            isPaused: false,
            selectedRegion: region,
            difficulty: difficulty,
            timeElapsed: 0,
            currentLevel: 1,
          });

          // Publish event for other stores
          publishGameEvent(GameEventType.GAME_START, { region, difficulty });
        },

        startGameWithMode: (mode: GameModeConfiguration) => {
          const difficultySettings = getDifficultySettings(mode.difficulty);

          set({
            isGameActive: true,
            isPaused: false,
            currentMode: mode,
            selectedRegion: CaliforniaRegion.ALL,
            difficulty: mode.difficulty,
            timeElapsed: 0,
            currentLevel: 1,
          });

          publishGameEvent(GameEventType.GAME_START, {
            mode: mode.id,
            difficulty: mode.difficulty,
          });
        },

        pauseGame: () => {
          set({ isPaused: true });
          publishGameEvent(GameEventType.GAME_PAUSE, {});
        },

        resumeGame: () => {
          set({ isPaused: false });
          publishGameEvent(GameEventType.GAME_RESUME, {});
        },

        endGame: () => {
          set({ isGameActive: false, isPaused: false });
          publishGameEvent(GameEventType.GAME_END, {
            finalTime: get().timeElapsed,
          });
        },

        resetGame: () => {
          set({
            currentLevel: 1,
            timeElapsed: 0,
            isGameActive: false,
            isPaused: false,
          });
        },

        updateTimer: (deltaTime: number) => {
          set((state) => ({
            timeElapsed: state.timeElapsed + deltaTime,
          }));
        },

        setCurrentMode: (mode: GameModeConfiguration) => {
          set({ currentMode: mode });
        },

        updateModeProgress: (modeId, stars, score, completionTime) => {
          set((state) => ({
            availableModes: state.availableModes.map((mode) =>
              mode.id === modeId
                ? {
                    ...mode,
                    stars: Math.max(mode.stars, stars),
                    bestScore: Math.max(mode.bestScore || 0, score),
                    completionTime:
                      completionTime &&
                      (!mode.completionTime || completionTime < mode.completionTime)
                        ? completionTime
                        : mode.completionTime,
                    isCompleted: true,
                  }
                : mode
            ),
          }));
        },

        unlockMode: (modeId: string) => {
          set((state) => ({
            availableModes: state.availableModes.map((mode) =>
              mode.id === modeId ? { ...mode, isLocked: false } : mode
            ),
          }));
        },

        setUserId: (userId: string | null) => {
          set({ userId });
        },
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

## 4. Testing Templates

### Step 4.1: Store Unit Test Template

**File:** `tests/stores/game/coreGameStore.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCoreGameStore } from '@/stores/game/coreGameStore';
import { CaliforniaRegion, DifficultyLevel, GameEventType } from '@/types';
import * as eventBus from '@/stores/game/gameEventBus';

// Mock event bus
vi.mock('@/stores/game/gameEventBus', () => ({
  publishGameEvent: vi.fn(),
  subscribeToGameEvent: vi.fn(),
}));

describe('coreGameStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useCoreGameStore.setState({
      isGameActive: false,
      isPaused: false,
      timeElapsed: 0,
      currentLevel: 1,
    });

    vi.clearAllMocks();
  });

  describe('startGame', () => {
    it('should start game with default region and difficulty', () => {
      const { startGame } = useCoreGameStore.getState();

      startGame();

      const state = useCoreGameStore.getState();
      expect(state.isGameActive).toBe(true);
      expect(state.isPaused).toBe(false);
      expect(state.timeElapsed).toBe(0);
    });

    it('should publish GAME_START event', () => {
      const { startGame } = useCoreGameStore.getState();

      startGame(CaliforniaRegion.BAY_AREA, DifficultyLevel.EASY);

      expect(eventBus.publishGameEvent).toHaveBeenCalledWith(
        GameEventType.GAME_START,
        {
          region: CaliforniaRegion.BAY_AREA,
          difficulty: DifficultyLevel.EASY,
        }
      );
    });
  });

  describe('pauseGame', () => {
    it('should pause active game', () => {
      const { startGame, pauseGame } = useCoreGameStore.getState();

      startGame();
      pauseGame();

      expect(useCoreGameStore.getState().isPaused).toBe(true);
    });
  });

  describe('updateTimer', () => {
    it('should increment timeElapsed', () => {
      const { updateTimer } = useCoreGameStore.getState();

      updateTimer(1000);
      expect(useCoreGameStore.getState().timeElapsed).toBe(1000);

      updateTimer(500);
      expect(useCoreGameStore.getState().timeElapsed).toBe(1500);
    });
  });
});
```

---

## 5. Migration Checklist

### Phase 1: Infrastructure (Week 1)

- [ ] Create `src/stores/game/` directory
- [ ] Implement `types.ts` with shared types
- [ ] Implement `constants.ts` with defaults
- [ ] Implement `gameEventBus.ts` with pub/sub
- [ ] Write event bus tests
- [ ] Setup ESLint rules for circular dependencies

### Phase 2: Core Stores (Week 1-2)

- [ ] Implement `coreGameStore.ts`
  - [ ] Unit tests
  - [ ] Event publishing verification
- [ ] Implement `gameSettingsStore.ts`
  - [ ] Unit tests
  - [ ] Sound integration tests
- [ ] Implement `countyPlacementStore.ts`
  - [ ] Unit tests
  - [ ] Accuracy calculation tests

### Phase 3: Dependent Stores (Week 2)

- [ ] Implement `scoringStore.ts`
  - [ ] Subscribe to COUNTY_PLACED
  - [ ] Unit tests
- [ ] Implement `achievementStore.ts`
  - [ ] Subscribe to multiple events
  - [ ] Achievement condition tests
- [ ] Implement `hintStore.ts`
  - [ ] Struggle analysis tests
- [ ] Implement `statisticsStore.ts`
  - [ ] Aggregate calculation tests

### Phase 4: Integration (Week 3)

- [ ] Create compatibility layer in `src/stores/game/index.ts`
- [ ] Write integration tests
- [ ] Performance profiling
- [ ] Update documentation

### Phase 5: Migration (Week 3-4)

- [ ] Identify all `useGameStore()` usage
- [ ] Migrate components to new stores
- [ ] Update tests
- [ ] Verify no regressions

### Phase 6: Cleanup (Week 4)

- [ ] Add deprecation warnings to old API
- [ ] Remove old `gameStore.ts`
- [ ] Final testing
- [ ] Deploy to production

---

**Next:** Begin implementation of Phase 1 infrastructure.
