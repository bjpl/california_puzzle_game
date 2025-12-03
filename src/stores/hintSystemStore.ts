/**
 * Hint System Store
 * Manages hint availability, usage, cooldowns, and struggle detection
 * Single responsibility: hint system management
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  HintSystemState,
  HintType,
  StruggleData,
  Position,
  HintConfiguration,
} from '@/types';

export interface HintState {
  hintSystem: HintSystemState;
  hintSettings: HintConfiguration;
}

interface HintActions {
  useHint: (type: HintType, countyId: string, isAutoSuggested?: boolean) => void;
  updateHintSystem: (updates: Partial<HintSystemState>) => void;
  analyzePlayerStruggle: (countyId: string, position: Position, isCorrect: boolean) => void;
  resetHintSystem: () => void;
  initializeForMode: (enableHints: boolean, showHints: boolean) => void;
  updateCooldown: (deltaTime: number) => void;
  updateSettings: (settings: Partial<HintConfiguration>) => void;
}

export type HintStore = HintState & HintActions;

const defaultHintSettings: HintConfiguration = {
  maxHintsPerLevel: 3,
  hintCooldownMs: 30000,
  scorePenaltyPerHint: 50,
  freeHintsAllowed: 1,
  autoSuggestThreshold: 3,
  enableVisualIndicators: true,
  enableEducationalHints: true,
};

const defaultHintSystem: HintSystemState = {
  availableHints: 3,
  usedHints: 0,
  freeHintsRemaining: 1,
  currentHintType: undefined,
  hintProgress: 0,
  cooldownTimeRemaining: 0,
  lastHintUsedAt: undefined,
  strugglingCounties: [],
  autoSuggestEnabled: true,
};

export const useHintStore = create<HintStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        hintSystem: defaultHintSystem,
        hintSettings: defaultHintSettings,

        useHint: (type: HintType, countyId: string, isAutoSuggested = false) => {
          const state = get();

          // Check if hint can be used
          if (
            state.hintSystem.cooldownTimeRemaining > 0 ||
            state.hintSystem.availableHints <= 0
          ) {
            return;
          }

          const cost = isAutoSuggested
            ? 0
            : type === HintType.EDUCATIONAL
              ? 0
              : state.hintSettings.scorePenaltyPerHint;

          const freeHint =
            state.hintSystem.usedHints < state.hintSettings.freeHintsAllowed;
          // Cost is 0 for free hints, otherwise use calculated cost
          const actualCost = freeHint ? 0 : cost;
          // Note: actualCost can be used for future score deduction feature
          void actualCost; // Suppress unused variable warning

          set((prevState) => ({
            hintSystem: {
              ...prevState.hintSystem,
              availableHints: prevState.hintSystem.availableHints - 1,
              usedHints: prevState.hintSystem.usedHints + 1,
              currentHintType: type,
              hintProgress: 0.3,
              cooldownTimeRemaining: prevState.hintSettings.hintCooldownMs,
              lastHintUsedAt: Date.now(),
              strugglingCounties: prevState.hintSystem.strugglingCounties.map((struggle) =>
                struggle.countyId === countyId
                  ? { ...struggle, suggestedHints: [...struggle.suggestedHints, type] }
                  : struggle
              ),
            },
          }));
        },

        updateHintSystem: (updates: Partial<HintSystemState>) => {
          set((state) => ({
            hintSystem: { ...state.hintSystem, ...updates },
          }));
        },

        analyzePlayerStruggle: (countyId: string, position: Position, isCorrect: boolean) => {
          set((state) => {
            const existingStruggle = state.hintSystem.strugglingCounties.find(
              (s) => s.countyId === countyId
            );

            const now = Date.now();
            const timeSpent = existingStruggle ? now - existingStruggle.lastAttemptAt : 1000;

            if (isCorrect) {
              // Remove from struggling counties if correct
              return {
                hintSystem: {
                  ...state.hintSystem,
                  strugglingCounties: state.hintSystem.strugglingCounties.filter(
                    (s) => s.countyId !== countyId
                  ),
                },
              };
            }

            const updatedStruggle: StruggleData = existingStruggle
              ? {
                  ...existingStruggle,
                  attempts: existingStruggle.attempts + 1,
                  lastAttemptAt: now,
                  totalTimeSpent: existingStruggle.totalTimeSpent + timeSpent,
                  wrongPlacements: [...existingStruggle.wrongPlacements, position],
                }
              : {
                  countyId,
                  attempts: 1,
                  lastAttemptAt: now,
                  totalTimeSpent: timeSpent,
                  wrongPlacements: [position],
                  suggestedHints: [],
                };

            return {
              hintSystem: {
                ...state.hintSystem,
                strugglingCounties: existingStruggle
                  ? state.hintSystem.strugglingCounties.map((s) =>
                      s.countyId === countyId ? updatedStruggle : s
                    )
                  : [...state.hintSystem.strugglingCounties, updatedStruggle],
              },
            };
          });
        },

        resetHintSystem: () => {
          const state = get();
          set({
            hintSystem: {
              availableHints: state.hintSettings.maxHintsPerLevel,
              usedHints: 0,
              freeHintsRemaining: state.hintSettings.freeHintsAllowed,
              currentHintType: undefined,
              hintProgress: 0,
              cooldownTimeRemaining: 0,
              lastHintUsedAt: undefined,
              strugglingCounties: [],
              autoSuggestEnabled: true,
            },
          });
        },

        initializeForMode: (enableHints: boolean, showHints: boolean) => {
          const state = get();
          set({
            hintSystem: {
              ...state.hintSystem,
              availableHints: enableHints && showHints ? state.hintSettings.maxHintsPerLevel : 0,
              usedHints: 0,
              freeHintsRemaining: state.hintSettings.freeHintsAllowed,
              currentHintType: undefined,
              hintProgress: 0,
              cooldownTimeRemaining: 0,
              lastHintUsedAt: undefined,
              strugglingCounties: [],
              autoSuggestEnabled: enableHints && showHints,
            },
          });
        },

        updateCooldown: (deltaTime: number) => {
          set((state) => ({
            hintSystem: {
              ...state.hintSystem,
              cooldownTimeRemaining: Math.max(
                0,
                state.hintSystem.cooldownTimeRemaining - deltaTime
              ),
            },
          }));
        },

        updateSettings: (settings: Partial<HintConfiguration>) => {
          set((state) => ({
            hintSettings: { ...state.hintSettings, ...settings },
          }));
        },
      }),
      {
        name: 'california-puzzle-hints',
        partialize: (state) => ({
          hintSettings: state.hintSettings,
        }),
      }
    ),
    { name: 'HintSystem' }
  )
);
