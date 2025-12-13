/**
 * Performance Utilities
 * Helper functions for measuring and optimizing application performance
 */

/**
 * Measure the execution time of a function
 */
export function measurePerformance<T>(
  _label: string,
  fn: () => T
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  return { result, duration };
}

/**
 * Measure async function execution time
 */
export async function measureAsyncPerformance<T>(
  _label: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  return { result, duration };
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create a throttled function
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Measure component render time
 */
export function logRenderTime(_componentName: string, _renderTime: number): void {
  // Performance logging disabled in production
}

/**
 * Check if device is low-end based on hardware concurrency
 */
export function isLowEndDevice(): boolean {
  const cores = navigator.hardwareConcurrency || 1;
  // Navigator with deviceMemory property (Chrome/Edge only)
  interface NavigatorWithMemory extends Navigator {
    deviceMemory?: number;
  }
  const memory = (navigator as NavigatorWithMemory).deviceMemory || 4; // GB

  return cores <= 2 || memory <= 2;
}

/**
 * Get optimal chunk size for virtual scrolling based on device capabilities
 */
export function getOptimalChunkSize(): number {
  if (isLowEndDevice()) {
    return 50; // Smaller chunks for low-end devices
  }
  return 100; // Larger chunks for high-end devices
}

/**
 * Lazy load image with intersection observer
 */
export function lazyLoadImage(img: HTMLImageElement, src: string, placeholder?: string): void {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    });

    if (placeholder) {
      img.src = placeholder;
    }
    observer.observe(img);
  } else {
    // Fallback for browsers without IntersectionObserver
    img.src = src;
  }
}

/**
 * Calculate bundle size impact
 */
export interface BundleMetrics {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
}

export function estimateBundleSize(): BundleMetrics {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  const metrics: BundleMetrics = {
    totalSize: 0,
    jsSize: 0,
    cssSize: 0,
    imageSize: 0,
  };

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

  return metrics;
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get Web Vitals metrics
 */
export interface WebVitals {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

export function getWebVitals(): WebVitals {
  const vitals: WebVitals = {};

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

  return vitals;
}

/**
 * Log performance metrics to console
 */
export function logPerformanceMetrics(): void {
  // Performance logging disabled in production
  // Metrics are still collected via getWebVitals() and estimateBundleSize()
}
