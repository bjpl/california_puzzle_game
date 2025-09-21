// Custom hook for localStorage with automatic serialization and error handling

import { useState, useEffect, useCallback } from 'react';
import { storageManager } from '../utils/storage';

type SetValue<T> = T | ((val: T) => T);

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storageManager['getItem']<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        setIsLoading(true);
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        storageManager['setItem'](key, valueToStore);
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      } finally {
        setIsLoading(false);
      }
    },
    [key, storedValue]
  );

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (newValue: T) => {
      setStoredValue(newValue);
    };

    storageManager.addListener(key, handleStorageChange);

    return () => {
      storageManager.removeListener(key, handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue, isLoading];
}

// Hook for profile-specific data
export function useProfileStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, boolean] {
  const profile = storageManager.getCurrentProfile();
  const profileKey = profile ? `${profile.id}_${key}` : `guest_${key}`;
  
  return useLocalStorage(profileKey, initialValue);
}

// Hook for settings with automatic persistence
export function useSettings() {
  const [settings, setSettings] = useState(() => storageManager.loadSettings());
  const [isLoading, setIsLoading] = useState(false);

  const updateSettings = useCallback(
    (newSettings: Partial<typeof settings>) => {
      setIsLoading(true);
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      storageManager.saveSettings(updated);
      setIsLoading(false);
    },
    [settings]
  );

  return { settings, updateSettings, isLoading };
}

// Hook for statistics with automatic persistence
export function useStats() {
  const [stats, setStats] = useState(() => storageManager.loadStats());
  const [isLoading, setIsLoading] = useState(false);

  const updateStats = useCallback(
    (newStats: Partial<typeof stats>) => {
      setIsLoading(true);
      const updated = { ...stats, ...newStats };
      setStats(updated);
      storageManager.saveStats(updated);
      setIsLoading(false);
    },
    [stats]
  );

  const resetStats = useCallback(() => {
    setIsLoading(true);
    const defaultStats = {
      totalGamesPlayed: 0,
      totalScore: 0,
      bestScore: 0,
      averageAccuracy: 0,
      totalPlayTime: 0,
      favoriteDifficulty: 'easy' as const,
      favoriteRegion: 'bay_area' as const,
      countiesLearned: new Set<string>(),
      perfectPlacements: 0,
      longestStreak: 0
    };
    setStats(defaultStats);
    storageManager.saveStats(defaultStats);
    setIsLoading(false);
  }, []);

  return { stats, updateStats, resetStats, isLoading };
}
