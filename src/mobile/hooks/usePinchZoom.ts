/**
 * usePinchZoom Hook
 *
 * Specialized hook for pinch-to-zoom gestures on the California map.
 * Integrates with progressive geodata loading to fetch higher resolution
 * data as users zoom in.
 *
 * @see docs/MOBILE_PRD.md - Mobile Phase 2: Pinch-to-Zoom with Progressive Loading
 * @see src/mobile/utils/progressiveGeodata.ts - AdaptiveGeodataLoader
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { GESTURE_CONFIG } from '../config/breakpoints';
import { AdaptiveGeodataLoader, GeodetaLevel } from '../utils/progressiveGeodata';
import {
  calculateDistance,
  calculateCenterPoint,
  touchListToPoints,
  type TouchPoint,
} from './useGestureDetection';

/**
 * Pinch zoom state
 */
export interface PinchZoomState {
  /** Current zoom scale (1.0 = 100%, 0.5 = 50%, 3.0 = 300%) */
  scale: number;
  /** Previous scale (for delta calculations) */
  previousScale: number;
  /** Is currently pinching */
  isPinching: boolean;
  /** Center point of pinch gesture */
  center: { x: number; y: number } | null;
  /** Current geodata level being displayed */
  currentLevel: GeodetaLevel | null;
  /** Is geodata currently loading */
  isLoading: boolean;
  /** Loading progress (0-100) */
  loadingProgress: number;
}

/**
 * Configuration options for pinch-to-zoom
 */
export interface PinchZoomConfig {
  /** Minimum allowed scale */
  minScale?: number;
  /** Maximum allowed scale */
  maxScale?: number;
  /** Initial scale */
  initialScale?: number;
  /** Enable progressive geodata loading */
  enableProgressiveLoading?: boolean;
  /** Callback when zoom scale changes */
  onZoomChange?: (scale: number, level: GeodetaLevel | null) => void;
  /** Callback when geodata loading starts */
  onLoadingStart?: (level: GeodetaLevel) => void;
  /** Callback when geodata loading completes */
  onLoadingComplete?: (level: GeodetaLevel, data: unknown) => void;
  /** Callback when geodata loading fails */
  onLoadingError?: (level: GeodetaLevel, error: Error) => void;
}

const DEFAULT_CONFIG: Required<
  Omit<PinchZoomConfig, 'onZoomChange' | 'onLoadingStart' | 'onLoadingComplete' | 'onLoadingError'>
> = {
  minScale: GESTURE_CONFIG.ZOOM_MIN_SCALE,
  maxScale: GESTURE_CONFIG.ZOOM_MAX_SCALE,
  initialScale: 1.0,
  enableProgressiveLoading: true,
};

/**
 * React hook for pinch-to-zoom gesture handling
 *
 * Detects two-finger pinch gestures, calculates zoom scale, and triggers
 * progressive geodata loading based on zoom level. Prevents default
 * browser zoom behavior for smooth custom zoom experience.
 *
 * @param config - Configuration options
 * @returns Object with zoom state and gesture handlers
 *
 * @example
 * ```tsx
 * function MapView() {
 *   const pinchZoom = usePinchZoom({
 *     minScale: 0.5,
 *     maxScale: 3.0,
 *     enableProgressiveLoading: true,
 *     onZoomChange: (scale, level) => {
 *       // Handle zoom change, update map transform
 *     },
 *   });
 *
 *   return (
 *     <div
 *       onTouchStart={pinchZoom.handleTouchStart}
 *       onTouchMove={pinchZoom.handleTouchMove}
 *       onTouchEnd={pinchZoom.handleTouchEnd}
 *       style={{ transform: `scale(${pinchZoom.currentZoom})` }}
 *     >
 *       <CaliforniaMap />
 *       {pinchZoom.isLoading && (
 *         <LoadingIndicator progress={pinchZoom.loadingProgress} />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePinchZoom(config: PinchZoomConfig = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // Zoom state
  const [zoomState, setZoomState] = useState<PinchZoomState>({
    scale: mergedConfig.initialScale,
    previousScale: mergedConfig.initialScale,
    isPinching: false,
    center: null,
    currentLevel: null,
    isLoading: false,
    loadingProgress: 0,
  });

  // Refs for tracking pinch gesture
  const initialDistanceRef = useRef<number>(0);
  const initialScaleRef = useRef<number>(mergedConfig.initialScale);
  const touchesRef = useRef<TouchPoint[]>([]);
  const geodataLoaderRef = useRef<AdaptiveGeodataLoader>(new AdaptiveGeodataLoader());

  /**
   * Clamp scale value within min/max bounds
   */
  const clampScale = useCallback(
    (scale: number): number => {
      return Math.min(Math.max(scale, mergedConfig.minScale), mergedConfig.maxScale);
    },
    [mergedConfig.minScale, mergedConfig.maxScale]
  );

  /**
   * Load geodata for current zoom level
   */
  const loadGeodataForZoom = useCallback(
    async (scale: number) => {
      if (!mergedConfig.enableProgressiveLoading) {
        return;
      }

      const loader = geodataLoaderRef.current;

      // Skip if already loading
      if (loader.isLoading()) {
        return;
      }

      try {
        const currentLevel = loader.getCurrentLevel();

        setZoomState((prev) => ({
          ...prev,
          isLoading: true,
          loadingProgress: 0,
        }));

        config.onLoadingStart?.(currentLevel || GeodetaLevel.LOW);

        const data = await loader.load(scale, (loaded, total) => {
          const progress = Math.round((loaded / total) * 100);
          setZoomState((prev) => ({
            ...prev,
            loadingProgress: progress,
          }));
        });

        const newLevel = loader.getCurrentLevel();

        setZoomState((prev) => ({
          ...prev,
          currentLevel: newLevel,
          isLoading: false,
          loadingProgress: 100,
        }));

        config.onLoadingComplete?.(newLevel || GeodetaLevel.LOW, data);

        // Preload next level for smoother transitions
        loader.preloadNext(scale).catch(() => {
          // Ignore preload failures
        });
      } catch (error) {
        const currentLevel = geodataLoaderRef.current.getCurrentLevel();

        setZoomState((prev) => ({
          ...prev,
          isLoading: false,
          loadingProgress: 0,
        }));

        config.onLoadingError?.(
          currentLevel || GeodetaLevel.LOW,
          error instanceof Error ? error : new Error('Unknown error')
        );
      }
    },
    [mergedConfig.enableProgressiveLoading, config]
  );

  /**
   * Update zoom scale
   */
  const updateScale = useCallback(
    (newScale: number) => {
      const clampedScale = clampScale(newScale);

      setZoomState((prev) => ({
        ...prev,
        previousScale: prev.scale,
        scale: clampedScale,
      }));

      // Trigger geodata loading for new zoom level
      loadGeodataForZoom(clampedScale);

      // Notify callback
      config.onZoomChange?.(clampedScale, geodataLoaderRef.current.getCurrentLevel());
    },
    [clampScale, loadGeodataForZoom, config]
  );

  /**
   * Handle touch start event
   */
  const handleTouchStart = useCallback(
    (event: React.TouchEvent | TouchEvent) => {
      const timestamp = Date.now();
      const touches = touchListToPoints(event.touches, timestamp);

      touchesRef.current = touches;

      // Detect pinch start (two fingers)
      if (touches.length === 2) {
        // Prevent default browser zoom
        event.preventDefault();

        const distance = calculateDistance(touches[0], touches[1]);
        const center = calculateCenterPoint(touches[0], touches[1]);

        initialDistanceRef.current = distance;
        initialScaleRef.current = zoomState.scale;

        setZoomState((prev) => ({
          ...prev,
          isPinching: true,
          center,
        }));
      } else if (touches.length > 2) {
        // More than 2 fingers - cancel pinch
        setZoomState((prev) => ({
          ...prev,
          isPinching: false,
          center: null,
        }));
      }
    },
    [zoomState.scale]
  );

  /**
   * Handle touch move event
   */
  const handleTouchMove = useCallback(
    (event: React.TouchEvent | TouchEvent) => {
      const timestamp = Date.now();
      const touches = touchListToPoints(event.touches, timestamp);

      touchesRef.current = touches;

      // Handle pinch gesture (two fingers)
      if (touches.length === 2 && zoomState.isPinching) {
        // Prevent default browser zoom and scroll
        event.preventDefault();

        const currentDistance = calculateDistance(touches[0], touches[1]);
        const center = calculateCenterPoint(touches[0], touches[1]);

        // Calculate scale based on distance change
        const scaleFactor = currentDistance / initialDistanceRef.current;
        const newScale = initialScaleRef.current * scaleFactor;

        updateScale(newScale);

        setZoomState((prev) => ({
          ...prev,
          center,
        }));
      } else if (touches.length !== 2 && zoomState.isPinching) {
        // Finger count changed during pinch - cancel
        setZoomState((prev) => ({
          ...prev,
          isPinching: false,
          center: null,
        }));
      }
    },
    [zoomState.isPinching, updateScale]
  );

  /**
   * Handle touch end event
   */
  const handleTouchEnd = useCallback(
    (event: React.TouchEvent | TouchEvent) => {
      const remainingTouches = event.touches;

      // End pinch when fingers are released
      if (remainingTouches.length < 2 && zoomState.isPinching) {
        setZoomState((prev) => ({
          ...prev,
          isPinching: false,
          center: null,
        }));

        // Reset refs
        initialDistanceRef.current = 0;
        initialScaleRef.current = zoomState.scale;
      }

      touchesRef.current = touchListToPoints(remainingTouches, Date.now());
    },
    [zoomState.isPinching, zoomState.scale]
  );

  /**
   * Programmatically set zoom scale
   */
  const setZoom = useCallback(
    (scale: number) => {
      updateScale(scale);
    },
    [updateScale]
  );

  /**
   * Reset zoom to initial scale
   */
  const resetZoom = useCallback(() => {
    updateScale(mergedConfig.initialScale);
  }, [updateScale, mergedConfig.initialScale]);

  /**
   * Zoom in by a step
   */
  const zoomIn = useCallback(() => {
    updateScale(zoomState.scale + GESTURE_CONFIG.ZOOM_STEP);
  }, [updateScale, zoomState.scale]);

  /**
   * Zoom out by a step
   */
  const zoomOut = useCallback(() => {
    updateScale(zoomState.scale - GESTURE_CONFIG.ZOOM_STEP);
  }, [updateScale, zoomState.scale]);

  /**
   * Get zoom percentage (100% = 1.0 scale)
   */
  const getZoomPercentage = useCallback((): number => {
    return Math.round(zoomState.scale * 100);
  }, [zoomState.scale]);

  // Load initial geodata on mount
  useEffect(() => {
    if (mergedConfig.enableProgressiveLoading) {
      loadGeodataForZoom(mergedConfig.initialScale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  return {
    /** Current zoom scale (0.5 - 3.0) */
    currentZoom: zoomState.scale,

    /** Previous zoom scale */
    previousZoom: zoomState.previousScale,

    /** Is currently pinching */
    isPinching: zoomState.isPinching,

    /** Center point of pinch gesture */
    center: zoomState.center,

    /** Current geodata level */
    currentLevel: zoomState.currentLevel,

    /** Is geodata loading */
    isLoading: zoomState.isLoading,

    /** Loading progress (0-100) */
    loadingProgress: zoomState.loadingProgress,

    /** Handle touch start event */
    handleTouchStart,

    /** Handle touch move event */
    handleTouchMove,

    /** Handle touch end event */
    handleTouchEnd,

    /** Programmatically set zoom */
    setZoom,

    /** Reset to initial zoom */
    resetZoom,

    /** Zoom in by step */
    zoomIn,

    /** Zoom out by step */
    zoomOut,

    /** Get zoom as percentage (100% = 1.0 scale) */
    getZoomPercentage,

    /** Geodata loader instance (for advanced usage) */
    geodataLoader: geodataLoaderRef.current,

    /** Configuration being used */
    config: mergedConfig,
  };
}

export default usePinchZoom;
