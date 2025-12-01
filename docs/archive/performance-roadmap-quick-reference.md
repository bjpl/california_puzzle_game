# Performance Optimization Roadmap - Quick Reference

## 🚨 Critical Actions (Do First)

### Week 1: Critical Issues 🔴

**Target:** Reduce load time by 60-70%

```bash
# 1. Convert GeoJSON to TopoJSON (BIGGEST IMPACT: -40-45MB)
npm install -g topojson-server topojson-simplify
cd public/data/geo

# Convert each file:
geo2topo counties=ca-counties-high.geojson | \
  toposimplify -s 1e-7 -f | \
  topoquantize 1e5 > ca-counties-high.topojson

# Repeat for: medium, low, ultra-low

# 2. Remove duplicate file (-16MB)
git rm /home/user/california_puzzle_game/california_counties.geojson

# 3. Optimize service worker pre-cache (-2.2MB)
# Edit public/sw.js:29 - Remove ca-counties-low.geojson

# 4. Add compression
npm install -D vite-plugin-compression

# 5. Disable production sourcemaps
# Edit vite.config.ts:40
sourcemap: import.meta.env.MODE === 'development'
```

**Expected Result:** 8-12s → 1.5-2s load time (60-70% faster)

---

## ⚡ Quick Wins (< 2 hours)

### 5-Minute Fixes

1. **Remove duplicate GeoJSON** (-16MB)

   ```bash
   git rm california_counties.geojson
   ```

2. **Add DNS prefetch** (-100-300ms)

   ```html
   <!-- index.html:46 -->
   <link rel="dns-prefetch" href="https://pfwberdnxkuvuupjmauq.supabase.co" />
   ```

3. **Disable sourcemaps** (-30-40%)

   ```typescript
   // vite.config.ts:40
   sourcemap: false;
   ```

4. **Lower chunk warning** (Better monitoring)
   ```typescript
   // vite.config.ts:41
   chunkSizeWarningLimit: 300;
   ```

### 30-Minute Fixes

5. **Add compression plugin** (-70-80% transfer size)

   ```bash
   npm install -D vite-plugin-compression
   ```

   ```typescript
   // vite.config.ts
   import compression from 'vite-plugin-compression';

   plugins: [compression({ algorithm: 'brotliCompress', ext: '.br' })];
   ```

6. **Reduce SW pre-cache** (-2.2MB)
   ```javascript
   // public/sw.js:29 - Remove this line:
   `${BASE_PATH}/data/geo/ca-counties-low.geojson`,
   ```

---

## 📊 Performance Metrics

### Current State

| Metric            | Value  | Status      |
| ----------------- | ------ | ----------- |
| Initial Load (4G) | 3-5s   | ⚠️ Fair     |
| Total Page Weight | 53MB   | ❌ Critical |
| GeoJSON Size      | 50MB   | ❌ Critical |
| Bundle Size       | ~2.5MB | ⚠️ Poor     |
| Lighthouse Score  | ~70    | ⚠️ Fair     |

### After Week 1 (Phase 1)

| Metric            | Target  | Improvement |
| ----------------- | ------- | ----------- |
| Initial Load (4G) | 1.5-2s  | **-60%** 🔥 |
| Total Page Weight | 10-15MB | **-70%** 🔥 |
| GeoJSON Size      | 5-8MB   | **-85%** 🔥 |
| Bundle Size       | ~2.2MB  | **-12%** ✅ |
| Lighthouse Score  | 85-90   | **+20%** ✅ |

### Final Goal (Phase 3)

| Metric            | Target | Status       |
| ----------------- | ------ | ------------ |
| Initial Load (4G) | <1.5s  | 🏆 Excellent |
| Total Page Weight | <5MB   | 🏆 Excellent |
| Lighthouse Score  | 95+    | 🏆 Excellent |

---

## 🎯 Top 10 Priorities

1. **Convert GeoJSON → TopoJSON** (6h, -40-45MB) 🔥
2. **Remove duplicate GeoJSON** (5m, -16MB) 🔥
3. **Optimize SW pre-cache** (30m, -2.2MB) 🔥
4. **Add compression plugins** (1h, -70% transfer) 🔥
5. **Disable prod sourcemaps** (5m, security + size) ⚡
6. **Replace Framer Motion** (4h, -100KB) ⚡
7. **Split large components** (6h, better perf) ⚡
8. **Add GPU hints** (2h, smoother animations) ⚡
9. **Tree-shake D3** (3h, -300KB) ⚡
10. **Add bundle budgets** (1h, prevent regression) ⚡

---

## 🔧 Files to Modify

### Critical Files

```
vite.config.ts:40,41         # Sourcemaps, chunk size
public/sw.js:29              # Remove pre-cache
index.html:46                # Add DNS prefetch
package.json                 # Add compression
public/data/geo/*.geojson    # Convert to TopoJSON
```

### Code Quality Files

```
src/components/county/CountyFormationAnimation.tsx  # Split (984 lines)
src/context/GameContext.tsx                         # Split context (513 lines)
src/components/map/CaliforniaMapFixed.tsx:95        # Add useMemo
src/main.tsx:93                                     # GPU acceleration
```

---

## 📈 Expected Timeline

### Week 1: Critical Issues

- Days 1-2: TopoJSON conversion + testing
- Day 3: Compression + SW optimization
- Day 4: Testing + deployment
- Day 5: Monitor metrics

**Result:** 60-70% load time improvement

### Week 2-3: Performance Tuning

- Component splitting
- Framer Motion replacement
- Context optimization
- D3 tree-shaking

**Result:** 50% bundle size reduction

### Week 4+: Advanced Features

- Route-based splitting
- Memory monitoring
- Performance budgets
- CI/CD integration

**Result:** Production-ready performance

---

## 🚀 Deployment Checklist

### Before Deployment

- [ ] Convert all GeoJSON to TopoJSON
- [ ] Test all zoom levels work correctly
- [ ] Verify service worker caching
- [ ] Run Lighthouse audit (target: 85+)
- [ ] Test on 3G network
- [ ] Test on mobile devices
- [ ] Check bundle size (< 2MB)

### After Deployment

- [ ] Monitor Web Vitals
- [ ] Track error rates
- [ ] Monitor cache hit rates
- [ ] Check user feedback
- [ ] Verify offline mode works

---

## 💡 Key Insights

1. **GeoJSON is the #1 bottleneck** - 50MB out of 53MB total
2. **TopoJSON conversion = biggest win** - 85-90% size reduction
3. **Good foundation** - Code splitting, lazy loading already implemented
4. **React optimizations present** - 245 instances of memo/useMemo/useCallback
5. **Service worker well-designed** - Just needs smaller pre-cache

---

## 📞 Support

- Full Report: `/home/user/california_puzzle_game/docs/performance-optimization-report.md`
- TopoJSON Guide: https://github.com/topojson/topojson
- Web Vitals: https://web.dev/vitals/
- Vite Performance: https://vitejs.dev/guide/performance

---

**Last Updated:** 2025-11-19
**Next Review:** After Phase 1 completion
