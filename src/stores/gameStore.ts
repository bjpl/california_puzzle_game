import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { playSound, SoundType, setVolume, soundManager } from '../utils/soundManager';
import {
  GameState,
  GameSettings,
  SoundSettings,
  CountyPiece,
  County,
  PlacementResult,
  Achievement,
  GameStats,
  DifficultyLevel,
  CaliforniaRegion,
  Position,
  ScoreMultiplier,
  AchievementCategory,
  GameModeConfiguration,
  HintSystemState,
  HintConfiguration,
  HintType,
  StruggleData
} from '@/types';
import { GAME_MODES, getModeById, getDifficultySettings } from '@/config/gameModes';

interface GameStore extends GameState {
  // Settings
  settings: GameSettings;
  stats: GameStats;
  availableModes: GameModeConfiguration[];

  // Actions
  startGame: (region?: CaliforniaRegion, difficulty?: DifficultyLevel) => void;
  startGameWithMode: (mode: GameModeConfiguration) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;

  // Mode Management
  setCurrentMode: (mode: GameModeConfiguration) => void;
  updateModeProgress: (modeId: string, stars: number, score: number, completionTime?: number) => void;
  unlockMode: (modeId: string) => void;

  // County placement
  placeCounty: (county: CountyPiece, position: Position) => PlacementResult;
  removeCounty: (countyId: string) => void;
  moveCounty: (countyId: string, position: Position) => void;

  // Scoring
  calculateScore: (placement: PlacementResult) => number;
  updateScore: (points: number) => void;
  updateStreak: (isCorrect: boolean) => void;

  // Achievements
  checkAchievements: (placement?: PlacementResult) => Achievement[];
  unlockAchievement: (achievementId: string) => void;

  // Settings
  updateSettings: (newSettings: Partial<GameSettings>) => void;

  // Timer
  updateTimer: (deltaTime: number) => void;

  // Hints
  getHint: () => County | null;
  useHint: (type: HintType, countyId: string, isAutoSuggested?: boolean) => void;
  updateHintSystem: (updates: Partial<HintSystemState>) => void;
  analyzePlayerStruggle: (countyId: string, position: Position, isCorrect: boolean) => void;
  resetHintSystem: () => void;

  // Statistics
  updateStats: (placement: PlacementResult) => void;
  getPersonalBest: (region: CaliforniaRegion, difficulty: DifficultyLevel) => number;

  // Sound management
  updateSoundSettings: (newSettings: Partial<SoundSettings>) => void;
  toggleMute: () => void;
  startBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
}

const defaultSoundSettings: SoundSettings = {
  masterVolume: 0.7,
  effectsVolume: 0.8,
  musicVolume: 0.5,
  muted: false,
  enableBackgroundMusic: true,
  enableClickSounds: true,
  enableGameSounds: true,
  enableAchievementSounds: true
};

const defaultSettings: GameSettings = {
  difficulty: DifficultyLevel.EASY,
  region: CaliforniaRegion.BAY_AREA,
  showHints: true,
  enableTimer: true,
  soundEnabled: true,
  animationsEnabled: true,
  autoAdvance: false,
  soundSettings: defaultSoundSettings,
  hintSettings: {
    maxHintsPerLevel: 3,
    hintCooldownMs: 30000,
    scorePenaltyPerHint: 50,
    freeHintsAllowed: 1,
    autoSuggestThreshold: 3,
    enableVisualIndicators: true,
    enableEducationalHints: true
  }
};

const defaultStats: GameStats = {
  totalGamesPlayed: 0,
  totalScore: 0,
  bestScore: 0,
  averageAccuracy: 0,
  totalPlayTime: 0,
  favoriteDifficulty: DifficultyLevel.EASY,
  favoriteRegion: CaliforniaRegion.BAY_AREA,
  countiesLearned: new Set(),
  perfectPlacements: 0,
  longestStreak: 0
};

const achievements: Achievement[] = [
  {
    id: 'first_county',
    name: 'First Steps',
    description: 'Place your first county correctly',
    icon: '🎯',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.COMPLETION
  },
  {
    id: 'perfect_placement',
    name: 'Bullseye',
    description: 'Place a county with 100% accuracy',
    icon: '🎯',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.ACCURACY
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Place a county in under 3 seconds',
    icon: '⚡',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.SPEED
  },
  {
    id: 'bay_area_master',
    name: 'Bay Area Master',
    description: 'Complete Bay Area on Expert difficulty',
    icon: '🌉',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.COMPLETION
  },
  {
    id: 'streak_10',
    name: 'On Fire',
    description: 'Get a 10-county streak',
    icon: '🔥',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.STREAK
  },
  {
    id: 'california_expert',
    name: 'California Expert',
    description: 'Complete all regions on Expert difficulty',
    icon: '🏆',
    progress: 0,
    isUnlocked: false,
    category: AchievementCategory.COMPLETION
  }
];

const calculatePlacementAccuracy = (
  targetPosition: Position,
  actualPosition: Position,
  tolerance: number = 50
): number => {
  const distance = Math.sqrt(
    Math.pow(targetPosition.x - actualPosition.x, 2) +
    Math.pow(targetPosition.y - actualPosition.y, 2)
  );

  if (distance <= tolerance) {
    return Math.max(0, 1 - (distance / tolerance));
  }
  return 0;
};

const calculateScoreMultipliers = (
  difficulty: DifficultyLevel,
  accuracy: number,
  timeToPlace: number,
  streak: number
): ScoreMultiplier => {
  const difficultyMultiplier = {
    [DifficultyLevel.EASY]: 1.0,
    [DifficultyLevel.MEDIUM]: 1.5,
    [DifficultyLevel.HARD]: 2.0,
    [DifficultyLevel.EXPERT]: 3.0
  }[difficulty];

  const speedMultiplier = timeToPlace < 5000 ? 1.5 :
                         timeToPlace < 10000 ? 1.2 : 1.0;

  const streakMultiplier = 1 + (Math.min(streak, 10) * 0.1);

  return {
    base: 100,
    accuracy: accuracy,
    speed: speedMultiplier,
    difficulty: difficultyMultiplier,
    streak: streakMultiplier,
    total: 100 * accuracy * speedMultiplier * difficultyMultiplier * streakMultiplier
  };
};

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentLevel: 1,
        score: 0,
        timeElapsed: 0,
        isGameActive: false,
        isPaused: false,
        difficulty: DifficultyLevel.EASY,
        selectedRegion: CaliforniaRegion.BAY_AREA,
        currentMode: GAME_MODES[0], // Default to first mode
        placedCounties: [],
        remainingCounties: [],
        currentHint: undefined,
        streak: 0,
        mistakes: 0,
        achievements: achievements,
        settings: defaultSettings,
        stats: defaultStats,
        availableModes: GAME_MODES,
        hintSystem: {
          availableHints: 3,
          usedHints: 0,
          currentHintType: undefined,
          hintProgress: 0,
          cooldownTimeRemaining: 0,
          lastHintUsedAt: undefined,
          strugglingCounties: [],
          autoSuggestEnabled: true
        },

        // Game control actions
        startGame: (region = CaliforniaRegion.BAY_AREA, difficulty = DifficultyLevel.EASY) => {
          set((state) => ({
            isGameActive: true,
            isPaused: false,
            selectedRegion: region,
            difficulty: difficulty,
            score: 0,
            timeElapsed: 0,
            streak: 0,
            mistakes: 0,
            placedCounties: [],
            currentHint: undefined,
            stats: {
              ...state.stats,
              totalGamesPlayed: state.stats.totalGamesPlayed + 1
            }
          }));

          // Reset hint system for new game
          get().resetHintSystem();
        },

        startGameWithMode: (mode: GameModeConfiguration) => {
          const difficultySettings = getDifficultySettings(mode.difficulty);

          set((state) => ({
            isGameActive: true,
            isPaused: false,
            currentMode: mode,
            selectedRegion: CaliforniaRegion.ALL, // Modes define their own counties
            difficulty: mode.difficulty,
            score: 0,
            timeElapsed: 0,
            streak: 0,
            mistakes: 0,
            placedCounties: [],
            remainingCounties: [], // Will be populated by county loading logic
            currentHint: undefined,
            settings: {
              ...state.settings,
              showHints: mode.showHints && difficultySettings.enableHints,
              difficulty: mode.difficulty
            },
            hintSystem: {
              ...state.hintSystem,
              availableHints: difficultySettings.enableHints ? state.settings.hintSettings.maxHintsPerLevel : 0,
              usedHints: 0
            },
            stats: {
              ...state.stats,
              totalGamesPlayed: state.stats.totalGamesPlayed + 1
            }
          }));
        },

        pauseGame: () => {
          set({ isPaused: true });
        },

        resumeGame: () => {
          set({ isPaused: false });
        },

        endGame: () => {
          const state = get();
          set({
            isGameActive: false,
            isPaused: false,
            stats: {
              ...state.stats,
              bestScore: Math.max(state.stats.bestScore, state.score),
              totalScore: state.stats.totalScore + state.score,
              totalPlayTime: state.stats.totalPlayTime + state.timeElapsed,
              longestStreak: Math.max(state.stats.longestStreak, state.streak)
            }
          });
        },

        resetGame: () => {
          set({
            currentLevel: 1,
            score: 0,
            timeElapsed: 0,
            isGameActive: false,
            isPaused: false,
            placedCounties: [],
            remainingCounties: [],
            currentHint: undefined,
            streak: 0,
            mistakes: 0
          });
        },

        // Mode Management
        setCurrentMode: (mode: GameModeConfiguration) => {
          set({ currentMode: mode });
        },

        updateModeProgress: (modeId: string, stars: number, score: number, completionTime?: number) => {
          set((state) => ({
            availableModes: state.availableModes.map(mode =>
              mode.id === modeId
                ? {
                    ...mode,
                    stars: Math.max(mode.stars, stars),
                    bestScore: Math.max(mode.bestScore || 0, score),
                    completionTime: completionTime && (!mode.completionTime || completionTime < mode.completionTime)
                      ? completionTime
                      : mode.completionTime,
                    isCompleted: true
                  }
                : mode
            )
          }));
        },

        unlockMode: (modeId: string) => {
          set((state) => ({
            availableModes: state.availableModes.map(mode =>
              mode.id === modeId
                ? { ...mode, isLocked: false }
                : mode
            )
          }));
        },

        // County placement actions
        placeCounty: (county: CountyPiece, position: Position): PlacementResult => {
          const state = get();
          const difficultySettings = getDifficultySettings(state.difficulty);
          const tolerance = state.currentMode.dropZoneTolerance || difficultySettings.dropZoneTolerance;

          const accuracy = calculatePlacementAccuracy(county.targetPosition, position, tolerance);
          const isCorrect = accuracy > 0.8; // 80% accuracy threshold
          const timeToPlace = state.timeElapsed; // This would need proper timing logic

          const multipliers = calculateScoreMultipliers(
            state.difficulty,
            accuracy,
            timeToPlace,
            state.streak
          );

          const modeMultiplier = state.currentMode.scoreMultiplier || 1.0;
          const scoreAwarded = Math.round(multipliers.total * modeMultiplier);

          const result: PlacementResult = {
            county: county,
            accuracy,
            distance: Math.sqrt(
              Math.pow(county.targetPosition.x - position.x, 2) +
              Math.pow(county.targetPosition.y - position.y, 2)
            ),
            isCorrect,
            scoreAwarded,
            timeToPlace
          };

          // Update game state
          set((prevState) => ({
            placedCounties: [...prevState.placedCounties, {
              ...county,
              isPlaced: true,
              currentPosition: position
            }],
            remainingCounties: prevState.remainingCounties.filter(c => c.id !== county.id),
            score: prevState.score + scoreAwarded,
            streak: isCorrect ? prevState.streak + 1 : 0
          }));

          // Update stats and check achievements
          get().updateStats(result);
          get().checkAchievements(result);

          // Analyze player struggle for hint system
          get().analyzePlayerStruggle(county.id, position, isCorrect);

          return result;
        },

        removeCounty: (countyId: string) => {
          set((state) => {
            const county = state.placedCounties.find(c => c.id === countyId);
            if (!county) return state;

            return {
              placedCounties: state.placedCounties.filter(c => c.id !== countyId),
              remainingCounties: [...state.remainingCounties, {
                ...county,
                isPlaced: false
              }]
            };
          });
        },

        moveCounty: (countyId: string, position: Position) => {
          set((state) => ({
            placedCounties: state.placedCounties.map(county =>
              county.id === countyId
                ? { ...county, currentPosition: position }
                : county
            )
          }));
        },

        // Scoring actions
        calculateScore: (placement: PlacementResult): number => {
          const state = get();
          const multipliers = calculateScoreMultipliers(
            state.difficulty,
            placement.accuracy,
            placement.timeToPlace,
            state.streak
          );
          return Math.round(multipliers.total);
        },

        updateScore: (points: number) => {
          set((state) => ({ score: state.score + points }));
        },

        updateStreak: (isCorrect: boolean) => {
          set((state) => ({
            streak: isCorrect ? state.streak + 1 : 0
          }));
        },

        // Achievement system
        checkAchievements: (placement?: PlacementResult): Achievement[] => {
          const state = get();
          const newlyUnlocked: Achievement[] = [];

          const updatedAchievements = state.achievements.map(achievement => {
            if (achievement.isUnlocked) return achievement;

            let shouldUnlock = false;
            let newProgress = achievement.progress;

            switch (achievement.id) {
              case 'first_county':
                if (placement?.isCorrect) {
                  shouldUnlock = true;
                  newProgress = 1;
                }
                break;
              case 'perfect_placement':
                if (placement?.accuracy === 1) {
                  shouldUnlock = true;
                  newProgress = 1;
                }
                break;
              case 'speed_demon':
                if (placement && placement.timeToPlace < 3000) {
                  shouldUnlock = true;
                  newProgress = 1;
                }
                break;
              case 'streak_10':
                newProgress = Math.min(state.streak / 10, 1);
                if (state.streak >= 10) shouldUnlock = true;
                break;
              case 'bay_area_master':
                if (state.selectedRegion === CaliforniaRegion.BAY_AREA &&
                    state.difficulty === DifficultyLevel.EXPERT &&
                    state.remainingCounties.length === 0) {
                  shouldUnlock = true;
                  newProgress = 1;
                }
                break;
            }

            const updated = {
              ...achievement,
              progress: newProgress,
              isUnlocked: shouldUnlock,
              unlockedAt: shouldUnlock ? new Date() : achievement.unlockedAt
            };

            if (shouldUnlock && !achievement.isUnlocked) {
              newlyUnlocked.push(updated);
              // Play achievement sound when unlocking
              playSound(SoundType.ACHIEVEMENT);
            }

            return updated;
          });

          set({ achievements: updatedAchievements });
          return newlyUnlocked;
        },

        unlockAchievement: (achievementId: string) => {
          set((state) => ({
            achievements: state.achievements.map(achievement =>
              achievement.id === achievementId
                ? { ...achievement, isUnlocked: true, progress: 1, unlockedAt: new Date() }
                : achievement
            )
          }));
          // Play achievement sound when manually unlocking
          playSound(SoundType.ACHIEVEMENT);
        },

        // Settings management
        updateSettings: (newSettings: Partial<GameSettings>) => {
          set((state) => ({
            settings: { ...state.settings, ...newSettings }
          }));
        },

        // Timer
        updateTimer: (deltaTime: number) => {
          set((state) => ({
            timeElapsed: state.timeElapsed + deltaTime
          }));
        },

        // Hint system
        getHint: (): County | null => {
          const state = get();
          if (!state.settings.showHints || state.remainingCounties.length === 0) {
            return null;
          }
          return state.remainingCounties[0];
        },

        useHint: (type: HintType, countyId: string, isAutoSuggested = false) => {
          const state = get();

          // Check if hint can be used
          if (state.hintSystem.cooldownTimeRemaining > 0 ||
              state.hintSystem.availableHints <= 0) {
            return;
          }

          const cost = isAutoSuggested ? 0 :
                      (type === HintType.EDUCATIONAL ? 0 : state.settings.hintSettings.scorePenaltyPerHint);

          const freeHint = state.hintSystem.usedHints < state.settings.hintSettings.freeHintsAllowed;
          const actualCost = freeHint ? 0 : cost;

          set((prevState) => ({
            score: Math.max(0, prevState.score - actualCost),
            currentHint: prevState.remainingCounties.find(c => c.id === countyId),
            hintSystem: {
              ...prevState.hintSystem,
              availableHints: prevState.hintSystem.availableHints - 1,
              usedHints: prevState.hintSystem.usedHints + 1,
              currentHintType: type,
              hintProgress: 0.3,
              cooldownTimeRemaining: prevState.settings.hintSettings.hintCooldownMs,
              lastHintUsedAt: Date.now(),
              strugglingCounties: prevState.hintSystem.strugglingCounties.map(struggle =>
                struggle.countyId === countyId
                  ? { ...struggle, suggestedHints: [...struggle.suggestedHints, type] }
                  : struggle
              )
            }
          }));
        },

        updateHintSystem: (updates: Partial<HintSystemState>) => {
          set((state) => ({
            hintSystem: { ...state.hintSystem, ...updates }
          }));
        },

        analyzePlayerStruggle: (countyId: string, position: Position, isCorrect: boolean) => {
          set((state) => {
            const existingStruggle = state.hintSystem.strugglingCounties.find(
              s => s.countyId === countyId
            );

            const now = Date.now();
            const timeSpent = existingStruggle
              ? now - existingStruggle.lastAttemptAt
              : 1000; // Default time for first attempt

            if (isCorrect) {
              // Remove from struggling counties if correct
              return {
                hintSystem: {
                  ...state.hintSystem,
                  strugglingCounties: state.hintSystem.strugglingCounties.filter(
                    s => s.countyId !== countyId
                  )
                }
              };
            }

            const updatedStruggle: StruggleData = existingStruggle
              ? {
                  ...existingStruggle,
                  attempts: existingStruggle.attempts + 1,
                  lastAttemptAt: now,
                  totalTimeSpent: existingStruggle.totalTimeSpent + timeSpent,
                  wrongPlacements: [...existingStruggle.wrongPlacements, position]
                }
              : {
                  countyId,
                  attempts: 1,
                  lastAttemptAt: now,
                  totalTimeSpent: timeSpent,
                  wrongPlacements: [position],
                  suggestedHints: []
                };

            return {
              hintSystem: {
                ...state.hintSystem,
                strugglingCounties: existingStruggle
                  ? state.hintSystem.strugglingCounties.map(s =>
                      s.countyId === countyId ? updatedStruggle : s
                    )
                  : [...state.hintSystem.strugglingCounties, updatedStruggle]
              }
            };
          });
        },

        resetHintSystem: () => {
          set((state) => ({
            hintSystem: {
              availableHints: state.settings.hintSettings.maxHintsPerLevel,
              usedHints: 0,
              currentHintType: undefined,
              hintProgress: 0,
              cooldownTimeRemaining: 0,
              lastHintUsedAt: undefined,
              strugglingCounties: [],
              autoSuggestEnabled: true
            },
            currentHint: undefined
          }));
        },

        // Statistics
        updateStats: (placement: PlacementResult) => {
          set((state) => {
            const newCountiesLearned = new Set(state.stats.countiesLearned);
            if (placement.isCorrect) {
              newCountiesLearned.add(placement.county.id);
            }

            const totalPlacements = state.stats.totalGamesPlayed * 10; // Rough estimate
            const newAverageAccuracy = totalPlacements > 0
              ? (state.stats.averageAccuracy * (totalPlacements - 1) + placement.accuracy) / totalPlacements
              : placement.accuracy;

            return {
              stats: {
                ...state.stats,
                averageAccuracy: newAverageAccuracy,
                countiesLearned: newCountiesLearned,
                perfectPlacements: placement.accuracy === 1
                  ? state.stats.perfectPlacements + 1
                  : state.stats.perfectPlacements
              }
            };
          });
        },

        getPersonalBest: (region: CaliforniaRegion, difficulty: DifficultyLevel): number => {
          // This would typically be stored in more detailed stats
          // For now, return the overall best score
          return get().stats.bestScore;
        },

        // Sound management
        updateSoundSettings: (newSettings: Partial<SoundSettings>) => {
          set((state) => {
            const updatedSoundSettings = { ...state.settings.soundSettings, ...newSettings };

            // Update the sound manager with new settings
            setVolume({
              master: updatedSoundSettings.masterVolume,
              effects: updatedSoundSettings.effectsVolume,
              music: updatedSoundSettings.musicVolume,
              muted: updatedSoundSettings.muted
            });

            return {
              settings: {
                ...state.settings,
                soundSettings: updatedSoundSettings,
                soundEnabled: !updatedSoundSettings.muted
              }
            };
          });
        },

        toggleMute: () => {
          const state = get();
          const newMuted = !state.settings.soundSettings.muted;

          get().updateSoundSettings({ muted: newMuted });

          if (newMuted) {
            soundManager.stopBackgroundMusic();
          } else if (state.settings.soundSettings.enableBackgroundMusic) {
            soundManager.startBackgroundMusic();
          }
        },

        startBackgroundMusic: () => {
          const state = get();
          if (state.settings.soundSettings.enableBackgroundMusic && !state.settings.soundSettings.muted) {
            soundManager.startBackgroundMusic();
          }
        },

        stopBackgroundMusic: () => {
          soundManager.stopBackgroundMusic();
        }
      }),
      {
        name: 'california-puzzle-game',
        partialize: (state) => ({
          settings: state.settings,
          stats: state.stats,
          achievements: state.achievements
        })
      }
    ),
    { name: 'CaliforniaPuzzleGame' }
  )
);