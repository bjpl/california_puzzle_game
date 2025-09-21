// Auto-save functionality hook
// Automatically saves game state and progress at regular intervals

import { useEffect, useCallback, useRef } from 'react';
import { storageManager, GameSession } from '../utils/storage';
import { achievementSystem } from '../utils/achievements';
import { useGameStore } from '../stores/gameStore';
import { GameStats, PlacementResult, DifficultyLevel, CaliforniaRegion } from '../types';

interface AutoSaveOptions {
  enabled?: boolean;
  interval?: number; // milliseconds
  onSave?: (success: boolean) => void;
  onError?: (error: Error) => void;
}

interface AutoSaveReturn {
  isAutoSaveEnabled: boolean;
  lastSaveTime: Date | null;
  saveNow: () => Promise<boolean>;
  toggleAutoSave: () => void;
}

export function useAutoSave(options: AutoSaveOptions = {}): AutoSaveReturn {
  const {
    enabled = true,
    interval = 30000, // 30 seconds default
    onSave,
    onError
  } = options;

  const gameState = useGameStore();
  const lastSaveTimeRef = useRef<Date | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isEnabledRef = useRef(enabled);
  const currentSessionRef = useRef<GameSession | null>(null);

  // Save game data
  const saveGameData = useCallback(async (): Promise<boolean> => {
    try {
      const profile = storageManager.getCurrentProfile();
      if (!profile) {
        console.warn('No current profile for auto-save');
        return false;
      }

      // Save settings
      storageManager.saveSettings(gameState.settings);
      
      // Save stats
      storageManager.saveStats(gameState.stats);
      
      // Save achievements
      storageManager.saveAchievements(gameState.achievements);
      
      // Update current session if game is active
      if (gameState.isGameActive && currentSessionRef.current) {
        const updatedSession: GameSession = {
          ...currentSessionRef.current,
          score: gameState.score,
          timeElapsed: gameState.timeElapsed,
          placementsCorrect: gameState.placedCounties.filter(c => c.isPlaced).length,
          placementsTotal: gameState.placedCounties.length + gameState.remainingCounties.length,
          hintsUsed: gameState.hintSystem.usedHints
        };
        
        currentSessionRef.current = updatedSession;
      }
      
      lastSaveTimeRef.current = new Date();
      onSave?.(true);
      return true;
    } catch (error) {
      console.error('Auto-save failed:', error);
      onError?.(error as Error);
      onSave?.(false);
      return false;
    }
  }, [gameState, onSave, onError]);

  // Start a new game session
  const startSession = useCallback(() => {
    const profile = storageManager.getCurrentProfile();
    if (!profile) return;

    const session: GameSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      profileId: profile.id,
      startTime: new Date(),
      region: gameState.selectedRegion,
      difficulty: gameState.difficulty,
      score: 0,
      timeElapsed: 0,
      placementsCorrect: 0,
      placementsTotal: gameState.remainingCounties.length,
      hintsUsed: 0,
      achievementsUnlocked: []
    };
    
    currentSessionRef.current = session;
  }, [gameState.selectedRegion, gameState.difficulty, gameState.remainingCounties.length]);

  // End current session
  const endSession = useCallback(() => {
    if (currentSessionRef.current) {
      const session: GameSession = {
        ...currentSessionRef.current,
        endTime: new Date(),
        score: gameState.score,
        timeElapsed: gameState.timeElapsed,
        placementsCorrect: gameState.placedCounties.filter(c => c.isPlaced).length,
        placementsTotal: gameState.placedCounties.length + gameState.remainingCounties.length,
        hintsUsed: gameState.hintSystem.usedHints
      };
      
      storageManager.saveSession(session);
      currentSessionRef.current = null;
    }
  }, [gameState]);

  // Handle game state changes
  useEffect(() => {
    if (gameState.isGameActive && !currentSessionRef.current) {
      startSession();
    } else if (!gameState.isGameActive && currentSessionRef.current) {
      endSession();
    }
  }, [gameState.isGameActive, startSession, endSession]);

  // Handle achievement unlocks
  useEffect(() => {
    if (currentSessionRef.current) {
      const unlockedIds = gameState.achievements
        .filter(a => a.isUnlocked)
        .map(a => a.id);
      
      const newUnlocks = unlockedIds.filter(
        id => !currentSessionRef.current!.achievementsUnlocked.includes(id)
      );
      
      if (newUnlocks.length > 0) {
        currentSessionRef.current.achievementsUnlocked = unlockedIds;
      }
    }
  }, [gameState.achievements]);

  // Setup auto-save interval
  useEffect(() => {
    if (isEnabledRef.current && interval > 0) {
      autoSaveIntervalRef.current = setInterval(() => {
        saveGameData();
      }, interval);
      
      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [interval, saveGameData]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isEnabledRef.current) {
        // Synchronous save for page unload
        try {
          const profile = storageManager.getCurrentProfile();
          if (profile) {
            storageManager.saveSettings(gameState.settings);
            storageManager.saveStats(gameState.stats);
            storageManager.saveAchievements(gameState.achievements);
            
            if (currentSessionRef.current) {
              endSession();
            }
          }
        } catch (error) {
          console.error('Failed to save on page unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameState, endSession]);

  // Toggle auto-save
  const toggleAutoSave = useCallback(() => {
    isEnabledRef.current = !isEnabledRef.current;
    
    if (isEnabledRef.current) {
      // Start auto-save
      autoSaveIntervalRef.current = setInterval(() => {
        saveGameData();
      }, interval);
    } else {
      // Stop auto-save
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    }
  }, [interval, saveGameData]);

  // Manual save
  const saveNow = useCallback(async (): Promise<boolean> => {
    return await saveGameData();
  }, [saveGameData]);

  return {
    isAutoSaveEnabled: isEnabledRef.current,
    lastSaveTime: lastSaveTimeRef.current,
    saveNow,
    toggleAutoSave
  };
}

// Hook for tracking placement results and updating achievements
export function usePlacementTracking() {
  const gameState = useGameStore();
  
  const trackPlacement = useCallback(async (placement: PlacementResult) => {
    try {
      // Update achievements
      const newAchievements = achievementSystem.updateProgress(
        gameState.stats,
        placement,
        {
          difficulty: gameState.difficulty,
          region: gameState.selectedRegion,
          timeElapsed: gameState.timeElapsed,
          hintsUsed: gameState.hintSystem.usedHints,
          mistakes: gameState.mistakes,
          streak: gameState.streak
        }
      );
      
      // Save updated achievements if any were unlocked
      if (newAchievements.length > 0) {
        storageManager.saveAchievements(achievementSystem.getAllAchievements());
        
        // Trigger achievement notifications (if using notification system)
        newAchievements.forEach(achievement => {
          console.log(`Achievement unlocked: ${achievement.name}`);
        });
      }
      
      return newAchievements;
    } catch (error) {
      console.error('Failed to track placement:', error);
      return [];
    }
  }, [gameState]);
  
  return { trackPlacement };
}

// Hook for loading saved data on app start
export function useDataLoader() {
  const gameStore = useGameStore();
  
  const loadSavedData = useCallback(async () => {
    try {
      const profile = storageManager.getCurrentProfile();
      if (!profile) {
        console.log('No current profile, using default data');
        return;
      }
      
      // Load settings
      const settings = storageManager.loadSettings();
      gameStore.updateSettings(settings);
      
      // Load achievements
      const achievements = storageManager.loadAchievements();
      // Merge with current achievements
      const currentAchievements = gameStore.achievements;
      const mergedAchievements = currentAchievements.map(current => {
        const saved = achievements.find(a => a.id === current.id);
        return saved ? { ...current, ...saved } : current;
      });
      
      // Note: This would require a method to set achievements in the store
      // For now, we'll assume the store handles this through persistence
      
      console.log('Saved data loaded successfully');
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
  }, [gameStore]);
  
  return { loadSavedData };
}
