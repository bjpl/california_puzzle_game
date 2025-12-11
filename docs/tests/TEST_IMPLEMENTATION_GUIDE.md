# Test Implementation Quick Reference Guide

**For:** Developers implementing store architecture tests
**Created:** December 10, 2025
**Purpose:** Fast-reference guide for writing domain store tests

---

## Quick Start: Creating a Domain Store Test

### 1. File Structure

```
tests/unit/stores/study/{storeName}.test.ts
```

### 2. Test Template

```typescript
/**
 * @test {StoreName} Store
 * @description Tests {store description}
 * @coverage {what this tests}
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { use{StoreName}Store } from '../../../../src/stores/study/{storeName}';
import { storeCoordinator } from '../../../../src/stores/storeCoordinator';
import { StudyEventType } from '../../../../src/types/study-domain.types';

// Mock logger
vi.mock('../../../../src/utils/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  studyLogger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

describe('{StoreName}', () => {
  let publishSpy: vi.MockInstance;

  beforeEach(() => {
    // Reset store
    use{StoreName}Store.setState({ /* initial state */ });

    // Setup spies
    publishSpy = vi.spyOn(storeCoordinator, 'publish');

    // Clear mocks
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const state = use{StoreName}Store.getState();
      expect(state).toMatchObject({ /* expected initial state */ });
    });
  });

  describe('Actions', () => {
    it('should {action description}', () => {
      // Arrange
      const store = use{StoreName}Store.getState();

      // Act
      store.{actionName}(/* params */);

      // Assert
      expect(/* result */).toBe(/* expected */);
    });
  });

  describe('Event Publishing', () => {
    it('should publish {EVENT_TYPE} when {condition}', () => {
      // Arrange & Act
      use{StoreName}Store.getState().{actionName}();

      // Assert
      expect(publishSpy).toHaveBeenCalledWith(
        StudyEventType.{EVENT_TYPE},
        expect.objectContaining({ /* payload */ }),
        '{storeName}Store'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined inputs', () => {
      // Test null safety
    });

    it('should handle concurrent operations', () => {
      // Test race conditions
    });
  });
});
```

---

## Test Patterns by Store

### sessionStore Tests (30-40 tests)

```typescript
describe('sessionStore', () => {
  describe('Session Lifecycle', () => {
    it('should start new session');
    it('should pause active session');
    it('should resume paused session');
    it('should end session and return statistics');
    it('should prevent double-start');
    it('should prevent pause when not active');
  });

  describe('County Recording', () => {
    it('should record correct answer');
    it('should record incorrect answer');
    it('should track response time');
    it('should update session metrics');
    it('should publish COUNTY_STUDIED event');
  });

  describe('Session Metrics', () => {
    it('should calculate accuracy');
    it('should track total duration');
    it('should exclude paused duration');
    it('should count counties studied');
  });

  describe('Event Publishing', () => {
    it('should publish SESSION_STARTED on start');
    it('should publish SESSION_PAUSED on pause');
    it('should publish SESSION_RESUMED on resume');
    it('should publish SESSION_COMPLETED on end');
  });

  describe('Edge Cases', () => {
    it('should handle ending non-existent session');
    it('should handle rapid pause/resume cycles');
    it('should handle session timeout');
  });
});
```

### countyProgressStore Tests (35-45 tests)

```typescript
describe('countyProgressStore', () => {
  describe('Progress Tracking', () => {
    it('should record county study');
    it('should track correct/incorrect counts');
    it('should update average response time');
    it('should track last studied date');
  });

  describe('Mastery Level', () => {
    it('should calculate mastery from accuracy');
    it('should detect mastery level changes');
    it('should publish COUNTY_MASTERY_CHANGED event');
    it('should transition through mastery levels correctly');
  });

  describe('Response Time Analytics', () => {
    it('should calculate average response time');
    it('should track best response time');
    it('should detect improvement trends');
  });

  describe('Event Publishing', () => {
    it('should publish COUNTY_STUDIED on recordStudy');
    it('should publish COUNTY_MASTERY_CHANGED on level change');
  });
});
```

### spacedRepetitionStore Tests (40-50 tests)

```typescript
describe('spacedRepetitionStore', () => {
  describe('SM-2 Algorithm', () => {
    it('should create new card with default values');
    it('should calculate interval for quality 0-2 (incorrect)');
    it('should calculate interval for quality 3 (barely correct)');
    it('should calculate interval for quality 4-5 (correct)');
    it('should update ease factor based on quality');
    it('should reset interval on failed review');
  });

  describe('Review Queue', () => {
    it('should add due cards to queue');
    it('should sort queue by priority');
    it('should remove card after review');
    it('should detect overdue cards');
  });

  describe('Card Scheduling', () => {
    it('should schedule next review based on interval');
    it('should handle timezone correctly');
    it('should respect minimum interval');
  });

  describe('Event Publishing', () => {
    it('should publish REVIEW_COMPLETED after review');
    it('should publish REVIEW_DUE when cards are due');
  });
});
```

---

## Common Test Utilities

### Mock StoreCoordinator

```typescript
const mockStoreCoordinator = {
  publish: vi.fn(),
  subscribe: vi.fn(() => vi.fn()), // Returns unsubscribe function
  flush: vi.fn(),
  clearAll: vi.fn(),
};

vi.mock('../../../../src/stores/storeCoordinator', () => ({
  storeCoordinator: mockStoreCoordinator,
}));
```

### Mock LocalStorage

```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

beforeAll(() => {
  global.localStorage = localStorageMock;
});
```

### Date Mocking

```typescript
const mockDate = new Date('2025-12-10T12:00:00Z');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(mockDate);
});

afterEach(() => {
  vi.useRealTimers();
});
```

---

## Testing Checklist

### Before Writing Tests

- [ ] Read store implementation
- [ ] Identify all actions/methods
- [ ] List all events published
- [ ] List all events consumed
- [ ] Identify edge cases

### While Writing Tests

- [ ] Test initialization state
- [ ] Test each action individually
- [ ] Test event publishing
- [ ] Test event subscriptions
- [ ] Test state persistence
- [ ] Test error conditions
- [ ] Test concurrent operations

### After Writing Tests

- [ ] Run tests: `npm test -- {testFile}`
- [ ] Check coverage: `npm run test:coverage`
- [ ] Verify 0 flaky tests (run 3x)
- [ ] Add JSDoc comments
- [ ] Code review

---

## Performance Test Template

```typescript
describe('Performance Benchmarks', () => {
  it('should process events in <10ms (p95)', async () => {
    const latencies: number[] = [];

    for (let i = 0; i < 100; i++) {
      const start = performance.now();

      // Operation under test
      storeCoordinator.publish(StudyEventType.COUNTY_STUDIED, {...});
      await storeCoordinator.flush();

      const end = performance.now();
      latencies.push(end - start);
    }

    const p95 = calculatePercentile(latencies, 95);
    expect(p95).toBeLessThan(10);
  });

  it('should not leak memory', async () => {
    const initial = process.memoryUsage().heapUsed;

    for (let i = 0; i < 1000; i++) {
      // Operation under test
    }

    global.gc?.();
    const final = process.memoryUsage().heapUsed;
    const growth = final - initial;

    expect(growth).toBeLessThan(5 * 1024 * 1024); // <5MB
  });
});

function calculatePercentile(values: number[], percentile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}
```

---

## Integration Test Template

```typescript
describe('Cross-Store Integration', () => {
  beforeEach(() => {
    // Reset all stores
    useSessionStore.setState({ ...initialState });
    useProgressStore.setState({ ...initialState });
    storeCoordinator.clearAll();
    vi.clearAllMocks();
  });

  it('should coordinate {flow description}', async () => {
    // Arrange
    const cleanup = setupTestSubscriptions();

    // Act
    useSessionStore.getState().startSession(StudyMode.FLASHCARDS);
    useSessionStore.getState().recordCountyStudied('ALA', true, 2000);
    useSessionStore.getState().endSession();

    await storeCoordinator.flush();

    // Assert
    expect(useProgressStore.getState().totalStudied).toBeGreaterThan(0);

    // Cleanup
    cleanup();
  });
});
```

---

## Common Assertions

### State Assertions

```typescript
// Exact match
expect(state).toEqual({ field1: value1, field2: value2 });

// Partial match
expect(state).toMatchObject({ field1: value1 });

// Property exists
expect(state).toHaveProperty('field1');

// Type check
expect(typeof state.field1).toBe('string');
```

### Event Assertions

```typescript
// Event published
expect(publishSpy).toHaveBeenCalled();

// Event published with payload
expect(publishSpy).toHaveBeenCalledWith(
  StudyEventType.SESSION_STARTED,
  expect.objectContaining({ sessionId: expect.any(String) }),
  'sessionStore'
);

// Event published N times
expect(publishSpy).toHaveBeenCalledTimes(3);

// Event NOT published
expect(publishSpy).not.toHaveBeenCalled();
```

### Async Assertions

```typescript
// Wait for state update
await vi.waitFor(() => {
  expect(store.getState().isReady).toBe(true);
});

// Flush event queue
await storeCoordinator.flush();

// Resolve promises
await Promise.resolve();
```

---

## Test Execution Commands

```bash
# Run specific test file
npm test -- tests/unit/stores/study/sessionStore.test.ts

# Run all domain store tests
npm test -- tests/unit/stores/study/

# Run with coverage
npm run test:coverage -- tests/unit/stores/study/

# Watch mode
npm test -- tests/unit/stores/study/ --watch

# Verbose output
npm test -- tests/unit/stores/study/ --reporter=verbose

# Run single test
npm test -- tests/unit/stores/study/sessionStore.test.ts -t "should start new session"
```

---

## Troubleshooting

### Test Hangs/Timeouts

**Problem:** Test never completes
**Solution:** Always `await storeCoordinator.flush()` after publishing events

```typescript
// ❌ BAD - test hangs
storeCoordinator.publish(StudyEventType.COUNTY_STUDIED, {...});
expect(progressStore.totalStudied).toBeGreaterThan(0); // Fails - event not processed

// ✅ GOOD - test completes
storeCoordinator.publish(StudyEventType.COUNTY_STUDIED, {...});
await storeCoordinator.flush();
expect(progressStore.totalStudied).toBeGreaterThan(0); // Passes
```

### Flaky Tests

**Problem:** Test passes sometimes, fails others
**Solution:**

1. Set debounce delays to 0ms in tests
2. Use deterministic dates/times
3. Avoid `setTimeout` - use `storeCoordinator.flush()`

```typescript
// ❌ BAD - timing-dependent
storeCoordinator.setDebounceConfig(StudyEventType.COUNTY_STUDIED, { delayMs: 100 });
storeCoordinator.publish(StudyEventType.COUNTY_STUDIED, {...});
// Race condition - event may or may not have processed

// ✅ GOOD - deterministic
storeCoordinator.setDebounceConfig(StudyEventType.COUNTY_STUDIED, { delayMs: 0 });
storeCoordinator.publish(StudyEventType.COUNTY_STUDIED, {...});
await storeCoordinator.flush(); // Guaranteed to complete
```

### Mock Not Working

**Problem:** Mock functions not being called
**Solution:** Check mock path and ensure it's defined before imports

```typescript
// ❌ BAD - mock after import
import { useSessionStore } from '...';
vi.mock('../../utils/logger');

// ✅ GOOD - mock before import
vi.mock('../../utils/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn() },
}));
import { useSessionStore } from '...';
```

---

## Code Review Checklist

### Test Quality

- [ ] Tests are isolated (no shared state)
- [ ] Tests use AAA pattern (Arrange-Act-Assert)
- [ ] Tests have descriptive names ("should X when Y")
- [ ] Tests cover happy path + edge cases
- [ ] Tests verify events published
- [ ] Tests clean up properly (afterEach)

### Code Quality

- [ ] No hardcoded values (use constants)
- [ ] No magic numbers
- [ ] Proper TypeScript types
- [ ] JSDoc comments for complex tests
- [ ] DRY - helper functions for repeated logic

### Coverage

- [ ] All actions tested
- [ ] All events tested
- [ ] Edge cases covered
- [ ] Coverage target met (75-90%)

---

**Quick Reference By:** QA Specialist Agent
**Last Updated:** December 10, 2025
**For Questions:** See ARCHITECTURE_TEST_STRATEGY.md
