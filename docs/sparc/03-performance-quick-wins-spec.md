# SPARC Specification: Performance Quick Wins

**Priority:** CRITICAL (9/10 ROI)
**Effort:** 2 hours
**Target:** Load time 3-5s → 1.5-2s (50%+ improvement)

---

## 1. SPECIFICATION PHASE

### 1.1 Requirements

#### Primary Requirements

1. **Remove Duplicate GeoJSON File** (Immediate Impact)
   - Delete `/california_counties.geojson` (16MB duplicate)
   - Verify application uses correct file (`/public/data/geo/california_counties.geojson`)
   - Update any references to removed file
   - Estimated savings: 16MB (24% of current page weight)

2. **DNS Prefetch for Supabase** (Network Optimization)
   - Add `<link rel="dns-prefetch">` for Supabase domains
   - Reduce DNS lookup time (~50-150ms savings)
   - Improve time to first byte for Supabase requests

3. **Disable Production Sourcemaps** (Bundle Size)
   - Configure Vite to exclude sourcemaps in production
   - Savings: ~800KB-1MB (sourcemap files)
   - No impact on debugging (sourcemaps available in development)

4. **Optimize Service Worker Pre-cache** (Critical Path)
   - Remove large GeoJSON from service worker pre-cache
   - Only cache critical assets (HTML, CSS, JS)
   - Load GeoJSON on-demand with network-first strategy

5. **Enable Brotli Compression** (Transfer Size)
   - Add Vite plugin for Brotli compression
   - Compress JS/CSS assets (20-30% better than gzip)
   - Configure server to serve .br files when available

#### Non-Functional Requirements

- **Zero Breaking Changes:** All optimizations must be transparent to users
- **Backward Compatibility:** Support browsers without Brotli (fallback to gzip)
- **Rollback Safety:** Each change can be reverted independently
- **Monitoring:** Track Web Vitals before/after deployment

### 1.2 Success Criteria

#### Acceptance Tests

1. **Duplicate File Removal**
   ```
   GIVEN: Application is running
   WHEN: Check network tab for california_counties.geojson
   THEN: Only one request is made (from /public/data/geo/)
   AND: Page weight reduced by 16MB
   ```

2. **DNS Prefetch**
   ```
   GIVEN: User loads application
   WHEN: Browser parses HTML <head>
   THEN: DNS lookup for Supabase domains starts immediately
   AND: Subsequent Supabase requests are faster (no DNS delay)
   ```

3. **Sourcemaps Disabled**
   ```
   GIVEN: Production build is created
   WHEN: Check dist/ folder
   THEN: No .map files are present
   AND: Bundle size reduced by ~1MB
   ```

4. **Service Worker Optimization**
   ```
   GIVEN: Service worker is installed
   WHEN: Check cached files in DevTools > Application > Cache Storage
   THEN: GeoJSON files are NOT pre-cached
   AND: GeoJSON loads via network-first strategy
   ```

5. **Brotli Compression**
   ```
   GIVEN: Production build is deployed
   WHEN: Request JS/CSS files with Accept-Encoding: br
   THEN: Server responds with Content-Encoding: br
   AND: File size reduced by 20-30% vs gzip
   ```

#### Validation Criteria

- **Lighthouse Performance:** 82 → 90+ (mobile)
- **Page Weight:** 66MB → 50MB (after duplicate removal)
- **Load Time (4G):** 3-5s → 1.5-2s
- **Time to Interactive:** < 3s (from current ~4s)

### 1.3 Edge Cases

1. **Service Worker Cache Miss**
   - If GeoJSON not in cache, load from network
   - Show loading indicator while fetching
   - Cache after successful fetch

2. **Brotli Not Supported**
   - Server falls back to gzip automatically
   - No user-facing degradation

3. **DNS Prefetch Ignored**
   - Older browsers ignore dns-prefetch hint
   - No negative impact (graceful degradation)

4. **Production Build Without Sourcemaps**
   - Error tracking services (Sentry) can upload sourcemaps separately
   - Debugging possible in development environment

---

## 2. PSEUDOCODE PHASE

### 2.1 Duplicate File Removal

```bash
# Algorithm: Safe file removal
function removeDuplicateGeoJSON() {
  # 1. Verify duplicate exists
  if [ -f "/california_counties.geojson" ]; then

    # 2. Verify correct file exists
    if [ -f "/public/data/geo/california_counties.geojson" ]; then

      # 3. Search codebase for references
      references=$(grep -r "california_counties.geojson" --exclude-dir=node_modules)

      # 4. Verify all references point to /public/data/geo/
      if [[ $references == *"/public/data/geo/"* ]]; then

        # 5. Safe to delete duplicate
        rm "/california_counties.geojson"
        echo "✓ Removed 16MB duplicate file"
      else
        echo "✗ Found references to root file, manual review needed"
      fi
    fi
  fi
}
```

### 2.2 DNS Prefetch Configuration

```html
<!-- index.html <head> section -->
<head>
  <!-- Existing meta tags -->

  <!-- DNS Prefetch for external domains -->
  <link rel="dns-prefetch" href="//[supabase-project-id].supabase.co" />
  <link rel="preconnect" href="//[supabase-project-id].supabase.co" crossorigin />

  <!-- Optional: Prefetch for CDNs if used -->
  <!-- <link rel="dns-prefetch" href="//cdn.example.com" /> -->
</head>

<!-- Performance impact calculation -->
// DNS lookup time: ~50-150ms
// With prefetch: ~0ms (parallel with HTML parse)
// Savings per Supabase request: 50-150ms
```

### 2.3 Sourcemap Configuration

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: process.env.NODE_ENV === 'development', // Only in dev
    rollupOptions: {
      output: {
        // Additional optimization: manual chunks
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'game': ['zustand', 'd3-geo', 'topojson-client']
        }
      }
    }
  }
});

// Expected savings:
// - main.js.map: ~500KB
// - vendor.js.map: ~300KB
// - Total: ~800KB reduction in production
```

### 2.4 Service Worker Optimization

```javascript
// public/sw.js - Before
const CACHE_NAME = 'california-game-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/california_counties.geojson', // ❌ 16MB file
  // ... other assets
];

// public/sw.js - After
const CACHE_NAME = 'california-game-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // ✓ Removed large GeoJSON from pre-cache
];

// Network-first strategy for GeoJSON
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Large data files: network-first, cache as fallback
  if (url.pathname.includes('.geojson') || url.pathname.includes('.topojson')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
  }
});
```

### 2.5 Brotli Compression

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // Only compress files > 10KB
      deleteOriginFile: false, // Keep original for fallback
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false,
    })
  ],
});

// Compression comparison:
// main.js (uncompressed): 500KB
// main.js.gz (gzip): 150KB (70% reduction)
// main.js.br (brotli): 120KB (76% reduction)
// Savings: 30KB (20% better than gzip)
```

---

## 3. ARCHITECTURE PHASE

### 3.1 File Structure Changes

```
Project Root
├── california_counties.geojson  [DELETE - 16MB duplicate]
├── public/
│   ├── data/
│   │   └── geo/
│   │       └── california_counties.geojson  [KEEP]
│   └── sw.js  [MODIFY - Remove GeoJSON from pre-cache]
├── index.html  [MODIFY - Add DNS prefetch]
├── vite.config.ts  [MODIFY - Sourcemap + Brotli]
└── dist/ (production build)
    ├── assets/
    │   ├── main.[hash].js
    │   ├── main.[hash].js.br  [NEW - Brotli compressed]
    │   ├── main.[hash].js.gz  [NEW - Gzip compressed]
    │   └── main.[hash].js.map  [REMOVED in production]
```

### 3.2 Build Pipeline Changes

```
Before:
  npm run build
    ↓
  Vite bundles code
    ↓
  Generates sourcemaps (800KB)
    ↓
  Outputs uncompressed files
    ↓
  dist/ folder (2.5MB + 800KB maps)

After:
  npm run build
    ↓
  Vite bundles code
    ↓
  Sourcemaps only in dev
    ↓
  Brotli plugin compresses files
    ↓
  Gzip plugin compresses files
    ↓
  dist/ folder (2.5MB + .br + .gz versions)
    ↓
  Total: 2.5MB uncompressed, ~800KB Brotli
```

### 3.3 Network Waterfall Impact

```
Before:
0ms     HTML request
200ms   DNS lookup for Supabase
250ms   Connect to Supabase
500ms   GeoJSON request starts
3000ms  GeoJSON loaded (16MB duplicate)

After:
0ms     HTML request (DNS prefetch starts)
200ms   Connect to Supabase (DNS already resolved)
250ms   GeoJSON request starts
1000ms  GeoJSON loaded (network-first, Brotli compressed)
```

### 3.4 Testing Strategy

#### Build Tests

```bash
# Test script: verify-production-build.sh
#!/bin/bash

echo "🔍 Verifying production build..."

# 1. Check sourcemaps are removed
if ls dist/**/*.map 1> /dev/null 2>&1; then
  echo "❌ Found sourcemaps in production build"
  exit 1
else
  echo "✓ No sourcemaps in production"
fi

# 2. Check Brotli files exist
if ls dist/**/*.br 1> /dev/null 2>&1; then
  echo "✓ Brotli files generated"
else
  echo "❌ No Brotli files found"
  exit 1
fi

# 3. Check duplicate file removed
if [ -f "california_counties.geojson" ]; then
  echo "❌ Duplicate GeoJSON still exists"
  exit 1
else
  echo "✓ Duplicate file removed"
fi

# 4. Verify DNS prefetch in HTML
if grep -q "dns-prefetch.*supabase" dist/index.html; then
  echo "✓ DNS prefetch configured"
else
  echo "❌ DNS prefetch missing"
  exit 1
fi

echo "✅ All production build checks passed"
```

#### Performance Tests (Lighthouse CI)

```yaml
# lighthouserc.yml
ci:
  collect:
    numberOfRuns: 3
    settings:
      preset: 'desktop'
  assert:
    assertions:
      'categories:performance': ['error', { minScore: 0.9 }]  # 90+
      'first-contentful-paint': ['error', { maxNumericValue: 1500 }]
      'largest-contentful-paint': ['error', { maxNumericValue: 2500 }]
      'total-blocking-time': ['error', { maxNumericValue: 300 }]
      'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }]
```

---

## 4. REFINEMENT PLAN (TDD APPROACH)

### 4.1 Implementation Steps (Prioritized)

#### Step 1: Remove Duplicate File (5 minutes)

```bash
# TDD: Verify file exists first
test -f /home/user/california_puzzle_game/california_counties.geojson && echo "File exists"

# Verify no code references it
cd /home/user/california_puzzle_game
grep -r "california_counties.geojson" --exclude-dir=node_modules | grep -v "public/data/geo"

# Safe to delete
rm /home/user/california_puzzle_game/california_counties.geojson

# Verify deletion
test ! -f /home/user/california_puzzle_game/california_counties.geojson && echo "✓ Deleted"
```

**Expected Impact:**
- Page weight: 66MB → 50MB (-24%)
- Load time improvement: ~500ms-1s (depending on network)

#### Step 2: Add DNS Prefetch (2 minutes)

```html
<!-- index.html - Add to <head> -->
<link rel="dns-prefetch" href="//[PROJECT-ID].supabase.co" />
<link rel="preconnect" href="//[PROJECT-ID].supabase.co" crossorigin />
```

**Expected Impact:**
- DNS lookup time: 50-150ms → 0ms (parallel)
- Supabase request speed: +50-150ms faster

**Test:**
```javascript
// Chrome DevTools > Network > Timing tab
// Before: DNS Lookup: 120ms
// After: DNS Lookup: 0ms (from cache)
```

#### Step 3: Disable Production Sourcemaps (30 minutes)

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: false, // Disable in production
    // Alternative: 'hidden' (generates but doesn't reference in JS)
  }
});
```

**Test:**
```bash
npm run build
ls dist/**/*.map  # Should return "No such file"
```

**Expected Impact:**
- Bundle size: 2.5MB → 1.7MB (-32%)
- No functional impact (sourcemaps only for debugging)

#### Step 4: Optimize Service Worker (45 minutes)

```javascript
// public/sw.js - Modify pre-cache list
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Remove: '/california_counties.geojson'
];

// Add network-first strategy for large files
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.endsWith('.geojson') || url.pathname.endsWith('.topojson')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Default cache-first strategy for other files
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
```

**Test:**
```javascript
// In Chrome DevTools > Application > Service Workers
// 1. Clear all caches
// 2. Reload page
// 3. Check Cache Storage
// 4. Verify GeoJSON NOT in cache initially
// 5. Load game
// 6. Verify GeoJSON now in cache (network-first cached it)
```

**Expected Impact:**
- Initial cache size: 18MB → 2MB (-89%)
- First load: Slightly slower (network fetch)
- Subsequent loads: Same speed (cached)

#### Step 5: Enable Brotli Compression (30 minutes)

```bash
# Install plugin
npm install -D vite-plugin-compression
```

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // 10KB
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
    })
  ],
});
```

**Server Configuration (if needed):**
```nginx
# nginx.conf
location ~* \.(js|css|svg)$ {
  gzip_static on;
  brotli_static on;
}
```

**Test:**
```bash
npm run build
ls dist/assets/*.br  # Verify .br files exist

# Test compression ratio
original=$(wc -c < dist/assets/main.*.js)
brotli=$(wc -c < dist/assets/main.*.js.br)
ratio=$(echo "scale=2; (1 - $brotli / $original) * 100" | bc)
echo "Brotli compression: ${ratio}%"
```

**Expected Impact:**
- JS bundle transfer size: 500KB → 120KB (-76%)
- CSS bundle transfer size: 50KB → 12KB (-76%)
- Total savings: ~400KB per page load

### 4.2 Verification & Testing

#### Automated Tests

```typescript
// tests/build/performance.test.ts
import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

describe('Production Build Performance', () => {
  test('no sourcemaps in dist folder', () => {
    const distFiles = readdirSync('dist', { recursive: true });
    const mapFiles = distFiles.filter(f => f.endsWith('.map'));
    expect(mapFiles).toHaveLength(0);
  });

  test('Brotli files generated', () => {
    const distFiles = readdirSync('dist/assets');
    const brFiles = distFiles.filter(f => f.endsWith('.br'));
    expect(brFiles.length).toBeGreaterThan(0);
  });

  test('DNS prefetch in HTML', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    expect(html).toContain('dns-prefetch');
    expect(html).toContain('supabase');
  });

  test('duplicate GeoJSON removed', () => {
    const rootFiles = readdirSync('.');
    expect(rootFiles).not.toContain('california_counties.geojson');
  });
});
```

#### Performance Monitoring

```typescript
// src/utils/analytics.ts
export function trackWebVitals() {
  if ('web-vital' in window) {
    // Track Core Web Vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);  // Cumulative Layout Shift
      getFID(console.log);  // First Input Delay
      getFCP(console.log);  // First Contentful Paint
      getLCP(console.log);  // Largest Contentful Paint
      getTTFB(console.log); // Time to First Byte
    });
  }
}
```

---

## 5. COMPLETION CRITERIA

### 5.1 Build Validation

#### Pre-Deployment Checklist
- [ ] Duplicate file removed from repository
- [ ] DNS prefetch tags present in index.html
- [ ] Sourcemaps disabled in production build
- [ ] Service worker pre-cache excludes GeoJSON
- [ ] Brotli compression plugin installed and configured
- [ ] Build script runs without errors
- [ ] All automated tests pass

#### Build Verification
```bash
# Run verification script
npm run build
npm run test:build  # Custom script for build tests

# Manual checks
ls dist/**/*.map  # Should be empty
ls dist/**/*.br   # Should have compressed files
cat dist/index.html | grep dns-prefetch  # Should find tags
```

### 5.2 Performance Metrics

#### Target Metrics (Lighthouse Mobile)

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Performance Score | 82 | 90+ | ✅ 90+ |
| First Contentful Paint | 1.8s | 1.2s | ✅ <1.5s |
| Largest Contentful Paint | 3.2s | 2.0s | ✅ <2.5s |
| Total Blocking Time | 250ms | 150ms | ✅ <300ms |
| Cumulative Layout Shift | 0.05 | 0.05 | ✅ <0.1 |
| Speed Index | 2.5s | 1.8s | ✅ <2.0s |

#### Network Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Page Weight | 66MB | 50MB | -24% |
| Transfer Size | 2.5MB | 1.0MB | -60% (Brotli) |
| Total Requests | 25 | 24 | -1 (no duplicate) |
| Load Time (4G) | 4.5s | 1.8s | -60% |
| Load Time (3G) | 10s | 4s | -60% |

### 5.3 Functional Testing

#### Regression Tests
- [ ] Application loads correctly
- [ ] GeoJSON data displays on map
- [ ] Service worker caches assets
- [ ] Offline mode works (after initial load)
- [ ] No console errors
- [ ] All game features functional

#### Cross-Browser Testing
- [ ] Chrome (Brotli support)
- [ ] Firefox (Brotli support)
- [ ] Safari (Brotli support)
- [ ] Edge (Brotli support)
- [ ] iOS Safari (mobile)
- [ ] Chrome Android (mobile)

### 5.4 Monitoring Setup

#### Post-Deployment Monitoring

```typescript
// Add to main.tsx
import { trackWebVitals } from './utils/analytics';

trackWebVitals();

// Log performance metrics to analytics
function sendToAnalytics(metric: any) {
  // Example: Send to Google Analytics
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    metric_id: metric.id,
    metric_delta: metric.delta,
  });
}
```

#### Alerts & Thresholds

```yaml
# performance-alerts.yml
alerts:
  - name: "Performance Degradation"
    condition: "lighthouse_score < 90"
    action: "notify_team"

  - name: "Bundle Size Increase"
    condition: "bundle_size > 2.0MB"
    action: "block_deployment"

  - name: "Load Time Regression"
    condition: "load_time > 3s (4G)"
    action: "investigate"
```

### 5.5 Rollback Plan

#### Rollback Triggers
- Performance score drops below 85
- Application errors increase > 5%
- User complaints about slow loading

#### Rollback Steps
```bash
# 1. Revert git commit
git revert HEAD

# 2. Rebuild
npm run build

# 3. Deploy
npm run deploy

# 4. Verify metrics recovered
npm run lighthouse
```

#### Individual Rollback (if only one change causes issues)

```typescript
// Revert sourcemap: vite.config.ts
build: {
  sourcemap: true, // Re-enable
}

// Revert Brotli: Remove plugin
// plugins: [react()],  // Remove viteCompression

// Revert service worker: Add GeoJSON back to pre-cache
// urlsToCache: ['/', '/index.html', '/california_counties.geojson'],
```

### 5.6 Documentation

#### Update Documentation
- [ ] README: Document build optimizations
- [ ] CONTRIBUTING: Note sourcemaps disabled in prod
- [ ] DEPLOYMENT: Add Brotli server configuration
- [ ] CHANGELOG: Document performance improvements

#### Performance Report

```markdown
# Performance Optimization Report

## Changes Implemented
1. ✅ Removed duplicate 16MB GeoJSON file
2. ✅ Added DNS prefetch for Supabase
3. ✅ Disabled production sourcemaps
4. ✅ Optimized service worker pre-cache
5. ✅ Enabled Brotli compression

## Results
- **Page Weight:** 66MB → 50MB (-24%)
- **Transfer Size:** 2.5MB → 1.0MB (-60%)
- **Load Time (4G):** 4.5s → 1.8s (-60%)
- **Lighthouse Score:** 82 → 92 (+10 points)

## Impact
- Better mobile experience
- Faster time to interactive
- Reduced bandwidth costs
- Improved Core Web Vitals
```

---

## APPENDIX A: Implementation Checklist

### Quick Reference

```bash
# Step 1: Remove duplicate (1 min)
rm /home/user/california_puzzle_game/california_counties.geojson

# Step 2: Add DNS prefetch (1 min)
# Edit index.html: Add <link rel="dns-prefetch" href="//[PROJECT].supabase.co" />

# Step 3: Disable sourcemaps (1 min)
# Edit vite.config.ts: build.sourcemap = false

# Step 4: Optimize service worker (30 min)
# Edit public/sw.js: Remove GeoJSON from urlsToCache, add network-first

# Step 5: Enable Brotli (30 min)
npm install -D vite-plugin-compression
# Edit vite.config.ts: Add viteCompression plugin

# Build & test
npm run build
npm run preview
```

### Files Modified Summary

1. ❌ `/california_counties.geojson` - DELETE
2. ✏️ `/index.html` - Add DNS prefetch
3. ✏️ `/vite.config.ts` - Sourcemap + Brotli
4. ✏️ `/public/sw.js` - Remove GeoJSON pre-cache
5. ➕ `/tests/build/performance.test.ts` - NEW

---

## APPENDIX B: Server Configuration

### Nginx (Brotli Support)

```nginx
http {
  # Enable Brotli
  brotli on;
  brotli_static on;
  brotli_types text/plain text/css application/javascript application/json image/svg+xml;

  # Enable Gzip (fallback)
  gzip on;
  gzip_static on;
  gzip_types text/plain text/css application/javascript application/json;

  # Cache headers
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### Vercel (Auto-Configured)

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

**Estimated Completion:** 2 hours
**Risk Level:** LOW (non-breaking, well-tested)
**Impact:** CRITICAL (50%+ performance improvement)
**ROI:** 9/10 ⭐⭐⭐⭐⭐
