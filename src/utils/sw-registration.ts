/**
 * Service Worker Registration Utility
 *
 * Purpose: Register and manage Service Worker lifecycle
 * Features: Auto-updates, version checking, cache control, platform detection
 *
 * Browser Support: Chrome 40+, Firefox 44+, Safari 11.1+
 * Last updated: 2025-10-09
 */

import { logger } from './logger';

const BASE_PATH = '/california_puzzle_game';
const SW_PATH = `${BASE_PATH}/sw.js`;

export interface ServiceWorkerStatus {
  supported: boolean;
  registered: boolean;
  active: boolean;
  updateAvailable: boolean;
  error?: string;
}

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register Service Worker with update handling
 *
 * CONCEPT: Service Worker lifecycle management
 * WHY: Enables offline functionality and automatic updates
 * PATTERN: Promise-based registration with event listeners
 */
export async function registerServiceWorker(): Promise<ServiceWorkerStatus> {
  const status: ServiceWorkerStatus = {
    supported: false,
    registered: false,
    active: false,
    updateAvailable: false,
  };

  // Check browser support
  if (!('serviceWorker' in navigator)) {
    logger.warn('[SW] Service Worker not supported in this browser');
    return status;
  }

  status.supported = true;

  try {
    logger.info('[SW] Registering Service Worker...');

    swRegistration = await navigator.serviceWorker.register(SW_PATH, {
      scope: BASE_PATH + '/',
    });

    status.registered = true;

    // Set up update handling
    setupUpdateHandling(swRegistration);

    // Check if SW is active
    if (swRegistration.active) {
      status.active = true;
      logger.info('[SW] Service Worker is active');
    }

    // Listen for controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      logger.info('[SW] New Service Worker activated, reloading page...');
      window.location.reload();
    });

    logger.info('[SW] Service Worker registered successfully');

    return status;
  } catch (error) {
    logger.error('[SW] Registration failed:', error);
    status.error = error instanceof Error ? error.message : 'Unknown error';
    return status;
  }
}

/**
 * Setup update handling for Service Worker
 *
 * CONCEPT: Automatic update detection and installation
 * WHY: Ensures users get latest version without manual refresh
 * PATTERN: Event-driven update flow with user notification
 */
function setupUpdateHandling(registration: ServiceWorkerRegistration) {
  // Check for updates on interval
  setInterval(
    () => {
      registration.update().catch((error) => {
        logger.error('[SW] Update check failed:', error);
      });
    },
    60 * 60 * 1000
  ); // Check every hour

  // Handle waiting Service Worker (update available)
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;

    if (!newWorker) {
      return;
    }

    logger.info('[SW] Update found, installing new version...');

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New version available, notify user
        logger.info('[SW] Update ready, waiting for activation');
        notifyUpdateAvailable();
      }
    });
  });
}

/**
 * Notify user about available update
 *
 * CONCEPT: User-friendly update prompts
 * WHY: Allows user to control when to apply updates
 * PATTERN: Custom event dispatch for UI integration
 */
function notifyUpdateAvailable() {
  // Dispatch custom event for UI to handle
  const event = new CustomEvent('swUpdateAvailable', {
    detail: {
      message: 'A new version is available. Refresh to update.',
      action: activateUpdate,
    },
  });

  window.dispatchEvent(event);
}

/**
 * Activate waiting Service Worker
 *
 * CONCEPT: Manual update activation
 * WHY: Gives user control over when to apply updates
 * PATTERN: Message passing to Service Worker
 */
export function activateUpdate() {
  if (!swRegistration || !swRegistration.waiting) {
    logger.warn('[SW] No waiting Service Worker to activate');
    return;
  }

  logger.info('[SW] Activating new Service Worker...');

  // Tell waiting SW to skip waiting and activate
  swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * Unregister Service Worker (for debugging/cleanup)
 *
 * CONCEPT: Service Worker lifecycle cleanup
 * WHY: Useful for development and troubleshooting
 * PATTERN: Async unregistration with cache cleanup
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (registration) {
      await registration.unregister();
      logger.info('[SW] Service Worker unregistered');
      return true;
    }

    return false;
  } catch (error) {
    logger.error('[SW] Unregistration failed:', error);
    return false;
  }
}

/**
 * Clear all Service Worker caches
 *
 * CONCEPT: Cache management and reset
 * WHY: Useful for development, troubleshooting, and storage cleanup
 * PATTERN: Cache API batch deletion
 */
export async function clearServiceWorkerCaches(): Promise<boolean> {
  if (!('caches' in window)) {
    return false;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));

    logger.info('[SW] All caches cleared:', cacheNames);
    return true;
  } catch (error) {
    logger.error('[SW] Cache clearing failed:', error);
    return false;
  }
}

/**
 * Send message to active Service Worker
 *
 * CONCEPT: Two-way communication with Service Worker
 * WHY: Allows app to control SW behavior (cache updates, prefetch, etc.)
 * PATTERN: Message passing API with type safety
 */
export function sendMessageToServiceWorker(message: {
  type: string;
  payload?: Record<string, unknown>;
}): void {
  if (!navigator.serviceWorker.controller) {
    logger.warn('[SW] No active Service Worker to send message to');
    return;
  }

  navigator.serviceWorker.controller.postMessage(message);
  logger.info('[SW] Message sent to Service Worker:', message.type);
}

/**
 * Prefetch geodata levels for offline use
 *
 * CONCEPT: Predictive caching for better UX
 * WHY: Pre-loads assets user is likely to need
 * PATTERN: Command pattern via SW message
 */
export function prefetchGeodata(levels: string[] = ['medium']): void {
  sendMessageToServiceWorker({
    type: 'PREFETCH_GEODATA',
    payload: { levels },
  });
}

/**
 * Get Service Worker status
 *
 * CONCEPT: Service Worker state inspection
 * WHY: Useful for debugging and status displays
 * PATTERN: Promise-based state query
 */
export async function getServiceWorkerStatus(): Promise<ServiceWorkerStatus> {
  const status: ServiceWorkerStatus = {
    supported: 'serviceWorker' in navigator,
    registered: false,
    active: false,
    updateAvailable: false,
  };

  if (!status.supported) {
    return status;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (registration) {
      status.registered = true;
      status.active = !!registration.active;
      status.updateAvailable = !!registration.waiting;
    }

    return status;
  } catch (error) {
    status.error = error instanceof Error ? error.message : 'Unknown error';
    return status;
  }
}

/**
 * Check if app is running in standalone mode (installed PWA)
 *
 * CONCEPT: PWA installation detection
 * WHY: Allows UI customization for installed vs browser mode
 * PATTERN: Media query and navigator property checks
 */
export function isStandalone(): boolean {
  // iOS Safari
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // Android Chrome
  if (
    'standalone' in navigator &&
    (navigator as unknown as Record<string, unknown>).standalone === true
  ) {
    return true;
  }

  return false;
}

/**
 * Detect platform for install instructions
 *
 * CONCEPT: Platform-specific feature detection
 * WHY: iOS and Android have different PWA installation flows
 * PATTERN: User agent parsing with fallback detection
 */
export function getPlatform(): 'ios' | 'android' | 'desktop' {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }

  if (/android/.test(userAgent)) {
    return 'android';
  }

  return 'desktop';
}

/**
 * Show install prompt (Android Chrome)
 *
 * CONCEPT: PWA install promotion
 * WHY: Encourages users to install for better experience
 * PATTERN: beforeinstallprompt event handling
 *
 * Note: iOS Safari doesn't support install prompts - must use manual "Add to Home Screen"
 */
let deferredPrompt: Event | null = null;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();

  // Stash the event so it can be triggered later
  deferredPrompt = e;

  logger.info('[PWA] Install prompt available');

  // Dispatch custom event for UI to show install button
  window.dispatchEvent(new CustomEvent('pwaInstallAvailable'));
});

export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    logger.warn('[PWA] Install prompt not available (iOS or already installed)');
    return false;
  }

  // Show the install prompt
  (deferredPrompt as BeforeInstallPromptEvent).prompt();

  // Wait for the user to respond to the prompt
  const choiceResult = await (deferredPrompt as BeforeInstallPromptEvent).userChoice;

  logger.info('[PWA] Install prompt result:', choiceResult.outcome);

  // Clear the deferred prompt
  deferredPrompt = null;

  return choiceResult.outcome === 'accepted';
}

/**
 * Track install event
 *
 * CONCEPT: PWA installation analytics
 * WHY: Understand adoption and engagement metrics
 * PATTERN: App installed event listener
 */
window.addEventListener('appinstalled', () => {
  logger.info('[PWA] App installed successfully');

  // Clear the install prompt
  deferredPrompt = null;

  // Dispatch custom event for analytics/UI
  window.dispatchEvent(new CustomEvent('pwaInstalled'));
});

/**
 * BeforeInstallPromptEvent interface
 * (Not standardized yet, but widely supported)
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}
