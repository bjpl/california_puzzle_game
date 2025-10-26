import { ReactNode } from 'react';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { mapLogger } from '@/utils/logger';

interface Props {
  children: ReactNode;
}

/**
 * MapErrorBoundary Component
 *
 * Specialized error boundary for map rendering components.
 * Provides map-specific fallback UI and error handling.
 */
export function MapErrorBoundary({ children }: Props) {
  return (
    <ErrorBoundary
      fallback={<MapErrorFallback />}
      onError={(error, errorInfo) => {
        mapLogger.error('Map rendering error:', error, errorInfo);
        // Could add map-specific error handling here
        // e.g., reset map state, clear cache, etc.
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

function MapErrorFallback() {
  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-300 dark:border-red-700">
      <div className="text-center p-6">
        <svg
          className="w-16 h-16 mx-auto text-red-400 dark:text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="mt-4 text-xl font-bold text-red-900 dark:text-red-100">
          MAP ERROR - Please screenshot this!
        </h3>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">
          There was a problem rendering the California map on mobile.
        </p>
        <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-mono bg-white dark:bg-gray-900 p-2 rounded">
          Check browser console (F12) for errors
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-3 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors font-medium"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
