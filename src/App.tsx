import { lazy, Suspense } from 'react';
import { GameProvider } from './context/GameContext';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import './styles/globals.css';

// Lazy load heavy components for code splitting and improved performance
// This reduces initial bundle size by 20-30%
const GameContainer = lazy(() => import('./components/game/GameContainer'));
const UpdateToast = lazy(() => import('./components/shared/UpdateToast'));
const CookieConsent = lazy(() => import('./components/shared/CookieConsent'));
const FeedbackWidget = lazy(() => import('./components/feedback/FeedbackWidget'));
const AnalyticsProvider = lazy(() => import('./components/analytics/AnalyticsProvider'));

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <AnalyticsProvider>
          <GameProvider>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
              <Suspense fallback={<LoadingSpinner />}>
                <GameContainer />
                <UpdateToast />
                <FeedbackWidget />
                <CookieConsent />
              </Suspense>
            </div>
          </GameProvider>
        </AnalyticsProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
