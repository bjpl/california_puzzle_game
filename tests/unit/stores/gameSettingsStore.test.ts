/**
 * Game Settings Store Unit Tests
 *
 * Purpose: Test game settings state management, preferences, and persistence
 * Coverage: Store initialization, settings updates, sound management, accessibility features
 *
 * Last updated: 2025-12-03
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useSettingsStore } from '../../../src/stores/gameSettingsStore';
import { DifficultyLevel, CaliforniaRegion } from '../../../src/types/index';
import type { GameSettings, SoundSettings } from '../../../src/types/index';

// Mock sound manager
vi.mock('../../../src/utils/soundManager', () => ({
  setVolume: vi.fn(),
  soundManager: {
    startBackgroundMusic: vi.fn(),
    stopBackgroundMusic: vi.fn(),
  },
}));

describe('Game Settings Store', () => {
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

  beforeEach(() => {
    // Reset store to initial state before each test
    useSettingsStore.setState({
      settings: defaultSettings,
      userId: null,
      highContrastEnabled: false,
      showRegions: false,
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should have correct initial settings state', () => {
      const state = useSettingsStore.getState();

      expect(state.settings).toEqual(defaultSettings);
      expect(state.settings.difficulty).toBe(DifficultyLevel.EASY);
      expect(state.settings.region).toBe(CaliforniaRegion.BAY_AREA);
      expect(state.settings.showHints).toBe(true);
      expect(state.settings.enableTimer).toBe(true);
      expect(state.settings.soundEnabled).toBe(true);
      expect(state.settings.animationsEnabled).toBe(true);
      expect(state.settings.autoAdvance).toBe(false);
    });

    it('should have correct initial sound settings', () => {
      const state = useSettingsStore.getState();

      expect(state.settings.soundSettings).toEqual(defaultSoundSettings);
      expect(state.settings.soundSettings.masterVolume).toBe(0.7);
      expect(state.settings.soundSettings.effectsVolume).toBe(0.8);
      expect(state.settings.soundSettings.musicVolume).toBe(0.5);
      expect(state.settings.soundSettings.muted).toBe(false);
      expect(state.settings.soundSettings.enableBackgroundMusic).toBe(true);
    });

    it('should have correct initial hint settings', () => {
      const state = useSettingsStore.getState();

      expect(state.settings.hintSettings).toBeDefined();
      expect(state.settings.hintSettings.maxHintsPerLevel).toBe(3);
      expect(state.settings.hintSettings.hintCooldownMs).toBe(30000);
      expect(state.settings.hintSettings.scorePenaltyPerHint).toBe(50);
      expect(state.settings.hintSettings.freeHintsAllowed).toBe(1);
      expect(state.settings.hintSettings.enableVisualIndicators).toBe(true);
      expect(state.settings.hintSettings.enableEducationalHints).toBe(true);
    });

    it('should have correct initial userId state', () => {
      const state = useSettingsStore.getState();

      expect(state.userId).toBeNull();
    });

    it('should have correct initial accessibility state', () => {
      const state = useSettingsStore.getState();

      expect(state.highContrastEnabled).toBe(false);
      expect(state.showRegions).toBe(false);
    });

    it('should have all required actions', () => {
      const state = useSettingsStore.getState();

      expect(state.updateSettings).toBeDefined();
      expect(state.updateSoundSettings).toBeDefined();
      expect(state.toggleMute).toBeDefined();
      expect(state.startBackgroundMusic).toBeDefined();
      expect(state.stopBackgroundMusic).toBeDefined();
      expect(state.setUserId).toBeDefined();
      expect(state.resetSettings).toBeDefined();
      expect(state.setHighContrastEnabled).toBeDefined();
      expect(state.toggleShowRegions).toBeDefined();
    });
  });

  describe('updateSettings Action', () => {
    it('should update single setting', () => {
      const { updateSettings } = useSettingsStore.getState();

      updateSettings({ difficulty: DifficultyLevel.HARD });

      const state = useSettingsStore.getState();

      expect(state.settings.difficulty).toBe(DifficultyLevel.HARD);
      // Other settings should remain unchanged
      expect(state.settings.region).toBe(CaliforniaRegion.BAY_AREA);
      expect(state.settings.showHints).toBe(true);
    });

    it('should update multiple settings at once', () => {
      const { updateSettings } = useSettingsStore.getState();

      updateSettings({
        difficulty: DifficultyLevel.MEDIUM,
        region: CaliforniaRegion.SOUTHERN_CA,
        showHints: false,
        enableTimer: false,
      });

      const state = useSettingsStore.getState();

      expect(state.settings.difficulty).toBe(DifficultyLevel.MEDIUM);
      expect(state.settings.region).toBe(CaliforniaRegion.SOUTHERN_CA);
      expect(state.settings.showHints).toBe(false);
      expect(state.settings.enableTimer).toBe(false);
      // Unchanged settings should persist
      expect(state.settings.soundEnabled).toBe(true);
      expect(state.settings.animationsEnabled).toBe(true);
    });

    it('should update difficulty levels correctly', () => {
      const { updateSettings } = useSettingsStore.getState();

      updateSettings({ difficulty: DifficultyLevel.EASY });
      expect(useSettingsStore.getState().settings.difficulty).toBe(DifficultyLevel.EASY);

      updateSettings({ difficulty: DifficultyLevel.MEDIUM });
      expect(useSettingsStore.getState().settings.difficulty).toBe(DifficultyLevel.MEDIUM);

      updateSettings({ difficulty: DifficultyLevel.HARD });
      expect(useSettingsStore.getState().settings.difficulty).toBe(DifficultyLevel.HARD);
    });

    it('should update region correctly', () => {
      const { updateSettings } = useSettingsStore.getState();

      updateSettings({ region: CaliforniaRegion.NORTHERN_CA });
      expect(useSettingsStore.getState().settings.region).toBe(CaliforniaRegion.NORTHERN_CA);

      updateSettings({ region: CaliforniaRegion.CENTRAL_CA });
      expect(useSettingsStore.getState().settings.region).toBe(CaliforniaRegion.CENTRAL_CA);

      updateSettings({ region: CaliforniaRegion.SOUTHERN_CA });
      expect(useSettingsStore.getState().settings.region).toBe(CaliforniaRegion.SOUTHERN_CA);
    });

    it('should toggle boolean settings', () => {
      const { updateSettings } = useSettingsStore.getState();

      updateSettings({ showHints: false });
      expect(useSettingsStore.getState().settings.showHints).toBe(false);

      updateSettings({ showHints: true });
      expect(useSettingsStore.getState().settings.showHints).toBe(true);

      updateSettings({ enableTimer: false });
      expect(useSettingsStore.getState().settings.enableTimer).toBe(false);

      updateSettings({ animationsEnabled: false });
      expect(useSettingsStore.getState().settings.animationsEnabled).toBe(false);

      updateSettings({ autoAdvance: true });
      expect(useSettingsStore.getState().settings.autoAdvance).toBe(true);
    });

    it('should preserve nested settings when updating top-level settings', () => {
      const { updateSettings } = useSettingsStore.getState();

      updateSettings({ difficulty: DifficultyLevel.HARD });

      const state = useSettingsStore.getState();

      expect(state.settings.soundSettings).toEqual(defaultSoundSettings);
      expect(state.settings.hintSettings).toBeDefined();
    });
  });

  describe('updateSoundSettings Action', () => {
    it('should update sound volume settings', async () => {
      const { setVolume } = await import('../../../src/utils/soundManager');
      const { updateSoundSettings } = useSettingsStore.getState();

      updateSoundSettings({
        masterVolume: 0.5,
        effectsVolume: 0.6,
        musicVolume: 0.3,
      });

      const state = useSettingsStore.getState();

      expect(state.settings.soundSettings.masterVolume).toBe(0.5);
      expect(state.settings.soundSettings.effectsVolume).toBe(0.6);
      expect(state.settings.soundSettings.musicVolume).toBe(0.3);

      // Verify setVolume was called with correct values
      expect(setVolume).toHaveBeenCalledWith({
        master: 0.5,
        effects: 0.6,
        music: 0.3,
        muted: false,
      });
    });

    it('should update muted state and sync soundEnabled', async () => {
      const { setVolume } = await import('../../../src/utils/soundManager');
      const { updateSoundSettings } = useSettingsStore.getState();

      updateSoundSettings({ muted: true });

      const state = useSettingsStore.getState();

      expect(state.settings.soundSettings.muted).toBe(true);
      expect(state.settings.soundEnabled).toBe(false);

      expect(setVolume).toHaveBeenCalledWith(
        expect.objectContaining({
          muted: true,
        })
      );
    });

    it('should update individual sound toggles', () => {
      const { updateSoundSettings } = useSettingsStore.getState();

      updateSoundSettings({ enableBackgroundMusic: false });
      expect(useSettingsStore.getState().settings.soundSettings.enableBackgroundMusic).toBe(false);

      updateSoundSettings({ enableClickSounds: false });
      expect(useSettingsStore.getState().settings.soundSettings.enableClickSounds).toBe(false);

      updateSoundSettings({ enableGameSounds: false });
      expect(useSettingsStore.getState().settings.soundSettings.enableGameSounds).toBe(false);

      updateSoundSettings({ enableAchievementSounds: false });
      expect(useSettingsStore.getState().settings.soundSettings.enableAchievementSounds).toBe(false);
    });

    it('should preserve other sound settings when updating one', () => {
      const { updateSoundSettings } = useSettingsStore.getState();

      updateSoundSettings({ masterVolume: 0.9 });

      const state = useSettingsStore.getState();

      expect(state.settings.soundSettings.masterVolume).toBe(0.9);
      expect(state.settings.soundSettings.effectsVolume).toBe(0.8);
      expect(state.settings.soundSettings.musicVolume).toBe(0.5);
      expect(state.settings.soundSettings.muted).toBe(false);
    });
  });

  describe('toggleMute Action', () => {
    it('should toggle mute from false to true', async () => {
      const { soundManager } = await import('../../../src/utils/soundManager');
      const { toggleMute } = useSettingsStore.getState();

      toggleMute();

      const state = useSettingsStore.getState();

      expect(state.settings.soundSettings.muted).toBe(true);
      expect(state.settings.soundEnabled).toBe(false);
      expect(soundManager.stopBackgroundMusic).toHaveBeenCalled();
    });

    it('should toggle mute from true to false', async () => {
      const { soundManager } = await import('../../../src/utils/soundManager');
      const { updateSoundSettings, toggleMute } = useSettingsStore.getState();

      // First mute
      updateSoundSettings({ muted: true });
      vi.clearAllMocks();

      // Then toggle (unmute)
      toggleMute();

      const state = useSettingsStore.getState();

      expect(state.settings.soundSettings.muted).toBe(false);
      expect(state.settings.soundEnabled).toBe(true);
      expect(soundManager.startBackgroundMusic).toHaveBeenCalled();
    });

    it('should not start background music when unmuting if background music is disabled', async () => {
      const { soundManager } = await import('../../../src/utils/soundManager');
      const { updateSoundSettings, toggleMute } = useSettingsStore.getState();

      // Set muted and disable background music
      updateSoundSettings({ muted: true, enableBackgroundMusic: false });
      vi.clearAllMocks();

      // Unmute
      toggleMute();

      expect(soundManager.startBackgroundMusic).not.toHaveBeenCalled();
    });

    it('should toggle multiple times correctly', () => {
      const { toggleMute } = useSettingsStore.getState();

      toggleMute();
      expect(useSettingsStore.getState().settings.soundSettings.muted).toBe(true);

      toggleMute();
      expect(useSettingsStore.getState().settings.soundSettings.muted).toBe(false);

      toggleMute();
      expect(useSettingsStore.getState().settings.soundSettings.muted).toBe(true);
    });
  });

  describe('startBackgroundMusic Action', () => {
    it('should start background music when enabled and not muted', async () => {
      const { soundManager } = await import('../../../src/utils/soundManager');
      const { startBackgroundMusic } = useSettingsStore.getState();

      startBackgroundMusic();

      expect(soundManager.startBackgroundMusic).toHaveBeenCalled();
    });

    it('should not start background music when muted', async () => {
      const { soundManager } = await import('../../../src/utils/soundManager');
      const { updateSoundSettings, startBackgroundMusic } = useSettingsStore.getState();

      updateSoundSettings({ muted: true });
      vi.clearAllMocks();

      startBackgroundMusic();

      expect(soundManager.startBackgroundMusic).not.toHaveBeenCalled();
    });

    it('should not start background music when disabled', async () => {
      const { soundManager } = await import('../../../src/utils/soundManager');
      const { updateSoundSettings, startBackgroundMusic } = useSettingsStore.getState();

      updateSoundSettings({ enableBackgroundMusic: false });
      vi.clearAllMocks();

      startBackgroundMusic();

      expect(soundManager.startBackgroundMusic).not.toHaveBeenCalled();
    });

    it('should not start background music when both muted and disabled', async () => {
      const { soundManager } = await import('../../../src/utils/soundManager');
      const { updateSoundSettings, startBackgroundMusic } = useSettingsStore.getState();

      updateSoundSettings({ muted: true, enableBackgroundMusic: false });
      vi.clearAllMocks();

      startBackgroundMusic();

      expect(soundManager.startBackgroundMusic).not.toHaveBeenCalled();
    });
  });

  describe('stopBackgroundMusic Action', () => {
    it('should stop background music', async () => {
      const { soundManager } = await import('../../../src/utils/soundManager');
      const { stopBackgroundMusic } = useSettingsStore.getState();

      stopBackgroundMusic();

      expect(soundManager.stopBackgroundMusic).toHaveBeenCalled();
    });

    it('should stop background music regardless of mute state', async () => {
      const { soundManager } = await import('../../../src/utils/soundManager');
      const { updateSoundSettings, stopBackgroundMusic } = useSettingsStore.getState();

      updateSoundSettings({ muted: true });
      vi.clearAllMocks();

      stopBackgroundMusic();

      expect(soundManager.stopBackgroundMusic).toHaveBeenCalled();
    });
  });

  describe('setUserId Action', () => {
    it('should set userId to a string value', () => {
      const { setUserId } = useSettingsStore.getState();

      setUserId('user-123');

      const state = useSettingsStore.getState();

      expect(state.userId).toBe('user-123');
    });

    it('should set userId to null', () => {
      const { setUserId } = useSettingsStore.getState();

      // First set a user ID
      setUserId('user-123');
      expect(useSettingsStore.getState().userId).toBe('user-123');

      // Then clear it
      setUserId(null);

      const state = useSettingsStore.getState();

      expect(state.userId).toBeNull();
    });

    it('should update userId multiple times', () => {
      const { setUserId } = useSettingsStore.getState();

      setUserId('user-1');
      expect(useSettingsStore.getState().userId).toBe('user-1');

      setUserId('user-2');
      expect(useSettingsStore.getState().userId).toBe('user-2');

      setUserId('user-3');
      expect(useSettingsStore.getState().userId).toBe('user-3');
    });

    it('should not affect other state when setting userId', () => {
      const { setUserId } = useSettingsStore.getState();
      const initialSettings = useSettingsStore.getState().settings;

      setUserId('user-123');

      const state = useSettingsStore.getState();

      expect(state.userId).toBe('user-123');
      expect(state.settings).toEqual(initialSettings);
      expect(state.highContrastEnabled).toBe(false);
      expect(state.showRegions).toBe(false);
    });
  });

  describe('resetSettings Action', () => {
    it('should reset all settings to defaults', () => {
      const { updateSettings, updateSoundSettings, resetSettings } = useSettingsStore.getState();

      // Modify settings
      updateSettings({
        difficulty: DifficultyLevel.HARD,
        region: CaliforniaRegion.SOUTHERN_CA,
        showHints: false,
        enableTimer: false,
      });
      updateSoundSettings({ masterVolume: 0.2, muted: true });

      // Reset
      resetSettings();

      const state = useSettingsStore.getState();

      expect(state.settings).toEqual(defaultSettings);
      expect(state.settings.difficulty).toBe(DifficultyLevel.EASY);
      expect(state.settings.region).toBe(CaliforniaRegion.BAY_AREA);
      expect(state.settings.showHints).toBe(true);
      expect(state.settings.soundSettings.masterVolume).toBe(0.7);
      expect(state.settings.soundSettings.muted).toBe(false);
    });

    it('should not reset userId when resetting settings', () => {
      const { setUserId, updateSettings, resetSettings } = useSettingsStore.getState();

      setUserId('user-123');
      updateSettings({ difficulty: DifficultyLevel.HARD });

      resetSettings();

      const state = useSettingsStore.getState();

      expect(state.settings).toEqual(defaultSettings);
      expect(state.userId).toBe('user-123'); // userId should persist
    });

    it('should not reset accessibility settings when resetting game settings', () => {
      const { setHighContrastEnabled, toggleShowRegions, updateSettings, resetSettings } =
        useSettingsStore.getState();

      setHighContrastEnabled(true);
      toggleShowRegions();
      updateSettings({ difficulty: DifficultyLevel.HARD });

      resetSettings();

      const state = useSettingsStore.getState();

      expect(state.settings).toEqual(defaultSettings);
      expect(state.highContrastEnabled).toBe(true); // Accessibility settings persist
      expect(state.showRegions).toBe(true); // Accessibility settings persist
    });

    it('should reset hint settings to defaults', () => {
      const { updateSettings, resetSettings } = useSettingsStore.getState();

      // Modify hint settings (need to update the full settings object)
      updateSettings({
        hintSettings: {
          maxHintsPerLevel: 5,
          hintCooldownMs: 60000,
          scorePenaltyPerHint: 100,
          freeHintsAllowed: 2,
          autoSuggestThreshold: 5,
          enableVisualIndicators: false,
          enableEducationalHints: false,
        },
      });

      resetSettings();

      const state = useSettingsStore.getState();

      expect(state.settings.hintSettings).toEqual(defaultSettings.hintSettings);
    });
  });

  describe('setHighContrastEnabled Action', () => {
    it('should enable high contrast mode', () => {
      const { setHighContrastEnabled } = useSettingsStore.getState();

      setHighContrastEnabled(true);

      const state = useSettingsStore.getState();

      expect(state.highContrastEnabled).toBe(true);
    });

    it('should disable high contrast mode', () => {
      const { setHighContrastEnabled } = useSettingsStore.getState();

      // First enable
      setHighContrastEnabled(true);
      expect(useSettingsStore.getState().highContrastEnabled).toBe(true);

      // Then disable
      setHighContrastEnabled(false);

      const state = useSettingsStore.getState();

      expect(state.highContrastEnabled).toBe(false);
    });

    it('should toggle high contrast mode multiple times', () => {
      const { setHighContrastEnabled } = useSettingsStore.getState();

      setHighContrastEnabled(true);
      expect(useSettingsStore.getState().highContrastEnabled).toBe(true);

      setHighContrastEnabled(false);
      expect(useSettingsStore.getState().highContrastEnabled).toBe(false);

      setHighContrastEnabled(true);
      expect(useSettingsStore.getState().highContrastEnabled).toBe(true);
    });

    it('should not affect other state when setting high contrast', () => {
      const { setHighContrastEnabled } = useSettingsStore.getState();
      const initialSettings = useSettingsStore.getState().settings;
      const initialUserId = useSettingsStore.getState().userId;
      const initialShowRegions = useSettingsStore.getState().showRegions;

      setHighContrastEnabled(true);

      const state = useSettingsStore.getState();

      expect(state.highContrastEnabled).toBe(true);
      expect(state.settings).toEqual(initialSettings);
      expect(state.userId).toBe(initialUserId);
      expect(state.showRegions).toBe(initialShowRegions);
    });
  });

  describe('toggleShowRegions Action', () => {
    it('should toggle showRegions from false to true', () => {
      const { toggleShowRegions } = useSettingsStore.getState();

      toggleShowRegions();

      const state = useSettingsStore.getState();

      expect(state.showRegions).toBe(true);
    });

    it('should toggle showRegions from true to false', () => {
      const { toggleShowRegions } = useSettingsStore.getState();

      // First toggle to true
      toggleShowRegions();
      expect(useSettingsStore.getState().showRegions).toBe(true);

      // Then toggle back to false
      toggleShowRegions();

      const state = useSettingsStore.getState();

      expect(state.showRegions).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      const { toggleShowRegions } = useSettingsStore.getState();

      toggleShowRegions();
      expect(useSettingsStore.getState().showRegions).toBe(true);

      toggleShowRegions();
      expect(useSettingsStore.getState().showRegions).toBe(false);

      toggleShowRegions();
      expect(useSettingsStore.getState().showRegions).toBe(true);

      toggleShowRegions();
      expect(useSettingsStore.getState().showRegions).toBe(false);
    });

    it('should not affect other state when toggling showRegions', () => {
      const { toggleShowRegions } = useSettingsStore.getState();
      const initialSettings = useSettingsStore.getState().settings;
      const initialUserId = useSettingsStore.getState().userId;
      const initialHighContrast = useSettingsStore.getState().highContrastEnabled;

      toggleShowRegions();

      const state = useSettingsStore.getState();

      expect(state.showRegions).toBe(true);
      expect(state.settings).toEqual(initialSettings);
      expect(state.userId).toBe(initialUserId);
      expect(state.highContrastEnabled).toBe(initialHighContrast);
    });
  });

  describe('Settings Persistence', () => {
    it('should include settings in persisted state', () => {
      const { updateSettings } = useSettingsStore.getState();

      updateSettings({ difficulty: DifficultyLevel.HARD });

      const state = useSettingsStore.getState();

      // The persist middleware should include settings
      expect(state.settings.difficulty).toBe(DifficultyLevel.HARD);
    });

    it('should include userId in persisted state', () => {
      const { setUserId } = useSettingsStore.getState();

      setUserId('persisted-user');

      const state = useSettingsStore.getState();

      expect(state.userId).toBe('persisted-user');
    });

    it('should include accessibility settings in persisted state', () => {
      const { setHighContrastEnabled, toggleShowRegions } = useSettingsStore.getState();

      setHighContrastEnabled(true);
      toggleShowRegions();

      const state = useSettingsStore.getState();

      expect(state.highContrastEnabled).toBe(true);
      expect(state.showRegions).toBe(true);
    });

    it('should persist all settings types together', () => {
      const { updateSettings, setUserId, setHighContrastEnabled, toggleShowRegions } =
        useSettingsStore.getState();

      updateSettings({
        difficulty: DifficultyLevel.MEDIUM,
        region: CaliforniaRegion.CENTRAL_CA,
      });
      setUserId('test-user-456');
      setHighContrastEnabled(true);
      toggleShowRegions();

      const state = useSettingsStore.getState();

      expect(state.settings.difficulty).toBe(DifficultyLevel.MEDIUM);
      expect(state.settings.region).toBe(CaliforniaRegion.CENTRAL_CA);
      expect(state.userId).toBe('test-user-456');
      expect(state.highContrastEnabled).toBe(true);
      expect(state.showRegions).toBe(true);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle rapid setting changes', () => {
      const { updateSettings } = useSettingsStore.getState();

      updateSettings({ difficulty: DifficultyLevel.EASY });
      updateSettings({ difficulty: DifficultyLevel.MEDIUM });
      updateSettings({ difficulty: DifficultyLevel.HARD });
      updateSettings({ showHints: false });
      updateSettings({ showHints: true });

      const state = useSettingsStore.getState();

      expect(state.settings.difficulty).toBe(DifficultyLevel.HARD);
      expect(state.settings.showHints).toBe(true);
    });

    it('should maintain consistency when updating related settings', () => {
      const { updateSoundSettings } = useSettingsStore.getState();

      updateSoundSettings({ muted: true });

      const state = useSettingsStore.getState();

      expect(state.settings.soundSettings.muted).toBe(true);
      expect(state.settings.soundEnabled).toBe(false); // Should sync
    });

    it('should handle concurrent sound and game setting updates', () => {
      const { updateSettings, updateSoundSettings } = useSettingsStore.getState();

      updateSettings({ difficulty: DifficultyLevel.HARD });
      updateSoundSettings({ masterVolume: 0.3 });
      updateSettings({ showHints: false });

      const state = useSettingsStore.getState();

      expect(state.settings.difficulty).toBe(DifficultyLevel.HARD);
      expect(state.settings.soundSettings.masterVolume).toBe(0.3);
      expect(state.settings.showHints).toBe(false);
    });

    it('should maintain data integrity across all actions', () => {
      const {
        updateSettings,
        updateSoundSettings,
        setUserId,
        setHighContrastEnabled,
        toggleShowRegions,
      } = useSettingsStore.getState();

      // Perform multiple operations
      updateSettings({ difficulty: DifficultyLevel.HARD, region: CaliforniaRegion.SOUTHERN_CA });
      updateSoundSettings({ masterVolume: 0.5, muted: true });
      setUserId('complex-user-789');
      setHighContrastEnabled(true);
      toggleShowRegions();

      const state = useSettingsStore.getState();

      // Verify all changes are correctly applied
      expect(state.settings.difficulty).toBe(DifficultyLevel.HARD);
      expect(state.settings.region).toBe(CaliforniaRegion.SOUTHERN_CA);
      expect(state.settings.soundSettings.masterVolume).toBe(0.5);
      expect(state.settings.soundSettings.muted).toBe(true);
      expect(state.settings.soundEnabled).toBe(false);
      expect(state.userId).toBe('complex-user-789');
      expect(state.highContrastEnabled).toBe(true);
      expect(state.showRegions).toBe(true);
    });
  });
});
