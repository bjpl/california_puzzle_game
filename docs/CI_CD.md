# CI/CD Pipeline Documentation

## Overview

The project uses GitHub Actions for continuous integration and deployment with automated testing, linting, building, and deployment to production.

## Workflows

The project includes four GitHub Actions workflows for comprehensive CI/CD automation:

1. **Main CI/CD Pipeline** - Testing, linting, building, Netlify deployment
2. **GitHub Pages Deploy** - Deployment to GitHub Pages (existing)
3. **Dependency Check** - Security audits and dependency updates
4. **Performance Check** - Lighthouse CI and bundle size monitoring

### 1. Main CI/CD Pipeline (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**

1. **Lint** - Code quality checks
   - ESLint for TypeScript/React
   - Prettier formatting verification

2. **Type Check** - TypeScript compilation
   - Ensures no type errors
   - Validates all `.ts` and `.tsx` files

3. **Test** - Full test suite execution
   - Unit tests
   - Integration tests
   - Accessibility tests
   - Performance tests
   - Code coverage reporting to Codecov

4. **Build** - Production build
   - Vite production build
   - Artifact upload for deployment
   - Runs only after lint, typecheck, and test pass

5. **Deploy Preview** - PR preview deployments
   - Deploys to Netlify preview URL
   - Triggered on pull requests
   - Provides preview link in PR comments

6. **Deploy Production** - Production deployment
   - Deploys to Netlify production
   - Triggered on push to `main` branch
   - Automatic production updates

**Status Badges:**

Add to README.md:

```markdown
![CI/CD](https://github.com/bjpl/california_puzzle_game/workflows/CI%2FCD%20Pipeline/badge.svg)
![Coverage](https://codecov.io/gh/bjpl/california_puzzle_game/branch/main/graph/badge.svg)
```

### 2. GitHub Pages Deploy (`.github/workflows/deploy.yml`)

**Note:** This workflow already exists in the repository.

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Jobs:**

1. **Build**
   - Node.js 20 setup with npm caching
   - Production build with Vite
   - Upload build artifact for GitHub Pages

2. **Deploy**
   - Deploy to GitHub Pages
   - Provides deployment URL
   - Requires GitHub Pages to be enabled in repository settings

**Permissions:**
- `contents: read` - Read repository content
- `pages: write` - Write to GitHub Pages
- `id-token: write` - OIDC token for deployment

**Setup:**
1. Go to repository Settings > Pages
2. Set source to "GitHub Actions"
3. Workflow will deploy on next push to main

**Note:** If using both Netlify and GitHub Pages, GitHub Pages serves as a backup deployment or can be disabled.

### 3. Dependency Check (`.github/workflows/dependency-check.yml`)

**Triggers:**
- Weekly schedule (Sundays at midnight UTC)
- Manual workflow dispatch

**Jobs:**

1. **Security Audit**
   - Runs `npm audit` for security vulnerabilities
   - Checks for outdated packages
   - Fails on moderate+ severity issues

2. **Update Dependencies** (Manual only)
   - Updates all dependencies
   - Applies security fixes
   - Creates automated PR with updates

### 4. Performance Monitoring (`.github/workflows/performance.yml`)

**Triggers:**
- Pull requests to `main` branch

**Jobs:**

1. **Lighthouse CI**
   - Performance audit
   - Accessibility audit
   - Best practices check
   - SEO validation
   - Uploads results to temporary storage

2. **Bundle Size Check**
   - Analyzes production bundle size
   - Reports size breakdown
   - Tracks bundle growth over time

## Setup Instructions

### 1. Configure Netlify Deployment

**Step 1: Create Netlify Site**
1. Sign up/login at https://netlify.com
2. Create new site from Git or manual deployment
3. Note the Site ID from site settings

**Step 2: Generate Access Token**
1. Go to User Settings > Applications
2. Create new personal access token
3. Copy the token (you won't see it again)

**Step 3: Add GitHub Secrets**
1. Go to repository Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Add the following secrets:
   - `NETLIFY_AUTH_TOKEN` - Your personal access token
   - `NETLIFY_SITE_ID` - Your site ID

### 2. Configure Code Coverage (Optional)

**Step 1: Setup Codecov**
1. Sign up at https://codecov.io
2. Add your repository
3. Get upload token from repository settings

**Step 2: Add GitHub Secret**
1. Go to repository Settings > Secrets and variables > Actions
2. Add secret:
   - `CODECOV_TOKEN` - Your upload token

Note: Codecov also works without token for public repositories.

### 3. Enable GitHub Pages (Optional)

For GitHub Pages deployment instead of Netlify:

1. Go to repository Settings > Pages
2. Set source to "GitHub Actions"
3. Update workflow to use `actions/deploy-pages@v4`

## Local Testing

### Test Workflows Locally with Act

```bash
# Install act (GitHub Actions local runner)
# macOS
brew install act

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Windows
choco install act-cli

# Run workflows locally
act pull_request  # Test PR workflow
act push          # Test push workflow
act -l            # List available workflows
```

### Manual Testing Commands

```bash
# Run all CI checks locally
npm run lint           # Lint check
npm run typecheck      # Type check
npm run test:all       # Run all tests
npm run build          # Production build

# Fix issues
npm run lint:fix       # Auto-fix lint issues
npm run test:coverage  # Generate coverage report
```

## Troubleshooting

### Build Fails

**Issue:** Build fails in CI but works locally

**Solutions:**
- Verify Node.js version matches (20.x)
- Check for environment-specific code
- Ensure all dependencies are in `package.json`
- Clear npm cache: `npm ci` (clean install)

**Issue:** Type errors in CI

**Solutions:**
- Run `npm run typecheck` locally
- Ensure TypeScript version matches
- Check for missing type definitions

### Tests Fail

**Issue:** Tests pass locally but fail in CI

**Solutions:**
- Check for timezone/locale differences
- Look for race conditions in async tests
- Verify test timeouts are sufficient
- Ensure test data is not environment-dependent

**Issue:** Coverage upload fails

**Solutions:**
- Verify `CODECOV_TOKEN` secret is set
- Check coverage file path is correct
- Ensure coverage is generated before upload

### Deployment Fails

**Issue:** Netlify deployment fails

**Solutions:**
- Verify `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` are correct
- Check build artifacts are generated
- Review Netlify deployment logs
- Ensure `dist/` directory exists and has content

**Issue:** Preview deployment not commenting on PR

**Solutions:**
- Verify repository permissions
- Check GitHub token has required scopes
- Review Netlify integration settings

### Performance Check Fails

**Issue:** Lighthouse CI fails

**Solutions:**
- Ensure preview server starts correctly
- Check Lighthouse budgets are realistic
- Review performance regression details
- May need to increase timeouts for slower builds

## Best Practices

### 1. Pre-Commit Checks

Always run these locally before pushing:

```bash
npm run lint
npm run typecheck
npm run test:all
npm run build
```

Consider using husky pre-commit hooks (already configured).

### 2. Conventional Commits

Use conventional commit format for better changelogs:

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

### 3. Branch Strategy

- `main` - Production branch (protected)
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### 4. Pull Request Workflow

1. Create feature branch from `develop`
2. Make changes and commit
3. Push branch and create PR
4. Wait for CI checks to pass
5. Review preview deployment
6. Request review from team
7. Merge after approval

### 5. Monitoring

- Review workflow runs regularly
- Check coverage trends
- Monitor bundle size growth
- Address security vulnerabilities promptly
- Review Lighthouse scores

### 6. Optimization Tips

- Keep workflows fast (parallel jobs)
- Cache dependencies aggressively
- Use artifacts for build outputs
- Fail fast on critical errors
- Run expensive checks only when needed

## Workflow Optimization

### Current Performance

- **Lint**: ~30-60 seconds
- **Type Check**: ~30-60 seconds
- **Test**: ~1-2 minutes
- **Build**: ~1-2 minutes
- **Total**: ~4-6 minutes per run

### Optimization Strategies

1. **Dependency Caching**
   - Already using `cache: 'npm'`
   - Speeds up npm install by ~40%

2. **Parallel Jobs**
   - Lint, typecheck, and test run in parallel
   - Build only runs after all pass

3. **Conditional Workflows**
   - Performance checks only on PRs
   - Deployment only on specific branches

4. **Artifact Reuse**
   - Build artifacts shared between jobs
   - Avoids rebuilding for deployment

## Security Considerations

### Secrets Management

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate tokens regularly
- Use minimum required permissions

### Dependency Security

- Weekly automated security audits
- Fail on moderate+ severity issues
- Optional automated dependency updates
- Review dependency changes before merging

### Code Security

- ESLint security rules enabled
- React security best practices
- XSS prevention in templates
- Sanitize user inputs

## Monitoring and Alerts

### GitHub Notifications

Configure notifications for:
- Workflow failures
- Security alerts
- Pull request status
- Deployment success/failure

### External Monitoring

Consider integrating:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Google Analytics** - Usage metrics
- **Netlify Analytics** - Performance metrics

## Resources

### Documentation

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Netlify Deployment](https://docs.netlify.com/)
- [Codecov Documentation](https://docs.codecov.com/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Tools

- [act](https://github.com/nektos/act) - Run workflows locally
- [Actionlint](https://github.com/rhysd/actionlint) - Workflow linter
- [GitHub CLI](https://cli.github.com/) - Manage workflows from terminal

### Support

- Repository Issues: https://github.com/bjpl/california_puzzle_game/issues
- GitHub Actions Community: https://github.community/
- Netlify Support: https://answers.netlify.com/

## Maintenance

### Weekly Tasks

- Review failed workflow runs
- Check for dependency updates
- Monitor coverage trends
- Review security alerts

### Monthly Tasks

- Update workflow dependencies (actions)
- Review and optimize workflow performance
- Update documentation
- Audit GitHub secrets and permissions

### Quarterly Tasks

- Review and update CI/CD strategy
- Evaluate new tools and practices
- Performance benchmarking
- Security audit
