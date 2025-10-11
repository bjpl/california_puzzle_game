/**
 * Privacy-First Analytics Service
 *
 * Purpose: Track user interactions and game metrics with privacy compliance
 * Features:
 * - Plausible Analytics integration (no cookies, GDPR compliant)
 * - Event tracking with custom properties
 * - User behavior funnels
 * - Performance metrics
 * - Easy opt-out mechanism
 *
 * Privacy:
 * - No personal data collected
 * - No cookies set
 * - IP anonymization
 * - GDPR/CCPA compliant
 */

// Analytics event types
export enum AnalyticsEvent {
  // Game Events
  GAME_START = 'game_start',
  GAME_COMPLETE = 'game_complete',
  GAME_PAUSE = 'game_pause',
  GAME_RESUME = 'game_resume',
  GAME_QUIT = 'game_quit',

  // Interaction Events
  COUNTY_PLACED = 'county_placed',
  COUNTY_REMOVED = 'county_removed',
  HINT_USED = 'hint_used',
  ZOOM_CHANGED = 'zoom_changed',

  // Touch & Gesture Events
  TAP_INTERACTION = 'tap_interaction',
  DRAG_START = 'drag_start',
  DRAG_END = 'drag_end',
  SWIPE_GESTURE = 'swipe_gesture',
  PINCH_ZOOM = 'pinch_zoom',
  DOUBLE_TAP = 'double_tap',

  // Study Mode Events
  STUDY_MODE_START = 'study_mode_start',
  STUDY_MODE_COMPLETE = 'study_mode_complete',
  QUIZ_START = 'quiz_start',
  QUIZ_COMPLETE = 'quiz_complete',
  QUIZ_ANSWER = 'quiz_answer',

  // Accessibility Events
  SCREEN_READER_USED = 'screen_reader_used',
  HIGH_CONTRAST_ENABLED = 'high_contrast_enabled',
  REDUCED_MOTION_ENABLED = 'reduced_motion_enabled',
  KEYBOARD_NAVIGATION = 'keyboard_navigation',

  // Feature Usage
  THEME_TOGGLE = 'theme_toggle',
  SOUND_TOGGLE = 'sound_toggle',
  DIFFICULTY_CHANGE = 'difficulty_change',
  MODE_SWITCH = 'mode_switch',

  // Performance
  SLOW_PERFORMANCE = 'slow_performance',
  LOW_FPS = 'low_fps',
  LOAD_ERROR = 'load_error',

  // Feedback
  FEEDBACK_OPENED = 'feedback_opened',
  FEEDBACK_SUBMITTED = 'feedback_submitted',
}

// Funnel stages
export enum FunnelStage {
  GAME_LOAD = 'game_load',
  GAME_START = 'game_start',
  FIRST_COUNTY_PLACED = 'first_county_placed',
  HALF_COMPLETE = 'half_complete',
  GAME_COMPLETE = 'game_complete',

  STUDY_START = 'study_start',
  QUIZ_START = 'quiz_start',
  QUIZ_COMPLETE = 'quiz_complete',
}

interface AnalyticsProperties {
  [key: string]: string | number | boolean | undefined;
}

interface AnalyticsConfig {
  enabled: boolean;
  domain?: string;
  apiHost?: string;
  trackLocalhost?: boolean;
}

class AnalyticsService {
  private config: AnalyticsConfig;
  private isInitialized = false;
  private plausibleLoaded = false;
  private eventQueue: Array<{ event: string; props?: AnalyticsProperties }> = [];

  constructor() {
    this.config = {
      enabled: this.getConsentStatus(),
      domain: import.meta.env.VITE_ANALYTICS_DOMAIN || window.location.hostname,
      apiHost: import.meta.env.VITE_ANALYTICS_API_HOST || 'https://plausible.io',
      trackLocalhost: import.meta.env.DEV,
    };
  }

  /**
   * Initialize analytics service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Check if analytics is enabled by user consent
    if (!this.config.enabled) {
      // eslint-disable-next-line no-console
      console.info('[Analytics] User has opted out');
      return;
    }

    // Skip in localhost unless explicitly enabled
    if (window.location.hostname === 'localhost' && !this.config.trackLocalhost) {
      // eslint-disable-next-line no-console
      console.info('[Analytics] Skipping on localhost');
      return;
    }

    try {
      // Load Plausible script
      await this.loadPlausibleScript();
      this.isInitialized = true;

      // Process queued events
      this.processEventQueue();

      // eslint-disable-next-line no-console
      console.info('[Analytics] Initialized successfully');
    } catch (error) {
      console.error('[Analytics] Failed to initialize:', error);
    }
  }

  /**
   * Load Plausible analytics script
   */
  private async loadPlausibleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.plausibleLoaded) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.defer = true;
      script.async = true;
      script.setAttribute('data-domain', this.config.domain!);
      script.src = `${this.config.apiHost}/js/script.js`;

      script.onload = () => {
        this.plausibleLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Plausible script'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Track an analytics event
   */
  track(event: AnalyticsEvent | string, properties?: AnalyticsProperties): void {
    if (!this.config.enabled) return;

    // Queue event if not initialized yet
    if (!this.isInitialized) {
      this.eventQueue.push({ event, props: properties });
      return;
    }

    try {
      // Send to Plausible
      if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible(event, { props: properties });
      }

      // Log in development
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.info(`[Analytics] ${event}`, properties);
      }
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error);
    }
  }

  /**
   * Track funnel stage
   */
  trackFunnel(stage: FunnelStage, properties?: AnalyticsProperties): void {
    this.track(`funnel:${stage}`, properties);
  }

  /**
   * Track page view
   */
  trackPageView(page?: string): void {
    if (!this.config.enabled || !this.isInitialized) return;

    try {
      if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible('pageview', {
          props: page ? { page } : undefined
        });
      }
    } catch (error) {
      console.error('[Analytics] Failed to track page view:', error);
    }
  }

  /**
   * Process queued events
   */
  private processEventQueue(): void {
    while (this.eventQueue.length > 0) {
      const { event, props } = this.eventQueue.shift()!;
      this.track(event, props);
    }
  }

  /**
   * Get user consent status from localStorage
   */
  private getConsentStatus(): boolean {
    try {
      const consent = localStorage.getItem('analytics_consent');
      return consent === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Set user consent status
   */
  setConsent(enabled: boolean): void {
    try {
      localStorage.setItem('analytics_consent', String(enabled));
      this.config.enabled = enabled;

      if (enabled && !this.isInitialized) {
        this.initialize();
      }

      // eslint-disable-next-line no-console
      console.info(`[Analytics] Consent ${enabled ? 'granted' : 'revoked'}`);
    } catch (error) {
      console.error('[Analytics] Failed to save consent:', error);
    }
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Opt out of analytics
   */
  optOut(): void {
    this.setConsent(false);
    this.isInitialized = false;
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Convenience functions
export const trackEvent = (event: AnalyticsEvent | string, properties?: AnalyticsProperties) =>
  analytics.track(event, properties);

export const trackFunnel = (stage: FunnelStage, properties?: AnalyticsProperties) =>
  analytics.trackFunnel(stage, properties);

export const trackPageView = (page?: string) =>
  analytics.trackPageView(page);

export const setAnalyticsConsent = (enabled: boolean) =>
  analytics.setConsent(enabled);

export const isAnalyticsEnabled = () =>
  analytics.isEnabled();
