/**
 * Enhanced Web Vitals Tracking
 *
 * Purpose: Comprehensive Core Web Vitals monitoring
 * Tracks: FCP, LCP, FID, CLS, INP, TTFB
 *
 * Documentation: https://web.dev/vitals/
 */

import { trackEvent, AnalyticsEvent } from '../services/analytics';

// Re-export from web-vitals package
export interface Metric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
  navigationType: string;
}

/**
 * Thresholds based on web.dev recommendations
 */
const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },      // First Contentful Paint
  LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
  FID: { good: 100, poor: 300 },        // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
  INP: { good: 200, poor: 500 },        // Interaction to Next Paint
  TTFB: { good: 800, poor: 1800 },      // Time to First Byte
};

/**
 * Get rating for a metric value
 */
function getRating(
  value: number,
  thresholds: { good: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Track metric to analytics
 */
function trackMetric(metric: Metric): void {
  trackEvent(AnalyticsEvent.WEB_VITAL, {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    delta: metric.delta,
    navigationType: metric.navigationType,
  });

  // Log in development
  if (import.meta.env.DEV) {
    console.log(
      `[Web Vitals] ${metric.name}: ${metric.value.toFixed(0)}ms (${metric.rating})`
    );
  }
}

/**
 * Initialize Web Vitals tracking
 * Call this once on app initialization
 */
export async function initWebVitals(): Promise<void> {
  try {
    // Dynamic import to avoid bloating the initial bundle
    const { onFCP, onLCP, onFID, onCLS, onINP, onTTFB } = await import('web-vitals');

    // First Contentful Paint
    onFCP((metric) => {
      const rating = getRating(metric.value, THRESHOLDS.FCP);
      trackMetric({ ...metric, rating });
    });

    // Largest Contentful Paint
    onLCP((metric) => {
      const rating = getRating(metric.value, THRESHOLDS.LCP);
      trackMetric({ ...metric, rating });

      // Alert if poor LCP
      if (rating === 'poor') {
        console.warn('[Performance] Poor LCP detected:', metric.value);
      }
    });

    // First Input Delay
    onFID((metric) => {
      const rating = getRating(metric.value, THRESHOLDS.FID);
      trackMetric({ ...metric, rating });
    });

    // Cumulative Layout Shift
    onCLS((metric) => {
      const rating = getRating(metric.value, THRESHOLDS.CLS);
      trackMetric({ ...metric, rating });
    });

    // Interaction to Next Paint (new metric)
    onINP((metric) => {
      const rating = getRating(metric.value, THRESHOLDS.INP);
      trackMetric({ ...metric, rating });
    });

    // Time to First Byte
    onTTFB((metric) => {
      const rating = getRating(metric.value, THRESHOLDS.TTFB);
      trackMetric({ ...metric, rating });
    });

    console.info('[Web Vitals] Tracking initialized');
  } catch (error) {
    console.error('[Web Vitals] Failed to initialize:', error);
  }
}

/**
 * Get current Web Vitals snapshot
 * Useful for performance debugging
 */
export function getWebVitalsSnapshot(): Promise<{
  FCP?: number;
  LCP?: number;
  FID?: number;
  CLS?: number;
  INP?: number;
  TTFB?: number;
}> {
  return new Promise((resolve) => {
    const vitals: any = {};

    // Get paint timing
    const paintEntries = performance.getEntriesByType('paint') as PerformancePaintTiming[];
    const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
    if (fcp) {
      vitals.FCP = fcp.startTime;
    }

    // Get navigation timing
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      const nav = navEntries[0];
      vitals.TTFB = nav.responseStart - nav.requestStart;
    }

    // For other metrics, need to wait for web-vitals library
    import('web-vitals').then(({ onLCP, onFID, onCLS, onINP }) => {
      onLCP((metric) => {
        vitals.LCP = metric.value;
      });

      onFID((metric) => {
        vitals.FID = metric.value;
      });

      onCLS((metric) => {
        vitals.CLS = metric.value;
      });

      onINP((metric) => {
        vitals.INP = metric.value;
      });

      // Give it a moment to collect metrics
      setTimeout(() => resolve(vitals), 100);
    });
  });
}

/**
 * Check if Web Vitals are within acceptable ranges
 */
export async function checkWebVitalsHealth(): Promise<{
  healthy: boolean;
  issues: string[];
}> {
  const vitals = await getWebVitalsSnapshot();
  const issues: string[] = [];

  if (vitals.FCP && vitals.FCP > THRESHOLDS.FCP.poor) {
    issues.push(`FCP too slow: ${vitals.FCP.toFixed(0)}ms`);
  }

  if (vitals.LCP && vitals.LCP > THRESHOLDS.LCP.poor) {
    issues.push(`LCP too slow: ${vitals.LCP.toFixed(0)}ms`);
  }

  if (vitals.FID && vitals.FID > THRESHOLDS.FID.poor) {
    issues.push(`FID too high: ${vitals.FID.toFixed(0)}ms`);
  }

  if (vitals.CLS && vitals.CLS > THRESHOLDS.CLS.poor) {
    issues.push(`CLS too high: ${vitals.CLS.toFixed(3)}`);
  }

  if (vitals.INP && vitals.INP > THRESHOLDS.INP.poor) {
    issues.push(`INP too slow: ${vitals.INP.toFixed(0)}ms`);
  }

  return {
    healthy: issues.length === 0,
    issues,
  };
}

/**
 * Export thresholds for reference
 */
export { THRESHOLDS };
