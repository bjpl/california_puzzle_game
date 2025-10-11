/**
 * Cookie Consent Banner
 *
 * Purpose: GDPR/CCPA compliant consent management
 * Features:
 * - Clear opt-in/opt-out
 * - Granular consent options
 * - Privacy policy link
 * - Persistent storage
 * - Accessible
 */

import { useState, useEffect } from 'react';
import { Cookie, X, Check, Settings } from 'lucide-react';
import { setAnalyticsConsent } from '../../services/analytics';
import { setErrorReportingConsent } from '../../services/errorReporting';

interface ConsentPreferences {
  analytics: boolean;
  errorReporting: boolean;
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    analytics: false,
    errorReporting: false,
  });

  /**
   * Check if consent has been given
   */
  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookie_consent');
      if (!consent) {
        // Show banner if no consent decision has been made
        setIsVisible(true);
      }
    } catch {
      // If localStorage fails, show banner
      setIsVisible(true);
    }
  }, []);

  /**
   * Accept all cookies
   */
  const acceptAll = () => {
    const allConsent: ConsentPreferences = {
      analytics: true,
      errorReporting: true,
    };

    savePreferences(allConsent);
  };

  /**
   * Reject all cookies
   */
  const rejectAll = () => {
    const noConsent: ConsentPreferences = {
      analytics: false,
      errorReporting: false,
    };

    savePreferences(noConsent);
  };

  /**
   * Save custom preferences
   */
  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  /**
   * Save preferences to storage and apply
   */
  const savePreferences = (prefs: ConsentPreferences) => {
    try {
      // Save to localStorage
      localStorage.setItem('cookie_consent', 'given');
      localStorage.setItem('consent_preferences', JSON.stringify(prefs));

      // Apply preferences
      setAnalyticsConsent(prefs.analytics);
      setErrorReportingConsent(prefs.errorReporting);

      // Hide banner
      setIsVisible(false);

      // eslint-disable-next-line no-console
      console.info('[Cookie Consent] Preferences saved:', prefs);
    } catch (error) {
      console.error('[Cookie Consent] Failed to save preferences:', error);
    }
  };

  /**
   * Toggle preference
   */
  const togglePreference = (key: keyof ConsentPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {!showDetails ? (
          /* Simple View */
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <Cookie className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>

            {/* Message */}
            <div className="flex-1">
              <h2 id="cookie-consent-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                We value your privacy
              </h2>
              <p id="cookie-consent-description" className="text-sm text-gray-600 dark:text-gray-400">
                We use cookies and similar technologies to improve your experience, analyze usage, and fix errors.
                No personal data is collected. Learn more in our{' '}
                <a
                  href="/privacy-policy"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Settings className="inline-block w-4 h-4 mr-1" />
                Customize
              </button>
              <button
                onClick={rejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Reject All
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          /* Detailed View */
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Privacy Preferences
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {/* Analytics */}
              <label className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={() => togglePreference('analytics')}
                  className="mt-1 w-5 h-5 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Analytics
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Help us understand how you use the game to improve your experience.
                    We use privacy-friendly analytics that don't track personal data.
                  </div>
                </div>
              </label>

              {/* Error Reporting */}
              <label className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.errorReporting}
                  onChange={() => togglePreference('errorReporting')}
                  className="mt-1 w-5 h-5 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Error Reporting
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically report technical errors to help us fix bugs faster.
                    No personal information is collected.
                  </div>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={rejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Reject All
              </button>
              <button
                onClick={saveCustomPreferences}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Check className="inline-block w-4 h-4 mr-1" />
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Default export for lazy loading
export default CookieConsent;
