# Configuration Guide

## Overview

This guide documents all configuration files in the California Counties Puzzle Game project. Each configuration serves a specific purpose and is optimized for the development workflow.

---

## Build Configuration

### `vite.config.ts`

**Purpose**: Main build configuration for production and development

**Key Features**:

- React plugin integration with Fast Refresh
- TypeScript compilation with path aliases
- Production optimizations with code splitting
- Development server configuration
- Source map generation

**Path Aliases**:

```typescript
'@': './src'  // Import from src/ using @/ prefix
```

**Code Splitting**:

- `react-vendor`: React and React DOM
- `ui-vendor`: Lucide React icons

**Build Output**:

- Directory: `dist/`
- Source maps: Enabled
- Base path: `/california_puzzle_game/` (for GitHub Pages)

---

## Testing Configuration

### `vitest.workspace.ts`

**Purpose**: Consolidated multi-workspace test configuration

**Workspaces**:

#### 1. Unit Tests (`unit`)

- **Location**: `tests/unit/**/*.test.{ts,tsx}`
- **Environment**: jsdom
- **Timeout**: Default (5000ms)
- **Coverage**: 80% threshold on all metrics
- **Use Case**: Fast, focused tests for individual components and functions

```bash
npm run test:unit
```

#### 2. Accessibility Tests (`a11y`)

- **Location**: `tests/accessibility/**/*.test.{ts,tsx}`
- **Environment**: jsdom
- **Timeout**: 30 seconds
- **Setup**: Includes axe-core for WCAG validation
- **Use Case**: WCAG 2.1 AA compliance testing

```bash
npm run test:a11y
npm run test:accessibility  # Alias
```

#### 3. Integration Tests (`integration`)

- **Location**: `tests/integration/**/*.test.{ts,tsx}`
- **Environment**: jsdom
- **Timeout**: 60 seconds
- **Use Case**: Full component integration and user workflows

```bash
npm run test:integration
```

#### 4. Performance Tests (`performance`)

- **Location**: `tests/performance/**/*.test.{ts,tsx}`
- **Environment**: jsdom
- **Timeout**: 120 seconds
- **Use Case**: Benchmarking and performance validation

```bash
npm run test:performance
```

**Common Commands**:

```bash
npm test              # Run all tests in watch mode
npm run test:all      # Run all test suites once
npm run test:coverage # Generate coverage report for all workspaces
npm run test:ui       # Open Vitest UI
```

---

## TypeScript Configuration

### `tsconfig.json`

**Purpose**: TypeScript compiler configuration for source code

**Key Settings**:

- **Target**: ES2020
- **Module**: ESNext
- **Strict Mode**: Enabled
- **JSX**: react-jsx (automatic runtime)
- **Path Mapping**: `@/*` → `./src/*`

**Included Files**:

- `src/**/*`
- Type definition files

### `tsconfig.node.json`

**Purpose**: TypeScript configuration for build tools and scripts

**Key Settings**:

- **Target**: ES2022
- **Module**: ESNext
- **Module Resolution**: bundler

**Included Files**:

- `vite.config.ts`
- `vitest.*.config.ts`

---

## Styling Configuration

### `tailwind.config.js`

**Purpose**: Tailwind CSS customization for California theme

**Custom Colors**:

```javascript
california: {
  blue: '#0047AB',     // California state flag blue
  gold: '#FDB515',     // California gold
  poppy: '#FFA500',    // California poppy orange
  sage: '#9DC183',     // California sage green
  ocean: '#006994',    // Pacific Ocean blue
  sunset: '#FF6B35'    // California sunset
}
```

**Content Paths**:

- `./index.html`
- `./src/**/*.{js,ts,jsx,tsx}`

**Plugins**:

- `@tailwindcss/forms`
- `@tailwindcss/typography`
- `@tailwindcss/aspect-ratio`

### `postcss.config.js`

**Purpose**: PostCSS processing pipeline

**Plugins**:

1. **Tailwind CSS**: Utility-first CSS framework
2. **Autoprefixer**: Browser compatibility prefixes

---

## Package Configuration

### `package.json`

**Key Sections**:

#### Scripts

- **Development**: `npm run dev` - Start dev server on port 3000
- **Build**: `npm run build` - Production build
- **Testing**: Multiple test commands (see Testing Configuration)
- **Linting**: `npm run lint` - ESLint with TypeScript
- **Type Checking**: `npm run typecheck` - TypeScript validation

#### Dependencies

- **React**: UI framework (v18.2.0)
- **D3.js**: Geographic visualization (v7.8.5)
- **Zustand**: State management (v4.4.4)
- **Framer Motion**: Animations (v10.16.4)
- **Tailwind CSS**: Styling framework (v3.4.0)

#### Dev Dependencies

- **Vite**: Build tool (v4.5.0)
- **Vitest**: Testing framework (v2.0.5)
- **TypeScript**: Type safety (v5.2.2)
- **Testing Library**: Component testing
- **ESLint**: Code linting

---

## Configuration Best Practices

### 1. Adding New Test Types

To add a new test workspace:

```typescript
// In vitest.workspace.ts
{
  extends: './vite.config.ts',
  test: {
    name: 'new-test-type',
    include: ['tests/new-type/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000
  }
}
```

Then add script to `package.json`:

```json
"test:new-type": "vitest --workspace new-test-type"
```

### 2. Path Aliases

Always use the `@/` alias for imports:

```typescript
// Good
import { Button } from '@/components/ui/Button';

// Avoid
import { Button } from '../../components/ui/Button';
```

### 3. Coverage Thresholds

Unit tests maintain 80% coverage threshold:

- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

### 4. Environment Variables

Never commit secrets to configuration files. Use `.env` files:

```bash
# .env.local (not committed)
VITE_API_KEY=your-secret-key
```

Access in code:

```typescript
const apiKey = import.meta.env.VITE_API_KEY;
```

---

## Configuration File Headers

All configuration files include descriptive headers:

```typescript
/**
 * [Config Name] Configuration
 *
 * Purpose: [What this configures]
 * Used by: [What tools use this]
 * Documentation: docs/CONFIGURATION_GUIDE.md
 *
 * Last updated: [Date]
 */
```

This helps new developers understand the purpose of each file.

---

## Troubleshooting

### Tests Not Found

If tests aren't discovered:

1. Check file location matches workspace `include` pattern
2. Verify file extension is `.test.ts` or `.test.tsx`
3. Run `npm run test:all` to see all workspaces

### TypeScript Errors in Tests

If TypeScript complains about test types:

1. Ensure `vitest/globals` is in types array
2. Check `tsconfig.json` includes test files
3. Verify `globals: true` in test config

### Build Failures

If builds fail:

1. Run `npm run typecheck` first
2. Check `vite.config.ts` path aliases
3. Verify all imports use correct paths

### Coverage Not Generating

If coverage reports are missing:

1. Run with `--coverage` flag
2. Check `coverage/` directory isn't in `.gitignore`
3. Verify `@vitest/coverage-v8` is installed

---

## Migration Notes

### From Separate Configs to Workspace

**Previous Structure** (3 separate config files):

```
vitest.a11y.config.ts
vitest.integration.config.ts
vitest.performance.config.ts
```

**New Structure** (single workspace file):

```
vitest.workspace.ts
```

**Benefits**:

- Single source of truth
- Easier maintenance
- Better test organization
- Shared configuration via `extends`

**Script Changes**:

```json
// Before
"test:accessibility": "vitest --config vitest.a11y.config.ts"

// After
"test:a11y": "vitest --workspace a11y"
```

---

## Related Documentation

- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated**: 2025-10-04
