/**
 * React Hook for Sound System Integration
 *
 * This hook provides a convenient way to integrate the sound system
 * into React components with proper lifecycle management.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { playSound, SoundType, soundManager } from '../utils/soundManager';
import { initializeSoundSystem, setupAudioContextResume, cleanupSoundSystem } from '../utils/initializeSound';

export interface UseSoundOptions {
  enableClickSounds?: boolean;
  enableHoverSounds?: boolean;
  enableGameSounds?: boolean;
  autoInitialize?: boolean;
}

export interface UseSoundReturn {
  playSound: (soundType: SoundType) => void;
  isInitialized: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  startBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  soundSettings: any;
  initializeSound: () => Promise<void>;
}

/**
 * Hook for managing sound system in React components
 */
export const useSound = (options: UseSoundOptions = {}): UseSoundReturn => {
  const {
    enableClickSounds = true,
    enableHoverSounds = true,
    enableGameSounds = true,
    autoInitialize = false
  } = options;

  const isInitializedRef = useRef(false);
  const gameStore = useGameStore();

  const {
    settings,
    toggleMute,
    startBackgroundMusic,
    stopBackgroundMusic,
    updateSoundSettings
  } = gameStore;

  const { soundSettings } = settings;

  // Initialize sound system
  const initializeSound = useCallback(async () => {
    if (isInitializedRef.current) return;

    try {
      await initializeSoundSystem();
      setupAudioContextResume();
      isInitializedRef.current = true;
    } catch (error) {
      console.warn('Sound initialization failed:', error);
    }
  }, []);

  // Auto-initialize if requested
  useEffect(() => {
    if (autoInitialize) {
      initializeSound();
    }
  }, [autoInitialize, initializeSound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInitializedRef.current) {
        cleanupSoundSystem();
      }
    };
  }, []);

  // Safe play sound function that respects settings
  const playSoundSafe = useCallback((soundType: SoundType) => {
    // Check if sound is muted
    if (soundSettings.muted) return;

    // Check category-specific settings
    switch (soundType) {
      case SoundType.CLICK:
      case SoundType.HOVER:
        if (!soundSettings.enableClickSounds) return;
        break;
      case SoundType.PICKUP:
      case SoundType.CORRECT:
      case SoundType.INCORRECT:
      case SoundType.WIN:
        if (!soundSettings.enableGameSounds) return;
        break;
      case SoundType.ACHIEVEMENT:
        if (!soundSettings.enableAchievementSounds) return;
        break;
      case SoundType.BACKGROUND_MUSIC:
        if (!soundSettings.enableBackgroundMusic) return;
        break;
    }

    // Check component-specific options
    if (soundType === SoundType.CLICK && !enableClickSounds) return;
    if (soundType === SoundType.HOVER && !enableHoverSounds) return;
    if ([SoundType.PICKUP, SoundType.CORRECT, SoundType.INCORRECT, SoundType.WIN].includes(soundType) && !enableGameSounds) return;

    // Play the sound
    playSound(soundType);
  }, [soundSettings, enableClickSounds, enableHoverSounds, enableGameSounds]);

  return {
    playSound: playSoundSafe,
    isInitialized: isInitializedRef.current,
    isMuted: soundSettings.muted,
    toggleMute,
    startBackgroundMusic,
    stopBackgroundMusic,
    soundSettings,
    initializeSound
  };
};

/**
 * Hook for button sound effects
 */
export const useButtonSounds = () => {
  const { playSound } = useSound({
    enableClickSounds: true,
    enableHoverSounds: true
  });

  const handleClick = useCallback(() => {
    playSound(SoundType.CLICK);
  }, [playSound]);

  const handleHover = useCallback(() => {
    playSound(SoundType.HOVER);
  }, [playSound]);

  return {
    onClickSound: handleClick,
    onHoverSound: handleHover
  };
};

/**
 * Hook for game interaction sounds
 */
export const useGameSounds = () => {
  const { playSound } = useSound({
    enableGameSounds: true
  });

  const playPickupSound = useCallback(() => {
    playSound(SoundType.PICKUP);
  }, [playSound]);

  const playCorrectSound = useCallback(() => {
    playSound(SoundType.CORRECT);
  }, [playSound]);

  const playIncorrectSound = useCallback(() => {
    playSound(SoundType.INCORRECT);
  }, [playSound]);

  const playWinSound = useCallback(() => {
    playSound(SoundType.WIN);
  }, [playSound]);

  const playAchievementSound = useCallback(() => {
    playSound(SoundType.ACHIEVEMENT);
  }, [playSound]);

  return {
    playPickupSound,
    playCorrectSound,
    playIncorrectSound,
    playWinSound,
    playAchievementSound
  };
};

/**
 * Hook for sound settings management
 */
export const useSoundSettings = () => {
  const gameStore = useGameStore();
  const {
    settings,
    updateSoundSettings,
    toggleMute,
    startBackgroundMusic,
    stopBackgroundMusic
  } = gameStore;

  const { soundSettings } = settings;

  const setMasterVolume = useCallback((volume: number) => {
    updateSoundSettings({ masterVolume: Math.max(0, Math.min(1, volume)) });
  }, [updateSoundSettings]);

  const setEffectsVolume = useCallback((volume: number) => {
    updateSoundSettings({ effectsVolume: Math.max(0, Math.min(1, volume)) });
  }, [updateSoundSettings]);

  const setMusicVolume = useCallback((volume: number) => {
    updateSoundSettings({ musicVolume: Math.max(0, Math.min(1, volume)) });
  }, [updateSoundSettings]);

  const enableBackgroundMusic = useCallback((enabled: boolean) => {
    updateSoundSettings({ enableBackgroundMusic: enabled });
    if (enabled && !soundSettings.muted) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  }, [updateSoundSettings, soundSettings.muted, startBackgroundMusic, stopBackgroundMusic]);

  return {
    soundSettings,
    setMasterVolume,
    setEffectsVolume,
    setMusicVolume,
    enableBackgroundMusic,
    toggleMute,
    updateSoundSettings
  };
};

export default useSound;