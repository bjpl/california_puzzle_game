// Comprehensive Achievements System for California Puzzle Game
// Handles achievement definitions, progress tracking, and unlock logic

import { Achievement, AchievementCategory, DifficultyLevel, CaliforniaRegion, GameStats, PlacementResult } from '../types';

export interface AchievementDefinition extends Achievement {
  rarity: AchievementRarity;
  points: number;
  requirements: AchievementRequirement[];
  hidden: boolean; // Hidden until unlocked
  group?: string; // Achievement group/series
}

export enum AchievementRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface AchievementRequirement {
  type: RequirementType;
  target: any;
  current: number;
  threshold: number;
  description: string;
}

export enum RequirementType {
  GAMES_PLAYED = 'games_played',
  SCORE_ACHIEVED = 'score_achieved',
  ACCURACY_PERCENTAGE = 'accuracy_percentage',
  TIME_UNDER = 'time_under',
  STREAK_LENGTH = 'streak_length',
  COUNTIES_LEARNED = 'counties_learned',
  PERFECT_PLACEMENTS = 'perfect_placements',
  REGION_COMPLETED = 'region_completed',
  DIFFICULTY_COMPLETED = 'difficulty_completed',
  CONSECUTIVE_DAYS = 'consecutive_days',
  TOTAL_PLAYTIME = 'total_playtime',
  HINTS_NOT_USED = 'hints_not_used',
  MISTAKES_UNDER = 'mistakes_under',
  SPEED_PLACEMENT = 'speed_placement',
  ACHIEVEMENT_COUNT = 'achievement_count'
}

export interface AchievementProgress {
  id: string;
  progress: number; // 0-1
  isUnlocked: boolean;
  unlockedAt?: Date;
  currentValues: Record<string, number>;
}

export interface AchievementNotification {
  achievement: AchievementDefinition;
  timestamp: Date;
  isRead: boolean;
}

class AchievementSystem {
  private achievements: Map<string, AchievementDefinition> = new Map();
  private notifications: AchievementNotification[] = [];

  constructor() {
    this.initializeAchievements();
  }

  private initializeAchievements(): void {
    const achievementDefs: AchievementDefinition[] = [
      // COMMON ACHIEVEMENTS (Easy to get)
      {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Place your first county correctly',
        icon: '🎯',
        category: AchievementCategory.COMPLETION,
        rarity: AchievementRarity.COMMON,
        points: 10,
        progress: 0,
        isUnlocked: false,
        hidden: false,
        requirements: [{
          type: RequirementType.PERFECT_PLACEMENTS,
          target: null,
          current: 0,
          threshold: 1,
          description: 'Place 1 county correctly'
        }]
      },
      {
        id: 'getting_started',
        name: 'Getting Started',
        description: 'Complete your first game',
        icon: '🎮',
        category: AchievementCategory.COMPLETION,
        rarity: AchievementRarity.COMMON,
        points: 25,
        progress: 0,
        isUnlocked: false,
        hidden: false,
        requirements: [{
          type: RequirementType.GAMES_PLAYED,
          target: null,
          current: 0,
          threshold: 1,
          description: 'Complete 1 game'
        }]
      },
      {
        id: 'bay_area_beginner',
        name: 'Bay Area Beginner',
        description: 'Complete Bay Area on Easy difficulty',
        icon: '🌉',
        category: AchievementCategory.COMPLETION,
        rarity: AchievementRarity.COMMON,
        points: 50,
        progress: 0,
        isUnlocked: false,
        hidden: false,
        requirements: [{
          type: RequirementType.REGION_COMPLETED,
          target: { region: CaliforniaRegion.BAY_AREA, difficulty: DifficultyLevel.EASY },
          current: 0,
          threshold: 1,
          description: 'Complete Bay Area on Easy'
        }]
      },
      {
        id: 'quick_learner',
        name: 'Quick Learner',
        description: 'Learn 10 different counties',
        icon: '📚',
        category: AchievementCategory.EXPLORATION,
        rarity: AchievementRarity.COMMON,
        points: 75,
        progress: 0,
        isUnlocked: false,
        hidden: false,
        requirements: [{
          type: RequirementType.COUNTIES_LEARNED,
          target: null,
          current: 0,
          threshold: 10,
          description: 'Learn 10 counties'
        }]
      },
      {
        id: 'daily_player',
        name: 'Daily Player',
        description: 'Play for 3 consecutive days',
        icon: '📅',
        category: AchievementCategory.COMPLETION,
        rarity: AchievementRarity.COMMON,
        points: 100,
        progress: 0,
        isUnlocked: false,
        hidden: false,
        requirements: [{
          type: RequirementType.CONSECUTIVE_DAYS,
          target: null,
          current: 0,
          threshold: 3,
          description: 'Play 3 days in a row'
        }]
      },

      // RARE ACHIEVEMENTS (Moderate challenge)
      {
        id: 'perfect_placement',
        name: 'Bullseye',
        description: 'Place a county with 100% accuracy',
        icon: '🎯',
        category: AchievementCategory.ACCURACY,
        rarity: AchievementRarity.RARE,
        points: 150,
        progress: 0,
        isUnlocked: false,
        hidden: false,
        requirements: [{
          type: RequirementType.ACCURACY_PERCENTAGE,
          target: null,
          current: 0,
          threshold: 100,
          description: 'Achieve 100% accuracy'
        }]
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Place a county in under 3 seconds',
        icon: '⚡',
        category: AchievementCategory.SPEED,
        rarity: AchievementRarity.RARE,
        points: 200,
        progress: 0,
        isUnlocked: false,
        hidden: false,
        requirements: [{
          type: RequirementType.TIME_UNDER,
          target: null,
          current: 0,
          threshold: 3000,
          description: 'Place in under 3 seconds'
        }]
      },
      {
        id: 'streak_master',
        name: 'On Fire',
        description: 'Get a 10-county streak',
        icon: '🔥',
        category: AchievementCategory.STREAK,
        rarity: AchievementRarity.RARE,
        points: 250,
        progress: 0,
        isUnlocked: false,
        hidden: false,
        requirements: [{
          type: RequirementType.STREAK_LENGTH,
          target: null,
          current: 0,
          threshold: 10,
          description: 'Achieve 10-county streak'
        }]
      },
      {
        id: 'no_hints_needed',
        name: 'No Hints Needed',
        description: 'Complete a region without using hints',
        icon: '🧠',
        category: AchievementCategory.COMPLETION,
        rarity: AchievementRarity.RARE,
        points: 300,
        progress: 0,
        isUnlocked: false,
        hidden: false,
        requirements: [{
          type: RequirementType.HINTS_NOT_USED,
          target: null,
          current: 0,
          threshold: 1,
          description: 'Complete without hints'
        }]
      },
      {
        id: 'california_explorer',
        name: 'California Explorer',
        description: 'Complete all regions on Easy difficulty',
        icon: '🗺️',
        category: AchievementCategory.EXPLORATION,
        rarity: AchievementRarity.RARE,
        points: 400,
        progress: 0,
        isUnlocked: false,
        hidden: false,
        group: 'explorer',
        requirements: [{
          type: RequirementType.REGION_COMPLETED,
          target: { difficulty: DifficultyLevel.EASY },
          current: 0,
          threshold: 8, // All regions
          description: 'Complete all regions on Easy'
        }]
      },
      {
        id: 'scholar',
        name: 'California Scholar',
        description: 'Learn 25 different counties',
        icon: '🎓',
        category: AchievementCategory.EXPLORATION,
        rarity: AchievementRarity.RARE,
        points: 350,
        progress: 0,
        isUnlocked: false,
        hidden: false,
        requirements: [{
          type: RequirementType.COUNTIES_LEARNED,
          target: null,
          current: 0,
          threshold: 25,
          description: 'Learn 25 counties'
        }]
      },

      // EPIC ACHIEVEMENTS (Significant challenge)
      {
        id: 'lightning_fast',
        name: 'Lightning Fast',
        description: 'Complete a region in under 2 minutes',
        icon: '⚡',
        category: AchievementCategory.SPEED,
        rarity: AchievementRarity.EPIC,
        points: 500,
        progress: 0,
        isUnlocked: false,
        hidden: false,
        requirements: [{
          type: RequirementType.TIME_UNDER,
          target: null,
          current: 0,
          threshold: 120000,
          description: 'Complete in under 2 minutes'
        }]
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Complete a region with 95% average accuracy',
        icon: '💎',
        category: AchievementCategory.ACCURACY,
        rarity: AchievementRarity.EPIC,
        points: 600,
        progress: 0,
        isUnlocked: false,
        hidden: false,
        requirements: [{
          type: RequirementType.ACCURACY_PERCENTAGE,
          target: null,
          current: 0,
          threshold: 95,
          description: 'Achieve 95% average accuracy'
        }]
      },
      {
        id: 'marathon_runner',
        name: 'Marathon Runner',
        description: 'Play for 2 hours in a single session',
        icon: '🏃',
        category: AchievementCategory.COMPLETION,
        rarity: AchievementRarity.EPIC,
        points: 750,
        progress: 0,
        isUnlocked: false,
        hidden: false,
        requirements: [{
          type: RequirementType.TOTAL_PLAYTIME,
          target: null,
          current: 0,
          threshold: 7200000, // 2 hours in ms
          description: 'Play for 2 hours straight'
        }]
      },
      {
        id: 'medium_master',
        name: 'Medium Master',
        description: 'Complete all regions on Medium difficulty',
        icon: '🥉',
        category: AchievementCategory.COMPLETION,
        rarity: AchievementRarity.EPIC,
        points: 800,
        progress: 0,
        isUnlocked: false,
        hidden: false,
        group: 'master',
        requirements: [{
          type: RequirementType.REGION_COMPLETED,
          target: { difficulty: DifficultyLevel.MEDIUM },
          current: 0,
          threshold: 8,
          description: 'Complete all regions on Medium'
        }]
      },
      {
        id: 'streak_legend',
        name: 'Streak Legend',
        description: 'Get a 25-county streak',
        icon: '🌟',
        category: AchievementCategory.STREAK,
        rarity: AchievementRarity.EPIC,
        points: 900,
        progress: 0,
        isUnlocked: false,
        hidden: false,
        requirements: [{
          type: RequirementType.STREAK_LENGTH,
          target: null,
          current: 0,
          threshold: 25,
          description: 'Achieve 25-county streak'
        }]
      },
      {
        id: 'county_master',
        name: 'County Master',
        description: 'Learn all 58 California counties',
        icon: '🏆',
        category: AchievementCategory.EXPLORATION,
        rarity: AchievementRarity.EPIC,
        points: 1000,
        progress: 0,
        isUnlocked: false,
        hidden: false,
        requirements: [{
          type: RequirementType.COUNTIES_LEARNED,
          target: null,
          current: 0,
          threshold: 58,
          description: 'Learn all 58 counties'
        }]
      },

      // LEGENDARY ACHIEVEMENTS (Extreme challenge)
      {
        id: 'california_legend',
        name: 'California Legend',
        description: 'Complete all regions on Expert difficulty',
        icon: '👑',
        category: AchievementCategory.COMPLETION,
        rarity: AchievementRarity.LEGENDARY,
        points: 2000,
        progress: 0,
        isUnlocked: false,
        hidden: true,
        group: 'legend',
        requirements: [{
          type: RequirementType.REGION_COMPLETED,
          target: { difficulty: DifficultyLevel.EXPERT },
          current: 0,
          threshold: 8,
          description: 'Complete all regions on Expert'
        }]
      },
      {
        id: 'flawless_victory',
        name: 'Flawless Victory',
        description: 'Complete Expert difficulty with no mistakes',
        icon: '💯',
        category: AchievementCategory.ACCURACY,
        rarity: AchievementRarity.LEGENDARY,
        points: 2500,
        progress: 0,
        isUnlocked: false,
        hidden: true,
        requirements: [{
          type: RequirementType.MISTAKES_UNDER,
          target: { difficulty: DifficultyLevel.EXPERT },
          current: 0,
          threshold: 0,
          description: 'No mistakes on Expert'
        }]
      },
      {
        id: 'speed_of_light',
        name: 'Speed of Light',
        description: 'Complete Expert difficulty in under 5 minutes',
        icon: '🚀',
        category: AchievementCategory.SPEED,
        rarity: AchievementRarity.LEGENDARY,
        points: 3000,
        progress: 0,
        isUnlocked: false,
        hidden: true,
        requirements: [{
          type: RequirementType.TIME_UNDER,
          target: { difficulty: DifficultyLevel.EXPERT },
          current: 0,
          threshold: 300000, // 5 minutes
          description: 'Complete Expert in under 5 minutes'
        }]
      },
      {
        id: 'ultimate_streak',
        name: 'Ultimate Streak',
        description: 'Get a 50-county streak',
        icon: '🔥',
        category: AchievementCategory.STREAK,
        rarity: AchievementRarity.LEGENDARY,
        points: 3500,
        progress: 0,
        isUnlocked: false,
        hidden: true,
        requirements: [{
          type: RequirementType.STREAK_LENGTH,
          target: null,
          current: 0,
          threshold: 50,
          description: 'Achieve 50-county streak'
        }]
      },
      {
        id: 'achievement_hunter',
        name: 'Achievement Hunter',
        description: 'Unlock all other achievements',
        icon: '🏅',
        category: AchievementCategory.COMPLETION,
        rarity: AchievementRarity.LEGENDARY,
        points: 5000,
        progress: 0,
        isUnlocked: false,
        hidden: true,
        requirements: [{
          type: RequirementType.ACHIEVEMENT_COUNT,
          target: null,
          current: 0,
          threshold: 22, // All other achievements
          description: 'Unlock all achievements'
        }]
      }
    ];

    // Initialize achievements map
    achievementDefs.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  public getAllAchievements(): AchievementDefinition[] {
    return Array.from(this.achievements.values());
  }

  public getAchievement(id: string): AchievementDefinition | undefined {
    return this.achievements.get(id);
  }

  public getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
    return this.getAllAchievements().filter(a => a.category === category);
  }

  public getAchievementsByRarity(rarity: AchievementRarity): AchievementDefinition[] {
    return this.getAllAchievements().filter(a => a.rarity === rarity);
  }

  public getVisibleAchievements(): AchievementDefinition[] {
    return this.getAllAchievements().filter(a => !a.hidden || a.isUnlocked);
  }

  public updateProgress(
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
  ): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    this.achievements.forEach((achievement) => {
      if (achievement.isUnlocked) return;

      let shouldCheck = false;
      const currentValues: Record<string, number> = {};

      // Update current values based on requirements
      achievement.requirements.forEach(req => {
        switch (req.type) {
          case RequirementType.GAMES_PLAYED:
            currentValues[req.type] = stats.totalGamesPlayed;
            req.current = stats.totalGamesPlayed;
            shouldCheck = true;
            break;

          case RequirementType.COUNTIES_LEARNED:
            currentValues[req.type] = stats.countiesLearned.size;
            req.current = stats.countiesLearned.size;
            shouldCheck = true;
            break;

          case RequirementType.PERFECT_PLACEMENTS:
            currentValues[req.type] = stats.perfectPlacements;
            req.current = stats.perfectPlacements;
            shouldCheck = true;
            break;

          case RequirementType.STREAK_LENGTH:
            if (gameData?.streak) {
              currentValues[req.type] = gameData.streak;
              req.current = Math.max(req.current, gameData.streak);
              shouldCheck = true;
            }
            break;

          case RequirementType.ACCURACY_PERCENTAGE:
            if (placement?.accuracy) {
              const accuracy = placement.accuracy * 100;
              currentValues[req.type] = accuracy;
              req.current = Math.max(req.current, accuracy);
              shouldCheck = true;
            }
            break;

          case RequirementType.TIME_UNDER:
            if (gameData?.timeElapsed) {
              currentValues[req.type] = gameData.timeElapsed;
              if (gameData.timeElapsed < req.threshold) {
                req.current = 1; // Met requirement
                shouldCheck = true;
              }
            }
            break;

          case RequirementType.SPEED_PLACEMENT:
            if (placement?.timeToPlace) {
              currentValues[req.type] = placement.timeToPlace;
              if (placement.timeToPlace < req.threshold) {
                req.current = 1;
                shouldCheck = true;
              }
            }
            break;

          case RequirementType.ACHIEVEMENT_COUNT:
            const unlockedCount = this.getAllAchievements()
              .filter(a => a.id !== achievement.id && a.isUnlocked).length;
            currentValues[req.type] = unlockedCount;
            req.current = unlockedCount;
            shouldCheck = true;
            break;

          // Add more requirement types as needed
        }
      });

      if (shouldCheck) {
        // Calculate progress
        const totalRequirements = achievement.requirements.length;
        const metRequirements = achievement.requirements.filter(req => 
          req.current >= req.threshold
        ).length;
        
        achievement.progress = metRequirements / totalRequirements;

        // Check if all requirements are met
        if (achievement.progress >= 1 && !achievement.isUnlocked) {
          achievement.isUnlocked = true;
          achievement.unlockedAt = new Date();
          newlyUnlocked.push(achievement);
          
          // Add notification
          this.addNotification(achievement);
        }
      }
    });

    return newlyUnlocked;
  }

  public addNotification(achievement: AchievementDefinition): void {
    this.notifications.push({
      achievement,
      timestamp: new Date(),
      isRead: false
    });

    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications.splice(0, this.notifications.length - 50);
    }
  }

  public getNotifications(): AchievementNotification[] {
    return this.notifications.slice();
  }

  public getUnreadNotifications(): AchievementNotification[] {
    return this.notifications.filter(n => !n.isRead);
  }

  public markNotificationAsRead(index: number): void {
    if (this.notifications[index]) {
      this.notifications[index].isRead = true;
    }
  }

  public markAllNotificationsAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
  }

  public getTotalPoints(): number {
    return this.getAllAchievements()
      .filter(a => a.isUnlocked)
      .reduce((total, a) => total + a.points, 0);
  }

  public getCompletionPercentage(): number {
    const total = this.getAllAchievements().length;
    const unlocked = this.getAllAchievements().filter(a => a.isUnlocked).length;
    return total > 0 ? (unlocked / total) * 100 : 0;
  }

  public getRarityStats(): Record<AchievementRarity, { total: number; unlocked: number }> {
    const stats = {
      [AchievementRarity.COMMON]: { total: 0, unlocked: 0 },
      [AchievementRarity.RARE]: { total: 0, unlocked: 0 },
      [AchievementRarity.EPIC]: { total: 0, unlocked: 0 },
      [AchievementRarity.LEGENDARY]: { total: 0, unlocked: 0 }
    };

    this.getAllAchievements().forEach(achievement => {
      stats[achievement.rarity].total++;
      if (achievement.isUnlocked) {
        stats[achievement.rarity].unlocked++;
      }
    });

    return stats;
  }

  public exportProgress(): string {
    return JSON.stringify({
      achievements: Array.from(this.achievements.values()),
      notifications: this.notifications,
      exportedAt: new Date()
    }, null, 2);
  }

  public importProgress(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.achievements) {
        parsed.achievements.forEach((achievement: AchievementDefinition) => {
          const existing = this.achievements.get(achievement.id);
          if (existing) {
            existing.progress = achievement.progress;
            existing.isUnlocked = achievement.isUnlocked;
            existing.unlockedAt = achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined;
          }
        });
      }
      
      if (parsed.notifications) {
        this.notifications = parsed.notifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import achievement progress:', error);
      return false;
    }
  }
}

// Singleton instance
export const achievementSystem = new AchievementSystem();
export default achievementSystem;
