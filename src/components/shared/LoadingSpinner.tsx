/**
 * LoadingSpinner Component
 *
 * Purpose: Displays a loading spinner with optional message
 * Used by: Lazy loaded routes and components
 *
 * Features:
 * - Animated spinner
 * - Customizable message
 * - Accessible loading state
 * - Minimal bundle size
 */

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message = 'Loading...', fullScreen = true }: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass} role="status" aria-live="polite">
      <div className="text-center">
        <div
          className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
          aria-hidden="true"
        />
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
        <span className="sr-only">Loading content</span>
      </div>
    </div>
  );
}

export default LoadingSpinner;
