import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CaliforniaMapCanvas from './CaliforniaMapCanvas';
import CountyTray from './CountyTray';
import RegionSelector from './RegionSelector';
import {
  GameContainerProps,
  County,
  CountyPiece,
  Position,
  CaliforniaRegion,
  DifficultyLevel,
  GameMode,
  PlacementResult,
  Achievement
} from '@/types';
import { useGameStore } from '@/stores/gameStore';
import { getCountiesByRegion } from '@/utils/californiaData';

interface GameContainerState {
  gameStarted: boolean;
  currentRegion: CaliforniaRegion;
  currentDifficulty: DifficultyLevel;
  gameMode: GameMode;
  showSettings: boolean;
  showAchievements: boolean;
  recentPlacement?: PlacementResult;
  newAchievements: Achievement[];
}

const CaliforniaGameContainer: React.FC<GameContainerProps> = ({
  initialSettings,
  onGameComplete
}) => {
  const {
    // Game state
    isGameActive,
    isPaused,
    score,
    timeElapsed,
    streak,
    placedCounties,
    remainingCounties,
    currentHint,

    // Actions
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
    placeCounty,
    removeCounty,
    moveCounty,
    updateTimer,
    useHint,

    // Settings
    settings,
    updateSettings,

    // Stats and achievements
    stats,
    achievements,
    checkAchievements
  } = useGameStore();

  const [containerState, setContainerState] = useState<GameContainerState>({
    gameStarted: false,
    currentRegion: initialSettings?.region || CaliforniaRegion.BAY_AREA,
    currentDifficulty: initialSettings?.difficulty || DifficultyLevel.EASY,
    gameMode: GameMode.PRACTICE,
    showSettings: false,
    showAchievements: false,
    newAchievements: []
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Available counties for current region
  const availableCounties = getCountiesByRegion(containerState.currentRegion);

  // Initialize county pieces from available counties
  const initializeCountyPieces = useCallback((): CountyPiece[] => {
    return availableCounties.map((county, index) => ({
      ...county,
      isPlaced: false,
      currentPosition: { x: 0, y: 0 },
      targetPosition: { x: 0, y: 0 }, // Will be calculated based on map projection
      rotation: 0,
      scale: 1,
      zIndex: index
    }));
  }, [availableCounties]);

  // Start new game
  const handleStartGame = useCallback(() => {
    const countyPieces = initializeCountyPieces();

    startGame(containerState.currentRegion, containerState.currentDifficulty);

    setContainerState(prev => ({
      ...prev,
      gameStarted: true,
      recentPlacement: undefined,
      newAchievements: []
    }));

    // Start timer for timed modes
    if (settings.enableTimer && containerState.gameMode !== GameMode.PRACTICE) {
      timerRef.current = setInterval(() => {
        updateTimer(100); // Update every 100ms for smooth timer
      }, 100);
    }
  }, [containerState.currentRegion, containerState.currentDifficulty, containerState.gameMode, settings.enableTimer, startGame, updateTimer, initializeCountyPieces]);

  // Handle game pause/resume
  const handlePauseToggle = useCallback(() => {
    if (isPaused) {
      resumeGame();
      if (timerRef.current) {
        timerRef.current = setInterval(() => updateTimer(100), 100);
      }
    } else {
      pauseGame();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isPaused, resumeGame, pauseGame, updateTimer]);

  // Handle county drag start
  const handleCountyDrag = useCallback((county: CountyPiece) => {
    // Could add visual feedback here
    console.log('Dragging county:', county.name);
  }, []);

  // Handle county drop
  const handleCountyDrop = useCallback((county: CountyPiece, position: Position) => {
    if (!isGameActive || isPaused) return;

    const placement = placeCounty(county, position);

    setContainerState(prev => ({
      ...prev,
      recentPlacement: placement
    }));

    // Check for newly unlocked achievements
    const newAchievements = checkAchievements(placement);
    if (newAchievements.length > 0) {
      setContainerState(prev => ({
        ...prev,
        newAchievements: [...prev.newAchievements, ...newAchievements]
      }));
    }

    // Check for game completion
    if (remainingCounties.length === 1) { // This county will be removed after placement
      setTimeout(() => {
        handleGameComplete();
      }, 500);
    }
  }, [isGameActive, isPaused, placeCounty, checkAchievements, remainingCounties.length]);

  // Handle county drag end (including failed drops)
  const handleCountyDragEnd = useCallback((county: CountyPiece, position: Position) => {
    // For now, this will be handled by handleCountyDrop if successful
    // Could add logic here for failed drop attempts
  }, []);

  // Handle game completion
  const handleGameComplete = useCallback(() => {
    endGame();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (onGameComplete) {
      onGameComplete(score, stats);
    }

    setContainerState(prev => ({
      ...prev,
      gameStarted: false
    }));
  }, [endGame, score, stats, onGameComplete]);

  // Handle region change
  const handleRegionChange = useCallback((region: CaliforniaRegion) => {
    if (isGameActive) {
      // Confirm region change during active game
      const confirm = window.confirm('Changing region will end the current game. Continue?');
      if (!confirm) return;

      resetGame();
    }

    setContainerState(prev => ({
      ...prev,
      currentRegion: region,
      gameStarted: false
    }));
  }, [isGameActive, resetGame]);

  // Handle difficulty change
  const handleDifficultyChange = useCallback((difficulty: DifficultyLevel) => {
    if (isGameActive) {
      const confirm = window.confirm('Changing difficulty will end the current game. Continue?');
      if (!confirm) return;

      resetGame();
    }

    setContainerState(prev => ({
      ...prev,
      currentDifficulty: difficulty,
      gameStarted: false
    }));

    updateSettings({ difficulty });
  }, [isGameActive, resetGame, updateSettings]);

  // Handle hint request
  const handleUseHint = useCallback(() => {
    if (remainingCounties.length > 0) {
      useHint();
    }
  }, [remainingCounties.length, useHint]);

  // Format time display
  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate game progress percentage
  const getProgressPercentage = (): number => {
    const total = availableCounties.length;
    const placed = placedCounties.length;
    return total > 0 ? (placed / total) * 100 : 0;
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div ref={gameContainerRef} className="california-game-container">
      {/* Game Header */}
      <div className="game-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Title and Region */}
        <div className="header-left">
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#111827' }}>
            California Counties Puzzle
          </h1>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '2px' }}>
            {containerState.currentRegion.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {containerState.currentDifficulty} Mode
          </div>
        </div>

        {/* Game Stats */}
        <div className="game-stats" style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center'
        }}>
          {/* Score */}
          <div className="stat-item">
            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>Score</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              {score.toLocaleString()}
            </div>
          </div>

          {/* Timer */}
          {settings.enableTimer && (
            <div className="stat-item">
              <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>Time</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                {formatTime(timeElapsed)}
              </div>
            </div>
          )}

          {/* Streak */}
          <div className="stat-item">
            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>Streak</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: streak > 0 ? '#f59e0b' : '#111827' }}>
              {streak}
            </div>
          </div>

          {/* Progress */}
          <div className="stat-item">
            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>Progress</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              {placedCounties.length}/{availableCounties.length}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="header-actions" style={{
          display: 'flex',
          gap: '8px'
        }}>
          {/* Hint Button */}
          {settings.showHints && remainingCounties.length > 0 && (
            <button
              onClick={handleUseHint}
              disabled={!isGameActive || isPaused}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              💡 Hint
            </button>
          )}

          {/* Pause/Resume Button */}
          {isGameActive && (
            <button
              onClick={handlePauseToggle}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
          )}

          {/* Start/Reset Button */}
          <button
            onClick={containerState.gameStarted ? () => resetGame() : handleStartGame}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#3b82f6',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {containerState.gameStarted ? '🔄 Reset' : '🎮 Start Game'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar" style={{
        height: '4px',
        backgroundColor: '#e5e7eb',
        position: 'relative'
      }}>
        <div
          style={{
            height: '100%',
            backgroundColor: '#10b981',
            width: `${getProgressPercentage()}%`,
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {/* Main Game Area */}
      <div className="game-main" style={{
        display: 'flex',
        height: 'calc(100vh - 120px)',
        backgroundColor: '#f9fafb'
      }}>
        {/* Left Sidebar - Controls */}
        <div className="game-sidebar" style={{
          width: '320px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Region Selector */}
          {!containerState.gameStarted && (
            <RegionSelector
              selectedRegion={containerState.currentRegion}
              onRegionChange={handleRegionChange}
              disabled={isGameActive}
            />
          )}

          {/* Difficulty Selector */}
          {!containerState.gameStarted && (
            <div className="difficulty-selector" style={{ padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
                Difficulty Level
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.values(DifficultyLevel).map(difficulty => (
                  <button
                    key={difficulty}
                    onClick={() => handleDifficultyChange(difficulty)}
                    style={{
                      padding: '8px 12px',
                      border: `2px solid ${containerState.currentDifficulty === difficulty ? '#3b82f6' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      backgroundColor: containerState.currentDifficulty === difficulty ? '#eff6ff' : '#ffffff',
                      color: containerState.currentDifficulty === difficulty ? '#1e40af' : '#374151',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textTransform: 'capitalize'
                    }}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* County Tray */}
          {containerState.gameStarted && (
            <div style={{ flex: 1, overflow: 'auto' }}>
              <CountyTray
                counties={remainingCounties}
                onCountyDrag={handleCountyDrag}
                onCountyDragEnd={handleCountyDragEnd}
                difficulty={containerState.currentDifficulty}
              />
            </div>
          )}
        </div>

        {/* Main Map Area */}
        <div className="map-area" style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {containerState.gameStarted ? (
            <CaliforniaMapCanvas
              width={800}
              height={600}
              counties={availableCounties}
              placedCounties={placedCounties}
              onCountyDrop={handleCountyDrop}
              showHints={settings.showHints}
              difficulty={containerState.currentDifficulty}
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              flexDirection: 'column',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
              <h2 style={{ margin: '0 0 8px 0', color: '#374151' }}>
                Ready to Start?
              </h2>
              <p style={{ margin: 0, textAlign: 'center', maxWidth: '400px' }}>
                Select a region and difficulty level, then click "Start Game" to begin placing California counties!
              </p>
            </div>
          )}

          {/* Game Overlay for Pause */}
          <AnimatePresence>
            {isPaused && containerState.gameStarted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: '600'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏸️</div>
                  <div>Game Paused</div>
                  <button
                    onClick={handlePauseToggle}
                    style={{
                      marginTop: '16px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Resume Game
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Placement Feedback */}
          <AnimatePresence>
            {containerState.recentPlacement && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  backgroundColor: containerState.recentPlacement.isCorrect ? '#10b981' : '#f59e0b',
                  color: 'white',
                  fontWeight: '600',
                  zIndex: 1000
                }}
                onAnimationComplete={() => {
                  setTimeout(() => {
                    setContainerState(prev => ({ ...prev, recentPlacement: undefined }));
                  }, 2000);
                }}
              >
                {containerState.recentPlacement.isCorrect ? '✅' : '⚠️'}
                {containerState.recentPlacement.county.name} •
                +{containerState.recentPlacement.scoreAwarded} points •
                {Math.round(containerState.recentPlacement.accuracy * 100)}% accuracy
              </motion.div>
            )}
          </AnimatePresence>

          {/* Achievement Notifications */}
          <AnimatePresence>
            {containerState.newAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                style={{
                  position: 'absolute',
                  top: `${80 + index * 80}px`,
                  right: '20px',
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: '#fbbf24',
                  color: 'white',
                  fontWeight: '600',
                  maxWidth: '280px',
                  zIndex: 1000,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
                }}
                onAnimationComplete={() => {
                  setTimeout(() => {
                    setContainerState(prev => ({
                      ...prev,
                      newAchievements: prev.newAchievements.filter(a => a.id !== achievement.id)
                    }));
                  }, 3000);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{achievement.icon}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>
                      Achievement Unlocked!
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>
                      {achievement.name}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CaliforniaGameContainer;