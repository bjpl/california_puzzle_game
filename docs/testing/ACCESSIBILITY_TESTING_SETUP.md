# Accessibility Testing Setup Pattern

## Overview

This document describes the setup pattern for accessibility testing in the California Counties Puzzle project using Vitest and jest-axe.

## Problem Solved

The project uses Vitest as the test runner, but jest-axe is built for Jest. The `toHaveNoViolations` matcher from jest-axe needs to be properly registered with Vitest's expect API.

## Solution

### Global Setup (Recommended)

**File**: `tests/setup.ts`

```typescript
import { expect } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';

// Extend Vitest matchers with jest-axe
expect.extend(toHaveNoViolations);
```

This setup is automatically loaded for all tests via the Vitest configuration.

### Per-File Setup (Alternative)

If you need to use jest-axe in a specific test file without global setup:

```typescript
import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Vitest's expect with jest-axe matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should have no violations', async () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <button aria-label="Close">×</button>
    `;

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Package Dependencies

**Required packages in `package.json`:**

```json
{
  "devDependencies": {
    "jest-axe": "^10.0.0",
    "vitest": "^4.0.15",
    "@testing-library/react": "^16.0.1"
  }
}
```

**Note**: The `vitest-axe` package exists but is not actively maintained. Use `jest-axe` instead, which works perfectly with Vitest when properly configured.

## Usage Patterns

### Basic Axe Test

```typescript
it('should have no accessibility violations', async () => {
  const container = document.createElement('div');
  container.innerHTML = `
    <header role="banner">
      <h1>Page Title</h1>
    </header>
  `;

  document.body.appendChild(container);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  document.body.removeChild(container);
});
```

### Testing Specific Rules

```typescript
it('should pass AAA color contrast rules', async () => {
  const container = document.createElement('div');
  container.innerHTML = `
    <div style="background: #FFFFFF; color: #000000; padding: 16px;">
      <p>High contrast text (21:1 ratio)</p>
    </div>
  `;

  document.body.appendChild(container);

  // Test only specific rules
  const results = await axe(container, {
    rules: {
      'color-contrast-enhanced': { enabled: true },
    },
  });

  expect(results).toHaveNoViolations();
  document.body.removeChild(container);
});
```

### Testing React Components

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no violations in component', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Common Axe Rules

### WCAG 2.1 Level A/AA/AAA Rules

- `color-contrast`: Text has sufficient contrast (AA: 4.5:1, AAA: 7:1)
- `color-contrast-enhanced`: Enhanced contrast for AAA
- `button-name`: Buttons have accessible names
- `image-alt`: Images have alt text
- `label`: Form inputs have labels
- `aria-valid-attr`: ARIA attributes are valid
- `aria-required-attr`: Required ARIA attributes are present
- `keyboard`: Elements are keyboard accessible
- `landmark-unique`: Landmarks are unique
- `region`: Content is in landmark regions

### Configuring Rules

```typescript
const results = await axe(container, {
  rules: {
    'color-contrast': { enabled: true },
    'color-contrast-enhanced': { enabled: true },
    region: { enabled: false }, // Disable specific rules
  },
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag21aaa'],
  },
});
```

## TypeScript Support

The matcher is properly typed when using the global setup. Vitest's expect will recognize `toHaveNoViolations`:

```typescript
// TypeScript knows about this matcher
expect(results).toHaveNoViolations(); // ✓ No type error
```

## Troubleshooting

### Matcher Not Found

**Error**: `expect(...).toHaveNoViolations is not a function`

**Solution**: Ensure `expect.extend(toHaveNoViolations)` is called before any tests run:

1. Add to global setup file (`tests/setup.ts`)
2. Or add to the top of your test file
3. Make sure you're importing from `jest-axe`, not `vitest-axe`

### Import Errors

**Wrong**:

```typescript
import { toHaveNoViolations } from 'vitest-axe'; // ❌ Not maintained
```

**Correct**:

```typescript
import { toHaveNoViolations } from 'jest-axe'; // ✓ Works with Vitest
```

## Best Practices

1. **Use Global Setup**: Configure `toHaveNoViolations` once in `tests/setup.ts`
2. **Clean Up DOM**: Always remove test elements from document.body
3. **Test Real Components**: Test actual React components, not just HTML strings
4. **Specific Rules**: Target specific WCAG rules when testing compliance levels
5. **Combine with Manual Testing**: Automated testing catches ~30-40% of issues
6. **Test User Flows**: Test complete user interactions, not just static markup

## Example Test File Structure

```typescript
/**
 * Component Accessibility Tests
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MyComponent } from '../MyComponent';

// Extend expect (if not using global setup)
expect.extend(toHaveNoViolations);

describe('MyComponent Accessibility', () => {
  it('should have no violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should meet WCAG 2.1 AAA contrast', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container, {
      rules: {
        'color-contrast-enhanced': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });
});
```

## Resources

- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [axe-core Rule Descriptions](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Vitest Documentation](https://vitest.dev/)

## Files Modified

- `tests/setup.ts`: Global jest-axe matcher registration
- `tests/accessibility/accessibility-aaa.test.ts`: Example accessibility tests

## Last Updated

2025-12-04
