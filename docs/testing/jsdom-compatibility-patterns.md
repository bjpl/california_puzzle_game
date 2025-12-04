# JSDOM Compatibility Patterns for Testing

**Created**: 2025-12-04
**Purpose**: Document JSDOM-specific compatibility issues and solutions for Vitest tests

## Pattern 1: JSDOM StorageEvent Compatibility

### Problem

JSDOM's `StorageEvent` constructor validates that `storageArea` must be a real Storage instance, not a mock object. This causes tests to fail with:

```
TypeError: Failed to construct 'StorageEvent': parameter 2 has member 'storageArea' that is not of type 'Storage'.
```

### Solution

Create a base `Event` and use `Object.defineProperty` to set readonly properties after creation. This bypasses JSDOM's constructor validation.

### Implementation

Location: `tests/mocks/sync/mockSyncClient.ts`

```typescript
/**
 * Create JSDOM-compatible StorageEvent
 *
 * JSDOM's StorageEvent constructor validates that storageArea must be a real Storage instance,
 * not a mock object. This utility creates a compatible event by using Object.defineProperty
 * to set event properties after creation.
 *
 * @param init - Storage event initialization options
 * @returns JSDOM-compatible StorageEvent
 */
export const createStorageEvent = (init: {
  key?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  url?: string;
  storageArea?: Storage | null;
}): StorageEvent => {
  // Create base event to avoid JSDOM StorageEvent constructor validation
  const event = new Event('storage') as StorageEvent;

  // Set properties using Object.defineProperty to make them readonly
  if (init.key !== undefined) {
    Object.defineProperty(event, 'key', { value: init.key, writable: false });
  }
  if (init.oldValue !== undefined) {
    Object.defineProperty(event, 'oldValue', { value: init.oldValue, writable: false });
  }
  if (init.newValue !== undefined) {
    Object.defineProperty(event, 'newValue', { value: init.newValue, writable: false });
  }
  if (init.url !== undefined) {
    Object.defineProperty(event, 'url', { value: init.url, writable: false });
  }
  if (init.storageArea !== undefined) {
    Object.defineProperty(event, 'storageArea', { value: init.storageArea, writable: false });
  }

  return event;
};
```

### Usage

```typescript
import { createStorageEvent } from '../../mocks/sync/mockSyncClient';

// In your test
window.dispatchEvent(
  createStorageEvent({
    key: 'settings',
    oldValue: '{"difficulty":"easy"}',
    newValue: '{"difficulty":"hard"}',
    storageArea: localStorage,
  })
);
```

### Applies To

- Vitest + JSDOM
- Cross-tab synchronization tests
- Storage event testing
- Multi-window state coordination

---

## Pattern 2: Sequential Mock Behavior

### Problem

Using `mockImplementation` with stateful logic (like counters) can cause unpredictable behavior when mocks are reset between tests or calls. This causes intermittent test failures where the expected sequence doesn't occur.

### Example Failure

```typescript
let attempts = 0;
mockSyncManager.sync.mockImplementation(async () => {
  attempts++;
  if (attempts % 2 === 0) {
    throw new Error('Network error');
  }
  return { success: true };
});

// First call - attempts = 1, should fail (1 % 2 !== 0) - WRONG!
await expect(mockSyncManager.sync()).rejects.toThrow();
```

### Solution

Use `mockImplementationOnce` chained calls for sequential test scenarios. This ensures each call has a deterministic outcome.

### Implementation

```typescript
let attempts = 0;

// Chain mockImplementationOnce for sequential behavior
mockSyncManager.sync
  .mockImplementationOnce(async () => {
    attempts++;
    throw new Error('Network error');
  })
  .mockImplementationOnce(async () => {
    attempts++;
    return {
      data: null,
      error: null,
      synced: true,
      timestamp: new Date().toISOString(),
    };
  });

// First attempt fails (deterministic)
await expect(mockSyncManager.sync()).rejects.toThrow('Network error');

// Second attempt succeeds (deterministic)
const result = await mockSyncManager.sync();
expect(result.synced).toBe(true);
expect(attempts).toBe(2);
```

### Benefits

- **Deterministic**: Each call has a predictable outcome
- **Readable**: Test intent is clear from the mock chain
- **Reliable**: No dependency on shared state between calls
- **Debuggable**: Easy to see the sequence of expected behaviors

### Applies To

- Vitest mocking
- Jest mocking
- Async testing
- Network retry logic
- State machine testing

---

## Best Practices

### 1. Prefer Deterministic Mocks

- Use `mockImplementationOnce` for sequential scenarios
- Avoid shared state in `mockImplementation`
- Make test outcomes predictable

### 2. Isolate Test Environment

- Reset mocks between tests with `vi.clearAllMocks()`
- Use `beforeEach` for consistent setup
- Clean up in `afterEach` to prevent state leaks

### 3. Document JSDOM Quirks

- Add comments explaining JSDOM-specific workarounds
- Create reusable utilities (like `createStorageEvent`)
- Keep compatibility patterns centralized

### 4. Test Environment Detection

```typescript
const isJSDOM = navigator.userAgent.includes('jsdom');
if (isJSDOM) {
  // Use JSDOM-compatible approach
} else {
  // Use native browser APIs
}
```

---

## Related Files

- `tests/mocks/sync/mockSyncClient.ts` - Mock utilities with JSDOM compatibility
- `tests/integration/sync/edgeCases.test.ts` - Tests using these patterns
- `vitest.config.ts` - Test environment configuration

---

## References

- [JSDOM Documentation](https://github.com/jsdom/jsdom)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [StorageEvent MDN](https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent)
