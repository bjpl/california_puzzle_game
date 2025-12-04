/**
 * Unit tests for gameLifecycleStore
 * Tests game lifecycle management: start, pause, resume, end, reset
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameLifecycleStore } from '../../../src/stores/gameLifecycleStore';
import { useStatsStore as _useStatsStore } from '../../../src/stores/scoringStore';
import { useHintStore as _useHintStore } from '../../../src/stores/hintSystemStore';
import { DifficultyLevel, CaliforniaRegion } from '../../../src/types/index';
import { GAME_MODES } from '../../../src/config/gameModes';

// Create mock functions that we can track
const mockIncrementGamesPlayed = vi.fn();
const mockFinalizeGame = vi.fn();
const mockResetHintSystem = vi.fn();
const mockInitializeForMode = vi.fn();

// Mock the dependent stores
vi.mock('../../../src/stores/scoringStore', () => ({
  useStatsStore: {
    getState: vi.fn(() => ({
      incrementGamesPlayed: mockIncrementGamesPlayed,
      finalizeGame: mockFinalizeGame,
    })),
  },
}));

vi.mock('../../../src/stores/hintSystemStore', () => ({
  useHintStore: {
    getState: vi.fn(() => ({
      resetHintSystem: mockResetHintSystem,
      initializeForMode: mockInitializeForMode,
    })),
  },
}));

describe('gameLifecycleStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useGameLifecycleStore.getState();
    store.resetGame();

    // Clear all mock calls
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useGameLifecycleStore.getState();

      expect(state.isGameActive).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.currentLevel).toBe(1);
      expect(state.timeElapsed).toBe(0);
      expect(state.difficulty).toBe(DifficultyLevel.EASY);
      expect(state.selectedRegion).toBe(CaliforniaRegion.BAY_AREA);
      expect(state.currentMode).toBeDefined();
      expect(state.currentMode.id).toBe(GAME_MODES[0].id);
      expect(state.availableModes).toHaveLength(GAME_MODES.length);
    });

    it('should have all game modes available', () => {
      const state = useGameLifecycleStore.getState();

      expect(state.availableModes).toEqual(GAME_MODES);
    });
  });

  describe('startGame', () => {
    it('should start game with default parameters', () => {
      const store = useGameLifecycleStore.getState();
      store.startGame();

      const state = useGameLifecycleStore.getState();

      expect(state.isGameActive).toBe(true);
      expect(state.isPaused).toBe(false);
      expect(state.selectedRegion).toBe(CaliforniaRegion.BAY_AREA);
      expect(state.difficulty).toBe(DifficultyLevel.EASY);
      expect(state.timeElapsed).toBe(0);
      expect(state.currentLevel).toBe(1);
    });

    it('should start game with custom region', () => {
      const store = useGameLifecycleStore.getState();
      store.startGame(CaliforniaRegion.SOUTHERN);

      const state = useGameLifecycleStore.getState();

      expect(state.isGameActive).toBe(true);
      expect(state.selectedRegion).toBe(CaliforniaRegion.SOUTHERN);
      expect(state.difficulty).toBe(DifficultyLevel.EASY);
    });

    it('should start game with custom difficulty', () => {
      const store = useGameLifecycleStore.getState();
      store.startGame(CaliforniaRegion.BAY_AREA, DifficultyLevel.HARD);

      const state = useGameLifecycleStore.getState();

      expect(state.isGameActive).toBe(true);
      expect(state.difficulty).toBe(DifficultyLevel.HARD);
    });

    it('should start game with custom region and difficulty', () => {
      const store = useGameLifecycleStore.getState();
      store.startGame(CaliforniaRegion.CENTRAL, DifficultyLevel.MEDIUM);

      const state = useGameLifecycleStore.getState();

      expect(state.isGameActive).toBe(true);
      expect(state.selectedRegion).toBe(CaliforniaRegion.CENTRAL);
      expect(state.difficulty).toBe(DifficultyLevel.MEDIUM);
    });

    it('should reset timeElapsed when starting new game', () => {
      const store = useGameLifecycleStore.getState();

      // Start game and simulate some time passing
      store.startGame();
      store.updateTimer(5000);
      expect(useGameLifecycleStore.getState().timeElapsed).toBe(5000);

      // Start new game
      store.startGame();
      expect(useGameLifecycleStore.getState().timeElapsed).toBe(0);
    });

    it('should reset currentLevel to 1 when starting new game', () => {
      const store = useGameLifecycleStore.getState();

      // Start game
      store.startGame();

      // Verify level is 1
      expect(useGameLifecycleStore.getState().currentLevel).toBe(1);
    });

    it('should call incrementGamesPlayed on stats store', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame();

      expect(mockIncrementGamesPlayed).toHaveBeenCalledTimes(1);
    });

    it('should reset hint system when starting game', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame();

      expect(mockResetHintSystem).toHaveBeenCalledTimes(1);
    });

    it('should unpause game when starting', () => {
      const store = useGameLifecycleStore.getState();

      // Start and pause game
      store.startGame();
      store.pauseGame();
      expect(useGameLifecycleStore.getState().isPaused).toBe(true);

      // Start new game
      store.startGame();
      expect(useGameLifecycleStore.getState().isPaused).toBe(false);
    });
  });

  describe('startGameWithMode', () => {
    it('should start game with specific mode', () => {
      const store = useGameLifecycleStore.getState();
      const testMode = GAME_MODES[1]; // Get second mode

      store.startGameWithMode(testMode);

      const state = useGameLifecycleStore.getState();

      expect(state.isGameActive).toBe(true);
      expect(state.isPaused).toBe(false);
      expect(state.currentMode).toEqual(testMode);
      expect(state.difficulty).toBe(testMode.difficulty);
      expect(state.selectedRegion).toBe(CaliforniaRegion.ALL);
      expect(state.timeElapsed).toBe(0);
      expect(state.currentLevel).toBe(1);
    });

    it('should initialize hint store based on mode settings', () => {
      const store = useGameLifecycleStore.getState();
      const testMode = GAME_MODES[0]; // Mode with hints enabled

      store.startGameWithMode(testMode);

      expect(mockInitializeForMode).toHaveBeenCalledTimes(1);
      expect(mockInitializeForMode).toHaveBeenCalledWith(
        expect.any(Boolean),
        testMode.showHints
      );
    });

    it('should call incrementGamesPlayed when starting with mode', () => {
      const store = useGameLifecycleStore.getState();
      const testMode = GAME_MODES[0];

      store.startGameWithMode(testMode);

      expect(mockIncrementGamesPlayed).toHaveBeenCalledTimes(1);
    });

    it('should handle different difficulty levels in modes', () => {
      const store = useGameLifecycleStore.getState();

      // Test EASY mode
      const easyMode = GAME_MODES.find(m => m.difficulty === DifficultyLevel.EASY)!;
      store.startGameWithMode(easyMode);
      expect(useGameLifecycleStore.getState().difficulty).toBe(DifficultyLevel.EASY);

      // Test HARD mode
      const hardMode = GAME_MODES.find(m => m.difficulty === DifficultyLevel.HARD)!;
      store.startGameWithMode(hardMode);
      expect(useGameLifecycleStore.getState().difficulty).toBe(DifficultyLevel.HARD);
    });
  });

  describe('endGame', () => {
    it('should end active game', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame();
      expect(useGameLifecycleStore.getState().isGameActive).toBe(true);

      store.endGame();

      const state = useGameLifecycleStore.getState();
      expect(state.isGameActive).toBe(false);
      expect(state.isPaused).toBe(false);
    });

    it('should call finalizeGame on stats store with timeElapsed', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame();
      store.updateTimer(3000);
      store.endGame();

      expect(mockFinalizeGame).toHaveBeenCalledTimes(1);
      expect(mockFinalizeGame).toHaveBeenCalledWith(3000);
    });

    it('should unpause when ending game', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame();
      store.pauseGame();
      expect(useGameLifecycleStore.getState().isPaused).toBe(true);

      store.endGame();
      expect(useGameLifecycleStore.getState().isPaused).toBe(false);
    });

    it('should preserve timeElapsed after ending game', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame();
      store.updateTimer(5000);

      const timeBeforeEnd = useGameLifecycleStore.getState().timeElapsed;
      store.endGame();

      expect(useGameLifecycleStore.getState().timeElapsed).toBe(timeBeforeEnd);
    });

    it('should be safe to call when game is not active', () => {
      const store = useGameLifecycleStore.getState();

      expect(useGameLifecycleStore.getState().isGameActive).toBe(false);

      expect(() => store.endGame()).not.toThrow();
      expect(mockFinalizeGame).toHaveBeenCalledTimes(1);
    });
  });

  describe('pauseGame', () => {
    it('should pause active game', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame();
      store.pauseGame();

      const state = useGameLifecycleStore.getState();
      expect(state.isPaused).toBe(true);
      expect(state.isGameActive).toBe(true); // Game should still be active
    });

    it('should be safe to pause already paused game', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame();
      store.pauseGame();
      store.pauseGame();

      expect(useGameLifecycleStore.getState().isPaused).toBe(true);
    });

    it('should pause when game is not active', () => {
      const store = useGameLifecycleStore.getState();

      expect(useGameLifecycleStore.getState().isGameActive).toBe(false);
      store.pauseGame();

      expect(useGameLifecycleStore.getState().isPaused).toBe(true);
    });
  });

  describe('resumeGame', () => {
    it('should resume paused game', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame();
      store.pauseGame();
      expect(useGameLifecycleStore.getState().isPaused).toBe(true);

      store.resumeGame();
      expect(useGameLifecycleStore.getState().isPaused).toBe(false);
    });

    it('should be safe to resume unpaused game', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame();
      expect(useGameLifecycleStore.getState().isPaused).toBe(false);

      store.resumeGame();
      expect(useGameLifecycleStore.getState().isPaused).toBe(false);
    });

    it('should keep game active state when resuming', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame();
      const activeStateBefore = useGameLifecycleStore.getState().isGameActive;

      store.pauseGame();
      store.resumeGame();

      expect(useGameLifecycleStore.getState().isGameActive).toBe(activeStateBefore);
    });
  });

  describe('resetGame', () => {
    it('should reset game to initial state', () => {
      const store = useGameLifecycleStore.getState();

      // Start game and make changes
      store.startGame(CaliforniaRegion.SOUTHERN, DifficultyLevel.HARD);
      store.updateTimer(5000);
      store.pauseGame();

      // Reset
      store.resetGame();

      const state = useGameLifecycleStore.getState();
      expect(state.currentLevel).toBe(1);
      expect(state.timeElapsed).toBe(0);
      expect(state.isGameActive).toBe(false);
      expect(state.isPaused).toBe(false);
    });

    it('should preserve difficulty and region settings', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame(CaliforniaRegion.CENTRAL, DifficultyLevel.MEDIUM);
      const difficultyBefore = useGameLifecycleStore.getState().difficulty;
      const regionBefore = useGameLifecycleStore.getState().selectedRegion;

      store.resetGame();

      const state = useGameLifecycleStore.getState();
      expect(state.difficulty).toBe(difficultyBefore);
      expect(state.selectedRegion).toBe(regionBefore);
    });

    it('should reset timeElapsed to 0', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame();
      store.updateTimer(10000);
      expect(useGameLifecycleStore.getState().timeElapsed).toBe(10000);

      store.resetGame();
      expect(useGameLifecycleStore.getState().timeElapsed).toBe(0);
    });
  });

  describe('setCurrentMode', () => {
    it('should set current mode', () => {
      const store = useGameLifecycleStore.getState();
      const newMode = GAME_MODES[2];

      store.setCurrentMode(newMode);

      expect(useGameLifecycleStore.getState().currentMode).toEqual(newMode);
    });

    it('should update current mode without affecting game state', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame();
      const activeStateBefore = useGameLifecycleStore.getState().isGameActive;
      const timeElapsedBefore = useGameLifecycleStore.getState().timeElapsed;

      store.setCurrentMode(GAME_MODES[1]);

      const state = useGameLifecycleStore.getState();
      expect(state.isGameActive).toBe(activeStateBefore);
      expect(state.timeElapsed).toBe(timeElapsedBefore);
    });
  });

  describe('updateTimer', () => {
    it('should update timeElapsed', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame();
      store.updateTimer(1000);

      expect(useGameLifecycleStore.getState().timeElapsed).toBe(1000);
    });

    it('should accumulate time correctly', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame();
      store.updateTimer(1000);
      store.updateTimer(500);
      store.updateTimer(2500);

      expect(useGameLifecycleStore.getState().timeElapsed).toBe(4000);
    });

    it('should handle fractional deltaTime', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame();
      store.updateTimer(16.67);
      store.updateTimer(16.67);

      expect(useGameLifecycleStore.getState().timeElapsed).toBeCloseTo(33.34, 2);
    });

    it('should update time when game is paused', () => {
      const store = useGameLifecycleStore.getState();

      store.startGame();
      store.pauseGame();
      store.updateTimer(1000);

      // Timer still updates (pause logic should be handled in game loop)
      expect(useGameLifecycleStore.getState().timeElapsed).toBe(1000);
    });
  });

  describe('updateModeProgress', () => {
    it('should update mode progress with higher stars', () => {
      const store = useGameLifecycleStore.getState();
      const modeId = GAME_MODES[0].id;

      store.updateModeProgress(modeId, 3, 5000);

      const state = useGameLifecycleStore.getState();
      const updatedMode = state.availableModes.find(m => m.id === modeId);

      expect(updatedMode?.stars).toBe(3);
      expect(updatedMode?.bestScore).toBe(5000);
      expect(updatedMode?.isCompleted).toBe(true);
    });

    it('should not decrease stars', () => {
      const store = useGameLifecycleStore.getState();
      const modeId = GAME_MODES[0].id;

      store.updateModeProgress(modeId, 3, 5000);
      store.updateModeProgress(modeId, 1, 3000);

      const state = useGameLifecycleStore.getState();
      const updatedMode = state.availableModes.find(m => m.id === modeId);

      expect(updatedMode?.stars).toBe(3); // Should keep higher value
    });

    it('should update best score if higher', () => {
      const store = useGameLifecycleStore.getState();
      const modeId = GAME_MODES[0].id;

      store.updateModeProgress(modeId, 2, 3000);
      store.updateModeProgress(modeId, 2, 5000);

      const state = useGameLifecycleStore.getState();
      const updatedMode = state.availableModes.find(m => m.id === modeId);

      expect(updatedMode?.bestScore).toBe(5000);
    });

    it('should not decrease best score', () => {
      const store = useGameLifecycleStore.getState();
      const modeId = GAME_MODES[0].id;

      store.updateModeProgress(modeId, 2, 5000);
      store.updateModeProgress(modeId, 2, 3000);

      const state = useGameLifecycleStore.getState();
      const updatedMode = state.availableModes.find(m => m.id === modeId);

      expect(updatedMode?.bestScore).toBe(5000);
    });

    it('should update completion time with faster time', () => {
      const store = useGameLifecycleStore.getState();
      const modeId = GAME_MODES[0].id;

      store.updateModeProgress(modeId, 2, 4000, 120000);
      store.updateModeProgress(modeId, 2, 4000, 90000);

      const state = useGameLifecycleStore.getState();
      const updatedMode = state.availableModes.find(m => m.id === modeId);

      expect(updatedMode?.completionTime).toBe(90000);
    });

    it('should not update completion time with slower time', () => {
      const store = useGameLifecycleStore.getState();
      const modeId = GAME_MODES[0].id;

      store.updateModeProgress(modeId, 2, 4000, 90000);
      store.updateModeProgress(modeId, 2, 4000, 120000);

      const state = useGameLifecycleStore.getState();
      const updatedMode = state.availableModes.find(m => m.id === modeId);

      expect(updatedMode?.completionTime).toBe(90000);
    });

    it('should mark mode as completed', () => {
      const store = useGameLifecycleStore.getState();
      const modeId = GAME_MODES[0].id;

      store.updateModeProgress(modeId, 1, 2000);

      const state = useGameLifecycleStore.getState();
      const updatedMode = state.availableModes.find(m => m.id === modeId);

      expect(updatedMode?.isCompleted).toBe(true);
    });

    it('should not affect other modes', () => {
      const store = useGameLifecycleStore.getState();
      const modeId = GAME_MODES[0].id;

      const otherModesBefore = useGameLifecycleStore
        .getState()
        .availableModes.filter(m => m.id !== modeId);

      store.updateModeProgress(modeId, 3, 5000);

      const otherModesAfter = useGameLifecycleStore
        .getState()
        .availableModes.filter(m => m.id !== modeId);

      expect(otherModesAfter).toEqual(otherModesBefore);
    });
  });

  describe('unlockMode', () => {
    it('should unlock a locked mode', () => {
      const store = useGameLifecycleStore.getState();
      const lockedMode = GAME_MODES.find(m => m.isLocked);

      if (lockedMode) {
        store.unlockMode(lockedMode.id);

        const state = useGameLifecycleStore.getState();
        const unlockedMode = state.availableModes.find(m => m.id === lockedMode.id);

        expect(unlockedMode?.isLocked).toBe(false);
      }
    });

    it('should be safe to unlock already unlocked mode', () => {
      const store = useGameLifecycleStore.getState();
      const unlockedMode = GAME_MODES.find(m => !m.isLocked);

      if (unlockedMode) {
        store.unlockMode(unlockedMode.id);

        const state = useGameLifecycleStore.getState();
        const mode = state.availableModes.find(m => m.id === unlockedMode.id);

        expect(mode?.isLocked).toBe(false);
      }
    });

    it('should not affect other modes', () => {
      const store = useGameLifecycleStore.getState();
      const lockedMode = GAME_MODES.find(m => m.isLocked);

      if (lockedMode) {
        const otherModesBefore = useGameLifecycleStore
          .getState()
          .availableModes.filter(m => m.id !== lockedMode.id)
          .map(m => ({ id: m.id, isLocked: m.isLocked }));

        store.unlockMode(lockedMode.id);

        const otherModesAfter = useGameLifecycleStore
          .getState()
          .availableModes.filter(m => m.id !== lockedMode.id)
          .map(m => ({ id: m.id, isLocked: m.isLocked }));

        expect(otherModesAfter).toEqual(otherModesBefore);
      }
    });
  });

  describe('Game Flow Integration', () => {
    it('should handle complete game lifecycle', () => {
      const store = useGameLifecycleStore.getState();

      // Start game
      store.startGame(CaliforniaRegion.BAY_AREA, DifficultyLevel.MEDIUM);
      expect(useGameLifecycleStore.getState().isGameActive).toBe(true);

      // Play for some time
      store.updateTimer(1000);
      expect(useGameLifecycleStore.getState().timeElapsed).toBe(1000);

      // Pause
      store.pauseGame();
      expect(useGameLifecycleStore.getState().isPaused).toBe(true);

      // Resume
      store.resumeGame();
      expect(useGameLifecycleStore.getState().isPaused).toBe(false);

      // Continue playing
      store.updateTimer(2000);
      expect(useGameLifecycleStore.getState().timeElapsed).toBe(3000);

      // End game
      store.endGame();
      expect(useGameLifecycleStore.getState().isGameActive).toBe(false);
    });

    it('should handle multiple game sessions', () => {
      const store = useGameLifecycleStore.getState();

      // First game
      store.startGame();
      store.updateTimer(2000);
      store.endGame();

      // Second game
      store.startGame();
      store.updateTimer(3000);
      store.endGame();

      expect(mockIncrementGamesPlayed).toHaveBeenCalledTimes(2);
      expect(mockFinalizeGame).toHaveBeenCalledTimes(2);
    });

    it('should handle mode-based gameplay', () => {
      const store = useGameLifecycleStore.getState();
      const testMode = GAME_MODES[0];

      // Start with mode
      store.startGameWithMode(testMode);
      expect(useGameLifecycleStore.getState().currentMode).toEqual(testMode);

      // Play and update progress
      store.updateTimer(120000);
      store.updateModeProgress(testMode.id, 3, 8000, 120000);

      const updatedMode = useGameLifecycleStore
        .getState()
        .availableModes.find(m => m.id === testMode.id);

      expect(updatedMode?.isCompleted).toBe(true);
      expect(updatedMode?.stars).toBe(3);
    });
  });
});
