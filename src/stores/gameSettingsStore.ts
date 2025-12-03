/**
 * Game Settings Store
 * Manages user preferences, sound settings, and configuration
 * Single responsibility: settings and preferences
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  GameSettings,
  SoundSettings,
  DifficultyLevel,
  CaliforniaRegion,
} from '@/types';
import { setVolume, soundManager } from '@/utils/soundManager';

export interface SettingsState {
  settings: GameSettings;
  userId: string | null;
}

interface SettingsActions {
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  updateSoundSettings: (newSettings: Partial<SoundSettings>) => void;
  toggleMute: () => void;
  startBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  setUserId: (userId: string | null) => void;
  resetSettings: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;

const defaultSoundSettings: SoundSettings = {
  masterVolume: 0.7,
  effectsVolume: 0.8,
  musicVolume: 0.5,
  muted: false,
  enableBackgroundMusic: true,
  enableClickSounds: true,
  enableGameSounds: true,
  enableAchievementSounds: true,
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
    enableEducationalHints: true,
  },
};

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        settings: defaultSettings,
        userId: null,

        updateSettings: (newSettings: Partial<GameSettings>) => {
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          }));
        },

        updateSoundSettings: (newSettings: Partial<SoundSettings>) => {
          set((state) => {
            const updatedSoundSettings = { ...state.settings.soundSettings, ...newSettings };

            // Update the sound manager with new settings
            setVolume({
              master: updatedSoundSettings.masterVolume,
              effects: updatedSoundSettings.effectsVolume,
              music: updatedSoundSettings.musicVolume,
              muted: updatedSoundSettings.muted,
            });

            return {
              settings: {
                ...state.settings,
                soundSettings: updatedSoundSettings,
                soundEnabled: !updatedSoundSettings.muted,
              },
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
          if (
            state.settings.soundSettings.enableBackgroundMusic &&
            !state.settings.soundSettings.muted
          ) {
            soundManager.startBackgroundMusic();
          }
        },

        stopBackgroundMusic: () => {
          soundManager.stopBackgroundMusic();
        },

        setUserId: (userId: string | null) => {
          set({ userId });
        },

        resetSettings: () => {
          set({ settings: defaultSettings });
        },
      }),
      {
        name: 'california-puzzle-settings',
        partialize: (state) => ({
          settings: state.settings,
          userId: state.userId,
        }),
      }
    ),
    { name: 'Settings' }
  )
);
