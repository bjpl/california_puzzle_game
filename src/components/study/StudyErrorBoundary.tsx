import React, { ReactNode } from 'react';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { studyLogger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

/**
 * StudyErrorBoundary Component
 *
 * Specialized error boundary for study mode components.
 * Preserves user progress and provides graceful recovery options.
 */
export function StudyErrorBoundary({ children, onReset }: Props) {
  return (
    <ErrorBoundary
      fallback={<StudyErrorFallback onReset={onReset} />}
      onError={(error, errorInfo) => {
        studyLogger.error('Study mode error:', error, errorInfo);
        // Study mode specific error handling
        // e.g., save current progress before crash
        try {
          const currentProgress = localStorage.getItem('californiaStudyProgress');
          if (currentProgress) {
            studyLogger.info('Study progress preserved:', currentProgress);
          }
        } catch (e) {
          studyLogger.error('Failed to preserve study progress:', e);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

function StudyErrorFallback({ onReset }: { onReset?: () => void }) {
  const handleReset = () => {
    try {
      // Try to reset study state gracefully
      onReset?.();
    } catch (e) {
      studyLogger.error('Error during reset:', e);
    }
    // Reload page as final fallback
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-purple-100 rounded-full">
            <svg
              className="w-8 h-8 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>

          <h2 className="mt-4 text-2xl font-bold text-gray-900">Study Session Error</h2>

          <p className="mt-2 text-gray-600">
            Your study session encountered an error.
          </p>

          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              Don't worry! Your progress has been saved.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="mt-6 w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Start New Session
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="mt-3 w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
