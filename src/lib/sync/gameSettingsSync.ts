/**
 * Game Settings Sync Module
 *
 * Purpose: Synchronize game settings between local store and Supabase
 * Features: Real-time sync, conflict resolution, optimistic updates
 *
 * Usage:
 *   import { gameSettingsSync } from '@/lib/sync/gameSettingsSync';
 *   await gameSettingsSync.initialize(userId);
 *   await gameSettingsSync.sync();
 *
 * Last updated: 2025-10-11
 */

import { syncManager } from '../syncManager';
import { supabase, Database } from '../supabase';
import { logger } from '../../utils/logger';
import { useGameStore } from '../../stores/gameStore';
import type { GameSettings, DifficultyLevel, CaliforniaRegion } from '../../types';

type GameSettingsRow = Database['public']['Tables']['game_settings']['Row'];
type GameSettingsInsert = Database['public']['Tables']['game_settings']['Insert'];

/**
 * Game Settings Sync Class
 *
 * CONCEPT: Bidirectional settings synchronization
 * WHY: Keep settings consistent across devices
 * PATTERN: Sync module with real-time updates
 */
class GameSettingsSync {
  private userId: string | null = null;
  private isSubscribed = false;

  /**
   * Initialize settings sync
   *
   * CONCEPT: Setup sync for user
   * WHY: Prepare for synchronization
   * PATTERN: Initialization with subscription
   */
  async initialize(userId: string): Promise<void> {
    logger.info('[GameSettingsSync] Initializing...', { userId });

    this.userId = userId;

    // Load settings from server
    await this.loadFromServer();

    // Subscribe to real-time updates
    this.subscribeToUpdates();

    logger.info('[GameSettingsSync] Initialized successfully');
  }

  /**
   * Shutdown settings sync
   *
   * CONCEPT: Clean up resources
   * WHY: Prevent memory leaks
   * PATTERN: Cleanup method
   */
  async shutdown(): Promise<void> {
    logger.info('[GameSettingsSync] Shutting down...');

    if (this.isSubscribed) {
      await syncManager.unsubscribeFromTable('game_settings');
      this.isSubscribed = false;
    }

    this.userId = null;

    logger.info('[GameSettingsSync] Shutdown complete');
  }

  /**
   * Sync settings to server
   *
   * CONCEPT: Push local settings to server
   * WHY: Persist user preferences
   * PATTERN: Optimistic update with queue
   */
  async sync(settings?: GameSettings): Promise<void> {
    if (!this.userId) {
      logger.error('[GameSettingsSync] Cannot sync without user ID');
      return;
    }

    const currentSettings = settings || useGameStore.getState().settings;

    logger.info('[GameSettingsSync] Syncing settings to server...');

    // Check if settings record exists
    const { data: existingSettings, error: fetchError } = await supabase
      .from('game_settings')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      logger.error('[GameSettingsSync] Failed to fetch settings:', fetchError);
      return;
    }

    const settingsData = this.serializeSettings(currentSettings);

    if (existingSettings) {
      const settingsRow = existingSettings as GameSettingsRow;
      // Update existing settings
      await syncManager.queueOperation({
        type: 'update',
        table: 'game_settings',
        recordId: settingsRow.id,
        data: {
          ...settingsData,
          updated_at: new Date().toISOString(),
        },
        previousData: settingsRow as Record<string, unknown>,
      });
    } else {
      // Insert new settings
      await syncManager.queueOperation({
        type: 'insert',
        table: 'game_settings',
        data: {
          user_id: this.userId,
          ...settingsData,
        },
      });
    }

    logger.info('[GameSettingsSync] Settings queued for sync');
  }

  /**
   * Load settings from server
   *
   * CONCEPT: Pull server settings to local
   * WHY: Restore settings on new device
   * PATTERN: Fetch with merge
   */
  private async loadFromServer(): Promise<void> {
    if (!this.userId) {
      logger.error('[GameSettingsSync] Cannot load without user ID');
      return;
    }

    logger.info('[GameSettingsSync] Loading settings from server...');

    const { data, error } = await supabase
      .from('game_settings')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('[GameSettingsSync] No settings found on server, will create on first sync');
      } else {
        logger.error('[GameSettingsSync] Failed to load settings:', error);
      }
      return;
    }

    if (data) {
      logger.info('[GameSettingsSync] Settings loaded from server');

      // Deserialize and update local store
      const settings = this.deserializeSettings(data);
      useGameStore.getState().updateSettings(settings);
    }
  }

  /**
   * Subscribe to real-time updates
   *
   * CONCEPT: Listen for server changes
   * WHY: Keep settings in sync across devices
   * PATTERN: Real-time subscription
   */
  private subscribeToUpdates(): void {
    if (this.isSubscribed) {
      logger.warn('[GameSettingsSync] Already subscribed');
      return;
    }

    logger.info('[GameSettingsSync] Subscribing to real-time updates...');

    syncManager.subscribeToTable('game_settings', async (payload) => {
      logger.info('[GameSettingsSync] Real-time update received:', payload.eventType);

      if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
        const serverSettings = payload.new as GameSettingsRow;

        if (serverSettings.user_id === this.userId) {
          // Update local store with server data
          const settings = this.deserializeSettings(serverSettings);
          useGameStore.getState().updateSettings(settings);

          logger.info('[GameSettingsSync] Local settings updated from server');
        }
      }
    });

    this.isSubscribed = true;
  }

  /**
   * Serialize settings for database
   *
   * CONCEPT: Convert store format to DB format
   * WHY: Database schema compatibility
   * PATTERN: Data transformation
   */
  private serializeSettings(settings: GameSettings): Partial<GameSettingsInsert> {
    return {
      difficulty: settings.difficulty,
      region: settings.region,
      show_hints: settings.showHints,
      enable_timer: settings.enableTimer,
      sound_enabled: settings.soundEnabled,
      animations_enabled: settings.animationsEnabled,
      auto_advance: settings.autoAdvance,
      // Sound settings
      master_volume: settings.soundSettings.masterVolume,
      effects_volume: settings.soundSettings.effectsVolume,
      music_volume: settings.soundSettings.musicVolume,
      muted: settings.soundSettings.muted,
      enable_background_music: settings.soundSettings.enableBackgroundMusic,
      enable_click_sounds: settings.soundSettings.enableClickSounds,
      enable_game_sounds: settings.soundSettings.enableGameSounds,
      enable_achievement_sounds: settings.soundSettings.enableAchievementSounds,
      // Hint settings
      max_hints_per_level: settings.hintSettings.maxHintsPerLevel,
      hint_cooldown_ms: settings.hintSettings.hintCooldownMs,
      score_penalty_per_hint: settings.hintSettings.scorePenaltyPerHint,
      free_hints_allowed: settings.hintSettings.freeHintsAllowed,
      auto_suggest_threshold: settings.hintSettings.autoSuggestThreshold,
      enable_visual_indicators: settings.hintSettings.enableVisualIndicators,
      enable_educational_hints: settings.hintSettings.enableEducationalHints,
    };
  }

  /**
   * Deserialize settings from database
   *
   * CONCEPT: Convert DB format to store format
   * WHY: Application compatibility
   * PATTERN: Data transformation
   */
  private deserializeSettings(data: GameSettingsRow): GameSettings {
    return {
      difficulty: data.difficulty as DifficultyLevel,
      region: data.region as CaliforniaRegion,
      showHints: data.show_hints,
      enableTimer: data.enable_timer,
      soundEnabled: data.sound_enabled,
      animationsEnabled: data.animations_enabled,
      autoAdvance: data.auto_advance,
      soundSettings: {
        masterVolume: data.master_volume,
        effectsVolume: data.effects_volume,
        musicVolume: data.music_volume,
        muted: data.muted,
        enableBackgroundMusic: data.enable_background_music,
        enableClickSounds: data.enable_click_sounds,
        enableGameSounds: data.enable_game_sounds,
        enableAchievementSounds: data.enable_achievement_sounds,
      },
      hintSettings: {
        maxHintsPerLevel: data.max_hints_per_level,
        hintCooldownMs: data.hint_cooldown_ms,
        scorePenaltyPerHint: data.score_penalty_per_hint,
        freeHintsAllowed: data.free_hints_allowed,
        autoSuggestThreshold: data.auto_suggest_threshold,
        enableVisualIndicators: data.enable_visual_indicators,
        enableEducationalHints: data.enable_educational_hints,
      },
    };
  }
}

// Export singleton instance
export const gameSettingsSync = new GameSettingsSync();
