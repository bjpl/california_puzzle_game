// Progress tracking hook with learning analytics

import { useState, useEffect, useCallback, useMemo } from 'react';
import { storageManager, GameSession } from '../utils/storage';
import { GameStats, CaliforniaRegion, DifficultyLevel, PlacementResult } from '../types';

interface ProgressData {
  // Overall progress
  totalGamesPlayed: number;
  totalPlayTime: number;
  averageSessionTime: number;
  
  // Accuracy metrics
  overallAccuracy: number;
  accuracyByRegion: Record<CaliforniaRegion, number>;
  accuracyByDifficulty: Record<DifficultyLevel, number>;
  
  // Speed metrics
  averageCompletionTime: number;
  bestCompletionTime: number;
  speedByRegion: Record<CaliforniaRegion, number>;
  speedByDifficulty: Record<DifficultyLevel, number>;
  
  // Learning metrics
  countiesLearned: Set<string>;
  learningCurve: { date: Date; accuracy: number; speed: number }[];
  strugglingCounties: { countyId: string; attempts: number; accuracy: number }[];
  masteredCounties: string[];
  
  // Achievement progress
  totalPoints: number;
  achievementProgress: number;
  recentAchievements: string[];
  
  // Streaks and patterns
  currentStreak: number;
  longestStreak: number;
  playingPatterns: {
    favoriteTimeOfDay: number;
    favoriteDayOfWeek: number;
    averageSessionLength: number;
  };
}

interface LearningAnalytics {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  improvementAreas: {
    area: string;
    currentLevel: number;
    targetLevel: number;
    suggestions: string[];
  }[];
}

export function useProgress() {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateProgress = useCallback(async (): Promise<ProgressData> => {
    try {
      const profile = storageManager.getCurrentProfile();
      const sessions = profile ? storageManager.getSessions(profile.id) : [];
      const stats = storageManager.loadStats();
      
      // Calculate basic metrics
      const totalGamesPlayed = sessions.length;
      const totalPlayTime = sessions.reduce((sum, session) => {
        const endTime = session.endTime || new Date();
        return sum + (endTime.getTime() - session.startTime.getTime());
      }, 0);
      
      const averageSessionTime = totalGamesPlayed > 0 ? totalPlayTime / totalGamesPlayed : 0;
      
      // Accuracy by region and difficulty
      const accuracyByRegion = {} as Record<CaliforniaRegion, number>;
      const accuracyByDifficulty = {} as Record<DifficultyLevel, number>;
      const speedByRegion = {} as Record<CaliforniaRegion, number>;
      const speedByDifficulty = {} as Record<DifficultyLevel, number>;
      
      // Group sessions by region and difficulty
      const regionGroups = sessions.reduce((groups, session) => {
        if (!groups[session.region]) groups[session.region] = [];
        groups[session.region].push(session);
        return groups;
      }, {} as Record<CaliforniaRegion, GameSession[]>);
      
      const difficultyGroups = sessions.reduce((groups, session) => {
        if (!groups[session.difficulty]) groups[session.difficulty] = [];
        groups[session.difficulty].push(session);
        return groups;
      }, {} as Record<DifficultyLevel, GameSession[]>);
      
      // Calculate accuracy and speed by region
      Object.entries(regionGroups).forEach(([region, regionSessions]) => {
        const totalPlacements = regionSessions.reduce((sum, s) => sum + s.placementsTotal, 0);
        const correctPlacements = regionSessions.reduce((sum, s) => sum + s.placementsCorrect, 0);
        const totalTime = regionSessions.reduce((sum, s) => {
          const endTime = s.endTime || new Date();
          return sum + (endTime.getTime() - s.startTime.getTime());
        }, 0);
        
        accuracyByRegion[region as CaliforniaRegion] = totalPlacements > 0 ? correctPlacements / totalPlacements : 0;
        speedByRegion[region as CaliforniaRegion] = regionSessions.length > 0 ? totalTime / regionSessions.length : 0;
      });
      
      // Calculate accuracy and speed by difficulty
      Object.entries(difficultyGroups).forEach(([difficulty, difficultySessions]) => {
        const totalPlacements = difficultySessions.reduce((sum, s) => sum + s.placementsTotal, 0);
        const correctPlacements = difficultySessions.reduce((sum, s) => sum + s.placementsCorrect, 0);
        const totalTime = difficultySessions.reduce((sum, s) => {
          const endTime = s.endTime || new Date();
          return sum + (endTime.getTime() - s.startTime.getTime());
        }, 0);
        
        accuracyByDifficulty[difficulty as DifficultyLevel] = totalPlacements > 0 ? correctPlacements / totalPlacements : 0;
        speedByDifficulty[difficulty as DifficultyLevel] = difficultySessions.length > 0 ? totalTime / difficultySessions.length : 0;
      });
      
      // Learning curve (last 30 sessions)
      const recentSessions = sessions
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(-30);
      
      const learningCurve = recentSessions.map(session => {
        const accuracy = session.placementsTotal > 0 ? session.placementsCorrect / session.placementsTotal : 0;
        const endTime = session.endTime || new Date();
        const speed = endTime.getTime() - session.startTime.getTime();
        
        return {
          date: session.startTime,
          accuracy,
          speed
        };
      });
      
      // Playing patterns
      const playingPatterns = {
        favoriteTimeOfDay: 12, // Default noon
        favoriteDayOfWeek: 0, // Default Sunday
        averageSessionLength: averageSessionTime
      };
      
      if (sessions.length > 0) {
        // Calculate favorite time of day (hour)
        const hourCounts = new Array(24).fill(0);
        sessions.forEach(session => {
          const hour = new Date(session.startTime).getHours();
          hourCounts[hour]++;
        });
        playingPatterns.favoriteTimeOfDay = hourCounts.indexOf(Math.max(...hourCounts));
        
        // Calculate favorite day of week
        const dayCounts = new Array(7).fill(0);
        sessions.forEach(session => {
          const day = new Date(session.startTime).getDay();
          dayCounts[day]++;
        });
        playingPatterns.favoriteDayOfWeek = dayCounts.indexOf(Math.max(...dayCounts));
      }
      
      // Speed metrics
      const completionTimes = sessions
        .filter(s => s.endTime)
        .map(s => s.endTime!.getTime() - s.startTime.getTime());
      
      const averageCompletionTime = completionTimes.length > 0 
        ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
        : 0;
      
      const bestCompletionTime = completionTimes.length > 0 
        ? Math.min(...completionTimes) 
        : 0;
      
      return {
        totalGamesPlayed,
        totalPlayTime,
        averageSessionTime,
        overallAccuracy: stats.averageAccuracy,
        accuracyByRegion,
        accuracyByDifficulty,
        averageCompletionTime,
        bestCompletionTime,
        speedByRegion,
        speedByDifficulty,
        countiesLearned: stats.countiesLearned,
        learningCurve,
        strugglingCounties: [], // TODO: Implement based on detailed placement data
        masteredCounties: [], // TODO: Implement based on consistent high accuracy
        totalPoints: 0, // TODO: Calculate from achievements
        achievementProgress: 0, // TODO: Calculate from achievements
        recentAchievements: [], // TODO: Get from recent unlocks
        currentStreak: 0, // TODO: Calculate current streak
        longestStreak: stats.longestStreak,
        playingPatterns
      };
    } catch (error) {
      console.error('Error calculating progress:', error);
      throw error;
    }
  }, []);

  const calculateAnalytics = useCallback((progress: ProgressData): LearningAnalytics => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];
    const improvementAreas: LearningAnalytics['improvementAreas'] = [];

    // Analyze accuracy
    if (progress.overallAccuracy > 0.8) {
      strengths.push('High overall accuracy');
    } else if (progress.overallAccuracy < 0.6) {
      weaknesses.push('Low overall accuracy');
      recommendations.push('Practice with easier difficulties first');
      improvementAreas.push({
        area: 'Accuracy',
        currentLevel: Math.round(progress.overallAccuracy * 100),
        targetLevel: 80,
        suggestions: [
          'Use hints more frequently',
          'Study county shapes before playing',
          'Start with easier regions'
        ]
      });
    }

    // Analyze speed
    const targetTime = 300000; // 5 minutes
    if (progress.averageCompletionTime < targetTime) {
      strengths.push('Fast completion times');
    } else if (progress.averageCompletionTime > targetTime * 2) {
      weaknesses.push('Slow completion times');
      recommendations.push('Focus on speed in practice modes');
      improvementAreas.push({
        area: 'Speed',
        currentLevel: Math.round(targetTime / progress.averageCompletionTime * 100),
        targetLevel: 100,
        suggestions: [
          'Practice county recognition',
          'Use time trial mode',
          'Learn county positions systematically'
        ]
      });
    }

    // Analyze learning progress
    const totalCounties = 58; // California has 58 counties
    const learningProgress = progress.countiesLearned.size / totalCounties;
    
    if (learningProgress > 0.8) {
      strengths.push('Excellent county knowledge');
    } else if (learningProgress < 0.3) {
      weaknesses.push('Limited county knowledge');
      recommendations.push('Use study mode to learn more counties');
      improvementAreas.push({
        area: 'County Knowledge',
        currentLevel: Math.round(learningProgress * 100),
        targetLevel: 80,
        suggestions: [
          'Use study mode regularly',
          'Focus on one region at a time',
          'Practice with educational hints enabled'
        ]
      });
    }

    // Analyze consistency
    if (progress.learningCurve.length > 5) {
      const recentAccuracy = progress.learningCurve.slice(-5).map(p => p.accuracy);
      const variance = recentAccuracy.reduce((sum, acc, i, arr) => {
        const mean = arr.reduce((s, a) => s + a, 0) / arr.length;
        return sum + Math.pow(acc - mean, 2);
      }, 0) / recentAccuracy.length;
      
      if (variance < 0.01) {
        strengths.push('Consistent performance');
      } else if (variance > 0.05) {
        weaknesses.push('Inconsistent performance');
        recommendations.push('Focus on steady improvement rather than speed');
      }
    }

    // General recommendations based on play patterns
    if (progress.totalGamesPlayed < 10) {
      recommendations.push('Keep playing to build experience');
    }
    
    if (progress.playingPatterns.averageSessionLength < 300000) { // 5 minutes
      recommendations.push('Try longer practice sessions for better retention');
    }

    return {
      strengths,
      weaknesses,
      recommendations,
      improvementAreas
    };
  }, []);

  const refreshProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const progress = await calculateProgress();
      const analytics = calculateAnalytics(progress);
      
      setProgressData(progress);
      setAnalytics(analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate progress');
    } finally {
      setIsLoading(false);
    }
  }, [calculateProgress, calculateAnalytics]);

  // Load progress on mount and when profile changes
  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  // Derived values
  const progressPercentage = useMemo(() => {
    if (!progressData) return 0;
    const totalCounties = 58;
    return (progressData.countiesLearned.size / totalCounties) * 100;
  }, [progressData]);

  const performanceRating = useMemo(() => {
    if (!progressData) return 'Beginner';
    
    const accuracy = progressData.overallAccuracy;
    const speed = progressData.averageCompletionTime;
    const knowledge = progressData.countiesLearned.size / 58;
    
    const score = (accuracy * 0.4) + ((1 - Math.min(speed / 600000, 1)) * 0.3) + (knowledge * 0.3);
    
    if (score > 0.8) return 'Expert';
    if (score > 0.6) return 'Advanced';
    if (score > 0.4) return 'Intermediate';
    return 'Beginner';
  }, [progressData]);

  const trackPlacement = useCallback((placement: PlacementResult, gameData: {
    region: CaliforniaRegion;
    difficulty: DifficultyLevel;
    timeElapsed: number;
    hintsUsed: number;
  }) => {
    // This would be called after each county placement to track detailed progress
    // Implementation would update session data and recalculate progress
    refreshProgress();
  }, [refreshProgress]);

  return {
    progressData,
    analytics,
    isLoading,
    error,
    progressPercentage,
    performanceRating,
    refreshProgress,
    trackPlacement
  };
}

// Hook for tracking daily progress
export function useDailyProgress() {
  const [dailyStats, setDailyStats] = useState({
    gamesPlayed: 0,
    totalScore: 0,
    timeSpent: 0,
    averageAccuracy: 0,
    countiesLearned: 0,
    achievementsUnlocked: 0
  });

  const updateDailyStats = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const profile = storageManager.getCurrentProfile();
    const sessions = profile ? storageManager.getSessions(profile.id) : [];
    
    const todaySessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });
    
    const gamesPlayed = todaySessions.length;
    const totalScore = todaySessions.reduce((sum, s) => sum + s.score, 0);
    const timeSpent = todaySessions.reduce((sum, session) => {
      const endTime = session.endTime || new Date();
      return sum + (endTime.getTime() - session.startTime.getTime());
    }, 0);
    
    const totalPlacements = todaySessions.reduce((sum, s) => sum + s.placementsTotal, 0);
    const correctPlacements = todaySessions.reduce((sum, s) => sum + s.placementsCorrect, 0);
    const averageAccuracy = totalPlacements > 0 ? correctPlacements / totalPlacements : 0;
    
    const achievementsUnlocked = todaySessions.reduce((sum, s) => sum + s.achievementsUnlocked.length, 0);
    
    setDailyStats({
      gamesPlayed,
      totalScore,
      timeSpent,
      averageAccuracy,
      countiesLearned: 0, // TODO: Track counties learned today
      achievementsUnlocked
    });
  }, []);

  useEffect(() => {
    updateDailyStats();
    
    // Update every minute to keep stats current
    const interval = setInterval(updateDailyStats, 60000);
    
    return () => clearInterval(interval);
  }, [updateDailyStats]);

  return {
    dailyStats,
    updateDailyStats
  };
}
