import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GESTURE_CONFIG, MOBILE_ANIMATIONS } from '../config/breakpoints';
import '../styles/touchFeedback.css';

interface SnapTarget {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

interface SnapGuidesProps {
  /**
   * Available snap targets
   */
  targets: SnapTarget[];

  /**
   * Current drag position
   */
  dragPosition: { x: number; y: number } | null;

  /**
   * Whether drag is active
   */
  isDragging: boolean;

  /**
   * Distance threshold for showing guides (in pixels)
   * @default 50 (from GESTURE_CONFIG.snapThreshold)
   */
  threshold?: number;

  /**
   * Whether to show distance indicators
   * @default true
   */
  showDistance?: boolean;

  /**
   * Custom color for active guides
   * @default 'rgb(59, 130, 246)' - Blue-500
   */
  activeColor?: string;

  /**
   * Custom color for inactive guides
   * @default 'rgb(156, 163, 175)' - Gray-400
   */
  inactiveColor?: string;

  /**
   * Callback when drag enters snap threshold
   */
  onSnapEnter?: (targetId: string) => void;

  /**
   * Callback when drag leaves snap threshold
   */
  onSnapLeave?: (targetId: string) => void;
}

/**
 * SnapGuides - Visual guides showing snap targets during drag operations
 *
 * Features:
 * - Highlights when drag is within 50px threshold
 * - Pulsing animation to draw attention
 * - Distance indicators for each target
 * - Crosshair visualization for precise alignment
 * - Hardware-accelerated animations for smooth 60fps
 * - Respects prefers-reduced-motion
 * - Auto-hides when snap completes
 *
 * @example
 * ```tsx
 * <SnapGuides
 *   targets={availableSlots}
 *   dragPosition={currentDragPosition}
 *   isDragging={isDragging}
 *   onSnapEnter={(id) => {
 *     // Handle snap enter (e.g., haptic feedback)
 *   }}
 * />
 * ```
 */
export const SnapGuides: React.FC<SnapGuidesProps> = ({
  targets,
  dragPosition,
  isDragging,
  threshold = GESTURE_CONFIG.snapThreshold,
  showDistance = true,
  activeColor = 'rgb(59, 130, 246)',
  inactiveColor = 'rgb(156, 163, 175)',
  onSnapEnter,
  onSnapLeave,
}) => {
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [distances, setDistances] = useState<Map<string, number>>(new Map());
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Calculate distances and find nearest target
  useEffect(() => {
    if (!isDragging || !dragPosition) {
      setActiveTargetId(null);
      setDistances(new Map());
      return;
    }

    const newDistances = new Map<string, number>();
    let nearestId: string | null = null;
    let minDistance = Infinity;

    targets.forEach((target) => {
      // Calculate distance from drag position to target center
      const targetCenterX = target.x + target.width / 2;
      const targetCenterY = target.y + target.height / 2;

      const dx = dragPosition.x - targetCenterX;
      const dy = dragPosition.y - targetCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      newDistances.set(target.id, distance);

      if (distance < threshold && distance < minDistance) {
        minDistance = distance;
        nearestId = target.id;
      }
    });

    setDistances(newDistances);

    // Handle snap enter/leave callbacks
    if (nearestId !== activeTargetId) {
      if (activeTargetId && onSnapLeave) {
        onSnapLeave(activeTargetId);
      }
      if (nearestId && onSnapEnter) {
        onSnapEnter(nearestId);
      }
      setActiveTargetId(nearestId);
    }
  }, [isDragging, dragPosition, targets, threshold, activeTargetId, onSnapEnter, onSnapLeave]);

  if (!isDragging) {
    return null;
  }

  return (
    <div className="snap-guides-overlay" style={{ pointerEvents: 'none' }}>
      <AnimatePresence>
        {targets.map((target) => {
          const distance = distances.get(target.id) || Infinity;
          const isActive = target.id === activeTargetId;
          const isNear = distance < threshold;

          return (
            <motion.div
              key={target.id}
              className={`snap-guide ${isActive ? 'active' : ''} ${isNear ? 'near' : ''}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isNear ? 1 : 0.3,
                scale: isActive ? 1.05 : 1,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: prefersReducedMotion ? 0 : MOBILE_ANIMATIONS.durations.fast / 1000,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                left: target.x,
                top: target.y,
                width: target.width,
                height: target.height,
                // Hardware acceleration
                willChange: 'transform, opacity',
                transform: 'translateZ(0)',
              }}
            >
              {/* Outer glow for active targets */}
              {isActive && !prefersReducedMotion && (
                <motion.div
                  className="snap-guide-glow"
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    position: 'absolute',
                    inset: -8,
                    border: `3px solid ${activeColor}`,
                    borderRadius: 8,
                    opacity: 0.5,
                  }}
                />
              )}

              {/* Main guide border */}
              <div
                className="snap-guide-border"
                style={{
                  position: 'absolute',
                  inset: 0,
                  border: `2px dashed ${isActive ? activeColor : inactiveColor}`,
                  borderRadius: 8,
                  transition: prefersReducedMotion ? 'none' : 'border-color 200ms ease',
                }}
              />

              {/* Crosshair for precise alignment */}
              {isActive && (
                <>
                  {/* Vertical line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: 0,
                      bottom: 0,
                      width: 2,
                      backgroundColor: activeColor,
                      opacity: 0.5,
                      transform: 'translateX(-50%)',
                    }}
                  />
                  {/* Horizontal line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: 0,
                      right: 0,
                      height: 2,
                      backgroundColor: activeColor,
                      opacity: 0.5,
                      transform: 'translateY(-50%)',
                    }}
                  />
                </>
              )}

              {/* Distance indicator */}
              {showDistance && isNear && (
                <motion.div
                  className="snap-guide-distance"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: 'absolute',
                    top: -30,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: isActive ? activeColor : inactiveColor,
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {Math.round(distance)}px
                </motion.div>
              )}

              {/* Target label */}
              {target.label && isActive && (
                <motion.div
                  className="snap-guide-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    bottom: -30,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: 4,
                    fontSize: 14,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {target.label}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

/**
 * useSnapGuides - Hook for managing snap guide state and logic
 *
 * @example
 * ```tsx
 * const { activeTarget, isNearTarget, updateDragPosition } = useSnapGuides(targets);
 *
 * const handleDragMove = (x: number, y: number) => {
 *   updateDragPosition({ x, y });
 *   if (isNearTarget) {
 *     // Provide haptic feedback
 *     navigator.vibrate?.(10);
 *   }
 * };
 * ```
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useSnapGuides = (
  targets: SnapTarget[],
  threshold: number = GESTURE_CONFIG.snapThreshold
) => {
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [activeTarget, setActiveTarget] = useState<SnapTarget | null>(null);

  useEffect(() => {
    if (!dragPosition) {
      setActiveTarget(null);
      return;
    }

    let nearestTarget: SnapTarget | null = null;
    let minDistance = Infinity;

    targets.forEach((target) => {
      const targetCenterX = target.x + target.width / 2;
      const targetCenterY = target.y + target.height / 2;

      const dx = dragPosition.x - targetCenterX;
      const dy = dragPosition.y - targetCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < threshold && distance < minDistance) {
        minDistance = distance;
        nearestTarget = target;
      }
    });

    setActiveTarget(nearestTarget);
  }, [dragPosition, targets, threshold]);

  return {
    activeTarget,
    isNearTarget: activeTarget !== null,
    updateDragPosition: setDragPosition,
    clearDragPosition: () => setDragPosition(null),
  };
};

export default SnapGuides;
