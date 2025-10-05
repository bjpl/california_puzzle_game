import React from 'react';
import './Progress.css';

// CONCEPT: Comprehensive progress tracking component
export interface ProgressProps {
  /** Current value (0-100 or 0-max) */
  value: number;

  /** Maximum value (defaults to 100) */
  max?: number;

  /** Visual variant */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient';

  /** Size variant */
  size?: 'small' | 'medium' | 'large';

  /** Show label with percentage/count */
  showLabel?: boolean;

  /** Custom label format */
  label?: string;

  /** Animated progress bar */
  animated?: boolean;

  /** Striped pattern */
  striped?: boolean;

  /** Additional className */
  className?: string;
}

/**
 * Progress Component
 *
 * Displays progress bars for game completion, level progress, and loading states.
 *
 * @example
 * ```tsx
 * <Progress value={38} max={58} showLabel />
 * <Progress value={65} variant="gradient" animated />
 * ```
 */
export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'medium',
  showLabel = false,
  label,
  animated = false,
  striped = false,
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const progressClasses = [
    'ca-progress',
    `ca-progress--${size}`,
    className
  ].filter(Boolean).join(' ');

  const barClasses = [
    'ca-progress__bar',
    `ca-progress__bar--${variant}`,
    animated && 'ca-progress__bar--animated',
    striped && 'ca-progress__bar--striped'
  ].filter(Boolean).join(' ');

  // Format label text
  const getLabelText = () => {
    if (label) return label;
    if (max === 100) return `${Math.round(percentage)}%`;
    return `${value} / ${max}`;
  };

  return (
    <div className={progressClasses}>
      <div
        className="ca-progress__track"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={barClasses}
          style={{ width: `${percentage}%` }}
        >
          {showLabel && percentage > 20 && (
            <span className="ca-progress__label ca-progress__label--inside">
              {getLabelText()}
            </span>
          )}
        </div>
      </div>

      {showLabel && (
        <div className="ca-progress__info">
          <span className="ca-progress__label">{getLabelText()}</span>
          {percentage < 100 && (
            <span className="ca-progress__percentage">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
    </div>
  );
};

// Game-specific progress component
export interface GameProgressProps {
  completedCounties: number;
  totalCounties?: number;
  showMilestones?: boolean;
}

/**
 * GameProgress Component
 *
 * Specialized progress bar for tracking county completion in the game.
 */
export const GameProgress: React.FC<GameProgressProps> = ({
  completedCounties,
  totalCounties = 58,
  showMilestones = false
}) => {
  const percentage = (completedCounties / totalCounties) * 100;

  // Define milestone thresholds
  const milestones = [
    { value: 25, label: 'Explorer' },
    { value: 50, label: 'Adventurer' },
    { value: 75, label: 'Expert' },
    { value: 100, label: 'Master' }
  ];

  const currentMilestone = milestones.find(m => percentage >= m.value && percentage < m.value + 25);

  return (
    <div className="ca-game-progress">
      <Progress
        value={completedCounties}
        max={totalCounties}
        variant={percentage === 100 ? 'success' : percentage >= 75 ? 'warning' : 'gradient'}
        showLabel
        animated
        label={`${completedCounties} of ${totalCounties} counties`}
      />

      {showMilestones && currentMilestone && (
        <div className="ca-game-progress__milestone">
          <span className="ca-game-progress__milestone-badge">
            {currentMilestone.label}
          </span>
        </div>
      )}

      {showMilestones && (
        <div className="ca-game-progress__milestones">
          {milestones.map((milestone) => (
            <div
              key={milestone.value}
              className={`ca-game-progress__milestone-marker ${
                percentage >= milestone.value ? 'ca-game-progress__milestone-marker--achieved' : ''
              }`}
              style={{ left: `${milestone.value}%` }}
              title={milestone.label}
            >
              <span className="ca-game-progress__milestone-dot" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Loading progress component
export const LoadingProgress: React.FC<{ label?: string }> = ({ label = 'Loading...' }) => (
  <Progress
    value={100}
    variant="gradient"
    animated
    striped
    showLabel
    label={label}
  />
);