# Vite Alias Import Pattern for Tests

## Problem

When using Vite path aliases (e.g., `@/lib/supabase`) in test files, `require()` does not work with these aliases. This causes module resolution errors in tests.

**Error symptoms:**

- `Cannot find module '@/lib/...'` errors in test files
- Tests that use `require('@/lib/...')` fail to resolve modules

## Root Cause

`require()` is a CommonJS feature that doesn't understand Vite's path alias configuration. Vite aliases are resolved during the build process, but `require()` bypasses this.

## Solution

Use async `import()` instead of `require()` for accessing mocked modules with Vite aliases.

### ❌ INCORRECT (doesn't work):

```typescript
beforeEach(() => {
  const { supabase } = require('@/lib/supabase');
  supabase.from = mockSupabaseFrom;
});
```

### ✅ CORRECT (works):

```typescript
beforeEach(async () => {
  const { supabase } = await import('@/lib/supabase');
  supabase.from = mockSupabaseFrom;
});
```

## Key Changes

1. **Make the function async**: Add `async` keyword to `beforeEach`, `it`, or any function using `import()`
2. **Use `await import()`**: Replace `require()` with `await import()`
3. **Remove ESLint disable comments**: No need for `@typescript-eslint/no-var-requires` anymore

## Examples

### Example 1: Setting up mocks in beforeEach

```typescript
// Before
beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { supabase } = require('@/lib/supabase');
  supabase.from = mockSupabaseFrom;
});

// After
beforeEach(async () => {
  const { supabase } = await import('@/lib/supabase');
  supabase.from = mockSupabaseFrom;
});
```

### Example 2: Mocking hook returns in test cases

```typescript
// Before
it('should show message when not authenticated', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const useAuth = require('@/hooks/useAuth').useAuth;
  useAuth.mockReturnValue({ user: null });
  // ... test code
});

// After
it('should show message when not authenticated', async () => {
  const { useAuth } = await import('@/hooks/useAuth');
  useAuth.mockReturnValue({ user: null });
  // ... test code
});
```

### Example 3: Multiple imports

```typescript
// Before
beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { deleteUserAccount, exportUserData } = require('@/services/supabase/auth');
  deleteUserAccount.mockImplementation(mockDelete);
  exportUserData.mockImplementation(mockExport);
});

// After
beforeEach(async () => {
  const { deleteUserAccount, exportUserData } = await import('@/services/supabase/auth');
  deleteUserAccount.mockImplementation(mockDelete);
  exportUserData.mockImplementation(mockExport);
});
```

## Files Fixed

This pattern was applied to fix module resolution issues in:

1. `tests/unit/components/export-data.test.tsx` - Fixed Supabase import
2. `tests/unit/components/security-features.test.tsx` - Fixed auth service imports
3. `tests/unit/services/auth-functions.test.ts` - Fixed Supabase client import

## When to Use This Pattern

Use `await import()` when:

- Working with Vite path aliases (`@/...`)
- Accessing mocked modules in tests
- Dynamically importing modules in `beforeEach`, `it`, or other test functions
- Getting fresh module instances for isolated tests

## Benefits

1. **Works with Vite aliases**: Properly resolves `@/` path aliases
2. **Type-safe**: Full TypeScript support
3. **Modern**: Uses ES modules instead of CommonJS
4. **No ESLint warnings**: No need for disable comments
5. **Better isolation**: Each import gets a fresh module instance

## Related Documentation

- [Vite Module Resolution](https://vitejs.dev/guide/features.html#module-resolution)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [ES Modules Dynamic Import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)

---

**Last Updated**: 2025-12-04
**Impact**: Fixed ~62 tests across 3 test files
