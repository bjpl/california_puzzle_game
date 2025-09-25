// Achievement Notification Component
// Displays achievement unlock notifications with animations

import React, { useEffect, useState } from 'react';
import { AchievementDefinition, AchievementRarity } from '../utils/achievements';

interface AchievementNotificationProps {
  achievement: AchievementDefinition;
  visible: boolean;
  onClose: () => void;
  autoHideDelay?: number;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  visible,
  onClose,
  autoHideDelay = 5000
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsAnimating(true);
      
      // Auto-hide after delay
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [visible, onClose, autoHideDelay]);

  const getRarityStyles = (rarity: AchievementRarity) => {
    switch (rarity) {
      case AchievementRarity.COMMON:
        return {
          bg: 'bg-topo-slate-500',
          text: 'text-white',
          glow: 'shadow-lg shadow-gray-500/50',
          border: 'border-gray-400'
        };
      case AchievementRarity.RARE:
        return {
          bg: 'bg-topo-ocean-500',
          text: 'text-white',
          glow: 'shadow-lg shadow-blue-500/50',
          border: 'border-blue-400'
        };
      case AchievementRarity.EPIC:
        return {
          bg: 'bg-topo-ink-600',
          text: 'text-white',
          glow: 'shadow-lg shadow-purple-500/50',
          border: 'border-purple-400'
        };
      case AchievementRarity.LEGENDARY:
        return {
          bg: 'bg-topo-peak-500',
          text: 'text-black',
          glow: 'shadow-lg shadow-yellow-500/50',
          border: 'border-yellow-300'
        };
      default:
        return {
          bg: 'bg-topo-slate-500',
          text: 'text-white',
          glow: 'shadow-lg shadow-gray-500/50',
          border: 'border-gray-400'
        };
    }
  };

  const styles = getRarityStyles(achievement.rarity);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30" />
      
      {/* Notification */}
      <div 
        className={`
          relative pointer-events-auto
          transform transition-all duration-500 ease-out
          ${isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
          ${styles.bg} ${styles.text} ${styles.glow}
          border-2 ${styles.border}
          rounded-lg p-6 max-w-md mx-4
          animate-pulse
        `}
      >
        {/* Sparkle Effects */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-white rounded-full animate-ping opacity-75" />
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-white rounded-full animate-ping opacity-75 animation-delay-150" />
        <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-white rounded-full animate-ping opacity-75 animation-delay-300" />
        <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-white rounded-full animate-ping opacity-75 animation-delay-450" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white/70 hover:text-white text-xl leading-none"
        >
          ×
        </button>
        
        {/* Content */}
        <div className="text-center">
          {/* Header */}
          <div className="mb-4">
            <div className="text-sm font-medium opacity-90 mb-1">
              🏆 ACHIEVEMENT UNLOCKED!
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${styles.border} bg-white/20`}>
              {achievement.rarity}
            </div>
          </div>
          
          {/* Achievement Info */}
          <div className="mb-4">
            <div className="text-4xl mb-2 animate-bounce">
              {achievement.icon}
            </div>
            <h3 className="text-xl font-bold mb-2">
              {achievement.name}
            </h3>
            <p className="text-sm opacity-90">
              {achievement.description}
            </p>
          </div>
          
          {/* Points */}
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">✨</span>
            <span className="text-lg font-bold">
              +{achievement.points} points
            </span>
            <span className="text-2xl">✨</span>
          </div>
        </div>
        
        {/* Rarity Glow Effect */}
        <div className={`absolute inset-0 rounded-lg ${styles.bg} opacity-20 blur-xl -z-10`} />
      </div>
    </div>
  );
};

export default AchievementNotification;
