// Achievement Gallery Component
// Displays all achievements with filtering and detailed views

import React, { useState, useMemo } from 'react';
import { useAchievements } from '../hooks/useAchievements';
import { AchievementDefinition, AchievementRarity } from '../utils/achievements';
import { AchievementCategory } from '../types';

interface AchievementGalleryProps {
  className?: string;
  onClose?: () => void;
}

type FilterType = 'all' | 'unlocked' | 'locked' | AchievementCategory | AchievementRarity;

const AchievementGallery: React.FC<AchievementGalleryProps> = ({ className = '', onClose }) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementDefinition | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { achievements, totalPoints, completionPercentage, rarityStats } = useAchievements();

  const filters = [
    { id: 'all', label: 'All', icon: '📋' },
    { id: 'unlocked', label: 'Unlocked', icon: '🔓' },
    { id: 'locked', label: 'Locked', icon: '🔒' },
    { id: 'common', label: 'Common', icon: '🟨' },
    { id: 'rare', label: 'Rare', icon: '🔵' },
    { id: 'epic', label: 'Epic', icon: '🟣' },
    { id: 'legendary', label: 'Legendary', icon: '🟡' },
    { id: 'accuracy', label: 'Accuracy', icon: '🎯' },
    { id: 'speed', label: 'Speed', icon: '⚡' },
    { id: 'completion', label: 'Completion', icon: '🏆' },
    { id: 'streak', label: 'Streak', icon: '🔥' },
    { id: 'exploration', label: 'Exploration', icon: '🗺️' }
  ];

  const filteredAchievements = useMemo(() => {
    let filtered = achievements.filter(a => !a.hidden || a.isUnlocked);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category/rarity filter
    switch (selectedFilter) {
      case 'unlocked':
        filtered = filtered.filter(a => a.isUnlocked);
        break;
      case 'locked':
        filtered = filtered.filter(a => !a.isUnlocked);
        break;
      case 'common':
      case 'rare':
      case 'epic':
      case 'legendary':
        filtered = filtered.filter(a => a.rarity === selectedFilter);
        break;
      case 'accuracy':
      case 'speed':
      case 'completion':
      case 'streak':
      case 'exploration':
        filtered = filtered.filter(a => a.category === selectedFilter);
        break;
      default:
        break;
    }

    return filtered.sort((a, b) => {
      // Sort unlocked first, then by rarity (legendary first), then alphabetically
      if (a.isUnlocked !== b.isUnlocked) {
        return a.isUnlocked ? -1 : 1;
      }
      
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      const aRarity = rarityOrder[a.rarity];
      const bRarity = rarityOrder[b.rarity];
      
      if (aRarity !== bRarity) {
        return aRarity - bRarity;
      }
      
      return a.name.localeCompare(b.name);
    });
  }, [achievements, selectedFilter, searchTerm]);

  const getRarityColor = (rarity: AchievementRarity): string => {
    switch (rarity) {
      case AchievementRarity.COMMON: return 'text-gray-600';
      case AchievementRarity.RARE: return 'text-blue-600';
      case AchievementRarity.EPIC: return 'text-purple-600';
      case AchievementRarity.LEGENDARY: return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getRarityBg = (rarity: AchievementRarity): string => {
    switch (rarity) {
      case AchievementRarity.COMMON: return 'bg-gray-100 border-gray-300';
      case AchievementRarity.RARE: return 'bg-blue-100 border-blue-300';
      case AchievementRarity.EPIC: return 'bg-purple-100 border-purple-300';
      case AchievementRarity.LEGENDARY: return 'bg-yellow-100 border-yellow-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 1) return 'bg-green-500';
    if (progress >= 0.7) return 'bg-yellow-500';
    if (progress >= 0.3) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const AchievementCard: React.FC<{ achievement: AchievementDefinition }> = ({ achievement }) => (
    <div 
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
        ${achievement.isUnlocked ? getRarityBg(achievement.rarity) : 'bg-gray-50 border-gray-200'}
        hover:shadow-lg hover:scale-105
        ${achievement.isUnlocked ? 'opacity-100' : 'opacity-60'}
      `}
      onClick={() => setSelectedAchievement(achievement)}
    >
      {/* Rarity Badge */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold uppercase ${getRarityColor(achievement.rarity)}`}>
        {achievement.rarity}
      </div>
      
      {/* Achievement Icon */}
      <div className="text-center mb-3">
        <div className={`text-4xl mb-2 ${achievement.isUnlocked ? '' : 'grayscale'}`}>
          {achievement.icon}
        </div>
        {achievement.isUnlocked && (
          <div className="text-green-600 text-sm font-bold">✓ UNLOCKED</div>
        )}
      </div>
      
      {/* Achievement Info */}
      <div className="text-center">
        <h3 className="font-bold text-sm mb-1 line-clamp-1">
          {achievement.name}
        </h3>
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {achievement.description}
        </p>
        
        {/* Points */}
        <div className="flex items-center justify-center space-x-1 mb-2">
          <span className="text-xs">✨</span>
          <span className="text-xs font-bold">{achievement.points} pts</span>
        </div>
        
        {/* Progress Bar */}
        {!achievement.isUnlocked && achievement.progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(achievement.progress)}`}
              style={{ width: `${achievement.progress * 100}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );

  const AchievementDetail: React.FC<{ achievement: AchievementDefinition }> = ({ achievement }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className={`p-6 ${getRarityBg(achievement.rarity)} rounded-t-lg`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <h2 className="text-xl font-bold mb-1">{achievement.name}</h2>
              <div className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${getRarityColor(achievement.rarity)}`}>
                {achievement.rarity} • {achievement.points} points
              </div>
            </div>
            <button
              onClick={() => setSelectedAchievement(null)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">{achievement.description}</p>
          
          {/* Status */}
          <div className="mb-4">
            {achievement.isUnlocked ? (
              <div className="flex items-center text-green-600">
                <span className="mr-2">✓</span>
                <span className="font-medium">Unlocked</span>
                {achievement.unlockedAt && (
                  <span className="ml-2 text-sm text-gray-500">
                    on {achievement.unlockedAt.toLocaleDateString()}
                  </span>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{Math.round(achievement.progress * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(achievement.progress)}`}
                    style={{ width: `${achievement.progress * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Requirements */}
          {achievement.requirements && achievement.requirements.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Requirements:</h4>
              <ul className="space-y-2">
                {achievement.requirements.map((req, index) => (
                  <li key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{req.description}</span>
                    <span className={`font-medium ${
                      req.current >= req.threshold ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {req.current}/{req.threshold}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Category */}
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Category: <span className="font-medium capitalize">{achievement.category}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Achievement Gallery</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          )}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round(completionPercentage)}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
            <div className="text-sm text-gray-500">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {achievements.filter(a => a.isUnlocked).length}
            </div>
            <div className="text-sm text-gray-500">Unlocked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {achievements.filter(a => !a.isUnlocked && a.progress > 0).length}
            </div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
        </div>
        
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Filters */}
      <div className="border-b p-4">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id as FilterType)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span className="mr-1">{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Achievement Grid */}
      <div className="p-6">
        {filteredAchievements.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-lg mb-2">No achievements found</div>
            <div className="text-sm">Try adjusting your search or filter</div>
          </div>
        )}
      </div>
      
      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <AchievementDetail achievement={selectedAchievement} />
      )}
    </div>
  );
};

export default AchievementGallery;
