/**
 * Performance Monitoring Hook
 *
 * Purpose: Monitor Core Web Vitals and custom performance metrics
 * Features:
 * - FPS monitoring
 * - Load time tracking
 * - Interaction latency
 * - Memory usage
 * - Custom performance marks
 */

import { useEffect, useRef, useState } from 'react';
import { trackEvent, AnalyticsEvent } from '../services/analytics';
import { logger } from '../utils/logger';

interface PerformanceMetrics {
  fps: number;
  avgFps: number;
  loadTime: number;
  memoryUsage?: number;
  isSlowDevice: boolean;
}

interface UsePerformanceMonitoringOptions {
  enableFpsMonitoring?: boolean;
  fpsThreshold?: number;
  reportInterval?: number;
}

export function usePerformanceMonitoring(
  options: UsePerformanceMonitoringOptions = {}
) {
  const {
    enableFpsMonitoring = true,
    fpsThreshold = 30,
    reportInterval = 10000, // Report every 10 seconds
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    avgFps: 60,
    loadTime: 0,
    isSlowDevice: false,
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number>();

  /**
   * Monitor FPS
   */
  useEffect(() => {
    if (!enableFpsMonitoring) return;

    let lastReportTime = performance.now();

    const measureFps = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;

      frameCountRef.current++;

      // Calculate FPS every second
      if (delta >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / delta);

        // Store in history
        fpsHistoryRef.current.push(fps);
        if (fpsHistoryRef.current.length > 60) {
          fpsHistoryRef.current.shift();
        }

        // Calculate average
        const avgFps = Math.round(
          fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length
        );

        // Update metrics
        setMetrics(prev => ({
          ...prev,
          fps,
          avgFps,
          isSlowDevice: avgFps < fpsThreshold,
        }));

        // Report slow performance
        if (now - lastReportTime >= reportInterval) {
          if (avgFps < fpsThreshold) {
            trackEvent(AnalyticsEvent.LOW_FPS, {
              fps,
              avgFps,
              threshold: fpsThreshold,
            });
          }
          lastReportTime = now;
        }

        // Reset counters
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animationFrameRef.current = requestAnimationFrame(measureFps);
    };

    animationFrameRef.current = requestAnimationFrame(measureFps);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enableFpsMonitoring, fpsThreshold, reportInterval]);

  /**
   * Monitor memory usage
   */
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        // Chrome's non-standard memory API
        interface PerformanceMemory {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        }
        const memory = (performance as Performance & { memory: PerformanceMemory }).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);

        setMetrics(prev => ({
          ...prev,
          memoryUsage: usedMB,
        }));
      }
    };

    const interval = setInterval(checkMemory, 5000);
    checkMemory();

    return () => clearInterval(interval);
  }, []);

  /**
   * Measure page load time
   */
  useEffect(() => {
    const measureLoadTime = () => {
      if (typeof window === 'undefined' || !window.performance) return;

      const perfData = window.performance.timing;
      const loadTime = perfData.loadEventEnd - perfData.navigationStart;

      setMetrics(prev => ({
        ...prev,
        loadTime,
      }));

      // Report slow load time
      if (loadTime > 3000) {
        trackEvent(AnalyticsEvent.SLOW_PERFORMANCE, {
          loadTime,
          threshold: 3000,
        });
      }
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      measureLoadTime();
    } else {
      window.addEventListener('load', measureLoadTime);
      return () => window.removeEventListener('load', measureLoadTime);
    }
  }, []);

  /**
   * Mark performance point
   */
  const mark = (name: string): void => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(name);
    }
  };

  /**
   * Measure time between marks
   */
  const measure = (name: string, startMark: string, endMark: string): number => {
    if (typeof window === 'undefined' || !window.performance) return 0;

    try {
      window.performance.measure(name, startMark, endMark);
      const measure = window.performance.getEntriesByName(name)[0];

      if (measure) {
        const duration = measure.duration;

        // Report slow operations
        if (duration > 1000) {
          trackEvent(AnalyticsEvent.SLOW_PERFORMANCE, {
            operation: name,
            duration,
            threshold: 1000,
          });
        }

        return duration;
      }
    } catch (error) {
      logger.error('[Performance] Failed to measure:', error);
    }

    return 0;
  };

  /**
   * Measure interaction latency
   */
  const measureInteraction = async (
    name: string,
    callback: () => void | Promise<void>
  ): Promise<void> => {
    const startMark = `${name}_start`;
    const endMark = `${name}_end`;

    mark(startMark);

    try {
      await callback();
    } finally {
      mark(endMark);
      const duration = measure(name, startMark, endMark);

      // Log in development
      if (import.meta.env.DEV && duration > 0) {
        // eslint-disable-next-line no-console
        console.info(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }
    }
  };

  return {
    metrics,
    mark,
    measure,
    measureInteraction,
  };
}
