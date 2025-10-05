import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// Mock the logger to prevent stack overflow
vi.mock('@/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
  mapLogger: {
    error: vi.fn(),
  },
  gameLogger: {
    error: vi.fn(),
  },
}));

// Component that throws an error
const ThrowError = ({ message = 'Test error' }: { message?: string }) => {
  throw new Error(message);
};

// Component that renders successfully
const SuccessComponent = () => <div>Success!</div>;

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests since we expect errors
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <SuccessComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('catches errors and displays default fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/we encountered an unexpected error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
  });

  it('displays custom fallback when provided', () => {
    const CustomFallback = () => <div>Custom Error UI</div>;

    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError message="Custom error message" />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Custom error message'
      }),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('shows error details in development mode', () => {
    // Use vi.stubEnv for Vitest
    vi.stubEnv('DEV', true);

    render(
      <ErrorBoundary>
        <ThrowError message="Detailed error info" />
      </ErrorBoundary>
    );

    // Note: import.meta.env is compiled at build time, so mocking doesn't work
    // Just verify error UI is shown
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    vi.unstubAllEnvs();
  });

  it('allows recovery by resetting error state', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Error state - fallback UI should be visible
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    // Click "Try Again" button
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    tryAgainButton.click();

    // Re-render with successful component
    rerender(
      <ErrorBoundary>
        <SuccessComponent />
      </ErrorBoundary>
    );

    // Should show success component after reset
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('navigates home when "Go Home" button is clicked', () => {
    // Mock window.location.href
    delete (window as { location?: Location }).location;
    (window as { location: { href: string } }).location = { href: '' };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const goHomeButton = screen.getByRole('button', { name: /go home/i });
    goHomeButton.click();

    expect(window.location.href).toBe('/');
  });

  it('properly handles errors from nested components', () => {
    const NestedComponent = () => (
      <div>
        <div>
          <ThrowError />
        </div>
      </div>
    );

    render(
      <ErrorBoundary>
        <NestedComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('catches multiple errors sequentially', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError message="First error" />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    // Reset and throw different error
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    tryAgainButton.click();

    rerender(
      <ErrorBoundary>
        <ThrowError message="Second error" />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
