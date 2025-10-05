import React, { ReactNode } from 'react';
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
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center p-6">
        <svg
          className="w-16 h-16 mx-auto text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Map failed to load</h3>
        <p className="mt-2 text-sm text-gray-600">
          There was a problem rendering the California map.
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Please try reloading the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
