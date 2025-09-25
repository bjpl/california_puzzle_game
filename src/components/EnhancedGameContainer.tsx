import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import {
  GameModeConfiguration,
  GameContainerProps,
  County,
  CountyPiece,
  Position,
  DifficultyLevel
} from '@/types';
import { useGameStore } from '@/stores/gameStore';
import { GameModeSelector } from './GameModeSelector';
import { DifficultySystem, useDifficultySettings } from './DifficultySystem';
import { ProgressionSystem } from './ProgressionSystem';
import { StudyMode } from './StudyMode';
import { CaliforniaButton } from './CaliforniaButton';
import CountyTray from './CountyTray';
import CaliforniaMapFixed from './CaliforniaMapFixed';
import GameHeader from './GameHeader';
import GameComplete from './GameComplete';
import { GAME_MODES, getDifficultySettings } from '@/config/gameModes';
import { getCountiesByRegion, getCountyById } from '@/utils/californiaData';
import { playSound, SoundType } from '../utils/soundManager';

type GamePhase = 'mode_selection' | 'study' | 'playing' | 'complete' | 'progression';

export const EnhancedGameContainer: React.FC<GameContainerProps> = ({
  initialSettings,
  initialMode,
  onGameComplete,
  onModeChange
}) => {
  // Game Store
  const {
    isGameActive,
    currentMode,
    placedCounties,
    remainingCounties,
    score,
    timeElapsed,
    streak,
    mistakes,
    difficulty,
    settings,
    stats,
    achievements,
    availableModes,
    startGameWithMode,
    endGame,
    resetGame,
    placeCounty,
    setCurrentMode,
    updateModeProgress,
    unlockMode
  } = useGameStore();

  // Local State
  const [gamePhase, setGamePhase] = useState<GamePhase>('mode_selection');
  const [selectedMode, setSelectedMode] = useState<GameModeConfiguration | null>(initialMode || null);
  const [isDragging, setIsDragging] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);

  // Difficulty settings based on current mode
  const difficultySettings = useDifficultySettings(currentMode);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Game state calculations
  const gameState = useMemo(() => ({
    timeElapsed,
    mistakes,
    streak,
    placedCounties: placedCounties.length,
    totalCounties: currentMode.counties.length
  }), [timeElapsed, mistakes, streak, placedCounties.length, currentMode.counties.length]);

  const isGameComplete = gameState.placedCounties === gameState.totalCounties;
  const gameAccuracy = gameState.totalCounties > 0
    ? (gameState.placedCounties - mistakes) / gameState.totalCounties
    : 0;

  // Initialize counties for the selected mode
  const modeCounties = useMemo(() => {
    return currentMode.counties
      .map(id => getCountyById(id))
      .filter((county): county is County => county !== undefined);
  }, [currentMode.counties]);

  // Handle mode selection
  const handleModeSelect = (mode: GameModeConfiguration) => {
    setSelectedMode(mode);
    setCurrentMode(mode);
    onModeChange?.(mode);

    // Check if this is a study-first mode
    if (mode.id === 'study_first_mode') {
      setGamePhase('study');
    } else {
      setGamePhase('playing');
      startGameWithMode(mode);
      setGameStartTime(Date.now());
    }
  };

  // Handle study completion
  const handleStudyComplete = () => {
    if (selectedMode) {
      setGamePhase('playing');
      startGameWithMode(selectedMode);
      setGameStartTime(Date.now());
    }
  };

  // Handle game completion
  useEffect(() => {
    if (isGameComplete && gamePhase === 'playing') {
      const completionTime = Date.now() - gameStartTime;
      const finalScore = score;

      // Calculate stars earned
      const stars = currentMode ?
        Math.max(1, Math.floor(gameAccuracy * 3)) : 1;

      // Update mode progress
      if (currentMode) {
        updateModeProgress(currentMode.id, stars, finalScore, completionTime);
      }

      setGamePhase('complete');
      endGame();

      // Callback to parent
      onGameComplete?.(finalScore, stats);

      // Play completion sound
      playSound(SoundType.COMPLETE);
    }
  }, [isGameComplete, gamePhase, score, gameAccuracy, currentMode, gameStartTime]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const countyId = event.active.id as string;
    const county = modeCounties.find(c => c.id === countyId);

    if (county && !placedCounties.some(p => p.id === countyId)) {
      setIsDragging(true);
      playSound(SoundType.PICKUP);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);

    if (over && active) {
      const draggedId = active.id as string;
      const targetId = over.id as string;

      const county = modeCounties.find(c => c.id === draggedId);
      if (county) {
        // Convert county to CountyPiece for placement
        const countyPiece: CountyPiece = {
          ...county,
          isPlaced: false,
          currentPosition: { x: 0, y: 0 }, // This would come from the drop position
          targetPosition: { x: 0, y: 0 }, // This would be calculated from the county's map position
          rotation: 0,
          scale: 1,
          zIndex: 1
        };

        const dropPosition: Position = { x: 0, y: 0 }; // This would come from the actual drop event

        const result = placeCounty(countyPiece, dropPosition);

        // Play appropriate sound
        if (result.isCorrect) {
          playSound(SoundType.CORRECT);
        } else {
          playSound(SoundType.INCORRECT);
        }
      }
    }
  };

  // Handle back to mode selection
  const handleBackToModeSelection = () => {
    resetGame();
    setGamePhase('mode_selection');
    setSelectedMode(null);
  };

  // Handle progression view
  const handleShowProgression = () => {
    setGamePhase('progression');
  };

  // Handle mode unlock
  const handleModeUnlock = (mode: GameModeConfiguration) => {
    unlockMode(mode.id);
  };

  // Render based on game phase
  switch (gamePhase) {
    case 'mode_selection':
      return (
        <div className="min-h-screen bg-topo-sand">
          <div className="container mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🗺️ California Counties Adventure
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Master California geography through engaging game modes designed for every skill level
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center gap-4 mb-8">
              <CaliforniaButton
                variant="secondary"
                onClick={handleShowProgression}
                className="flex items-center gap-2"
              >
                📊 View Progress
              </CaliforniaButton>
            </div>

            {/* Mode Selector */}
            <GameModeSelector
              availableModes={availableModes}
              onModeSelect={handleModeSelect}
              playerStats={stats}
            />
          </div>
        </div>
      );

    case 'progression':
      return (
        <div className="min-h-screen bg-topo-sand">
          <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
              <CaliforniaButton
                variant="secondary"
                onClick={handleBackToModeSelection}
              >
                ← Back to Modes
              </CaliforniaButton>
            </div>

            {/* Progression System */}
            <ProgressionSystem
              availableModes={availableModes}
              playerStats={stats}
              achievements={achievements}
              onModeUnlock={handleModeUnlock}
            />
          </div>
        </div>
      );

    case 'study':
      return (
        <div className="min-h-screen bg-topo-sand">
          <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Study Mode</h1>
                <p className="text-gray-600">Learn about each county before playing</p>
              </div>
              <CaliforniaButton
                variant="secondary"
                onClick={handleBackToModeSelection}
              >
                ← Back to Modes
              </CaliforniaButton>
            </div>

            {/* Study Mode */}
            <StudyMode
              counties={currentMode.counties}
              onStudyComplete={handleStudyComplete}
            />
          </div>
        </div>
      );

    case 'playing':
      return (
        <DifficultySystem
          mode={currentMode}
          gameState={gameState}
        >
          <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto p-4 max-w-7xl">
              {/* Game Header */}
              <GameHeader />

              {/* Game Controls */}
              <div className="flex justify-between items-center mb-4">
                <CaliforniaButton
                  variant="secondary"
                  onClick={handleBackToModeSelection}
                  size="sm"
                >
                  ← Change Mode
                </CaliforniaButton>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Mode: {currentMode.name}</span>
                  <span>Difficulty: {difficulty}</span>
                  {currentMode.timeLimit && (
                    <span>
                      Time: {Math.floor((currentMode.timeLimit - timeElapsed) / 1000)}s
                    </span>
                  )}
                </div>
              </div>

              {/* Game Area */}
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* County Tray */}
                  <div className="lg:col-span-1">
                    <CountyTray />
                  </div>

                  {/* Map */}
                  <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg shadow-lg p-4 h-[600px] relative">
                      <CaliforniaMapFixed isDragging={isDragging} />

                      {/* Mode-specific overlays */}
                      {difficultySettings.showCountyNames && (
                        <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          County names visible
                        </div>
                      )}

                      {difficultySettings.enableHints && (
                        <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          Hints available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DndContext>
            </div>
          </div>
        </DifficultySystem>
      );

    case 'complete':
      return (
        <div className="min-h-screen bg-topo-sand">
          <div className="container mx-auto p-6">
            <GameComplete />

            <div className="text-center mt-8 space-y-4">
              <CaliforniaButton
                variant="primary"
                onClick={handleBackToModeSelection}
                className="mr-4"
              >
                Try Another Mode
              </CaliforniaButton>

              {selectedMode && (
                <CaliforniaButton
                  variant="secondary"
                  onClick={() => {
                    setGamePhase('playing');
                    startGameWithMode(selectedMode);
                    setGameStartTime(Date.now());
                  }}
                >
                  Play Again
                </CaliforniaButton>
              )}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};