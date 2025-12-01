# Dependency Management Quick Reference

> **Phase 5 Complete** | Last Updated: October 4, 2025

## Quick Stats

- **Total Dependencies**: 55 (19 production + 26 dev + 10 optional)
- **Security Vulnerabilities**: 7 moderate (dev-only, not production)
- **Removed in Phase 1**: 3 packages (-80kb bundle)
- **Bundle Size**: ~500kb gzipped (reduced from ~580kb)

## Quick Commands

```bash
# Daily/Weekly Use
npm run deps:audit          # Check for security issues
npm run deps:tree          # View dependency tree

# Monthly Maintenance
npm run deps:outdated      # Check for updates
npm run deps:unused        # Find unused packages
npm run deps:update        # Safe updates only

# Full Analysis
npm run deps:report        # Generate full audit reports
```

## Current Issues

### Security (7 moderate - dev only)

All in build tools, not production:

- `vite`: 2 vulnerabilities → Fix: upgrade to v7
- `vitest`: 4 vulnerabilities → Fix: upgrade to v3
- `esbuild`: 1 vulnerability → Fix: via vite upgrade

**Impact**: Development environment only, NO production risk
**Fix**: Phase 2 major updates (1 month)

### Unused Dependencies (11 potential)

**Confirmed Removed** ✅:

- react-dnd
- react-dnd-html5-backend
- @tailwindcss/aspect-ratio

**Needs Verification** ⚠️:

- @heroicons/react (200kb)
- react-intersection-observer (5kb)
- @tailwindcss/forms
- @tailwindcss/typography
- classnames (duplicate of clsx?)

## Update Schedule

| Frequency | Actions                  | Time      |
| --------- | ------------------------ | --------- |
| Weekly    | Security audit via CI/CD | 5 min     |
| Monthly   | Update patch versions    | 30 min    |
| Quarterly | Full dependency review   | 2-4 hours |
| Annually  | Major version planning   | 1 day     |

## Planned Updates

### Phase 2 (Next Month) - Security Fixes

```bash
# Update build tools (fixes all 7 vulnerabilities)
npm install --save-dev vite@latest
npm install --save-dev vitest@latest
npm install --save-dev @vitest/ui@latest
npm install --save-dev @vitest/coverage-v8@latest
npm install --save-dev @vitejs/plugin-react@latest

# Then test
npm run test:all
npm run build
```

### Phase 3 (Future) - Major Ecosystem

- React 18 → 19 (major breaking changes)
- Tailwind 3 → 4 (complete rewrite)
- ESLint 8 → 9 (new config format)

## Emergency Security Fix

If HIGH/CRITICAL vulnerability in production dependency:

```bash
# 1. Check impact
npm audit --production

# 2. Try automatic fix
npm audit fix --production

# 3. If manual fix needed
npm install [package]@latest

# 4. ALWAYS test after
npm run test:all
npm run build
npm run typecheck
```

## Adding New Dependencies

### Before Installing

✅ Check:

1. Bundle size (<10kb for utilities, <50kb for UI)
2. Last commit (within 6 months)
3. TypeScript support
4. Security history
5. Do we really need this?

### Process

```bash
# 1. Install
npm install [package]

# 2. Document
git commit -m "Add [package] for [reason]

Size: [X]kb
Stars: [X]
Last update: [date]
Alternative considered: [Y]"

# 3. Test
npm run test:all
npm run build
```

## Removing Dependencies

```bash
# 1. Verify not used
npm run deps:unused
grep -r "package-name" src/

# 2. Remove
npm uninstall package-name

# 3. Test
npm run test:all
npm run build

# 4. Document in DEPENDENCY_CHANGELOG.md
```

## Documentation

- **Full Audit**: `docs/DEPENDENCY_AUDIT_REPORT.md` (comprehensive findings)
- **Policy**: `docs/DEPENDENCY_POLICY.md` (guidelines and rules)
- **Changelog**: `docs/DEPENDENCY_CHANGELOG.md` (all changes tracked)
- **Implementation**: `docs/PHASE5_IMPLEMENTATION_SUMMARY.md` (detailed report)

## Common Issues

### "npm audit" shows vulnerabilities

**Dev dependencies**: Usually safe, update when convenient
**Production dependencies**: Follow security response times in policy

### Package outdated

**Patch (1.0.x → 1.0.y)**: Update anytime with `npm update`
**Minor (1.x.0 → 1.y.0)**: Review changelog, update quarterly
**Major (x.0.0 → y.0.0)**: Plan migration, test thoroughly

### Duplicate packages

```bash
# Check for duplicates
npm dedupe --dry-run

# Fix
npm dedupe
```

## Key Decisions

### Why @dnd-kit instead of react-dnd?

- Smaller: 20kb vs 80kb
- Better TypeScript support
- More active development
- Already implemented

### Why remove @tailwindcss/aspect-ratio?

- Native CSS `aspect-ratio` available
- Plugin deprecated by Tailwind
- Not used in codebase

## Bundle Optimization

Current opportunities:

1. ✅ Remove react-dnd: -80kb (DONE)
2. 🔍 Tree-shake D3: -50-100kb (investigate)
3. 🔍 Lazy-load framer-motion: -60kb (investigate)
4. 🔍 Remove unused Tailwind plugins: -10kb (verify)

## CI/CD Integration

Add to GitHub Actions:

```yaml
- name: Security Audit
  run: npm audit --production --audit-level=high

- name: Dependency Check
  run: npm outdated || true
```

## Support

- **Policy**: See `docs/DEPENDENCY_POLICY.md`
- **Full Audit**: See `docs/DEPENDENCY_AUDIT_REPORT.md`
- **Questions**: Check policy first, then ask team

---

**Quick Reference Version**: 1.0
**Last Audit**: October 4, 2025
**Next Review**: November 4, 2025
