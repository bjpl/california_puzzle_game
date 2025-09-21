// Data Migration System
// Handles version updates and data structure changes

import { storageManager } from './storage';
import { GameSettings, GameStats, Achievement } from '../types';

export interface MigrationScript {
  version: string;
  description: string;
  migrate: (data: any) => any;
  rollback?: (data: any) => any;
}

export interface MigrationResult {
  success: boolean;
  fromVersion: string;
  toVersion: string;
  migrationsApplied: string[];
  errors: string[];
}

class DataMigrationManager {
  private migrations: Map<string, MigrationScript> = new Map();
  private currentVersion = '1.0.0';

  constructor() {
    this.initializeMigrations();
  }

  private initializeMigrations(): void {
    // Migration from initial version to 1.0.0
    this.addMigration({
      version: '1.0.0',
      description: 'Initial data structure setup',
      migrate: (data: any) => {
        // If no version exists, this is a fresh install
        if (!data || typeof data !== 'object') {
          return {
            version: '1.0.0',
            profiles: [],
            currentProfileId: null,
            leaderboard: [],
            sessions: [],
            settings: {
              difficulty: 'easy',
              region: 'bay_area',
              showHints: true,
              enableTimer: true,
              soundEnabled: true,
              animationsEnabled: true,
              autoAdvance: false,
              soundSettings: {
                masterVolume: 0.7,
                effectsVolume: 0.8,
                musicVolume: 0.5,
                muted: false,
                enableBackgroundMusic: true,
                enableClickSounds: true,
                enableGameSounds: true,
                enableAchievementSounds: true
              },
              hintSettings: {
                maxHintsPerLevel: 3,
                hintCooldownMs: 30000,
                scorePenaltyPerHint: 50,
                freeHintsAllowed: 1,
                autoSuggestThreshold: 3,
                enableVisualIndicators: true,
                enableEducationalHints: true
              }
            },
            stats: {
              totalGamesPlayed: 0,
              totalScore: 0,
              bestScore: 0,
              averageAccuracy: 0,
              totalPlayTime: 0,
              favoriteDifficulty: 'easy',
              favoriteRegion: 'bay_area',
              countiesLearned: [],
              perfectPlacements: 0,
              longestStreak: 0
            },
            achievements: []
          };
        }
        return data;
      }
    });

    // Example future migration (1.0.0 -> 1.1.0)
    this.addMigration({
      version: '1.1.0',
      description: 'Add new achievement system and profile features',
      migrate: (data: any) => {
        const migrated = { ...data };
        
        // Add new fields if they don't exist
        if (!migrated.profiles) {
          migrated.profiles = [];
        }
        
        // Migrate old stats format to new format
        if (migrated.stats && Array.isArray(migrated.stats.countiesLearned)) {
          migrated.stats.countiesLearned = new Set(migrated.stats.countiesLearned);
        }
        
        // Add new achievement fields
        if (migrated.achievements && Array.isArray(migrated.achievements)) {
          migrated.achievements = migrated.achievements.map((achievement: any) => ({
            ...achievement,
            rarity: achievement.rarity || 'common',
            points: achievement.points || 10,
            hidden: achievement.hidden || false
          }));
        }
        
        // Add profile preferences
        migrated.profiles.forEach((profile: any) => {
          if (!profile.preferences) {
            profile.preferences = {
              theme: 'auto',
              language: 'en',
              notifications: true,
              autoSave: true,
              cloudSync: false,
              analytics: true
            };
          }
        });
        
        migrated.version = '1.1.0';
        return migrated;
      },
      rollback: (data: any) => {
        const rolledBack = { ...data };
        
        // Remove new fields
        if (rolledBack.profiles) {
          rolledBack.profiles.forEach((profile: any) => {
            delete profile.preferences;
          });
        }
        
        // Convert Set back to Array
        if (rolledBack.stats && rolledBack.stats.countiesLearned instanceof Set) {
          rolledBack.stats.countiesLearned = Array.from(rolledBack.stats.countiesLearned);
        }
        
        rolledBack.version = '1.0.0';
        return rolledBack;
      }
    });

    // Example migration (1.1.0 -> 1.2.0)
    this.addMigration({
      version: '1.2.0',
      description: 'Enhanced leaderboard and session tracking',
      migrate: (data: any) => {
        const migrated = { ...data };
        
        // Add new leaderboard fields
        if (migrated.leaderboard && Array.isArray(migrated.leaderboard)) {
          migrated.leaderboard = migrated.leaderboard.map((entry: any) => ({
            ...entry,
            accuracy: entry.accuracy || 0.8,
            date: entry.date || new Date().toISOString()
          }));
        }
        
        // Add session metadata
        if (migrated.sessions && Array.isArray(migrated.sessions)) {
          migrated.sessions = migrated.sessions.map((session: any) => ({
            ...session,
            achievementsUnlocked: session.achievementsUnlocked || [],
            endTime: session.endTime || session.startTime
          }));
        }
        
        // Add new settings
        if (migrated.settings) {
          if (!migrated.settings.soundSettings) {
            migrated.settings.soundSettings = {
              masterVolume: 0.7,
              effectsVolume: 0.8,
              musicVolume: 0.5,
              muted: false,
              enableBackgroundMusic: true,
              enableClickSounds: true,
              enableGameSounds: true,
              enableAchievementSounds: true
            };
          }
        }
        
        migrated.version = '1.2.0';
        return migrated;
      }
    });
  }

  public addMigration(migration: MigrationScript): void {
    this.migrations.set(migration.version, migration);
  }

  public getMigration(version: string): MigrationScript | undefined {
    return this.migrations.get(version);
  }

  public getAllMigrations(): MigrationScript[] {
    return Array.from(this.migrations.values()).sort((a, b) => 
      this.compareVersions(a.version, b.version)
    );
  }

  public async migrateData(fromVersion?: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      fromVersion: fromVersion || '0.0.0',
      toVersion: this.currentVersion,
      migrationsApplied: [],
      errors: []
    };

    try {
      // Get current stored version
      const storedVersion = fromVersion || this.getStoredVersion();
      result.fromVersion = storedVersion;

      if (storedVersion === this.currentVersion) {
        result.success = true;
        return result;
      }

      // Get all migrations that need to be applied
      const migrationsToApply = this.getMigrationsToApply(storedVersion, this.currentVersion);
      
      if (migrationsToApply.length === 0) {
        result.success = true;
        return result;
      }

      // Load current data
      let data = this.loadAllData();
      
      // Apply migrations in order
      for (const migration of migrationsToApply) {
        try {
          console.log(`Applying migration: ${migration.version} - ${migration.description}`);
          data = migration.migrate(data);
          result.migrationsApplied.push(migration.version);
        } catch (error) {
          const errorMsg = `Failed to apply migration ${migration.version}: ${error}`;
          console.error(errorMsg);
          result.errors.push(errorMsg);
          
          // Attempt rollback
          if (migration.rollback && result.migrationsApplied.length > 0) {
            try {
              data = migration.rollback(data);
              console.log(`Rolled back migration ${migration.version}`);
            } catch (rollbackError) {
              const rollbackMsg = `Failed to rollback migration ${migration.version}: ${rollbackError}`;
              console.error(rollbackMsg);
              result.errors.push(rollbackMsg);
            }
          }
          
          return result;
        }
      }

      // Save migrated data
      this.saveAllData(data);
      
      result.success = true;
      console.log(`Migration completed successfully from ${result.fromVersion} to ${result.toVersion}`);
      
    } catch (error) {
      const errorMsg = `Migration failed: ${error}`;
      console.error(errorMsg);
      result.errors.push(errorMsg);
    }

    return result;
  }

  private getStoredVersion(): string {
    try {
      const versionKey = 'california_puzzle_version';
      const version = localStorage.getItem(versionKey);
      return version || '0.0.0';
    } catch (error) {
      console.warn('Failed to get stored version:', error);
      return '0.0.0';
    }
  }

  private getMigrationsToApply(fromVersion: string, toVersion: string): MigrationScript[] {
    const allMigrations = this.getAllMigrations();
    
    return allMigrations.filter(migration => {
      const migrationVersion = migration.version;
      return this.compareVersions(migrationVersion, fromVersion) > 0 &&
             this.compareVersions(migrationVersion, toVersion) <= 0;
    });
  }

  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    
    return 0;
  }

  private loadAllData(): any {
    try {
      const data: any = {};
      
      // Load all storage keys
      const prefix = 'california_puzzle_';
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const shortKey = key.replace(prefix, '');
          const value = localStorage.getItem(key);
          if (value) {
            try {
              data[shortKey] = JSON.parse(value);
            } catch {
              data[shortKey] = value;
            }
          }
        }
      }
      
      return data;
    } catch (error) {
      console.error('Failed to load data for migration:', error);
      return {};
    }
  }

  private saveAllData(data: any): void {
    try {
      const prefix = 'california_puzzle_';
      
      // Save each data key
      Object.entries(data).forEach(([key, value]) => {
        const fullKey = prefix + key;
        try {
          const serialized = typeof value === 'string' ? value : JSON.stringify(value);
          localStorage.setItem(fullKey, serialized);
        } catch (error) {
          console.error(`Failed to save key ${key}:`, error);
        }
      });
      
      // Update version
      localStorage.setItem(prefix + 'version', this.currentVersion);
      
    } catch (error) {
      console.error('Failed to save migrated data:', error);
      throw error;
    }
  }

  public async createBackup(): Promise<string> {
    try {
      const data = this.loadAllData();
      const backup = {
        version: this.currentVersion,
        timestamp: new Date().toISOString(),
        data
      };
      
      return JSON.stringify(backup, null, 2);
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  public async restoreFromBackup(backupString: string): Promise<boolean> {
    try {
      const backup = JSON.parse(backupString);
      
      if (!backup.data || !backup.version) {
        throw new Error('Invalid backup format');
      }
      
      // Save backup data
      this.saveAllData(backup.data);
      
      // Run migration if needed
      const migrationResult = await this.migrateData(backup.version);
      
      return migrationResult.success;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return false;
    }
  }

  public getCurrentVersion(): string {
    return this.currentVersion;
  }

  public setCurrentVersion(version: string): void {
    this.currentVersion = version;
  }

  // Utility methods for testing
  public async testMigration(fromVersion: string, toVersion: string): Promise<MigrationResult> {
    const originalVersion = this.currentVersion;
    const originalData = this.loadAllData();
    
    try {
      this.currentVersion = toVersion;
      const result = await this.migrateData(fromVersion);
      
      // Restore original state
      this.saveAllData(originalData);
      
      return result;
    } finally {
      this.currentVersion = originalVersion;
    }
  }

  public clearAllData(): void {
    const prefix = 'california_puzzle_';
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

// Singleton instance
export const dataMigrationManager = new DataMigrationManager();

// Helper function to run migrations on app startup
export async function runStartupMigrations(): Promise<MigrationResult> {
  console.log('Running startup data migrations...');
  const result = await dataMigrationManager.migrateData();
  
  if (result.success) {
    console.log('Data migrations completed successfully');
    if (result.migrationsApplied.length > 0) {
      console.log('Applied migrations:', result.migrationsApplied);
    }
  } else {
    console.error('Data migration failed:', result.errors);
  }
  
  return result;
}

export default dataMigrationManager;
