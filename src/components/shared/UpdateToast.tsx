import { useEffect, useState } from 'react';
import { activateUpdate } from '@/utils/sw-registration';

/**
 * UpdateToast Component
 *
 * Purpose: Non-intrusive banner notification for PWA updates
 * Features:
 * - Shows when service worker has an update available
 * - "Refresh Now" button to activate update immediately
 * - "Remind Me Later" button to dismiss
 * - Smooth fade in/out transitions
 * - Auto-dismiss after 10 seconds if no action
 * - Dark mode support
 * - Keyboard accessible (Tab navigation, Enter/Escape)
 * - ARIA labels for screen readers
 *
 * Integration: Listens for 'swUpdateAvailable' custom event from sw-registration.ts
 */

export function UpdateToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let dismissTimer: number | undefined;

    const handleUpdateAvailable = () => {
      setIsVisible(true);
      setIsExiting(false);

      // Auto-dismiss after 10 seconds
      dismissTimer = window.setTimeout(() => {
        handleDismiss();
      }, 10000);
    };

    // Listen for service worker update event
    window.addEventListener('swUpdateAvailable', handleUpdateAvailable);

    return () => {
      window.removeEventListener('swUpdateAvailable', handleUpdateAvailable);
      if (dismissTimer) {
        clearTimeout(dismissTimer);
      }
    };
  }, []);

  const handleRefresh = () => {
    setIsExiting(true);
    // Wait for exit animation before activating update
    setTimeout(() => {
      activateUpdate();
      // Service worker will reload the page automatically
    }, 200);
  };

  const handleDismiss = () => {
    setIsExiting(true);
    // Wait for exit animation before hiding
    setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: 'refresh' | 'dismiss') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action === 'refresh' ? handleRefresh() : handleDismiss();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleDismiss();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`
        fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999]
        w-[calc(100%-2rem)] max-w-md
        transition-all duration-200 ease-out
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
      `}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
            Update Available
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            A new version is ready. Refresh to update.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 gap-2">
          <button
            onClick={handleRefresh}
            onKeyDown={(e) => handleKeyDown(e, 'refresh')}
            className="
              px-3 py-1.5 rounded-md text-xs font-medium
              bg-blue-600 hover:bg-blue-700
              dark:bg-blue-500 dark:hover:bg-blue-600
              text-white
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              dark:focus:ring-offset-gray-800
            "
            aria-label="Refresh now to apply update"
          >
            Refresh Now
          </button>
          <button
            onClick={handleDismiss}
            onKeyDown={(e) => handleKeyDown(e, 'dismiss')}
            className="
              px-3 py-1.5 rounded-md text-xs font-medium
              bg-gray-100 hover:bg-gray-200
              dark:bg-gray-700 dark:hover:bg-gray-600
              text-gray-700 dark:text-gray-200
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
              dark:focus:ring-offset-gray-800
            "
            aria-label="Remind me later"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdateToast;
