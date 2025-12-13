/**
 * Game Stats Sync Module
 *
 * Purpose: Synchronize game statistics between local store and Supabase
 * Features: Merge strategy, real-time sync, aggregate updates
 *
 * Usage:
 *   import { gameStatsSync } from '@/lib/sync/gameStatsSync';
 *   await gameStatsSync.initialize(userId);
 *   await gameStatsSync.sync();
 *
 * Last updated: 2025-10-11
 */

import { syncManager } from '../syncManager';
import { supabase, Database } from '../supabase';
import { logger } from '../../utils/logger';
// Migrated from monolithic gameStore to domain stores
import { useScoringStore } from '../../stores/scoringStore';
import type { GameStats } from '../../types';

type UserProgressRow = Database['public']['Tables']['user_progress']['Row'];
type UserProgressInsert = Database['public']['Tables']['user_progress']['Insert'];

/**
 * Game Stats Sync Class
 *
 * CONCEPT: Statistics synchronization with merge strategy
 * WHY: Preserve stats from multiple devices, always use max values
 * PATTERN: Sync module with smart merging
 */
class GameStatsSync {
  private userId: string | null = null;
  private isSubscribed = false;

  /**
   * Initialize stats sync
   *
   * CONCEPT: Setup sync for user
   * WHY: Prepare for synchronization
   * PATTERN: Initialization with subscription
   */
  async initialize(userId: string): Promise<void> {
    logger.info('[GameStatsSync] Initializing...', { userId });

    this.userId = userId;

    // Load stats from server
    await this.loadFromServer();

    // Subscribe to real-time updates
    this.subscribeToUpdates();

    logger.info('[GameStatsSync] Initialized successfully');
  }

  /**
   * Shutdown stats sync
   *
   * CONCEPT: Clean up resources
   * WHY: Prevent memory leaks
   * PATTERN: Cleanup method
   */
  async shutdown(): Promise<void> {
    logger.info('[GameStatsSync] Shutting down...');

    if (this.isSubscribed) {
      await syncManager.unsubscribeFromTable('user_progress');
      this.isSubscribed = false;
    }

    this.userId = null;

    logger.info('[GameStatsSync] Shutdown complete');
  }

  /**
   * Sync stats to server
   *
   * CONCEPT: Push local stats to server with merge
   * WHY: Preserve best stats from both sources
   * PATTERN: Merge strategy with additive fields
   */
  async sync(stats?: GameStats): Promise<void> {
    if (!this.userId) {
      logger.error('[GameStatsSync] Cannot sync without user ID');
      return;
    }

    const currentStats = stats || useScoringStore.getState().stats;

    logger.info('[GameStatsSync] Syncing stats to server...');

    // Check if progress record exists
    const { data, error: fetchError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      logger.error('[GameStatsSync] Failed to fetch progress:', fetchError);
      return;
    }

    const existingProgress = data as UserProgressRow | null;

    if (existingProgress) {
      // Merge stats (use maximum values)
      const mergedStats = this.mergeStats(currentStats, this.deserializeStats(existingProgress));
      const statsData = this.serializeStats(mergedStats);

      await syncManager.queueOperation({
        type: 'update',
        table: 'user_progress',
        recordId: String(existingProgress.id),
        data: {
          ...statsData,
          updated_at: new Date().toISOString(),
        },
        previousData: existingProgress as Record<string, unknown>,
      });

      // Note: updatePlacementStats is handled by useScoringStore, no need to override
      // The store coordinator handles achievement checking via subscriptions
    } else {
      // Insert new progress
      const statsData = this.serializeStats(currentStats);

      await syncManager.queueOperation({
        type: 'insert',
        table: 'user_progress',
        data: {
          user_id: this.userId,
          ...statsData,
        },
      });
    }

    logger.info('[GameStatsSync] Stats queued for sync');
  }

  /**
   * Record a game session
   *
   * CONCEPT: Save completed game to history
   * WHY: Track individual game performance
   * PATTERN: Insert operation
   */
  async recordGameSession(sessionData: {
    score: number;
    difficulty: string;
    region: string;
    timeElapsed: number;
    accuracy: number;
  }): Promise<void> {
    if (!this.userId) {
      logger.error('[GameStatsSync] Cannot record session without user ID');
      return;
    }

    logger.info('[GameStatsSync] Recording game session...');

    await syncManager.queueOperation({
      type: 'insert',
      table: 'game_sessions',
      data: {
        user_id: this.userId,
        score: sessionData.score,
        difficulty: sessionData.difficulty,
        region: sessionData.region,
        completed_at: new Date().toISOString(),
        time_elapsed: sessionData.timeElapsed,
        accuracy: sessionData.accuracy,
      },
    });

    logger.info('[GameStatsSync] Session queued for recording');
  }

  /**
   * Load stats from server
   *
   * CONCEPT: Pull server stats to local
   * WHY: Restore stats on new device
   * PATTERN: Fetch with merge
   */
  private async loadFromServer(): Promise<void> {
    if (!this.userId) {
      logger.error('[GameStatsSync] Cannot load without user ID');
      return;
    }

    logger.info('[GameStatsSync] Loading stats from server...');

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('[GameStatsSync] No progress found on server, will create on first sync');
      } else {
        logger.error('[GameStatsSync] Failed to load progress:', error);
      }
      return;
    }

    if (data) {
      logger.info('[GameStatsSync] Stats loaded from server');

      // Deserialize and merge with local store
      const serverStats = this.deserializeStats(data);
      const localStats = useScoringStore.getState().stats;
      const mergedStats = this.mergeStats(localStats, serverStats);

      // Update stats via store action (setState not available directly)
      useScoringStore.setState({ stats: mergedStats });
    }
  }

  /**
   * Subscribe to real-time updates
   *
   * CONCEPT: Listen for server changes
   * WHY: Keep stats in sync across devices
   * PATTERN: Real-time subscription
   */
  private subscribeToUpdates(): void {
    if (this.isSubscribed) {
      logger.warn('[GameStatsSync] Already subscribed');
      return;
    }

    logger.info('[GameStatsSync] Subscribing to real-time updates...');

    syncManager.subscribeToTable('user_progress', async (payload) => {
      logger.info('[GameStatsSync] Real-time update received:', payload.eventType);

      if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
        const serverProgress = payload.new as UserProgressRow;

        if (serverProgress.user_id === this.userId) {
          // Merge with local stats
          const serverStats = this.deserializeStats(serverProgress);
          const localStats = useScoringStore.getState().stats;
          const mergedStats = this.mergeStats(localStats, serverStats);

          // Update stats via store action (setState not available directly)
          useScoringStore.setState({ stats: mergedStats });

          logger.info('[GameStatsSync] Local stats updated from server');
        }
      }
    });

    this.isSubscribed = true;
  }

  /**
   * Merge stats from two sources
   *
   * CONCEPT: Combine stats using max values
   * WHY: Never lose progress
   * PATTERN: Additive merge strategy
   */
  private mergeStats(local: GameStats, server: GameStats): GameStats {
    return {
      totalGamesPlayed: Math.max(local.totalGamesPlayed, server.totalGamesPlayed),
      totalScore: Math.max(local.totalScore, server.totalScore),
      bestScore: Math.max(local.bestScore, server.bestScore),
      averageAccuracy: Math.max(local.averageAccuracy, server.averageAccuracy),
      totalPlayTime: Math.max(local.totalPlayTime, server.totalPlayTime),
      favoriteDifficulty: local.favoriteDifficulty || server.favoriteDifficulty,
      favoriteRegion: local.favoriteRegion || server.favoriteRegion,
      countiesLearned: new Set([...local.countiesLearned, ...server.countiesLearned]),
      perfectPlacements: Math.max(local.perfectPlacements, server.perfectPlacements),
      longestStreak: Math.max(local.longestStreak, server.longestStreak),
    };
  }

  /**
   * Serialize stats for database
   *
   * CONCEPT: Convert store format to DB format
   * WHY: Database schema compatibility
   * PATTERN: Data transformation
   */
  private serializeStats(stats: GameStats): Partial<UserProgressInsert> {
    return {
      total_score: stats.totalScore,
      total_games: stats.totalGamesPlayed,
      best_score: stats.bestScore,
      achievements: [], // Will be handled by achievementSync
    };
  }

  /**
   * Deserialize stats from database
   *
   * CONCEPT: Convert DB format to store format
   * WHY: Application compatibility
   * PATTERN: Data transformation
   */
  private deserializeStats(data: UserProgressRow): GameStats {
    const state = useScoringStore.getState();

    return {
      totalGamesPlayed: data.total_games,
      totalScore: data.total_score,
      bestScore: data.best_score,
      averageAccuracy: state.stats.averageAccuracy, // Not stored in DB yet
      totalPlayTime: state.stats.totalPlayTime, // Not stored in DB yet
      favoriteDifficulty: state.stats.favoriteDifficulty, // Not stored in DB yet
      favoriteRegion: state.stats.favoriteRegion, // Not stored in DB yet
      countiesLearned: state.stats.countiesLearned, // Not stored in DB yet
      perfectPlacements: state.stats.perfectPlacements, // Not stored in DB yet
      longestStreak: state.stats.longestStreak, // Not stored in DB yet
    };
  }
}

// Export singleton instance
export const gameStatsSync = new GameStatsSync();
