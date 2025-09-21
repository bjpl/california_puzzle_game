import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HintVisualData,
  Position,
  HintType,
  County
} from '@/types';

interface HintVisualIndicatorsProps {
  visualData: HintVisualData;
  hintType: HintType;
  county: County;
  isActive: boolean;
  onAnimationComplete?: () => void;
  className?: string;
}

interface PulseEffectProps {
  center: Position;
  radius: number;
  opacity: number;
  duration: number;
  intensity: number;
}

const PulseEffect: React.FC<PulseEffectProps> = ({
  center,
  radius,
  opacity,
  duration,
  intensity
}) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: center.x - radius,
        top: center.y - radius,
        width: radius * 2,
        height: radius * 2,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 1.2, 1],
        opacity: [0, opacity * intensity, opacity],
      }}
      transition={{
        duration: duration / 1000,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div
        className="w-full h-full rounded-full border-4 border-blue-400"
        style={{
          boxShadow: `0 0 20px rgba(59, 130, 246, ${opacity * intensity})`
        }}
      />
    </motion.div>
  );
};

interface SpotlightEffectProps {
  center: Position;
  radius: number;
  fadeEdge: number;
}

const SpotlightEffect: React.FC<SpotlightEffectProps> = ({
  center,
  radius,
  fadeEdge
}) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at ${center.x}px ${center.y}px,
          transparent ${radius - fadeEdge}px,
          rgba(0,0,0,0.4) ${radius}px,
          rgba(0,0,0,0.7) ${radius + fadeEdge}px)`
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    />
  );
};

interface ArrowIndicatorProps {
  from: Position;
  to: Position;
  style: 'curved' | 'straight';
  color?: string;
}

const ArrowIndicator: React.FC<ArrowIndicatorProps> = ({
  from,
  to,
  style,
  color = '#3B82F6'
}) => {
  const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
  const angle = Math.atan2(to.y - from.y, to.x - from.x);

  const pathD = style === 'curved'
    ? `M ${from.x} ${from.y} Q ${from.x + (to.x - from.x) / 2} ${from.y - 50} ${to.x} ${to.y}`
    : `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

  return (
    <motion.svg
      className="absolute pointer-events-none"
      style={{
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={color}
          />
        </marker>
      </defs>

      <motion.path
        d={pathD}
        stroke={color}
        strokeWidth="3"
        fill="none"
        markerEnd="url(#arrowhead)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        style={{
          filter: `drop-shadow(0 0 6px ${color}40)`
        }}
      />
    </motion.svg>
  );
};

interface HighlightAreaProps {
  center: Position;
  radius: number;
  opacity: number;
  hintType: HintType;
}

const HighlightArea: React.FC<HighlightAreaProps> = ({
  center,
  radius,
  opacity,
  hintType
}) => {
  const getHighlightColor = (type: HintType): string => {
    switch (type) {
      case HintType.LOCATION: return 'rgb(59, 130, 246)'; // blue
      case HintType.SHAPE: return 'rgb(16, 185, 129)'; // green
      case HintType.NEIGHBOR: return 'rgb(245, 158, 11)'; // yellow
      case HintType.FACT: return 'rgb(139, 92, 246)'; // purple
      case HintType.EDUCATIONAL: return 'rgb(236, 72, 153)'; // pink
      default: return 'rgb(59, 130, 246)'; // blue
    }
  };

  const color = getHighlightColor(hintType);

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: center.x - radius,
        top: center.y - radius,
        width: radius * 2,
        height: radius * 2,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          border: `2px solid ${color}`,
          boxShadow: `0 0 20px ${color}60, inset 0 0 20px ${color}20`
        }}
      />
    </motion.div>
  );
};

interface HeatMapIndicatorProps {
  positions: Position[];
  intensity: number;
  hintType: HintType;
}

const HeatMapIndicator: React.FC<HeatMapIndicatorProps> = ({
  positions,
  intensity,
  hintType
}) => {
  const getHeatColor = (type: HintType): string => {
    switch (type) {
      case HintType.LOCATION: return 'rgba(59, 130, 246, ';
      case HintType.NEIGHBOR: return 'rgba(245, 158, 11, ';
      default: return 'rgba(59, 130, 246, ';
    }
  };

  const baseColor = getHeatColor(hintType);

  return (
    <div className="absolute pointer-events-none inset-0">
      {positions.map((position, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            left: position.x - 30,
            top: position.y - 30,
            width: 60,
            height: 60,
            background: `radial-gradient(circle, ${baseColor}${intensity}) 0%, transparent 70%)`
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        />
      ))}
    </div>
  );
};

interface ShapeOutlineProps {
  county: County;
  opacity: number;
}

const ShapeOutline: React.FC<ShapeOutlineProps> = ({ county, opacity }) => {
  // This would typically render the actual county boundary
  // For now, we'll create a placeholder shape based on county properties

  if (!county.centroid) return null;

  const [x, y] = county.centroid;

  return (
    <motion.div
      className="absolute pointer-events-none"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5 }}
    >
      <svg
        width="200"
        height="150"
        style={{
          left: x - 100,
          top: y - 75,
          position: 'absolute'
        }}
      >
        <motion.path
          d="M 10 50 Q 50 10 90 30 Q 130 20 170 40 Q 180 80 150 110 Q 100 130 50 120 Q 20 100 10 50 Z"
          fill="none"
          stroke="#10B981"
          strokeWidth="3"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          style={{
            filter: 'drop-shadow(0 0 8px #10B98140)'
          }}
        />
      </svg>
    </motion.div>
  );
};

const HintVisualIndicators: React.FC<HintVisualIndicatorsProps> = ({
  visualData,
  hintType,
  county,
  isActive,
  onAnimationComplete,
  className = ''
}) => {
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setAnimationStage(prev => prev + 1);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setAnimationStage(0);
    }
  }, [isActive, onAnimationComplete]);

  if (!isActive) return null;

  return (
    <div className={`hint-visual-indicators ${className}`}>
      <AnimatePresence>
        {/* Highlight Area */}
        {visualData.highlightArea && (
          <HighlightArea
            center={visualData.highlightArea.center}
            radius={visualData.highlightArea.radius}
            opacity={visualData.highlightArea.opacity}
            hintType={hintType}
          />
        )}

        {/* Pulse Animation */}
        {visualData.pulseAnimation && visualData.highlightArea && (
          <PulseEffect
            center={visualData.highlightArea.center}
            radius={visualData.highlightArea.radius}
            opacity={visualData.highlightArea.opacity}
            duration={visualData.pulseAnimation.duration}
            intensity={visualData.pulseAnimation.intensity}
          />
        )}

        {/* Spotlight Effect */}
        {visualData.spotlight && (
          <SpotlightEffect
            center={visualData.spotlight.center}
            radius={visualData.spotlight.radius}
            fadeEdge={visualData.spotlight.fadeEdge}
          />
        )}

        {/* Arrow Indicator */}
        {visualData.arrow && (
          <ArrowIndicator
            from={visualData.arrow.from}
            to={visualData.arrow.to}
            style={visualData.arrow.style}
          />
        )}

        {/* Shape Outline for Shape Hints */}
        {hintType === HintType.SHAPE && (
          <ShapeOutline
            county={county}
            opacity={0.6}
          />
        )}
      </AnimatePresence>

      {/* Animated Text Overlay */}
      <AnimatePresence>
        {animationStage > 0 && (
          <motion.div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 rounded-lg px-4 py-2 shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm font-semibold text-gray-800 text-center">
              {getAnimationText(hintType)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function getAnimationText(hintType: HintType): string {
  switch (hintType) {
    case HintType.LOCATION:
      return 'Look in the highlighted area';
    case HintType.SHAPE:
      return 'Notice the county boundary shape';
    case HintType.NEIGHBOR:
      return 'Check adjacent counties';
    case HintType.FACT:
      return 'Use this clue to identify the county';
    case HintType.EDUCATIONAL:
      return 'Learn about this county';
    default:
      return 'Follow the visual hint';
  }
}

export default HintVisualIndicators;