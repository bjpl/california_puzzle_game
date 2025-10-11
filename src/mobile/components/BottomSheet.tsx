/**
 * Bottom Sheet Component
 *
 * Mobile-native bottom drawer for content presentation.
 * Implements swipe gestures, three states (collapsed/half/full),
 * and smooth spring-based animations.
 *
 * @see docs/MOBILE_PRD.md - F-3: Bottom Sheet UI Pattern
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, animate } from 'framer-motion';
import { LAYOUT_DIMENSIONS, MOBILE_ANIMATIONS, GESTURE_CONFIG } from '../config/breakpoints';

/**
 * Bottom sheet states
 */
// eslint-disable-next-line react-refresh/only-export-components
export enum BottomSheetState {
  CLOSED = 'closed',
  COLLAPSED = 'collapsed',
  HALF = 'half',
  FULL = 'full',
}

/**
 * Bottom sheet props
 */
export interface BottomSheetProps {
  /** Initial state */
  initialState?: BottomSheetState;

  /** Callback when state changes */
  onStateChange?: (state: BottomSheetState) => void;

  /** Content to display in sheet */
  children: React.ReactNode;

  /** Show backdrop when sheet is open */
  showBackdrop?: boolean;

  /** Allow backdrop tap to close */
  closeOnBackdropTap?: boolean;

  /** Allow swipe gestures */
  enableSwipe?: boolean;

  /** Custom heights for each state (default uses LAYOUT_DIMENSIONS) */
  heights?: {
    collapsed?: string | number;
    half?: string | number;
    full?: string | number;
  };

  /** Additional className for styling */
  className?: string;

  /** Test ID */
  'data-testid'?: string;
}

/**
 * Get height value for a given state
 */
function getStateHeight(
  state: BottomSheetState,
  customHeights?: BottomSheetProps['heights']
): string {
  if (state === BottomSheetState.CLOSED) return '0vh';

  if (customHeights) {
    if (state === BottomSheetState.COLLAPSED && customHeights.collapsed) {
      return typeof customHeights.collapsed === 'number'
        ? `${customHeights.collapsed}px`
        : customHeights.collapsed;
    }
    if (state === BottomSheetState.HALF && customHeights.half) {
      return typeof customHeights.half === 'number'
        ? `${customHeights.half}px`
        : customHeights.half;
    }
    if (state === BottomSheetState.FULL && customHeights.full) {
      return typeof customHeights.full === 'number'
        ? `${customHeights.full}px`
        : customHeights.full;
    }
  }

  // Default heights from constants
  switch (state) {
    case BottomSheetState.COLLAPSED:
      return '10vh';
    case BottomSheetState.HALF:
      return LAYOUT_DIMENSIONS.BOTTOM_SHEET_HALF;
    case BottomSheetState.FULL:
      return LAYOUT_DIMENSIONS.BOTTOM_SHEET_FULL;
    default:
      return '0vh';
  }
}

/**
 * Bottom Sheet Component
 *
 * Mobile-optimized drawer component with swipe gestures
 *
 * @example
 * ```tsx
 * <BottomSheet
 *   initialState={BottomSheetState.COLLAPSED}
 *   onStateChange={(state) => {
 *     // Handle state change
 *   }}
 * >
 *   <CountyInformation county={selectedCounty} />
 * </BottomSheet>
 * ```
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  initialState = BottomSheetState.COLLAPSED,
  onStateChange,
  children,
  showBackdrop = true,
  closeOnBackdropTap = true,
  enableSwipe = true,
  heights,
  className = '',
  'data-testid': testId = 'bottom-sheet',
}) => {
  const [currentState, setCurrentState] = useState<BottomSheetState>(initialState);
  const y = useMotionValue(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartTime = useRef(0);

  // Transform for backdrop opacity
  const backdropOpacity = useTransform(y, [0, -window.innerHeight * 0.5], [0, 0.5]);

  /**
   * Update sheet state and notify parent
   */
  const updateState = useCallback(
    (newState: BottomSheetState) => {
      setCurrentState(newState);
      onStateChange?.(newState);

      // Animate to new position
      animate(y, 0, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: MOBILE_ANIMATIONS.BOTTOM_SHEET / 1000,
      });
    },
    [onStateChange, y]
  );

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback(() => {
    dragStartY.current = y.get();
    dragStartTime.current = Date.now();
  }, [y]);

  /**
   * Handle drag end - determine next state based on drag distance and velocity
   */
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const dragDistance = info.offset.y;
      const velocity = info.velocity.y;

      // Calculate if it's a fast swipe
      const isFastSwipe = Math.abs(velocity) > GESTURE_CONFIG.SWIPE_VELOCITY * 1000; // Convert to px/s

      let nextState = currentState;

      // Determine next state based on drag direction and current state
      if (isFastSwipe) {
        // Fast swipe - go to next/prev state immediately
        if (dragDistance > 0) {
          // Swipe down
          switch (currentState) {
            case BottomSheetState.FULL:
              nextState = BottomSheetState.HALF;
              break;
            case BottomSheetState.HALF:
              nextState = BottomSheetState.COLLAPSED;
              break;
            case BottomSheetState.COLLAPSED:
              nextState = BottomSheetState.CLOSED;
              break;
          }
        } else {
          // Swipe up
          switch (currentState) {
            case BottomSheetState.CLOSED:
              nextState = BottomSheetState.COLLAPSED;
              break;
            case BottomSheetState.COLLAPSED:
              nextState = BottomSheetState.HALF;
              break;
            case BottomSheetState.HALF:
              nextState = BottomSheetState.FULL;
              break;
          }
        }
      } else {
        // Slow drag - transition based on distance threshold
        const threshold = window.innerHeight * 0.15; // 15% of viewport

        if (Math.abs(dragDistance) > threshold) {
          if (dragDistance > 0) {
            // Dragged down significantly
            switch (currentState) {
              case BottomSheetState.FULL:
                nextState = BottomSheetState.HALF;
                break;
              case BottomSheetState.HALF:
                nextState = BottomSheetState.COLLAPSED;
                break;
              case BottomSheetState.COLLAPSED:
                nextState = BottomSheetState.CLOSED;
                break;
            }
          } else {
            // Dragged up significantly
            switch (currentState) {
              case BottomSheetState.CLOSED:
                nextState = BottomSheetState.COLLAPSED;
                break;
              case BottomSheetState.COLLAPSED:
                nextState = BottomSheetState.HALF;
                break;
              case BottomSheetState.HALF:
                nextState = BottomSheetState.FULL;
                break;
            }
          }
        }
        // If drag distance is small, snap back to current state
      }

      updateState(nextState);
    },
    [currentState, updateState]
  );

  /**
   * Handle backdrop tap
   */
  const handleBackdropTap = useCallback(() => {
    if (closeOnBackdropTap && currentState !== BottomSheetState.CLOSED) {
      updateState(BottomSheetState.COLLAPSED);
    }
  }, [closeOnBackdropTap, currentState, updateState]);

  /**
   * Prevent body scroll when sheet is open
   */
  useEffect(() => {
    if (currentState === BottomSheetState.HALF || currentState === BottomSheetState.FULL) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      // Restore scroll
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [currentState]);

  // Calculate current height based on state
  const currentHeight = getStateHeight(currentState, heights);

  return (
    <>
      {/* Backdrop */}
      {showBackdrop && currentState !== BottomSheetState.CLOSED && (
        <motion.div
          className="bottom-sheet-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            opacity: backdropOpacity,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: currentState === BottomSheetState.CLOSED ? 0 : 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: MOBILE_ANIMATIONS.NORMAL / 1000 }}
          onClick={handleBackdropTap}
          data-testid={`${testId}-backdrop`}
        />
      )}

      {/* Bottom Sheet */}
      <motion.div
        ref={sheetRef}
        className={`bottom-sheet bottom-sheet--${currentState} ${className}`}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: currentHeight,
          backgroundColor: 'white',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
          zIndex: 999,
          y,
          touchAction: 'none',
        }}
        drag={enableSwipe ? 'y' : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        initial={false}
        animate={{
          height: currentHeight,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          duration: MOBILE_ANIMATIONS.BOTTOM_SHEET / 1000,
        }}
        data-testid={testId}
        data-state={currentState}
      >
        {/* Drag handle */}
        <div
          className="bottom-sheet-handle"
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: '#ccc',
            margin: '12px auto 8px',
            cursor: enableSwipe ? 'grab' : 'default',
          }}
          data-testid={`${testId}-handle`}
        />

        {/* Sheet content */}
        <div
          className="bottom-sheet-content"
          style={{
            height: 'calc(100% - 24px)', // Account for handle
            overflowY:
              currentState === BottomSheetState.HALF || currentState === BottomSheetState.FULL
                ? 'auto'
                : 'hidden',
            overflowX: 'hidden',
            padding: '0 16px 16px',
          }}
          data-testid={`${testId}-content`}
        >
          {children}
        </div>
      </motion.div>
    </>
  );
};

export default BottomSheet;
