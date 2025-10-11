/**
 * Error Reporting Service
 *
 * Purpose: Capture and report runtime errors for debugging
 * Features:
 * - Error boundary integration
 * - Stack trace capture
 * - User context (no PII)
 * - Breadcrumb tracking
 * - Sentry integration (optional)
 *
 * Privacy:
 * - No personal data
 * - Anonymized user sessions
 * - Configurable data collection
 */

interface ErrorContext {
  url: string;
  userAgent: string;
  viewport: string;
  timestamp: string;
  sessionId: string;
}

interface Breadcrumb {
  timestamp: string;
  category: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

interface ErrorReport {
  message: string;
  stack?: string;
  context: ErrorContext;
  breadcrumbs: Breadcrumb[];
  componentStack?: string;
}

class ErrorReportingService {
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 20;
  private sessionId: string;
  private isEnabled = false;
  private sentryInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = this.getConsentStatus();

    if (this.isEnabled) {
      this.initializeSentry();
      this.setupGlobalHandlers();
    }
  }

  /**
   * Initialize Sentry (if API key provided)
   */
  private initializeSentry(): void {
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

    if (!sentryDsn) {
      // eslint-disable-next-line no-console
      console.info('[Error Reporting] Sentry DSN not configured, using fallback');
      return;
    }

    try {
      // Dynamically import Sentry only if needed
      import('@sentry/react').then(({ init, browserTracingIntegration }) => {
        init({
          dsn: sentryDsn,
          environment: import.meta.env.MODE,
          integrations: [browserTracingIntegration()],
          tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

          // Filter sensitive data
          beforeSend(event) {
            // Remove PII from event
            if (event.request) {
              delete event.request.cookies;
              delete event.request.headers;
            }
            return event;
          },
        });

        this.sentryInitialized = true;
        // eslint-disable-next-line no-console
        console.info('[Error Reporting] Sentry initialized');
      });
    } catch (error) {
      console.error('[Error Reporting] Failed to initialize Sentry:', error);
    }
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(new Error(event.reason), {
        category: 'unhandled_rejection',
      });
    });

    // Catch global errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        category: 'global_error',
      });
    });
  }

  /**
   * Generate anonymous session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user consent status
   */
  private getConsentStatus(): boolean {
    try {
      const consent = localStorage.getItem('error_reporting_consent');
      return consent === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Set user consent
   */
  setConsent(enabled: boolean): void {
    try {
      localStorage.setItem('error_reporting_consent', String(enabled));
      this.isEnabled = enabled;

      if (enabled && !this.sentryInitialized) {
        this.initializeSentry();
        this.setupGlobalHandlers();
      }
    } catch (error) {
      console.error('[Error Reporting] Failed to save consent:', error);
    }
  }

  /**
   * Add breadcrumb for error context
   */
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    if (!this.isEnabled) return;

    const fullBreadcrumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: new Date().toISOString(),
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // Keep only recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }

    // Add to Sentry if available
    if (this.sentryInitialized) {
      import('@sentry/react').then(({ addBreadcrumb }) => {
        addBreadcrumb({
          category: breadcrumb.category,
          message: breadcrumb.message,
          level: breadcrumb.level,
          data: breadcrumb.data,
        });
      });
    }
  }

  /**
   * Capture and report error
   */
  captureError(
    error: Error,
    additionalContext?: {
      category?: string;
      componentStack?: string;
      [key: string]: any;
    }
  ): void {
    if (!this.isEnabled) {
      // Still log to console in development
      if (import.meta.env.DEV) {
        console.error('[Error]', error, additionalContext);
      }
      return;
    }

    // Build error context
    const context: ErrorContext = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    };

    // Build error report
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      context,
      breadcrumbs: [...this.breadcrumbs],
      componentStack: additionalContext?.componentStack,
    };

    // Send to Sentry if available
    if (this.sentryInitialized) {
      import('@sentry/react').then(({ captureException, setContext }) => {
        setContext('custom', additionalContext);
        captureException(error);
      });
    } else {
      // Fallback: send to custom endpoint
      this.sendToFallbackEndpoint(report);
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.error('[Error Captured]', report);
    }
  }

  /**
   * Send error to fallback endpoint (if no Sentry)
   */
  private async sendToFallbackEndpoint(report: ErrorReport): Promise<void> {
    const endpoint = import.meta.env.VITE_ERROR_REPORTING_ENDPOINT;

    if (!endpoint) return;

    try {
      // Use sendBeacon for reliability
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(report)], {
          type: 'application/json'
        });
        navigator.sendBeacon(endpoint, blob);
      } else {
        // Fallback to fetch
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
        });
      }
    } catch (error) {
      console.error('[Error Reporting] Failed to send report:', error);
    }
  }

  /**
   * Capture message (non-error)
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!this.isEnabled) return;

    if (this.sentryInitialized) {
      import('@sentry/react').then(({ captureMessage }) => {
        captureMessage(message, level);
      });
    }

    // Add as breadcrumb
    this.addBreadcrumb({
      category: 'message',
      message,
      level,
    });
  }

  /**
   * Check if error reporting is enabled
   */
  isErrorReportingEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton
export const errorReporting = new ErrorReportingService();

// Convenience functions
export const captureError = (error: Error, context?: Record<string, any>) =>
  errorReporting.captureError(error, context);

export const captureMessage = (message: string, level?: 'info' | 'warning' | 'error') =>
  errorReporting.captureMessage(message, level);

export const addBreadcrumb = (breadcrumb: Omit<Breadcrumb, 'timestamp'>) =>
  errorReporting.addBreadcrumb(breadcrumb);

export const setErrorReportingConsent = (enabled: boolean) =>
  errorReporting.setConsent(enabled);

export const isErrorReportingEnabled = () =>
  errorReporting.isErrorReportingEnabled();
