import React from 'react';
import { GameModeConfiguration, DifficultyLevel, ModeCardProps } from '@/types';
import { CaliforniaButton } from './CaliforniaButton';

const difficultyColors = {
  [DifficultyLevel.EASY]: 'text-green-600 bg-green-100',
  [DifficultyLevel.MEDIUM]: 'text-yellow-600 bg-yellow-100',
  [DifficultyLevel.HARD]: 'text-orange-600 bg-orange-100',
  [DifficultyLevel.EXPERT]: 'text-red-600 bg-red-100'
};

const difficultyLabels = {
  [DifficultyLevel.EASY]: 'Easy',
  [DifficultyLevel.MEDIUM]: 'Medium',
  [DifficultyLevel.HARD]: 'Hard',
  [DifficultyLevel.EXPERT]: 'Expert'
};

export const ModeCard: React.FC<ModeCardProps> = ({
  mode,
  isSelected = false,
  isLocked = false,
  onSelect,
  className = ''
}) => {
  const handleClick = () => {
    if (!isLocked) {
      onSelect(mode);
    }
  };

  const renderStars = (stars: number) => {
    return Array.from({ length: 3 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < stars ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  const renderLockIcon = () => (
    <div className="absolute top-2 right-2 bg-gray-600 text-white rounded-full p-1">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
  );

  const renderUnlockRequirements = () => {
    if (!isLocked || !mode.unlockRequirements) return null;

    return (
      <div className="mt-2 text-xs text-gray-500">
        <div className="font-medium mb-1">Unlock by:</div>
        {mode.unlockRequirements.map((req, index) => (
          <div key={index} className="flex items-center gap-1">
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>
              {req.type === 'complete_mode' && 'Complete another mode'}
              {req.type === 'achieve_score' && `Score ${req.threshold}+ points`}
              {req.type === 'total_games' && `Play ${req.threshold}+ games`}
              {req.type === 'complete_region' && 'Complete regional modes'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const cardClasses = `
    relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
    ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
    ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-300 hover:shadow-md'}
    ${className}
  `;

  return (
    <div className={cardClasses} onClick={handleClick}>
      {isLocked && renderLockIcon()}

      {/* Mode Icon and Title */}
      <div className="flex items-start gap-3 mb-3">
        <div className="text-3xl">{mode.icon}</div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-1">
            {mode.name}
          </h3>
          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[mode.difficulty]}`}>
            {difficultyLabels[mode.difficulty]}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-3">
        {mode.description}
      </p>

      {/* Game Info */}
      <div className="flex justify-between items-center mb-3 text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span>📍 {mode.counties.length} counties</span>
          {mode.timeLimit && (
            <span>⏱️ {Math.floor(mode.timeLimit / 60000)}min</span>
          )}
          {mode.maxMistakes !== undefined && (
            <span>❌ {mode.maxMistakes} mistakes max</span>
          )}
        </div>
        <div className="text-orange-600 font-medium">
          {mode.scoreMultiplier}x points
        </div>
      </div>

      {/* Stars and Progress */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          {renderStars(mode.stars)}
          <span className="ml-2 text-xs text-gray-500">
            {mode.isCompleted ? 'Completed' : 'Not completed'}
          </span>
        </div>

        {mode.bestScore && (
          <div className="text-xs text-gray-500">
            Best: {mode.bestScore.toLocaleString()}
          </div>
        )}
      </div>

      {/* Unlock Requirements */}
      {renderUnlockRequirements()}

      {/* Special Features */}
      <div className="mt-3 flex flex-wrap gap-1">
        {mode.showHints && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
            💡 Hints
          </span>
        )}
        {mode.allowRotation && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
            🔄 Rotation
          </span>
        )}
        {mode.showCountyNames && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
            🏷️ Names
          </span>
        )}
        {mode.timeLimit && (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
            ⏰ Timed
          </span>
        )}
      </div>

      {/* Play Button */}
      {!isLocked && (
        <div className="mt-4">
          <CaliforniaButton
            variant={isSelected ? "primary" : "secondary"}
            size="sm"
            onClick={handleClick}
            className="w-full"
          >
            {mode.isCompleted ? 'Play Again' : 'Play'}
          </CaliforniaButton>
        </div>
      )}
    </div>
  );
};