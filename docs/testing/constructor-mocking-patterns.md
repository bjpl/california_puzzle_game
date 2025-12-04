# Constructor Mocking Patterns for Vitest

## Problem

When mocking classes that are instantiated with `new` in source code, incorrect mock patterns cause "is not a constructor" errors:

```typescript
// Source code
const loader = new AdaptiveGeodataLoader();

// ❌ WRONG - This is not a constructor
const AdaptiveGeodataLoader = vi.fn(() => ({ ... }));

// ❌ WRONG - mockImplementation alone isn't enough
const AdaptiveGeodataLoader = vi.fn().mockImplementation(() => ({ ... }));
```

## Solution: Use Class Syntax

The correct pattern is to create an actual class in the mock:

```typescript
vi.mock('@/mobile/utils/progressiveGeodata', () => {
  // Create a proper mock class constructor
  class AdaptiveGeodataLoader {
    load = vi.fn().mockResolvedValue({});
    preloadNext = vi.fn().mockResolvedValue({});
    getCurrentLevel = vi.fn().mockReturnValue('MEDIUM');
    isLoading = vi.fn().mockReturnValue(false);
    optimize = vi.fn();
  }

  return {
    GeodetaLevel: {
      ULTRA_LOW: 'ultra-low',
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
    },
    AdaptiveGeodataLoader,
  };
});
```

## Key Points

1. **Use actual class syntax** - ES6 classes work as constructors
2. **Use class fields** - Methods should be defined as class fields with `vi.fn()`
3. **Mock return values** - Chain `.mockResolvedValue()` or `.mockReturnValue()` as needed
4. **Export all needed members** - Don't forget enums, constants, etc.

## Real-World Example

From `tests/unit/hooks/usePinchZoom.test.ts`:

```typescript
// Mock AdaptiveGeodataLoader
vi.mock('../../../src/mobile/utils/progressiveGeodata', () => {
  const GeodetaLevel = {
    ULTRA_LOW: 'ultra-low',
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  };

  // Create a proper mock class constructor
  class AdaptiveGeodataLoader {
    load = vi.fn().mockResolvedValue({});
    preloadNext = vi.fn().mockResolvedValue({});
    getCurrentLevel = vi.fn().mockReturnValue(GeodetaLevel.MEDIUM);
    isLoading = vi.fn().mockReturnValue(false);
    optimize = vi.fn();
  }

  return {
    GeodetaLevel,
    AdaptiveGeodataLoader,
  };
});
```

## Testing the Mock

```typescript
it('should instantiate the loader', () => {
  // This will work because AdaptiveGeodataLoader is a real class
  const loader = new AdaptiveGeodataLoader();
  expect(loader).toBeDefined();
  expect(loader.load).toBeDefined();
  expect(typeof loader.load).toBe('function');
});
```

## Alternative: Constructor Function Pattern

For simpler cases, you can use a constructor function:

```typescript
vi.mock('@/utils/MyClass', () => {
  function MyClass() {
    this.method = vi.fn().mockReturnValue('result');
  }

  return { MyClass };
});
```

However, **class syntax is preferred** for TypeScript compatibility and modern code.

## Common Pitfalls

### 1. Forgetting to return the class

```typescript
// ❌ WRONG
vi.mock('@/utils/MyClass', () => {
  class MyClass { ... }
  // Forgot to return!
});

// ✅ CORRECT
vi.mock('@/utils/MyClass', () => {
  class MyClass { ... }
  return { MyClass };
});
```

### 2. Using arrow functions instead of class methods

```typescript
// ❌ WRONG - Arrow function won't be on prototype
class MyClass {
  method: () => vi.fn();
}

// ✅ CORRECT - Class field
class MyClass {
  method = vi.fn();
}
```

### 3. Not mocking async methods correctly

```typescript
// ❌ WRONG - Missing mockResolvedValue
class MyClass {
  async fetch() {}
}

// ✅ CORRECT
class MyClass {
  fetch = vi.fn().mockResolvedValue({ data: 'test' });
}
```

## Result

After applying this pattern to `tests/unit/hooks/usePinchZoom.test.ts`:

- ✅ 35 tests passing (was 0 passing)
- ✅ No "is not a constructor" errors
- ✅ Proper TypeScript support maintained

## Related Files

- Source: `src/mobile/hooks/usePinchZoom.ts` (line 129)
- Test: `tests/unit/hooks/usePinchZoom.test.ts` (lines 13-34)
- Class: `src/mobile/utils/progressiveGeodata.ts`

## Last Updated

2025-12-04 - GOAP Milestone 2 completed
