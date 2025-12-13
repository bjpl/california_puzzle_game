/**
 * useInstallPrompt Hook
 *
 * Manages PWA installation prompt with platform detection and state management.
 * Handles beforeinstallprompt event, tracks installation metrics, and provides
 * platform-specific installation flows.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

/**
 * Platform types for PWA installation
 */
export type InstallPlatform = 'ios' | 'android' | 'desktop' | 'unsupported';

/**
 * Installation state
 */
export type InstallState = 'idle' | 'prompted' | 'installing' | 'installed' | 'dismissed';

/**
 * Installation metrics for analytics
 */
interface InstallMetrics {
  displayCount: number;
  lastDisplayed: number | null;
  dismissedCount: number;
  lastDismissed: number | null;
  installSuccess: boolean;
  installDate: number | null;
}

/**
 * BeforeInstallPromptEvent interface
 * Chrome/Edge specific event for PWA installation
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * Hook return type
 */
interface UseInstallPromptReturn {
  /** Current installation state */
  installState: InstallState;
  /** Detected platform */
  platform: InstallPlatform;
  /** Whether the install prompt can be shown */
  canInstall: boolean;
  /** Whether the app is already installed */
  isInstalled: boolean;
  /** Whether the prompt was dismissed */
  isDismissed: boolean;
  /** Show the install prompt */
  showInstallPrompt: () => Promise<boolean>;
  /** Dismiss the install prompt */
  dismissPrompt: () => void;
  /** Reset dismissal state */
  resetDismissal: () => void;
  /** Installation metrics */
  metrics: InstallMetrics;
}

const STORAGE_KEY = 'pwa_install_metrics';
const DISMISSAL_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Detect the current platform
 */
function detectPlatform(): InstallPlatform {
  if (typeof window === 'undefined') return 'unsupported';

  const userAgent = navigator.userAgent.toLowerCase();
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  // Check if already installed
  // Navigator with standalone property for iOS Safari
  interface NavigatorStandalone extends Navigator {
    standalone?: boolean;
  }
  if (isStandalone || (window.navigator as NavigatorStandalone).standalone) {
    return 'desktop'; // Will be marked as installed
  }

  // iOS detection
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }

  // Android detection
  if (/android/.test(userAgent)) {
    return 'android';
  }

  // Desktop browsers (Chrome, Edge, etc.)
  if (/chrome|chromium|edg/.test(userAgent)) {
    return 'desktop';
  }

  return 'unsupported';
}

/**
 * Check if app is installed
 */
function checkIsInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  // Navigator with standalone property for iOS Safari
  interface NavigatorStandalone extends Navigator {
    standalone?: boolean;
  }
  const isIosStandalone = (window.navigator as NavigatorStandalone).standalone === true;

  return isStandalone || isIosStandalone;
}

/**
 * Load metrics from localStorage
 */
function loadMetrics(): InstallMetrics {
  try {
    // eslint-disable-next-line no-restricted-globals -- Required for PWA install metrics persistence
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    logger.warn('Failed to load install metrics:', error);
  }

  return {
    displayCount: 0,
    lastDisplayed: null,
    dismissedCount: 0,
    lastDismissed: null,
    installSuccess: false,
    installDate: null,
  };
}

/**
 * Save metrics to localStorage
 */
function saveMetrics(metrics: InstallMetrics): void {
  try {
    // eslint-disable-next-line no-restricted-globals -- Required for PWA install metrics persistence
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
  } catch (error) {
    logger.warn('Failed to save install metrics:', error);
  }
}

/**
 * PWA Install Prompt Hook
 */
export function useInstallPrompt(): UseInstallPromptReturn {
  const [installState, setInstallState] = useState<InstallState>('idle');
  const [platform] = useState<InstallPlatform>(detectPlatform);
  const [isInstalled, setIsInstalled] = useState(checkIsInstalled);
  const [metrics, setMetrics] = useState<InstallMetrics>(loadMetrics);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // Check if prompt should be shown (not dismissed within last 7 days)
  const isDismissed =
    metrics.lastDismissed !== null && Date.now() - metrics.lastDismissed < DISMISSAL_DURATION;

  const canInstall =
    !isInstalled && !isDismissed && (platform === 'ios' || deferredPromptRef.current !== null);

  /**
   * Update metrics
   */
  const updateMetrics = useCallback((updates: Partial<InstallMetrics>) => {
    setMetrics((prev) => {
      const updated = { ...prev, ...updates };
      saveMetrics(updated);
      return updated;
    });
  }, []);

  /**
   * Show install prompt
   */
  const showInstallPrompt = useCallback(async (): Promise<boolean> => {
    // Update display metrics
    updateMetrics({
      displayCount: metrics.displayCount + 1,
      lastDisplayed: Date.now(),
    });

    // iOS uses manual instructions, so just return true
    if (platform === 'ios') {
      setInstallState('prompted');
      return true;
    }

    // Android/Desktop use beforeinstallprompt event
    if (!deferredPromptRef.current) {
      logger.warn('Install prompt not available');
      return false;
    }

    try {
      setInstallState('installing');

      // Show the browser's install prompt
      await deferredPromptRef.current.prompt();

      // Wait for user choice
      const choiceResult = await deferredPromptRef.current.userChoice;

      if (choiceResult.outcome === 'accepted') {
        logger.info('PWA install accepted', { platform: choiceResult.platform });
        setInstallState('installed');
        setIsInstalled(true);
        updateMetrics({
          installSuccess: true,
          installDate: Date.now(),
        });
        deferredPromptRef.current = null;
        return true;
      } else {
        logger.info('PWA install dismissed by user');
        setInstallState('dismissed');
        return false;
      }
    } catch (error) {
      logger.error('Error showing install prompt:', error);
      setInstallState('idle');
      return false;
    }
  }, [platform, metrics.displayCount, updateMetrics]);

  /**
   * Dismiss the prompt for 7 days
   */
  const dismissPrompt = useCallback(() => {
    updateMetrics({
      dismissedCount: metrics.dismissedCount + 1,
      lastDismissed: Date.now(),
    });
    setInstallState('dismissed');
  }, [metrics.dismissedCount, updateMetrics]);

  /**
   * Reset dismissal state (for testing or user preference)
   */
  const resetDismissal = useCallback(() => {
    updateMetrics({
      lastDismissed: null,
    });
    setInstallState('idle');
  }, [updateMetrics]);

  /**
   * Listen for beforeinstallprompt event (Android/Desktop)
   */
  useEffect(() => {
    if (platform === 'ios' || isInstalled) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default mini-infobar from appearing
      e.preventDefault();

      // Store the event for later use
      deferredPromptRef.current = e as BeforeInstallPromptEvent;

      logger.info('beforeinstallprompt event captured', { platform });
      setInstallState('idle');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [platform, isInstalled]);

  /**
   * Listen for app installed event
   */
  useEffect(() => {
    const handleAppInstalled = () => {
      logger.info('PWA installed successfully');
      setIsInstalled(true);
      setInstallState('installed');
      updateMetrics({
        installSuccess: true,
        installDate: Date.now(),
      });
      deferredPromptRef.current = null;
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [updateMetrics]);

  /**
   * Check for display mode changes (installation)
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setInstallState('installed');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return {
    installState,
    platform,
    canInstall,
    isInstalled,
    isDismissed,
    showInstallPrompt,
    dismissPrompt,
    resetDismissal,
    metrics,
  };
}
