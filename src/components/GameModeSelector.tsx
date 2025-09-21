import React, { useState, useMemo } from 'react';
import {
  GameModeConfiguration,
  GameModeCategory,
  GameModeSelectorProps,
  DifficultyLevel
} from '@/types';
import { ModeCard } from './ModeCard';
import { CaliforniaButton } from './CaliforniaButton';
import { MODE_CATEGORIES, getUnlockedModes, getModesByCategory } from '@/config/gameModes';

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  availableModes,
  onModeSelect,
  playerStats,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GameModeCategory | 'all'>('all');
  const [selectedMode, setSelectedMode] = useState<GameModeConfiguration | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'all'>('all');

  // Filter modes based on unlock status
  const unlockedModes = useMemo(() => {
    return getUnlockedModes(playerStats);
  }, [playerStats]);

  // Filter modes by category and difficulty
  const filteredModes = useMemo(() => {
    let modes = selectedCategory === 'all' ? availableModes : getModesByCategory(selectedCategory);

    if (difficultyFilter !== 'all') {
      modes = modes.filter(mode => mode.difficulty === difficultyFilter);
    }

    return modes;
  }, [availableModes, selectedCategory, difficultyFilter]);

  // Group modes by category for display
  const groupedModes = useMemo(() => {
    const grouped: Record<GameModeCategory, GameModeConfiguration[]> = {
      [GameModeCategory.LEARNING]: [],
      [GameModeCategory.CHALLENGE]: [],
      [GameModeCategory.MASTERY]: [],
      [GameModeCategory.SPECIAL]: []
    };

    filteredModes.forEach(mode => {
      grouped[mode.category].push(mode);
    });

    return grouped;
  }, [filteredModes]);

  // Calculate completion stats
  const completionStats = useMemo(() => {
    const totalModes = unlockedModes.length;
    const completedModes = unlockedModes.filter(mode => mode.isCompleted).length;
    const totalStars = unlockedModes.reduce((sum, mode) => sum + mode.stars, 0);
    const maxStars = unlockedModes.length * 3;

    return {
      totalModes,
      completedModes,
      totalStars,
      maxStars,
      completionPercentage: totalModes > 0 ? (completedModes / totalModes) * 100 : 0
    };
  }, [unlockedModes]);

  const handleModeSelect = (mode: GameModeConfiguration) => {
    const isUnlocked = unlockedModes.some(m => m.id === mode.id);
    if (isUnlocked) {
      setSelectedMode(mode);
    }
  };

  const handlePlayMode = () => {
    if (selectedMode) {
      onModeSelect(selectedMode);
    }
  };

  const isLocked = (mode: GameModeConfiguration) => {
    return !unlockedModes.some(m => m.id === mode.id);
  };

  const renderCategoryTabs = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      <CaliforniaButton
        variant={selectedCategory === 'all' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setSelectedCategory('all')}
      >
        All Modes
      </CaliforniaButton>
      {Object.entries(MODE_CATEGORIES).map(([category, info]) => (
        <CaliforniaButton
          key={category}
          variant={selectedCategory === category ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSelectedCategory(category as GameModeCategory)}
          className="flex items-center gap-2"
        >
          <span>{info.icon}</span>
          <span>{info.name}</span>
        </CaliforniaButton>
      ))}
    </div>
  );

  const renderDifficultyFilter = () => (
    <div className="flex gap-2 mb-4">
      <span className="text-sm font-medium text-gray-700 self-center">Difficulty:</span>
      <CaliforniaButton
        variant={difficultyFilter === 'all' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setDifficultyFilter('all')}
      >
        All
      </CaliforniaButton>
      {Object.values(DifficultyLevel).map(difficulty => (
        <CaliforniaButton
          key={difficulty}
          variant={difficultyFilter === difficulty ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setDifficultyFilter(difficulty)}
        >
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </CaliforniaButton>
      ))}
    </div>
  );

  const renderProgressSummary = () => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-gray-900">Your Progress</h3>
        <div className="text-sm text-gray-600">
          {completionStats.completedModes}/{completionStats.totalModes} modes completed
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {completionStats.completionPercentage.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600">Completion</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {completionStats.totalStars}/{completionStats.maxStars}
          </div>
          <div className="text-xs text-gray-600">Stars Earned</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {playerStats.bestScore?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-gray-600">Best Score</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${completionStats.completionPercentage}%` }}
        ></div>
      </div>
    </div>
  );

  const renderModeGrid = (category: GameModeCategory, modes: GameModeConfiguration[]) => {
    if (modes.length === 0) return null;

    const categoryInfo = MODE_CATEGORIES[category];

    return (
      <div key={category} className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{categoryInfo.icon}</span>
          <h3 className="text-xl font-bold text-gray-900">{categoryInfo.name}</h3>
          <div className="text-sm text-gray-600">({modes.length} modes)</div>
        </div>
        <p className="text-gray-600 mb-4">{categoryInfo.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modes.map(mode => (
            <ModeCard
              key={mode.id}
              mode={mode}
              isSelected={selectedMode?.id === mode.id}
              isLocked={isLocked(mode)}
              onSelect={handleModeSelect}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Choose Your California Adventure
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          From beginner-friendly regional puzzles to expert-level challenges,
          find the perfect way to explore California's 58 counties.
        </p>
      </div>

      {/* Progress Summary */}
      {renderProgressSummary()}

      {/* Category Tabs */}
      {renderCategoryTabs()}

      {/* Difficulty Filter */}
      {renderDifficultyFilter()}

      {/* Mode Display */}
      {selectedCategory === 'all' ? (
        // Show all categories
        Object.entries(groupedModes).map(([category, modes]) =>
          renderModeGrid(category as GameModeCategory, modes)
        )
      ) : (
        // Show selected category
        renderModeGrid(selectedCategory as GameModeCategory, groupedModes[selectedCategory as GameModeCategory])
      )}

      {/* Play Button (Sticky) */}
      {selectedMode && (
        <div className="fixed bottom-6 right-6 z-10">
          <CaliforniaButton
            variant="primary"
            size="lg"
            onClick={handlePlayMode}
            className="shadow-lg flex items-center gap-2"
          >
            <span className="text-xl">{selectedMode.icon}</span>
            <span>Play {selectedMode.name}</span>
          </CaliforniaButton>
        </div>
      )}

      {/* Empty State */}
      {filteredModes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No modes available with current filters
          </h3>
          <p className="text-gray-600 mb-4">
            Try changing your category or difficulty filter, or play more games to unlock new modes.
          </p>
          <CaliforniaButton
            variant="primary"
            onClick={() => {
              setSelectedCategory('all');
              setDifficultyFilter('all');
            }}
          >
            Show All Modes
          </CaliforniaButton>
        </div>
      )}
    </div>
  );
};