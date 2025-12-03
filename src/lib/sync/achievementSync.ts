/**
 * Achievement Sync Module
 *
 * Purpose: Synchronize achievements between local store and Supabase
 * Features: Real-time sync, unlock tracking, progress updates
 *
 * Usage:
 *   import { achievementSync } from '@/lib/sync/achievementSync';
 *   await achievementSync.initialize(userId);
 *   await achievementSync.syncAchievement(achievement);
 *
 * Last updated: 2025-10-11
 */

import { syncManager } from '../syncManager';
import { supabase, Database } from '../supabase';
import { logger } from '../../utils/logger';
// Migrated from monolithic gameStore to domain stores
import { useAchievementStore } from '../../stores/achievementStore';
import type { Achievement } from '../../types';

type UserProgressRow = Database['public']['Tables']['user_progress']['Row'];

/**
 * Achievement Sync Class
 *
 * CONCEPT: Achievement synchronization with unlock tracking
 * WHY: Preserve achievements across devices
 * PATTERN: Sync module with merge strategy
 */
class AchievementSync {
  private userId: string | null = null;
  private isSubscribed = false;

  /**
   * Initialize achievement sync
   *
   * CONCEPT: Setup sync for user
   * WHY: Prepare for synchronization
   * PATTERN: Initialization with subscription
   */
  async initialize(userId: string): Promise<void> {
    logger.info('[AchievementSync] Initializing...', { userId });

    this.userId = userId;

    // Load achievements from server
    await this.loadFromServer();

    // Subscribe to real-time updates
    this.subscribeToUpdates();

    logger.info('[AchievementSync] Initialized successfully');
  }

  /**
   * Shutdown achievement sync
   *
   * CONCEPT: Clean up resources
   * WHY: Prevent memory leaks
   * PATTERN: Cleanup method
   */
  async shutdown(): Promise<void> {
    logger.info('[AchievementSync] Shutting down...');

    if (this.isSubscribed) {
      await syncManager.unsubscribeFromTable('user_progress');
      this.isSubscribed = false;
    }

    this.userId = null;

    logger.info('[AchievementSync] Shutdown complete');
  }

  /**
   * Sync all achievements
   *
   * CONCEPT: Push local achievements to server
   * WHY: Persist achievement progress
   * PATTERN: Batch update with merge
   */
  async syncAll(): Promise<void> {
    if (!this.userId) {
      logger.error('[AchievementSync] Cannot sync without user ID');
      return;
    }

    const currentAchievements = useAchievementStore.getState().achievements;

    logger.info('[AchievementSync] Syncing all achievements...');

    await this.updateAchievementsOnServer(currentAchievements);

    logger.info('[AchievementSync] All achievements synced');
  }

  /**
   * Sync a single achievement
   *
   * CONCEPT: Push one achievement update
   * WHY: Immediate sync on unlock
   * PATTERN: Single update operation
   */
  async syncAchievement(achievement: Achievement): Promise<void> {
    if (!this.userId) {
      logger.error('[AchievementSync] Cannot sync without user ID');
      return;
    }

    logger.info('[AchievementSync] Syncing achievement:', achievement.id);

    const currentAchievements = useAchievementStore.getState().achievements;
    await this.updateAchievementsOnServer(currentAchievements);

    logger.info('[AchievementSync] Achievement synced');
  }

  /**
   * Load achievements from server
   *
   * CONCEPT: Pull server achievements to local
   * WHY: Restore achievements on new device
   * PATTERN: Fetch with merge
   */
  private async loadFromServer(): Promise<void> {
    if (!this.userId) {
      logger.error('[AchievementSync] Cannot load without user ID');
      return;
    }

    logger.info('[AchievementSync] Loading achievements from server...');

    const { data, error } = await supabase
      .from('user_progress')
      .select('achievements')
      .eq('user_id', this.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('[AchievementSync] No progress found on server');
      } else {
        logger.error('[AchievementSync] Failed to load achievements:', error);
      }
      return;
    }

    if (data) {
      const progressData = data as UserProgressRow;
      if (progressData.achievements) {
        logger.info('[AchievementSync] Achievements loaded from server');

        // Merge with local achievements
        const serverAchievementIds = new Set(progressData.achievements);
        const localAchievements = useAchievementStore.getState().achievements;

        const mergedAchievements = localAchievements.map((achievement) => {
          if (serverAchievementIds.has(achievement.id) && !achievement.isUnlocked) {
            return {
              ...achievement,
              isUnlocked: true,
              progress: 1,
            };
          }
          return achievement;
        });

        useAchievementStore.setState({ achievements: mergedAchievements });
      }
    }
  }

  /**
   * Subscribe to real-time updates
   *
   * CONCEPT: Listen for server changes
   * WHY: Keep achievements in sync across devices
   * PATTERN: Real-time subscription
   */
  private subscribeToUpdates(): void {
    if (this.isSubscribed) {
      logger.warn('[AchievementSync] Already subscribed');
      return;
    }

    logger.info('[AchievementSync] Subscribing to real-time updates...');

    syncManager.subscribeToTable('user_progress', async (payload) => {
      logger.info('[AchievementSync] Real-time update received:', payload.eventType);

      if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
        const serverProgress = payload.new as UserProgressRow;

        if (serverProgress.user_id === this.userId && serverProgress.achievements) {
          // Merge with local achievements
          const serverAchievementIds = new Set(serverProgress.achievements);
          const localAchievements = useAchievementStore.getState().achievements;

          const mergedAchievements = localAchievements.map((achievement) => {
            if (serverAchievementIds.has(achievement.id) && !achievement.isUnlocked) {
              return {
                ...achievement,
                isUnlocked: true,
                progress: 1,
              };
            }
            return achievement;
          });

          useAchievementStore.setState({ achievements: mergedAchievements });

          logger.info('[AchievementSync] Local achievements updated from server');
        }
      }
    });

    this.isSubscribed = true;
  }

  /**
   * Update achievements on server
   *
   * CONCEPT: Push achievements to database
   * WHY: Persist achievement state
   * PATTERN: Array update operation
   */
  private async updateAchievementsOnServer(achievements: Achievement[]): Promise<void> {
    if (!this.userId) {
      logger.error('[AchievementSync] Cannot update without user ID');
      return;
    }

    // Get unlocked achievement IDs
    const unlockedIds = achievements.filter((a) => a.isUnlocked).map((a) => a.id);

    // Check if progress record exists
    const { data: existingProgress, error: fetchError } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', this.userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      logger.error('[AchievementSync] Failed to fetch progress:', fetchError);
      return;
    }

    if (existingProgress) {
      const progressData = existingProgress as UserProgressRow;
      await syncManager.queueOperation({
        type: 'update',
        table: 'user_progress',
        recordId: progressData.id,
        data: {
          achievements: unlockedIds,
          updated_at: new Date().toISOString(),
        },
      });
    } else {
      await syncManager.queueOperation({
        type: 'insert',
        table: 'user_progress',
        data: {
          user_id: this.userId,
          total_score: 0,
          total_games: 0,
          best_score: 0,
          achievements: unlockedIds,
        },
      });
    }
  }
}

// Export singleton instance
export const achievementSync = new AchievementSync();
