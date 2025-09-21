import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MOCK_CALIFORNIA_COUNTIES, MOCK_GAME_STATE } from '../../fixtures';

// Mock game state management using Zustand pattern
interface GameState {
  // Game configuration
  mode: 'practice' | 'timed' | 'challenge' | 'learn';
  difficulty: 'easy' | 'medium' | 'hard';

  // Game status
  isGameStarted: boolean;
  isGamePaused: boolean;
  isGameCompleted: boolean;
  gameStartTime: number | null;
  gameEndTime: number | null;

  // County management
  availableCounties: string[];
  placedCounties: string[];
  currentCounty: string | null;
  selectedCounty: string | null;
  highlightedCounty: string | null;

  // Scoring and progress
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  mistakes: number;
  hintsUsed: number;
  maxHints: number;
  streak: number;
  bestStreak: number;

  // Timer
  timeElapsed: number;
  timeLimit: number | null;

  // UI state
  showHints: boolean;
  showLabels: boolean;
  soundEnabled: boolean;

  // Actions
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;

  setMode: (mode: GameState['mode']) => void;
  setDifficulty: (difficulty: GameState['difficulty']) => void;

  selectCounty: (countyId: string | null) => void;
  highlightCounty: (countyId: string | null) => void;
  placeCounty: (countyId: string, isCorrect: boolean) => void;
  removeCounty: (countyId: string) => void;

  useHint: () => void;
  updateTimer: (elapsed: number) => void;

  toggleHints: () => void;
  toggleLabels: () => void;
  toggleSound: () => void;
}

// Mock Zustand store
const createGameStore = () => {
  let state: GameState = {
    // Initial state
    mode: 'practice',
    difficulty: 'medium',

    isGameStarted: false,
    isGamePaused: false,
    isGameCompleted: false,
    gameStartTime: null,
    gameEndTime: null,

    availableCounties: MOCK_CALIFORNIA_COUNTIES.map(c => c.id),
    placedCounties: [],
    currentCounty: null,
    selectedCounty: null,
    highlightedCounty: null,

    score: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    mistakes: 0,
    hintsUsed: 0,
    maxHints: 3,
    streak: 0,
    bestStreak: 0,

    timeElapsed: 0,
    timeLimit: null,

    showHints: true,
    showLabels: false,
    soundEnabled: true,

    // Actions
    startGame: () => {
      const now = Date.now();
      state = {
        ...state,
        isGameStarted: true,
        isGamePaused: false,
        isGameCompleted: false,
        gameStartTime: now,
        gameEndTime: null,
        timeElapsed: 0,
        score: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        mistakes: 0,
        hintsUsed: 0,
        streak: 0,
        placedCounties: [],
        currentCounty: state.availableCounties[0] || null,
      };
    },

    pauseGame: () => {
      if (state.isGameStarted && !state.isGameCompleted) {
        state = { ...state, isGamePaused: true };
      }
    },

    resumeGame: () => {
      if (state.isGameStarted && state.isGamePaused) {
        state = { ...state, isGamePaused: false };
      }
    },

    endGame: () => {
      const now = Date.now();
      state = {
        ...state,
        isGameCompleted: true,
        isGamePaused: false,
        gameEndTime: now,
      };
    },

    resetGame: () => {
      state = {
        ...state,
        isGameStarted: false,
        isGamePaused: false,
        isGameCompleted: false,
        gameStartTime: null,
        gameEndTime: null,

        placedCounties: [],
        currentCounty: null,
        selectedCounty: null,
        highlightedCounty: null,

        score: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        mistakes: 0,
        hintsUsed: 0,
        streak: 0,

        timeElapsed: 0,
      };
    },

    setMode: (mode) => {
      state = { ...state, mode };
      // Set time limit based on mode
      if (mode === 'timed') {
        state.timeLimit = 300; // 5 minutes
      } else if (mode === 'challenge') {
        state.timeLimit = 180; // 3 minutes
      } else {
        state.timeLimit = null;
      }
    },

    setDifficulty: (difficulty) => {
      state = { ...state, difficulty };
      // Adjust hints based on difficulty
      if (difficulty === 'easy') {
        state.maxHints = 5;
      } else if (difficulty === 'medium') {
        state.maxHints = 3;
      } else {
        state.maxHints = 1;
      }
    },

    selectCounty: (countyId) => {
      state = { ...state, selectedCounty: countyId };
    },

    highlightCounty: (countyId) => {
      state = { ...state, highlightedCounty: countyId };
    },

    placeCounty: (countyId, isCorrect) => {
      const newTotalQuestions = state.totalQuestions + 1;
      let newCorrectAnswers = state.correctAnswers;
      let newMistakes = state.mistakes;
      let newStreak = state.streak;
      let newBestStreak = state.bestStreak;
      let newScore = state.score;

      if (isCorrect) {
        newCorrectAnswers += 1;
        newStreak += 1;
        newBestStreak = Math.max(newBestStreak, newStreak);
        newScore += 100; // Base score

        // Add county to placed list
        const newPlacedCounties = [...state.placedCounties, countyId];

        // Remove from available counties and select next
        const remainingCounties = state.availableCounties.filter(id => id !== countyId);
        const nextCounty = remainingCounties.length > 0 ? remainingCounties[0] : null;

        state = {
          ...state,
          placedCounties: newPlacedCounties,
          currentCounty: nextCounty,
          selectedCounty: null,
        };
      } else {
        newMistakes += 1;
        newStreak = 0;
      }

      state = {
        ...state,
        correctAnswers: newCorrectAnswers,
        totalQuestions: newTotalQuestions,
        mistakes: newMistakes,
        streak: newStreak,
        bestStreak: newBestStreak,
        score: newScore,
      };

      // Check if game is completed
      if (state.placedCounties.length === state.availableCounties.length) {
        state.endGame();
      }
    },

    removeCounty: (countyId) => {
      const newPlacedCounties = state.placedCounties.filter(id => id !== countyId);
      state = {
        ...state,
        placedCounties: newPlacedCounties,
        selectedCounty: null,
      };
    },

    useHint: () => {
      if (state.hintsUsed < state.maxHints) {
        state = {
          ...state,
          hintsUsed: state.hintsUsed + 1,
          score: Math.max(0, state.score - 10), // Hint penalty
        };
      }
    },

    updateTimer: (elapsed) => {
      state = { ...state, timeElapsed: elapsed };

      // Check time limit
      if (state.timeLimit && elapsed >= state.timeLimit) {
        state.endGame();
      }
    },

    toggleHints: () => {
      state = { ...state, showHints: !state.showHints };
    },

    toggleLabels: () => {
      state = { ...state, showLabels: !state.showLabels };
    },

    toggleSound: () => {
      state = { ...state, soundEnabled: !state.soundEnabled };
    },
  };

  return {
    getState: () => state,
    setState: (newState: Partial<GameState>) => {
      state = { ...state, ...newState };
    },
    subscribe: vi.fn(),
  };
};

// Hook for using game store
const useGameStore = () => {
  const store = createGameStore();
  return store.getState();
};

describe('Game State Management', () => {
  let gameStore: ReturnType<typeof createGameStore>;

  beforeEach(() => {
    gameStore = createGameStore();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = gameStore.getState();

      expect(state.mode).toBe('practice');
      expect(state.difficulty).toBe('medium');
      expect(state.isGameStarted).toBe(false);
      expect(state.isGamePaused).toBe(false);
      expect(state.isGameCompleted).toBe(false);
      expect(state.score).toBe(0);
      expect(state.correctAnswers).toBe(0);
      expect(state.mistakes).toBe(0);
      expect(state.hintsUsed).toBe(0);
      expect(state.availableCounties).toHaveLength(MOCK_CALIFORNIA_COUNTIES.length);
      expect(state.placedCounties).toHaveLength(0);
    });

    it('should have all counties available initially', () => {
      const state = gameStore.getState();
      const expectedCounties = MOCK_CALIFORNIA_COUNTIES.map(c => c.id);

      expect(state.availableCounties).toEqual(expectedCounties);
    });
  });

  describe('Game Lifecycle', () => {
    it('should start game correctly', () => {
      const state = gameStore.getState();
      const startTime = Date.now();

      act(() => {
        state.startGame();
      });

      const newState = gameStore.getState();
      expect(newState.isGameStarted).toBe(true);
      expect(newState.isGamePaused).toBe(false);
      expect(newState.isGameCompleted).toBe(false);
      expect(newState.gameStartTime).toBeGreaterThanOrEqual(startTime);
      expect(newState.currentCounty).toBe(state.availableCounties[0]);
    });

    it('should pause and resume game', () => {
      const state = gameStore.getState();

      // Start game first
      act(() => {
        state.startGame();
      });

      // Pause game
      act(() => {
        state.pauseGame();
      });

      expect(gameStore.getState().isGamePaused).toBe(true);

      // Resume game
      act(() => {
        state.resumeGame();
      });

      expect(gameStore.getState().isGamePaused).toBe(false);
    });

    it('should end game correctly', () => {
      const state = gameStore.getState();

      // Start game first
      act(() => {
        state.startGame();
      });

      const endTime = Date.now();

      // End game
      act(() => {
        state.endGame();
      });

      const newState = gameStore.getState();
      expect(newState.isGameCompleted).toBe(true);
      expect(newState.isGamePaused).toBe(false);
      expect(newState.gameEndTime).toBeGreaterThanOrEqual(endTime);
    });

    it('should reset game to initial state', () => {
      const state = gameStore.getState();

      // Start and modify game state
      act(() => {
        state.startGame();
        state.placeCounty('los-angeles', true);
        state.useHint();
      });

      // Reset game
      act(() => {
        state.resetGame();
      });

      const resetState = gameStore.getState();
      expect(resetState.isGameStarted).toBe(false);
      expect(resetState.placedCounties).toHaveLength(0);
      expect(resetState.score).toBe(0);
      expect(resetState.hintsUsed).toBe(0);
      expect(resetState.mistakes).toBe(0);
    });
  });

  describe('Game Mode and Difficulty', () => {
    it('should set game mode and adjust time limits', () => {
      const state = gameStore.getState();

      // Test timed mode
      act(() => {
        state.setMode('timed');
      });

      expect(gameStore.getState().mode).toBe('timed');
      expect(gameStore.getState().timeLimit).toBe(300);

      // Test challenge mode
      act(() => {
        state.setMode('challenge');
      });

      expect(gameStore.getState().mode).toBe('challenge');
      expect(gameStore.getState().timeLimit).toBe(180);

      // Test practice mode
      act(() => {
        state.setMode('practice');
      });

      expect(gameStore.getState().mode).toBe('practice');
      expect(gameStore.getState().timeLimit).toBeNull();
    });

    it('should set difficulty and adjust hints', () => {
      const state = gameStore.getState();

      // Test easy difficulty
      act(() => {
        state.setDifficulty('easy');
      });

      expect(gameStore.getState().difficulty).toBe('easy');
      expect(gameStore.getState().maxHints).toBe(5);

      // Test hard difficulty
      act(() => {
        state.setDifficulty('hard');
      });

      expect(gameStore.getState().difficulty).toBe('hard');
      expect(gameStore.getState().maxHints).toBe(1);
    });
  });

  describe('County Management', () => {
    it('should select counties', () => {
      const state = gameStore.getState();

      act(() => {
        state.selectCounty('los-angeles');
      });

      expect(gameStore.getState().selectedCounty).toBe('los-angeles');

      act(() => {
        state.selectCounty(null);
      });

      expect(gameStore.getState().selectedCounty).toBeNull();
    });

    it('should highlight counties', () => {
      const state = gameStore.getState();

      act(() => {
        state.highlightCounty('san-diego');
      });

      expect(gameStore.getState().highlightedCounty).toBe('san-diego');
    });

    it('should place counties correctly', () => {
      const state = gameStore.getState();

      act(() => {
        state.startGame();
        state.placeCounty('los-angeles', true);
      });

      const newState = gameStore.getState();
      expect(newState.placedCounties).toContain('los-angeles');
      expect(newState.correctAnswers).toBe(1);
      expect(newState.totalQuestions).toBe(1);
      expect(newState.mistakes).toBe(0);
      expect(newState.streak).toBe(1);
      expect(newState.score).toBeGreaterThan(0);
    });

    it('should handle incorrect placements', () => {
      const state = gameStore.getState();

      act(() => {
        state.startGame();
        state.placeCounty('los-angeles', false);
      });

      const newState = gameStore.getState();
      expect(newState.placedCounties).not.toContain('los-angeles');
      expect(newState.correctAnswers).toBe(0);
      expect(newState.totalQuestions).toBe(1);
      expect(newState.mistakes).toBe(1);
      expect(newState.streak).toBe(0);
    });

    it('should remove placed counties', () => {
      const state = gameStore.getState();

      act(() => {
        state.startGame();
        state.placeCounty('los-angeles', true);
        state.removeCounty('los-angeles');
      });

      const newState = gameStore.getState();
      expect(newState.placedCounties).not.toContain('los-angeles');
      expect(newState.selectedCounty).toBeNull();
    });

    it('should update current county after placement', () => {
      const state = gameStore.getState();

      act(() => {
        state.startGame();
      });

      const initialCounty = gameStore.getState().currentCounty;

      act(() => {
        state.placeCounty(initialCounty!, true);
      });

      const newState = gameStore.getState();
      expect(newState.currentCounty).not.toBe(initialCounty);
      expect(newState.selectedCounty).toBeNull();
    });
  });

  describe('Scoring System', () => {
    it('should track streaks correctly', () => {
      const state = gameStore.getState();

      act(() => {
        state.startGame();
        // Correct placements
        state.placeCounty('los-angeles', true);
        state.placeCounty('san-diego', true);
        state.placeCounty('orange', true);
      });

      let newState = gameStore.getState();
      expect(newState.streak).toBe(3);
      expect(newState.bestStreak).toBe(3);

      act(() => {
        // Incorrect placement breaks streak
        state.placeCounty('riverside', false);
      });

      newState = gameStore.getState();
      expect(newState.streak).toBe(0);
      expect(newState.bestStreak).toBe(3); // Best streak preserved

      act(() => {
        // Start new streak
        state.placeCounty('riverside', true);
        state.placeCounty('san-bernardino', true);
      });

      newState = gameStore.getState();
      expect(newState.streak).toBe(2);
      expect(newState.bestStreak).toBe(3);
    });

    it('should handle hints correctly', () => {
      const state = gameStore.getState();

      act(() => {
        state.startGame();
      });

      const initialScore = gameStore.getState().score;
      const initialHints = gameStore.getState().hintsUsed;

      act(() => {
        state.useHint();
      });

      const newState = gameStore.getState();
      expect(newState.hintsUsed).toBe(initialHints + 1);
      expect(newState.score).toBeLessThan(initialScore); // Penalty applied
    });

    it('should limit hint usage', () => {
      const state = gameStore.getState();

      act(() => {
        state.startGame();
        state.setDifficulty('hard'); // Only 1 hint allowed
      });

      act(() => {
        state.useHint();
        state.useHint(); // Should not work
      });

      expect(gameStore.getState().hintsUsed).toBe(1);
    });
  });

  describe('Timer Management', () => {
    it('should update timer', () => {
      const state = gameStore.getState();

      act(() => {
        state.updateTimer(120);
      });

      expect(gameStore.getState().timeElapsed).toBe(120);
    });

    it('should end game when time limit reached', () => {
      const state = gameStore.getState();

      act(() => {
        state.setMode('timed'); // 300 second limit
        state.startGame();
        state.updateTimer(300);
      });

      expect(gameStore.getState().isGameCompleted).toBe(true);
    });

    it('should not end game if no time limit', () => {
      const state = gameStore.getState();

      act(() => {
        state.setMode('practice'); // No time limit
        state.startGame();
        state.updateTimer(1000);
      });

      expect(gameStore.getState().isGameCompleted).toBe(false);
    });
  });

  describe('UI Settings', () => {
    it('should toggle hints display', () => {
      const state = gameStore.getState();
      const initialShowHints = gameStore.getState().showHints;

      act(() => {
        state.toggleHints();
      });

      expect(gameStore.getState().showHints).toBe(!initialShowHints);
    });

    it('should toggle labels display', () => {
      const state = gameStore.getState();
      const initialShowLabels = gameStore.getState().showLabels;

      act(() => {
        state.toggleLabels();
      });

      expect(gameStore.getState().showLabels).toBe(!initialShowLabels);
    });

    it('should toggle sound', () => {
      const state = gameStore.getState();
      const initialSoundEnabled = gameStore.getState().soundEnabled;

      act(() => {
        state.toggleSound();
      });

      expect(gameStore.getState().soundEnabled).toBe(!initialSoundEnabled);
    });
  });

  describe('Game Completion', () => {
    it('should complete game when all counties are placed', () => {
      const state = gameStore.getState();

      act(() => {
        state.startGame();
      });

      // Place all counties
      const counties = gameStore.getState().availableCounties;
      act(() => {
        counties.forEach(countyId => {
          state.placeCounty(countyId, true);
        });
      });

      expect(gameStore.getState().isGameCompleted).toBe(true);
    });

    it('should calculate final statistics', () => {
      const state = gameStore.getState();

      act(() => {
        state.startGame();
        state.placeCounty('los-angeles', true);
        state.placeCounty('san-diego', false);
        state.placeCounty('san-diego', true);
        state.useHint();
      });

      const finalState = gameStore.getState();
      expect(finalState.correctAnswers).toBe(2);
      expect(finalState.totalQuestions).toBe(3);
      expect(finalState.mistakes).toBe(1);
      expect(finalState.hintsUsed).toBe(1);
    });
  });

  describe('State Persistence and Validation', () => {
    it('should maintain state consistency', () => {
      const state = gameStore.getState();

      act(() => {
        state.startGame();
        state.placeCounty('los-angeles', true);
      });

      const newState = gameStore.getState();

      // Validate state consistency
      expect(newState.placedCounties.length + (newState.currentCounty ? 1 : 0))
        .toBeLessThanOrEqual(newState.availableCounties.length);
      expect(newState.correctAnswers).toBeLessThanOrEqual(newState.totalQuestions);
      expect(newState.hintsUsed).toBeLessThanOrEqual(newState.maxHints);
    });

    it('should handle invalid operations gracefully', () => {
      const state = gameStore.getState();

      // Try to pause game that hasn't started
      expect(() => {
        act(() => {
          state.pauseGame();
        });
      }).not.toThrow();

      // Game should remain in initial state
      expect(gameStore.getState().isGamePaused).toBe(false);
    });
  });
});