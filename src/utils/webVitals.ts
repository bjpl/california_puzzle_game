/**
 * Web Vitals Monitoring
 *
 * Purpose: Track Core Web Vitals for performance monitoring
 * Used by: main.tsx in production builds
 *
 * Metrics Tracked (web-vitals v5+):
 * - CLS (Cumulative Layout Shift)
 * - INP (Interaction to Next Paint) - replaces FID
 * - FCP (First Contentful Paint)
 * - LCP (Largest Contentful Paint)
 * - TTFB (Time to First Byte)
 *
 * Documentation: https://web.dev/vitals/
 * Note: INP has replaced FID as of web-vitals v4+
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

interface WebVitalsConfig {
  /**
   * Send metrics to analytics service
   */
  sendToAnalytics?: (metric: Metric) => void;

  /**
   * Enable console logging
   */
  debug?: boolean;
}

/**
 * Log metric to console in development
 */
function logMetric(metric: Metric) {
  const { name, value, rating, id } = metric;
  const color = rating === 'good' ? 'green' : rating === 'needs-improvement' ? 'orange' : 'red';

  // eslint-disable-next-line no-console
  console.info(`%c[Web Vitals] ${name}`, `color: ${color}; font-weight: bold;`, {
    value: `${value.toFixed(2)}ms`,
    rating,
    id,
  });
}

/**
 * Send metric to analytics service
 * Replace with your analytics implementation
 */
function sendToAnalytics(metric: Metric) {
  const { name, value, rating, id, delta } = metric;

  // Example: Google Analytics 4
  if (typeof window !== 'undefined' && (window as Record<string, unknown>).gtag) {
    (window as Record<string, unknown>).gtag('event', name, {
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      metric_id: id,
      metric_value: value,
      metric_delta: delta,
      metric_rating: rating,
    });
  }

  // Example: Custom analytics endpoint
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const body = JSON.stringify({ metric: name, value, rating, id });
    navigator.sendBeacon('/api/web-vitals', body);
  }
}

/**
 * Report all Web Vitals
 */
export function reportWebVitals(config: WebVitalsConfig = {}) {
  const { sendToAnalytics: customSendToAnalytics, debug = false } = config;

  const handleMetric = (metric: Metric) => {
    if (debug) {
      logMetric(metric);
    }

    if (customSendToAnalytics) {
      customSendToAnalytics(metric);
    } else if (import.meta.env.PROD) {
      sendToAnalytics(metric);
    }
  };

  // Track all metrics
  onCLS(handleMetric);
  onINP(handleMetric); // Replaces FID (First Input Delay)
  onFCP(handleMetric);
  onLCP(handleMetric);
  onTTFB(handleMetric);
}

/**
 * Get performance marks for custom tracking
 */
export function markPerformance(name: string) {
  if (typeof window !== 'undefined' && window.performance) {
    window.performance.mark(name);
  }
}

/**
 * Measure time between two performance marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string) {
  if (typeof window !== 'undefined' && window.performance) {
    window.performance.measure(name, startMark, endMark);
    const measure = window.performance.getEntriesByName(name)[0];

    if (measure) {
      // eslint-disable-next-line no-console
      console.info(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
      return measure.duration;
    }
  }
  return 0;
}

/**
 * Get navigation timing metrics
 */
export function getNavigationTiming() {
  if (typeof window === 'undefined' || !window.performance || !window.performance.timing) {
    return null;
  }

  const timing = window.performance.timing;

  return {
    // Network timing
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    tcp: timing.connectEnd - timing.connectStart,
    request: timing.responseStart - timing.requestStart,
    response: timing.responseEnd - timing.responseStart,

    // Document timing
    domLoading: timing.domLoading - timing.fetchStart,
    domInteractive: timing.domInteractive - timing.fetchStart,
    domComplete: timing.domComplete - timing.fetchStart,
    loadComplete: timing.loadEventEnd - timing.fetchStart,

    // Total time
    total: timing.loadEventEnd - timing.navigationStart,
  };
}

export default reportWebVitals;
