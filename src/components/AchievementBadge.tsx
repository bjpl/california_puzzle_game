import React from 'react';
import { clsx } from 'clsx';
import {
  Trophy,
  Star,
  Target,
  Zap,
  BookOpen,
  Compass,
  Map,
  Clock,
  Award,
  CheckCircle
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'geography' | 'speed' | 'accuracy' | 'exploration' | 'knowledge';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  earned: boolean;
  earnedDate?: Date;
  progress?: {
    current: number;
    total: number;
  };
  requirements?: string[];
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: (achievement: Achievement) => void;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  target: Target,
  zap: Zap,
  book: BookOpen,
  compass: Compass,
  map: Map,
  clock: Clock,
  award: Award,
  check: CheckCircle
};

const categoryConfig = {
  geography: {
    color: 'ca-ocean',
    bgColor: 'ca-ocean-50',
    borderColor: 'ca-ocean-200',
    label: 'Geography'
  },
  speed: {
    color: 'ca-sunset',
    bgColor: 'ca-sunset-50',
    borderColor: 'ca-sunset-200',
    label: 'Speed'
  },
  accuracy: {
    color: 'ca-gold',
    bgColor: 'ca-gold-50',
    borderColor: 'ca-gold-200',
    label: 'Accuracy'
  },
  exploration: {
    color: 'ca-redwood',
    bgColor: 'ca-redwood-50',
    borderColor: 'ca-redwood-200',
    label: 'Exploration'
  },
  knowledge: {
    color: 'ca-tech',
    bgColor: 'ca-tech-50',
    borderColor: 'ca-tech-200',
    label: 'Knowledge'
  }
};

const rarityConfig = {
  common: {
    gradient: 'from-gray-400 to-gray-600',
    glow: 'shadow-gray-200',
    stars: 1
  },
  rare: {
    gradient: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-200',
    stars: 2
  },
  epic: {
    gradient: 'from-purple-400 to-purple-600',
    glow: 'shadow-purple-200',
    stars: 3
  },
  legendary: {
    gradient: 'from-yellow-400 to-yellow-600',
    glow: 'shadow-yellow-200',
    stars: 4
  }
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showProgress = true,
  interactive = true,
  className,
  onClick
}) => {
  const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Trophy;
  const category = categoryConfig[achievement.category];
  const rarity = rarityConfig[achievement.rarity];

  const sizeClasses = {
    sm: {
      container: 'p-4',
      icon: 'w-8 h-8',
      title: 'text-sm',
      description: 'text-xs',
      badge: 'text-xs px-2 py-1'
    },
    md: {
      container: 'p-6',
      icon: 'w-12 h-12',
      title: 'text-base',
      description: 'text-sm',
      badge: 'text-xs px-3 py-1'
    },
    lg: {
      container: 'p-8',
      icon: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-base',
      badge: 'text-sm px-4 py-2'
    }
  };

  const progressPercentage = achievement.progress
    ? Math.round((achievement.progress.current / achievement.progress.total) * 100)
    : 0;

  return (
    <div
      className={clsx(
        'relative bg-white rounded-2xl border-2 transition-all duration-300',
        sizeClasses[size].container,
        achievement.earned
          ? `border-${category.borderColor} bg-gradient-to-br from-${category.bgColor} to-white shadow-lg`
          : 'border-ca-fog-200 hover:border-ca-fog-300',
        interactive && 'cursor-pointer hover:shadow-xl hover:-translate-y-1',
        !achievement.earned && 'opacity-75 grayscale hover:grayscale-0',
        className
      )}
      onClick={() => interactive && onClick?.(achievement)}
    >
      {/* Earned Indicator */}
      {achievement.earned && (
        <div className="absolute -top-2 -right-2">
          <div className={`w-6 h-6 bg-${category.color}-500 rounded-full flex items-center justify-center shadow-lg`}>
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Rarity Glow Effect */}
      {achievement.earned && (
        <div
          className={clsx(
            'absolute inset-0 rounded-2xl opacity-20 transition-opacity duration-300',
            `bg-gradient-to-br ${rarity.gradient}`,
            interactive && 'group-hover:opacity-30'
          )}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Icon Container */}
        <div className="flex justify-center mb-4">
          <div
            className={clsx(
              'relative flex items-center justify-center rounded-full transition-all duration-300',
              sizeClasses[size].icon,
              achievement.earned
                ? `bg-${category.color}-500 text-white shadow-lg`
                : 'bg-ca-fog-200 text-ca-gray-400'
            )}
          >
            <IconComponent className={sizeClasses[size].icon} />

            {/* Floating stars for rarity */}
            {achievement.earned && rarity.stars > 1 && (
              <div className="absolute -top-1 -right-1">
                <div className="flex">
                  {Array.from({ length: rarity.stars }, (_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 text-yellow-400 fill-current"
                      style={{
                        animation: `twinkle 2s ease-in-out infinite ${i * 0.2}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Badge Content */}
        <div className="text-center">
          {/* Category Badge */}
          <div className="flex justify-center mb-2">
            <span
              className={clsx(
                'inline-flex items-center rounded-full font-medium',
                sizeClasses[size].badge,
                achievement.earned
                  ? `bg-${category.color}-100 text-${category.color}-700`
                  : 'bg-ca-fog-100 text-ca-gray-500'
              )}
            >
              {category.label}
            </span>
          </div>

          {/* Title */}
          <h3
            className={clsx(
              'font-bold mb-2',
              sizeClasses[size].title,
              achievement.earned ? 'text-ca-charcoal-800' : 'text-ca-gray-600'
            )}
          >
            {achievement.title}
          </h3>

          {/* Description */}
          <p
            className={clsx(
              'leading-relaxed mb-4',
              sizeClasses[size].description,
              achievement.earned ? 'text-ca-slate-600' : 'text-ca-gray-500'
            )}
          >
            {achievement.description}
          </p>

          {/* Progress Bar */}
          {showProgress && achievement.progress && !achievement.earned && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-ca-gray-600">Progress</span>
                <span className="text-xs font-medium text-ca-gray-600">
                  {achievement.progress.current}/{achievement.progress.total}
                </span>
              </div>
              <div className="w-full h-2 bg-ca-fog-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${category.color}-500 transition-all duration-500 ease-out`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Earned Date */}
          {achievement.earned && achievement.earnedDate && (
            <div className="text-xs text-ca-gray-500">
              Earned {achievement.earnedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          )}

          {/* Requirements (for unearned achievements) */}
          {!achievement.earned && achievement.requirements && size !== 'sm' && (
            <div className="mt-4 text-left">
              <h4 className="text-xs font-semibold text-ca-gray-700 mb-2">Requirements:</h4>
              <ul className="text-xs text-ca-gray-600 space-y-1">
                {achievement.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-ca-gray-400 rounded-full mt-2 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Hover Effects */}
      {interactive && achievement.earned && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className={`absolute inset-0 rounded-2xl ${rarity.glow} shadow-2xl`} />
        </div>
      )}
    </div>
  );
};

// Keyframes for star twinkle animation
const styles = `
  @keyframes twinkle {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }
`;

// Add styles to head if not already present
if (typeof document !== 'undefined' && !document.getElementById('achievement-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'achievement-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default AchievementBadge;