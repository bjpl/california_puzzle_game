import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HintSystem from './HintSystem';
import HintVisualIndicators from './HintVisualIndicators';
import {
  GameState,
  HintType,
  County,
  Position,
  Hint,
  HintVisualData
} from '@/types';
import { useGameStore } from '@/stores/gameStore';
import { generateHint } from '@/utils/hintEngine';

interface CaliforniaGameWithHintsProps {
  width?: number;
  height?: number;
  className?: string;
}

const CaliforniaGameWithHints: React.FC<CaliforniaGameWithHintsProps> = ({
  width = 800,
  height = 600,
  className = ''
}) => {
  const {
    gameState,
    settings,
    hintSystem,
    remainingCounties,
    placedCounties,
    useHint,
    updateHintSystem,
    analyzePlayerStruggle,
    startGame,
    placeCounty
  } = useGameStore();

  const [activeHint, setActiveHint] = useState<Hint | null>(null);
  const [showVisualIndicators, setShowVisualIndicators] = useState(false);
  const [draggedCounty, setDraggedCounty] = useState<County | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle hint requests from the HintSystem component
  const handleHintRequested = useCallback((type: HintType) => {
    if (remainingCounties.length === 0) return;

    const targetCounty = remainingCounties[0]; // Current target county
    const hint = generateHint(targetCounty, type, 0.3);

    setActiveHint(hint);
    setShowVisualIndicators(settings.hintSettings.enableVisualIndicators);

    // Use the hint through the game store
    useHint(type, targetCounty.id, false);
  }, [remainingCounties, settings.hintSettings.enableVisualIndicators, useHint]);

  // Handle hint dismissal
  const handleHintDismissed = useCallback(() => {
    setActiveHint(null);
    setShowVisualIndicators(false);
    updateHintSystem({ currentHintType: undefined, hintProgress: 0 });
  }, [updateHintSystem]);

  // Handle county drag start
  const handleCountyDragStart = useCallback((county: County, event: React.DragEvent) => {
    setDraggedCounty(county);
    setIsDragging(true);
    event.dataTransfer.setData('text/plain', county.id);
  }, []);

  // Handle county drop
  const handleCountyDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    if (!draggedCounty) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const position: Position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    // Simulate placement accuracy (in a real game, this would be calculated based on actual county boundaries)
    const targetPosition: Position = { x: width / 2, y: height / 2 }; // Simplified
    const distance = Math.sqrt(
      Math.pow(position.x - targetPosition.x, 2) +
      Math.pow(position.y - targetPosition.y, 2)
    );
    const isCorrect = distance < 100; // Within 100 pixels of target

    // Place the county
    const result = placeCounty(draggedCounty as any, position);

    // Analyze struggle for hint system
    analyzePlayerStruggle(draggedCounty.id, position, isCorrect);

    setDraggedCounty(null);
    setIsDragging(false);
  }, [draggedCounty, width, height, placeCounty, analyzePlayerStruggle]);

  // Handle drag over
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // Demo counties for the hint system
  const demoCounties: County[] = [
    {
      id: 'los_angeles',
      name: 'Los Angeles County',
      fips: '06037',
      region: 'southern' as any,
      centroid: [width * 0.3, height * 0.7],
      difficulty: 'easy' as any,
      geometry: {} as any // Simplified for demo
    },
    {
      id: 'san_francisco',
      name: 'San Francisco County',
      fips: '06075',
      region: 'northern' as any,
      centroid: [width * 0.2, height * 0.3],
      difficulty: 'medium' as any,
      geometry: {} as any
    },
    {
      id: 'orange',
      name: 'Orange County',
      fips: '06059',
      region: 'southern' as any,
      centroid: [width * 0.35, height * 0.75],
      difficulty: 'easy' as any,
      geometry: {} as any
    }
  ];

  const currentTargetCounty = remainingCounties.length > 0 ? remainingCounties[0] : demoCounties[0];

  return (
    <div className={`california-game-with-hints relative ${className}`}>
      {/* Game Header */}
      <div className="game-header mb-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">California Counties Puzzle</h2>
            <p className="text-gray-600">
              {remainingCounties.length > 0
                ? `Find and place: ${currentTargetCounty.name}`
                : 'All counties placed!'
              }
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Score</div>
              <div className="text-xl font-bold text-blue-600">{gameState?.score || 0}</div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600">Mistakes</div>
              <div className="text-xl font-bold text-red-600">{gameState?.mistakes || 0}</div>
            </div>
          </div>
        </div>

        {/* Hint System Status */}
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="text-gray-600">
            Hints: {hintSystem.availableHints}/{settings.hintSettings.maxHintsPerLevel}
          </span>
          {hintSystem.cooldownTimeRemaining > 0 && (
            <span className="text-orange-600">
              Cooldown: {Math.ceil(hintSystem.cooldownTimeRemaining / 1000)}s
            </span>
          )}
          {hintSystem.strugglingCounties.length > 0 && (
            <span className="text-blue-600">
              Analyzing difficulty patterns
            </span>
          )}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="game-container flex gap-4">
        {/* Game Map Area */}
        <div className="game-map-container flex-1">
          <div
            className="game-map relative bg-topo-sand rounded-lg shadow-lg overflow-hidden"
            style={{ width, height }}
            onDrop={handleCountyDrop}
            onDragOver={handleDragOver}
          >
            {/* Map Background */}
            <div className="absolute inset-0 bg-gray-100 opacity-50">
              <svg width="100%" height="100%" className="text-gray-300">
                <rect width="100%" height="100%" fill="currentColor" opacity="0.1" />
                {/* Simplified California outline */}
                <path
                  d={`M ${width * 0.1} ${height * 0.2}
                      Q ${width * 0.15} ${height * 0.1} ${width * 0.25} ${height * 0.15}
                      L ${width * 0.4} ${height * 0.2}
                      L ${width * 0.5} ${height * 0.8}
                      L ${width * 0.2} ${height * 0.9}
                      Z`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity="0.3"
                />
              </svg>
            </div>

            {/* Placed Counties */}
            {placedCounties.map((county) => (
              <motion.div
                key={county.id}
                className="absolute w-16 h-12 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold shadow-lg"
                style={{
                  left: county.currentPosition.x - 32,
                  top: county.currentPosition.y - 24
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                ✓
              </motion.div>
            ))}

            {/* Target Indicators */}
            {remainingCounties.length > 0 && (
              <motion.div
                className="absolute w-20 h-16 border-2 border-dashed border-blue-400 rounded flex items-center justify-center text-blue-600"
                style={{
                  left: currentTargetCounty.centroid[0] - 40,
                  top: currentTargetCounty.centroid[1] - 32
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ?
              </motion.div>
            )}

            {/* Visual Hint Indicators */}
            <AnimatePresence>
              {showVisualIndicators && activeHint?.visualData && (
                <HintVisualIndicators
                  visualData={activeHint.visualData}
                  hintType={activeHint.type}
                  county={currentTargetCounty}
                  isActive={showVisualIndicators}
                  onAnimationComplete={() => {}}
                />
              )}
            </AnimatePresence>

            {/* Drag Preview */}
            {isDragging && draggedCounty && (
              <motion.div
                className="absolute pointer-events-none z-50 w-16 h-12 bg-blue-500 rounded flex items-center justify-center text-white text-xs opacity-75"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                {draggedCounty.name.split(' ')[0]}
              </motion.div>
            )}
          </div>
        </div>

        {/* County Tray */}
        <div className="county-tray w-64 bg-white rounded-lg shadow-lg p-4">
          <h3 className="font-bold text-gray-800 mb-4">Available Counties</h3>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(remainingCounties.length > 0 ? remainingCounties : demoCounties).map((county) => (
              <motion.div
                key={county.id}
                className="county-piece p-3 bg-blue-100 hover:bg-blue-200 rounded-lg cursor-move transition-colors"
                draggable
                onDragStart={(e) => handleCountyDragStart(county, e)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-semibold text-gray-800">{county.name}</div>
                <div className="text-sm text-gray-600">{county.region}</div>

                {/* Struggle Indicator */}
                {hintSystem.strugglingCounties.find(s => s.countyId === county.id) && (
                  <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                    <span>!</span>
                    <span>Needs attention</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Demo Controls */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => startGame()}
              className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
            >
              Start New Game
            </button>
          </div>
        </div>
      </div>

      {/* Hint System Component */}
      <div className="hint-system-container fixed bottom-6 right-6">
        <HintSystem
          gameState={gameState}
          onHintRequested={handleHintRequested}
          onHintDismissed={handleHintDismissed}
        />
      </div>

      {/* Educational Information Panel */}
      <AnimatePresence>
        {activeHint?.type === HintType.EDUCATIONAL && (
          <motion.div
            className="educational-panel fixed bottom-20 right-6 w-80 bg-white rounded-lg shadow-xl border-2 border-green-200 p-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <h4 className="font-bold text-green-800">Learn About This County</h4>
            </div>

            <div className="text-sm text-gray-700 leading-relaxed">
              {activeHint.content}
            </div>

            <div className="mt-3 flex justify-between items-center">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < activeHint.educationalValue ? 'text-green-500' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              <button
                onClick={handleHintDismissed}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Struggle Analysis Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && hintSystem.strugglingCounties.length > 0 && (
        <div className="debug-panel fixed top-4 right-4 w-64 bg-gray-900 text-white p-3 rounded-lg text-xs">
          <h4 className="font-bold mb-2">Struggle Analysis</h4>
          {hintSystem.strugglingCounties.map((struggle) => (
            <div key={struggle.countyId} className="mb-2 p-2 bg-gray-800 rounded">
              <div className="font-semibold">{struggle.countyId}</div>
              <div>Attempts: {struggle.attempts}</div>
              <div>Time spent: {Math.round(struggle.totalTimeSpent / 1000)}s</div>
              <div>Suggested hints: {struggle.suggestedHints.join(', ')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaliforniaGameWithHints;