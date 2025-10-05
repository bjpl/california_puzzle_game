import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface HoverEffectsProps {
  children: React.ReactNode;
  effect?: 'lift' | 'glow' | 'tilt' | 'scale' | 'magnetic' | 'ripple' | 'california';
  intensity?: 'subtle' | 'medium' | 'strong';
  disabled?: boolean;
  className?: string;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

const HoverEffects: React.FC<HoverEffectsProps> = ({
  children,
  effect = 'lift',
  intensity = 'medium',
  disabled = false,
  className = '',
  onHoverStart,
  onHoverEnd
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Motion values for mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring animations for smooth movement
  const springConfig = { damping: 25, stiffness: 400 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Transform values based on mouse position
  const rotateX = useTransform(y, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-15, 15]);

  const getIntensityMultiplier = () => {
    switch (intensity) {
      case 'subtle': return 0.5;
      case 'medium': return 1;
      case 'strong': return 1.5;
      default: return 1;
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseXPercent = (event.clientX - centerX) / (rect.width / 2);
    const mouseYPercent = (event.clientY - centerY) / (rect.height / 2);

    mouseX.set(mouseXPercent);
    mouseY.set(mouseYPercent);
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    setIsHovered(true);
    onHoverStart?.();
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    onHoverEnd?.();
  };

  const getEffectStyles = () => {
    const multiplier = getIntensityMultiplier();

    switch (effect) {
      case 'lift':
        return {
          whileHover: {
            y: -8 * multiplier,
            boxShadow: `0 ${12 * multiplier}px ${24 * multiplier}px rgba(0, 0, 0, 0.15)`,
            transition: { duration: 0.2, ease: 'easeOut' }
          }
        };

      case 'glow':
        return {
          whileHover: {
            boxShadow: `0 0 ${20 * multiplier}px rgba(59, 130, 246, 0.6)`,
            scale: 1 + (0.02 * multiplier),
            transition: { duration: 0.3, ease: 'easeOut' }
          }
        };

      case 'tilt':
        return {
          style: {
            rotateX: disabled ? 0 : rotateX,
            rotateY: disabled ? 0 : rotateY,
            transformPerspective: 1000
          },
          whileHover: {
            scale: 1 + (0.05 * multiplier),
            transition: { duration: 0.2 }
          }
        };

      case 'scale':
        return {
          whileHover: {
            scale: 1 + (0.1 * multiplier),
            transition: { duration: 0.2, ease: 'easeOut' }
          }
        };

      case 'magnetic':
        return {
          style: {
            x: disabled ? 0 : x,
            y: disabled ? 0 : y
          },
          whileHover: {
            scale: 1 + (0.03 * multiplier),
            transition: { duration: 0.2 }
          }
        };

      case 'ripple':
        return {
          whileHover: {
            scale: [1, 1.05, 1],
            transition: { duration: 0.6, ease: 'easeInOut' }
          }
        };

      case 'california':
        return {
          whileHover: {
            scale: 1 + (0.05 * multiplier),
            rotateZ: 2 * multiplier,
            filter: `brightness(${1.1 + (0.1 * multiplier)}) hue-rotate(${10 * multiplier}deg)`,
            boxShadow: `0 ${8 * multiplier}px ${16 * multiplier}px rgba(220, 38, 38, 0.3)`,
            transition: { duration: 0.3, ease: 'easeOut' }
          }
        };

      default:
        return {};
    }
  };

  const RippleEffect = () => {
    if (effect !== 'ripple' || !isHovered) return null;

    return (
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 border border-blue-400 rounded-lg"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{
              scale: [1, 1.2, 1.4],
              opacity: [0.6, 0.3, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeOut'
            }}
          />
        ))}
      </motion.div>
    );
  };

  const GlowEffect = () => {
    if (effect !== 'glow' || !isHovered) return null;

    return (
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
          filter: 'blur(1px)'
        }}
      />
    );
  };

  const CaliforniaEffect = () => {
    if (effect !== 'california' || !isHovered) return null;

    return (
      <>
        {/* Golden state glow */}
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: 'linear-gradient(45deg, rgba(251, 191, 36, 0.2), rgba(239, 68, 68, 0.2))',
            filter: 'blur(2px)'
          }}
        />

        {/* Star particles */}
        <motion.div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-400"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + Math.sin(i) * 20}%`
              }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut'
              }}
            >
              ⭐
            </motion.div>
          ))}
        </motion.div>
      </>
    );
  };

  const effectStyles = getEffectStyles();

  return (
    <motion.div
      ref={ref}
      className={`relative ${disabled ? 'cursor-default' : 'cursor-pointer'} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...effectStyles}
      animate={disabled ? {} : effectStyles.animate}
    >
      {children}

      {/* Effect overlays */}
      <RippleEffect />
      <GlowEffect />
      <CaliforniaEffect />

      {/* Hover state indicator */}
      {isHovered && effect === 'magnetic' && (
        <motion.div
          className="absolute -inset-2 border border-blue-300 rounded-lg pointer-events-none"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.5, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Intensity indicator for strong effects */}
      {isHovered && intensity === 'strong' && (
        <motion.div
          className="absolute -inset-1 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-full h-full border-2 border-dashed border-blue-400 rounded-lg animate-pulse" />
        </motion.div>
      )}
    </motion.div>
  );
};

// Specialized hover components
export const CountyHover: React.FC<{
  children: React.ReactNode;
  isActive?: boolean;
  isCorrect?: boolean;
  className?: string;
}> = ({ children, isActive, isCorrect, className }) => (
  <HoverEffects
    effect={isActive ? 'glow' : 'tilt'}
    intensity={isCorrect ? 'strong' : 'medium'}
    className={className}
  >
    {children}
  </HoverEffects>
);

export const ButtonHover: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'california';
  className?: string;
}> = ({ children, variant = 'primary', className }) => {
  const effect = variant === 'california' ? 'california' : 'lift';
  return (
    <HoverEffects effect={effect} intensity="medium" className={className}>
      {children}
    </HoverEffects>
  );
};

export const TooltipHover: React.FC<{
  children: React.ReactNode;
  tooltip: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}> = ({ children, tooltip, position = 'top', className }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getTooltipPosition = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  return (
    <HoverEffects
      effect="scale"
      intensity="subtle"
      className={`relative ${className}`}
      onHoverStart={() => setShowTooltip(true)}
      onHoverEnd={() => setShowTooltip(false)}
    >
      {children}

      {showTooltip && (
        <motion.div
          className={`absolute ${getTooltipPosition()} z-50`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            {tooltip}
            <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 left-1/2 -translate-x-1/2 top-full -mt-1" />
          </div>
        </motion.div>
      )}
    </HoverEffects>
  );
};

export default HoverEffects;