/**
 * Sound System Initialization
 *
 * This module handles the initialization of the sound system for the California Puzzle Game.
 * It should be called during app startup to ensure proper audio context setup and preloading.
 */

import { soundManager, preloadSounds } from './soundManager';
import { useGameStore } from '../stores/gameStore';

/**
 * Initialize the sound system with the current game settings
 */
export const initializeSoundSystem = async (): Promise<void> => {
  try {
    console.log('🔊 Initializing sound system...');

    // Get current sound settings from the store
    const gameStore = useGameStore.getState();
    const { soundSettings } = gameStore.settings;

    // Apply current volume settings to the sound manager
    soundManager.setVolumeSettings({
      master: soundSettings.masterVolume,
      effects: soundSettings.effectsVolume,
      music: soundSettings.musicVolume,
      muted: soundSettings.muted
    });

    // Preload all sound effects for better performance
    await preloadSounds();

    // Start background music if enabled
    if (soundSettings.enableBackgroundMusic && !soundSettings.muted) {
      await soundManager.startBackgroundMusic();
    }

    console.log('✅ Sound system initialized successfully');

  } catch (error) {
    console.warn('⚠️ Sound system initialization failed:', error);
    console.log('🔇 Continuing with silent mode (Web Audio API fallbacks will still work)');
  }
};

/**
 * Set up audio context resume on user interaction
 * Many browsers require user interaction before audio can play
 */
export const setupAudioContextResume = (): void => {
  const resumeAudioContext = async () => {
    try {
      const gameStore = useGameStore.getState();
      const { soundSettings } = gameStore.settings;

      // Resume audio context if needed
      if (soundManager['audioContext']?.state === 'suspended') {
        await soundManager['audioContext'].resume();
        console.log('🔊 Audio context resumed after user interaction');
      }

      // Start background music if it's enabled and we're not muted
      if (soundSettings.enableBackgroundMusic && !soundSettings.muted) {
        soundManager.startBackgroundMusic();
      }

      // Remove event listeners after first interaction
      document.removeEventListener('click', resumeAudioContext);
      document.removeEventListener('keydown', resumeAudioContext);
      document.removeEventListener('touchstart', resumeAudioContext);

    } catch (error) {
      console.warn('Failed to resume audio context:', error);
    }
  };

  // Listen for user interactions
  document.addEventListener('click', resumeAudioContext, { once: true });
  document.addEventListener('keydown', resumeAudioContext, { once: true });
  document.addEventListener('touchstart', resumeAudioContext, { once: true });
};

/**
 * Clean up the sound system (call on app unmount)
 */
export const cleanupSoundSystem = (): void => {
  try {
    soundManager.dispose();
    console.log('🔇 Sound system cleaned up');
  } catch (error) {
    console.warn('Error during sound system cleanup:', error);
  }
};

/**
 * Check if the browser supports Web Audio API
 */
export const checkAudioSupport = (): {
  webAudioAPI: boolean;
  audioElement: boolean;
  recommendations: string[];
} => {
  const support = {
    webAudioAPI: false,
    audioElement: false,
    recommendations: [] as string[]
  };

  // Check Web Audio API support
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    support.webAudioAPI = !!AudioContext;
  } catch (e) {
    support.webAudioAPI = false;
  }

  // Check HTML5 Audio support
  try {
    support.audioElement = !!new Audio().canPlayType;
  } catch (e) {
    support.audioElement = false;
  }

  // Provide recommendations
  if (!support.webAudioAPI && !support.audioElement) {
    support.recommendations.push('Your browser does not support audio playback');
    support.recommendations.push('Consider updating to a modern browser');
  } else if (!support.webAudioAPI) {
    support.recommendations.push('Web Audio API not supported - using HTML5 Audio fallback');
    support.recommendations.push('Some advanced audio features may not be available');
  } else if (!support.audioElement) {
    support.recommendations.push('HTML5 Audio not supported - using Web Audio API only');
    support.recommendations.push('Background music may not be available');
  }

  return support;
};

/**
 * Get audio context info for debugging
 */
export const getAudioInfo = (): {
  contextState: string;
  sampleRate: number;
  baseLatency?: number;
  outputLatency?: number;
} | null => {
  try {
    const audioContext = soundManager['audioContext'];
    if (!audioContext) return null;

    return {
      contextState: audioContext.state,
      sampleRate: audioContext.sampleRate,
      baseLatency: audioContext.baseLatency,
      outputLatency: audioContext.outputLatency
    };
  } catch (error) {
    console.warn('Failed to get audio context info:', error);
    return null;
  }
};

/**
 * Test all sound effects (useful for debugging)
 */
export const testAllSounds = async (): Promise<void> => {
  const { playSound, SoundType } = await import('./soundManager');

  console.log('🎵 Testing all sounds...');

  const soundTypes = Object.values(SoundType);

  for (let i = 0; i < soundTypes.length; i++) {
    const soundType = soundTypes[i];

    if (soundType === SoundType.BACKGROUND_MUSIC) {
      continue; // Skip background music in test
    }

    console.log(`Playing: ${soundType}`);
    await playSound(soundType);

    // Wait between sounds
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('✅ Sound test complete');
};

/**
 * Auto-initialize sound system for React apps
 * Call this in your main App component's useEffect
 */
export const useInitializeSound = () => {
  const initializeSound = async () => {
    await initializeSoundSystem();
    setupAudioContextResume();
  };

  return { initializeSound, cleanupSoundSystem };
};

export default {
  initializeSoundSystem,
  setupAudioContextResume,
  cleanupSoundSystem,
  checkAudioSupport,
  getAudioInfo,
  testAllSounds,
  useInitializeSound
};