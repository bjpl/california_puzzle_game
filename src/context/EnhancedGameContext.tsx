// Enhanced Game Context with Storage and Progress Integration
// Provides centralized state management with persistent storage

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useAutoSave } from '../hooks/useAutoSave';
import { useProgress } from '../hooks/useProgress';
import { useAchievements, useAchievementNotifications } from '../hooks/useAchievements';
import { storageManager, UserProfile } from '../utils/storage';
import { runStartupMigrations } from '../utils/dataMigration';
import { GameSettings, GameStats, Achievement, PlacementResult } from '../types';
import { AchievementDefinition } from '../utils/achievements';

interface EnhancedGameContextValue {
  // Game State
  gameState: ReturnType<typeof useGameStore>;
  
  // User Management
  currentProfile: UserProfile | null;
  profiles: UserProfile[];
  createProfile: (name: string, avatar?: string) => Promise<UserProfile>;
  switchProfile: (profileId: string) => Promise<boolean>;
  deleteProfile: (profileId: string) => Promise<boolean>;
  
  // Progress and Analytics
  progress: ReturnType<typeof useProgress>;
  
  // Achievements
  achievements: ReturnType<typeof useAchievements>;
  achievementNotifications: ReturnType<typeof useAchievementNotifications>;
  
  // Auto-save
  autoSave: ReturnType<typeof useAutoSave>;
  
  // Data Management
  exportGameData: () => Promise<string>;
  importGameData: (data: string) => Promise<boolean>;
  resetAllData: () => Promise<boolean>;
  
  // System Status
  isInitialized: boolean;
  migrationStatus: 'pending' | 'running' | 'completed' | 'failed';
  error: string | null;
}

const EnhancedGameContext = createContext<EnhancedGameContextValue | null>(null);

interface EnhancedGameProviderProps {
  children: ReactNode;
}

export const EnhancedGameProvider: React.FC<EnhancedGameProviderProps> = ({ children }) => {
  // Core game state
  const gameState = useGameStore();
  
  // User management
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  
  // System status
  const [isInitialized, setIsInitialized] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'pending' | 'running' | 'completed' | 'failed'>('pending');
  const [error, setError] = useState<string | null>(null);
  
  // Hooks
  const autoSave = useAutoSave({
    enabled: currentProfile?.preferences.autoSave ?? true,
    interval: 30000, // 30 seconds
    onError: (err) => setError(err.message)
  });
  
  const progress = useProgress();
  const achievements = useAchievements();
  const achievementNotifications = useAchievementNotifications();
  
  // Initialize the context
  useEffect(() => {
    const initialize = async () => {
      try {
        setMigrationStatus('running');
        
        // Run data migrations
        const migrationResult = await runStartupMigrations();
        if (!migrationResult.success) {
          throw new Error(`Migration failed: ${migrationResult.errors.join(', ')}`);
        }
        
        setMigrationStatus('completed');
        
        // Load profiles
        const loadedProfiles = storageManager.getProfiles();
        setProfiles(loadedProfiles);
        
        // Load current profile
        const current = storageManager.getCurrentProfile();
        setCurrentProfile(current);
        
        // If no current profile but profiles exist, use the first one
        if (!current && loadedProfiles.length > 0) {
          storageManager.setCurrentProfile(loadedProfiles[0]);
          setCurrentProfile(loadedProfiles[0]);
        }
        
        // Load saved settings if profile exists
        if (current) {
          const savedSettings = storageManager.loadSettings();
          gameState.updateSettings(savedSettings);
        }
        
        setIsInitialized(true);
        
      } catch (err) {
        console.error('Failed to initialize Enhanced Game Context:', err);
        setError(err instanceof Error ? err.message : 'Initialization failed');
        setMigrationStatus('failed');
      }
    };
    
    initialize();
  }, []);

  // Profile management functions
  const createProfile = async (name: string, avatar?: string): Promise<UserProfile> => {
    try {
      const profile = storageManager.createProfile(name, avatar);
      const updatedProfiles = storageManager.getProfiles();
      setProfiles(updatedProfiles);
      
      // Auto-switch to new profile if it's the first one
      if (updatedProfiles.length === 1) {
        await switchProfile(profile.id);
      }
      
      return profile;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create profile';
      setError(error);
      throw err;
    }
  };
  
  const switchProfile = async (profileId: string): Promise<boolean> => {
    try {
      const profile = storageManager.getProfile(profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      // Save current game state if there's an active profile
      if (currentProfile) {
        await autoSave.saveNow();
      }
      
      // Switch to new profile
      storageManager.setCurrentProfile(profile);
      setCurrentProfile(profile);
      
      // Load profile's settings and data
      const settings = storageManager.loadSettings();
      gameState.updateSettings(settings);
      
      // Refresh progress and achievements
      await progress.refreshProgress();
      achievements.refreshAchievements();
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to switch profile';
      setError(error);
      return false;
    }
  };
  
  const deleteProfile = async (profileId: string): Promise<boolean> => {
    try {
      // Don't delete the current profile without switching first
      if (currentProfile?.id === profileId) {
        const otherProfiles = profiles.filter(p => p.id !== profileId);
        if (otherProfiles.length > 0) {
          await switchProfile(otherProfiles[0].id);
        } else {
          storageManager.setCurrentProfile(null);
          setCurrentProfile(null);
        }
      }
      
      storageManager.deleteProfile(profileId);
      const updatedProfiles = storageManager.getProfiles();
      setProfiles(updatedProfiles);
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete profile';
      setError(error);
      return false;
    }
  };
  
  // Data management functions
  const exportGameData = async (): Promise<string> => {
    try {
      // Save current state first
      await autoSave.saveNow();
      
      // Export all data
      return storageManager.exportData();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to export data';
      setError(error);
      throw err;
    }
  };
  
  const importGameData = async (data: string): Promise<boolean> => {
    try {
      const success = storageManager.importData(data);
      if (success) {
        // Reload profiles and current profile
        const loadedProfiles = storageManager.getProfiles();
        setProfiles(loadedProfiles);
        
        const current = storageManager.getCurrentProfile();
        setCurrentProfile(current);
        
        // Refresh all hooks
        if (current) {
          const settings = storageManager.loadSettings();
          gameState.updateSettings(settings);
        }
        
        await progress.refreshProgress();
        achievements.refreshAchievements();
      }
      
      return success;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to import data';
      setError(error);
      return false;
    }
  };
  
  const resetAllData = async (): Promise<boolean> => {
    try {
      // Confirm with user (this would typically be done in the UI)
      if (!window.confirm('Are you sure you want to reset all game data? This cannot be undone.')) {
        return false;
      }
      
      // Clear all data
      storageManager.clearAllData();
      
      // Reset local state
      setProfiles([]);
      setCurrentProfile(null);
      setError(null);
      
      // Reset game state to defaults
      gameState.resetGame();
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to reset data';
      setError(error);
      return false;
    }
  };
  
  // Handle achievement unlocks with notifications
  useEffect(() => {
    // Listen for new achievement unlocks
    const unreadNotifications = achievements.notifications.filter(n => !n.isRead);
    
    if (unreadNotifications.length > 0) {
      // Show the most recent notification
      const latest = unreadNotifications[unreadNotifications.length - 1];
      achievementNotifications.showAchievementNotification(latest.achievement);
    }
  }, [achievements.notifications, achievementNotifications]);
  
  // Context value
  const contextValue: EnhancedGameContextValue = {
    gameState,
    currentProfile,
    profiles,
    createProfile,
    switchProfile,
    deleteProfile,
    progress,
    achievements,
    achievementNotifications,
    autoSave,
    exportGameData,
    importGameData,
    resetAllData,
    isInitialized,
    migrationStatus,
    error
  };
  
  return (
    <EnhancedGameContext.Provider value={contextValue}>
      {children}
    </EnhancedGameContext.Provider>
  );
};

// Hook to use the enhanced game context
export const useEnhancedGame = (): EnhancedGameContextValue => {
  const context = useContext(EnhancedGameContext);
  if (!context) {
    throw new Error('useEnhancedGame must be used within an EnhancedGameProvider');
  }
  return context;
};

// Higher-order component for components that need the enhanced context
export const withEnhancedGame = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => (
    <EnhancedGameProvider>
      <Component {...props} />
    </EnhancedGameProvider>
  );
};

export default EnhancedGameContext;
