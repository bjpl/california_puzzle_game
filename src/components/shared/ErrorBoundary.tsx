import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in child component tree and displays fallback UI.
 * Prevents entire app from crashing due to component errors.
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console and external service
    logger.error('ErrorBoundary caught error:', error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Future: Send to error tracking service (Sentry, LogRocket, etc.)
    // if (import.meta.env.PROD) {
    //   sendToErrorTracking(error, errorInfo);
    // }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
        )
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h2 className="mt-4 text-xl font-semibold text-center text-gray-900">
          Something went wrong
        </h2>

        <p className="mt-2 text-sm text-center text-gray-600">
          We encountered an unexpected error. Please try again.
        </p>

        {import.meta.env.DEV && error && (
          <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <summary className="cursor-pointer font-medium">Error details (dev only)</summary>
            <pre className="mt-2 overflow-auto">{error.toString()}</pre>
            <pre className="mt-2 overflow-auto text-xs">{error.stack}</pre>
          </details>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={resetError}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
