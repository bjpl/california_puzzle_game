/**
 * Performance Budget Monitoring
 *
 * Purpose: Track and enforce performance budgets in production
 * Features:
 * - Bundle size monitoring
 * - Runtime performance tracking
 * - Automatic alerts for budget violations
 */

import { trackEvent, AnalyticsEvent } from '../services/analytics';
import { logger } from './logger';

/**
 * Performance budgets
 */
export const PERFORMANCE_BUDGETS = {
  // Bundle sizes (bytes, gzipped)
  bundle: {
    initial: 150_000, // 150 KB initial bundle
    total: 400_000, // 400 KB total JS
    css: 50_000, // 50 KB CSS
    images: 200_000, // 200 KB images
  },

  // Web Vitals (milliseconds)
  vitals: {
    FCP: 1800, // First Contentful Paint
    LCP: 2500, // Largest Contentful Paint
    FID: 100, // First Input Delay
    TTI: 3800, // Time to Interactive
    CLS: 0.1, // Cumulative Layout Shift (unitless)
  },

  // Runtime performance
  runtime: {
    fps: 45, // Minimum FPS
    memoryMB: 100, // Max memory (MB)
    taskDuration: 50, // Max long task (ms)
  },
};

/**
 * Check if bundle size is within budget
 */
export function checkBundleBudget(): {
  withinBudget: boolean;
  violations: string[];
  metrics: Record<string, number>;
} {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  const metrics = {
    jsSize: 0,
    cssSize: 0,
    imageSize: 0,
    totalSize: 0,
  };

  const violations: string[] = [];

  // Calculate sizes
  resources.forEach((resource) => {
    const size = resource.transferSize || 0;
    metrics.totalSize += size;

    if (resource.name.endsWith('.js')) {
      metrics.jsSize += size;
    } else if (resource.name.endsWith('.css')) {
      metrics.cssSize += size;
    } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      metrics.imageSize += size;
    }
  });

  // Check violations
  if (metrics.jsSize > PERFORMANCE_BUDGETS.bundle.total) {
    violations.push(
      `JS bundle exceeded budget: ${formatBytes(metrics.jsSize)} > ${formatBytes(PERFORMANCE_BUDGETS.bundle.total)}`
    );
  }

  if (metrics.cssSize > PERFORMANCE_BUDGETS.bundle.css) {
    violations.push(
      `CSS bundle exceeded budget: ${formatBytes(metrics.cssSize)} > ${formatBytes(PERFORMANCE_BUDGETS.bundle.css)}`
    );
  }

  if (metrics.imageSize > PERFORMANCE_BUDGETS.bundle.images) {
    violations.push(
      `Images exceeded budget: ${formatBytes(metrics.imageSize)} > ${formatBytes(PERFORMANCE_BUDGETS.bundle.images)}`
    );
  }

  // Track to analytics
  trackEvent(AnalyticsEvent.BUNDLE_SIZE, {
    jsSize: metrics.jsSize,
    cssSize: metrics.cssSize,
    imageSize: metrics.imageSize,
    totalSize: metrics.totalSize,
    violations: violations.length,
  });

  return {
    withinBudget: violations.length === 0,
    violations,
    metrics,
  };
}

/**
 * Check if Web Vitals are within budget
 */
export function checkVitalsBudget(vitals: {
  FCP?: number;
  LCP?: number;
  FID?: number;
  CLS?: number;
  TTI?: number;
}): {
  withinBudget: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  if (vitals.FCP && vitals.FCP > PERFORMANCE_BUDGETS.vitals.FCP) {
    violations.push(
      `FCP exceeded budget: ${vitals.FCP.toFixed(0)}ms > ${PERFORMANCE_BUDGETS.vitals.FCP}ms`
    );
  }

  if (vitals.LCP && vitals.LCP > PERFORMANCE_BUDGETS.vitals.LCP) {
    violations.push(
      `LCP exceeded budget: ${vitals.LCP.toFixed(0)}ms > ${PERFORMANCE_BUDGETS.vitals.LCP}ms`
    );
  }

  if (vitals.FID && vitals.FID > PERFORMANCE_BUDGETS.vitals.FID) {
    violations.push(
      `FID exceeded budget: ${vitals.FID.toFixed(0)}ms > ${PERFORMANCE_BUDGETS.vitals.FID}ms`
    );
  }

  if (vitals.CLS && vitals.CLS > PERFORMANCE_BUDGETS.vitals.CLS) {
    violations.push(
      `CLS exceeded budget: ${vitals.CLS.toFixed(3)} > ${PERFORMANCE_BUDGETS.vitals.CLS}`
    );
  }

  if (vitals.TTI && vitals.TTI > PERFORMANCE_BUDGETS.vitals.TTI) {
    violations.push(
      `TTI exceeded budget: ${vitals.TTI.toFixed(0)}ms > ${PERFORMANCE_BUDGETS.vitals.TTI}ms`
    );
  }

  return {
    withinBudget: violations.length === 0,
    violations,
  };
}

/**
 * Check runtime performance
 */
export function checkRuntimeBudget(metrics: {
  fps?: number;
  memoryMB?: number;
  longTaskDuration?: number;
}): {
  withinBudget: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  if (metrics.fps && metrics.fps < PERFORMANCE_BUDGETS.runtime.fps) {
    violations.push(`FPS below budget: ${metrics.fps} < ${PERFORMANCE_BUDGETS.runtime.fps}`);
  }

  if (metrics.memoryMB && metrics.memoryMB > PERFORMANCE_BUDGETS.runtime.memoryMB) {
    violations.push(
      `Memory exceeded budget: ${metrics.memoryMB}MB > ${PERFORMANCE_BUDGETS.runtime.memoryMB}MB`
    );
  }

  if (
    metrics.longTaskDuration &&
    metrics.longTaskDuration > PERFORMANCE_BUDGETS.runtime.taskDuration
  ) {
    violations.push(
      `Long task duration exceeded budget: ${metrics.longTaskDuration}ms > ${PERFORMANCE_BUDGETS.runtime.taskDuration}ms`
    );
  }

  return {
    withinBudget: violations.length === 0,
    violations,
  };
}

/**
 * Monitor performance budgets
 * Call this periodically or on significant events
 */
export function monitorPerformanceBudgets(): void {
  // Check bundle budget on load
  const bundleCheck = checkBundleBudget();

  if (!bundleCheck.withinBudget) {
    logger.warn('[Performance Budget] Bundle violations:', bundleCheck.violations);

    // Track violations
    trackEvent(AnalyticsEvent.BUDGET_VIOLATION, {
      type: 'bundle',
      violations: bundleCheck.violations,
      metrics: bundleCheck.metrics,
    });
  }

  // Check runtime performance
  if ('memory' in performance) {
    // Chrome's non-standard memory API
    interface PerformanceMemory {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    }
    const memory = (performance as Performance & { memory: PerformanceMemory }).memory;
    const memoryMB = Math.round(memory.usedJSHeapSize / 1048576);

    const runtimeCheck = checkRuntimeBudget({ memoryMB });

    if (!runtimeCheck.withinBudget) {
      logger.warn('[Performance Budget] Runtime violations:', runtimeCheck.violations);

      trackEvent(AnalyticsEvent.BUDGET_VIOLATION, {
        type: 'runtime',
        violations: runtimeCheck.violations,
        memoryMB,
      });
    }
  }
}

/**
 * Format bytes to human-readable
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get performance budget summary
 */
export function getPerformanceBudgetSummary(): {
  bundle: ReturnType<typeof checkBundleBudget>;
  allViolations: string[];
} {
  const bundle = checkBundleBudget();

  const allViolations = [...bundle.violations];

  return {
    bundle,
    allViolations,
  };
}

/**
 * Initialize performance budget monitoring
 */
export function initPerformanceBudgetMonitoring(): void {
  // Check on page load
  if (document.readyState === 'complete') {
    monitorPerformanceBudgets();
  } else {
    window.addEventListener('load', monitorPerformanceBudgets);
  }

  // Check periodically (every 30 seconds)
  setInterval(monitorPerformanceBudgets, 30000);

  logger.info('[Performance Budget] Monitoring initialized');
}
