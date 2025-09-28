import React, { useMemo, useEffect, useState } from 'react';
import {
  GameModeConfiguration,
  GameStats,
  UnlockRequirement,
  UnlockRequirementType,
  Achievement,
  CaliforniaRegion
} from '@/types';
import { getUnlockedModes, calculateModeStars, getModeById } from '@/config/gameModes';
import { CaliforniaButton } from './CaliforniaButton';

interface ProgressionSystemProps {
  availableModes: GameModeConfiguration[];
  playerStats: GameStats;
  achievements: Achievement[];
  onModeUnlock?: (mode: GameModeConfiguration) => void;
  className?: string;
}

interface UnlockProgress {
  requirement: UnlockRequirement;
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
  description: string;
}

interface ModeUnlockStatus {
  mode: GameModeConfiguration;
  isUnlocked: boolean;
  unlockProgress: UnlockProgress[];
  canUnlockNow: boolean;
  nextToUnlock: boolean;
}

export const ProgressionSystem: React.FC<ProgressionSystemProps> = ({
  availableModes,
  playerStats,
  achievements,
  onModeUnlock,
  className = ''
}) => {
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<string[]>([]);

  // Calculate unlock status for all modes
  const modeUnlockStatuses = useMemo((): ModeUnlockStatus[] => {
    const unlockedModes = getUnlockedModes(playerStats);
    const unlockedModeIds = new Set(unlockedModes.map(m => m.id));

    return availableModes.map(mode => {
      const isUnlocked = !mode.isLocked || unlockedModeIds.has(mode.id);

      const unlockProgress: UnlockProgress[] = mode.unlockRequirements?.map(req => {
        const progress = calculateRequirementProgress(req, playerStats, achievements, availableModes);
        return {
          requirement: req,
          currentProgress: progress.current,
          targetProgress: progress.target,
          isCompleted: progress.current >= progress.target,
          description: getRequirementDescription(req, progress.target)
        };
      }) || [];

      const canUnlockNow = !isUnlocked && unlockProgress.every(p => p.isCompleted);

      return {
        mode,
        isUnlocked,
        unlockProgress,
        canUnlockNow,
        nextToUnlock: !isUnlocked && unlockProgress.some(p => !p.isCompleted)
      };
    });
  }, [availableModes, playerStats, achievements]);

  // Find modes that can be unlocked now
  const modesReadyToUnlock = useMemo(() => {
    return modeUnlockStatuses.filter(status => status.canUnlockNow);
  }, [modeUnlockStatuses]);

  // Auto-unlock modes when requirements are met
  useEffect(() => {
    modesReadyToUnlock.forEach(status => {
      if (!recentlyUnlocked.includes(status.mode.id)) {
        setRecentlyUnlocked(prev => [...prev, status.mode.id]);
        onModeUnlock?.(status.mode);
      }
    });
  }, [modesReadyToUnlock, recentlyUnlocked, onModeUnlock]);

  // Calculate overall progression statistics
  const progressionStats = useMemo(() => {
    const totalModes = availableModes.length;
    const unlockedModes = modeUnlockStatuses.filter(s => s.isUnlocked).length;
    const completedModes = availableModes.filter(m => m.isCompleted).length;
    const totalStars = availableModes.reduce((sum, m) => sum + m.stars, 0);
    const maxStars = totalModes * 3;

    // Calculate next unlock distance
    const lockedModes = modeUnlockStatuses.filter(s => !s.isUnlocked);
    const nextUnlockDistance = lockedModes.length > 0
      ? Math.min(...lockedModes.map(s =>
          s.unlockProgress.reduce((total, p) =>
            total + Math.max(0, p.targetProgress - p.currentProgress), 0
          )
        ))
      : 0;

    return {
      totalModes,
      unlockedModes,
      completedModes,
      totalStars,
      maxStars,
      unlockProgress: totalModes > 0 ? unlockedModes / totalModes : 0,
      completionProgress: totalModes > 0 ? completedModes / totalModes : 0,
      starProgress: maxStars > 0 ? totalStars / maxStars : 0,
      nextUnlockDistance
    };
  }, [availableModes, modeUnlockStatuses]);

  const handleDismissUnlock = (modeId: string) => {
    setRecentlyUnlocked(prev => prev.filter(id => id !== modeId));
  };

  const renderProgressBar = (current: number, target: number, color: string = 'blue') => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`bg-${color}-600 h-2 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    );
  };

  const renderUnlockRequirement = (progress: UnlockProgress, index: number) => (
    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
        progress.isCompleted
          ? 'bg-green-500 border-green-500 text-white'
          : 'border-gray-300'
      }`}>
        {progress.isCompleted && <span className="text-xs">✓</span>}
      </div>

      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">
          {progress.description}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1">
            {renderProgressBar(progress.currentProgress, progress.targetProgress,
              progress.isCompleted ? 'green' : 'blue')}
          </div>
          <span className="text-xs text-gray-500">
            {progress.currentProgress}/{progress.targetProgress}
          </span>
        </div>
      </div>
    </div>
  );

  const renderModeUnlockCard = (status: ModeUnlockStatus) => {
    if (status.isUnlocked) return null;

    return (
      <div key={status.mode.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-start gap-3 mb-3">
          <div className="text-2xl opacity-50">{status.mode.icon}</div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-700">{status.mode.name}</h4>
            <p className="text-sm text-gray-500">{status.mode.description}</p>
          </div>
          <div className="text-xs bg-gray-100 px-2 py-1 rounded">
            {status.canUnlockNow ? 'Ready!' : 'Locked'}
          </div>
        </div>

        <div className="space-y-2">
          {status.unlockProgress.map((progress, index) =>
            renderUnlockRequirement(progress, index)
          )}
        </div>

        {status.canUnlockNow && (
          <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <span className="text-lg">🎉</span>
              <span className="font-medium">Ready to unlock!</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOverallProgress = () => (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Your Journey Progress</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Modes Unlocked */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {progressionStats.unlockedModes}/{progressionStats.totalModes}
          </div>
          <div className="text-sm text-gray-600 mb-2">Modes Unlocked</div>
          {renderProgressBar(progressionStats.unlockedModes, progressionStats.totalModes, 'blue')}
        </div>

        {/* Modes Completed */}
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {progressionStats.completedModes}/{progressionStats.totalModes}
          </div>
          <div className="text-sm text-gray-600 mb-2">Modes Completed</div>
          {renderProgressBar(progressionStats.completedModes, progressionStats.totalModes, 'green')}
        </div>

        {/* Stars Earned */}
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-1">
            {progressionStats.totalStars}/{progressionStats.maxStars}
          </div>
          <div className="text-sm text-gray-600 mb-2">Stars Earned</div>
          {renderProgressBar(progressionStats.totalStars, progressionStats.maxStars, 'yellow')}
        </div>
      </div>

      {/* Next Milestone */}
      {progressionStats.nextUnlockDistance > 0 && (
        <div className="mt-4 p-3 bg-white bg-opacity-60 rounded">
          <div className="text-sm text-gray-700">
            <span className="font-medium">Next unlock:</span> Complete {progressionStats.nextUnlockDistance} more requirement(s)
          </div>
        </div>
      )}
    </div>
  );

  const renderUnlockNotifications = () => {
    const notifications = modesReadyToUnlock.filter(status =>
      recentlyUnlocked.includes(status.mode.id)
    );

    if (notifications.length === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(status => (
          <div
            key={status.mode.id}
            className="bg-green-500 text-white p-4 rounded-lg shadow-lg animate-bounce"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{status.mode.icon}</span>
              <div className="flex-1">
                <div className="font-bold">Mode Unlocked!</div>
                <div className="text-sm opacity-90">{status.mode.name}</div>
              </div>
              <CaliforniaButton
                variant="secondary"
                size="sm"
                onClick={() => handleDismissUnlock(status.mode.id)}
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                ✓
              </CaliforniaButton>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={className}>
      {/* Unlock Notifications */}
      {renderUnlockNotifications()}

      {/* Overall Progress */}
      {renderOverallProgress()}

      {/* Locked Modes */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Unlock New Modes</h3>
        {modeUnlockStatuses
          .filter(status => !status.isUnlocked)
          .map(renderModeUnlockCard)
        }

        {modeUnlockStatuses.every(status => status.isUnlocked) && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              All Modes Unlocked!
            </h3>
            <p className="text-gray-600">
              You've unlocked every game mode. Now focus on earning 3 stars in each!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
function calculateRequirementProgress(
  requirement: UnlockRequirement,
  playerStats: GameStats,
  achievements: Achievement[],
  modes: GameModeConfiguration[]
): { current: number; target: number } {
  switch (requirement.type) {
    case UnlockRequirementType.COMPLETE_MODE:
      const targetMode = getModeById(requirement.target);
      return {
        current: targetMode?.isCompleted ? 1 : 0,
        target: 1
      };

    case UnlockRequirementType.TOTAL_GAMES:
      return {
        current: playerStats.totalGamesPlayed,
        target: requirement.threshold || 1
      };

    case UnlockRequirementType.ACHIEVE_SCORE:
      return {
        current: playerStats.bestScore,
        target: requirement.threshold || 1000
      };

    case UnlockRequirementType.COMPLETE_REGION:
      const regionModes = modes.filter(m =>
        m.counties.some(county =>
          // This would need proper region checking logic
          true
        )
      );
      const completedRegionModes = regionModes.filter(m => m.isCompleted);
      return {
        current: completedRegionModes.length,
        target: regionModes.length
      };

    case UnlockRequirementType.EARN_ACHIEVEMENT:
      const achievement = achievements.find(a => a.id === requirement.target);
      return {
        current: achievement?.isUnlocked ? 1 : 0,
        target: 1
      };

    default:
      return { current: 0, target: 1 };
  }
}

function getRequirementDescription(requirement: UnlockRequirement, target: number): string {
  switch (requirement.type) {
    case UnlockRequirementType.COMPLETE_MODE:
      return `Complete "${requirement.target}" mode`;
    case UnlockRequirementType.TOTAL_GAMES:
      return `Play ${target} game${target !== 1 ? 's' : ''}`;
    case UnlockRequirementType.ACHIEVE_SCORE:
      return `Score ${target.toLocaleString()} points`;
    case UnlockRequirementType.COMPLETE_REGION:
      return `Complete all modes in ${requirement.target}`;
    case UnlockRequirementType.EARN_ACHIEVEMENT:
      return `Earn "${requirement.target}" achievement`;
    default:
      return 'Unknown requirement';
  }
}