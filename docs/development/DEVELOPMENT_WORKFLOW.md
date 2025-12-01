# Development Workflow

## Git Hooks - Quality Gates

This project uses automated quality gates via Git hooks (Husky) to maintain code quality and prevent regressions during development.

### Pre-commit Hook

The pre-commit hook runs automatically before every commit and performs the following checks:

#### 1. Lint-staged (Auto-formatting)

- **Runs**: ESLint with auto-fix on all staged `.ts`, `.tsx`, `.js`, `.jsx` files
- **Runs**: Prettier formatting on all staged files
- **Purpose**: Ensures consistent code style and catches common errors

#### 2. TODO Comment Prevention

- **Blocks**: Commits containing `TODO:` comments in source files
- **Exceptions**: Allowed in test files and documentation
- **Rationale**: Prevents technical debt - create GitHub issues instead
- **Bypass**: If you must commit a TODO, create a GitHub issue first and reference it in the comment

#### 3. console.log Prevention

- **Blocks**: Commits containing `console.log()` statements
- **Exceptions**: Allowed in `logger.ts`, test files, and `console.warn`/`console.error` are permitted
- **Rationale**: Prevents debugging statements from reaching production
- **Alternative**: Use the logger utility or `console.warn`/`console.error` for intentional logging

### Pre-push Hook

The pre-push hook runs before pushing to remote and performs:

#### 1. Test Suite

- **Runs**: Full test suite with `npm run test -- --run`
- **Blocks**: Push if any tests fail
- **Purpose**: Catches breaking changes before they reach the remote repository

#### 2. Type Checking

- **Runs**: TypeScript type checking with `npm run typecheck`
- **Status**: Non-blocking (shows warning only)
- **Purpose**: Highlights type errors but doesn't prevent push during active development

### Configuration Files

#### `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

#### `.eslintrc.cjs`

Key rules:

- `no-console`: Error (except `console.warn` and `console.error`)
- `@typescript-eslint/no-unused-vars`: Error (with `_` prefix exception)
- `no-restricted-globals`: Prevents direct `localStorage` access (use Zustand persist)

#### `lint-staged` (in `package.json`)

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": ["prettier --write"]
  }
}
```

### Installation & Setup

The hooks are automatically installed when you run:

```bash
npm install
```

This triggers the `prepare` script which runs `husky install`.

### Manual Hook Installation

If hooks aren't working, reinstall them manually:

```bash
npx husky install
```

### Testing the Hooks

#### Test Pre-commit Hook

```bash
# Create a test file with console.log
echo "console.log('test')" > test.ts
git add test.ts
git commit -m "test"
# Should fail with error message
```

#### Test Prettier Integration

```bash
# Create a poorly formatted file
echo "const x={a:1,b:2}" > test.ts
git add test.ts
git commit -m "test"
# File should be auto-formatted before commit
```

#### Test Pre-push Hook

```bash
# Make sure tests pass
npm run test

# Try pushing
git push
# Should run full test suite before pushing
```

### Bypassing Hooks (Not Recommended)

In rare cases where you need to bypass hooks:

```bash
# Skip pre-commit hook
git commit --no-verify -m "emergency fix"

# Skip pre-push hook
git push --no-verify
```

**Warning**: Only use `--no-verify` for genuine emergencies. Bypassing hooks defeats the purpose of automated quality gates.

### Best Practices

1. **Run tests locally**: `npm run test` before committing
2. **Fix linting errors**: `npm run lint:fix` to auto-fix issues
3. **Check types**: `npm run typecheck` to catch type errors early
4. **Use logger utility**: Instead of `console.log`, use the project's logger
5. **Create GitHub issues**: Instead of TODO comments in code

### Troubleshooting

#### Hooks not running

```bash
# Reinstall Husky
npx husky install

# Check hook permissions (Unix/Mac)
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

#### Lint-staged failing

```bash
# Clear cache and retry
npx lint-staged --no-stash
```

#### False positives

If the hooks incorrectly flag valid code:

1. Add file to exceptions in `.husky/pre-commit`
2. Or use ESLint disable comments for specific lines:
   ```typescript
   // eslint-disable-next-line no-console
   console.warn('This is intentional');
   ```

### Phase 1 Quality Gates Summary

These automated gates are part of **Phase 1** of the massive refactoring effort:

- Prevents regression bugs
- Maintains code quality standards
- Catches issues before they reach CI/CD
- Enforces consistent code style
- Reduces code review friction

For more information about the refactoring phases, see the project documentation.
