import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GESTURE_CONFIG, MOBILE_ANIMATIONS } from '../config/breakpoints';
import type { County } from '../../types';
import '../styles/touchFeedback.css';

interface DragPreviewProps {
  /**
   * County being dragged
   */
  county: County | null;

  /**
   * Current touch/drag position
   */
  position: { x: number; y: number } | null;

  /**
   * Whether the drag is active
   */
  isDragging: boolean;

  /**
   * Whether the preview is within snap threshold
   */
  isNearSnapTarget?: boolean;

  /**
   * Optional custom render function for the preview
   */
  renderPreview?: (county: County) => React.ReactNode;

  /**
   * Opacity of the preview while dragging
   * @default 0.7
   */
  opacity?: number;

  /**
   * Scale of the preview while dragging
   * @default 1.1
   */
  scale?: number;

  /**
   * Rotation applied when near snap target
   * @default 2 (degrees)
   */
  snapRotation?: number;
}

/**
 * DragPreview - Visual preview component that follows finger during drag operations
 *
 * Features:
 * - 20px offset from touch point (prevents finger occlusion)
 * - Semi-transparent while dragging
 * - Snaps to grid when within threshold
 * - Hardware-accelerated transforms for smooth 60fps performance
 * - Pulsing animation when near snap target
 * - Respects prefers-reduced-motion
 *
 * @example
 * ```tsx
 * <DragPreview
 *   county={selectedCounty}
 *   position={{ x: touchX, y: touchY }}
 *   isDragging={isDragging}
 *   isNearSnapTarget={distance < 50}
 * />
 * ```
 */
export const DragPreview: React.FC<DragPreviewProps> = ({
  county,
  position,
  isDragging,
  isNearSnapTarget = false,
  renderPreview,
  opacity = 0.7,
  scale = 1.1,
  snapRotation = 2,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    // Delay visibility slightly to avoid flash on initial touch
    if (isDragging && county && position) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isDragging, county, position]);

  if (!county || !position || !isDragging) {
    return null;
  }

  // Apply 20px offset from touch point (GESTURE_CONFIG.dragPreviewOffset)
  const offsetX = position.x + GESTURE_CONFIG.dragPreviewOffset.x;
  const offsetY = position.y + GESTURE_CONFIG.dragPreviewOffset.y;

  // Default preview render function
  const defaultPreview = (c: County) => (
    <div className="drag-preview-content">
      <div className="drag-preview-shape">
        {/* County shape visualization */}
        <svg viewBox="0 0 100 100" className="county-shape-svg">
          <rect x="10" y="10" width="80" height="80" rx="8" fill="currentColor" opacity="0.3" />
          <text
            x="50"
            y="55"
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill="currentColor"
          >
            {c.name.split(' ')[0]}
          </text>
        </svg>
      </div>
      <div className="drag-preview-label">{c.name}</div>
    </div>
  );

  const previewContent = renderPreview ? renderPreview(county) : defaultPreview(county);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="drag-preview-overlay"
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity,
            scale: isNearSnapTarget ? scale * 1.05 : scale,
            rotate: isNearSnapTarget && !prefersReducedMotion ? snapRotation : 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : MOBILE_ANIMATIONS.durations.fast / 1000,
            ease: 'easeOut',
          }}
          style={{
            position: 'fixed',
            left: offsetX,
            top: offsetY,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999,
            // Hardware acceleration
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Glow effect when near snap target */}
          {isNearSnapTarget && !prefersReducedMotion && (
            <motion.div
              className="drag-preview-glow"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                inset: -10,
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Main preview content */}
          <div
            className={`drag-preview-main ${isNearSnapTarget ? 'near-snap' : ''}`}
            style={{
              position: 'relative',
            }}
          >
            {previewContent}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * useDragPreview - Hook for managing drag preview state
 *
 * @example
 * ```tsx
 * const { county, position, isDragging, updatePreview, clearPreview } = useDragPreview();
 *
 * const handleDragStart = (county: County, pos: { x: number; y: number }) => {
 *   updatePreview(county, pos, true);
 * };
 *
 * const handleDragEnd = () => {
 *   clearPreview();
 * };
 * ```
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useDragPreview = () => {
  const [county, setCounty] = useState<County | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updatePreview = (
    newCounty: County | null,
    newPosition: { x: number; y: number } | null,
    dragging: boolean
  ) => {
    setCounty(newCounty);
    setPosition(newPosition);
    setIsDragging(dragging);
  };

  const clearPreview = () => {
    setCounty(null);
    setPosition(null);
    setIsDragging(false);
  };

  return {
    county,
    position,
    isDragging,
    updatePreview,
    clearPreview,
  };
};

export default DragPreview;
