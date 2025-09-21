import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HintSystemProps,
  HintType,
  Hint,
  DifficultyLevel,
  StruggleData
} from '@/types';
import { useGameStore } from '@/stores/gameStore';
import { generateHint, analyzeStruggle } from '@/utils/hintEngine';

interface HintButtonProps {
  type: HintType;
  icon: string;
  label: string;
  description: string;
  available: boolean;
  cost: number;
  onClick: () => void;
  disabled: boolean;
}

const HintButton: React.FC<HintButtonProps> = ({
  type,
  icon,
  label,
  description,
  available,
  cost,
  onClick,
  disabled
}) => (
  <motion.button
    className={`
      hint-button relative p-4 rounded-lg border-2 transition-all duration-200
      ${available && !disabled
        ? 'border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700'
        : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
      }
    `}
    onClick={onClick}
    disabled={disabled || !available}
    whileHover={available && !disabled ? { scale: 1.02 } : {}}
    whileTap={available && !disabled ? { scale: 0.98 } : {}}
  >
    <div className="flex flex-col items-center gap-2">
      <span className="text-2xl">{icon}</span>
      <span className="font-semibold text-sm">{label}</span>
      <span className="text-xs text-center leading-tight">{description}</span>
      {cost > 0 && (
        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
          -{cost} pts
        </span>
      )}
    </div>

    {!available && (
      <div className="absolute inset-0 bg-gray-200 bg-opacity-75 rounded-lg flex items-center justify-center">
        <span className="text-xs font-semibold text-gray-600">Used</span>
      </div>
    )}
  </motion.button>
);

interface HintDisplayProps {
  hint: Hint;
  progress: number;
  onNext: () => void;
  onClose: () => void;
  canProgress: boolean;
}

const HintDisplay: React.FC<HintDisplayProps> = ({
  hint,
  progress,
  onNext,
  onClose,
  canProgress
}) => {
  const getProgressiveContent = (content: string, progress: number): string => {
    if (hint.type === HintType.NAME) {
      const words = content.split(' ');
      const totalChars = content.length;
      const revealChars = Math.floor(totalChars * progress);

      if (progress < 0.3) {
        // Show first letter of each word
        return words.map(word => word[0] + '_'.repeat(word.length - 1)).join(' ');
      } else if (progress < 0.6) {
        // Show first and last letter of each word
        return words.map(word =>
          word.length > 2
            ? word[0] + '_'.repeat(word.length - 2) + word[word.length - 1]
            : word
        ).join(' ');
      } else if (progress < 0.9) {
        // Show partial content
        return content.substring(0, revealChars) + '_'.repeat(totalChars - revealChars);
      } else {
        // Show full content
        return content;
      }
    }

    // For other hint types, show progressive sentences or bullet points
    const sentences = content.split('. ');
    const revealCount = Math.ceil(sentences.length * progress);
    return sentences.slice(0, revealCount).join('. ') + (revealCount < sentences.length ? '...' : '');
  };

  const getHintIcon = (type: HintType): string => {
    switch (type) {
      case HintType.LOCATION: return '📍';
      case HintType.NAME: return '🔤';
      case HintType.SHAPE: return '🗺️';
      case HintType.NEIGHBOR: return '↔️';
      case HintType.FACT: return '💡';
      case HintType.EDUCATIONAL: return '📚';
      default: return '❓';
    }
  };

  return (
    <motion.div
      className="hint-display bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6 max-w-md"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getHintIcon(hint.type)}</span>
          <h3 className="font-bold text-lg text-gray-800 capitalize">
            {hint.type} Hint
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
      </div>

      <div className="mb-4">
        <div className="bg-gray-100 rounded-lg p-4 min-h-20">
          <p className="text-gray-700 leading-relaxed">
            {getProgressiveContent(hint.content, progress)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 rounded-full h-2 w-32">
            <motion.div
              className="bg-blue-500 rounded-full h-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs text-gray-600">
            {Math.round(progress * 100)}%
          </span>
        </div>

        {canProgress && progress < 1 && (
          <motion.button
            onClick={onNext}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Reveal More
          </motion.button>
        )}
      </div>

      {hint.type === HintType.EDUCATIONAL && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600">🎓</span>
            <span className="text-sm font-semibold text-green-700">Educational Value</span>
          </div>
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-sm ${
                  i < hint.educationalValue ? 'text-green-500' : 'text-gray-300'
                }`}
              >
                ⭐
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const HintSystem: React.FC<HintSystemProps> = ({
  gameState,
  onHintRequested,
  onHintDismissed,
  className = ''
}) => {
  const [currentHint, setCurrentHint] = useState<Hint | null>(null);
  const [hintProgress, setHintProgress] = useState(0);
  const [showHintMenu, setShowHintMenu] = useState(false);
  const [cooldownProgress, setCooldownProgress] = useState(0);

  const { hintSystem, settings, updateHintSystem, useHint, analyzePlayerStruggle } = useGameStore();

  // Cooldown timer effect
  useEffect(() => {
    if (hintSystem.cooldownTimeRemaining > 0) {
      const timer = setInterval(() => {
        updateHintSystem({
          cooldownTimeRemaining: Math.max(0, hintSystem.cooldownTimeRemaining - 100)
        });
        setCooldownProgress(
          1 - (hintSystem.cooldownTimeRemaining / settings.hintSettings.hintCooldownMs)
        );
      }, 100);

      return () => clearInterval(timer);
    } else {
      setCooldownProgress(0);
    }
  }, [hintSystem.cooldownTimeRemaining, settings.hintSettings.hintCooldownMs, updateHintSystem]);

  // Auto-suggest hints for struggling players
  useEffect(() => {
    if (hintSystem.autoSuggestEnabled && gameState.remainingCounties.length > 0) {
      const strugglingCounty = hintSystem.strugglingCounties.find(
        struggle => struggle.attempts >= settings.hintSettings.autoSuggestThreshold
      );

      if (strugglingCounty && !currentHint) {
        const suggestedHints = analyzeStruggle(strugglingCounty);
        if (suggestedHints.length > 0) {
          // Auto-suggest the most helpful hint
          handleHintRequest(suggestedHints[0], true);
        }
      }
    }
  }, [hintSystem.strugglingCounties, currentHint, settings.hintSettings.autoSuggestThreshold]);

  const handleHintRequest = useCallback((type: HintType, isAutoSuggested = false) => {
    if (gameState.remainingCounties.length === 0) return;

    const targetCounty = gameState.remainingCounties[0]; // Current target county
    const hint = generateHint(targetCounty, type, 0.3); // Start at 30% progress

    setCurrentHint(hint);
    setHintProgress(0.3);
    setShowHintMenu(false);

    // Update hint system state
    useHint(type, targetCounty.id, isAutoSuggested);
    onHintRequested(type);
  }, [gameState.remainingCounties, useHint, onHintRequested]);

  const handleHintProgression = useCallback(() => {
    if (!currentHint) return;

    const newProgress = Math.min(1, hintProgress + 0.3);
    setHintProgress(newProgress);

    if (newProgress >= 1 && currentHint.type !== HintType.EDUCATIONAL) {
      // For educational hints, keep them open longer
      setTimeout(() => {
        setCurrentHint(null);
        setHintProgress(0);
        onHintDismissed();
      }, 3000);
    }
  }, [currentHint, hintProgress, onHintDismissed]);

  const handleHintClose = useCallback(() => {
    setCurrentHint(null);
    setHintProgress(0);
    setShowHintMenu(false);
    onHintDismissed();
  }, [onHintDismissed]);

  const getHintButtonConfig = (type: HintType) => {
    const baseConfig = {
      [HintType.LOCATION]: {
        icon: '📍',
        label: 'Location',
        description: 'Show general area',
        cost: settings.hintSettings.scorePenaltyPerHint
      },
      [HintType.NAME]: {
        icon: '🔤',
        label: 'Name',
        description: 'Reveal letters',
        cost: settings.hintSettings.scorePenaltyPerHint * 1.5
      },
      [HintType.SHAPE]: {
        icon: '🗺️',
        label: 'Shape',
        description: 'Show boundary',
        cost: settings.hintSettings.scorePenaltyPerHint * 0.8
      },
      [HintType.NEIGHBOR]: {
        icon: '↔️',
        label: 'Neighbors',
        description: 'Highlight adjacent',
        cost: settings.hintSettings.scorePenaltyPerHint * 0.6
      },
      [HintType.FACT]: {
        icon: '💡',
        label: 'Fact',
        description: 'Interesting clue',
        cost: settings.hintSettings.scorePenaltyPerHint * 0.4
      },
      [HintType.EDUCATIONAL]: {
        icon: '📚',
        label: 'Learn',
        description: 'Educational content',
        cost: 0 // Educational hints are free
      }
    };

    return baseConfig[type];
  };

  const isHintAvailable = (type: HintType): boolean => {
    if (hintSystem.usedHints >= settings.hintSettings.maxHintsPerLevel) {
      return false;
    }
    // Check if this specific hint type was already used for current county
    const currentCounty = gameState.remainingCounties[0];
    if (!currentCounty) return false;

    const struggle = hintSystem.strugglingCounties.find(s => s.countyId === currentCounty.id);
    return !struggle?.suggestedHints.includes(type);
  };

  const canUseHints = hintSystem.cooldownTimeRemaining === 0 &&
                     hintSystem.availableHints > 0 &&
                     gameState.remainingCounties.length > 0;

  return (
    <div className={`hint-system ${className}`}>
      {/* Hint Button */}
      <motion.div className="relative">
        <motion.button
          onClick={() => setShowHintMenu(!showHintMenu)}
          className={`
            hint-toggle-button relative p-3 rounded-full shadow-lg transition-all duration-200
            ${canUseHints
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
          disabled={!canUseHints}
          whileHover={canUseHints ? { scale: 1.05 } : {}}
          whileTap={canUseHints ? { scale: 0.95 } : {}}
        >
          <span className="text-xl">💡</span>

          {/* Hint counter */}
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {hintSystem.availableHints}
          </div>

          {/* Cooldown indicator */}
          {hintSystem.cooldownTimeRemaining > 0 && (
            <motion.div
              className="absolute inset-0 border-4 border-orange-400 rounded-full"
              style={{
                background: `conic-gradient(transparent ${360 * cooldownProgress}deg, rgba(251, 146, 60, 0.3) 0deg)`
              }}
            />
          )}
        </motion.button>

        {/* Cooldown timer */}
        {hintSystem.cooldownTimeRemaining > 0 && (
          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs whitespace-nowrap">
            Cooldown: {Math.ceil(hintSystem.cooldownTimeRemaining / 1000)}s
          </div>
        )}
      </motion.div>

      {/* Hint Menu */}
      <AnimatePresence>
        {showHintMenu && (
          <motion.div
            className="hint-menu absolute top-full mt-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border-2 border-gray-200 p-4 z-50"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-3 w-80">
              {Object.values(HintType).map(type => {
                const config = getHintButtonConfig(type);
                const available = isHintAvailable(type);
                const disabled = !canUseHints;

                return (
                  <HintButton
                    key={type}
                    type={type}
                    icon={config.icon}
                    label={config.label}
                    description={config.description}
                    available={available}
                    cost={config.cost}
                    onClick={() => handleHintRequest(type)}
                    disabled={disabled}
                  />
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-600">
                {hintSystem.usedHints}/{settings.hintSettings.maxHintsPerLevel} hints used this level
              </p>
              {hintSystem.freeHintsRemaining > 0 && (
                <p className="text-xs text-green-600 font-semibold">
                  {hintSystem.freeHintsRemaining} free hints remaining
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint Display */}
      <AnimatePresence>
        {currentHint && (
          <motion.div
            className="hint-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HintDisplay
              hint={currentHint}
              progress={hintProgress}
              onNext={handleHintProgression}
              onClose={handleHintClose}
              canProgress={hintProgress < 1}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HintSystem;