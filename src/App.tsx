import { lazy, Suspense, useEffect } from 'react';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { ToastContainer } from './components/ui/ToastContainer';
import { useAuth } from './hooks/useAuth';
// Migrated from monolithic gameStore to domain stores
import { useSettingsStore } from './stores/gameSettingsStore';
import { setupAuthListeners, setupVisibilityRefresh, setupFocusRefresh } from './stores/authStore';
import './styles/globals.css';

// Accessibility components
import SkipNavigation from './components/accessibility/SkipNavigation';

// Lazy load heavy components for code splitting and improved performance
// This reduces initial bundle size by 20-30%
const GameContainer = lazy(() => import('./components/game/GameContainer'));
const UpdateToast = lazy(() => import('./components/shared/UpdateToast'));
const CookieConsent = lazy(() => import('./components/shared/CookieConsent'));
const FeedbackWidget = lazy(() => import('./components/feedback/FeedbackWidget'));
const AnalyticsProvider = lazy(() => import('./components/analytics/AnalyticsProvider'));
const SyncStatusIndicator = lazy(() =>
  import('./components/sync/SyncStatusIndicator').then((m) => ({ default: m.SyncStatusIndicator }))
);
const SecurityBadge = lazy(() =>
  import('./components/shared/SecurityBadge').then((m) => ({ default: m.SecurityBadge }))
);

/**
 * Auth Integration Component
 *
 * CONCEPT: Handle auth initialization and sync with game state
 * WHY: Keep user data in sync across stores
 * PATTERN: Effect-based initialization
 */
function AuthIntegration() {
  const { user, isAuthenticated, initialize } = useAuth();
  const setUserId = useSettingsStore((state) => state.setUserId);

  // Initialize auth on mount
  useEffect(() => {
    // Set up auth listeners (once per app lifecycle)
    setupAuthListeners();
    setupVisibilityRefresh();
    setupFocusRefresh();

    // Initialize auth system
    initialize();
  }, [initialize]);

  // Sync user ID to game store when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      setUserId(user.id);
    } else {
      setUserId(null);
    }
  }, [isAuthenticated, user, setUserId]);

  return null; // This component only handles side effects
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <AnalyticsProvider>
          <AuthIntegration />
          {/* Skip navigation for keyboard accessibility (WCAG 2.4.1) */}
          <SkipNavigation />
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
            <Suspense fallback={<LoadingSpinner />}>
              {/* Main content area with ID for skip navigation */}
              <main id="main-content" tabIndex={-1} className="flex-1">
                <GameContainer />
              </main>
              <footer className="py-4 px-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto flex justify-center">
                  <SecurityBadge />
                </div>
              </footer>
              <UpdateToast />
              <FeedbackWidget />
              <CookieConsent />
              <SyncStatusIndicator />
              <ToastContainer />
            </Suspense>
          </div>
        </AnalyticsProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
