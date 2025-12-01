# CI/CD Quick Reference

## Quick Setup Checklist

### 1. GitHub Repository Secrets

Configure these in **Settings > Secrets and variables > Actions**:

```
Required for Deployment:
✓ NETLIFY_AUTH_TOKEN - From Netlify user settings
✓ NETLIFY_SITE_ID - From Netlify site settings

Optional for Coverage:
○ CODECOV_TOKEN - From Codecov (auto-works for public repos)
```

### 2. Netlify Setup

1. Sign up at https://netlify.com
2. Create new site (can be empty initially)
3. Go to Site settings > General
4. Copy **Site ID**
5. Go to User settings > Applications
6. Generate **Personal access token**
7. Add both to GitHub secrets

### 3. Verify Workflows

Push to GitHub and check:

- Actions tab shows workflow runs
- All jobs pass (Lint, Type Check, Test, Build)
- Preview deployment works on PRs
- Production deployment works on main branch

## Workflows Overview

The project has **4 workflows**:

1. **Main CI/CD** - Full testing and Netlify deployment
2. **GitHub Pages Deploy** - Deployment to GitHub Pages (already exists)
3. **Dependency Check** - Security audits
4. **Performance Check** - Lighthouse and bundle size

### Main CI/CD (`.github/workflows/ci.yml`)

**Triggers:**

- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs:**

1. Lint (ESLint + Prettier)
2. Type Check (TypeScript)
3. Test (Full test suite + coverage)
4. Build (Production build)
5. Deploy Preview (PRs only)
6. Deploy Production (main branch only)

**Runtime:** ~4-6 minutes

### GitHub Pages Deploy (`.github/workflows/deploy.yml`)

**Note:** This workflow already existed in the repository.

**Triggers:**

- Push to `main`
- Manual workflow dispatch

**Jobs:**

1. Build (Production build)
2. Deploy (Deploy to GitHub Pages)

**Runtime:** ~2-3 minutes

**Setup:**

- Enable GitHub Pages in repository settings
- Set source to "GitHub Actions"

### Dependency Check (`.github/workflows/dependency-check.yml`)

**Triggers:**

- Weekly (Sundays at midnight UTC)
- Manual workflow dispatch

**Jobs:**

1. Security Audit (`npm audit`)
2. Update Dependencies (manual only)

**Runtime:** ~1-2 minutes

### Performance Check (`.github/workflows/performance.yml`)

**Triggers:**

- Pull requests to `main`

**Jobs:**

1. Lighthouse CI (Performance, A11y, Best Practices, SEO)
2. Bundle Size Check (Track bundle growth)

**Runtime:** ~2-3 minutes

## Common Commands

### Local Testing

```bash
# Run all CI checks locally
npm run lint              # Linting
npm run typecheck         # Type checking
npm run test:all          # All tests
npm run build             # Production build

# Fix issues
npm run lint:fix          # Auto-fix lint issues

# Coverage
npm run test:coverage     # Generate coverage report
```

### Workflow Management

```bash
# List workflows
gh workflow list

# Run workflow manually
gh workflow run "Dependency Check"

# View workflow runs
gh run list

# View specific run
gh run view <run-id>

# Download artifacts
gh run download <run-id>
```

## Troubleshooting

### Build Fails

```bash
# Check locally first
npm ci                    # Clean install
npm run lint              # Check linting
npm run typecheck         # Check types
npm run test:all          # Run tests
npm run build             # Build locally
```

### Secrets Not Working

1. Verify secret names match exactly (case-sensitive)
2. Check secret values have no trailing spaces
3. Regenerate tokens if expired
4. Verify repository permissions

### Tests Fail in CI Only

- Check for timezone issues
- Look for race conditions
- Verify test timeouts
- Check for environment-specific code

### Deployment Fails

1. Verify Netlify secrets are correct
2. Check build artifacts exist in `dist/`
3. Review Netlify deployment logs
4. Ensure site ID matches

## Status Badges

Add to README.md:

```markdown
![CI/CD Pipeline](https://github.com/USERNAME/REPO/workflows/CI%2FCD%20Pipeline/badge.svg)
![Dependency Check](https://github.com/USERNAME/REPO/workflows/Dependency%20Check/badge.svg)
![Performance Check](https://github.com/USERNAME/REPO/workflows/Performance%20Check/badge.svg)
```

Replace `USERNAME` and `REPO` with your GitHub username and repository name.

## Performance Optimization

### Workflow Speed Tips

1. **Parallel Jobs**: Lint, typecheck, and test run in parallel
2. **Dependency Caching**: `cache: 'npm'` speeds up installs ~40%
3. **Conditional Runs**: Performance checks only on PRs
4. **Artifact Reuse**: Build once, deploy twice (preview + production)

### Expected Runtimes

- **Lint**: 30-60 seconds
- **Type Check**: 30-60 seconds
- **Test**: 1-2 minutes
- **Build**: 1-2 minutes
- **Deploy**: 30-60 seconds
- **Total**: 4-6 minutes

## Security Best Practices

1. **Never commit secrets** to repository
2. **Rotate tokens** every 90 days
3. **Use minimum permissions** for tokens
4. **Review security alerts** weekly
5. **Update dependencies** regularly
6. **Enable Dependabot** for automated updates

## Monitoring

### What to Monitor

- **Workflow Success Rate**: Should be >95%
- **Test Coverage**: Aim for >80%
- **Bundle Size**: Watch for unexpected growth
- **Lighthouse Scores**: Performance, A11y, Best Practices
- **Security Alerts**: Address immediately

### GitHub Actions Insights

View in repository:

- Actions > Workflows > [Select Workflow] > Runs
- Insights > Dependency graph > Dependabot

### Netlify Analytics

View in Netlify:

- Site > Analytics > Performance
- Site > Deploys > Deploy log

## Advanced Configuration

### Custom Lighthouse Budgets

Create `.lighthouserc.js`:

```javascript
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
      },
    },
  },
};
```

### Custom Bundle Size Limits

Add to `package.json`:

```json
{
  "size-limit": [
    {
      "path": "dist/**/*.js",
      "limit": "500 KB"
    }
  ]
}
```

### Matrix Testing (Multiple Node Versions)

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]
```

## Resources

### Documentation

- [Full CI/CD Docs](./CI_CD.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Netlify Docs](https://docs.netlify.com/)
- [Lighthouse CI Docs](https://github.com/GoogleChrome/lighthouse-ci)

### Tools

- **GitHub CLI**: `gh` command for workflow management
- **act**: Run workflows locally
- **actionlint**: Lint workflow files

### Support

- Repository Issues
- GitHub Actions Community Forum
- Netlify Support Forum
- Stack Overflow (`github-actions` tag)

---

**Last Updated:** 2025-10-05
