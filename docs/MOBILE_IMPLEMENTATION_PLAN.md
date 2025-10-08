# California Counties Puzzle Game - Mobile Implementation Plan

**Version:** 1.0.0
**Date:** October 7, 2025
**Status:** Ready for Implementation
**Owner:** Development Team

---

## Table of Contents

1. [Implementation Strategy](#implementation-strategy)
2. [Phase 1: Foundation](#phase-1-foundation-weeks-1-3)
3. [Phase 2: PWA & Performance](#phase-2-pwa--performance-weeks-4-5)
4. [Phase 3: Gestures & Polish](#phase-3-gestures--polish-weeks-6-7)
5. [Phase 4: Launch](#phase-4-optimization--launch-weeks-8-9)
6. [Phase 5: Post-Launch](#phase-5-iteration-weeks-10)
7. [Development Workflow](#development-workflow)
8. [Quality Gates](#quality-gates)
9. [Risk Mitigation](#risk-mitigation)

---

## Implementation Strategy

### Core Principles

1. **Incremental Enhancement**: Build on existing desktop version, don't rewrite
2. **Mobile-First CSS**: Refactor existing styles to mobile-first approach
3. **Test-Driven Development**: Write tests before implementing features
4. **Performance Budget**: Enforce budgets at build time
5. **Continuous Deployment**: Deploy to staging after each phase

### Technology Additions

**New Dependencies**:

```json
{
  "@react-spring/web": "^9.7.3", // Spring animations
  "@use-gesture/react": "^10.3.0", // Touch gesture handling
  "workbox-webpack-plugin": "^7.0.0", // Service worker tooling
  "vite-plugin-pwa": "^0.19.0", // PWA manifest generation
  "react-intersection-observer": "^9.5.0", // Lazy loading
  "idb": "^8.0.0" // IndexedDB wrapper
}
```

**Dev Dependencies**:

```json
{
  "@testing-library/user-event": "^14.5.2", // Touch event simulation
  "puppeteer": "^21.0.0", // Mobile browser testing
  "lighthouse": "^11.0.0" // Performance auditing
}
```

### File Structure Changes

```
src/
├── components/
│   ├── adaptive/           # NEW: Viewport-aware components
│   │   ├── AdaptiveGameContainer.tsx
│   │   └── AdaptiveLayout.tsx
│   ├── mobile/             # NEW: Mobile-specific components
│   │   ├── MobileGameContainer.tsx
│   │   ├── MobileCountyTray.tsx
│   │   ├── MobileHeader.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── SwipeableCard.tsx
│   │   └── TouchDragProvider.tsx
│   ├── tablet/             # NEW: Tablet-specific components
│   │   ├── TabletGameContainer.tsx
│   │   └── TabletSidebar.tsx
│   └── desktop/            # MOVED: Existing components
│       └── DesktopGameContainer.tsx (refactored from GameContainer.tsx)
│
├── hooks/
│   ├── useViewport.ts      # NEW: Viewport detection
│   ├── useTouchGestures.ts # NEW: Touch gesture handling
│   ├── useHaptic.ts        # NEW: Haptic feedback
│   ├── usePerformanceMonitoring.ts # NEW: FPS/memory tracking
│   ├── useNetworkSpeed.ts  # NEW: Connection detection
│   └── useOfflineSync.ts   # NEW: Offline data sync
│
├── services/
│   ├── geodataService.ts   # ENHANCED: Progressive loading
│   ├── offlineService.ts   # NEW: Offline support
│   └── performanceService.ts # NEW: Performance monitoring
│
├── stores/
│   ├── uiStore.ts          # NEW: UI state (viewport, bottom sheet, etc.)
│   └── gameStore.ts        # ENHANCED: Mobile-specific state
│
├── styles/
│   ├── mobile/             # NEW: Mobile-specific styles
│   │   ├── mobile-layout.css
│   │   ├── touch-targets.css
│   │   └── bottom-sheet.css
│   └── responsive/         # NEW: Breakpoint-based styles
│       ├── breakpoints.css
│       └── adaptive.css
│
├── utils/
│   ├── viewport.ts         # NEW: Viewport utilities
│   ├── touch.ts            # NEW: Touch event helpers
│   └── performance.ts      # ENHANCED: Mobile perf utilities
│
└── workers/
    └── sw.js               # NEW: Service worker

public/
├── manifest.json           # NEW: PWA manifest
└── icons/                  # NEW: App icons (various sizes)
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-192.png
    ├── icon-512.png
    └── maskable-icon-512.png

tests/
├── mobile/                 # NEW: Mobile-specific tests
│   ├── touch-interactions.test.tsx
│   ├── gestures.test.tsx
│   ├── responsive.test.tsx
│   └── performance.test.ts
└── e2e/                    # NEW: End-to-end mobile tests
    ├── mobile-game-flow.spec.ts
    └── pwa-install.spec.ts
```

---

## Phase 1: Foundation (Weeks 1-3)

**Goal**: Core mobile infrastructure and responsive layouts

### Week 1: Responsive Foundation

#### Task 1.1: Setup Mobile-First CSS Architecture

**Priority**: P0
**Estimated Time**: 8 hours

**Subtasks**:

1. Create breakpoint configuration (`src/config/breakpoints.ts`)
2. Refactor `tailwind.config.js` to mobile-first breakpoints
3. Create responsive utility functions (`src/utils/viewport.ts`)
4. Update existing components to use mobile-first CSS

**Acceptance Criteria**:

- ✅ All breakpoints defined and documented
- ✅ Tailwind configured with mobile-first approach
- ✅ Zero breaking changes to existing desktop layout
- ✅ ESLint 0/0, TypeScript 100% strict

**Testing**:

```typescript
// tests/utils/viewport.test.ts
describe('Viewport Utils', () => {
  it('should detect mobile viewport', () => {
    global.innerWidth = 375;
    expect(getViewport()).toBe('mobile');
  });

  it('should detect tablet viewport', () => {
    global.innerWidth = 768;
    expect(getViewport()).toBe('tablet');
  });
});
```

**Commit Message**:

```
feat: Add mobile-first responsive foundation

- Create breakpoint configuration system
- Refactor Tailwind to mobile-first approach
- Add viewport detection utilities
- Update existing components for compatibility

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

#### Task 1.2: Implement useViewport Hook

**Priority**: P0
**Estimated Time**: 4 hours

**Subtasks**:

1. Create `src/hooks/useViewport.ts`
2. Implement resize observer with debouncing
3. Add orientation change detection
4. Create ViewportProvider context

**Acceptance Criteria**:

- ✅ Hook returns current viewport, width, height, orientation
- ✅ Debounced resize events (150ms)
- ✅ Touch device detection
- ✅ 100% test coverage

**Implementation**:

```typescript
// src/hooks/useViewport.ts
export function useViewport() {
  const [viewport, setViewport] = useState(() => calculateViewport());

  useEffect(() => {
    const handleResize = debounce(() => {
      setViewport(calculateViewport());
    }, 150);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return viewport;
}
```

---

#### Task 1.3: Create Adaptive Component Architecture

**Priority**: P0
**Estimated Time**: 12 hours

**Subtasks**:

1. Create `src/components/adaptive/AdaptiveGameContainer.tsx`
2. Implement component lazy loading by viewport
3. Refactor existing GameContainer to DesktopGameContainer
4. Create placeholder MobileGameContainer
5. Update App.tsx to use AdaptiveGameContainer

**Acceptance Criteria**:

- ✅ Correct component loaded based on viewport
- ✅ Lazy loading with Suspense and loading state
- ✅ No desktop code loaded on mobile
- ✅ Smooth transitions during resize

**File Changes**:

- `src/components/game/GameContainer.tsx` → `src/components/desktop/DesktopGameContainer.tsx`
- NEW: `src/components/adaptive/AdaptiveGameContainer.tsx`
- NEW: `src/components/mobile/MobileGameContainer.tsx` (placeholder)
- MODIFY: `src/App.tsx`

---

### Week 2: Mobile Components

#### Task 2.1: Implement MobileGameContainer

**Priority**: P0
**Estimated Time**: 16 hours

**Subtasks**:

1. Create mobile layout structure (60/40 split)
2. Implement MobileHeader component
3. Create MobileMapArea with touch controls
4. Build MobileCountyTray with horizontal scroll
5. Add responsive typography and spacing

**Component Structure**:

```typescript
<MobileGameContainer>
  <MobileHeader />
  <MobileMapArea>
    <CaliforniaMapCanvas />
    <ZoomControls />
  </MobileMapArea>
  <MobileCountyTray>
    <HorizontalScrollContainer>
      {counties.map(county => (
        <MobileCountyPill key={county.id} county={county} />
      ))}
    </HorizontalScrollContainer>
  </MobileCountyTray>
</MobileGameContainer>
```

**Acceptance Criteria**:

- ✅ Portrait mode: Map 60%, Tray 40%
- ✅ Landscape mode: Map 70%, Tray 30%
- ✅ Touch targets minimum 44x44px
- ✅ Smooth scrolling with momentum (iOS)
- ✅ No layout shift (CLS = 0)

---

#### Task 2.2: Build BottomSheet Component

**Priority**: P0
**Estimated Time**: 12 hours

**Subtasks**:

1. Install @react-spring/web and @use-gesture/react
2. Create BottomSheet component with spring animations
3. Implement swipe gestures (up/down)
4. Add three states: collapsed, half, full
5. Handle backdrop click and portal rendering

**Acceptance Criteria**:

- ✅ Smooth 60fps spring animations
- ✅ Swipe velocity detection for state changes
- ✅ Prevents body scroll when open
- ✅ Accessible (focus trap, ESC to close)
- ✅ Works on iOS Safari and Chrome Mobile

**Performance Target**:

- Spring animation: 60fps sustained
- Touch response: <50ms latency
- State transition: <200ms total

---

#### Task 2.3: Implement Touch-Optimized County Tray

**Priority**: P0
**Estimated Time**: 10 hours

**Subtasks**:

1. Create MobileCountyPill component (large touch targets)
2. Implement horizontal scroll with snap points
3. Add scroll indicators (left/right arrows)
4. Create category filter chips
5. Add empty state handling

**Features**:

- Scroll snap alignment
- Momentum scrolling (iOS `-webkit-overflow-scrolling: touch`)
- Visual feedback on scroll start/end
- Keyboard navigation support (future)

**CSS**:

```css
.mobile-county-tray {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  gap: 12px;
  padding: 16px;
}

.mobile-county-pill {
  min-width: 120px;
  height: 64px;
  scroll-snap-align: start;
  flex-shrink: 0;
}
```

---

### Week 3: Touch Drag-and-Drop

#### Task 3.1: Enhance @dnd-kit for Touch

**Priority**: P0
**Estimated Time**: 8 hours

**Subtasks**:

1. Configure TouchSensor with 250ms press-and-hold
2. Add visual drag preview that follows finger
3. Implement snap-to-grid when near target
4. Prevent page scroll during drag
5. Add cancel gesture (drag outside bounds)

**Acceptance Criteria**:

- ✅ 250ms press-and-hold to initiate drag
- ✅ Preview offset 20px above finger
- ✅ Snap within 50px of target
- ✅ No page scroll during drag
- ✅ Cancel on second finger touch

---

#### Task 3.2: Implement TouchDragProvider

**Priority**: P0
**Estimated Time**: 6 hours

**Subtasks**:

1. Create TouchDragProvider wrapper
2. Integrate haptic feedback
3. Add visual feedback (shadow, scale)
4. Implement success/error animations

**Integration**:

```typescript
<TouchDragProvider
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  <MobileGameContainer />
</TouchDragProvider>
```

---

#### Task 3.3: Add Haptic Feedback

**Priority**: P1
**Estimated Time**: 4 hours

**Subtasks**:

1. Create useHaptic hook
2. Define haptic patterns (light, medium, heavy, success, error)
3. Integrate with drag events
4. Add settings toggle

**Haptic Patterns**:

- Drag start: 10ms (light)
- County select: 20ms (medium)
- Correct placement: [50, 100, 50] (success)
- Incorrect placement: 200ms (error)

---

### Phase 1 Milestone: Alpha Release

**Deliverables**:

- ✅ Fully functional mobile layout
- ✅ Touch-optimized drag-and-drop
- ✅ Bottom sheet component
- ✅ Responsive breakpoint system
- ✅ Basic haptic feedback

**Quality Gates**:

- ESLint: 0 errors, 0 warnings
- Tests: 100% of new code covered
- Lighthouse: ≥70 mobile performance
- Manual testing: iPhone SE, iPhone 14, iPad Mini

**Alpha Testing**:

- Internal team (5-10 users)
- Feedback collection via Google Form
- Bug tracking in GitHub Issues

---

## Phase 2: PWA & Performance (Weeks 4-5)

**Goal**: Offline support and performance optimization

### Week 4: Service Worker & Caching

#### Task 4.1: Setup Service Worker Infrastructure

**Priority**: P0
**Estimated Time**: 8 hours

**Subtasks**:

1. Install vite-plugin-pwa
2. Create service worker (`public/sw.js`)
3. Implement cache strategies (CacheFirst, NetworkFirst)
4. Add service worker registration utility
5. Handle service worker lifecycle events

**Cache Strategies**:

- Static assets: Stale-while-revalidate
- Geodata: Cache-first
- API calls: Network-first with fallback

---

#### Task 4.2: Implement PWA Manifest

**Priority**: P0
**Estimated Time**: 4 hours

**Subtasks**:

1. Create `public/manifest.json`
2. Generate app icons (72, 96, 128, 192, 512px)
3. Create maskable icon for Android
4. Add meta tags for iOS/Android
5. Test installability on iOS and Android

**Manifest**:

```json
{
  "name": "California Counties Puzzle",
  "short_name": "CA Puzzle",
  "theme_color": "#3b82f6",
  "background_color": "#f0f9ff",
  "display": "standalone",
  "orientation": "any",
  "start_url": "/?source=pwa",
  "icons": [...]
}
```

---

#### Task 4.3: Progressive Geodata Loading

**Priority**: P0
**Estimated Time**: 10 hours

**Subtasks**:

1. Create GeodataService class
2. Implement resolution detection logic
3. Add network speed awareness
4. Create preload strategy for next resolution
5. Add memory pressure detection

**Resolution Selection**:

```typescript
function determineOptimalResolution() {
  const viewport = getViewport();
  const networkSpeed = getNetworkSpeed();
  const memory = getMemoryInfo();

  if (memory.low) return 'low';
  if (networkSpeed === 'slow-3g') return 'ultra-low';
  if (viewport === 'mobile') return networkSpeed === '4g' ? 'medium' : 'low';
  if (viewport === 'tablet') return 'medium';
  return 'high';
}
```

---

### Week 5: Performance Optimization

#### Task 5.1: Implement Performance Monitoring

**Priority**: P1
**Estimated Time**: 8 hours

**Subtasks**:

1. Create usePerformanceMonitoring hook
2. Implement FPS tracking
3. Add memory usage monitoring (Chrome)
4. Create adaptive quality system
5. Add performance settings UI

**Adaptive Quality**:

- FPS < 30: Reduce animations, lower geodata quality
- Memory > 80%: Clear caches, degrade quality
- Battery < 20%: Enable power-saving mode

---

#### Task 5.2: Code Splitting & Bundle Optimization

**Priority**: P1
**Estimated Time**: 6 hours

**Subtasks**:

1. Configure manual chunks in Vite
2. Lazy load mobile/desktop/tablet components
3. Split vendor bundles (react, d3, ui)
4. Analyze bundle with rollup-plugin-visualizer
5. Set up bundle size budgets

**Budget Plugin**:

```typescript
budgetPlugin({
  limits: {
    initial: 200_000, // 200KB
    chunks: 50_000, // 50KB per chunk
  },
  onBudgetExceeded: 'error',
});
```

---

#### Task 5.3: Lighthouse Optimization

**Priority**: P1
**Estimated Time**: 8 hours

**Subtasks**:

1. Run Lighthouse audit (mobile emulation)
2. Fix Core Web Vitals issues
3. Optimize images (WebP, lazy loading)
4. Add preconnect/prefetch hints
5. Minimize JavaScript execution time

**Target Metrics**:

- Performance: ≥85
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP: <1.8s
- LCP: <2.5s
- TBT: <300ms
- CLS: <0.1

---

### Phase 2 Milestone: Beta Release

**Deliverables**:

- ✅ Service worker with offline support
- ✅ PWA installability
- ✅ Progressive geodata loading
- ✅ Performance monitoring
- ✅ Lighthouse score ≥85

**Quality Gates**:

- Lighthouse: ≥85 all categories
- Bundle size: <200KB initial
- Offline functionality: 100% critical paths
- PWA audit: All criteria pass

**Beta Testing**:

- Limited public beta (50-100 users)
- A/B testing setup
- Analytics integration
- User feedback surveys

---

## Phase 3: Gestures & Polish (Weeks 6-7)

**Goal**: Native-like interactions and visual polish

### Week 6: Advanced Gestures

#### Task 6.1: Implement Pinch-to-Zoom

**Priority**: P1
**Estimated Time**: 10 hours

**Subtasks**:

1. Install @use-gesture/react
2. Create usePinchZoom hook
3. Integrate with map component
4. Add zoom limits (0.5x - 3x)
5. Implement smooth zoom animations

**Gesture Handler**:

```typescript
const bind = useGesture({
  onPinch: ({ offset: [scale], memo }) => {
    const newZoom = clamp(scale, 0.5, 3);
    mapApi.setZoom(newZoom, { animated: true });
    return memo;
  },
});
```

---

#### Task 6.2: Add Swipe Navigation (Study Mode)

**Priority**: P1
**Estimated Time**: 8 hours

**Subtasks**:

1. Create SwipeableCardStack component
2. Implement card-based study mode UI
3. Add swipe left/right gestures
4. Create stack animations (Tinder-style)
5. Add progress indicator

---

#### Task 6.3: Implement Advanced Touch Gestures

**Priority**: P1
**Estimated Time**: 6 hours

**Subtasks**:

1. Double-tap to zoom to county
2. Long-press for county info peek
3. Two-finger pan for map navigation
4. Pull-to-refresh with confirmation modal

---

### Week 7: Visual Polish

#### Task 7.1: Mobile Study Mode Redesign

**Priority**: P1
**Estimated Time**: 12 hours

**Subtasks**:

1. Create card-based study interface
2. Implement flip animation for card details
3. Add swipe gestures for review/learned
4. Create progress tracking UI
5. Add quick quiz mode

---

#### Task 7.2: Animation Refinement

**Priority**: P2
**Estimated Time**: 8 hours

**Subtasks**:

1. Optimize all animations for 60fps
2. Add spring physics to interactions
3. Implement page transitions
4. Add micro-interactions (button press, etc.)
5. Respect prefers-reduced-motion

---

#### Task 7.3: Mobile UI Polish

**Priority**: P2
**Estimated Time**: 6 hours

**Subtasks**:

1. Refine touch target sizes
2. Improve visual feedback
3. Add loading skeletons
4. Polish empty states
5. Update typography for mobile

---

### Phase 3 Milestone: Public Beta

**Deliverables**:

- ✅ Pinch-to-zoom functionality
- ✅ Swipe navigation in study mode
- ✅ Advanced touch gestures
- ✅ Polished animations
- ✅ Mobile study mode redesign

**Quality Gates**:

- Lighthouse: ≥90 all categories
- Touch latency: <100ms p95
- Animation FPS: ≥55fps sustained
- User satisfaction (NPS): ≥50

**Public Beta Testing**:

- 500-1000 users
- User behavior analytics
- Performance monitoring (RUM)
- A/B test results analysis

---

## Phase 4: Optimization & Launch (Weeks 8-9)

**Goal**: Final polish and production readiness

### Week 8: Optimization

#### Task 8.1: A/B Testing Analysis

**Priority**: P0
**Estimated Time**: 8 hours

**Experiments to Analyze**:

1. Drag vs Tap-to-Place interaction
2. Bottom Sheet vs Modal for content
3. Haptic Feedback On vs Off

**Metrics**:

- County placement success rate
- Session duration
- User satisfaction (NPS)

---

#### Task 8.2: Performance Regression Testing

**Priority**: P0
**Estimated Time**: 6 hours

**Tests**:

1. Lighthouse audits on 5 devices
2. Memory leak detection
3. Long session stability (30+ min)
4. Network resilience (2G, 3G, 4G, offline)
5. Battery drain testing

---

#### Task 8.3: Accessibility Audit

**Priority**: P0
**Estimated Time**: 8 hours

**Checklist**:

- [ ] Touch targets ≥44x44px
- [ ] Color contrast ≥4.5:1
- [ ] Screen reader navigation
- [ ] Keyboard navigation (Bluetooth keyboards)
- [ ] Focus management
- [ ] ARIA labels complete
- [ ] Error messages accessible

---

### Week 9: Launch Preparation

#### Task 9.1: Documentation

**Priority**: P0
**Estimated Time**: 8 hours

**Documents to Update**:

1. README.md (mobile features)
2. User guide (mobile screenshots)
3. API documentation
4. Architecture decision records
5. Deployment guide

---

#### Task 9.2: Final Testing

**Priority**: P0
**Estimated Time**: 12 hours

**Test Matrix**:
| Device | Browser | Tests |
|----------------|----------------|----------------|
| iPhone SE 2020 | Safari 15+ | Full suite |
| iPhone 14 | Safari 16 | Full suite |
| Samsung S21 | Chrome Mobile | Full suite |
| Google Pixel 6 | Chrome Mobile | Full suite |
| iPad Mini | Safari | Tablet layout |
| iPad Pro 11" | Safari | Tablet layout |

---

#### Task 9.3: Production Deployment

**Priority**: P0
**Estimated Time**: 4 hours

**Checklist**:

- [ ] Build production bundle
- [ ] Verify service worker registration
- [ ] Test PWA installability
- [ ] Verify analytics tracking
- [ ] Enable CDN caching
- [ ] Setup error monitoring (Sentry)
- [ ] Deploy to production
- [ ] Smoke test on production

---

### Phase 4 Milestone: Production Launch

**Deliverables**:

- ✅ A/B test results incorporated
- ✅ All performance targets met
- ✅ Accessibility compliance (WCAG AA)
- ✅ Documentation complete
- ✅ Production deployment successful

**Quality Gates**:

- Lighthouse: ≥90 all categories
- Test coverage: ≥95%
- Accessibility: 100% WCAG AA
- Crash-free rate: ≥99.5%
- All known P0/P1 bugs fixed

**Launch Announcement**:

- Blog post
- Social media
- Email to beta users
- Product Hunt submission

---

## Phase 5: Iteration (Weeks 10+)

**Goal**: Data-driven improvements

### Week 10: Monitoring & Analysis

#### Task 10.1: Analytics Review

**Priority**: P1
**Estimated Time**: 4 hours/week

**Metrics to Monitor**:

- Mobile traffic percentage
- PWA install rate
- Session duration
- Bounce rate
- Game completion rate
- Offline session rate
- Core Web Vitals (RUM)

---

#### Task 10.2: User Feedback Analysis

**Priority**: P1
**Estimated Time**: 4 hours/week

**Sources**:

- In-app feedback form
- GitHub Issues
- App store reviews (if native apps)
- User surveys
- Support tickets

---

#### Task 10.3: Performance Regression Monitoring

**Priority**: P1
**Estimated Time**: 2 hours/week

**Automated Checks**:

- Daily Lighthouse CI audits
- Bundle size tracking
- Error rate monitoring
- Crash reports
- Memory leak detection

---

### Continuous Improvement Backlog

**High Priority (Next 3 months)**:

1. Dark mode implementation
2. Social sharing features
3. Cloud sync for multi-device
4. Push notifications (achievements)
5. Spanish localization

**Medium Priority (3-6 months)**:

1. Native app wrapper (Capacitor)
2. Tablet-optimized UI
3. Advanced analytics dashboard
4. User-generated content (custom puzzles)
5. Multiplayer mode (future)

**Low Priority (6+ months)**:

1. Additional states/countries
2. AR mode (experimental)
3. Voice navigation
4. Advanced accessibility features
5. Offline-first sync with backend

---

## Development Workflow

### Daily Workflow

```
1. Pull latest from main
2. Create feature branch: feature/mobile-[task-name]
3. Write tests first (TDD)
4. Implement feature
5. Run tests locally (npm test)
6. Run lint (npm run lint)
7. Check bundle size (npm run build)
8. Manual testing on devices
9. Commit with conventional commits
10. Push and create PR
11. Address PR feedback
12. Merge to main
```

### Testing Strategy

#### Unit Tests

```bash
npm test                    # Run all tests
npm test -- mobile          # Run mobile tests only
npm test -- --coverage      # With coverage report
```

#### E2E Tests

```bash
npm run test:e2e            # Puppeteer mobile emulation
npm run test:e2e:devices    # Real device cloud (BrowserStack)
```

#### Performance Tests

```bash
npm run lighthouse          # Lighthouse CI
npm run perf:budget         # Check bundle size budget
npm run perf:audit          # Full performance audit
```

### PR Review Checklist

**Code Quality**:

- [ ] ESLint 0 errors, 0 warnings
- [ ] TypeScript strict mode, no `any`
- [ ] Test coverage ≥90% for new code
- [ ] No console.log or debugger statements
- [ ] Proper error handling

**Performance**:

- [ ] Bundle size within budget
- [ ] No performance regressions (Lighthouse)
- [ ] Animations ≥55fps
- [ ] Touch response <100ms

**Accessibility**:

- [ ] Touch targets ≥44x44px
- [ ] Color contrast ≥4.5:1
- [ ] Screen reader tested
- [ ] Keyboard navigation works

**Mobile Specific**:

- [ ] Tested on iOS Safari
- [ ] Tested on Chrome Mobile
- [ ] Landscape orientation works
- [ ] Touch gestures work correctly
- [ ] No horizontal scroll issues

---

## Quality Gates

### Phase 1 Gate

- ✅ Responsive layout works on 320px-768px
- ✅ Touch drag-and-drop functional
- ✅ Bottom sheet smooth (60fps)
- ✅ ESLint 0/0
- ✅ Tests pass (≥90% coverage)

### Phase 2 Gate

- ✅ Service worker caches all assets
- ✅ PWA installable on iOS and Android
- ✅ Offline gameplay works
- ✅ Lighthouse ≥85

### Phase 3 Gate

- ✅ Pinch-to-zoom smooth
- ✅ Study mode swipeable
- ✅ Animations 60fps
- ✅ Lighthouse ≥90

### Phase 4 Gate (Production)

- ✅ All P0/P1 bugs fixed
- ✅ A/B tests analyzed
- ✅ Accessibility WCAG AA
- ✅ Documentation complete
- ✅ Lighthouse ≥90

---

## Risk Mitigation

### High Risk: Touch Drag Complexity

**Mitigation Plan**:

1. Implement alternative tap-to-place mode
2. A/B test both interaction models
3. Provide clear tutorial
4. Monitor success rate metrics
5. Iterate based on user feedback

**Fallback**: If drag success rate <40%, default to tap mode

---

### Medium Risk: iOS Safari Limitations

**Mitigation Plan**:

1. Feature detection for all APIs
2. Graceful degradation for unsupported features
3. Clear communication about limitations
4. Test on multiple iOS versions (14, 15, 16, 17)

**Known Limitations**:

- No push notifications
- Storage quota limited (50MB)
- Service worker restrictions
- Audio autoplay restrictions

---

### Medium Risk: Performance on Low-End Devices

**Mitigation Plan**:

1. Implement performance monitoring
2. Adaptive quality degradation
3. "Performance Mode" setting
4. Test on low-end devices (2GB RAM)
5. Optimize critical rendering path

**Devices to Test**:

- iPhone SE 1st gen (2GB RAM)
- Budget Android phones (<4GB RAM)

---

## Success Criteria

**Quantitative Metrics**:

- Mobile traffic: ≥60% (vs 30% currently)
- PWA install rate: ≥20%
- Lighthouse mobile: ≥90
- Game completion (mobile): ≥50%
- Crash-free rate: ≥99.5%
- NPS score: ≥60

**Qualitative Metrics**:

- User feedback: "Feels like a native app"
- Touch interactions: "Smooth and responsive"
- Offline support: "Works anywhere"
- Performance: "Loads fast, runs smooth"

---

**Document Version**: 1.0.0
**Last Updated**: October 7, 2025
**Next Review**: After Phase 1 Completion
**Estimated Total Effort**: 240-280 hours (9 weeks)
