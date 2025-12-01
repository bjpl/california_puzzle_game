# Tailwind Migration Guide

## Overview

This guide provides step-by-step instructions for migrating component CSS files to Tailwind utility classes.

## Table of Contents

1. [Migration Philosophy](#migration-philosophy)
2. [Tailwind Config Enhancements](#tailwind-config-enhancements)
3. [Component Migration Examples](#component-migration-examples)
4. [Common Patterns](#common-patterns)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Migration Philosophy

### Core Principles

1. **Maintain Visual Fidelity**: Migrated components must look identical to originals
2. **Preserve Accessibility**: All ARIA attributes and semantic HTML remain unchanged
3. **Improve Developer Experience**: Use Tailwind utilities for faster iteration
4. **Optimize Bundle Size**: Leverage Tailwind's purge feature for smaller production builds

### When to Use Tailwind vs Custom CSS

- ✅ **Use Tailwind**: 95% of styling (spacing, colors, layout, typography)
- ⚠️ **Use Custom CSS**: Complex keyframe animations (add to Tailwind config)
- ⚠️ **Use CSS Modules**: Never (we're standardizing on Tailwind)

## Tailwind Config Enhancements

### Step 1: Add Custom Colors

**Update `tailwind.config.js`:**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // California Counties Design System Colors
        'ca-primary': {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#DBEAFE',
        },
        'ca-secondary': {
          DEFAULT: '#F3F4F6',
          hover: '#E5E7EB',
          dark: '#374151',
        },
        'ca-success': {
          DEFAULT: '#059669',
          hover: '#047857',
          light: '#D1FAE5',
        },
        'ca-danger': {
          DEFAULT: '#EF4444',
          hover: '#DC2626',
          light: '#FEE2E2',
        },
        'ca-warning': {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          light: '#FEF3C7',
        },
      },
      // Custom animations from component CSS
      keyframes: {
        'spin-button': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        dash: {
          '0%': {
            strokeDasharray: '1, 150',
            strokeDashoffset: '0',
          },
          '50%': {
            strokeDasharray: '90, 150',
            strokeDashoffset: '-35',
          },
          '100%': {
            strokeDasharray: '90, 150',
            strokeDashoffset: '-124',
          },
        },
        'progress-indeterminate': {
          '0%': { left: '-40%' },
          '100%': { left: '100%' },
        },
      },
      animation: {
        'spin-button': 'spin-button 1s linear infinite',
        dash: 'dash 1.5s ease-in-out infinite',
        'progress-indeterminate': 'progress-indeterminate 1.5s ease-in-out infinite',
      },
      // Custom box shadows
      boxShadow: {
        'ca-elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'ca-button': '0 4px 12px rgba(37, 99, 235, 0.15)',
      },
    },
  },
  plugins: [],
};
```

### Step 2: Create Tailwind Plugin (Optional)

For complex repeated patterns:

```javascript
// tailwind.config.js
const plugin = require('tailwindcss/plugin');

export default {
  // ... other config
  plugins: [
    plugin(function ({ addComponents, theme }) {
      addComponents({
        '.btn-base': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontWeight: '600',
          borderRadius: '0.375rem',
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          outline: 'none',
          '&:focus-visible': {
            boxShadow: `0 0 0 3px ${theme('colors.blue.200')}`,
          },
        },
      });
    }),
  ],
};
```

## Component Migration Examples

### Example 1: Button Component

**Before (Button.tsx + Button.css):**

```tsx
// Button.tsx
import './Button.css';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  className = '',
  ...props
}) => {
  const buttonClasses = ['ca-button', `ca-button--${variant}`, `ca-button--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return <button className={buttonClasses} {...props} />;
};
```

```css
/* Button.css */
.ca-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.ca-button--primary {
  background-color: #2563eb;
  color: white;
}

.ca-button--primary:hover:not(:disabled) {
  background-color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.ca-button--small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.ca-button--medium {
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
}
```

**After (Tailwind only):**

```tsx
// Button.tsx
import { clsx } from 'clsx';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  className = '',
  disabled = false,
  loading = false,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-in-out cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2';

  const variantClasses = {
    primary:
      'bg-ca-primary text-white hover:bg-ca-primary-hover hover:-translate-y-0.5 hover:shadow-ca-button disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    secondary:
      'bg-ca-secondary text-ca-secondary-dark hover:bg-ca-secondary-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed',
    success:
      'bg-ca-success text-white hover:bg-ca-success-hover hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(5,150,105,0.15)] disabled:opacity-50 disabled:cursor-not-allowed',
    danger:
      'bg-ca-danger text-white hover:bg-ca-danger-hover hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(239,68,68,0.15)] disabled:opacity-50 disabled:cursor-not-allowed',
    ghost:
      'bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed',
    outline:
      'bg-transparent text-ca-primary border-2 border-ca-primary hover:bg-ca-primary hover:text-white hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed',
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        loading && 'text-transparent', // Hide text when loading
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    />
  );
};
```

### Example 2: Badge Component

**Before (Badge.tsx + Badge.css):**

```tsx
// Badge.tsx
import './Badge.css';

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', size = 'medium', children }) => {
  return <span className={`ca-badge ca-badge--${variant} ca-badge--${size}`}>{children}</span>;
};
```

```css
/* Badge.css */
.ca-badge {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  border-radius: 9999px;
}

.ca-badge--default {
  background-color: #f3f4f6;
  color: #374151;
}

.ca-badge--small {
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
}
```

**After (Tailwind only):**

```tsx
// Badge.tsx
import { clsx } from 'clsx';

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'medium',
  children,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';

  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-indigo-100 text-indigo-700',
  };

  const sizeClasses = {
    small: 'px-2.5 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base',
  };

  return (
    <span className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}>
      {children}
    </span>
  );
};
```

### Example 3: Progress Component with Animation

**Before (Progress.tsx + Progress.css):**

```tsx
// Progress.tsx
import './Progress.css';

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  variant = 'default',
  animated = false,
}) => {
  const percentage = (value / max) * 100;

  return (
    <div className="ca-progress">
      <div
        className={`ca-progress__bar ca-progress__bar--${variant} ${animated ? 'ca-progress__bar--animated' : ''}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
```

```css
/* Progress.css */
.ca-progress {
  width: 100%;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.ca-progress__bar {
  height: 100%;
  transition: width 300ms ease;
}

.ca-progress__bar--default {
  background-color: #2563eb;
}

.ca-progress__bar--gradient {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

.ca-progress__bar--animated {
  background-size: 200% 100%;
  animation: progress-shimmer 2s ease-in-out infinite;
}

@keyframes progress-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

**After (Tailwind with custom animation):**

```tsx
// Progress.tsx
import { clsx } from 'clsx';

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  variant = 'default',
  animated = false,
  size = 'medium',
  className = '',
}) => {
  const percentage = (value / max) * 100;

  const containerSizes = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3',
  };

  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-600',
    gradient: 'bg-gradient-to-r from-blue-500 to-purple-600',
  };

  return (
    <div
      className={clsx(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        containerSizes[size],
        className
      )}
    >
      <div
        className={clsx(
          'h-full transition-all duration-300 ease-in-out',
          variantClasses[variant],
          animated && 'animate-pulse'
        )}
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  );
};
```

**Add to tailwind.config.js if custom shimmer needed:**

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      keyframes: {
        'progress-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'progress-shimmer': 'progress-shimmer 2s ease-in-out infinite',
      },
    },
  },
};
```

## Common Patterns

### 1. Conditional Styling with clsx

```tsx
import { clsx } from 'clsx';

function Component({ isActive, variant, disabled }) {
  return (
    <button
      className={clsx(
        // Base styles (always applied)
        'px-4 py-2 rounded-md font-medium transition-colors',

        // Conditional styles
        isActive && 'bg-blue-600 text-white',
        !isActive && 'bg-gray-200 text-gray-700',

        // Variant styles
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',

        // State styles
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
      )}
    >
      Click me
    </button>
  );
}
```

### 2. Responsive Design

```tsx
<div
  className="
  px-4           /* mobile: 1rem padding */
  md:px-8        /* tablet: 2rem padding */
  lg:px-12       /* desktop: 3rem padding */

  grid
  grid-cols-1    /* mobile: 1 column */
  md:grid-cols-2 /* tablet: 2 columns */
  lg:grid-cols-3 /* desktop: 3 columns */

  gap-4          /* mobile: 1rem gap */
  lg:gap-8       /* desktop: 2rem gap */
"
>
  {/* Content */}
</div>
```

### 3. Hover and Focus States

```tsx
<button
  className="
  /* Base styles */
  px-6 py-3 rounded-lg font-semibold
  bg-blue-600 text-white

  /* Hover state */
  hover:bg-blue-700
  hover:shadow-lg
  hover:-translate-y-0.5

  /* Focus state */
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:ring-offset-2

  /* Active state */
  active:translate-y-0

  /* Disabled state */
  disabled:opacity-50
  disabled:cursor-not-allowed
  disabled:transform-none

  /* Transition */
  transition-all
  duration-200
"
>
  Button
</button>
```

### 4. Dark Mode Support (Future-Ready)

```tsx
<div
  className="
  bg-white dark:bg-gray-800
  text-gray-900 dark:text-gray-100
  border border-gray-200 dark:border-gray-700
"
>
  {/* Content that adapts to dark mode */}
</div>
```

### 5. Custom CSS when Tailwind isn't enough

**Rare cases where you need custom CSS:**

```tsx
// Component.tsx
<div className="custom-gradient-text">
  Gradient Text
</div>

// In global CSS or component-specific CSS (rarely needed)
.custom-gradient-text {
  @apply bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent;
}
```

## Best Practices

### 1. Use Design Tokens (Tailwind Config)

✅ **Good**: `bg-ca-primary hover:bg-ca-primary-hover`
❌ **Bad**: `bg-[#2563EB] hover:bg-[#1D4ED8]` (arbitrary values)

### 2. Component Composition Over Repetition

✅ **Good**:

```tsx
const ButtonBase = ({ className, ...props }) => (
  <button className={clsx('px-4 py-2 rounded-md font-medium', className)} {...props} />
);

const PrimaryButton = (props) => (
  <ButtonBase className="bg-blue-600 text-white hover:bg-blue-700" {...props} />
);
```

❌ **Bad**: Repeating the same long className everywhere

### 3. Organize Classes Logically

```tsx
// Group classes by category for readability
<div className="
  /* Layout */
  flex items-center justify-between

  /* Spacing */
  px-4 py-2 gap-2

  /* Sizing */
  w-full h-12

  /* Colors */
  bg-white text-gray-900

  /* Border & Shadow */
  border border-gray-200 rounded-lg shadow-sm

  /* States */
  hover:bg-gray-50 focus:outline-none

  /* Transitions */
  transition-all duration-200
">
```

### 4. Use Tailwind IntelliSense

Install VSCode extension: `bradlc.vscode-tailwindcss`

Settings.json:

```json
{
  "tailwindCSS.experimental.classRegex": [["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]]
}
```

### 5. Avoid @apply (Use Sparingly)

❌ **Bad**: Creating new CSS classes with @apply defeats Tailwind's purpose

```css
.my-button {
  @apply px-4 py-2 bg-blue-600 text-white rounded;
}
```

✅ **Good**: Use components and clsx

```tsx
const buttonClasses = 'px-4 py-2 bg-blue-600 text-white rounded';
<button className={buttonClasses}>Click</button>;
```

## Troubleshooting

### Issue 1: Classes Not Purging Correctly

**Problem**: Production bundle includes unused Tailwind classes

**Solution**: Ensure `content` paths in `tailwind.config.js` include all files:

```javascript
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // Correct
    // Not: "./src/**/*.ts" (misses .tsx files)
  ],
};
```

### Issue 2: Custom Colors Not Working

**Problem**: `text-ca-primary` not applying color

**Solution**: Ensure color defined in `theme.extend.colors`:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        'ca-primary': '#2563EB', // Correct
        // Not in 'colors' at root level
      },
    },
  },
};
```

### Issue 3: Long ClassName Strings Hard to Read

**Problem**: 150+ character className strings

**Solution**: Use clsx and component composition:

```tsx
// Before (hard to read)
<button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200">

// After (organized with clsx)
<button className={clsx(
  'inline-flex items-center justify-center gap-2',
  'px-6 py-3 rounded-lg font-semibold',
  'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg',
  'focus:outline-none focus:ring-2 focus:ring-blue-500',
  'disabled:opacity-50 transition-all duration-200'
)}>
```

### Issue 4: Animation Not Working

**Problem**: Custom keyframe animations don't work

**Solution**: Add to tailwind.config.js:

```javascript
export default {
  theme: {
    extend: {
      keyframes: {
        'my-animation': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        'my-animation': 'my-animation 1s ease-in-out',
      },
    },
  },
};
```

Then use: `className="animate-my-animation"`

## Migration Checklist

### For Each Component:

- [ ] Read original CSS file and understand all styles
- [ ] Map BEM classes to Tailwind utilities
- [ ] Identify custom animations and add to Tailwind config
- [ ] Update component to use Tailwind classes
- [ ] Use clsx for conditional styling
- [ ] Test visual appearance (before/after screenshot)
- [ ] Test all variants (primary, secondary, etc.)
- [ ] Test all sizes (small, medium, large)
- [ ] Test all states (hover, focus, active, disabled)
- [ ] Test responsive behavior (if applicable)
- [ ] Verify accessibility (ARIA attributes preserved)
- [ ] Delete CSS file
- [ ] Remove CSS import from component
- [ ] Update exports in index.ts (if needed)
- [ ] Run tests to ensure no regressions
- [ ] Document any new patterns used

## Quick Reference: CSS to Tailwind

| CSS Property                     | Tailwind Utility              | Example                                   |
| -------------------------------- | ----------------------------- | ----------------------------------------- |
| `display: flex`                  | `flex`                        | `className="flex"`                        |
| `align-items: center`            | `items-center`                | `className="items-center"`                |
| `justify-content: space-between` | `justify-between`             | `className="justify-between"`             |
| `padding: 1rem`                  | `p-4`                         | `className="p-4"`                         |
| `padding: 0.5rem 1rem`           | `py-2 px-4`                   | `className="py-2 px-4"`                   |
| `margin: 1rem`                   | `m-4`                         | `className="m-4"`                         |
| `background-color: #2563EB`      | `bg-blue-600`                 | `className="bg-blue-600"`                 |
| `color: #ffffff`                 | `text-white`                  | `className="text-white"`                  |
| `font-size: 1rem`                | `text-base`                   | `className="text-base"`                   |
| `font-weight: 600`               | `font-semibold`               | `className="font-semibold"`               |
| `border-radius: 0.375rem`        | `rounded-md`                  | `className="rounded-md"`                  |
| `border: 1px solid #E5E7EB`      | `border border-gray-200`      | `className="border border-gray-200"`      |
| `box-shadow: ...`                | `shadow-lg`                   | `className="shadow-lg"`                   |
| `transition: all 200ms`          | `transition-all duration-200` | `className="transition-all duration-200"` |
| `opacity: 0.5`                   | `opacity-50`                  | `className="opacity-50"`                  |
| `cursor: pointer`                | `cursor-pointer`              | `className="cursor-pointer"`              |
| `outline: none`                  | `outline-none`                | `className="outline-none"`                |

## Resources

- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Tailwind Cheat Sheet**: https://nerdcave.com/tailwind-cheat-sheet
- **clsx Documentation**: https://github.com/lukeed/clsx
- **Tailwind IntelliSense**: https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss
- **Tailwind Play (Online Playground)**: https://play.tailwindcss.com/

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-04
**Next Review**: After Phase 2 migration complete
