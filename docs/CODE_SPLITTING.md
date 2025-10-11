# Code Splitting Guide

## Overview

The California Counties Puzzle Game uses comprehensive code splitting and lazy loading to optimize bundle size and improve performance. This guide explains the strategy, implementation, and best practices.

## Bundle Structure

### Vendor Chunks

Organized by functionality to maximize caching:

- **vendor-react** (~45kb): React core libraries
  - `react`
  - `react-dom`

- **vendor-ui** (~30kb): UI and interaction libraries
  - `@dnd-kit/core`
  - `lucide-react`
  - `framer-motion`

- **vendor-geo** (~60kb): Geographic data processing
  - `d3`
  - `d3-geo`
  - `d3-selection`
  - `d3-zoom`
  - `d3-drag`

- **vendor-storage** (~15kb): State management
  - `zustand`

### Feature Chunks

Component-based chunks loaded on demand:

- **map-components**: Map rendering components
  - `CaliforniaMapFixed`
  - `CaliforniaMapCanvas`
  - `CaliforniaMapSimple`
  - `StudyModeMap`

- **study-mode**: Study mode features
  - `StudyMode`
  - `EnhancedStudyMode`
  - `StudyModeCard`

- **achievements**: Achievement system
  - `AchievementGallery`
  - `AchievementNotification`

- **game-features**: Advanced game features
  - `GameModeSelector`
  - `DifficultySystem`
  - `ProgressionSystem`

## Lazy Loading Strategy

### Component-Based Lazy Loading

Heavy or optional components are lazy loaded:

```typescript
import { lazy, Suspense } from 'react';

// Lazy load the component
const EnhancedStudyMode = lazy(() => import('../study/EnhancedStudyMode'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner message="Loading Study Mode..." />}>
  <EnhancedStudyMode onClose={handleClose} />
</Suspense>
```

### Dynamic Data Loading

GeoJSON data is loaded dynamically using the `GeoDataCache` utility:

```typescript
import { preloadCaliforniaGeoData } from '@/utils/geoDataCache';

// Preload during idle time
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    preloadCaliforniaGeoData();
  });
}
```

## Prefetching Strategy

### Hover/Focus Prefetching

Components are prefetched when users hover over navigation elements:

```typescript
import { prefetchStudyMode } from '@/utils/prefetch';

<Button
  onClick={handleClick}
  onMouseEnter={prefetchStudyMode}
  onFocus={prefetchStudyMode}
>
  Study Mode
</Button>
```

### Progressive Enhancement

1. **Initial Load**: Only essential components
2. **User Interaction**: Prefetch likely next components
3. **Idle Time**: Preload heavy data files
4. **On Demand**: Load as needed

## Loading States

### Loading Spinner

Generic loading indicator for lazy components:

```typescript
import LoadingSpinner from '@/components/shared/LoadingSpinner';

<LoadingSpinner message="Loading..." fullScreen={true} />
```

### Route Loader

Skeleton loading for route transitions:

```typescript
import RouteLoader from '@/components/shared/RouteLoader';

<Suspense fallback={<RouteLoader />}>
  <RouteComponent />
</Suspense>
```

## Performance Monitoring

### Web Vitals

Core Web Vitals are automatically tracked:

```typescript
import { reportWebVitals } from '@/utils/webVitals';

// In production
reportWebVitals({ debug: false });

// In development
reportWebVitals({ debug: true });
```

Metrics tracked:
- **CLS** (Cumulative Layout Shift): <0.1 (good), <0.25 (needs improvement)
- **FID** (First Input Delay): <100ms (good), <300ms (needs improvement)
- **FCP** (First Contentful Paint): <1.8s (good), <3.0s (needs improvement)
- **LCP** (Largest Contentful Paint): <2.5s (good), <4.0s (needs improvement)
- **TTFB** (Time to First Byte): <800ms (good), <1800ms (needs improvement)

### Bundle Analysis

Generate bundle visualization:

```bash
npm run build

# Open dist/stats.html to see bundle breakdown
```

The visualizer shows:
- Treemap of all chunks and their sizes
- Gzipped and Brotli sizes
- Module dependencies
- Largest modules

## Performance Targets

### Bundle Size Goals

- **Initial bundle**: <200kb gzipped
- **Route chunks**: <100kb each
- **Total size**: <700kb
- **Largest chunk**: <150kb

### Load Time Goals

- **First Contentful Paint (FCP)**: <1.5s
- **Largest Contentful Paint (LCP)**: <2.5s
- **Time to Interactive (TTI)**: <3.5s
- **First Input Delay (FID)**: <100ms

### Current Performance

Run `npm run build` to see current bundle sizes:

```
dist/assets/vendor-react.abc123.js     45kb gzipped
dist/assets/vendor-ui.def456.js        30kb gzipped
dist/assets/vendor-geo.ghi789.js       60kb gzipped
dist/assets/map-components.jkl012.js   40kb gzipped
dist/assets/study-mode.mno345.js       35kb gzipped
dist/assets/index.xyz999.js            50kb gzipped (main app)
```

## Best Practices

### Do's

✅ **Use lazy loading for routes and large components**
```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

✅ **Prefetch on hover for better UX**
```typescript
onMouseEnter={prefetchComponent}
```

✅ **Provide meaningful loading states**
```typescript
<Suspense fallback={<LoadingSpinner message="Loading maps..." />}>
```

✅ **Use dynamic imports for large data**
```typescript
const data = await import('./large-data.json');
```

✅ **Monitor performance with Web Vitals**
```typescript
reportWebVitals({ debug: true });
```

### Don'ts

❌ **Don't lazy load critical components**
```typescript
// Bad: Lazy loading the main game container
const GameContainer = lazy(() => import('./GameContainer'));
```

❌ **Don't create too many small chunks**
```typescript
// Bad: Over-splitting creates HTTP overhead
const TinyComponent = lazy(() => import('./TinyComponent'));
```

❌ **Don't forget error boundaries**
```typescript
// Bad: No error handling
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>

// Good: With error boundary
<ErrorBoundary>
  <Suspense fallback={<Loading />}>
    <LazyComponent />
  </Suspense>
</ErrorBoundary>
```

❌ **Don't prefetch everything**
```typescript
// Bad: Prefetching unused components
prefetchAllComponents(); // Wastes bandwidth
```

## Testing

### Build and Analyze

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview

# Analyze bundle (opens stats.html automatically)
# Check dist/stats.html in browser
```

### Performance Testing

```bash
# Run with production build
npm run build
npm run preview

# Test in browser DevTools:
# 1. Open DevTools > Performance
# 2. Start recording
# 3. Navigate through app
# 4. Check for:
#    - Long tasks (>50ms)
#    - Layout shifts
#    - Render blocking resources
```

### Lighthouse Audit

```bash
# Run Lighthouse in Chrome DevTools
# 1. Open app in Chrome
# 2. Open DevTools
# 3. Go to Lighthouse tab
# 4. Run audit
# 5. Check scores:
#    - Performance: >90
#    - Accessibility: >95
#    - Best Practices: >95
```

## Optimization Tips

### 1. Route-Based Splitting

Split at route boundaries for maximum effectiveness:

```typescript
// routes.tsx
const GamePage = lazy(() => import('./pages/Game'));
const StudyPage = lazy(() => import('./pages/Study'));
const AchievementsPage = lazy(() => import('./pages/Achievements'));
```

### 2. Component Splitting for Modals

Lazy load modal content:

```typescript
const HintModal = lazy(() => import('./modals/HintModal'));

{showHints && (
  <Suspense fallback={<div>Loading...</div>}>
    <HintModal />
  </Suspense>
)}
```

### 3. Dynamic Imports for Data

Load large data files on demand:

```typescript
async function loadCountyData(countyId: string) {
  const data = await import(`./data/counties/${countyId}.json`);
  return data.default;
}
```

### 4. Prefetch Critical Paths

Prefetch components users are likely to visit:

```typescript
// In main menu
<Link to="/study" onMouseEnter={prefetchStudyMode}>
  Study Mode
</Link>
```

### 5. Progressive Loading

Load in priority order:

1. Critical app shell
2. Current route components
3. Likely next routes (prefetch)
4. Heavy data files (idle time)
5. Optional features (on demand)

## Troubleshooting

### Large Bundle Size

**Problem**: Initial bundle >200kb gzipped

**Solutions**:
1. Check `dist/stats.html` for largest modules
2. Move large libraries to separate chunks
3. Use dynamic imports for optional features
4. Remove unused dependencies with `npm prune`

### Slow Initial Load

**Problem**: FCP >2s

**Solutions**:
1. Reduce initial bundle size
2. Use code splitting more aggressively
3. Preload critical resources in `index.html`
4. Enable HTTP/2 on server
5. Use CDN for static assets

### Poor Loading UX

**Problem**: Blank screen while loading

**Solutions**:
1. Add loading skeletons
2. Show loading spinners
3. Implement progressive rendering
4. Use SSR/SSG if needed

### Too Many Chunks

**Problem**: HTTP overhead from many small chunks

**Solutions**:
1. Increase chunk size threshold
2. Combine related components
3. Use fewer manual chunks
4. Let Vite's automatic splitting handle it

## Configuration Reference

### Vite Config

See `vite.config.ts` for current configuration:

```typescript
build: {
  chunkSizeWarningLimit: 500, // kb
  rollupOptions: {
    output: {
      manualChunks: {
        // Vendor chunks
        'vendor-react': ['react', 'react-dom'],
        'vendor-ui': ['@dnd-kit/core', 'lucide-react'],
        // ... more chunks
      }
    }
  }
}
```

### Bundle Visualizer

Configured in `vite.config.ts`:

```typescript
visualizer({
  filename: './dist/stats.html',
  open: false,
  gzipSize: true,
  brotliSize: true,
  template: 'treemap',
})
```

## Resources

- [Vite Code Splitting Guide](https://vitejs.dev/guide/features.html#code-splitting)
- [React Lazy and Suspense](https://react.dev/reference/react/lazy)
- [Web Vitals Documentation](https://web.dev/vitals/)
- [Bundle Analysis Tools](https://github.com/btd/rollup-plugin-visualizer)

## Changelog

### 2025-10-04 - Initial Implementation

- Added bundle visualizer
- Implemented component-based lazy loading
- Created prefetch utilities
- Added Web Vitals monitoring
- Split vendors into logical chunks
- Created loading components
- Added documentation
