import React from 'react';
import { clsx } from 'clsx';
import {
  MapPin,
  Mountain,
  Trees,
  Waves,
  Sun,
  Trophy,
  Star
} from 'lucide-react';

interface Milestone {
  position: number;
  icon: React.ElementType;
  label: string;
  completed: boolean;
  description?: string;
}

interface ProgressIndicatorProps {
  completionPercentage: number;
  milestones?: Milestone[];
  title?: string;
  subtitle?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

const defaultMilestones: Milestone[] = [
  {
    position: 0,
    icon: MapPin,
    label: 'Start Journey',
    completed: true,
    description: 'Begin your California exploration'
  },
  {
    position: 20,
    icon: Sun,
    label: 'Golden State Rookie',
    completed: true,
    description: 'Complete your first 5 counties'
  },
  {
    position: 40,
    icon: Waves,
    label: 'Coastal Explorer',
    completed: false,
    description: 'Discover 15 California counties'
  },
  {
    position: 60,
    icon: Trees,
    label: 'Redwood Ranger',
    completed: false,
    description: 'Master 25 counties across regions'
  },
  {
    position: 80,
    icon: Mountain,
    label: 'Sierra Climber',
    completed: false,
    description: 'Conquer 40+ counties'
  },
  {
    position: 100,
    icon: Trophy,
    label: 'California Master',
    completed: false,
    description: 'Complete all 58 counties!'
  }
];

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  completionPercentage,
  milestones = defaultMilestones,
  title = 'California Discovery Progress',
  subtitle,
  showPercentage = true,
  variant = 'default',
  className
}) => {
  const clampedPercentage = Math.min(Math.max(completionPercentage, 0), 100);

  const updatedMilestones = milestones.map(milestone => ({
    ...milestone,
    completed: clampedPercentage >= milestone.position
  }));

  if (variant === 'compact') {
    return (
      <div className={clsx('flex items-center gap-3', className)}>
        <div className="flex-1 relative">
          <div className="w-full h-2 bg-ca-fog-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-ca-sunset-500 to-ca-gold-500 transition-all duration-700 ease-out"
              style={{ width: `${clampedPercentage}%` }}
            />
          </div>
        </div>
        {showPercentage && (
          <span className="text-sm font-semibold text-ca-charcoal-700 min-w-[3rem] text-right">
            {Math.round(clampedPercentage)}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={clsx('bg-white rounded-2xl p-6 shadow-md border border-ca-fog-200', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-ca-charcoal-700">{title}</h3>
          {subtitle && (
            <p className="text-sm text-ca-slate-600 mt-1">{subtitle}</p>
          )}
        </div>
        {showPercentage && (
          <div className="text-right">
            <div className="text-2xl font-bold text-ca-sunset-600">
              {Math.round(clampedPercentage)}%
            </div>
            <div className="text-xs text-ca-gray-500 uppercase tracking-wide">
              Complete
            </div>
          </div>
        )}
      </div>

      {/* Progress Track */}
      <div className="relative mb-8">
        {/* Background Track */}
        <div className="w-full h-3 bg-ca-fog-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-ca-sunset-500 via-ca-poppy-500 to-ca-gold-500 transition-all duration-700 ease-out relative"
            style={{ width: `${clampedPercentage}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-[shimmer_2s_infinite]" />
          </div>
        </div>

        {/* Milestones */}
        <div className="absolute -top-2 w-full">
          {updatedMilestones.map((milestone, index) => {
            const IconComponent = milestone.icon;
            return (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 group"
                style={{ left: `${milestone.position}%` }}
              >
                {/* Milestone Indicator */}
                <div
                  className={clsx(
                    'w-7 h-7 rounded-full border-3 flex items-center justify-center transition-all duration-300 cursor-pointer',
                    milestone.completed
                      ? 'bg-ca-gold-500 border-ca-gold-600 text-white shadow-lg scale-110'
                      : 'bg-white border-ca-gray-300 text-ca-gray-400 hover:border-ca-sunset-400 hover:scale-105'
                  )}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>

                {/* Milestone Tooltip */}
                {variant === 'detailed' && (
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="bg-ca-charcoal-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                      <div className="font-semibold">{milestone.label}</div>
                      {milestone.description && (
                        <div className="text-ca-gray-300 mt-1">{milestone.description}</div>
                      )}
                      {/* Tooltip Arrow */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-ca-charcoal-800" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Labels */}
      <div className="flex justify-between text-xs text-ca-gray-500">
        <span>Beginner</span>
        <span className="hidden sm:inline">Explorer</span>
        <span className="hidden md:inline">Adventurer</span>
        <span>California Master</span>
      </div>

      {/* Achievement Preview */}
      {variant === 'detailed' && (
        <div className="mt-6 pt-6 border-t border-ca-fog-200">
          <h4 className="text-sm font-semibold text-ca-charcoal-700 mb-3">Recent Achievements</h4>
          <div className="flex gap-2">
            {updatedMilestones
              .filter(m => m.completed)
              .slice(-3)
              .map((milestone, index) => {
                const IconComponent = milestone.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-ca-gold-50 border border-ca-gold-200 rounded-lg"
                  >
                    <IconComponent className="w-4 h-4 text-ca-gold-600" />
                    <span className="text-xs font-medium text-ca-gold-700">
                      {milestone.label}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;