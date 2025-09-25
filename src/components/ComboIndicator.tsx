import React, { useEffect, useState } from 'react';
import { calculateStreakBonus, SCORING_CONSTANTS } from '../utils/scoring';

interface ComboIndicatorProps {
  currentStreak: number;
  maxStreak: number;
  isVisible: boolean;
  onComboEnd?: () => void;
  className?: string;
}

interface ComboState {
  isAnimating: boolean;
  showNewStreak: boolean;
  previousStreak: number;
}

const COMBO_MESSAGES = [
  { min: 3, max: 4, message: "Nice!", color: "text-blue-600", bg: "bg-blue-100" },
  { min: 5, max: 7, message: "Great!", color: "text-green-600", bg: "bg-green-100" },
  { min: 8, max: 10, message: "Excellent!", color: "text-orange-600", bg: "bg-orange-100" },
  { min: 11, max: 15, message: "Amazing!", color: "text-purple-600", bg: "bg-purple-100" },
  { min: 16, max: 20, message: "Incredible!", color: "text-red-600", bg: "bg-red-100" },
  { min: 21, max: Infinity, message: "LEGENDARY!", color: "text-pink-600", bg: "bg-pink-100" }
];

const STREAK_INDICATORS = [
  "★", "▲", "●", "♦", "◆", "■", "▼", "►", "♠", "♣"
];

export const ComboIndicator: React.FC<ComboIndicatorProps> = ({
  currentStreak,
  maxStreak,
  isVisible,
  onComboEnd,
  className = ''
}) => {
  const [comboState, setComboState] = useState<ComboState>({
    isAnimating: false,
    showNewStreak: false,
    previousStreak: 0
  });

  const [displayStreak, setDisplayStreak] = useState(currentStreak);

  // Handle streak changes
  useEffect(() => {
    if (currentStreak > comboState.previousStreak && currentStreak >= SCORING_CONSTANTS.COMBO_THRESHOLD) {
      // New streak achievement
      setComboState({
        isAnimating: true,
        showNewStreak: true,
        previousStreak: currentStreak
      });

      // Animate the streak number
      let start = displayStreak;
      const increment = currentStreak > start ? 1 : -1;
      const animateStreak = () => {
        start += increment;
        setDisplayStreak(start);

        if (start !== currentStreak) {
          setTimeout(animateStreak, 50);
        } else {
          setTimeout(() => {
            setComboState(prev => ({ ...prev, isAnimating: false }));
          }, 1000);
        }
      };

      if (start !== currentStreak) {
        setTimeout(animateStreak, 100);
      }

    } else if (currentStreak === 0 && comboState.previousStreak > 0) {
      // Combo ended
      setComboState({
        isAnimating: false,
        showNewStreak: false,
        previousStreak: 0
      });
      setDisplayStreak(0);

      if (onComboEnd) {
        onComboEnd();
      }
    } else {
      setDisplayStreak(currentStreak);
      setComboState(prev => ({ ...prev, previousStreak: currentStreak }));
    }
  }, [currentStreak, comboState.previousStreak, displayStreak, onComboEnd]);

  // Don't render if streak is below threshold and not visible
  if (!isVisible || (currentStreak < SCORING_CONSTANTS.COMBO_THRESHOLD && !comboState.isAnimating)) {
    return null;
  }

  // Get combo message and styling
  const comboInfo = COMBO_MESSAGES.find(c => currentStreak >= c.min && currentStreak <= c.max)
    || COMBO_MESSAGES[COMBO_MESSAGES.length - 1];

  // Get appropriate indicator
  const indicatorIndex = Math.min(Math.floor((currentStreak - 3) / 2), STREAK_INDICATORS.length - 1);
  const indicator = STREAK_INDICATORS[Math.max(0, indicatorIndex)];

  // Calculate streak bonus
  const streakBonus = calculateStreakBonus(currentStreak);

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <div className={
        `${comboInfo.bg} ${comboInfo.color} px-6 py-3 rounded-full shadow-lg border-2 ` +
        `transition-all duration-300 transform ${comboState.isAnimating ? 'animate-bounce scale-110' : 'scale-100'} ` +
        `${currentStreak >= 10 ? 'animate-pulse' : ''}`
      }>
        <div className="flex items-center space-x-3">
          {/* Indicator with animation */}
          <span className={
            `text-2xl ${comboState.isAnimating ? 'animate-spin' : ''} ` +
            `${currentStreak >= 15 ? 'animate-bounce' : ''}`
          }>
            {indicator}
          </span>

          {/* Combo info */}
          <div className="text-center">
            <div className="font-bold text-lg">
              {comboInfo.message}
            </div>
            <div className="text-sm font-semibold">
              {displayStreak} Streak
            </div>
            {streakBonus > 0 && (
              <div className="text-xs font-medium">
                +{streakBonus.toLocaleString()} bonus
              </div>
            )}
          </div>

          {/* Streak counter with animation */}
          <div className="relative">
            <div className={
              `text-3xl font-bold ${comboState.showNewStreak ? 'animate-pulse' : ''}`
            }>
              {displayStreak}
            </div>

            {/* New streak indicator */}
            {comboState.showNewStreak && comboState.isAnimating && (
              <div className="absolute -top-2 -right-2 animate-ping">
                <span className="text-yellow-400 text-lg">★</span>
              </div>
            )}
          </div>
        </div>

        {/* Max streak indicator */}
        {currentStreak === maxStreak && maxStreak >= 5 && (
          <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full animate-bounce">
            BEST!
          </div>
        )}

        {/* Legendary effects - PRESERVED as completion celebration */}
        {currentStreak >= 20 && (
          <>
            {/* Particle effects */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-ping"
                  style={{
                    left: `${20 + (i * 12)}%`,
                    top: `${10 + (i % 3) * 20}%`,
                    animationDelay: `${i * 200}ms`,
                    animationDuration: '1s'
                  }}
                >
                  <span className="text-yellow-400 text-xs">★</span>
                </div>
              ))}
            </div>

            {/* Rainbow border effect - PRESERVED as completion celebration */}
            <div className="absolute inset-0 rounded-full animate-spin border-2 border-transparent bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 opacity-50" />
          </>
        )}
      </div>

      {/* Combo multiplier bar */}
      {currentStreak >= SCORING_CONSTANTS.COMBO_THRESHOLD && (
        <div className="mt-2 px-4">
          <div className="bg-white bg-opacity-90 rounded-full p-1">
            <div className="bg-gray-200 rounded-full h-2 relative overflow-hidden">
              <div
                className={
                  `h-full rounded-full transition-all duration-500 ` +
                  `${currentStreak < 5 ? 'bg-blue-500' :
                    currentStreak < 10 ? 'bg-green-500' :
                    currentStreak < 15 ? 'bg-orange-500' :
                    currentStreak < 20 ? 'bg-purple-500' :
                    'bg-topo-peak-500'}`
                }
                style={{
                  width: `${Math.min((currentStreak / Math.max(maxStreak, 10)) * 100, 100)}%`
                }}
              />

              {/* Shimmer effect for high streaks */}
              {currentStreak >= 10 && (
                <div className="absolute inset-0 bg-white opacity-30 animate-pulse" />
              )}
            </div>

            <div className="text-center text-xs text-gray-600 mt-1">
              Multiplier: {Math.min(currentStreak * 0.1 + 1, SCORING_CONSTANTS.MAX_STREAK_MULTIPLIER).toFixed(1)}x
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboIndicator;