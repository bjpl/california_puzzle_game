# Error Handling Guide

## Overview

This application implements React Error Boundaries to provide graceful error recovery and prevent full application crashes. Error boundaries catch JavaScript errors anywhere in the component tree, log those errors, and display a fallback UI.

## Available Error Boundaries

### 1. ErrorBoundary (Base)

The base error boundary component provides general-purpose error handling for any React component.

**Location**: `src/components/shared/ErrorBoundary.tsx`

**Usage**:
```tsx
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

function MyComponent() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

**Features**:
- Catches all JavaScript errors in child components
- Displays user-friendly fallback UI
- Logs errors to console (and can be extended to external services)
- Provides "Try Again" and "Go Home" recovery options
- Shows error details in development mode only

**Custom Fallback**:
```tsx
<ErrorBoundary fallback={<CustomErrorUI />}>
  <MyComponent />
</ErrorBoundary>
```

**Error Callback**:
```tsx
<ErrorBoundary onError={(error, errorInfo) => {
  // Custom error handling
  sendToErrorTracking(error, errorInfo);
}}>
  <MyComponent />
</ErrorBoundary>
```

### 2. MapErrorBoundary

Specialized error boundary for map rendering components with map-specific fallback UI.

**Location**: `src/components/map/MapErrorBoundary.tsx`

**Usage**:
```tsx
import { MapErrorBoundary } from '@/components/map/MapErrorBoundary';

function GameMap() {
  return (
    <MapErrorBoundary>
      <CaliforniaMapSimple />
    </MapErrorBoundary>
  );
}
```

**Features**:
- Map-specific error messages
- Optimized fallback UI for map container
- Automatic error logging with `mapLogger`
- Provides page reload option

### 3. StudyErrorBoundary

Specialized error boundary for study mode with progress preservation.

**Location**: `src/components/study/StudyErrorBoundary.tsx`

**Usage**:
```tsx
import { StudyErrorBoundary } from '@/components/study/StudyErrorBoundary';

function StudyFeature() {
  return (
    <StudyErrorBoundary onReset={() => resetStudyState()}>
      <EnhancedStudyMode />
    </StudyErrorBoundary>
  );
}
```

**Features**:
- Preserves user study progress in localStorage
- Study-mode specific error messages
- Optional reset callback for cleanup
- Reassures users their progress is saved

## Integration Points

### App-Level Protection

The entire application is wrapped with an ErrorBoundary in `src/App.tsx`:

```tsx
function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <GameContainer />
      </GameProvider>
    </ErrorBoundary>
  );
}
```

This catches any top-level errors and prevents the entire app from crashing.

### Map Protection

Map components are wrapped in `src/components/game/GameContainer.tsx`:

```tsx
<MapErrorBoundary>
  <CaliforniaMapSimple isDragging={isDragging} />
</MapErrorBoundary>
```

### Study Mode Protection

Study mode is protected in two locations:
1. Initial study mode rendering (before game start)
2. Portal-rendered study mode (during game)

```tsx
<StudyErrorBoundary>
  <Suspense fallback={<LoadingSpinner />}>
    <EnhancedStudyMode />
  </Suspense>
</StudyErrorBoundary>
```

## When to Use Error Boundaries

### Required

- **Top-level app wrapper** - Always wrap your entire app
- **Complex features** - Features like maps, study mode, game logic
- **Third-party components** - Wrap components from external libraries
- **Lazy-loaded components** - Wrap Suspense boundaries

### Optional but Recommended

- **Data-heavy components** - Components with complex state or data fetching
- **User-generated content** - Components rendering user input
- **Experimental features** - New features that might be unstable

### Not Needed

- **Simple presentational components** - Static UI components
- **Already wrapped components** - Don't nest error boundaries unnecessarily
- **Event handlers** - Error boundaries don't catch errors in event handlers (use try/catch instead)

## Error Boundary Limitations

Error boundaries **do NOT catch** errors in:

1. **Event handlers** - Use try/catch instead:
```tsx
function handleClick() {
  try {
    dangerousOperation();
  } catch (error) {
    logger.error('Event handler error:', error);
    showErrorToast('Operation failed');
  }
}
```

2. **Asynchronous code** - Handle promises properly:
```tsx
async function fetchData() {
  try {
    const data = await fetch('/api/data');
    return data.json();
  } catch (error) {
    logger.error('Async error:', error);
    throw error; // Re-throw to be caught by error boundary
  }
}
```

3. **Server-side rendering** - Only works in client-side React

4. **Errors thrown in the error boundary itself** - Propagates to parent

## Error Logging

All error boundaries automatically log errors using the logger utility:

```tsx
import { logger, mapLogger, studyLogger } from '@/utils/logger';

// Logged automatically by error boundaries
logger.error('ErrorBoundary caught error:', error, errorInfo);
mapLogger.error('Map rendering error:', error, errorInfo);
studyLogger.error('Study mode error:', error, errorInfo);
```

### External Error Tracking

To integrate with error tracking services (Sentry, LogRocket, etc.), modify the `componentDidCatch` method in `ErrorBoundary.tsx`:

```tsx
componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  logger.error('ErrorBoundary caught error:', error, errorInfo);

  // Send to error tracking service
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    });
  }

  this.props.onError?.(error, errorInfo);
}
```

## Best Practices

### 1. Strategic Placement

Place error boundaries at strategic points in your component tree:

```tsx
<ErrorBoundary> {/* Top-level */}
  <Header />
  <MapErrorBoundary> {/* Feature-level */}
    <GameMap />
  </MapErrorBoundary>
  <StudyErrorBoundary> {/* Feature-level */}
    <StudyMode />
  </StudyErrorBoundary>
  <Footer />
</ErrorBoundary>
```

### 2. Meaningful Error Messages

Provide context-specific error messages:

```tsx
// Good
<MapErrorBoundary>
  <CaliforniaMap />
</MapErrorBoundary>
// Shows: "Map failed to load"

// Better than
<ErrorBoundary>
  <CaliforniaMap />
</ErrorBoundary>
// Shows: "Something went wrong"
```

### 3. User Recovery Options

Always provide users with recovery options:
- "Try Again" - Resets error state
- "Go Home" - Returns to safe state
- "Contact Support" - For critical errors

### 4. Development vs Production

Show different information based on environment:

```tsx
{import.meta.env.DEV && error && (
  <details>
    <summary>Error details (dev only)</summary>
    <pre>{error.toString()}</pre>
    <pre>{error.stack}</pre>
  </details>
)}
```

### 5. Preserve User Data

For features with user progress, preserve data before showing error:

```tsx
componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  // Save user progress
  try {
    const currentProgress = localStorage.getItem('userProgress');
    if (currentProgress) {
      logger.info('Progress preserved:', currentProgress);
    }
  } catch (e) {
    logger.error('Failed to preserve progress:', e);
  }

  logger.error('Error caught:', error, errorInfo);
}
```

## Testing Error Boundaries

Test error boundaries to ensure they work correctly:

```tsx
it('catches errors and displays fallback', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

See `tests/unit/components/shared/ErrorBoundary.test.tsx` for complete test examples.

## Troubleshooting

### Error Boundary Not Catching Errors

1. **Check if error is in event handler** - Use try/catch instead
2. **Check if error is async** - Ensure promises are properly handled
3. **Verify error boundary is mounted** - Check component tree
4. **Check React version** - Error boundaries require React 16+

### Infinite Error Loops

If an error boundary keeps triggering:

1. **Check the fallback component** - Ensure it doesn't throw errors
2. **Check error logging** - Logging itself shouldn't cause errors
3. **Add error boundary around fallback** - Use parent error boundary

### Users Can't Recover

1. **Provide clear actions** - "Try Again" and "Go Home" buttons
2. **Preserve state** - Save user progress before crash
3. **Log errors** - Help debugging by capturing error info
4. **Test recovery** - Ensure reset functionality works

## Future Enhancements

Consider these improvements:

1. **Error tracking integration** - Sentry, LogRocket, etc.
2. **User feedback** - Allow users to report errors
3. **Automatic recovery** - Retry failed operations automatically
4. **Error analytics** - Track error patterns and frequencies
5. **Graceful degradation** - Partial functionality instead of full failure

## Resources

- [React Error Boundaries Documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Error Handling Best Practices](https://kentcdodds.com/blog/use-react-error-boundary-to-handle-errors-in-react)
- [Sentry React Integration](https://docs.sentry.io/platforms/javascript/guides/react/)
