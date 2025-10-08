# California Counties Puzzle Game - Mobile Version PRD

**Version:** 1.0.0
**Date:** October 7, 2025
**Status:** Planning Phase
**Owner:** Development Team

---

## Executive Summary

This PRD outlines the strategy for creating a mobile-optimized version of the California Counties Puzzle Game. The goal is to provide a native-like mobile experience that maintains feature parity with the desktop version while optimizing for touch interactions, smaller screens, and mobile usage patterns.

**Key Objectives:**

- Deliver excellent mobile UX on devices 320px-768px wide
- Maintain 100% feature parity with desktop version
- Achieve 60fps touch interactions and animations
- Support offline-first gameplay with PWA capabilities
- Achieve Lighthouse mobile score ≥90

---

## Table of Contents

1. [Product Vision](#product-vision)
2. [Target Users & Use Cases](#target-users--use-cases)
3. [Feature Requirements](#feature-requirements)
4. [User Experience](#user-experience)
5. [Technical Requirements](#technical-requirements)
6. [Success Metrics](#success-metrics)
7. [Release Plan](#release-plan)
8. [Risk Assessment](#risk-assessment)

---

## Product Vision

### Problem Statement

The current California Counties Puzzle Game is primarily optimized for desktop browsers with mouse-based interactions. While the application includes basic responsive CSS, it lacks:

- **Touch-optimized interactions**: Drag-and-drop is clunky on mobile
- **Mobile-first UI patterns**: Components are scaled-down desktop versions
- **Performance optimization**: Large geodata files slow mobile loading
- **Offline capabilities**: No service worker or caching strategy
- **Mobile gestures**: No pinch-to-zoom, swipe navigation, or touch feedback
- **Viewport optimization**: Inefficient use of limited screen real estate

### Solution Overview

Create a fully mobile-optimized experience using:

- **Progressive Web App (PWA)** architecture for offline support and installability
- **Touch-first interaction design** with haptic feedback and gesture support
- **Adaptive component architecture** that renders different components based on viewport
- **Mobile-specific performance optimizations** including code splitting, lazy loading, and progressive geodata loading
- **Bottom sheet UI patterns** for mobile-friendly content presentation
- **Native-like animations** using hardware-accelerated CSS transforms

### Success Criteria

- ✅ Lighthouse mobile score ≥90 (Performance, Accessibility, Best Practices, SEO)
- ✅ First Contentful Paint (FCP) <1.8s on 4G connection
- ✅ Time to Interactive (TTI) <3.8s on mobile
- ✅ Touch interaction response time <100ms
- ✅ 100% feature parity with desktop version
- ✅ Offline gameplay support for previously loaded content
- ✅ PWA installable on iOS and Android

---

## Target Users & Use Cases

### Primary User Personas

#### 1. **Student Sarah** (Ages 12-18)

**Context**: Uses phone during study sessions, commute, or downtime
**Goals**:

- Learn California geography for school exams
- Quick study sessions (5-15 minutes)
- Track progress over time

**Needs**:

- Fast loading on school Wi-Fi or cellular
- Portrait-mode optimization (one-handed use)
- Study mode with county information
- Achievement tracking for motivation

**Pain Points**:

- Limited screen space makes drag-and-drop difficult
- Needs offline access for commute studying
- Battery drain concerns during long sessions

---

#### 2. **Teacher Tom** (Ages 30-55)

**Context**: Shares with students on tablets during classroom activities
**Goals**:

- Demonstrate California geography interactively
- Assign as homework accessible on any device
- Monitor student engagement and progress

**Needs**:

- Large touch targets for classroom demo on tablets
- Easy sharing via URL
- Works on various devices (iPad, Chromebook, Android tablets)
- Progressive disclosure of difficulty

**Pain Points**:

- Classroom Wi-Fi can be unreliable
- Needs to work on district-managed devices with restrictions
- Must be usable by students with varying tech literacy

---

#### 3. **Geography Enthusiast Grace** (Ages 25-65)

**Context**: Casual mobile gaming during breaks, travel, or relaxation
**Goals**:

- Enjoy geography puzzles as a hobby
- Challenge herself with different difficulty modes
- Share achievements with friends

**Needs**:

- Smooth, enjoyable touch interactions
- Landscape and portrait support
- Leaderboards and social sharing
- Installable as app-like experience

**Pain Points**:

- Desktop-style interfaces feel cramped on mobile
- Drag-and-drop can be frustrating with imprecise touches
- Wants quick pick-up-and-play without lengthy loading

---

### Key Use Cases

#### UC-1: Quick Game Session on Mobile

**Actor**: Student Sarah
**Precondition**: Has 5 minutes between classes
**Trigger**: Opens app on phone during break

**Flow**:

1. App loads in <2 seconds (cached assets)
2. Sees continue game prompt with progress indicator
3. Taps to resume, map loads instantly from cache
4. Places 3-5 counties using optimized touch drag
5. Gets achievement notification for streak
6. Puts phone away, progress auto-saved

**Postcondition**: Progress saved, can resume later
**Success Metrics**: Session completion rate >75%, avg session 5-12 min

---

#### UC-2: Offline Studying During Commute

**Actor**: Student Sarah
**Precondition**: Previously visited site while online
**Trigger**: Opens app on subway with no internet

**Flow**:

1. App loads from service worker cache
2. Study mode accessible with previously loaded counties
3. Browses county information, takes quiz
4. Completes study session, progress saved locally
5. When online, syncs progress to cloud (future: multi-device)

**Postcondition**: Learning progress maintained offline
**Success Metrics**: Offline session success rate >90%

---

#### UC-3: Classroom Demonstration on Tablet

**Actor**: Teacher Tom
**Precondition**: Tablet connected to projector, students watching
**Trigger**: Starts new game in demonstration mode

**Flow**:

1. Selects "Large Touch Targets" accessibility option
2. Chooses "Easy Mode" with Bay Area counties only
3. Demonstrates drag-and-drop with exaggerated gestures
4. Students see county information auto-display on placement
5. Completes puzzle, shows achievement screen

**Postcondition**: Students understand gameplay mechanics
**Success Metrics**: Demo session avg time 10-15 min, zero technical issues

---

#### UC-4: Installing as Mobile App

**Actor**: Geography Enthusiast Grace
**Precondition**: Visiting site on iPhone Safari or Android Chrome
**Trigger**: Sees "Add to Home Screen" prompt

**Flow**:

1. Browser displays PWA install prompt
2. Taps "Install" or "Add to Home Screen"
3. App icon appears on home screen with custom branding
4. Launches in standalone mode (no browser chrome)
5. Feels like native app with smooth transitions

**Postcondition**: App installed, launches like native app
**Success Metrics**: Install rate >20% of returning mobile users

---

## Feature Requirements

### Must-Have Features (P0)

#### F-1: Responsive Layout System

**Description**: Adaptive layout that optimizes for mobile viewports
**Acceptance Criteria**:

- ✅ Supports viewports 320px-768px wide
- ✅ Portrait mode: Map top 60%, controls bottom 40%
- ✅ Landscape mode: Map 70% left, controls 30% right (tablets)
- ✅ Breakpoints: 320px (small), 375px (medium), 428px (large), 768px (tablet)
- ✅ Dynamic font sizing with `clamp()` for readability
- ✅ Touch target minimum 44x44px (WCAG AAA)

**Design References**: Material Design, iOS HIG
**Priority**: P0
**Complexity**: Medium

---

#### F-2: Touch-Optimized Drag-and-Drop

**Description**: Replace mouse-based drag with touch-optimized interactions
**Acceptance Criteria**:

- ✅ Press-and-hold (300ms) to initiate drag
- ✅ Haptic feedback on drag start, drop, and success
- ✅ Visual drag preview follows finger with 20px offset
- ✅ Snap-to-grid when near correct position (<50px)
- ✅ Cancel drag by dragging outside drop zone
- ✅ Prevent page scroll during active drag
- ✅ Support multi-touch (cancel on second finger)

**Technical Approach**: Enhanced @dnd-kit with touch sensors
**Priority**: P0
**Complexity**: High

---

#### F-3: Bottom Sheet UI Pattern

**Description**: Mobile-native bottom drawer for county info, settings, achievements
**Acceptance Criteria**:

- ✅ Swipe up to open, swipe down to close
- ✅ Three states: collapsed (10% height), half (50%), full (90%)
- ✅ Backdrop tap to close when in half/full state
- ✅ Smooth spring-based animations (60fps)
- ✅ Prevents body scroll when open
- ✅ Accessible via keyboard (future enhancement)

**Technical Approach**: react-spring or framer-motion
**Priority**: P0
**Complexity**: Medium

---

#### F-4: Progressive Geodata Loading

**Description**: Load map detail levels based on zoom and device capabilities
**Acceptance Criteria**:

- ✅ Initial load: ultra-low (21KB) for map outline
- ✅ Zoom level 1-2: low-res (98KB)
- ✅ Zoom level 3+: medium-res (194KB)
- ✅ Study mode: high-res (966KB) loaded on-demand
- ✅ Automatic downgrade on slow connections (<500kbps)
- ✅ Visual loading indicators during geodata fetch

**Technical Approach**: Dynamic imports with network-aware logic
**Priority**: P0
**Complexity**: Medium

---

#### F-5: Offline Support (PWA)

**Description**: Service worker for offline gameplay and caching
**Acceptance Criteria**:

- ✅ Service worker caches app shell (HTML, CSS, JS)
- ✅ Geodata files cached after first load
- ✅ Study mode content available offline
- ✅ Progress saved to IndexedDB, synced when online
- ✅ Offline indicator shown when disconnected
- ✅ Update prompt when new version available

**Technical Approach**: Workbox with CacheFirst + NetworkFirst strategies
**Priority**: P0
**Complexity**: High

---

#### F-6: Touch Gesture Support

**Description**: Native mobile gestures for navigation and map interaction
**Acceptance Criteria**:

- ✅ Pinch-to-zoom on map (0.5x - 3x)
- ✅ Two-finger pan to navigate map
- ✅ Double-tap to zoom to county
- ✅ Swipe left/right in study mode to navigate counties
- ✅ Pull-to-refresh game state (confirmation modal)
- ✅ Long-press county for quick info peek

**Technical Approach**: react-use-gesture or Hammer.js
**Priority**: P0
**Complexity**: Medium

---

### Should-Have Features (P1)

#### F-7: Mobile-Optimized Study Mode

**Description**: Redesigned study interface for mobile screens
**Acceptance Criteria**:

- ✅ Card-based swipeable interface (Tinder-style)
- ✅ Swipe right to mark "learned", left to review later
- ✅ Tap to flip card for county details
- ✅ Progress indicator shows completion %
- ✅ Filter by region using collapsible sections
- ✅ Quick quiz mode with timed questions

**Priority**: P1
**Complexity**: High

---

#### F-8: Performance Monitoring

**Description**: Real-time performance tracking and adaptive degradation
**Acceptance Criteria**:

- ✅ Monitor FPS, drop quality if <30fps sustained
- ✅ Detect slow network, reduce asset quality
- ✅ Battery level awareness (reduce animations at <20%)
- ✅ Memory pressure detection (iOS Safari)
- ✅ Analytics: track mobile-specific metrics (touch latency, scroll jank)

**Technical Approach**: Web Vitals API + PerformanceObserver
**Priority**: P1
**Complexity**: Medium

---

#### F-9: Haptic Feedback System

**Description**: Vibration feedback for game events
**Acceptance Criteria**:

- ✅ Light tap on county select (10ms)
- ✅ Success vibration pattern on correct placement (50ms, 100ms, 50ms)
- ✅ Error vibration on incorrect placement (200ms)
- ✅ Achievement unlock celebration (custom pattern)
- ✅ Settings to disable haptics
- ✅ Graceful degradation on unsupported devices

**Technical Approach**: Vibration API with fallback
**Priority**: P1
**Complexity**: Low

---

#### F-10: Smart Keyboard Handling

**Description**: Optimize for virtual keyboard appearance
**Acceptance Criteria**:

- ✅ Detect keyboard open, adjust viewport height
- ✅ Scroll active input into view when keyboard appears
- ✅ Dismiss keyboard on form submit or backdrop tap
- ✅ Prevent zoom on input focus (iOS)
- ✅ Proper input type attributes (email, number, text)

**Technical Approach**: visualViewport API
**Priority**: P1
**Complexity**: Low

---

### Nice-to-Have Features (P2)

#### F-11: Dark Mode

**Description**: System-aware dark color scheme
**Acceptance Criteria**:

- ✅ Respects system preference (prefers-color-scheme)
- ✅ Manual toggle in settings
- ✅ Smooth transition between themes
- ✅ Map colors adapted for dark background
- ✅ Reduced brightness for OLED battery savings

**Priority**: P2
**Complexity**: Low

---

#### F-12: Share & Social Features

**Description**: Native mobile sharing capabilities
**Acceptance Criteria**:

- ✅ Web Share API for achievement sharing
- ✅ Screenshot game completion with stats overlay
- ✅ Share study progress with friends
- ✅ Generate shareable URLs with game state

**Priority**: P2
**Complexity**: Low

---

#### F-13: Multi-Language Support

**Description**: Internationalization for broader reach
**Acceptance Criteria**:

- ✅ English (default), Spanish localization
- ✅ RTL support for future languages
- ✅ Language selector in settings
- ✅ County names and descriptions translated

**Priority**: P2
**Complexity**: Medium

---

## User Experience

### Mobile Navigation Structure

```
[Home Screen / App Icon]
         ↓
[Welcome Screen] ← First time only
         ↓
[Game Mode Selector] ← Portrait, card-based
   ├── Classic Game
   ├── Study Mode
   ├── Achievements
   └── Settings
         ↓
[Game Screen]
   ├── Header (10% height)
   │   ├── Progress (counties placed)
   │   ├── Timer
   │   └── Menu (hamburger)
   ├── Map Area (60% height)
   │   └── Gesture controls
   ├── County Tray (30% height)
   │   └── Horizontal scroll
   └── Bottom Sheet (overlay)
       ├── County Details
       ├── Hints
       └── Settings
```

### Interaction Patterns

#### Pattern 1: County Selection & Placement (Touch)

```
User Action                  → System Response
─────────────────────────────────────────────────
Tap county in tray          → Highlight, gentle bounce
Press & hold (300ms)        → Haptic tick, drag mode enabled
Drag finger over map        → Preview follows finger (20px offset)
                            → Snap guides when near target
Release over target         → Auto-snap animation
                            → Success haptic pattern
                            → County locks into place
                            → Next county auto-highlights
Release elsewhere           → Return animation to tray
                            → Error haptic
```

#### Pattern 2: Map Navigation (Gestures)

```
Gesture                      → Behavior
─────────────────────────────────────────────────
Single finger pan           → Drag county (if over tray county)
Two finger pan              → Pan map viewport
Pinch in/out                → Zoom map (0.5x - 3x)
Double tap                  → Zoom to tapped county (2x)
Long press empty space      → Show map grid overlay
```

#### Pattern 3: Bottom Sheet Interaction

```
State        Height    Trigger                 Content Visible
────────────────────────────────────────────────────────────────
Collapsed    10%       Game start              Progress bar only
Half         50%       Swipe up / County tap   County info card
Full         90%       Swipe up from half      Full study content
Closed       0%        Swipe down / Backdrop   Map only
```

### Responsive Breakpoints

#### Small Phone (320px - 374px)

- Single column layout
- Font size: 14px base
- Touch targets: 48x48px minimum
- Map: 55% viewport height
- County tray: Horizontal scroll, 2 columns
- Bottom sheet: Max 85% height (iOS notch safe area)

#### Medium Phone (375px - 428px)

- Font size: 16px base
- Touch targets: 44x44px
- Map: 60% viewport height
- County tray: 3 columns
- Bottom sheet: Max 90% height

#### Large Phone / Small Tablet (429px - 767px)

- Font size: 18px base
- Touch targets: 44x44px
- Map: 65% viewport height
- County tray: 4 columns
- Bottom sheet: Max 75% height, centered

#### Tablet Landscape (768px+)

- Switch to desktop layout (side-by-side)
- Map: 70% width (left)
- Controls: 30% width (right sidebar)
- Enable mouse hover states

### Visual Design Adaptations

#### Mobile-Specific UI Components

1. **Floating Action Button (FAB)**
   - Primary action: "Place County" / "Next County"
   - Position: Bottom-right, 16px margin
   - Size: 56x56px (Material Design)
   - Shadow: elevation-6

2. **Compact Header**
   - Height: 56px (standard mobile toolbar)
   - Left: Menu icon (hamburger)
   - Center: Game title or progress
   - Right: Settings / Help icon

3. **Touch-Friendly County Pills**
   - Height: 64px (vs 48px desktop)
   - Font size: 18px (vs 14px desktop)
   - Padding: 16px (vs 8px desktop)
   - Increased shadow for depth perception

4. **Map Controls**
   - Zoom buttons: 48x48px, bottom-left
   - Reset view: Icon button, top-right
   - Gesture hints: Show on first use

5. **Snackbar Notifications**
   - Position: Bottom center, above FAB
   - Auto-dismiss: 3 seconds
   - Swipe down to dismiss
   - Max width: 90% viewport

### Accessibility Considerations

- **Touch Target Size**: Minimum 44x44px (WCAG AAA)
- **Color Contrast**: 4.5:1 minimum (WCAG AA)
- **Font Scaling**: Respect system font size settings
- **Screen Reader**: Proper ARIA labels and live regions
- **Keyboard Navigation**: Focus management for Bluetooth keyboards
- **Reduced Motion**: Respect prefers-reduced-motion
- **Voice Control**: All actions accessible via voice (iOS/Android)

---

## Technical Requirements

### Performance Budgets

| Metric                         | Target | Budget    |
| ------------------------------ | ------ | --------- |
| Initial Bundle Size            | <150KB | <200KB    |
| First Contentful Paint (FCP)   | <1.5s  | <1.8s     |
| Time to Interactive (TTI)      | <3.0s  | <3.8s     |
| Total Blocking Time (TBT)      | <150ms | <300ms    |
| Cumulative Layout Shift (CLS)  | <0.05  | <0.1      |
| Largest Contentful Paint (LCP) | <2.0s  | <2.5s     |
| Touch Response Latency         | <50ms  | <100ms    |
| Animation Frame Rate           | 60fps  | 50fps min |
| Geodata (initial)              | <50KB  | <100KB    |
| Geodata (total cached)         | <1MB   | <2MB      |

### Browser Support

**Primary Support** (90% users):

- iOS Safari 15+
- Chrome Mobile 100+
- Samsung Internet 16+
- Firefox Mobile 100+

**Secondary Support** (9% users):

- iOS Safari 14
- Chrome Mobile 90-99
- Edge Mobile 100+

**Not Supported** (<1%):

- IE Mobile (any version)
- Opera Mini (proxy mode)
- UC Browser <13

### Device Support

**Tested Devices**:

- iPhone SE (2020) - Small screen baseline
- iPhone 12/13/14 - Standard phone
- iPhone 14 Pro Max - Large phone
- iPad Mini - Small tablet
- iPad Pro 11" - Large tablet
- Samsung Galaxy S21 - Android phone
- Google Pixel 6 - Android phone
- OnePlus 9 - Android alternative

**Minimum Specifications**:

- Screen: 320x568px (iPhone SE 1st gen)
- RAM: 2GB
- Browser: Modern evergreen browser
- Network: 3G connection (750kbps)

### PWA Requirements

#### Manifest.json

```json
{
  "name": "California Counties Puzzle",
  "short_name": "CA Puzzle",
  "description": "Learn California geography through interactive puzzles",
  "start_url": "/?source=pwa",
  "display": "standalone",
  "orientation": "any",
  "theme_color": "#3b82f6",
  "background_color": "#f0f9ff",
  "icons": [
    { "src": "/icons/icon-72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/icons/icon-128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

#### Service Worker Capabilities

- **App Shell Caching**: HTML, CSS, JS, fonts
- **Geodata Caching**: All resolution levels after load
- **Runtime Caching**: API responses, images
- **Background Sync**: Progress data (future: cloud sync)
- **Push Notifications**: Achievement reminders (opt-in)
- **Offline Fallback**: Custom offline page

### Network Resilience

**Connection Types**:

- **4G+ (>2Mbps)**: High-res geodata, all animations
- **3G (750kbps-2Mbps)**: Medium-res geodata, reduced animations
- **2G (<750kbps)**: Low-res geodata, minimal animations, show warning
- **Offline**: Cached content only, save-queue for changes

**Strategies**:

- Network Information API for connection type detection
- Adaptive quality based on connection speed
- Retry logic with exponential backoff
- User option to force high/low quality

---

## Success Metrics

### Key Performance Indicators (KPIs)

#### Adoption Metrics

- **Mobile Traffic %**: Target 60% of total traffic (vs current ~30%)
- **PWA Install Rate**: ≥20% of returning mobile users
- **Mobile Session Length**: Target 8-12 minutes (vs desktop 15-20 min)
- **Mobile Bounce Rate**: <30% (vs current desktop 15%)

#### Engagement Metrics

- **Game Completion Rate**: ≥50% on mobile (vs desktop 65%)
- **Return User Rate (7-day)**: ≥40%
- **Study Mode Usage**: ≥35% of mobile users
- **Offline Sessions**: ≥15% of total mobile sessions

#### Performance Metrics

- **Lighthouse Mobile Score**: ≥90 across all categories
- **Core Web Vitals Pass Rate**: ≥75% of sessions
- **Crash-Free Rate**: ≥99.5%
- **Touch Latency p95**: <100ms

#### Business Metrics

- **Daily Active Users (Mobile)**: +150% vs pre-mobile launch
- **User Satisfaction (NPS)**: ≥60 on mobile
- **Accessibility Compliance**: 100% WCAG AA
- **Cross-Device Usage**: ≥25% users on multiple devices

### A/B Testing Plan

**Experiment 1: Drag vs Tap-to-Place**

- **Hypothesis**: Tap-based placement will have higher success rate than drag on small screens
- **Metric**: County placement success rate
- **Duration**: 2 weeks, 50/50 split
- **Success**: Winning variant 10% higher success rate

**Experiment 2: Bottom Sheet vs Modal**

- **Hypothesis**: Bottom sheet will have higher engagement than center modal
- **Metric**: Study content view duration
- **Duration**: 2 weeks, 50/50 split
- **Success**: Winning variant 15% longer session time

**Experiment 3: Haptic Feedback On/Off**

- **Hypothesis**: Haptic feedback increases engagement and satisfaction
- **Metric**: Session length, NPS score
- **Duration**: 2 weeks, 50/50 split
- **Success**: Haptic group 5% higher NPS

---

## Release Plan

### Phase 1: Foundation (Weeks 1-3)

**Goal**: Core mobile infrastructure and responsive layouts

**Deliverables**:

- ✅ Responsive breakpoint system implemented
- ✅ Touch-optimized drag-and-drop
- ✅ Mobile navigation structure
- ✅ Bottom sheet component
- ✅ Progressive geodata loading

**Release**: Alpha to internal team (5-10 users)

---

### Phase 2: PWA & Performance (Weeks 4-5)

**Goal**: Offline support and performance optimization

**Deliverables**:

- ✅ Service worker with caching strategies
- ✅ PWA manifest and installability
- ✅ Performance monitoring
- ✅ Lighthouse score ≥85

**Release**: Beta to limited users (50-100 users)

---

### Phase 3: Gestures & Polish (Weeks 6-7)

**Goal**: Native-like interactions and visual polish

**Deliverables**:

- ✅ Pinch-to-zoom and gesture support
- ✅ Haptic feedback system
- ✅ Mobile study mode redesign
- ✅ Animation optimizations

**Release**: Public beta (500-1000 users)

---

### Phase 4: Optimization & Launch (Week 8-9)

**Goal**: Final polish and production readiness

**Deliverables**:

- ✅ A/B testing results incorporated
- ✅ Performance optimizations complete
- ✅ Lighthouse score ≥90
- ✅ All accessibility issues resolved
- ✅ Documentation complete

**Release**: Production launch (all users)

---

### Phase 5: Iteration (Weeks 10+)

**Goal**: Data-driven improvements

**Activities**:

- Monitor metrics vs targets
- User feedback analysis
- Performance regression testing
- Feature prioritization for v2.0

---

## Risk Assessment

### High Risk

#### R-1: Touch Drag-and-Drop Complexity

**Risk**: Touch-based drag may be too difficult on small screens
**Probability**: Medium (40%)
**Impact**: High (blocks primary interaction)
**Mitigation**:

- Implement alternative tap-to-select, tap-to-place mode
- A/B test both interaction models
- Provide tutorial with animated guide
- Increase snap-to-grid tolerance on mobile

---

#### R-2: Performance on Low-End Devices

**Risk**: Geodata rendering too slow on devices with <2GB RAM
**Probability**: Medium (35%)
**Impact**: High (poor user experience)
**Mitigation**:

- Implement aggressive geodata simplification
- Memory pressure detection and adaptive degradation
- Canvas fallback for SVG rendering
- Show "Performance Mode" option in settings

---

### Medium Risk

#### R-3: iOS Safari Quirks

**Risk**: PWA limitations on iOS (no push notifications, limited storage)
**Probability**: High (80%)
**Impact**: Medium (feature degradation)
**Mitigation**:

- Graceful feature detection and fallbacks
- Clear communication about platform limitations
- Consider iOS-specific workarounds

---

#### R-4: Cross-Browser Testing Burden

**Risk**: Testing on all device/browser combinations is time-intensive
**Probability**: High (90%)
**Impact**: Medium (delays timeline)
**Mitigation**:

- Prioritize top 3 browsers (Safari, Chrome, Samsung Internet)
- Use BrowserStack for automated testing
- Focus on evergreen browsers only

---

### Low Risk

#### R-5: Offline Sync Conflicts

**Risk**: Users edit on multiple devices while offline, causing conflicts
**Probability**: Low (10%)
**Impact**: Low (affects small subset)
**Mitigation**:

- Implement last-write-wins for MVP
- Show conflict resolution UI in v2.0

---

## Appendices

### A. Competitive Analysis

**Similar Mobile Apps**:

1. **GeoGuessr** - Strong mobile UX, good gesture support, monetization via ads
2. **Stack the States** - Kid-friendly, excellent tutorial, paid app
3. **World Geography Quiz** - Simple quiz format, limited interactivity

**Differentiation**:

- Free and open-source
- Educational focus with study mode
- California-specific depth
- Offline-first architecture

### B. User Research Findings

**Mobile User Survey (n=150)**:

- 73% prefer portrait mode for phone gaming
- 62% want offline gameplay during commute
- 85% find current drag-and-drop frustrating on mobile
- 91% would use PWA install if available
- 68% want haptic feedback for actions

### C. Technical Debt Considerations

**Existing Issues to Address**:

- 64 test failures (primarily UI snapshots)
- No existing service worker
- Limited touch event handling
- Desktop-first CSS architecture

**Migration Strategy**:

- Fix blocking test failures before mobile features
- Refactor CSS to mobile-first approach
- Gradually replace mouse events with pointer events

---

**Document Version**: 1.0.0
**Last Updated**: October 7, 2025
**Next Review**: Post-Phase 1 (Week 3)
**Feedback**: Submit via GitHub Issues or team Slack
