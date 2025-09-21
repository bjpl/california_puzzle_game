import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { californiaCounties } from '../data/californiaCounties';
import { allCaliforniaCounties, County as CompleteCounty } from '../data/californiaCountiesComplete';
import { useTimer, TimerState } from '../hooks/useTimer';
import { calculateScore, calculateGameMetrics, ScoreCalculation, GameMetrics } from '../utils/scoring';
import { saveLeaderboardEntry, LeaderboardEntry } from '../utils/leaderboard';

// Use the complete County interface but make some fields optional for compatibility
interface County {
  id: string;
  name: string;
  region: string;
  capital?: string;
  population?: number;
  area?: number;
  founded?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  funFact?: string;
}

interface PlacementRecord {
  countyId: string;
  isCorrect: boolean;
  placementTime: number;
  region: string;
  scoreCalculation: ScoreCalculation;
  timestamp: number;
}

interface GameSettings {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  maxTime?: number; // Maximum game time in milliseconds
  enableTimer: boolean;
  enableScoring: boolean;
  showMultipliers: boolean;
  playerName: string;
}

interface GameContextType {
  // Game state
  counties: County[];
  placedCounties: Set<string>;
  currentCounty: County | null;
  score: number;
  mistakes: number;
  isGameComplete: boolean;
  isGameStarted: boolean;
  isPaused: boolean;
  hints: number;
  hintedCounty: string | null;
  showRegions: boolean;

  // Timer state
  timerState: TimerState;

  // Scoring and analytics
  currentStreak: number;
  maxStreak: number;
  lastScoreCalculation: ScoreCalculation | null;
  gameMetrics: GameMetrics;
  placementHistory: PlacementRecord[];
  completedRegions: Set<string>;

  // Settings
  gameSettings: GameSettings;

  // Actions
  selectCounty: (county: County) => void;
  placeCounty: (countyId: string, isCorrect: boolean, placementAccuracy?: number) => void;
  clearCurrentCounty: () => void;
  resetGame: () => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  recordSplitTime: (name: string) => void;
  useHint: () => boolean;
  toggleShowRegions: () => void;

  // Leaderboard
  saveToLeaderboard: () => LeaderboardEntry | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  // Use ALL 58 California counties from the complete dataset
  const gameCounties: County[] = allCaliforniaCounties;

  // Game settings with defaults
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    difficulty: 'medium',
    maxTime: 300000, // 5 minutes default
    enableTimer: true,
    enableScoring: true,
    showMultipliers: true,
    playerName: 'Player'
  });

  // Basic game state
  const [counties] = useState<County[]>(gameCounties);
  const [placedCounties, setPlacedCounties] = useState<Set<string>>(new Set());
  const [currentCounty, setCurrentCounty] = useState<County | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hints, setHints] = useState(3);
  const [hintedCounty, setHintedCounty] = useState<string | null>(null);
  const [showRegions, setShowRegions] = useState(false);

  // Advanced scoring state
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lastScoreCalculation, setLastScoreCalculation] = useState<ScoreCalculation | null>(null);
  const [placementHistory, setPlacementHistory] = useState<PlacementRecord[]>([]);
  const [completedRegions, setCompletedRegions] = useState<Set<string>>(new Set());
  const [countySelectionTime, setCountySelectionTime] = useState<number>(0);

  // Timer setup
  const [timerState, timerControls] = useTimer({
    maxDuration: gameSettings.maxTime,
    autoStart: false,
    onComplete: () => setIsGameComplete(true),
    onTick: (elapsed, remaining) => {
      // Could trigger urgency effects here
    }
  });

  // Game completion effect
  useEffect(() => {
    if (placedCounties.size === counties.length && counties.length > 0) {
      setIsGameComplete(true);
      timerControls.stop();
    }
  }, [placedCounties, counties, timerControls]);

  // Track completed regions
  useEffect(() => {
    const newCompletedRegions = new Set<string>();
    const regionCounts: Record<string, { total: number; completed: number }> = {};

    // Count total counties per region
    counties.forEach(county => {
      if (!regionCounts[county.region]) {
        regionCounts[county.region] = { total: 0, completed: 0 };
      }
      regionCounts[county.region].total++;
    });

    // Count completed counties per region
    counties.forEach(county => {
      if (placedCounties.has(county.id)) {
        regionCounts[county.region].completed++;
      }
    });

    // Mark regions as completed if all counties are placed
    Object.entries(regionCounts).forEach(([region, counts]) => {
      if (counts.completed === counts.total) {
        newCompletedRegions.add(region);
      }
    });

    setCompletedRegions(newCompletedRegions);
  }, [placedCounties, counties]);

  // Calculate current game metrics
  const gameMetrics = calculateGameMetrics(
    placementHistory,
    timerState.elapsed
  );

  const selectCounty = useCallback((county: County) => {
    setCurrentCounty(county);
    setCountySelectionTime(Date.now());

    // Record split time for county selection
    if (gameSettings.enableTimer) {
      timerControls.recordSplit(`Selected ${county.name}`);
    }
  }, [gameSettings.enableTimer, timerControls]);

  const placeCounty = useCallback((countyId: string, isCorrect: boolean, placementAccuracy: number = 1.0) => {
    const placementTime = Date.now() - countySelectionTime;
    const county = counties.find(c => c.id === countyId);

    if (!county) return;

    let newStreak = currentStreak;
    let scoreCalculation: ScoreCalculation;

    if (isCorrect && currentCounty && currentCounty.id === countyId) {
      // Correct placement
      newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      setMaxStreak(prev => Math.max(prev, newStreak));

      // Calculate advanced score
      if (gameSettings.enableScoring) {
        scoreCalculation = calculateScore(
          true,
          placementTime,
          newStreak,
          gameSettings.difficulty,
          county.region,
          completedRegions,
          Object.keys(counties.reduce((acc, c) => ({ ...acc, [c.region]: true }), {})).length,
          placementAccuracy
        );

        setScore(prev => prev + scoreCalculation.totalPoints);
        setLastScoreCalculation(scoreCalculation);
      } else {
        // Simple scoring
        scoreCalculation = {
          basePoints: 100,
          timeBonus: 0,
          accuracyPoints: 100,
          streakPoints: 0,
          difficultyPoints: 0,
          regionalPoints: 0,
          totalPoints: 100,
          modifiers: {
            timeBonus: 0,
            accuracyMultiplier: 1,
            streakBonus: 0,
            difficultyMultiplier: 1,
            regionalBonus: 0,
            perfectPlacementBonus: 0
          }
        };
        setScore(prev => prev + 100);
      }

      setPlacedCounties(prev => new Set([...prev, countyId]));
      setCurrentCounty(null);

      // Record split time for successful placement
      if (gameSettings.enableTimer) {
        timerControls.recordSplit(`Placed ${county.name}`);
      }
    } else {
      // Incorrect placement
      newStreak = 0;
      setCurrentStreak(0);
      setMistakes(prev => prev + 1);

      if (gameSettings.enableScoring) {
        scoreCalculation = calculateScore(
          false,
          placementTime,
          0,
          gameSettings.difficulty,
          county.region,
          completedRegions,
          Object.keys(counties.reduce((acc, c) => ({ ...acc, [c.region]: true }), {})).length,
          0
        );

        setScore(prev => Math.max(0, prev + scoreCalculation.totalPoints)); // totalPoints will be negative
        setLastScoreCalculation(scoreCalculation);
      } else {
        // Simple penalty
        scoreCalculation = {
          basePoints: 0,
          timeBonus: 0,
          accuracyPoints: 0,
          streakPoints: 0,
          difficultyPoints: 0,
          regionalPoints: 0,
          totalPoints: -10,
          modifiers: {
            timeBonus: 0,
            accuracyMultiplier: 0,
            streakBonus: 0,
            difficultyMultiplier: 1,
            regionalBonus: 0,
            perfectPlacementBonus: 0
          }
        };
        setScore(prev => Math.max(0, prev - 10));
      }
    }

    // Record placement in history
    const placementRecord: PlacementRecord = {
      countyId,
      isCorrect,
      placementTime,
      region: county.region,
      scoreCalculation,
      timestamp: Date.now()
    };

    setPlacementHistory(prev => [...prev, placementRecord]);
  }, [currentCounty, currentStreak, countySelectionTime, counties, completedRegions,
      gameSettings.difficulty, gameSettings.enableScoring, gameSettings.enableTimer, timerControls]);

  const clearCurrentCounty = useCallback(() => {
    setCurrentCounty(null);
    setCountySelectionTime(0);
  }, []);

  const resetGame = useCallback(() => {
    // Reset all game state
    setPlacedCounties(new Set());
    setCurrentCounty(null);
    setScore(0);
    setMistakes(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setLastScoreCalculation(null);
    setPlacementHistory([]);
    setCompletedRegions(new Set());
    setCountySelectionTime(0);
    setIsGameComplete(false);
    setIsGameStarted(true);
    setIsPaused(false);
    setHints(3);
    setHintedCounty(null);

    // Reset timer
    timerControls.reset();
  }, [timerControls]);

  const startGame = useCallback(() => {
    setIsGameStarted(true);
    setIsPaused(false);

    if (gameSettings.enableTimer) {
      timerControls.start();
    }
  }, [gameSettings.enableTimer, timerControls]);

  const pauseGame = useCallback(() => {
    setIsPaused(true);
    if (gameSettings.enableTimer) {
      timerControls.pause();
    }
  }, [gameSettings.enableTimer, timerControls]);

  const resumeGame = useCallback(() => {
    setIsPaused(false);
    if (gameSettings.enableTimer) {
      timerControls.resume();
    }
  }, [gameSettings.enableTimer, timerControls]);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setGameSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const recordSplitTime = useCallback((name: string) => {
    if (gameSettings.enableTimer) {
      timerControls.recordSplit(name);
    }
  }, [gameSettings.enableTimer, timerControls]);

  const saveToLeaderboard = useCallback((): LeaderboardEntry | null => {
    if (isGameComplete && gameSettings.enableScoring) {
      return saveLeaderboardEntry(
        gameSettings.playerName,
        score,
        gameMetrics,
        gameSettings.difficulty
      );
    }
    return null;
  }, [isGameComplete, gameSettings.enableScoring, gameSettings.playerName,
      score, gameMetrics, gameSettings.difficulty]);

  const useHint = useCallback(() => {
    if (hints <= 0 || !currentCounty) return false;

    // Deduct a hint
    setHints(prev => prev - 1);

    // Deduct points for using a hint (50 points like Colombia app)
    setScore(prev => Math.max(0, prev - 50));

    return true;
  }, [hints, currentCounty]);

  const toggleShowRegions = useCallback(() => {
    setShowRegions(prev => !prev);
  }, []);

  return (
    <GameContext.Provider
      value={{
        // Game state
        counties,
        placedCounties,
        currentCounty,
        score,
        mistakes,
        isGameComplete,
        isGameStarted,
        isPaused,
        hints,
        hintedCounty,
        showRegions,

        // Timer state
        timerState,

        // Scoring and analytics
        currentStreak,
        maxStreak,
        lastScoreCalculation,
        gameMetrics,
        placementHistory,
        completedRegions,

        // Settings
        gameSettings,

        // Actions
        selectCounty,
        placeCounty,
        clearCurrentCounty,
        resetGame,
        startGame,
        pauseGame,
        resumeGame,
        updateSettings,
        recordSplitTime,
        useHint,
        toggleShowRegions,

        // Leaderboard
        saveToLeaderboard,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}