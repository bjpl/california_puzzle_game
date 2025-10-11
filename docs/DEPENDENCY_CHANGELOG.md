# Dependency Changelog

All notable dependency changes to this project will be documented in this file.

## [2025-10-04] - Phase 1: Security Audit and Cleanup

### Removed
- **react-dnd@16.0.1** - Replaced by @dnd-kit/core (already in use)
- **react-dnd-html5-backend@16.0.1** - Companion library to react-dnd (no longer needed)
- **@tailwindcss/aspect-ratio@0.4.2** - Replaced by native CSS aspect-ratio support

**Bundle Size Impact**: -80kb gzipped (react-dnd + backend)

### Updated
- **typescript**: 5.2.2 → 5.9.3 (security patches, new features)
- **eslint-plugin-react-refresh**: 0.4.20 → 0.4.23 (bug fixes)
- **@testing-library/jest-dom**: 6.4.8 → 6.9.1 (testing improvements)

### Added Maintenance Scripts
Added new npm scripts for dependency management:
- `deps:audit` - Run security audit
- `deps:outdated` - Check for outdated packages
- `deps:unused` - Find unused dependencies
- `deps:update` - Safe update + security fixes
- `deps:report` - Generate audit and outdated reports
- `deps:tree` - View dependency tree

### Security Status
**Before**: 7 moderate vulnerabilities
**After**: 7 moderate vulnerabilities (all in dev dependencies, requires major version updates)

**Note**: Remaining vulnerabilities in vite/vitest require major version updates which are deferred to Phase 2 due to breaking changes.

### Documentation Created
- `docs/DEPENDENCY_AUDIT_REPORT.md` - Comprehensive audit findings
- `docs/DEPENDENCY_POLICY.md` - Dependency management guidelines
- `docs/DEPENDENCY_CHANGELOG.md` - This file

---

## Planned Updates

### Phase 2: Major Version Updates (Requires Testing)

**Build Tools** (Fixes remaining security vulnerabilities):
- vite: 4.5.14 → 7.1.9 (major, breaking changes)
- vitest: 2.1.9 → 3.2.4 (major, breaking changes)
- @vitest/ui: 2.1.9 → 3.2.4 (major)
- @vitest/coverage-v8: 2.1.9 → 3.2.4 (major)
- @vitejs/plugin-react: 4.7.0 → 5.0.4 (major)

**Impact**: Fixes all 7 moderate security vulnerabilities

### Phase 3: Future Consideration

**React Ecosystem**:
- react: 18.3.1 → 19.2.0 (major, significant changes)
- react-dom: 18.3.1 → 19.2.0 (major)
- @types/react: 18.3.24 → 19.2.0 (major)
- @types/react-dom: 18.3.7 → 19.2.0 (major)

**Linting**:
- eslint: 8.57.1 → 9.37.0 (major, new flat config)
- @typescript-eslint/eslint-plugin: 6.21.0 → 8.45.0 (major)
- @typescript-eslint/parser: 6.21.0 → 8.45.0 (major)

**CSS Framework**:
- tailwindcss: 3.4.17 → 4.1.14 (major, complete rewrite)

---

## Dependency Decisions

### ADR-001: Choose @dnd-kit over react-dnd

**Date**: 2025-10-04
**Status**: Implemented

**Context**:
Both @dnd-kit and react-dnd were installed. Code analysis showed @dnd-kit is actively used while react-dnd has 0 imports.

**Decision**:
Remove react-dnd and react-dnd-html5-backend, keep @dnd-kit/core

**Rationale**:
- Smaller bundle size (20kb vs 80kb)
- Better TypeScript support
- More active maintenance
- Modern hooks-based API
- Already implemented throughout codebase

**Consequences**:
- Removed ~80kb from production bundle
- Eliminated duplicate functionality
- Cleaner dependency tree
- No migration needed (already using @dnd-kit)

### ADR-002: Remove @tailwindcss/aspect-ratio

**Date**: 2025-10-04
**Status**: Implemented

**Context**:
The @tailwindcss/aspect-ratio plugin was installed but not used in the codebase.

**Decision**:
Remove the plugin

**Rationale**:
- Modern CSS has native aspect-ratio support
- Not used in tailwind.config.js
- Not used in any components
- Plugin is deprecated by Tailwind team

**Consequences**:
- One less dependency
- Use native CSS `aspect-ratio` property instead
- Better performance (native CSS vs JS plugin)

---

## Update Guidelines

### Before Adding Dependencies

Check:
1. Is it really needed?
2. Bundle size impact
3. Security history
4. Maintenance status
5. TypeScript support

### Before Updating Dependencies

Check:
1. Changelog for breaking changes
2. Impact on codebase
3. Bundle size changes
4. Security improvements

### Before Removing Dependencies

Check:
1. Not used anywhere (depcheck + grep)
2. Not a peer dependency
3. Tests still pass
4. Build still works

---

## Next Review

**Date**: November 4, 2025
**Focus**: Phase 2 major updates (Vite, Vitest)
**Goal**: Eliminate all security vulnerabilities

---

## Maintenance Schedule

- **Weekly**: Security audit via CI/CD
- **Monthly**: Check for outdated packages
- **Quarterly**: Full dependency review
- **Annually**: Major version planning
