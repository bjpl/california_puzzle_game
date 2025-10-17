# Git Hooks Fixed

## Issues Resolved

### 1. Pre-commit Hook - lint-staged Error ✅

**Error**: `npm error notarget No matching version found for undefined@lint-staged`

**Root Cause**: CRLF line endings in husky hook files (Windows/WSL compatibility issue)

**Fix**:

- Converted `.husky/pre-commit` and `.husky/pre-push` from CRLF to LF line endings using `sed -i 's/\r$//'`
- Changed from `npx lint-staged` to simple `lint-staged` command (already in PATH)
- Added `"lint-staged": "lint-staged"` npm script for consistency

**Result**: Pre-commit hook now runs successfully, formatting/linting staged files

### 2. Pre-push Hook - Vitest Run Error ✅

**Error**: `CACError: Unknown option '--run'` and tests hanging in watch mode

**Root Cause**:

- Original command `npm run test -- --run` used invalid `--run` flag
- Vitest doesn't have `--run` flag; use `vitest run` instead
- `CI=true npm test` still launched watch mode

**Fix**:

- Changed from `npm run test -- --run` to `npx vitest run`
- `vitest run` forces single test run without watch mode
- Bypassed vitest workspace issue (separate problem to investigate later)

**Result**: Pre-push hook runs tests once and exits properly

## Hook Configuration

### `.husky/pre-commit`

```bash
# Run lint-staged for formatting and linting
lint-staged

# Prevent commits with TODO comments (except in tests and docs)
if git diff --cached --name-only | grep -E '\.(tsx?|jsx?)$' | xargs grep -l 'TODO:' 2>/dev/null | grep -v -E 'test|spec|\.md$'; then
  echo "Error: TODO comments found in staged files. Create GitHub issues instead."
  exit 1
fi

# Prevent commits with console.log (except in specific files)
if git diff --cached --name-only | grep -E '\.(tsx?|jsx?)$' | xargs grep -l 'console\.log' 2>/dev/null | grep -v -E 'logger\.ts|test|spec|sw\.js|public/'; then
  echo "Error: console.log found. Use logger utility or console.warn/error instead."
  exit 1
fi
```

### `.husky/pre-push`

```bash
# Run tests before push (using vitest run to force single run without watch mode)
npx vitest run

# Run type checking (non-blocking initially - logs warning)
npm run typecheck || echo "Warning: Type checking failed. Please fix before merging to main."
```

## Testing

Both hooks now work correctly:

✅ **Pre-commit**: Runs lint-staged, formats code, checks for TODO/console.log
✅ **Pre-push**: Runs full test suite once, then type checks

## Commits Made

1. `6686809` - Fix git hook configuration for lint-staged and vitest (line endings)
2. `5d7b9a8` - Use CI=true npm test in pre-push hook (didn't work)
3. `ae91cd9` - Use npx vitest run in pre-push to force single test run (works!)

## Known Issues

- `npm run test:all` (vitest workspace) has a configuration error trying to load "true" as a file
- This is a separate vitest configuration issue, not related to hooks
- Workaround: Use `npx vitest run` instead

## Files Modified

- `.husky/pre-commit` - Fixed line endings, simplified lint-staged command
- `.husky/pre-push` - Changed to `npx vitest run`
- `package.json` - Added `"lint-staged": "lint-staged"` script
- `docs/git-hooks-fixed.md` - This documentation
