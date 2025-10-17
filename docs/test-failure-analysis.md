# Pre-Existing Test Failure Analysis

## Test Files Failing

1. **tests/mobile/hooks/usePinchZoom.test.ts** - Integration tests with AdaptiveGeodataLoader
2. **tests/unit/hooks/useDeviceInfo.test.ts** - Unit tests with fake timers
3. **tests/mobile/components/TouchCountyDrag.test.tsx** - Component tests with mocked dependencies
4. **tests/sync/*.test.ts** - Various sync-related tests

## Root Causes Identified

### 1. usePinchZoom.test.ts - Test Timeout Issue

**Problem**: Tests timeout after 2 minutes

**Root Cause**:
- The `AdaptiveGeodataLoader` in `usePinchZoom.ts` makes real async calls
- Tests mock `global.fetch` but the loader may have internal state/timers
- Integration tests at lines 391-494 trigger geodata loading which hangs
- The `useEffect` on line 373-378 runs on mount and triggers `loadGeodataForZoom`

**Evidence**:
```typescript
// usePinchZoom.ts:373-378
useEffect(() => {
  if (mergedConfig.enableProgressiveLoading) {
    loadGeodataForZoom(mergedConfig.initialScale); // ← Triggers async load on mount
  }
}, []); // Only on mount
```

**Fix Needed**:
- Mock `AdaptiveGeodataLoader` entirely in tests
- Add proper cleanup in test teardown
- Ensure all promises resolve/reject in test environment

### 2. useDeviceInfo.test.ts - Timer Management

**Problem**: Tests timeout despite using `vi.useFakeTimers()`

**Root Cause**:
- Fake timers are used but test might not be advancing them properly
- `waitFor` calls may conflict with fake timers
- Cleanup in `afterEach` may not be running due to timeout

**Evidence**:
```typescript
// Line 200-206: Debounce test with waitFor
await waitFor(() => {
  expect(result.current.width).toBe(375);
}); // ← waitFor may hang with fake timers
```

**Fix Needed**:
- Use `act()` with `vi.advanceTimersByTime()` consistently
- Remove `waitFor()` in favor of synchronous timer advancement
- Ensure all timers are cleared before test ends

### 3. TouchCountyDrag.test.tsx - Mock Dependencies

**Problem**: Tests timeout with mocked @dnd-kit and hooks

**Root Cause**:
- `useEffect` dependencies trigger continuously
- `wasDraggingRef` state transitions may cause infinite loops
- Mock `@dnd-kit/core` may not properly simulate drag lifecycle

**Evidence**:
```typescript
// Lines 140-206: Three useEffect hooks that depend on isDragging state
// Changes to isDragging trigger effects, which may trigger state changes
```

**Fix Needed**:
- Ensure mock state changes are properly sequenced
- Add proper cleanup between test cases
- Mock all external dependencies completely

### 4. Sync Tests - Unknown Issues

**Problem**: Generic sync test failures

**Root Cause**: Need to investigate individual sync test files:
- tests/sync/achievementSync.test.ts
- tests/sync/gameSettingsSync.test.ts
- tests/sync/gameStatsSync.test.ts
- tests/sync/syncManager.test.ts
- tests/sync/syncQueue.test.ts

**Fix Needed**: Review each sync test file individually

## Recommended Fix Strategy

### Phase 1: Mock AdaptiveGeodataLoader (High Priority)

Create a complete mock of AdaptiveGeodataLoader:

```typescript
// tests/mobile/hooks/usePinchZoom.test.ts
vi.mock('@/mobile/utils/progressiveGeodata', () => ({
  AdaptiveGeodataLoader: vi.fn(() => ({
    load: vi.fn(() => Promise.resolve({ type: 'FeatureCollection', features: [] })),
    getCurrentLevel: vi.fn(() => 'low'),
    isLoading: vi.fn(() => false),
    preloadNext: vi.fn(() => Promise.resolve()),
  })),
  GeodetaLevel: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  },
}));
```

### Phase 2: Fix Timer Issues in useDeviceInfo.test.ts

Replace `waitFor` with synchronous timer advancement:

```typescript
// Instead of:
await waitFor(() => {
  expect(result.current.width).toBe(375);
});

// Use:
act(() => {
  vi.advanceTimersByTime(50);
});
expect(result.current.width).toBe(375);
```

### Phase 3: Fix TouchCountyDrag Mock Sequencing

Ensure proper mock state transitions:

```typescript
// Proper sequence for drag lifecycle:
mockIsDragging = false; // Initial
render(<TouchCountyDrag {...defaultProps} />);

act(() => {
  mockIsDragging = true; // Start drag
  rerender(<TouchCountyDrag {...defaultProps} />);
});

act(() => {
  mockIsDragging = false; // End drag
  mockTransform = null;
  rerender(<TouchCountyDrag {...defaultProps} />);
});
```

### Phase 4: Investigate Sync Tests

Run each sync test individually to identify specific failures.

## Files Requiring Updates

1. `tests/mobile/hooks/usePinchZoom.test.ts` - Add AdaptiveGeodataLoader mock
2. `tests/unit/hooks/useDeviceInfo.test.ts` - Fix timer usage
3. `tests/mobile/components/TouchCountyDrag.test.tsx` - Fix mock sequencing
4. `tests/sync/*.test.ts` - TBD after investigation

## Success Criteria

- All tests complete within 30 seconds
- No test timeouts
- All assertions pass
- Proper cleanup between tests
- No hanging promises or timers
