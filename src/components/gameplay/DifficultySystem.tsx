import React, { useEffect, useMemo } from 'react';
import { DifficultyLevel, DifficultySettings, GameModeConfiguration } from '@/types';
import { getDifficultySettings } from '@/config/gameModes';

interface DifficultySystemProps {
  mode: GameModeConfiguration;
  gameState: {
    timeElapsed: number;
    mistakes: number;
    streak: number;
    placedCounties: number;
    totalCounties: number;
  };
  onDifficultyAdjust?: (settings: DifficultySettings) => void;
  children: React.ReactNode;
}

interface AdaptiveDifficultyState {
  currentSettings: DifficultySettings;
  adaptationLevel: number; // -2 to +2, where negative is easier, positive is harder
  shouldShowHints: boolean;
  dropZoneTolerance: number;
  timeMultiplier: number;
}

export const DifficultySystem: React.FC<DifficultySystemProps> = ({
  mode,
  gameState,
  onDifficultyAdjust,
  children
}) => {
  // Base difficulty settings from the mode
  const baseDifficultySettings = useMemo(() => {
    return getDifficultySettings(mode.difficulty);
  }, [mode.difficulty]);

  // Calculate adaptive difficulty adjustments
  const adaptiveDifficulty = useMemo((): AdaptiveDifficultyState => {
    const { timeElapsed, mistakes, streak, placedCounties, totalCounties } = gameState;

    // Calculate performance metrics
    const progressRatio = totalCounties > 0 ? placedCounties / totalCounties : 0;
    const averageTimePerCounty = placedCounties > 0 ? timeElapsed / placedCounties : 0;
    const errorRate = placedCounties > 0 ? mistakes / (placedCounties + mistakes) : 0;
    const streakRatio = placedCounties > 0 ? streak / placedCounties : 0;

    // Determine adaptation level based on performance
    let adaptationLevel = 0;

    // Time-based adjustments
    if (averageTimePerCounty > 30000) { // Taking too long (30+ seconds per county)
      adaptationLevel -= 1;
    } else if (averageTimePerCounty < 5000) { // Very fast (under 5 seconds)
      adaptationLevel += 1;
    }

    // Error-based adjustments
    if (errorRate > 0.3) { // High error rate (30%+)
      adaptationLevel -= 1;
    } else if (errorRate < 0.05) { // Very low error rate (under 5%)
      adaptationLevel += 1;
    }

    // Streak-based adjustments
    if (streak > 5) { // Good streak
      adaptationLevel += 0.5;
    } else if (mistakes > 3 && streak === 0) { // Struggling
      adaptationLevel -= 1;
    }

    // Clamp adaptation level
    adaptationLevel = Math.max(-2, Math.min(2, adaptationLevel));

    // Apply adaptations to base settings
    const adaptedSettings: DifficultySettings = { ...baseDifficultySettings };

    // Adjust drop zone tolerance
    let toleranceAdjustment = 0;
    if (adaptationLevel < 0) {
      // Make it easier - increase tolerance
      toleranceAdjustment = Math.abs(adaptationLevel) * 15;
    } else if (adaptationLevel > 0) {
      // Make it harder - decrease tolerance
      toleranceAdjustment = -adaptationLevel * 8;
    }

    // Adjust hint availability
    const shouldShowHints = mode.showHints && (
      baseDifficultySettings.enableHints || adaptationLevel < -0.5
    );

    // Adjust time multiplier for scoring
    const timeMultiplier = baseDifficultySettings.timeMultiplier + (adaptationLevel * 0.1);

    return {
      currentSettings: {
        ...adaptedSettings,
        dropZoneTolerance: Math.max(20, adaptedSettings.dropZoneTolerance + toleranceAdjustment),
        enableHints: shouldShowHints,
        timeMultiplier: Math.max(0.5, Math.min(2.0, timeMultiplier))
      },
      adaptationLevel,
      shouldShowHints,
      dropZoneTolerance: Math.max(20, adaptedSettings.dropZoneTolerance + toleranceAdjustment),
      timeMultiplier: Math.max(0.5, Math.min(2.0, timeMultiplier))
    };
  }, [gameState, baseDifficultySettings, mode.showHints]);

  // Notify parent component of difficulty changes
  useEffect(() => {
    if (onDifficultyAdjust) {
      onDifficultyAdjust(adaptiveDifficulty.currentSettings);
    }
  }, [adaptiveDifficulty.currentSettings, onDifficultyAdjust]);

  // Render difficulty indicators
  const renderDifficultyIndicator = () => {
    const { adaptationLevel } = adaptiveDifficulty;

    if (Math.abs(adaptationLevel) < 0.5) return null;

    const isEasier = adaptationLevel < 0;
    const intensity = Math.abs(adaptationLevel);

    return (
      <div className={`
        fixed top-4 right-4 px-3 py-2 rounded-lg text-sm font-medium z-20
        transition-all duration-500 ${
          isEasier
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-orange-100 text-orange-800 border border-orange-200'
        }
      `}>
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {isEasier ? '😌' : '💪'}
          </span>
          <span>
            {isEasier ? 'Difficulty Reduced' : 'Challenge Increased'}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: Math.ceil(intensity) }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  isEasier ? 'bg-green-400' : 'bg-orange-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render difficulty-specific UI elements
  const renderDifficultyFeatures = () => {
    const { currentSettings } = adaptiveDifficulty;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* County outlines based on difficulty */}
        {currentSettings.showCountyOutlines && (
          <div className="county-outlines opacity-30">
            {/* This would render county boundary outlines */}
          </div>
        )}

        {/* County name labels */}
        {currentSettings.showCountyNames && (
          <div className="county-names">
            {/* This would render county name labels */}
          </div>
        )}

        {/* Initial letters for medium difficulty */}
        {currentSettings.showInitials && !currentSettings.showCountyNames && (
          <div className="county-initials">
            {/* This would render county initial letters */}
          </div>
        )}

        {/* Visual hint indicators */}
        {currentSettings.enableHints && (
          <div className="hint-indicators">
            {/* This would render hint visual indicators */}
          </div>
        )}

        {/* Drop zone visual feedback */}
        <style>{`
          .drop-zone {
            transition: all 0.2s ease;
          }
          .drop-zone.active {
            box-shadow: 0 0 0 ${currentSettings.dropZoneTolerance}px rgba(59, 130, 246, 0.1);
            border: 2px solid rgba(59, 130, 246, 0.3);
          }
          .drop-zone.hover {
            background-color: rgba(59, 130, 246, 0.05);
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full">
      {/* Difficulty indicator */}
      {renderDifficultyIndicator()}

      {/* Difficulty-specific visual features */}
      {renderDifficultyFeatures()}

      {/* Main game content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Performance analytics overlay (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded text-xs font-mono z-20">
          <div>Adaptation Level: {adaptiveDifficulty.adaptationLevel.toFixed(1)}</div>
          <div>Drop Tolerance: {adaptiveDifficulty.dropZoneTolerance}px</div>
          <div>Hints Enabled: {adaptiveDifficulty.shouldShowHints ? 'Yes' : 'No'}</div>
          <div>Time Multiplier: {adaptiveDifficulty.timeMultiplier.toFixed(2)}x</div>
          <div>Error Rate: {(gameState.placedCounties > 0 ? gameState.mistakes / (gameState.placedCounties + gameState.mistakes) * 100 : 0).toFixed(1)}%</div>
          <div>Avg Time/County: {(gameState.placedCounties > 0 ? gameState.timeElapsed / gameState.placedCounties / 1000 : 0).toFixed(1)}s</div>
        </div>
      )}
    </div>
  );
};

// Hook for using difficulty settings in other components
export const useDifficultySettings = (mode: GameModeConfiguration) => {
  return useMemo(() => {
    const baseSettings = getDifficultySettings(mode.difficulty);

    // Apply mode-specific overrides
    return {
      ...baseSettings,
      dropZoneTolerance: mode.dropZoneTolerance || baseSettings.dropZoneTolerance,
      showCountyNames: mode.showCountyNames && baseSettings.showCountyNames,
      enableHints: mode.showHints && baseSettings.enableHints,
      rotationEnabled: mode.allowRotation && baseSettings.rotationEnabled,
      scoreMultiplier: baseSettings.scoreMultiplier * mode.scoreMultiplier
    };
  }, [mode]);
};

// Component for displaying difficulty information
export const DifficultyInfo: React.FC<{ difficulty: DifficultyLevel; mode: GameModeConfiguration }> = ({
  difficulty,
  mode
}) => {
  const settings = useDifficultySettings(mode);

  const difficultyDescriptions = {
    [DifficultyLevel.EASY]: 'Large drop zones, county names visible, hints available',
    [DifficultyLevel.MEDIUM]: 'Medium drop zones, initials only, hints available',
    [DifficultyLevel.HARD]: 'Small drop zones, no labels, no hints, pieces may rotate',
    [DifficultyLevel.EXPERT]: 'Precise placement required, rotated map, no assistance'
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">
          {difficulty === DifficultyLevel.EASY && '😊'}
          {difficulty === DifficultyLevel.MEDIUM && '🤔'}
          {difficulty === DifficultyLevel.HARD && '😤'}
          {difficulty === DifficultyLevel.EXPERT && '🔥'}
        </span>
        <h4 className="font-bold text-lg capitalize">{difficulty} Mode</h4>
      </div>

      <p className="text-gray-600 text-sm mb-3">
        {difficultyDescriptions[difficulty]}
      </p>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex justify-between">
          <span>Drop Tolerance:</span>
          <span className="font-medium">{settings.dropZoneTolerance}px</span>
        </div>
        <div className="flex justify-between">
          <span>Score Multiplier:</span>
          <span className="font-medium">{settings.scoreMultiplier.toFixed(1)}x</span>
        </div>
        <div className="flex justify-between">
          <span>Hints:</span>
          <span className="font-medium">{settings.enableHints ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex justify-between">
          <span>Rotation:</span>
          <span className="font-medium">{settings.rotationEnabled ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  );
};