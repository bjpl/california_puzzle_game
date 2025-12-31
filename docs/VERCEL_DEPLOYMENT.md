# Vercel Deployment Guide

Complete guide for deploying the California Puzzle Game to Vercel.

## Prerequisites

- Node.js 18+ installed
- Vercel account (https://vercel.com)
- Supabase project (https://supabase.com)
- Vercel CLI installed (optional): `npm i -g vercel`

## Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push code to GitHub**

   ```bash
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure project settings:
     - Framework Preset: **Vite**
     - Build Command: `bash scripts/build-vercel.sh`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. **Add Environment Variables** (in Vercel dashboard)
   - Go to Settings > Environment Variables
   - Add the following variables for **Production**:
     ```
     VITE_SUPABASE_URL = https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY = your-anon-key
     VITE_BASE_URL = /
     NODE_ENV = production
     ```
   - Optional: Add `VITE_SENTRY_DSN` for error tracking

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your production URL

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Link your project**

   ```bash
   vercel link
   ```

4. **Add environment variables**

   ```bash
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   vercel env add VITE_BASE_URL production
   # Enter "/" when prompted for VITE_BASE_URL
   ```

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

## Configuration Files

### vercel.json

- Framework preset and build configuration
- SPA routing (rewrites all routes to index.html)
- Security headers (CSP, HSTS, X-Frame-Options)
- Cache headers for static assets
- Region configuration (SFO1 for California)

### scripts/build-vercel.sh

- Sets `VITE_BASE_URL=/` for Vercel deployment
- Validates environment variables
- Runs Vite build
- Verifies build output

### .env.production.example

- Template for production environment variables
- Documentation for all required/optional variables
- Security notes and setup instructions

## Environment Variables

| Variable                 | Required | Description           | Example                     |
| ------------------------ | -------- | --------------------- | --------------------------- |
| `VITE_SUPABASE_URL`      | Yes      | Supabase project URL  | `https://xxx.supabase.co`   |
| `VITE_SUPABASE_ANON_KEY` | Yes      | Supabase public key   | `eyJhbGc...`                |
| `VITE_BASE_URL`          | Yes      | Base path for app     | `/`                         |
| `VITE_SENTRY_DSN`        | No       | Sentry error tracking | `https://xxx@sentry.io/123` |
| `NODE_ENV`               | Yes      | Node environment      | `production`                |

## Security Features

The deployment includes production-grade security headers:

- **Content Security Policy (CSP)**: Restricts resource loading
- **HSTS**: Enforces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

## Performance Optimizations

- **Brotli/Gzip compression**: Automatic asset compression
- **Static asset caching**: 1-year cache for immutable assets
- **Code splitting**: Optimized vendor and feature chunks
- **Regional deployment**: SFO1 region for low latency
- **CDN**: Vercel's global edge network

## Troubleshooting

### Build fails with "dist directory not found"

- Check that `npm run build` works locally
- Verify `vite.config.ts` has correct output directory
- Check build logs in Vercel dashboard

### Assets not loading (404 errors)

- Verify `VITE_BASE_URL` is set to `/` in Vercel
- Check that asset paths in code use `import.meta.env.BASE_URL`
- Clear browser cache and try again

### Environment variables not working

- Ensure variables have `VITE_` prefix for client access
- Check variables are set in Vercel dashboard
- Verify variables are set for correct environment (Production/Preview)
- Redeploy after adding new variables

### Supabase connection errors

- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active and accessible
- Verify Row Level Security (RLS) policies allow public access where needed
- Check browser console for specific error messages

### Routes return 404

- Verify `vercel.json` has correct rewrites configuration
- Check that `cleanUrls: true` is set
- Ensure SPA routing is working (all routes should serve index.html)

## Monitoring & Analytics

### Vercel Analytics

Enable in Vercel dashboard:

1. Go to project Settings > Analytics
2. Enable Web Analytics
3. Optionally enable Speed Insights

### Sentry Error Tracking

1. Create project at https://sentry.io
2. Get DSN from project settings
3. Add `VITE_SENTRY_DSN` to Vercel environment variables
4. Redeploy

## Continuous Deployment

Vercel automatically deploys:

- **Production**: Commits to `main` branch
- **Preview**: Pull requests and other branches

### Branch Configuration

Configure in Vercel dashboard:

1. Settings > Git
2. Production Branch: `main`
3. Preview Branches: All branches

## Custom Domain

1. **Add domain in Vercel**
   - Settings > Domains
   - Add your domain
   - Follow DNS configuration instructions

2. **Update DNS records**
   - Add A/CNAME records as instructed
   - Wait for DNS propagation (up to 48 hours)

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - HTTPS enforced by default

## Migration from GitHub Pages

If migrating from GitHub Pages deployment:

1. **Base URL Change**:
   - GitHub Pages: `/california_puzzle_game/`
   - Vercel: `/`

2. **Update vite.config.ts**:
   - Already configured to use `process.env.VITE_BASE_URL`
   - Defaults to GitHub Pages path if not set

3. **Keep Both Deployments**:
   - GitHub Pages: Automatic from `gh-pages` branch
   - Vercel: Automatic from `main` branch
   - Both can run simultaneously

## Cost Considerations

**Vercel Free Tier includes:**

- 100 GB bandwidth/month
- 100 GB-Hrs build time/month
- Unlimited deployments
- SSL certificates
- Preview deployments

**Supabase Free Tier includes:**

- 500 MB database
- 1 GB file storage
- 2 GB bandwidth/month
- 50,000 monthly active users

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel CLI Reference**: https://vercel.com/docs/cli
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html
- **Supabase Docs**: https://supabase.com/docs
- **Project Issues**: https://github.com/yourusername/california_puzzle_game/issues

## Next Steps

After successful deployment:

1. ✅ Test all game features on production URL
2. ✅ Verify Supabase integration works
3. ✅ Check performance with Lighthouse
4. ✅ Enable Vercel Analytics
5. ✅ Configure custom domain (optional)
6. ✅ Set up Sentry error tracking (optional)
7. ✅ Add production URL to README
8. ✅ Update documentation with live demo link
