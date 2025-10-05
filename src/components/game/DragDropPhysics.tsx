import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, PanInfo } from 'framer-motion';

interface DragDropPhysicsProps {
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: (info: PanInfo) => void;
  onDrop?: (position: { x: number; y: number }) => void;
  disabled?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  magneticTargets?: Array<{ x: number; y: number; radius: number }>;
  elasticity?: number;
  damping?: number;
  stiffness?: number;
  className?: string;
  dragConstraints?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
}

const DragDropPhysics: React.FC<DragDropPhysicsProps> = ({
  children,
  onDragStart,
  onDragEnd,
  onDrop,
  disabled = false,
  snapToGrid = false,
  gridSize = 20,
  magneticTargets = [],
  elasticity = 0.8,
  damping = 15,
  stiffness = 300,
  className = '',
  dragConstraints
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isNearTarget, setIsNearTarget] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  // Motion values for position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring animations for smooth movement
  const springX = useSpring(x, { damping, stiffness });
  const springY = useSpring(y, { damping, stiffness });

  // Transform values for visual effects
  const scale = useTransform(
    [x, y],
    ([latestX, latestY]) => {
      if (!isDragging) return 1;
      const distance = Math.sqrt(latestX * latestX + latestY * latestY);
      return Math.max(0.95, 1 - distance * 0.0001);
    }
  );

  const rotate = useTransform(
    [x, y],
    ([latestX, latestY]) => {
      if (!isDragging) return 0;
      return latestX * 0.1;
    }
  );

  const opacity = useTransform(
    scale,
    [0.95, 1],
    [0.8, 1]
  );

  // Check for magnetic targets
  const checkMagneticTargets = (currentX: number, currentY: number) => {
    for (const target of magneticTargets) {
      const distance = Math.sqrt(
        Math.pow(currentX - target.x, 2) + Math.pow(currentY - target.y, 2)
      );

      if (distance <= target.radius) {
        setIsNearTarget(true);
        // Apply magnetic effect
        const magnetStrength = 1 - (distance / target.radius);
        const magnetX = (target.x - currentX) * magnetStrength * 0.3;
        const magnetY = (target.y - currentY) * magnetStrength * 0.3;

        x.set(currentX + magnetX);
        y.set(currentY + magnetY);
        return true;
      }
    }

    setIsNearTarget(false);
    return false;
  };

  // Snap to grid functionality
  const snapToGridPosition = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const handleDragStart = () => {
    setIsDragging(true);
    onDragStart?.();
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const currentX = x.get();
    const currentY = y.get();

    // Check for magnetic targets
    checkMagneticTargets(currentX, currentY);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);

    const currentX = x.get();
    const currentY = y.get();

    // Snap to grid if enabled
    if (snapToGrid) {
      const snappedX = snapToGridPosition(currentX);
      const snappedY = snapToGridPosition(currentY);
      x.set(snappedX);
      y.set(snappedY);
    }

    // Apply elastic bounce if item is outside bounds
    if (dragConstraints) {
      let bounceX = currentX;
      let bounceY = currentY;

      if (dragConstraints.left !== undefined && currentX < dragConstraints.left) {
        bounceX = dragConstraints.left + (currentX - dragConstraints.left) * elasticity;
      }
      if (dragConstraints.right !== undefined && currentX > dragConstraints.right) {
        bounceX = dragConstraints.right + (currentX - dragConstraints.right) * elasticity;
      }
      if (dragConstraints.top !== undefined && currentY < dragConstraints.top) {
        bounceY = dragConstraints.top + (currentY - dragConstraints.top) * elasticity;
      }
      if (dragConstraints.bottom !== undefined && currentY > dragConstraints.bottom) {
        bounceY = dragConstraints.bottom + (currentY - dragConstraints.bottom) * elasticity;
      }

      if (bounceX !== currentX || bounceY !== currentY) {
        x.set(bounceX);
        y.set(bounceY);
      }
    }

    // Call callbacks
    onDragEnd?.(info);
    onDrop?.({ x: x.get(), y: y.get() });

    setIsNearTarget(false);
  };

  // Visual feedback for different states
  const getBoxShadow = () => {
    if (disabled) return 'none';
    if (isDragging && isNearTarget) return '0 0 20px rgba(34, 197, 94, 0.6)';
    if (isDragging) return '0 10px 25px rgba(0, 0, 0, 0.3)';
    return '0 2px 8px rgba(0, 0, 0, 0.1)';
  };

  const getBorderColor = () => {
    if (disabled) return 'transparent';
    if (isNearTarget) return '#22C55E';
    if (isDragging) return '#3B82F6';
    return 'transparent';
  };

  return (
    <motion.div
      ref={dragRef}
      className={`relative ${disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'} ${className}`}
      drag={!disabled}
      dragConstraints={dragConstraints}
      dragElastic={elasticity}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{
        x: springX,
        y: springY,
        scale,
        rotate,
        opacity,
        boxShadow: getBoxShadow(),
        border: `2px solid ${getBorderColor()}`,
        borderRadius: '8px',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease'
      }}
      whileHover={!disabled ? {
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={!disabled ? {
        scale: 0.95,
        transition: { duration: 0.1 }
      } : {}}
      animate={{
        scale: disabled ? 0.9 : 1,
        opacity: disabled ? 0.5 : 1
      }}
    >
      {children}

      {/* Magnetic target indicator */}
      {isNearTarget && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.2))',
            border: '2px dashed #22C55E'
          }}
        />
      )}

      {/* Drag feedback particles */}
      {isDragging && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: '-4px',
                marginTop: '-4px'
              }}
              animate={{
                x: [0, (i - 1) * 20, 0],
                y: [0, Math.sin(i) * 15, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut'
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Grid snap indicators */}
      {snapToGrid && isDragging && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            transform: `translate(-${gridSize/2}px, -${gridSize/2}px)`
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
};

export default DragDropPhysics;