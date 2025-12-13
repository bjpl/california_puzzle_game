/**
 * Analytics Provider Component
 *
 * Purpose: Initialize and manage analytics/error reporting services
 * Features:
 * - Auto-initialization on mount
 * - Consent management
 * - Performance monitoring
 * - Route change tracking
 */

import { useEffect } from 'react';
import { analytics } from '../../services/analytics';
import { errorReporting } from '../../services/errorReporting';
import { usePerformanceMonitoring } from '../../hooks/usePerformanceMonitoring';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Initialize performance monitoring
  const { metrics } = usePerformanceMonitoring({
    enableFpsMonitoring: true,
    fpsThreshold: 30,
    reportInterval: 10000,
  });

  /**
   * Initialize analytics and error reporting
   */
  useEffect(() => {
    // Initialize services
    analytics.initialize();

    // Log initialization
    if (import.meta.env.MODE === 'development') {
      // eslint-disable-next-line no-console
      console.info('[Analytics] Provider initialized', {
        analyticsEnabled: analytics.isEnabled(),
        errorReportingEnabled: errorReporting.isErrorReportingEnabled(),
      });
    }
  }, []);

  /**
   * Report performance metrics periodically
   */
  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      // eslint-disable-next-line no-console
      console.info('[Performance]', metrics);
    }
  }, [metrics]);

  return <>{children}</>;
}

// Default export for lazy loading
export default AnalyticsProvider;
