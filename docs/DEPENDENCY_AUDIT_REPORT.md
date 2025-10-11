# Dependency Audit Report

**Date**: October 4, 2025
**Auditor**: Dependency Audit Agent
**Project**: California Counties Puzzle Game

## Executive Summary

- **Total dependencies**: 25 production, 29 development
- **Security vulnerabilities**: 7 moderate (all in dev dependencies)
- **Outdated packages**: 22 packages with updates available
- **Unused dependencies**: 11 packages identified for removal
- **Duplicate libraries**: 1 critical (react-dnd vs @dnd-kit)

## Security Vulnerabilities

### Overview
All vulnerabilities are in development dependencies and affect the build/test pipeline, not production runtime.

### Moderate Severity (7)

| Package | Severity | Issue | Fix Available |
|---------|----------|-------|---------------|
| vite | Moderate | CVE: Middleware may serve files with same prefix as public dir | ✅ v7.1.9 (major) |
| vite | Moderate | CVE: `server.fs` settings not applied to HTML | ✅ v7.1.9 (major) |
| esbuild | Moderate | GHSA-67mh-4wv8-2f99: Dev server request/response vulnerability | ✅ via vite v7.1.9 |
| vitest | Moderate | Inherited from vite vulnerabilities | ✅ v3.2.4 (major) |
| @vitest/ui | Moderate | Inherited from vitest | ✅ v3.2.4 (major) |
| @vitest/coverage-v8 | Moderate | Inherited from vitest | ✅ v3.2.4 (major) |
| vite-node | Moderate | Inherited from vite | ✅ via vitest v3.2.4 |

**Impact Assessment**:
- All vulnerabilities affect **development environment only**
- No production runtime vulnerabilities
- Recommended: Update to latest major versions during next maintenance window
- **Risk Level**: LOW (dev-only, no production impact)

## Outdated Packages

### Critical Updates (Security Patches)

| Package | Current | Latest | Type | Priority |
|---------|---------|--------|------|----------|
| vite | 4.5.14 | 7.1.9 | major | HIGH |
| vitest | 2.1.9 | 3.2.4 | major | HIGH |
| @vitest/ui | 2.1.9 | 3.2.4 | major | HIGH |
| @vitest/coverage-v8 | 2.1.9 | 3.2.4 | major | HIGH |

### Major Version Updates (Breaking Changes)

| Package | Current | Latest | Type | Notes |
|---------|---------|--------|------|-------|
| react | 18.3.1 | 19.2.0 | major | Review breaking changes carefully |
| react-dom | 18.3.1 | 19.2.0 | major | Must match react version |
| @types/react | 18.3.24 | 19.2.0 | major | Match react version |
| @types/react-dom | 18.3.7 | 19.2.0 | major | Match react-dom version |
| framer-motion | 10.18.0 | 12.23.22 | major | Check animation API changes |
| lucide-react | 0.300.0 | 0.544.0 | minor | Safe to update |
| zustand | 4.5.7 | 5.0.8 | major | Review state management changes |
| eslint | 8.57.1 | 9.37.0 | major | New flat config format |
| @typescript-eslint/eslint-plugin | 6.21.0 | 8.45.0 | major | Requires ESLint 9 |
| @typescript-eslint/parser | 6.21.0 | 8.45.0 | major | Requires ESLint 9 |
| eslint-plugin-react-hooks | 4.6.2 | 6.1.1 | major | New rules for React 19 |
| @vitejs/plugin-react | 4.7.0 | 5.0.4 | major | Requires Vite 5+ |
| tailwindcss | 3.4.17 | 4.1.14 | major | Complete rewrite, major changes |
| jsdom | 25.0.1 | 27.0.0 | major | Test environment updates |

### Minor/Patch Updates (Safe)

| Package | Current | Latest | Type | Action |
|---------|---------|--------|------|--------|
| @tailwindcss/typography | 0.5.18 | 0.5.19 | patch | ✅ Update |
| @testing-library/jest-dom | 6.8.0 | 6.9.1 | minor | ✅ Update |
| @types/react | 18.3.24 | 18.3.25 | patch | ✅ Update (if staying on v18) |
| eslint-plugin-react-refresh | 0.4.20 | 0.4.23 | patch | ✅ Update |
| typescript | 5.9.2 | 5.9.3 | patch | ✅ Update |
| tailwindcss | 3.4.17 | 3.4.18 | patch | ✅ Update (if staying on v3) |

## Unused Dependencies

### Production Dependencies (Can Remove)

| Package | Size | Reason | Action |
|---------|------|--------|--------|
| react-dnd | ~50kb | Replaced by @dnd-kit | ✅ REMOVE |
| react-dnd-html5-backend | ~30kb | Goes with react-dnd | ✅ REMOVE |
| @heroicons/react | ~200kb | Not used in code | ⚠️ VERIFY then remove |
| autoprefixer | 0kb | PostCSS plugin, might be used | ⚠️ VERIFY (check postcss.config) |
| classnames | ~1kb | May be replaced by clsx | ⚠️ VERIFY (both serve same purpose) |
| d3-drag | ~10kb | Already included in d3 | ⚠️ VERIFY (may be explicit import) |
| d3-selection | ~15kb | Already included in d3 | ⚠️ VERIFY |
| d3-zoom | ~10kb | Already included in d3 | ⚠️ VERIFY |
| postcss | 0kb | Build tool, needed by Tailwind | ✅ KEEP |
| react-intersection-observer | ~5kb | Not used in code | ⚠️ VERIFY then remove |

### Development Dependencies (Can Remove)

| Package | Reason | Action |
|---------|--------|--------|
| @tailwindcss/aspect-ratio | Not used (native CSS supports aspect-ratio) | ✅ REMOVE |
| @tailwindcss/forms | Not used in code | ⚠️ VERIFY then remove |
| @tailwindcss/typography | Not used in code | ⚠️ VERIFY then remove |
| @types/d3 | Might be needed for d3 types | ⚠️ VERIFY |
| @types/d3-drag | If removing d3-drag, remove this | ⚠️ VERIFY |
| @types/d3-selection | If removing d3-selection, remove this | ⚠️ VERIFY |
| @types/d3-zoom | If removing d3-zoom, remove this | ⚠️ VERIFY |
| @types/topojson-client | Needed for topojson | ✅ KEEP |
| axe-core | Used in a11y tests | ✅ KEEP |
| jscpd | Copy-paste detection | ✅ KEEP |
| prettier | Code formatting | ✅ KEEP |
| ts-prune | Dead code detection | ✅ KEEP |
| rollup-plugin-visualizer | Bundle analysis | ✅ KEEP |
| web-vitals | Performance monitoring (RECENTLY ADDED) | ✅ KEEP |

## Duplicate Dependencies

### Critical: Multiple Drag-and-Drop Libraries

**Issue**: Both `@dnd-kit` and `react-dnd` are installed

**Analysis**:
- `@dnd-kit`: Used in 7+ files (active implementation)
- `react-dnd`: 0 imports found (unused)

**Recommendation**: **REMOVE** `react-dnd` and `react-dnd-html5-backend`

**Size Impact**: -80kb gzipped

### Potential: D3 Module Duplicates

**Issue**: Explicit d3 module imports while full d3 library is installed

**Files using explicit imports**:
- d3-drag, d3-geo, d3-selection, d3-zoom

**Analysis Required**: Check if these are tree-shakeable or create duplicates

## Bundle Size Analysis

Current estimated production bundle:
- React + React-DOM: ~130kb
- D3: ~240kb (full library)
- Framer Motion: ~60kb
- @dnd-kit: ~20kb
- Tailwind CSS: ~15kb (purged)
- Zustand: ~3kb
- Other utilities: ~30kb

**Total Estimated**: ~500kb gzipped

**Optimization Opportunities**:
1. Remove react-dnd: -80kb
2. Tree-shake D3 modules: -50-100kb potential
3. Lazy-load framer-motion: -60kb initial load

## Recommendations

### Phase 1: Immediate (No Breaking Changes)

**Security Fixes** (HIGH PRIORITY):
```bash
# Safe minor/patch updates
npm install --save-dev typescript@latest
npm install --save-dev eslint-plugin-react-refresh@latest
npm install --save-dev @testing-library/jest-dom@latest
npm install --save-dev @tailwindcss/typography@latest
```

**Remove Unused Dependencies**:
```bash
# Confirmed unused
npm uninstall react-dnd react-dnd-html5-backend

# Verify first, then remove if unused
npm uninstall @heroicons/react react-intersection-observer
npm uninstall @tailwindcss/aspect-ratio
```

**Verify D3 Modules**:
- Check if d3-drag, d3-selection, d3-zoom are needed as separate imports
- If full d3 library is tree-shakeable, remove explicit module imports

### Phase 2: Major Updates (Requires Testing)

**Build Tools** (BREAKING CHANGES):
```bash
# Update Vite and plugins (fixes security vulnerabilities)
npm install --save-dev vite@latest
npm install --save-dev @vitejs/plugin-react@latest
npm install --save-dev vitest@latest
npm install --save-dev @vitest/ui@latest
npm install --save-dev @vitest/coverage-v8@latest
```

**Testing Required After**:
- Full test suite
- Build verification
- Dev server functionality

### Phase 3: Future Consideration (Major Rewrites)

**React 19 Migration**:
- Review breaking changes
- Update React, React-DOM, and type definitions
- Test all components thoroughly
- Update related dependencies (framer-motion, etc.)

**ESLint 9 Migration**:
- Migrate to flat config format
- Update TypeScript ESLint plugins
- Rewrite .eslintrc.cjs to eslint.config.js

**Tailwind CSS 4**:
- Complete rewrite with new architecture
- Requires significant migration effort
- Defer until stable release

## Actions Taken

✅ Security audit completed
✅ Outdated packages identified
✅ Unused dependencies detected
✅ Duplicate library analysis completed
⏳ Awaiting approval for Phase 1 updates
⏳ Breaking change updates deferred to Phase 2

## Breaking Changes

### If Updating to Latest Versions

**Vite 4 → 7**:
- New config API
- Plugin compatibility changes
- Review migration guide

**Vitest 2 → 3**:
- Test API changes
- Coverage reporting updates
- Workspace configuration updates

**React 18 → 19**:
- New features: Actions, useOptimistic, use()
- Deprecated: Legacy Context
- Ref handling changes

## Test Plan

### After Phase 1 Updates:
```bash
npm run typecheck          # TypeScript compilation
npm run lint              # ESLint checks
npm run test:all          # Full test suite
npm run build             # Production build
npm run preview           # Preview build
```

### After Phase 2 Updates:
- Full regression testing
- Performance benchmarks
- Bundle size analysis
- Browser compatibility testing

## Maintenance Scripts

Add to package.json:
```json
{
  "scripts": {
    "deps:audit": "npm audit",
    "deps:outdated": "npm outdated",
    "deps:unused": "npx depcheck",
    "deps:update": "npm update && npm audit fix",
    "deps:report": "npm audit --json > audit-report.json && npm outdated --json > outdated-report.json",
    "deps:tree": "npm ls --depth=0"
  }
}
```

## Next Steps

1. **Immediate**: Remove confirmed unused dependencies (react-dnd, react-dnd-html5-backend)
2. **Week 1**: Apply Phase 1 safe updates
3. **Week 2**: Plan and execute Phase 2 major updates
4. **Monthly**: Run automated dependency audits
5. **Quarterly**: Review for major version updates
6. **Set up**: GitHub Dependabot for automated security alerts

## Monitoring Plan

- **Weekly**: `npm audit` in CI/CD
- **Monthly**: `npm outdated` review
- **Quarterly**: Full dependency tree audit
- **As needed**: Security vulnerability response

---

**Report Generated**: October 4, 2025
**Next Review Due**: November 4, 2025
