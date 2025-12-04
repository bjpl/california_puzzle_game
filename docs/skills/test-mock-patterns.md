# Test Mock Patterns Skill

**Version**: 1.0.0
**Created**: 2025-12-04
**Category**: Testing / Quality Assurance

## Overview

Reusable patterns for mocking dependencies in Vitest tests, including module resolution, constructor mocking, browser API compatibility, and JSDOM workarounds.

## Patterns

### 1. Module Resolution Setup

**Use Case**: Setting up path aliases for test imports

**Pattern**:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // ... other config
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },
});
```

**Benefits**:

- Consistent import paths between source and tests
- No module resolution errors
- Clean, readable imports

---

### 2. Constructor Mocking Pattern

**Use Case**: Mocking class-based dependencies that are instantiated

**Problem**:

```typescript
// ❌ WRONG - Returns function, not constructor
vi.mock('./Class', () => ({
  MyClass: () => ({ method: vi.fn() }),
}));

// Error: MyClass is not a constructor
```

**Solution**:

```typescript
// ✅ CORRECT - Returns proper constructor
vi.mock('./Class', () => ({
  MyClass: vi.fn().mockImplementation(() => ({
    method: vi.fn().mockResolvedValue(value),
    property: 'value',
    // ... all methods and properties
  })),
}));
```

**Example - AdaptiveGeodataLoader**:

```typescript
vi.mock('../utils/progressiveGeodata', () => ({
  AdaptiveGeodataLoader: vi.fn().mockImplementation(() => ({
    load: vi.fn().mockResolvedValue({ counties: [] }),
    preloadNextLevel: vi.fn().mockResolvedValue(true),
    getCurrentLevel: vi.fn().mockReturnValue('medium'),
    getLoadingProgress: vi.fn().mockReturnValue(100),
  })),
  GeodetaLevel: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    ULTRA: 'ultra',
  },
}));
```

**Benefits**:

- Proper constructor instantiation
- Method call tracking
- Return value control
- Type safety maintained

---

### 3. Browser API Mocking Pattern

**Use Case**: Mocking browser APIs not available in JSDOM

**Pattern - Property Definition**:

```typescript
// Mock navigator API
const mockVibrate = vi.fn();

Object.defineProperty(navigator, 'vibrate', {
  value: mockVibrate,
  writable: true,
  configurable: true,
});

// Mock WebKit-prefixed API
const mockWebkitVibrate = vi.fn();

Object.defineProperty(navigator, 'webkitVibrate', {
  value: mockWebkitVibrate,
  writable: true,
  configurable: true,
});
```

**Pattern - Cleanup**:

```typescript
afterEach(() => {
  // Reset mocks
  vi.clearAllMocks();

  // Restore original properties
  delete (navigator as any).vibrate;
  delete (navigator as any).webkitVibrate;
});
```

**Example - Haptic Feedback**:

```typescript
describe('useHaptic', () => {
  let mockVibrate: any;
  let mockWebkitVibrate: any;

  beforeEach(() => {
    mockVibrate = vi.fn();
    mockWebkitVibrate = vi.fn();

    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(navigator, 'webkitVibrate', {
      value: mockWebkitVibrate,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    delete (navigator as any).vibrate;
    delete (navigator as any).webkitVibrate;
  });

  it('should use WebKit API when standard API unavailable', () => {
    // Test implementation
  });
});
```

**Benefits**:

- Cross-browser API coverage
- Proper mock isolation
- Clean test state

---

### 4. JSDOM Storage Event Pattern

**Use Case**: Creating StorageEvent compatible with JSDOM

**Problem**:

```typescript
// ❌ WRONG - JSDOM doesn't support this constructor signature
const event = new StorageEvent('storage', {
  key: 'myKey',
  newValue: 'newValue',
  storageArea: localStorage,
});

// Error: storageArea is not of type 'Storage'
```

**Solution**:

```typescript
// ✅ CORRECT - Manually define properties
function createStorageEvent(key: string, newValue: string, oldValue?: string) {
  const event = new Event('storage');

  Object.defineProperties(event, {
    key: { value: key, enumerable: true },
    newValue: { value: newValue, enumerable: true },
    oldValue: { value: oldValue, enumerable: true },
    storageArea: { value: window.localStorage, enumerable: true },
    url: { value: window.location.href, enumerable: true },
  });

  return event;
}
```

**Usage Example**:

```typescript
it('should sync changes from other tabs', async () => {
  const storageEvent = createStorageEvent('game-state', JSON.stringify({ score: 100 }));

  window.dispatchEvent(storageEvent);

  await waitFor(() => {
    expect(store.score).toBe(100);
  });
});
```

**Benefits**:

- JSDOM compatibility
- Full event property control
- Realistic multi-tab testing

---

### 5. Accessibility Matcher Setup

**Use Case**: Setting up jest-axe matchers in Vitest

**Pattern**:

```typescript
import { describe, it, expect } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';
import { axe } from 'vitest-axe';

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**AAA Compliance Pattern**:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('AAA Accessibility Compliance', () => {
  it('should meet WCAG AAA standards', async () => {
    const { container } = render(<Component />);

    const results = await axe(container, {
      rules: {
        // AAA level rules
        'color-contrast-enhanced': { enabled: true },
        'link-in-text-block': { enabled: true },
        // Add more AAA rules as needed
      }
    });

    expect(results).toHaveNoViolations();
  });
});
```

**Benefits**:

- Automated accessibility testing
- WCAG compliance verification
- Integration with CI/CD

---

### 6. React Hook Testing Pattern

**Use Case**: Testing custom React hooks

**Pattern**:

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

describe('useCustomHook', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCustomHook());

    expect(result.current.value).toBe(defaultValue);
  });

  it('should update state when action called', () => {
    const { result } = renderHook(() => useCustomHook());

    act(() => {
      result.current.updateValue('new-value');
    });

    expect(result.current.value).toBe('new-value');
  });

  it('should handle async operations', async () => {
    const { result } = renderHook(() => useCustomHook());

    act(() => {
      result.current.fetchData();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
  });
});
```

**Benefits**:

- Isolated hook testing
- State change verification
- Async operation handling

---

### 7. Device Detection Mocking Pattern

**Use Case**: Testing responsive behavior and device detection

**Pattern**:

```typescript
describe('Device Detection', () => {
  const mockMatchMedia = (matches: boolean, width: number) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: width * 1.5, // Aspect ratio
    });
  };

  it('should detect mobile device', () => {
    mockMatchMedia(true, 375); // iPhone width

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.deviceType).toBe('medium-phone');
  });

  it('should detect tablet device', () => {
    mockMatchMedia(true, 768); // iPad width

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.isTablet).toBe(true);
    expect(result.current.deviceType).toBe('small-tablet');
  });

  it('should update on resize', () => {
    mockMatchMedia(true, 375);

    const { result, rerender } = renderHook(() => useDeviceInfo());
    expect(result.current.isMobile).toBe(true);

    // Simulate resize
    mockMatchMedia(false, 1024);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    rerender();
    expect(result.current.isMobile).toBe(false);
  });
});
```

**Benefits**:

- Viewport simulation
- Responsive behavior testing
- Orientation change testing

---

## Usage Guidelines

### When to Use Each Pattern

1. **Module Resolution**: Setup once in vitest.config.ts
2. **Constructor Mocking**: When testing hooks/components that instantiate classes
3. **Browser API Mocking**: When using browser-specific APIs (vibrate, geolocation, etc.)
4. **Storage Events**: When testing multi-tab sync or localStorage changes
5. **Accessibility Matchers**: For all component accessibility tests
6. **Hook Testing**: For all custom React hooks
7. **Device Detection**: For responsive components and mobile features

### Best Practices

1. **Clean State**: Always clean up mocks in `afterEach`
2. **Type Safety**: Use TypeScript for mock definitions
3. **Isolation**: Each test should be independent
4. **Realistic Data**: Use realistic mock data
5. **Error Cases**: Test both success and failure scenarios
6. **Async Handling**: Use `waitFor` for async operations

### Anti-Patterns to Avoid

❌ **Don't**: Mock everything

```typescript
// Over-mocking makes tests brittle
vi.mock('./every-single-dependency');
```

✅ **Do**: Mock only external dependencies

```typescript
// Mock only what's needed
vi.mock('@/services/api');
```

❌ **Don't**: Use global mocks without cleanup

```typescript
// Leaves state for other tests
window.matchMedia = mockMatchMedia;
```

✅ **Do**: Clean up in afterEach

```typescript
afterEach(() => {
  delete (window as any).matchMedia;
});
```

---

## Integration with Project

### File Locations

```
tests/
├── setup/
│   ├── mocks/
│   │   ├── browser-apis.ts    # Browser API mocks
│   │   ├── constructors.ts    # Constructor mocking utilities
│   │   └── storage-events.ts  # JSDOM storage event utilities
│   └── test-utils.tsx         # Custom render functions
└── utils/
    └── mock-helpers.ts        # Reusable mock patterns
```

### Example Setup File

```typescript
// tests/setup/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Custom render with providers
export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    ),
    ...options
  });
}

// Re-export everything
export * from '@testing-library/react';
export { renderWithProviders as render };
```

---

## Maintenance

### Adding New Patterns

1. Document the use case
2. Show both wrong and correct approaches
3. Provide complete example
4. List benefits and risks
5. Update skill version

### Version History

- **1.0.0** (2025-12-04): Initial patterns from test fix GOAP plan

---

**Related Documentation**:

- [GOAP Test Fix Plan](../test-fix-goap-plan.md)
- [Testing Guidelines](../testing-guidelines.md)
- [Vitest Configuration](../../vitest.config.ts)
