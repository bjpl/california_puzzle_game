import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { FlashcardSettings, MapExplorationSettings, GridStudySettings } from '../../types/study';

interface StudySettingsState {
  flashcard: FlashcardSettings;
  mapExploration: MapExplorationSettings;
  gridStudy: GridStudySettings;
}

interface StudySettingsActions {
  updateFlashcardSettings: (settings: Partial<FlashcardSettings>) => void;
  updateMapSettings: (settings: Partial<MapExplorationSettings>) => void;
  updateGridSettings: (settings: Partial<GridStudySettings>) => void;
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

        updateFlashcardSettings: (settings) => {
          set((state) => ({
            flashcard: { ...state.flashcard, ...settings },
          }));
        },

        updateMapSettings: (settings) => {
          set((state) => ({
            mapExploration: { ...state.mapExploration, ...settings },
          }));
        },

        updateGridSettings: (settings) => {
          set((state) => ({
            gridStudy: { ...state.gridStudy, ...settings },
          }));
        },

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
