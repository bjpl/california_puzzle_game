# Dependency Management Policy

**Project**: California Counties Puzzle Game
**Version**: 1.0
**Last Updated**: October 4, 2025

## General Principles

1. **Minimize dependencies** - Only add when functionality cannot be reasonably implemented in-house
2. **Security first** - Address vulnerabilities based on severity and production impact
3. **Stay current** - Update minor versions quarterly, security patches immediately
4. **Test everything** - Run full test suite after any dependency updates
5. **Document decisions** - Track why dependencies were added/removed

## Adding Dependencies

### Before Adding a New Dependency

**Evaluation Checklist**:

- [ ] Does this functionality already exist in the codebase?
- [ ] Can this be implemented reasonably in-house?
- [ ] Is the package actively maintained? (commits within last 6 months)
- [ ] Does it have good documentation?
- [ ] What is the bundle size impact?
- [ ] Does it have TypeScript support?
- [ ] What is its security history?
- [ ] How many weekly downloads does it have?
- [ ] What are the licensing terms?

### Quality Criteria

**Package Quality Indicators**:

- GitHub stars: >1,000 (for UI libraries), >500 (for utilities)
- Last commit: Within 6 months
- Open issues ratio: <10% of total issues
- Weekly downloads: >10,000 (for critical dependencies)
- TypeScript: Native TypeScript or @types package available
- Security: No known high/critical vulnerabilities
- License: MIT, Apache 2.0, or compatible

### Bundle Size Guidelines

**Maximum Sizes** (gzipped):

- Utilities/helpers: <10kb
- UI component libraries: <50kb
- State management: <5kb
- Major frameworks/libraries: <100kb
- Build tools: Any size (dev dependencies only)

**Tools for Size Checking**:

- bundlephobia.com
- npm bundle-size analyzer
- `rollup-plugin-visualizer` (already installed)

### Decision Documentation

When adding a dependency, document in git commit:

```
Add [package-name] for [specific purpose]

Evaluation:
- Size: [X]kb gzipped
- Stars: [X]
- Last update: [date]
- Reason: [why we need this]
- Alternatives considered: [list]
```

## Updating Dependencies

### Update Schedule

**Patch Updates** (1.0.x → 1.0.y):

- Frequency: Automatic via `npm update` monthly
- Testing: Run test suite
- Risk: Low (bug fixes only)
- Approval: None required

**Minor Updates** (1.x.0 → 1.y.0):

- Frequency: Quarterly review
- Testing: Full test suite + smoke testing
- Risk: Low to medium (new features, backwards compatible)
- Approval: Team lead review

**Major Updates** (x.0.0 → y.0.0):

- Frequency: As needed, minimum annually
- Testing: Full regression suite + manual testing
- Risk: High (breaking changes)
- Approval: Team review + dedicated PR
- Process:
  1. Review changelog and migration guides
  2. Create feature branch
  3. Update and fix breaking changes
  4. Full test suite + additional testing
  5. Code review
  6. Merge after approval

### Update Process

**Before Updating**:

```bash
# 1. Check what would change
npm outdated

# 2. Review changelogs for breaking changes
# Visit GitHub releases page for each package

# 3. Create feature branch
git checkout -b deps/update-[package-name]

# 4. Update package
npm install [package]@latest

# 5. Run tests
npm run test:all
npm run typecheck
npm run lint
npm run build
```

**After Updating**:

```bash
# 6. Verify no new security issues
npm audit

# 7. Check bundle size impact
npm run build
# Compare dist/ sizes before and after

# 8. Commit with detailed message
git commit -m "Update [package] to [version]

Breaking changes:
- [list any breaking changes]

Migration steps:
- [list any code changes made]

Testing: All tests pass ✅"

# 9. Create PR for review
gh pr create
```

## Security Management

### Vulnerability Response Times

**Production Dependencies**:

- **Critical** (CVSS 9.0-10.0): Fix within 24 hours
- **High** (CVSS 7.0-8.9): Fix within 1 week
- **Moderate** (CVSS 4.0-6.9): Fix within 1 month
- **Low** (CVSS 0.1-3.9): Fix in next quarterly update

**Development Dependencies**:

- **Critical**: Fix within 1 week
- **High**: Fix within 1 month
- **Moderate**: Fix in next quarterly update
- **Low**: Fix when convenient

### Security Audit Process

**Weekly Automated Scan** (CI/CD):

```bash
npm audit --production
# Alert on HIGH or CRITICAL in production deps
```

**Monthly Manual Review**:

```bash
npm audit
npm audit --json > audit-report.json
# Review all vulnerabilities
# Create issues for fixes needed
```

**Quarterly Deep Dive**:

```bash
# Full dependency tree audit
npm ls --depth=0
npm outdated
npx depcheck

# Check for:
# - Unused dependencies
# - Duplicate dependencies
# - Outdated security patches
# - New major versions available
```

### Security Tools

**GitHub Dependabot**:

- Enable automated security updates
- Review and merge security PRs weekly
- Configure to target development branch

**NPM Audit**:

```bash
# Run audit
npm audit

# Try automatic fixes (for production only)
npm audit fix --production

# Check what would be fixed
npm audit fix --dry-run
```

## Dependency Removal

### When to Remove

Remove dependencies when:

1. No longer used in codebase (detected by depcheck)
2. Functionality moved to built-in solution (e.g., native CSS)
3. Package is deprecated or unmaintained (no commits in 12+ months)
4. Security concerns with no available fix
5. Replaced by better alternative

### Removal Process

**Before Removing**:

```bash
# 1. Verify not used
npx depcheck
grep -r "package-name" src/

# 2. Check if it's a peer dependency
npm ls package-name

# 3. Remove from package.json
npm uninstall package-name

# 4. Run tests
npm run test:all
npm run build

# 5. Commit with explanation
git commit -m "Remove [package-name]

Reason: [why removing]
- No longer used in codebase
- Last used in: [location]
- Removed in: [PR/commit]"
```

## Special Cases

### Build Tools (Vite, TypeScript, ESLint)

**Update Strategy**:

- Major version updates: Plan migration window
- Test in development branch first
- Update all related plugins simultaneously
- Document breaking changes in migration guide

### React Ecosystem (React, React-DOM, Types)

**Update Strategy**:

- Always update React and React-DOM together
- Update @types/react and @types/react-dom to match
- Test all components thoroughly
- Check third-party library compatibility
- Major versions: Dedicated migration sprint

### D3.js and Visualization Libraries

**Update Strategy**:

- Test map rendering extensively
- Verify SVG output unchanged
- Check performance benchmarks
- Test on all supported browsers

### State Management (Zustand)

**Update Strategy**:

- Review store implementations
- Check for API changes
- Test all state operations
- Verify persistence works

## Review Schedule

### Weekly

- **Automated**: `npm audit` in CI/CD
- **Action**: Review any new HIGH/CRITICAL vulnerabilities
- **Time**: 15 minutes

### Monthly

- **Manual**: Run `npm outdated` and `npm audit`
- **Action**: Create issues for security updates needed
- **Action**: Update patch versions
- **Time**: 30 minutes

### Quarterly

- **Manual**: Full dependency tree audit
- **Action**: Plan minor version updates
- **Action**: Remove unused dependencies
- **Action**: Review bundle size
- **Time**: 2-4 hours

### Annually

- **Manual**: Major version review
- **Action**: Plan major version migrations
- **Action**: Evaluate alternative libraries
- **Action**: Review dependency policy
- **Time**: 1 day

## Automation

### Automated Tools

**GitHub Dependabot** (.github/dependabot.yml):

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 5
    target-branch: 'develop'
    reviewers:
      - 'team-lead'
    labels:
      - 'dependencies'
      - 'automated'
```

**CI/CD Security Check** (GitHub Actions):

```yaml
- name: Security Audit
  run: |
    npm audit --production --audit-level=high
    npm outdated
```

### Package.json Scripts

Already added:

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

## Common Scenarios

### Scenario: Duplicate Dependencies Detected

**Example**: Both `classnames` and `clsx` installed

**Action**:

1. Check usage: `grep -r "classnames\|clsx" src/`
2. Choose one (prefer smaller/more modern)
3. Search and replace imports
4. Remove unused package
5. Test thoroughly

### Scenario: Major Vulnerability in Production Dependency

**Example**: Critical vulnerability in `react`

**Action**:

1. Check if fix available: `npm audit`
2. If yes: Update immediately
3. If no:
   - Assess actual risk to our use case
   - Check for workarounds
   - Consider temporary mitigation
   - Monitor for fix
   - Document decision

### Scenario: Unmaintained Package

**Example**: Package last updated 2+ years ago

**Action**:

1. Assess if still working
2. Check for maintained alternatives
3. If critical: Plan migration
4. If non-critical: Remove or replace
5. Document in tech debt backlog

### Scenario: Breaking Changes in Update

**Example**: ESLint 8 → 9 (flat config)

**Action**:

1. Read migration guide thoroughly
2. Create dedicated branch
3. Make required changes
4. Update all related plugins
5. Test extensively
6. Code review
7. Merge with documentation

## Bundle Size Management

### Size Budget

**Target Bundle Sizes**:

- Initial JS bundle: <500kb gzipped
- Total JS: <1MB gzipped
- CSS: <50kb gzipped

**Monitoring**:

```bash
# After each build
npm run build
ls -lh dist/assets/

# Detailed analysis
npx vite build --debug
```

### Size Optimization Techniques

1. **Tree Shaking**: Use ES6 imports, avoid `import *`
2. **Code Splitting**: Lazy load routes and heavy components
3. **Dependency Analysis**: Use `rollup-plugin-visualizer`
4. **Alternatives**: Choose smaller packages when possible

### Before Adding Large Dependencies

**Decision Matrix**:

- <50kb: Generally OK if provides significant value
- 50-100kb: Needs justification and team review
- 100kb+: Must be critical, no alternatives, lazy-loaded if possible

## Documentation

### Dependency Change Log

Maintain `docs/DEPENDENCY_CHANGELOG.md`:

```markdown
## 2025-10-04

- Added: web-vitals@5.1.0 (performance monitoring)
- Removed: react-dnd@16.0.1 (replaced by @dnd-kit)
- Updated: typescript@5.9.2 → 5.9.3 (security patch)
```

### ADR (Architecture Decision Records)

For major dependency decisions, create ADR:

```markdown
# ADR-XXX: Choose @dnd-kit over react-dnd

## Context

Need drag-and-drop functionality for county pieces.

## Decision

Use @dnd-kit instead of react-dnd.

## Rationale

- Smaller bundle size (20kb vs 80kb)
- Better TypeScript support
- More active maintenance
- Modern hooks-based API

## Consequences

- Learning curve for new API
- Migration effort if switching
- Better performance
```

## Compliance

### License Tracking

**Allowed Licenses**:

- MIT
- Apache 2.0
- BSD (2-clause, 3-clause)
- ISC

**Prohibited Licenses**:

- GPL (any version) - unless isolated
- AGPL
- Proprietary without agreement

**Check Licenses**:

```bash
npx license-checker --summary
```

### Audit Trail

All dependency changes must:

1. Be in version control (package.json)
2. Have descriptive commit messages
3. Be documented in changelog
4. Pass code review (for major changes)

## Contact

**Dependency Owner**: [Team Lead]
**Security Contact**: [Security Team]
**Questions**: [Team Channel]

---

**Policy Version**: 1.0
**Next Review**: January 2026
