/**
 * Sound Manager for California Puzzle Game
 *
 * A singleton class that manages all game audio including:
 * - Sound effect loading and caching
 * - Volume controls (master, effects, music)
 * - Web Audio API tone generation for placeholders
 * - Sound sprite support for multiple effects
 */

export enum SoundType {
  PICKUP = 'pickup',
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  WIN = 'win',
  CLICK = 'click',
  HOVER = 'hover',
  ACHIEVEMENT = 'achievement',
  BACKGROUND_MUSIC = 'background_music'
}

export interface SoundConfig {
  type: SoundType;
  volume: number;
  loop: boolean;
  fadeDuration?: number;
  placeholder?: {
    frequency: number;
    duration: number;
    waveType: OscillatorType;
  };
}

export interface VolumeSettings {
  master: number;
  effects: number;
  music: number;
  muted: boolean;
}

class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private soundCache: Map<SoundType, HTMLAudioElement> = new Map();
  private volumeSettings: VolumeSettings = {
    master: 0.7,
    effects: 0.8,
    music: 0.5,
    muted: false
  };
  private isInitialized = false;
  private backgroundMusic: HTMLAudioElement | null = null;

  // Sound configurations with placeholder tone settings
  private readonly soundConfigs: Record<SoundType, SoundConfig> = {
    [SoundType.PICKUP]: {
      type: SoundType.PICKUP,
      volume: 0.6,
      loop: false,
      placeholder: {
        frequency: 440,
        duration: 0.2,
        waveType: 'sine'
      }
    },
    [SoundType.CORRECT]: {
      type: SoundType.CORRECT,
      volume: 0.8,
      loop: false,
      placeholder: {
        frequency: 660,
        duration: 0.5,
        waveType: 'square'
      }
    },
    [SoundType.INCORRECT]: {
      type: SoundType.INCORRECT,
      volume: 0.7,
      loop: false,
      placeholder: {
        frequency: 220,
        duration: 0.3,
        waveType: 'sawtooth'
      }
    },
    [SoundType.WIN]: {
      type: SoundType.WIN,
      volume: 0.9,
      loop: false,
      placeholder: {
        frequency: 880,
        duration: 1.0,
        waveType: 'triangle'
      }
    },
    [SoundType.CLICK]: {
      type: SoundType.CLICK,
      volume: 0.4,
      loop: false,
      placeholder: {
        frequency: 800,
        duration: 0.1,
        waveType: 'square'
      }
    },
    [SoundType.HOVER]: {
      type: SoundType.HOVER,
      volume: 0.3,
      loop: false,
      placeholder: {
        frequency: 600,
        duration: 0.15,
        waveType: 'sine'
      }
    },
    [SoundType.ACHIEVEMENT]: {
      type: SoundType.ACHIEVEMENT,
      volume: 0.8,
      loop: false,
      placeholder: {
        frequency: 1320,
        duration: 0.8,
        waveType: 'triangle'
      }
    },
    [SoundType.BACKGROUND_MUSIC]: {
      type: SoundType.BACKGROUND_MUSIC,
      volume: 0.3,
      loop: true,
      fadeDuration: 2000,
      placeholder: {
        frequency: 440,
        duration: 60,
        waveType: 'sine'
      }
    }
  };

  // File paths for actual sound files (when available)
  // Use proper base path for GitHub Pages deployment
  private getBasePath(): string {
    if (typeof window !== 'undefined') {
      return window.location.hostname === 'localhost'
        ? ''
        : '/california_puzzle_game';
    }
    return '';
  }

  private soundPaths: Record<SoundType, string> = {} as Record<SoundType, string>;

  private constructor() {
    // Initialize sound paths with proper base path
    const basePath = this.getBasePath();
    this.soundPaths = {
      [SoundType.PICKUP]: `${basePath}/sounds/pickup.mp3`,
      [SoundType.CORRECT]: `${basePath}/sounds/correct.mp3`,
      [SoundType.INCORRECT]: `${basePath}/sounds/incorrect.mp3`,
      [SoundType.WIN]: `${basePath}/sounds/win.mp3`,
      [SoundType.CLICK]: `${basePath}/sounds/click.mp3`,
      [SoundType.HOVER]: `${basePath}/sounds/hover.mp3`,
      [SoundType.ACHIEVEMENT]: `${basePath}/sounds/achievement.mp3`,
      [SoundType.BACKGROUND_MUSIC]: `${basePath}/sounds/background.mp3`
    };

    this.initializeAudioContext();
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Initialize the Audio Context (required for Web Audio API)
   */
  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
      console.log('🔊 Audio context initialized successfully');
    } catch (error) {
      console.warn('Audio context initialization failed:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Load a sound file or create a placeholder tone
   */
  private async loadSound(soundType: SoundType): Promise<HTMLAudioElement | null> {
    const config = this.soundConfigs[soundType];
    const soundPath = this.soundPaths[soundType];

    try {
      // Try to load the actual sound file first
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = this.calculateVolume(config.volume, 'effects');
      audio.loop = config.loop;

      // Create a promise to handle loading
      const loadPromise = new Promise<void>((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => resolve());
        audio.addEventListener('error', () => reject(new Error('Failed to load audio file')));
      });

      audio.src = soundPath;

      // Wait for loading with timeout
      await Promise.race([
        loadPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Load timeout')), 2000))
      ]);

      console.log(`Loaded sound file: ${soundPath}`);
      return audio;

    } catch (error) {
      // Fallback to generated tones if sound files don't exist
      // Silent fallback - no need to log every time
      return this.createPlaceholderAudio(config);
    }
  }

  /**
   * Create a placeholder audio element using Web Audio API tones
   */
  private createPlaceholderAudio(config: SoundConfig): HTMLAudioElement | null {
    if (!this.audioContext || !config.placeholder) {
      return null;
    }

    try {
      const { frequency, duration, waveType } = config.placeholder;

      // Create a simple tone using Web Audio API
      const sampleRate = this.audioContext.sampleRate;
      const length = sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      // Generate the waveform
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const omega = 2 * Math.PI * frequency * t;

        switch (waveType) {
          case 'sine':
            data[i] = Math.sin(omega) * 0.3;
            break;
          case 'square':
            data[i] = Math.sign(Math.sin(omega)) * 0.2;
            break;
          case 'sawtooth':
            data[i] = ((omega % (2 * Math.PI)) / Math.PI - 1) * 0.2;
            break;
          case 'triangle':
            data[i] = (2 / Math.PI) * Math.asin(Math.sin(omega)) * 0.2;
            break;
          default:
            data[i] = Math.sin(omega) * 0.3;
        }

        // Apply fade out to prevent clicks
        if (i > length * 0.8) {
          const fadeOut = 1 - (i - length * 0.8) / (length * 0.2);
          data[i] *= fadeOut;
        }
      }

      // Convert buffer to audio element using blob
      const audioBuffer = this.audioContext.createBufferSource();
      audioBuffer.buffer = buffer;

      // Create a MediaStreamDestination to capture the audio
      const destination = this.audioContext.createMediaStreamDestination();
      audioBuffer.connect(destination);

      // Create audio element from stream
      const audio = new Audio();
      audio.srcObject = destination.stream;
      audio.volume = this.calculateVolume(config.volume, 'effects');
      audio.loop = config.loop;

      // Placeholder tone created successfully
      return audio;

    } catch (error) {
      console.error('Failed to create placeholder audio:', error);
      return null;
    }
  }

  /**
   * Calculate the final volume based on settings
   */
  private calculateVolume(baseVolume: number, category: 'effects' | 'music'): number {
    if (this.volumeSettings.muted) return 0;

    const categoryVolume = category === 'effects'
      ? this.volumeSettings.effects
      : this.volumeSettings.music;

    return baseVolume * categoryVolume * this.volumeSettings.master;
  }

  /**
   * Play a sound effect
   */
  public async playSound(soundType: SoundType): Promise<void> {
    // Always try to initialize if not already done
    if (!this.isInitialized) {
      await this.initializeAudioContext();
    }

    if (this.volumeSettings.muted) {
      return;
    }

    try {
      // Get or load the sound
      let audio = this.soundCache.get(soundType);
      if (!audio) {
        audio = await this.loadSound(soundType);
        if (audio) {
          this.soundCache.set(soundType, audio);
        }
      }

      if (!audio) {
        console.warn(`No audio available for sound type: ${soundType}`);
        return;
      }

      // Reset the audio to beginning and play
      audio.currentTime = 0;
      audio.volume = this.calculateVolume(
        this.soundConfigs[soundType].volume,
        soundType === SoundType.BACKGROUND_MUSIC ? 'music' : 'effects'
      );

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }

    } catch (error) {
      console.error(`Failed to play sound ${soundType}:`, error);
    }
  }

  /**
   * Start background music with fade in
   */
  public async startBackgroundMusic(): Promise<void> {
    if (this.backgroundMusic && !this.backgroundMusic.paused) {
      return; // Already playing
    }

    try {
      if (!this.backgroundMusic) {
        this.backgroundMusic = await this.loadSound(SoundType.BACKGROUND_MUSIC);
      }

      if (!this.backgroundMusic) {
        console.warn('No background music available');
        return;
      }

      this.backgroundMusic.volume = 0;
      this.backgroundMusic.loop = true;

      const playPromise = this.backgroundMusic.play();
      if (playPromise !== undefined) {
        await playPromise;
      }

      // Fade in
      this.fadeVolume(this.backgroundMusic, 0, this.calculateVolume(
        this.soundConfigs[SoundType.BACKGROUND_MUSIC].volume,
        'music'
      ), this.soundConfigs[SoundType.BACKGROUND_MUSIC].fadeDuration || 2000);

    } catch (error) {
      console.error('Failed to start background music:', error);
    }
  }

  /**
   * Stop background music with fade out
   */
  public async stopBackgroundMusic(): Promise<void> {
    if (!this.backgroundMusic || this.backgroundMusic.paused) {
      return;
    }

    const fadeDuration = this.soundConfigs[SoundType.BACKGROUND_MUSIC].fadeDuration || 2000;

    await this.fadeVolume(this.backgroundMusic, this.backgroundMusic.volume, 0, fadeDuration);
    this.backgroundMusic.pause();
    this.backgroundMusic.currentTime = 0;
  }

  /**
   * Fade audio volume over time
   */
  private async fadeVolume(
    audio: HTMLAudioElement,
    startVolume: number,
    endVolume: number,
    duration: number
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const startTime = Date.now();
      const volumeDiff = endVolume - startVolume;

      const updateVolume = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        audio.volume = startVolume + (volumeDiff * progress);

        if (progress < 1) {
          requestAnimationFrame(updateVolume);
        } else {
          resolve();
        }
      };

      updateVolume();
    });
  }

  /**
   * Update volume settings
   */
  public setVolumeSettings(settings: Partial<VolumeSettings>): void {
    this.volumeSettings = { ...this.volumeSettings, ...settings };

    // Update all cached audio volumes
    this.soundCache.forEach((audio, soundType) => {
      const config = this.soundConfigs[soundType];
      audio.volume = this.calculateVolume(
        config.volume,
        soundType === SoundType.BACKGROUND_MUSIC ? 'music' : 'effects'
      );
    });

    // Update background music volume
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.calculateVolume(
        this.soundConfigs[SoundType.BACKGROUND_MUSIC].volume,
        'music'
      );
    }
  }

  /**
   * Get current volume settings
   */
  public getVolumeSettings(): VolumeSettings {
    return { ...this.volumeSettings };
  }

  /**
   * Mute/unmute all audio
   */
  public setMuted(muted: boolean): void {
    this.setVolumeSettings({ muted });

    if (muted && this.backgroundMusic && !this.backgroundMusic.paused) {
      this.backgroundMusic.pause();
    } else if (!muted && this.backgroundMusic && this.backgroundMusic.paused) {
      this.startBackgroundMusic();
    }
  }

  /**
   * Check if sounds are muted
   */
  public isMuted(): boolean {
    return this.volumeSettings.muted;
  }

  /**
   * Preload all sounds for better performance
   */
  public async preloadSounds(): Promise<void> {
    const soundTypes = Object.values(SoundType).filter(type => type !== SoundType.BACKGROUND_MUSIC);

    const loadPromises = soundTypes.map(async (soundType) => {
      try {
        const audio = await this.loadSound(soundType);
        if (audio) {
          this.soundCache.set(soundType, audio);
        }
      } catch (error) {
        console.warn(`Failed to preload sound ${soundType}:`, error);
      }
    });

    await Promise.allSettled(loadPromises);
    console.log('Sound preloading completed');
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.soundCache.forEach((audio) => {
      audio.pause();
      audio.src = '';
    });
    this.soundCache.clear();

    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.src = '';
      this.backgroundMusic = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Export singleton instance
export const soundManager = SoundManager.getInstance();

// Convenience functions for easy integration
export const playSound = (soundType: SoundType) => soundManager.playSound(soundType);
export const startBackgroundMusic = () => soundManager.startBackgroundMusic();
export const stopBackgroundMusic = () => soundManager.stopBackgroundMusic();
export const setVolume = (settings: Partial<VolumeSettings>) => soundManager.setVolumeSettings(settings);
export const toggleMute = () => soundManager.setMuted(!soundManager.isMuted());
export const preloadSounds = () => soundManager.preloadSounds();

export default soundManager;