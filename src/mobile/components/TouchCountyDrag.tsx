/**
 * Touch County Drag Component
 *
 * Mobile-optimized draggable county component for touch interactions.
 * Integrates @dnd-kit with mobile touch sensors, haptic feedback,
 * and visual drag preview.
 *
 * Features:
 * - Press-and-hold activation (300ms delay)
 * - Haptic feedback on drag events
 * - Visual drag preview with offset
 * - Snap-to-grid behavior
 * - Page scroll prevention
 * - TypeScript strict mode
 *
 * @see docs/MOBILE_PRD.md - F-4: Touch-Optimized Drag and Drop
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useHaptic } from '../hooks/useHaptic';
import { GESTURE_CONFIG } from '../config/breakpoints';
import { preventScrollDuringDrag, restoreScrollAfterDrag } from '../config/touchSensors';
import type { County, Position } from '@/types';

/**
 * Props for TouchCountyDrag component
 */
export interface TouchCountyDragProps {
  /** County data to display and drag */
  county: County;

  /** Whether county is already placed on map */
  isPlaced?: boolean;

  /** Target position for snap-to-grid (optional) */
  targetPosition?: Position;

  /** Callback when drag starts */
  onDragStart?: (county: County) => void;

  /** Callback when drag ends */
  onDragEnd?: (county: County, position: Position) => void;

  /** Callback when county is successfully placed */
  onPlacementSuccess?: (county: County) => void;

  /** Enable haptic feedback (default: true) */
  enableHaptic?: boolean;

  /** Haptic intensity (0-1, default: 1.0) */
  hapticIntensity?: number;

  /** Show drag preview (default: true) */
  showDragPreview?: boolean;

  /** Custom class name */
  className?: string;

  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * Touch County Drag Component
 *
 * Draggable county component optimized for mobile touch interactions.
 * Uses @dnd-kit's useDraggable hook with mobile-specific enhancements.
 *
 * @example
 * ```tsx
 * <TouchCountyDrag
 *   county={county}
 *   isPlaced={false}
 *   targetPosition={{ x: 100, y: 200 }}
 *   onDragStart={(county) => {
 *     // Handle drag start
 *   }}
 *   onDragEnd={(county, pos) => {
 *     // Handle drag end at position
 *   }}
 *   onPlacementSuccess={(county) => {
 *     // Handle successful placement with haptic
 *   }}
 * />
 * ```
 */
export const TouchCountyDrag: React.FC<TouchCountyDragProps> = ({
  county,
  isPlaced = false,
  targetPosition,
  onDragStart,
  onDragEnd,
  onPlacementSuccess,
  enableHaptic = true,
  hapticIntensity = 1.0,
  showDragPreview = true,
  className = '',
  'data-testid': testId = 'touch-county-drag',
}) => {
  // Haptic feedback hook
  const haptic = useHaptic({
    enabled: enableHaptic,
    intensity: hapticIntensity,
  });

  // Track press-and-hold state
  const [isPressing, setIsPressing] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  // @dnd-kit draggable hook
  const { attributes, listeners, setNodeRef, transform, isDragging, active } = useDraggable({
    id: county.id,
    disabled: isPlaced,
  });

  /**
   * Calculate if current position is within snap threshold of target
   */
  const isNearTarget = useCallback(
    (currentPos: Position): boolean => {
      if (!targetPosition) return false;

      const dx = Math.abs(currentPos.x - targetPosition.x);
      const dy = Math.abs(currentPos.y - targetPosition.y);
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance <= GESTURE_CONFIG.SNAP_THRESHOLD;
    },
    [targetPosition]
  );

  /**
   * Handle drag start - trigger haptic feedback and callbacks
   */
  useEffect(() => {
    if (isDragging && active?.id === county.id) {
      // Prevent page scroll during drag
      preventScrollDuringDrag();

      // Haptic feedback
      haptic.dragStart();

      // Callback
      onDragStart?.(county);
    }
  }, [isDragging, active, county, haptic, onDragStart]);

  /**
   * Handle drag position changes - check for snap-to-grid
   */
  useEffect(() => {
    if (isDragging && transform && targetPosition) {
      const currentPos: Position = {
        x: transform.x,
        y: transform.y,
      };

      // Check if near target and trigger snap haptic
      if (isNearTarget(currentPos)) {
        haptic.snap();
      }
    }
  }, [isDragging, transform, targetPosition, isNearTarget, haptic]);

  /**
   * Handle drag end - restore scroll and trigger callbacks
   */
  useEffect(() => {
    if (!isDragging && active === null) {
      // Restore page scroll
      restoreScrollAfterDrag();

      // Get final position
      if (transform) {
        const finalPos: Position = {
          x: transform.x,
          y: transform.y,
        };

        // Check if successfully placed
        if (isNearTarget(finalPos)) {
          haptic.success();
          onPlacementSuccess?.(county);
        }

        // Callback with final position
        onDragEnd?.(county, finalPos);
      }
    }
  }, [isDragging, active, transform, county, isNearTarget, haptic, onDragEnd, onPlacementSuccess]);

  /**
   * Handle press-and-hold visual feedback
   */
  const handlePointerDown = useCallback(() => {
    setIsPressing(true);

    // Start press-and-hold timer
    const timer = setTimeout(() => {
      setIsPressing(false);
      // Light haptic when drag is ready to start
      haptic.tap();
    }, GESTURE_CONFIG.PRESS_AND_HOLD_DURATION);

    setPressTimer(timer);
  }, [haptic]);

  const handlePointerUp = useCallback(() => {
    setIsPressing(false);
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  }, [pressTimer]);

  /**
   * Cleanup timer on unmount
   */
  useEffect(() => {
    return () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
      }
    };
  }, [pressTimer]);

  /**
   * Calculate drag preview position with offset
   */
  const dragPreviewStyle =
    isDragging && transform && showDragPreview
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y + GESTURE_CONFIG.DRAG_PREVIEW_OFFSET}px, 0)`,
          transition: 'none',
        }
      : undefined;

  /**
   * Base style for county element
   */
  const baseStyle: React.CSSProperties = {
    touchAction: 'none', // Prevent default touch behaviors
    userSelect: 'none',
    cursor: isPlaced ? 'not-allowed' : 'grab',
    opacity: isDragging ? 0.5 : 1,
    transition: isDragging ? 'none' : 'all 0.2s ease',
  };

  /**
   * Press-and-hold visual feedback
   */
  const pressStyle: React.CSSProperties = isPressing
    ? {
        transform: 'scale(0.95)',
        opacity: 0.8,
      }
    : {};

  /**
   * Combined styles
   */
  const combinedStyle: React.CSSProperties = {
    ...baseStyle,
    ...pressStyle,
    ...dragPreviewStyle,
  };

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      className={`touch-county-drag ${className} ${
        isPlaced ? 'touch-county-drag--placed' : ''
      } ${isDragging ? 'touch-county-drag--dragging' : ''} ${
        isPressing ? 'touch-county-drag--pressing' : ''
      }`}
      data-county-id={county.id}
      data-testid={testId}
      data-is-dragging={isDragging}
      data-is-placed={isPlaced}
      {...listeners}
      {...attributes}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* County name */}
      <div className="touch-county-drag__label">{county.name}</div>

      {/* Placed indicator */}
      {isPlaced && <div className="touch-county-drag__placed-indicator">✓</div>}

      {/* Drag hint (visible during press-and-hold) */}
      {isPressing && !isPlaced && <div className="touch-county-drag__hint">Hold to drag</div>}
    </div>
  );
};

/**
 * Default export
 */
export default TouchCountyDrag;

/**
 * Re-export types for convenience
 */
export type { County, Position };
