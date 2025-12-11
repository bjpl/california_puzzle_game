/**
 * @fileoverview Study Settings and Preferences Store
 * @module stores/study/studySettingsStore
 * @description Manages user preferences for different study modes including
 * flashcard settings, map exploration options, and grid study configuration.
 * Persists preferences across sessions for consistent user experience.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { FlashcardSettings, MapExplorationSettings, GridStudySettings } from '../../types/study';

/**
 * Study settings state shape
 */
interface StudySettingsState {
  /** Flashcard mode preferences */
  flashcard: FlashcardSettings;
  /** Map exploration mode preferences */
  mapExploration: MapExplorationSettings;
  /** Grid study mode preferences */
  gridStudy: GridStudySettings;
}

/**
 * Settings management actions
 */
interface StudySettingsActions {
  /** Update flashcard mode settings */
  updateFlashcardSettings: (settings: Partial<FlashcardSettings>) => void;
  /** Update map exploration settings */
  updateMapSettings: (settings: Partial<MapExplorationSettings>) => void;
  /** Update grid study settings */
  updateGridSettings: (settings: Partial<GridStudySettings>) => void;
  /** Reset all settings to defaults */
  resetToDefaults: () => void;
}

const defaultFlashcardSettings: FlashcardSettings = {
  autoFlip: false,
  flipDelay: 3000,
  showHints: true,
  randomOrder: true,
  focusOnWeakAreas: true,
  repeatIncorrect: true,
};

const defaultMapSettings: MapExplorationSettings = {
  showLabels: true,
  highlightStudied: true,
  groupByRegion: true,
  showDifficulty: true,
  interactiveMode: true,
};

const defaultGridSettings: GridStudySettings = {
  sortBy: 'name',
  filterBy: {
    region: null,
    difficulty: null,
    studied: null,
    mastered: null,
  },
  cardsPerPage: 20,
  showDetails: true,
};

export const useStudySettingsStore = create<StudySettingsState & StudySettingsActions>()(
  devtools(
    persist(
      (set) => ({
        flashcard: defaultFlashcardSettings,
        mapExploration: defaultMapSettings,
        gridStudy: defaultGridSettings,

        /**
         * Update flashcard mode settings (partial update)
         * @param {Partial<FlashcardSettings>} settings - Settings to update
         * @example
         * updateFlashcardSettings({ autoFlip: true, flipDelay: 2000 });
         */
        updateFlashcardSettings: (settings) => {
          set((state) => ({
            flashcard: { ...state.flashcard, ...settings },
          }));
        },

        /**
         * Update map exploration mode settings (partial update)
         * @param {Partial<MapExplorationSettings>} settings - Settings to update
         * @example
         * updateMapSettings({ showLabels: false, interactiveMode: true });
         */
        updateMapSettings: (settings) => {
          set((state) => ({
            mapExploration: { ...state.mapExploration, ...settings },
          }));
        },

        /**
         * Update grid study mode settings (partial update)
         * @param {Partial<GridStudySettings>} settings - Settings to update
         * @example
         * updateGridSettings({ sortBy: 'difficulty', cardsPerPage: 30 });
         */
        updateGridSettings: (settings) => {
          set((state) => ({
            gridStudy: { ...state.gridStudy, ...settings },
          }));
        },

        /**
         * Reset all settings to default values
         * Affects flashcard, map exploration, and grid study settings
         */
        resetToDefaults: () => {
          set({
            flashcard: defaultFlashcardSettings,
            mapExploration: defaultMapSettings,
            gridStudy: defaultGridSettings,
          });
        },
      }),
      {
        name: 'study-settings-storage',
      }
    ),
    { name: 'StudySettingsStore' }
  )
);
