# Performance Optimization Implementation Guide

## Quick Start - California Puzzle Game

**Status:** Ready for implementation
**Created:** 2025-10-11
**Estimated Time:** 2-3 hours

---

## What Was Delivered

### 1. Comprehensive Analysis

- **Report:** `/docs/PERFORMANCE_OPTIMIZATION_REPORT.md`
- Bundle size analysis (564 KB static data identified)
- Performance metrics baseline
- Mobile device targets
- Implementation timeline

### 2. Core Implementations

#### Lazy Loading System

**File:** `/src/data/lazy/index.ts`
**Purpose:** Reduce initial bundle by 440 KB (78%)

```typescript
// Usage example:
import { loadCountyBoundaries, preloadForGameMode } from '@/data/lazy';

// Load on demand
const boundaries = await loadCountyBoundaries();

// Or preload for specific mode
await preloadForGameMode('study');
```

#### Enhanced Web Vitals Tracking

**File:** `/src/utils/webVitalsEnhanced.ts`
**Purpose:** Monitor FCP, LCP, FID, CLS, INP, TTFB

```typescript
// Usage:
import { initWebVitals, getWebVitalsSnapshot } from '@/utils/webVitalsEnhanced';

// Initialize on app start
initWebVitals();

// Get current metrics
const vitals = await getWebVitalsSnapshot();
```

#### Performance Budget Monitoring

**File:** `/src/utils/performanceBudget.ts`
**Purpose:** Enforce performance budgets and detect regressions

```typescript
// Usage:
import { initPerformanceBudgetMonitoring } from '@/utils/performanceBudget';

// Initialize monitoring
initPerformanceBudgetMonitoring();
```

### 3. Configuration Updates

#### Vite Config Fix

**File:** `vite.config.ts`
**Fix:** Made Sentry optional to fix build errors

```typescript
rollupOptions: {
  external: ['@sentry/react'], // ✅ Sentry now optional
  // ... rest of config
}
```

---

## Step-by-Step Implementation

### Phase 1: Core Setup (30 minutes)

#### Step 1: Initialize Monitoring in Main Entry Point

**File:** `/src/main.tsx`

Add these imports at the top:

```typescript
import { initWebVitals } from './utils/webVitalsEnhanced';
import { initPerformanceBudgetMonitoring } from './utils/performanceBudget';
```

Add initialization after ReactDOM.createRoot:

```typescript
// Initialize performance monitoring
if (import.meta.env.PROD) {
  initWebVitals();
  initPerformanceBudgetMonitoring();
}
```

#### Step 2: Update Analytics Events

**File:** `/src/services/analytics.ts`

Add new events to AnalyticsEvent enum:

```typescript
export enum AnalyticsEvent {
  // ... existing events
  WEB_VITAL = 'web_vital',
  BUNDLE_SIZE = 'bundle_size',
  BUDGET_VIOLATION = 'budget_violation',
}
```

### Phase 2: Lazy Loading Integration (60 minutes)

#### Step 3: Update Game Store to Use Lazy Loading

**File:** `/src/stores/gameStore.ts`

Replace direct imports:

```typescript
// ❌ OLD: Direct import
import { californiaCounties } from '../data/californiaCounties';

// ✅ NEW: Lazy loading
import { loadCountyData } from '../data/lazy';

// In your store/component:
const initializeCounties = async () => {
  const counties = await loadCountyData();
  set({ counties });
};
```

#### Step 4: Update Study Mode

**File:** `/src/components/study/StudyMode.tsx`

Add lazy loading for study mode data:

```typescript
import { loadCountyBoundaries, loadMemoryAids } from '@/data/lazy';

useEffect(() => {
  const loadStudyData = async () => {
    setIsLoading(true);

    const [boundaries, aids] = await Promise.all([loadCountyBoundaries(), loadMemoryAids()]);

    // Use the data
    setIsLoading(false);
  };

  loadStudyData();
}, []);
```

#### Step 5: Update Quiz Mode

**File:** `/src/components/game/QuizMode.tsx` (if exists)

```typescript
import { loadQuizQuestions } from '@/data/lazy';

useEffect(() => {
  const loadQuiz = async () => {
    const questions = await loadQuizQuestions();
    setQuestions(questions);
  };

  loadQuiz();
}, []);
```

### Phase 3: Component Optimization (45 minutes)

#### Step 6: Add Preloading on User Interaction

**File:** `/src/components/game/GameModeSelector.tsx`

```typescript
import { preloadForGameMode } from '@/data/lazy';

const handleModeHover = (mode: string) => {
  // Preload data when user hovers over mode
  preloadForGameMode(mode);
};

return (
  <button
    onMouseEnter={() => handleModeHover('study')}
    onClick={() => selectMode('study')}
  >
    Study Mode
  </button>
);
```

#### Step 7: Optimize Map Components with React.memo

**File:** `/src/components/map/CaliforniaMapFixed.tsx`

Wrap export with React.memo:

```typescript
export const CaliforniaMapFixed = React.memo(
  ({ counties, onCountyClick, ...props }) => {
    // Existing implementation
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return (
      prevProps.counties.length === nextProps.counties.length &&
      prevProps.selectedCountyId === nextProps.selectedCountyId
    );
  }
);
```

### Phase 4: Testing & Validation (30 minutes)

#### Step 8: Add Performance Testing Script

**File:** `package.json`

Add new scripts:

```json
{
  "scripts": {
    "perf:analyze": "npm run build && open dist/stats.html",
    "perf:budget": "node scripts/check-bundle-budget.js",
    "perf:lighthouse": "lighthouse http://localhost:3000 --view"
  }
}
```

#### Step 9: Create Bundle Budget Check Script

**File:** `/scripts/check-bundle-budget.js`

```javascript
import { readFileSync } from 'fs';
import { join } from 'path';

const BUDGETS = {
  index: 150_000, // 150 KB initial
  'vendor-react': 100_000,
  'vendor-geo': 200_000,
  total: 400_000,
};

const statsFile = join(process.cwd(), 'dist', 'stats.json');
const stats = JSON.parse(readFileSync(statsFile, 'utf-8'));

let violations = 0;

Object.entries(stats.chunks).forEach(([name, chunk]) => {
  const budget = BUDGETS[name] || BUDGETS.total;

  if (chunk.size > budget) {
    console.error(`❌ ${name}: ${chunk.size} > ${budget}`);
    violations++;
  } else {
    console.log(`✅ ${name}: ${chunk.size} < ${budget}`);
  }
});

process.exit(violations > 0 ? 1 : 0);
```

#### Step 10: Test Build

```bash
# Build and analyze
npm run build
npm run perf:analyze

# Check budgets
npm run perf:budget

# Run Lighthouse (optional)
npm run perf:lighthouse
```

---

## Verification Checklist

After implementation, verify:

### Build Verification

- [ ] Build completes without errors
- [ ] Bundle size analysis shows reduction
- [ ] No console errors in production build
- [ ] Service worker updates correctly

### Runtime Verification

- [ ] Web Vitals are being tracked
- [ ] Performance budgets are monitored
- [ ] Lazy loading works on mode switch
- [ ] No performance regressions

### Mobile Testing

- [ ] Test on actual mobile device
- [ ] FPS stays above 30 on low-end devices
- [ ] Initial load < 3 seconds on 3G
- [ ] Interactions feel smooth

### Analytics Verification

- [ ] Web Vitals events appear in analytics
- [ ] Bundle size events tracked
- [ ] Budget violations logged (if any)

---

## Expected Results

### Before Optimization

- Initial bundle: ~560 KB
- FCP: ~3.2s
- LCP: ~5.1s
- TTI: ~6.8s

### After Optimization

- Initial bundle: ~120 KB (78% reduction)
- FCP: ~1.5s (53% faster)
- LCP: ~2.3s (55% faster)
- TTI: ~3.2s (53% faster)

---

## Troubleshooting

### Issue: Build fails with module not found

**Solution:** Ensure all imports use the lazy loading pattern:

```typescript
// Instead of:
import { data } from '@/data/large-file';

// Use:
import { loadData } from '@/data/lazy';
const data = await loadData();
```

### Issue: Data not loading on mode switch

**Solution:** Check async/await usage:

```typescript
// Ensure you're awaiting the lazy load
const handleModeChange = async (mode) => {
  setLoading(true);
  await preloadForGameMode(mode); // ✅ Await!
  setLoading(false);
};
```

### Issue: Performance metrics not showing

**Solution:** Check initialization order:

```typescript
// Must be called after DOM is ready
if (document.readyState === 'complete') {
  initWebVitals();
} else {
  window.addEventListener('load', initWebVitals);
}
```

---

## Next Steps

### Immediate (This Week)

1. Implement lazy loading for data files
2. Initialize Web Vitals tracking
3. Test on mobile devices

### Short-term (Next Sprint)

4. Add virtual scrolling for long lists
5. Optimize image loading
6. Implement advanced caching

### Long-term (Future)

7. Add performance monitoring dashboard
8. Set up automated performance testing
9. Create performance culture documentation

---

## Resources

### Documentation

- Full Report: `/docs/PERFORMANCE_OPTIMIZATION_REPORT.md`
- Web Vitals: https://web.dev/vitals/
- React Performance: https://react.dev/learn/render-and-commit

### Implementation Files

- Lazy Loading: `/src/data/lazy/index.ts`
- Web Vitals: `/src/utils/webVitalsEnhanced.ts`
- Budget Monitoring: `/src/utils/performanceBudget.ts`

### Tools

- Lighthouse: https://developers.google.com/web/tools/lighthouse
- Bundle Analyzer: Already configured in vite.config.ts
- Chrome DevTools Performance: Built into Chrome

---

## Support

**Questions?** Check the main report for detailed explanations:

- Bundle analysis details
- Performance metrics baseline
- Mobile device targets
- Testing strategies

**Need Help?** Contact the Performance Optimization Specialist or review:

- Implementation code comments
- Inline documentation
- Type definitions

---

**Last Updated:** 2025-10-11
**Status:** Ready for implementation
**Estimated ROI:** 78% bundle reduction, 50%+ performance improvement
