// Statistics Dashboard Component
// Displays comprehensive game analytics and progress visualization

import React, { useState, useMemo } from 'react';
import { useProgress, useDailyProgress } from '../hooks/useProgress';
import { useAchievements } from '../hooks/useAchievements';
import { storageManager } from '../utils/storage';
import { CaliforniaRegion, DifficultyLevel } from '../types';
import { AchievementRarity } from '../utils/achievements';

interface StatisticsProps {
  className?: string;
  onClose?: () => void;
}

type TabType = 'overview' | 'progress' | 'achievements' | 'analytics' | 'leaderboard';

const Statistics: React.FC<StatisticsProps> = ({ className = '', onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedRegion, setSelectedRegion] = useState<CaliforniaRegion | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  
  const { progressData, analytics, isLoading: progressLoading, progressPercentage, performanceRating } = useProgress();
  const { dailyStats } = useDailyProgress();
  const { achievements, totalPoints, completionPercentage, rarityStats, recentUnlocks } = useAchievements();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'progress', label: 'Progress', icon: '📈' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'analytics', label: 'Analytics', icon: '🧠' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🥇' }
  ];

  const formatTime = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatAccuracy = (accuracy: number): string => {
    return `${Math.round(accuracy * 100)}%`;
  };

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
      case AchievementRarity.COMMON: return 'bg-gray-100';
      case AchievementRarity.RARE: return 'bg-blue-100';
      case AchievementRarity.EPIC: return 'bg-purple-100';
      case AchievementRarity.LEGENDARY: return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{progressData?.totalGamesPlayed || 0}</div>
          <div className="text-sm text-blue-500">Games Played</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{Math.round(progressPercentage)}%</div>
          <div className="text-sm text-green-500">Counties Learned</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
          <div className="text-sm text-purple-500">Achievement Points</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{performanceRating}</div>
          <div className="text-sm text-orange-500">Performance</div>
        </div>
      </div>

      {/* Daily Progress */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Today's Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xl font-bold">{dailyStats.gamesPlayed}</div>
            <div className="text-sm text-gray-500">Games Today</div>
          </div>
          <div>
            <div className="text-xl font-bold">{dailyStats.totalScore}</div>
            <div className="text-sm text-gray-500">Score Today</div>
          </div>
          <div>
            <div className="text-xl font-bold">{formatTime(dailyStats.timeSpent)}</div>
            <div className="text-sm text-gray-500">Time Played</div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      {recentUnlocks.length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
          <div className="space-y-2">
            {recentUnlocks.map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{achievement.name}</div>
                  <div className="text-sm text-gray-500">{achievement.description}</div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${getRarityBg(achievement.rarity)} ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-6">
      {/* Learning Progress */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Learning Progress</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Counties Learned</span>
              <span>{progressData?.countiesLearned.size || 0}/58</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {/* Accuracy by Region */}
          <div>
            <h4 className="font-medium mb-2">Accuracy by Region</h4>
            <div className="space-y-2">
              {Object.entries(progressData?.accuracyByRegion || {}).map(([region, accuracy]) => (
                <div key={region} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{region.replace('_', ' ')}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-green-600 h-1 rounded-full"
                        style={{ width: `${accuracy * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{formatAccuracy(accuracy)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Speed by Difficulty */}
          <div>
            <h4 className="font-medium mb-2">Average Speed by Difficulty</h4>
            <div className="space-y-2">
              {Object.entries(progressData?.speedByDifficulty || {}).map(([difficulty, speed]) => (
                <div key={difficulty} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{difficulty}</span>
                  <span className="text-sm font-medium">{formatTime(speed)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Curve */}
      {progressData?.learningCurve && progressData.learningCurve.length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Learning Curve</h3>
          <div className="h-64 flex items-end justify-between space-x-1">
            {progressData.learningCurve.slice(-20).map((point, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-blue-500 w-full rounded-t"
                  style={{ height: `${point.accuracy * 100}%` }}
                  title={`Accuracy: ${formatAccuracy(point.accuracy)}`}
                ></div>
                <div className="text-xs text-gray-500 mt-1 transform rotate-45">
                  {point.date.toLocaleDateString().slice(0, 5)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      {/* Achievement Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(rarityStats).map(([rarity, stats]) => (
          <div key={rarity} className={`p-4 rounded-lg ${getRarityBg(rarity as AchievementRarity)}`}>
            <div className={`text-xl font-bold ${getRarityColor(rarity as AchievementRarity)}`}>
              {stats.unlocked}/{stats.total}
            </div>
            <div className={`text-sm capitalize ${getRarityColor(rarity as AchievementRarity)}`}>
              {rarity}
            </div>
          </div>
        ))}
      </div>

      {/* Achievement List */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">All Achievements</h3>
        <div className="grid gap-4">
          {achievements
            .filter(a => !a.hidden || a.isUnlocked)
            .map((achievement) => (
            <div key={achievement.id} className={`p-4 rounded-lg border ${achievement.isUnlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <div className="font-medium">{achievement.name}</div>
                    <div className="text-sm text-gray-500">{achievement.description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getRarityBg(achievement.rarity)} ${getRarityColor(achievement.rarity)}`}>
                    {achievement.points} pts
                  </div>
                  {achievement.isUnlocked ? (
                    <span className="text-green-600 text-sm">✓ Unlocked</span>
                  ) : (
                    <div className="text-sm text-gray-500">
                      {Math.round(achievement.progress * 100)}%
                    </div>
                  )}
                </div>
              </div>
              {!achievement.isUnlocked && achievement.progress > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${achievement.progress * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {analytics && (
        <>
          {/* Strengths and Weaknesses */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold mb-4 text-green-800">Strengths</h3>
              <ul className="space-y-2">
                {analytics.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-green-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold mb-4 text-orange-800">Areas for Improvement</h3>
              <ul className="space-y-2">
                {analytics.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="text-orange-600">!</span>
                    <span className="text-orange-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Recommendations</h3>
            <ul className="space-y-2">
              {analytics.recommendations.map((rec, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="text-blue-600">💡</span>
                  <span className="text-blue-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvement Areas */}
          {analytics.improvementAreas.length > 0 && (
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Detailed Improvement Plan</h3>
              <div className="space-y-4">
                {analytics.improvementAreas.map((area, index) => (
                  <div key={index} className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-medium text-purple-700">{area.area}</h4>
                    <div className="flex items-center space-x-2 my-2">
                      <span className="text-sm text-gray-500">Current: {area.currentLevel}%</span>
                      <span className="text-sm text-gray-500">→</span>
                      <span className="text-sm text-gray-500">Target: {area.targetLevel}%</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      {area.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-gray-600">• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderLeaderboard = () => {
    const leaderboard = storageManager.getLeaderboard(
      selectedRegion !== 'all' ? selectedRegion as CaliforniaRegion : undefined,
      selectedDifficulty !== 'all' ? selectedDifficulty as DifficultyLevel : undefined
    );

    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Region</label>
              <select 
                value={selectedRegion} 
                onChange={(e) => setSelectedRegion(e.target.value as CaliforniaRegion | 'all')}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="all">All Regions</option>
                {Object.values(CaliforniaRegion).map(region => (
                  <option key={region} value={region}>{region.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select 
                value={selectedDifficulty} 
                onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | 'all')}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="all">All Difficulties</option>
                {Object.values(DifficultyLevel).map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">Leaderboard</h3>
          </div>
          <div className="divide-y">
            {leaderboard.slice(0, 20).map((entry, index) => (
              <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{entry.profileName}</div>
                    <div className="text-sm text-gray-500">
                      {entry.region.replace('_', ' ')} • {entry.difficulty}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{entry.score.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">
                    {formatTime(entry.completionTime)} • {formatAccuracy(entry.accuracy)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {leaderboard.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No leaderboard entries yet. Complete some games to see your scores here!
            </div>
          )}
        </div>
      </div>
    );
  };

  if (progressLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-4 text-gray-500">Loading statistics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg max-w-6xl mx-auto ${className}`}>
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Game Statistics</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-96 overflow-y-auto">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'progress' && renderProgress()}
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'leaderboard' && renderLeaderboard()}
      </div>
    </div>
  );
};

export default Statistics;
