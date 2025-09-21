// LocalStorage Manager for California Puzzle Game
// Handles profile management, settings persistence, and game data

import { GameSettings, GameStats, Achievement, DifficultyLevel, CaliforniaRegion } from '../types';

// Version for data migration
const STORAGE_VERSION = '1.0.0';
const STORAGE_PREFIX = 'california_puzzle_';

// Profile interface
export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  lastPlayedAt: Date;
  settings: GameSettings;
  stats: GameStats;
  achievements: Achievement[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  autoSave: boolean;
  cloudSync: boolean;
  analytics: boolean;
}

export interface GameSession {
  id: string;
  profileId: string;
  startTime: Date;
  endTime?: Date;
  region: CaliforniaRegion;
  difficulty: DifficultyLevel;
  score: number;
  timeElapsed: number;
  placementsCorrect: number;
  placementsTotal: number;
  hintsUsed: number;
  achievementsUnlocked: string[];
}

export interface LeaderboardEntry {
  profileId: string;
  profileName: string;
  score: number;
  region: CaliforniaRegion;
  difficulty: DifficultyLevel;
  completionTime: number;
  accuracy: number;
  date: Date;
}

class StorageManager {
  private currentProfile: UserProfile | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    // Check if this is the first time running or if migration is needed
    const version = this.getItem('version');
    if (!version || version !== STORAGE_VERSION) {
      this.migrate(version);
      this.setItem('version', STORAGE_VERSION);
    }
  }

  private migrate(fromVersion: string | null): void {
    console.log(`Migrating storage from ${fromVersion || 'initial'} to ${STORAGE_VERSION}`);
    
    // Handle migration logic here
    if (!fromVersion) {
      // First time setup
      this.setItem('profiles', []);
      this.setItem('currentProfileId', null);
      this.setItem('leaderboard', []);
      this.setItem('sessions', []);
    }
    
    // Add migration logic for future versions
  }

  private getKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      
      // Handle Date objects
      return this.deserializeDates(parsed);
    } catch (error) {
      console.warn(`Failed to get item ${key}:`, error);
      return null;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value, this.dateReplacer);
      localStorage.setItem(this.getKey(key), serialized);
      
      // Notify listeners
      this.notifyListeners(key, value);
    } catch (error) {
      console.warn(`Failed to set item ${key}:`, error);
    }
  }

  private removeItem(key: string): void {
    localStorage.removeItem(this.getKey(key));
    this.notifyListeners(key, null);
  }

  private dateReplacer(key: string, value: any): any {
    if (value instanceof Date) {
      return { __date: value.toISOString() };
    }
    if (value instanceof Set) {
      return { __set: Array.from(value) };
    }
    return value;
  }

  private deserializeDates(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'object') {
      if (obj.__date) {
        return new Date(obj.__date);
      }
      if (obj.__set) {
        return new Set(obj.__set);
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => this.deserializeDates(item));
      }
      
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.deserializeDates(value);
      }
      return result;
    }
    
    return obj;
  }

  // Profile Management
  public createProfile(name: string, avatar?: string): UserProfile {
    const profile: UserProfile = {
      id: this.generateId(),
      name,
      avatar,
      createdAt: new Date(),
      lastPlayedAt: new Date(),
      settings: this.getDefaultSettings(),
      stats: this.getDefaultStats(),
      achievements: [],
      preferences: this.getDefaultPreferences()
    };

    const profiles = this.getProfiles();
    profiles.push(profile);
    this.setItem('profiles', profiles);
    
    return profile;
  }

  public getProfiles(): UserProfile[] {
    return this.getItem<UserProfile[]>('profiles') || [];
  }

  public getProfile(id: string): UserProfile | null {
    const profiles = this.getProfiles();
    return profiles.find(p => p.id === id) || null;
  }

  public updateProfile(profile: UserProfile): void {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === profile.id);
    
    if (index !== -1) {
      profiles[index] = { ...profile, lastPlayedAt: new Date() };
      this.setItem('profiles', profiles);
      
      if (this.currentProfile?.id === profile.id) {
        this.currentProfile = profiles[index];
      }
    }
  }

  public deleteProfile(id: string): void {
    const profiles = this.getProfiles();
    const filtered = profiles.filter(p => p.id !== id);
    this.setItem('profiles', filtered);
    
    // Clear current profile if it was deleted
    if (this.currentProfile?.id === id) {
      this.setCurrentProfile(null);
    }
    
    // Clean up related data
    this.cleanupProfileData(id);
  }

  public getCurrentProfile(): UserProfile | null {
    if (!this.currentProfile) {
      const currentId = this.getItem<string>('currentProfileId');
      if (currentId) {
        this.currentProfile = this.getProfile(currentId);
      }
    }
    return this.currentProfile;
  }

  public setCurrentProfile(profile: UserProfile | null): void {
    this.currentProfile = profile;
    this.setItem('currentProfileId', profile?.id || null);
  }

  // Settings Management
  public saveSettings(settings: GameSettings): void {
    const profile = this.getCurrentProfile();
    if (profile) {
      profile.settings = settings;
      this.updateProfile(profile);
    } else {
      // Fallback to global settings
      this.setItem('settings', settings);
    }
  }

  public loadSettings(): GameSettings {
    const profile = this.getCurrentProfile();
    if (profile) {
      return profile.settings;
    }
    return this.getItem<GameSettings>('settings') || this.getDefaultSettings();
  }

  // Statistics Management
  public saveStats(stats: GameStats): void {
    const profile = this.getCurrentProfile();
    if (profile) {
      profile.stats = stats;
      this.updateProfile(profile);
    } else {
      this.setItem('stats', stats);
    }
  }

  public loadStats(): GameStats {
    const profile = this.getCurrentProfile();
    if (profile) {
      return profile.stats;
    }
    return this.getItem<GameStats>('stats') || this.getDefaultStats();
  }

  // Achievements Management
  public saveAchievements(achievements: Achievement[]): void {
    const profile = this.getCurrentProfile();
    if (profile) {
      profile.achievements = achievements;
      this.updateProfile(profile);
    } else {
      this.setItem('achievements', achievements);
    }
  }

  public loadAchievements(): Achievement[] {
    const profile = this.getCurrentProfile();
    if (profile) {
      return profile.achievements;
    }
    return this.getItem<Achievement[]>('achievements') || [];
  }

  // Session Management
  public saveSession(session: GameSession): void {
    const sessions = this.getSessions();
    sessions.push(session);
    
    // Keep only last 100 sessions to prevent storage bloat
    if (sessions.length > 100) {
      sessions.splice(0, sessions.length - 100);
    }
    
    this.setItem('sessions', sessions);
  }

  public getSessions(profileId?: string): GameSession[] {
    const sessions = this.getItem<GameSession[]>('sessions') || [];
    return profileId ? sessions.filter(s => s.profileId === profileId) : sessions;
  }

  public getRecentSessions(count: number = 10, profileId?: string): GameSession[] {
    const sessions = this.getSessions(profileId);
    return sessions
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, count);
  }

  // Leaderboard Management
  public updateLeaderboard(entry: LeaderboardEntry): void {
    const leaderboard = this.getLeaderboard();
    leaderboard.push(entry);
    
    // Sort by score descending and keep top 1000
    leaderboard.sort((a, b) => b.score - a.score);
    if (leaderboard.length > 1000) {
      leaderboard.splice(1000);
    }
    
    this.setItem('leaderboard', leaderboard);
  }

  public getLeaderboard(region?: CaliforniaRegion, difficulty?: DifficultyLevel): LeaderboardEntry[] {
    let leaderboard = this.getItem<LeaderboardEntry[]>('leaderboard') || [];
    
    if (region) {
      leaderboard = leaderboard.filter(entry => entry.region === region);
    }
    
    if (difficulty) {
      leaderboard = leaderboard.filter(entry => entry.difficulty === difficulty);
    }
    
    return leaderboard;
  }

  // Data Management
  public exportData(): string {
    const data = {
      version: STORAGE_VERSION,
      profiles: this.getProfiles(),
      sessions: this.getSessions(),
      leaderboard: this.getLeaderboard(),
      exportedAt: new Date()
    };
    
    return JSON.stringify(data, this.dateReplacer, 2);
  }

  public importData(dataString: string): boolean {
    try {
      const data = JSON.parse(dataString);
      const deserializedData = this.deserializeDates(data);
      
      if (deserializedData.profiles) {
        this.setItem('profiles', deserializedData.profiles);
      }
      
      if (deserializedData.sessions) {
        this.setItem('sessions', deserializedData.sessions);
      }
      
      if (deserializedData.leaderboard) {
        this.setItem('leaderboard', deserializedData.leaderboard);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  public clearAllData(): void {
    const keys = Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX));
    
    keys.forEach(key => localStorage.removeItem(key));
    this.currentProfile = null;
  }

  // Event Listeners
  public addListener(key: string, callback: (data: any) => void): void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);
  }

  public removeListener(key: string, callback: (data: any) => void): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private notifyListeners(key: string, data: any): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Helper methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getDefaultSettings(): GameSettings {
    return {
      difficulty: DifficultyLevel.EASY,
      region: CaliforniaRegion.BAY_AREA,
      showHints: true,
      enableTimer: true,
      soundEnabled: true,
      animationsEnabled: true,
      autoAdvance: false,
      hintSettings: {
        maxHintsPerLevel: 3,
        hintCooldownMs: 10000,
        scorePenaltyPerHint: 50,
        freeHintsAllowed: 1,
        autoSuggestThreshold: 3,
        enableVisualIndicators: true,
        enableEducationalHints: true
      }
    };
  }

  private getDefaultStats(): GameStats {
    return {
      totalGamesPlayed: 0,
      totalScore: 0,
      bestScore: 0,
      averageAccuracy: 0,
      totalPlayTime: 0,
      favoriteDifficulty: DifficultyLevel.EASY,
      favoriteRegion: CaliforniaRegion.BAY_AREA,
      countiesLearned: new Set(),
      perfectPlacements: 0,
      longestStreak: 0
    };
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'auto',
      language: 'en',
      notifications: true,
      autoSave: true,
      cloudSync: false,
      analytics: true
    };
  }

  private cleanupProfileData(profileId: string): void {
    // Remove sessions for deleted profile
    const sessions = this.getSessions();
    const filteredSessions = sessions.filter(s => s.profileId !== profileId);
    this.setItem('sessions', filteredSessions);
    
    // Remove leaderboard entries for deleted profile
    const leaderboard = this.getLeaderboard();
    const filteredLeaderboard = leaderboard.filter(e => e.profileId !== profileId);
    this.setItem('leaderboard', filteredLeaderboard);
  }

  // Storage usage info
  public getStorageInfo(): { used: number; available: number; percentage: number } {
    let used = 0;
    const keys = Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX));
    
    keys.forEach(key => {
      used += key.length + (localStorage.getItem(key)?.length || 0);
    });
    
    // Rough estimate of available space (most browsers allow ~5-10MB)
    const available = 5 * 1024 * 1024; // 5MB estimate
    
    return {
      used,
      available,
      percentage: (used / available) * 100
    };
  }
}

// Singleton instance
export const storageManager = new StorageManager();
export default storageManager;
