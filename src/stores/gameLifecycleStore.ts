/**
 * Game Lifecycle Store
 * Manages game state transitions: start, pause, resume, end, reset
 * Single responsibility: game lifecycle management
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DifficultyLevel, CaliforniaRegion, GameModeConfiguration } from '@/types';
import { GAME_MODES, getDifficultySettings } from '@/config/gameModes';
import { useStatsStore } from './scoringStore';
import { useHintStore } from './hintSystemStore';

export interface GameLifecycleState {
  isGameActive: boolean;
  isPaused: boolean;
  currentLevel: number;
  timeElapsed: number;
  difficulty: DifficultyLevel;
  selectedRegion: CaliforniaRegion;
  currentMode: GameModeConfiguration;
  availableModes: GameModeConfiguration[];
}

interface GameLifecycleActions {
  startGame: (region?: CaliforniaRegion, difficulty?: DifficultyLevel) => void;
  startGameWithMode: (mode: GameModeConfiguration) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  setCurrentMode: (mode: GameModeConfiguration) => void;
  updateModeProgress: (
    modeId: string,
    stars: number,
    score: number,
    completionTime?: number
  ) => void;
  unlockMode: (modeId: string) => void;
  updateTimer: (deltaTime: number) => void;
}

export type GameLifecycleStore = GameLifecycleState & GameLifecycleActions;

export const useGameLifecycleStore = create<GameLifecycleStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      isGameActive: false,
      isPaused: false,
      currentLevel: 1,
      timeElapsed: 0,
      difficulty: DifficultyLevel.EASY,
      selectedRegion: CaliforniaRegion.BAY_AREA,
      currentMode: GAME_MODES[0],
      availableModes: GAME_MODES,

      startGame: (region = CaliforniaRegion.BAY_AREA, difficulty = DifficultyLevel.EASY) => {
        set({
          isGameActive: true,
          isPaused: false,
          selectedRegion: region,
          difficulty: difficulty,
          timeElapsed: 0,
          currentLevel: 1,
        });

        // Increment games played in stats store
        useStatsStore.getState().incrementGamesPlayed();
        // Reset hint system
        useHintStore.getState().resetHintSystem();
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

        // Initialize hint system based on mode settings
        useHintStore.getState().initializeForMode(difficultySettings.enableHints, mode.showHints);
        useStatsStore.getState().incrementGamesPlayed();
      },

      pauseGame: () => set({ isPaused: true }),

      resumeGame: () => set({ isPaused: false }),

      endGame: () => {
        const state = get();
        set({
          isGameActive: false,
          isPaused: false,
        });

        // Update final stats
        useStatsStore.getState().finalizeGame(state.timeElapsed);
      },

      resetGame: () => {
        set({
          currentLevel: 1,
          timeElapsed: 0,
          isGameActive: false,
          isPaused: false,
        });
      },

      setCurrentMode: (mode: GameModeConfiguration) => {
        set({ currentMode: mode });
      },

      updateModeProgress: (
        modeId: string,
        stars: number,
        score: number,
        completionTime?: number
      ) => {
        set((state) => ({
          availableModes: state.availableModes.map((mode) =>
            mode.id === modeId
              ? {
                  ...mode,
                  stars: Math.max(mode.stars, stars),
                  bestScore: Math.max(mode.bestScore || 0, score),
                  completionTime:
                    completionTime && (!mode.completionTime || completionTime < mode.completionTime)
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

      updateTimer: (deltaTime: number) => {
        set((state) => ({
          timeElapsed: state.timeElapsed + deltaTime,
        }));
      },
    }),
    { name: 'GameLifecycle' }
  )
);
