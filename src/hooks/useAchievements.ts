// Achievement tracking and notification hook

import { useState, useEffect, useCallback, useMemo } from 'react';
import { achievementSystem, AchievementDefinition, AchievementNotification, AchievementRarity } from '../utils/achievements';
import { storageManager } from '../utils/storage';
import { Achievement, GameStats, PlacementResult, DifficultyLevel, CaliforniaRegion } from '../types';

interface AchievementHookReturn {
  achievements: AchievementDefinition[];
  notifications: AchievementNotification[];
  unreadCount: number;
  totalPoints: number;
  completionPercentage: number;
  rarityStats: Record<AchievementRarity, { total: number; unlocked: number }>;
  recentUnlocks: AchievementDefinition[];
  
  // Actions
  checkAchievements: (stats: GameStats, placement?: PlacementResult, gameData?: any) => Promise<Achievement[]>;
  markNotificationAsRead: (index: number) => void;
  markAllNotificationsAsRead: () => void;
  getAchievementsByCategory: (category: string) => AchievementDefinition[];
  getAchievementsByRarity: (rarity: AchievementRarity) => AchievementDefinition[];
  refreshAchievements: () => void;
}

export function useAchievements(): AchievementHookReturn {
  const [achievements, setAchievements] = useState<AchievementDefinition[]>([]);
  const [notifications, setNotifications] = useState<AchievementNotification[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Load achievements and notifications
  const loadAchievements = useCallback(() => {
    const allAchievements = achievementSystem.getAllAchievements();
    const storedAchievements = storageManager.loadAchievements();
    
    // Merge stored progress with definitions
    const mergedAchievements = allAchievements.map(definition => {
      const stored = storedAchievements.find(a => a.id === definition.id);
      if (stored) {
        return {
          ...definition,
          progress: stored.progress,
          isUnlocked: stored.isUnlocked,
          unlockedAt: stored.unlockedAt
        };
      }
      return definition;
    });
    
    setAchievements(mergedAchievements);
    setNotifications(achievementSystem.getNotifications());
  }, []);

  // Check for new achievements
  const checkAchievements = useCallback(async (
    stats: GameStats,
    placement?: PlacementResult,
    gameData?: {
      difficulty: DifficultyLevel;
      region: CaliforniaRegion;
      timeElapsed: number;
      hintsUsed: number;
      mistakes: number;
      streak: number;
    }
  ): Promise<Achievement[]> => {
    try {
      // Update achievement system with current data
      const newlyUnlocked = achievementSystem.updateProgress(stats, placement, gameData);
      
      if (newlyUnlocked.length > 0) {
        // Save updated achievements
        const updatedAchievements = achievementSystem.getAllAchievements();
        storageManager.saveAchievements(updatedAchievements);
        
        // Refresh local state
        setAchievements(updatedAchievements);
        setNotifications(achievementSystem.getNotifications());
        setLastUpdate(Date.now());
        
        // Show notifications (this could trigger UI notifications)
        newlyUnlocked.forEach(achievement => {
          console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
        });
      }
      
      return newlyUnlocked;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }, []);

  const markNotificationAsRead = useCallback((index: number) => {
    achievementSystem.markNotificationAsRead(index);
    setNotifications(achievementSystem.getNotifications());
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    achievementSystem.markAllNotificationsAsRead();
    setNotifications(achievementSystem.getNotifications());
  }, []);

  const getAchievementsByCategory = useCallback((category: string) => {
    return achievements.filter(a => a.category === category);
  }, [achievements]);

  const getAchievementsByRarity = useCallback((rarity: AchievementRarity) => {
    return achievements.filter(a => a.rarity === rarity);
  }, [achievements]);

  const refreshAchievements = useCallback(() => {
    loadAchievements();
  }, [loadAchievements]);

  // Load on mount
  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  // Computed values
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const totalPoints = useMemo(() => {
    return achievements
      .filter(a => a.isUnlocked)
      .reduce((sum, a) => sum + a.points, 0);
  }, [achievements]);

  const completionPercentage = useMemo(() => {
    const total = achievements.length;
    const unlocked = achievements.filter(a => a.isUnlocked).length;
    return total > 0 ? (unlocked / total) * 100 : 0;
  }, [achievements]);

  const rarityStats = useMemo(() => {
    const stats = {
      [AchievementRarity.COMMON]: { total: 0, unlocked: 0 },
      [AchievementRarity.RARE]: { total: 0, unlocked: 0 },
      [AchievementRarity.EPIC]: { total: 0, unlocked: 0 },
      [AchievementRarity.LEGENDARY]: { total: 0, unlocked: 0 }
    };

    achievements.forEach(achievement => {
      stats[achievement.rarity].total++;
      if (achievement.isUnlocked) {
        stats[achievement.rarity].unlocked++;
      }
    });

    return stats;
  }, [achievements]);

  const recentUnlocks = useMemo(() => {
    return achievements
      .filter(a => a.isUnlocked && a.unlockedAt)
      .sort((a, b) => {
        const timeA = a.unlockedAt?.getTime() || 0;
        const timeB = b.unlockedAt?.getTime() || 0;
        return timeB - timeA;
      })
      .slice(0, 5); // Last 5 unlocked achievements
  }, [achievements]);

  return {
    achievements,
    notifications,
    unreadCount,
    totalPoints,
    completionPercentage,
    rarityStats,
    recentUnlocks,
    checkAchievements,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getAchievementsByCategory,
    getAchievementsByRarity,
    refreshAchievements
  };
}

// Hook for achievement notifications
export function useAchievementNotifications() {
  const [showNotification, setShowNotification] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<AchievementDefinition | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<AchievementDefinition[]>([]);

  const showAchievementNotification = useCallback((achievement: AchievementDefinition) => {
    if (showNotification) {
      // Add to queue if another notification is showing
      setNotificationQueue(prev => [...prev, achievement]);
    } else {
      setCurrentAchievement(achievement);
      setShowNotification(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
        
        // Show next notification if any
        setTimeout(() => {
          setNotificationQueue(prev => {
            if (prev.length > 0) {
              const next = prev[0];
              const remaining = prev.slice(1);
              setCurrentAchievement(next);
              setShowNotification(true);
              return remaining;
            }
            return prev;
          });
        }, 500); // Small delay between notifications
      }, 5000);
    }
  }, [showNotification]);

  const hideNotification = useCallback(() => {
    setShowNotification(false);
  }, []);

  return {
    showNotification,
    currentAchievement,
    notificationQueue: notificationQueue.length,
    showAchievementNotification,
    hideNotification
  };
}

// Hook for achievement progress tracking
export function useAchievementProgress(achievementId: string) {
  const { achievements } = useAchievements();
  
  const achievement = useMemo(() => {
    return achievements.find(a => a.id === achievementId);
  }, [achievements, achievementId]);

  const progressDetails = useMemo(() => {
    if (!achievement) return null;

    return {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      progress: achievement.progress,
      isUnlocked: achievement.isUnlocked,
      requirements: achievement.requirements.map(req => ({
        description: req.description,
        current: req.current,
        threshold: req.threshold,
        progress: req.threshold > 0 ? Math.min(req.current / req.threshold, 1) : 0,
        isCompleted: req.current >= req.threshold
      }))
    };
  }, [achievement]);

  return {
    achievement,
    progressDetails,
    isUnlocked: achievement?.isUnlocked || false,
    progress: achievement?.progress || 0
  };
}
