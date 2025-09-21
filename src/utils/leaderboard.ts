/**
 * Leaderboard utilities for California Puzzle Game
 * Handles local storage, score comparison, and ranking
 */

import { calculateLeaderboardScore, getScoreTier, GameMetrics } from './scoring';

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  leaderboardScore: number;
  totalTime: number;
  accuracy: number;
  difficulty: string;
  completionDate: string;
  maxStreak: number;
  regionsCompleted: number;
  tier: string;
  rank?: number;
}

export interface LeaderboardStats {
  totalGames: number;
  averageScore: number;
  bestScore: number;
  bestTime: number;
  bestAccuracy: number;
  bestStreak: number;
  favoriteRegion: string;
  totalPlayTime: number;
}

export interface LeaderboardFilters {
  difficulty?: string;
  timeRange?: 'today' | 'week' | 'month' | 'all';
  minAccuracy?: number;
  tier?: string;
}

const STORAGE_KEY = 'californiaPuzzle_leaderboard';
const STATS_KEY = 'californiaPuzzle_stats';
const MAX_ENTRIES = 100; // Keep top 100 scores

/**
 * Save a new leaderboard entry
 */
export function saveLeaderboardEntry(
  playerName: string,
  score: number,
  gameMetrics: GameMetrics,
  difficulty: string = 'medium'
): LeaderboardEntry {
  const leaderboardScore = calculateLeaderboardScore(
    score,
    gameMetrics.totalTime,
    gameMetrics.accuracy,
    difficulty
  );

  const tier = getScoreTier(score);

  const entry: LeaderboardEntry = {
    id: generateEntryId(),
    playerName: playerName.trim() || 'Anonymous',
    score,
    leaderboardScore,
    totalTime: gameMetrics.totalTime,
    accuracy: gameMetrics.accuracy,
    difficulty,
    completionDate: new Date().toISOString(),
    maxStreak: gameMetrics.maxStreak,
    regionsCompleted: gameMetrics.regionsCompleted.size,
    tier: tier.tier
  };

  // Get existing entries
  const entries = getLeaderboardEntries();

  // Add new entry
  entries.push(entry);

  // Sort by leaderboard score (highest first)
  entries.sort((a, b) => b.leaderboardScore - a.leaderboardScore);

  // Keep only top entries
  const topEntries = entries.slice(0, MAX_ENTRIES);

  // Add ranks
  topEntries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topEntries));
  } catch (error) {
    console.warn('Failed to save leaderboard entry:', error);
  }

  // Update stats
  updatePlayerStats(entry, gameMetrics);

  return entry;
}

/**
 * Get all leaderboard entries
 */
export function getLeaderboardEntries(filters?: LeaderboardFilters): LeaderboardEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let entries: LeaderboardEntry[] = stored ? JSON.parse(stored) : [];

    // Apply filters
    if (filters) {
      entries = applyFilters(entries, filters);
    }

    // Ensure ranks are correct for filtered results
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  } catch (error) {
    console.warn('Failed to load leaderboard entries:', error);
    return [];
  }
}

/**
 * Get top entries for a specific difficulty
 */
export function getTopScoresByDifficulty(difficulty: string, limit: number = 10): LeaderboardEntry[] {
  const entries = getLeaderboardEntries({ difficulty });
  return entries.slice(0, limit);
}

/**
 * Get player's best scores
 */
export function getPlayerBestScores(playerName: string, limit: number = 10): LeaderboardEntry[] {
  const entries = getLeaderboardEntries();
  const playerEntries = entries.filter(entry =>
    entry.playerName.toLowerCase() === playerName.toLowerCase()
  );

  return playerEntries.slice(0, limit);
}

/**
 * Get player ranking
 */
export function getPlayerRanking(playerName: string, difficulty?: string): {
  rank: number | null;
  totalPlayers: number;
  percentile: number;
} {
  const filters = difficulty ? { difficulty } : undefined;
  const entries = getLeaderboardEntries(filters);
  const totalPlayers = entries.length;

  const playerEntry = entries.find(entry =>
    entry.playerName.toLowerCase() === playerName.toLowerCase()
  );

  if (!playerEntry || !playerEntry.rank) {
    return {
      rank: null,
      totalPlayers,
      percentile: 0
    };
  }

  const percentile = ((totalPlayers - playerEntry.rank + 1) / totalPlayers) * 100;

  return {
    rank: playerEntry.rank,
    totalPlayers,
    percentile
  };
}

/**
 * Get player statistics
 */
export function getPlayerStats(playerName: string): LeaderboardStats {
  const entries = getLeaderboardEntries();
  const playerEntries = entries.filter(entry =>
    entry.playerName.toLowerCase() === playerName.toLowerCase()
  );

  if (playerEntries.length === 0) {
    return {
      totalGames: 0,
      averageScore: 0,
      bestScore: 0,
      bestTime: 0,
      bestAccuracy: 0,
      bestStreak: 0,
      favoriteRegion: '',
      totalPlayTime: 0
    };
  }

  const totalGames = playerEntries.length;
  const averageScore = playerEntries.reduce((sum, entry) => sum + entry.score, 0) / totalGames;
  const bestScore = Math.max(...playerEntries.map(entry => entry.score));
  const bestTime = Math.min(...playerEntries.map(entry => entry.totalTime));
  const bestAccuracy = Math.max(...playerEntries.map(entry => entry.accuracy));
  const bestStreak = Math.max(...playerEntries.map(entry => entry.maxStreak));
  const totalPlayTime = playerEntries.reduce((sum, entry) => sum + entry.totalTime, 0);

  // TODO: Implement favorite region tracking when region data is available
  const favoriteRegion = 'N/A';

  return {
    totalGames,
    averageScore: Math.round(averageScore),
    bestScore,
    bestTime,
    bestAccuracy,
    bestStreak,
    favoriteRegion,
    totalPlayTime
  };
}

/**
 * Clear all leaderboard data
 */
export function clearLeaderboard(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STATS_KEY);
  } catch (error) {
    console.warn('Failed to clear leaderboard:', error);
  }
}

/**
 * Export leaderboard data
 */
export function exportLeaderboardData(): string {
  const entries = getLeaderboardEntries();
  const stats = localStorage.getItem(STATS_KEY);

  return JSON.stringify({
    entries,
    stats: stats ? JSON.parse(stats) : null,
    exportDate: new Date().toISOString(),
    version: '1.0'
  }, null, 2);
}

/**
 * Import leaderboard data
 */
export function importLeaderboardData(data: string): boolean {
  try {
    const parsed = JSON.parse(data);

    if (parsed.entries && Array.isArray(parsed.entries)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.entries));

      if (parsed.stats) {
        localStorage.setItem(STATS_KEY, JSON.stringify(parsed.stats));
      }

      return true;
    }

    return false;
  } catch (error) {
    console.warn('Failed to import leaderboard data:', error);
    return false;
  }
}

/**
 * Check if a score qualifies for the leaderboard
 */
export function isLeaderboardQualified(score: number, accuracy: number): boolean {
  const minScore = 500; // Minimum score to qualify
  const minAccuracy = 0.5; // Minimum 50% accuracy

  return score >= minScore && accuracy >= minAccuracy;
}

/**
 * Get achievement-worthy scores
 */
export function getAchievementScores(): {
  perfectGame: LeaderboardEntry[];
  speedRuns: LeaderboardEntry[];
  highScores: LeaderboardEntry[];
  streakMasters: LeaderboardEntry[];
} {
  const entries = getLeaderboardEntries();

  return {
    perfectGame: entries.filter(entry => entry.accuracy >= 0.99),
    speedRuns: entries.filter(entry => entry.totalTime < 60000).slice(0, 10), // Under 1 minute
    highScores: entries.filter(entry => entry.score >= 10000).slice(0, 10),
    streakMasters: entries.filter(entry => entry.maxStreak >= 15).slice(0, 10)
  };
}

// Helper functions

function generateEntryId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function applyFilters(entries: LeaderboardEntry[], filters: LeaderboardFilters): LeaderboardEntry[] {
  let filtered = [...entries];

  if (filters.difficulty) {
    filtered = filtered.filter(entry => entry.difficulty === filters.difficulty);
  }

  if (filters.minAccuracy) {
    filtered = filtered.filter(entry => entry.accuracy >= filters.minAccuracy);
  }

  if (filters.tier) {
    filtered = filtered.filter(entry => entry.tier === filters.tier);
  }

  if (filters.timeRange) {
    const now = new Date();
    const cutoff = new Date();

    switch (filters.timeRange) {
      case 'today':
        cutoff.setHours(0, 0, 0, 0);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      default:
        cutoff.setFullYear(1970); // Show all
    }

    filtered = filtered.filter(entry => new Date(entry.completionDate) >= cutoff);
  }

  return filtered;
}

function updatePlayerStats(entry: LeaderboardEntry, gameMetrics: GameMetrics): void {
  try {
    const stored = localStorage.getItem(STATS_KEY);
    const stats = stored ? JSON.parse(stored) : {};

    // Update global stats
    stats.totalGames = (stats.totalGames || 0) + 1;
    stats.totalPlayTime = (stats.totalPlayTime || 0) + gameMetrics.totalTime;

    // Update records
    if (!stats.bestScore || entry.score > stats.bestScore) {
      stats.bestScore = entry.score;
    }

    if (!stats.bestTime || gameMetrics.totalTime < stats.bestTime) {
      stats.bestTime = gameMetrics.totalTime;
    }

    if (!stats.bestAccuracy || gameMetrics.accuracy > stats.bestAccuracy) {
      stats.bestAccuracy = gameMetrics.accuracy;
    }

    if (!stats.bestStreak || gameMetrics.maxStreak > stats.bestStreak) {
      stats.bestStreak = gameMetrics.maxStreak;
    }

    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.warn('Failed to update player stats:', error);
  }
}