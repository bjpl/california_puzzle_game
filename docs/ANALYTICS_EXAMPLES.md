# Analytics Integration Examples

This document provides practical examples of how to integrate analytics tracking throughout the California Counties Puzzle Game.

## Table of Contents

1. [Basic Event Tracking](#basic-event-tracking)
2. [Game Flow Tracking](#game-flow-tracking)
3. [Touch & Gesture Tracking](#touch--gesture-tracking)
4. [Accessibility Tracking](#accessibility-tracking)
5. [Performance Tracking](#performance-tracking)
6. [User Behavior Funnels](#user-behavior-funnels)

## Basic Event Tracking

### Track Game Start

```typescript
import { trackEvent, AnalyticsEvent } from '../services/analytics';

function startGame(difficulty: string, mode: string) {
  // Track the event
  trackEvent(AnalyticsEvent.GAME_START, {
    difficulty,
    mode,
    timestamp: Date.now(),
  });

  // Continue with game logic...
}
```

### Track Game Completion

```typescript
function completeGame(stats: GameStats) {
  trackEvent(AnalyticsEvent.GAME_COMPLETE, {
    duration: stats.duration,
    score: stats.score,
    hintsUsed: stats.hintsUsed,
    attempts: stats.attempts,
    difficulty: stats.difficulty,
  });
}
```

## Game Flow Tracking

### Track County Placement

```typescript
function handleCountyDrop(countyId: string, isCorrect: boolean) {
  trackEvent(AnalyticsEvent.COUNTY_PLACED, {
    countyId,
    isCorrect,
    attempts: placementAttempts[countyId],
  });

  if (isCorrect) {
    // Update funnel
    const progress = (correctCount / totalCounties) * 100;

    if (progress === 100) {
      trackFunnel(FunnelStage.GAME_COMPLETE);
    } else if (progress >= 50 && !halfwayTracked) {
      trackFunnel(FunnelStage.HALF_COMPLETE);
      halfwayTracked = true;
    }
  }
}
```

### Track Hint Usage

```typescript
function showHint(hintType: 'visual' | 'geographic' | 'neighbor') {
  trackEvent(AnalyticsEvent.HINT_USED, {
    type: hintType,
    remainingHints: hintsLeft,
    gameProgress: (placedCounties / totalCounties) * 100,
  });
}
```

## Touch & Gesture Tracking

### Track Touch Interactions

```typescript
import { trackEvent, AnalyticsEvent } from '../services/analytics';

// Single tap
function handleTap(element: string) {
  trackEvent(AnalyticsEvent.TAP_INTERACTION, {
    element,
    position: 'game-area',
  });
}

// Double tap
function handleDoubleTap(action: string) {
  trackEvent(AnalyticsEvent.DOUBLE_TAP, {
    action,
    feature: 'zoom-toggle',
  });
}
```

### Track Drag & Drop

```typescript
function handleDragStart(countyId: string) {
  trackEvent(AnalyticsEvent.DRAG_START, {
    countyId,
    source: 'county-list',
  });

  dragStartTime = Date.now();
}

function handleDragEnd(countyId: string, success: boolean) {
  const duration = Date.now() - dragStartTime;

  trackEvent(AnalyticsEvent.DRAG_END, {
    countyId,
    success,
    duration,
  });
}
```

### Track Swipe Gestures

```typescript
function handleSwipe(direction: 'left' | 'right' | 'up' | 'down') {
  trackEvent(AnalyticsEvent.SWIPE_GESTURE, {
    direction,
    context: 'study-mode',
    speed: swipeVelocity,
  });
}
```

### Track Pinch Zoom

```typescript
function handlePinchZoom(scale: number) {
  trackEvent(AnalyticsEvent.PINCH_ZOOM, {
    scale,
    direction: scale > previousScale ? 'in' : 'out',
  });

  previousScale = scale;
}
```

## Accessibility Tracking

### Track Screen Reader Usage

```typescript
import { useEffect } from 'react';

function useScreenReaderDetection() {
  useEffect(() => {
    // Detect if screen reader is active
    const isScreenReaderActive =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.body.classList.contains('screen-reader-active');

    if (isScreenReaderActive) {
      trackEvent(AnalyticsEvent.SCREEN_READER_USED, {
        detected: true,
      });
    }
  }, []);
}
```

### Track Accessibility Features

```typescript
function toggleHighContrast(enabled: boolean) {
  setHighContrast(enabled);

  trackEvent(AnalyticsEvent.HIGH_CONTRAST_ENABLED, {
    enabled,
    source: 'accessibility-menu',
  });
}

function toggleReducedMotion(enabled: boolean) {
  setReducedMotion(enabled);

  trackEvent(AnalyticsEvent.REDUCED_MOTION_ENABLED, {
    enabled,
    automatic: wasAutoDetected,
  });
}
```

### Track Keyboard Navigation

```typescript
function handleKeyboardNavigation(key: string, action: string) {
  trackEvent(AnalyticsEvent.KEYBOARD_NAVIGATION, {
    key,
    action,
    element: document.activeElement?.tagName,
  });
}
```

## Performance Tracking

### Monitor Component Performance

```typescript
import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring';

function GameMap() {
  const { measureInteraction, mark, measure } = usePerformanceMonitoring();

  const handleCountyRender = async (counties: County[]) => {
    await measureInteraction('render_counties', async () => {
      // Render counties
      counties.forEach(renderCounty);
    });
  };

  const handleMapLoad = () => {
    mark('map_load_complete');
    const duration = measure('map_load', 'map_init', 'map_load_complete');

    if (duration > 3000) {
      trackEvent(AnalyticsEvent.SLOW_PERFORMANCE, {
        operation: 'map_load',
        duration,
      });
    }
  };

  return <div>{/* Map UI */}</div>;
}
```

### Track Low FPS

```typescript
function GameContainer() {
  const { metrics } = usePerformanceMonitoring({
    enableFpsMonitoring: true,
    fpsThreshold: 30,
  });

  useEffect(() => {
    if (metrics.avgFps < 30) {
      // FPS is too low
      trackEvent(AnalyticsEvent.LOW_FPS, {
        avgFps: metrics.avgFps,
        currentFps: metrics.fps,
        memoryUsage: metrics.memoryUsage,
      });
    }
  }, [metrics]);
}
```

## User Behavior Funnels

### Game Completion Funnel

```typescript
import { trackFunnel, FunnelStage } from '../services/analytics';

function GameFlow() {
  // 1. Game loads
  useEffect(() => {
    trackFunnel(FunnelStage.GAME_LOAD);
  }, []);

  // 2. User starts game
  const startGame = () => {
    trackFunnel(FunnelStage.GAME_START);
  };

  // 3. First county placed
  const handleFirstCounty = () => {
    if (placedCount === 1) {
      trackFunnel(FunnelStage.FIRST_COUNTY_PLACED);
    }
  };

  // 4. Half complete
  const checkProgress = () => {
    const progress = (placedCount / totalCounties) * 100;

    if (progress >= 50 && !halfwayReached) {
      trackFunnel(FunnelStage.HALF_COMPLETE);
      halfwayReached = true;
    }
  };

  // 5. Game complete
  const handleComplete = () => {
    trackFunnel(FunnelStage.GAME_COMPLETE, {
      duration: gameTime,
      score: finalScore,
    });
  };
}
```

### Study Mode Funnel

```typescript
function StudyMode() {
  // 1. Study mode started
  useEffect(() => {
    trackFunnel(FunnelStage.STUDY_START);
  }, []);

  // 2. Quiz started
  const startQuiz = () => {
    trackFunnel(FunnelStage.QUIZ_START);
  };

  // 3. Quiz completed
  const completeQuiz = (results: QuizResults) => {
    trackFunnel(FunnelStage.QUIZ_COMPLETE, {
      score: results.score,
      correctAnswers: results.correct,
      totalQuestions: results.total,
    });
  };
}
```

## Real-World Component Examples

### County Card Component

```typescript
import { trackEvent, AnalyticsEvent } from '../services/analytics';

function CountyCard({ county }: { county: County }) {
  const handleDragStart = () => {
    trackEvent(AnalyticsEvent.DRAG_START, {
      countyId: county.id,
      countyName: county.name,
    });
  };

  const handleClick = () => {
    trackEvent(AnalyticsEvent.TAP_INTERACTION, {
      element: 'county-card',
      countyId: county.id,
    });
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      {county.name}
    </div>
  );
}
```

### Settings Component

```typescript
function SettingsMenu() {
  const handleThemeToggle = (isDark: boolean) => {
    trackEvent(AnalyticsEvent.THEME_TOGGLE, {
      theme: isDark ? 'dark' : 'light',
      automatic: false,
    });
  };

  const handleSoundToggle = (enabled: boolean) => {
    trackEvent(AnalyticsEvent.SOUND_TOGGLE, {
      enabled,
      source: 'settings-menu',
    });
  };

  const handleDifficultyChange = (difficulty: string) => {
    trackEvent(AnalyticsEvent.DIFFICULTY_CHANGE, {
      oldDifficulty: currentDifficulty,
      newDifficulty: difficulty,
    });
  };

  return (
    <div>
      {/* Settings UI */}
    </div>
  );
}
```

## Error Tracking Examples

### Capture Component Error

```typescript
import { captureError } from '../services/errorReporting';

function CountyMap() {
  try {
    // Risky operation
    renderComplexMap(countyData);
  } catch (error) {
    captureError(error as Error, {
      category: 'map_rendering',
      countyCount: countyData.length,
      devicePixelRatio: window.devicePixelRatio,
    });

    // Fallback UI
    return <ErrorState />;
  }
}
```

### Track Load Failures

```typescript
async function loadCountyData() {
  try {
    const data = await fetch('/api/counties');
    return await data.json();
  } catch (error) {
    captureError(error as Error, {
      category: 'data_loading',
      endpoint: '/api/counties',
    });

    trackEvent(AnalyticsEvent.LOAD_ERROR, {
      resource: 'county-data',
      error: error.message,
    });

    throw error;
  }
}
```

## Best Practices

### 1. Track User Journey

```typescript
// Track every major step
function GameSession() {
  useEffect(() => {
    trackFunnel(FunnelStage.GAME_LOAD);

    return () => {
      // Track session end
      trackEvent('session_end', {
        duration: sessionDuration,
        pagesVisited: pageCount,
      });
    };
  }, []);
}
```

### 2. Include Context

```typescript
// Always include relevant context
trackEvent(AnalyticsEvent.COUNTY_PLACED, {
  countyId,
  isCorrect,
  attempts,
  // Context
  gameMode: currentMode,
  difficulty: currentDifficulty,
  gameProgress: progressPercentage,
  hintsUsed: totalHintsUsed,
});
```

### 3. Measure Performance Impact

```typescript
const { measureInteraction } = usePerformanceMonitoring();

async function expensiveOperation() {
  await measureInteraction('heavy_computation', async () => {
    // Operation that might be slow
    await processLargeDataset();
  });
}
```

### 4. Respect User Privacy

```typescript
// NEVER track PII
trackEvent(AnalyticsEvent.GAME_COMPLETE, {
  score: finalScore,
  // ❌ DON'T: username, email, location
  // ✅ DO: anonymous metrics only
});
```

## Testing Analytics

### Test in Development

```typescript
if (import.meta.env.DEV) {
  // Analytics logs to console in dev mode
  trackEvent(AnalyticsEvent.GAME_START, { test: true });
  // Check console for output
}
```

### Verify Events

```bash
# Enable analytics in dev
VITE_DEV_ANALYTICS=true npm run dev

# Open browser console
# Look for: [Analytics] game_start { test: true }
```

## Resources

- [Analytics Service](../src/services/analytics.ts)
- [Performance Hook](../src/hooks/usePerformanceMonitoring.ts)
- [Setup Guide](./ANALYTICS_SETUP.md)
- [Privacy Policy](./PRIVACY_POLICY.md)
