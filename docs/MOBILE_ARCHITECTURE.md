# California Counties Puzzle Game - Mobile Architecture

**Version:** 1.0.0
**Date:** October 7, 2025
**Status:** Architecture Planning
**Owner:** Technical Team

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Architecture](#component-architecture)
3. [Responsive Design System](#responsive-design-system)
4. [State Management](#state-management)
5. [Performance Optimization](#performance-optimization)
6. [PWA Architecture](#pwa-architecture)
7. [Touch & Gesture System](#touch--gesture-system)
8. [Data Flow](#data-flow)
9. [Testing Strategy](#testing-strategy)
10. [Deployment](#deployment)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │
│  │  Mobile    │  │  Tablet    │  │    Desktop          │   │
│  │  Layout    │  │  Layout    │  │    Layout           │   │
│  │  (320-768) │  │  (768-1024)│  │    (1024+)          │   │
│  └────────────┘  └────────────┘  └─────────────────────┘   │
│         │                │                  │                │
│         └────────────────┴──────────────────┘                │
│                          │                                   │
│  ┌───────────────────────▼────────────────────────┐         │
│  │         Adaptive Component Layer               │         │
│  │  (Viewport-aware component selection)          │         │
│  └───────────────────────┬────────────────────────┘         │
└────────────────────────────┼──────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                    Application Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   React      │  │   Zustand    │  │   React      │       │
│  │   Components │  │   Stores     │  │   Router     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                  │               │
│  ┌──────▼──────────────────▼──────────────────▼────────┐    │
│  │          Business Logic & Hooks Layer               │    │
│  │  - useViewport()  - useTouchGestures()              │    │
│  │  - usePerformance() - useOfflineSync()              │    │
│  └──────────────────────────┬──────────────────────────┘    │
└────────────────────────────────┼──────────────────────────────┘
                                 │
┌────────────────────────────────▼──────────────────────────────┐
│                      Service Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Geodata    │  │   Service    │  │   IndexedDB  │       │
│  │   Service    │  │   Worker     │  │   Manager    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└───────────────────────────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼──────────────────────────────┐
│                      Platform Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Browser    │  │   Network    │  │   Device     │       │
│  │   APIs       │  │   APIs       │  │   APIs       │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└───────────────────────────────────────────────────────────────┘
```

### Design Principles

#### 1. Mobile-First, Progressive Enhancement

**Rationale**: Start with smallest viewport, enhance for larger screens

```typescript
// ✅ Good: Mobile-first
.county-card {
  width: 100%;           // Mobile default
  padding: 1rem;

  @media (min-width: 768px) {
    width: 50%;          // Tablet
    padding: 1.5rem;
  }

  @media (min-width: 1024px) {
    width: 33.333%;      // Desktop
    padding: 2rem;
  }
}

// ❌ Bad: Desktop-first
.county-card {
  width: 33.333%;        // Desktop default

  @media (max-width: 1024px) {
    width: 50%;          // Requires override
  }
}
```

#### 2. Adaptive Component Architecture

**Rationale**: Different components for different contexts, not just CSS

```typescript
// Adaptive component selection based on viewport
function CountySelector() {
  const { isMobile, isTablet } = useViewport();

  if (isMobile) {
    return <MobileCountyTray />; // Bottom sheet, swipe gestures
  } else if (isTablet) {
    return <TabletCountySidebar />; // Side panel, tap interactions
  } else {
    return <DesktopCountyPanel />; // Full panel, drag-drop
  }
}
```

#### 3. Performance Budget Enforcement

**Rationale**: Prevent performance regressions

```typescript
// Bundle size budget plugin (vite.config.ts)
{
  plugins: [
    budgetPlugin({
      limits: {
        initial: 200_000, // 200KB max initial bundle
        chunks: 50_000, // 50KB max per chunk
        assets: 100_000, // 100KB max per asset
      },
      onBudgetExceeded: 'error', // Fail build if exceeded
    }),
  ];
}
```

#### 4. Offline-First Architecture

**Rationale**: Network is unreliable, especially on mobile

```typescript
// Service Worker Cache-First Strategy
async function fetchGeodata(resolution: string) {
  const cache = await caches.open('geodata-v1');
  const cached = await cache.match(`/data/geo/${resolution}.json`);

  if (cached) {
    return cached; // Instant load from cache
  }

  const response = await fetch(`/data/geo/${resolution}.json`);
  cache.put(`/data/geo/${resolution}.json`, response.clone());
  return response;
}
```

---

## Component Architecture

### Component Hierarchy

```
App
├── ServiceWorkerProvider
├── ViewportProvider (Detects screen size)
├── PerformanceMonitor
└── ErrorBoundary
    └── GameProvider (Zustand)
        └── Router
            ├── MobileGameContainer (Mobile Layout)
            │   ├── MobileHeader
            │   │   ├── BackButton
            │   │   ├── ProgressIndicator
            │   │   └── MenuButton
            │   ├── MobileMapArea (60% height)
            │   │   ├── CaliforniaMapCanvas (Adaptive quality)
            │   │   ├── TouchGestureLayer
            │   │   ├── ZoomControls
            │   │   └── MapLegend (Collapsible)
            │   ├── MobileCountyTray (40% height)
            │   │   ├── HorizontalScrollContainer
            │   │   ├── CountyPillMobile (Large touch targets)
            │   │   └── CategoryFilter (Chips)
            │   └── BottomSheet (Overlay)
            │       ├── CountyDetailsSheet
            │       ├── HintSystemSheet
            │       ├── SettingsSheet
            │       └── AchievementSheet
            │
            ├── TabletGameContainer (Hybrid Layout)
            │   ├── TabletHeader
            │   ├── SplitViewContainer
            │   │   ├── MapArea (70% width)
            │   │   └── SidePanel (30% width)
            │   │       ├── CountyGrid (2 columns)
            │   │       └── ProgressPanel
            │   └── FloatingActionButton
            │
            ├── DesktopGameContainer (Existing)
            │   └── [Existing structure]
            │
            ├── MobileStudyMode
            │   ├── SwipeableCardStack
            │   │   └── CountyStudyCard
            │   │       ├── FrontSide (Image, Name)
            │   │       ├── BackSide (Details, Facts)
            │   │       └── SwipeGestures (Left/Right)
            │   ├── StudyProgress
            │   └── QuickQuizMode
            │
            └── SettingsPage
                ├── PerformanceSettings
                ├── AccessibilitySettings
                └── DataManagement
```

### Adaptive Component Pattern

```typescript
// src/components/adaptive/AdaptiveGameContainer.tsx
import { lazy, Suspense } from 'react';
import { useViewport } from '@/hooks/useViewport';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

// Code-split by viewport
const MobileGameContainer = lazy(() =>
  import('./mobile/MobileGameContainer')
);
const TabletGameContainer = lazy(() =>
  import('./tablet/TabletGameContainer')
);
const DesktopGameContainer = lazy(() =>
  import('./desktop/DesktopGameContainer')
);

export function AdaptiveGameContainer() {
  const { viewport } = useViewport();

  // Component selection based on viewport
  let GameContainer;
  if (viewport === 'mobile') {
    GameContainer = MobileGameContainer;
  } else if (viewport === 'tablet') {
    GameContainer = TabletGameContainer;
  } else {
    GameContainer = DesktopGameContainer;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GameContainer />
    </Suspense>
  );
}
```

### Mobile-Specific Components

#### 1. MobileCountyTray Component

```typescript
// src/components/mobile/MobileCountyTray.tsx
import { useRef } from 'react';
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import type { County } from '@/types';

interface Props {
  counties: County[];
  onCountySelect: (county: County) => void;
  selectedCountyId?: string;
}

export function MobileCountyTray({ counties, onCountySelect, selectedCountyId }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollTo, isAtStart, isAtEnd } = useHorizontalScroll(scrollRef);

  return (
    <div className="mobile-county-tray">
      {/* Scroll indicators */}
      {!isAtStart && (
        <button
          className="scroll-indicator scroll-left"
          onClick={() => scrollTo('left')}
          aria-label="Scroll left"
        >
          ←
        </button>
      )}

      {/* Horizontal scrollable container */}
      <div
        ref={scrollRef}
        className="county-scroll-container"
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch', // iOS momentum scrolling
          gap: '12px',
          padding: '16px'
        }}
      >
        {counties.map((county) => (
          <MobileCountyPill
            key={county.id}
            county={county}
            isSelected={county.id === selectedCountyId}
            onSelect={() => onCountySelect(county)}
          />
        ))}
      </div>

      {!isAtEnd && (
        <button
          className="scroll-indicator scroll-right"
          onClick={() => scrollTo('right')}
          aria-label="Scroll right"
        >
          →
        </button>
      )}
    </div>
  );
}
```

#### 2. BottomSheet Component

```typescript
// src/components/mobile/BottomSheet.tsx
import { useState, useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { createPortal } from 'react-dom';

type SheetState = 'collapsed' | 'half' | 'full' | 'closed';

interface Props {
  children: React.ReactNode;
  defaultState?: SheetState;
  onStateChange?: (state: SheetState) => void;
}

const SHEET_HEIGHTS = {
  collapsed: 0.1,  // 10% of viewport
  half: 0.5,       // 50% of viewport
  full: 0.9,       // 90% of viewport (safe for iOS notch)
  closed: 0
};

export function BottomSheet({ children, defaultState = 'collapsed', onStateChange }: Props) {
  const [state, setState] = useState<SheetState>(defaultState);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Spring animation for smooth transitions
  const [{ y }, api] = useSpring(() => ({
    y: (1 - SHEET_HEIGHTS[state]) * window.innerHeight
  }));

  // Update spring when state changes
  useEffect(() => {
    api.start({
      y: (1 - SHEET_HEIGHTS[state]) * window.innerHeight,
      immediate: false,
      config: { tension: 300, friction: 30 } // Snappy spring
    });
    onStateChange?.(state);
  }, [state, api, onStateChange]);

  // Drag gesture handling
  const bind = useDrag(
    ({ last, movement: [, my], velocity: [, vy], direction: [, dy] }) => {
      if (last) {
        // Determine next state based on velocity and direction
        const currentHeight = SHEET_HEIGHTS[state];
        const velocityThreshold = 0.5;

        if (Math.abs(vy) > velocityThreshold) {
          // Fast swipe
          if (dy > 0) {
            // Swipe down
            transitionToNextState('down');
          } else {
            // Swipe up
            transitionToNextState('up');
          }
        } else {
          // Slow drag, snap to nearest state
          const draggedHeight = currentHeight - (my / window.innerHeight);
          snapToNearestState(draggedHeight);
        }
      } else {
        // During drag, update position
        api.start({
          y: (1 - SHEET_HEIGHTS[state]) * window.innerHeight + my,
          immediate: true
        });
      }
    },
    {
      from: () => [0, y.get()],
      filterTaps: true,
      axis: 'y'
    }
  );

  function transitionToNextState(direction: 'up' | 'down') {
    const stateOrder: SheetState[] = ['closed', 'collapsed', 'half', 'full'];
    const currentIndex = stateOrder.indexOf(state);

    if (direction === 'up' && currentIndex < stateOrder.length - 1) {
      setState(stateOrder[currentIndex + 1]);
    } else if (direction === 'down' && currentIndex > 0) {
      setState(stateOrder[currentIndex - 1]);
    }
  }

  function snapToNearestState(height: number) {
    const states: SheetState[] = ['collapsed', 'half', 'full'];
    const closest = states.reduce((prev, curr) =>
      Math.abs(SHEET_HEIGHTS[curr] - height) < Math.abs(SHEET_HEIGHTS[prev] - height)
        ? curr
        : prev
    );
    setState(closest);
  }

  // Backdrop click to close
  const handleBackdropClick = () => {
    if (state !== 'collapsed') {
      setState('collapsed');
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      {state !== 'collapsed' && state !== 'closed' && (
        <div
          className="bottom-sheet-backdrop"
          onClick={handleBackdropClick}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40
          }}
        />
      )}

      {/* Sheet */}
      <animated.div
        ref={sheetRef}
        {...bind()}
        className="bottom-sheet"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height: '100vh',
          background: 'white',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
          zIndex: 50,
          touchAction: 'none',
          y,
          display: state === 'closed' ? 'none' : 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Drag handle */}
        <div className="sheet-handle-container" style={{
          padding: '12px 0',
          display: 'flex',
          justifyContent: 'center',
          cursor: 'grab'
        }}>
          <div className="sheet-handle" style={{
            width: '40px',
            height: '4px',
            background: '#d1d5db',
            borderRadius: '2px'
          }} />
        </div>

        {/* Content */}
        <div className="sheet-content" style={{
          flex: 1,
          overflow: 'auto',
          padding: '0 16px 16px'
        }}>
          {children}
        </div>
      </animated.div>
    </>,
    document.body
  );
}
```

#### 3. TouchDragProvider Component

```typescript
// src/components/mobile/TouchDragProvider.tsx
import { ReactNode } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, TouchSensor, PointerSensor } from '@dnd-kit/core';
import { useHaptic } from '@/hooks/useHaptic';

interface Props {
  children: ReactNode;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
}

export function TouchDragProvider({ children, onDragStart, onDragEnd }: Props) {
  const haptic = useHaptic();

  // Configure sensors for touch
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,        // 250ms press-and-hold before drag starts
        tolerance: 8       // 8px tolerance for tap vs drag
      }
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8        // 8px movement before drag starts
      }
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    haptic.light(); // Haptic feedback on drag start
    onDragStart?.(event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id === over.id) {
      haptic.success(); // Success pattern on correct placement
    } else if (over) {
      haptic.error();   // Error pattern on incorrect placement
    }

    onDragEnd?.(event);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  );
}
```

---

## Responsive Design System

### Breakpoint System

```typescript
// src/config/breakpoints.ts
export const BREAKPOINTS = {
  mobile: {
    small: 320, // iPhone SE
    medium: 375, // iPhone 12/13
    large: 428, // iPhone 14 Pro Max
  },
  tablet: {
    small: 768, // iPad Mini portrait
    large: 1024, // iPad Pro portrait
  },
  desktop: {
    small: 1280, // Laptop
    large: 1920, // Desktop
  },
} as const;

export type Viewport = 'mobile' | 'tablet' | 'desktop';

export function getViewport(width: number): Viewport {
  if (width < BREAKPOINTS.tablet.small) return 'mobile';
  if (width < BREAKPOINTS.desktop.small) return 'tablet';
  return 'desktop';
}
```

### useViewport Hook

```typescript
// src/hooks/useViewport.ts
import { useState, useEffect } from 'react';
import { getViewport, type Viewport, BREAKPOINTS } from '@/config/breakpoints';
import { debounce } from '@/utils/performance';

interface ViewportInfo {
  viewport: Viewport;
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  isSmallMobile: boolean;
  isTouchDevice: boolean;
}

export function useViewport(): ViewportInfo {
  const [info, setInfo] = useState<ViewportInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        viewport: 'desktop',
        width: 1024,
        height: 768,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        orientation: 'landscape',
        isSmallMobile: false,
        isTouchDevice: false,
      };
    }

    return calculateViewportInfo();
  });

  useEffect(() => {
    const handleResize = debounce(() => {
      setInfo(calculateViewportInfo());
    }, 150); // Debounce resize events

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return info;
}

function calculateViewportInfo(): ViewportInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const viewport = getViewport(width);
  const orientation = height > width ? 'portrait' : 'landscape';
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return {
    viewport,
    width,
    height,
    isMobile: viewport === 'mobile',
    isTablet: viewport === 'tablet',
    isDesktop: viewport === 'desktop',
    orientation,
    isSmallMobile: width < BREAKPOINTS.mobile.medium,
    isTouchDevice,
  };
}
```

### Responsive Typography

```typescript
// tailwind.config.js - Mobile-first type scale
module.exports = {
  theme: {
    fontSize: {
      // Base sizes use clamp() for fluid scaling
      xs: ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', { lineHeight: '1.5' }],
      sm: ['clamp(0.875rem, 0.8rem + 0.375vw, 1rem)', { lineHeight: '1.5' }],
      base: ['clamp(1rem, 0.9rem + 0.5vw, 1.125rem)', { lineHeight: '1.5' }],
      lg: ['clamp(1.125rem, 1rem + 0.625vw, 1.25rem)', { lineHeight: '1.4' }],
      xl: ['clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)', { lineHeight: '1.3' }],
      '2xl': ['clamp(1.5rem, 1.3rem + 1vw, 1.875rem)', { lineHeight: '1.2' }],
      '3xl': ['clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem)', { lineHeight: '1.1' }],
    },
  },
};
```

---

## State Management

### Viewport-Aware State

```typescript
// src/stores/uiStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Viewport } from '@/config/breakpoints';

interface UIState {
  // Viewport state
  viewport: Viewport;
  orientation: 'portrait' | 'landscape';

  // Mobile UI state
  bottomSheetState: 'collapsed' | 'half' | 'full' | 'closed';
  mobileMenuOpen: boolean;

  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;

  // Performance
  performanceMode: 'auto' | 'low' | 'high';

  // Actions
  setViewport: (viewport: Viewport) => void;
  setBottomSheetState: (state: 'collapsed' | 'half' | 'full' | 'closed') => void;
  toggleMobileMenu: () => void;
  setPerformanceMode: (mode: 'auto' | 'low' | 'high') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      viewport: 'desktop',
      orientation: 'portrait',
      bottomSheetState: 'collapsed',
      mobileMenuOpen: false,
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      performanceMode: 'auto',

      setViewport: (viewport) => set({ viewport }),
      setBottomSheetState: (state) => set({ bottomSheetState: state }),
      toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
      setPerformanceMode: (mode) => set({ performanceMode: mode }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        // Only persist user preferences, not viewport state
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        largeText: state.largeText,
        performanceMode: state.performanceMode,
      }),
    }
  )
);
```

---

## Performance Optimization

### Code Splitting Strategy

```typescript
// vite.config.ts - Manual chunk splitting
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React dependencies (shared)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // UI library (shared)
          'vendor-ui': ['framer-motion', '@dnd-kit/core'],

          // Map rendering (heavy, lazy load)
          'vendor-map': ['d3', 'd3-geo', 'd3-zoom'],

          // Mobile-specific (only load on mobile)
          'mobile-components': [
            './src/components/mobile/MobileGameContainer',
            './src/components/mobile/BottomSheet',
            './src/components/mobile/MobileCountyTray',
          ],

          // Desktop-specific (only load on desktop)
          'desktop-components': ['./src/components/desktop/DesktopGameContainer'],
        },
      },
    },
  },
});
```

### Progressive Geodata Loading

```typescript
// src/services/geodataService.ts
import { getViewport } from '@/config/breakpoints';
import { getNetworkSpeed } from '@/utils/network';

type GeodataResolution = 'ultra-low' | 'low' | 'medium' | 'high';

const GEODATA_FILES: Record<GeodataResolution, string> = {
  'ultra-low': '/data/geo/california-ultra-low.json', // 21KB
  low: '/data/geo/california-low.json', // 98KB
  medium: '/data/geo/california-medium.json', // 194KB
  high: '/data/geo/california-high.json', // 966KB
};

class GeodataService {
  private cache: Map<GeodataResolution, GeoJSON.FeatureCollection> = new Map();
  private currentResolution: GeodataResolution = 'ultra-low';

  /**
   * Get appropriate geodata resolution based on:
   * - Viewport size
   * - Network speed
   * - User preferences
   * - Memory availability
   */
  async getGeodata(forceResolution?: GeodataResolution): Promise<GeoJSON.FeatureCollection> {
    const resolution = forceResolution || this.determineOptimalResolution();

    // Check cache first
    if (this.cache.has(resolution)) {
      return this.cache.get(resolution)!;
    }

    // Fetch and cache
    const geodata = await this.fetchGeodata(resolution);
    this.cache.set(resolution, geodata);
    this.currentResolution = resolution;

    return geodata;
  }

  /**
   * Determine optimal resolution based on device and network
   */
  private determineOptimalResolution(): GeodataResolution {
    const viewport = getViewport(window.innerWidth);
    const networkSpeed = getNetworkSpeed();
    const memoryInfo = (performance as any).memory;

    // Low memory device (<500MB available)
    if (memoryInfo && memoryInfo.jsHeapSizeLimit < 500_000_000) {
      return 'low';
    }

    // Slow network (<1Mbps)
    if (networkSpeed === '2g' || networkSpeed === 'slow-3g') {
      return viewport === 'mobile' ? 'ultra-low' : 'low';
    }

    // Mobile devices
    if (viewport === 'mobile') {
      return networkSpeed === '4g' ? 'medium' : 'low';
    }

    // Tablet
    if (viewport === 'tablet') {
      return 'medium';
    }

    // Desktop
    return 'high';
  }

  /**
   * Fetch geodata with retry logic
   */
  private async fetchGeodata(resolution: GeodataResolution): Promise<GeoJSON.FeatureCollection> {
    const url = GEODATA_FILES[resolution];
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const geodata = await response.json();
        return geodata;
      } catch (error) {
        lastError = error as Error;

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error(`Failed to fetch geodata after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Preload next resolution level
   */
  async preloadNextResolution() {
    const resolutions: GeodataResolution[] = ['ultra-low', 'low', 'medium', 'high'];
    const currentIndex = resolutions.indexOf(this.currentResolution);

    if (currentIndex < resolutions.length - 1) {
      const nextResolution = resolutions[currentIndex + 1];

      // Preload in background during idle time
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => this.getGeodata(nextResolution));
      }
    }
  }

  /**
   * Clear cache to free memory
   */
  clearCache() {
    this.cache.clear();
  }
}

export const geodataService = new GeodataService();
```

### Performance Monitoring Hook

```typescript
// src/hooks/usePerformanceMonitoring.ts
import { useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';

interface PerformanceMetrics {
  fps: number;
  memoryUsage?: number;
  networkSpeed: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  batteryLevel?: number;
}

export function usePerformanceMonitoring() {
  const metricsRef = useRef<PerformanceMetrics>({
    fps: 60,
    networkSpeed: 'unknown',
  });
  const setPerformanceMode = useUIStore((state) => state.setPerformanceMode);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    // FPS monitoring
    function measureFPS() {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        metricsRef.current.fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;

        // Adaptive quality: reduce quality if FPS drops below 30
        if (metricsRef.current.fps < 30) {
          setPerformanceMode('low');
        } else if (metricsRef.current.fps > 55) {
          setPerformanceMode('auto');
        }
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    }

    animationFrameId = requestAnimationFrame(measureFPS);

    // Network speed monitoring
    const connection = (navigator as any).connection;
    if (connection) {
      const updateNetworkSpeed = () => {
        metricsRef.current.networkSpeed = connection.effectiveType || 'unknown';
      };

      connection.addEventListener('change', updateNetworkSpeed);
      updateNetworkSpeed();
    }

    // Memory monitoring (Chrome only)
    if ((performance as any).memory) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        metricsRef.current.memoryUsage = usageRatio;

        // Warn if memory usage exceeds 80%
        if (usageRatio > 0.8) {
          console.warn('High memory usage detected:', usageRatio);
        }
      };

      const memoryInterval = setInterval(checkMemory, 10000); // Check every 10s

      return () => {
        clearInterval(memoryInterval);
      };
    }

    // Battery monitoring
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          metricsRef.current.batteryLevel = battery.level;

          // Reduce animations if battery < 20%
          if (battery.level < 0.2 && !battery.charging) {
            setPerformanceMode('low');
          }
        };

        battery.addEventListener('levelchange', updateBattery);
        updateBattery();
      });
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [setPerformanceMode]);

  return metricsRef.current;
}
```

---

## PWA Architecture

### Service Worker Strategy

```typescript
// public/sw.js - Service Worker
const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  static: `static-${CACHE_VERSION}`,
  geodata: `geodata-${CACHE_VERSION}`,
  runtime: `runtime-${CACHE_VERSION}`,
};

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles/globals.css',
  // Core JS bundles (from build)
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAMES.static)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !Object.values(CACHE_NAMES).includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: Cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests: Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, CACHE_NAMES.runtime));
    return;
  }

  // Geodata: Cache first, network fallback
  if (url.pathname.includes('/data/geo/')) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.geodata));
    return;
  }

  // Static assets: Stale while revalidate
  event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.static));
});

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    cache.put(request, response.clone());
    return response;
  });

  return cached || fetchPromise;
}
```

### Service Worker Registration

```typescript
// src/utils/serviceWorkerRegistration.ts
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');

      console.log('Service Worker registered:', registration.scope);

      // Check for updates every hour
      setInterval(
        () => {
          registration.update();
        },
        60 * 60 * 1000
      );

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available, prompt user to reload
            showUpdateNotification();
          }
        });
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

function showUpdateNotification() {
  // Show snackbar notification
  const confirmed = confirm('A new version is available. Reload to update?');
  if (confirmed) {
    window.location.reload();
  }
}
```

---

## Touch & Gesture System

### useHaptic Hook

```typescript
// src/hooks/useHaptic.ts
type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error';

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 50,
  success: [50, 100, 50], // Double tap
  error: 200, // Long buzz
};

export function useHaptic() {
  const vibrate = (pattern: HapticPattern) => {
    if (!('vibrate' in navigator)) {
      return; // Not supported
    }

    // Check user preference (from settings)
    const hapticsEnabled = localStorage.getItem('hapticsEnabled') !== 'false';
    if (!hapticsEnabled) {
      return;
    }

    const vibrationPattern = HAPTIC_PATTERNS[pattern];
    navigator.vibrate(vibrationPattern);
  };

  return {
    light: () => vibrate('light'),
    medium: () => vibrate('medium'),
    heavy: () => vibrate('heavy'),
    success: () => vibrate('success'),
    error: () => vibrate('error'),
  };
}
```

### useTouchGestures Hook

```typescript
// src/hooks/useTouchGestures.ts
import { useGesture } from '@use-gesture/react';
import { useRef } from 'react';

interface GestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
}

export function useTouchGestures(handlers: GestureHandlers) {
  const lastTapRef = useRef<number>(0);

  const bind = useGesture({
    // Swipe gestures
    onDrag: ({ direction: [dx, dy], distance, cancel }) => {
      const threshold = 50; // px

      if (distance > threshold) {
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal swipe
          if (dx > 0) {
            handlers.onSwipeRight?.();
          } else {
            handlers.onSwipeLeft?.();
          }
        } else {
          // Vertical swipe
          if (dy > 0) {
            handlers.onSwipeDown?.();
          } else {
            handlers.onSwipeUp?.();
          }
        }
        cancel(); // Cancel gesture after handling
      }
    },

    // Pinch to zoom
    onPinch: ({ offset: [scale] }) => {
      handlers.onPinch?.(scale);
    },

    // Double tap
    onClick: () => {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;

      if (timeSinceLastTap < 300) {
        // Double tap detected
        handlers.onDoubleTap?.();
      }

      lastTapRef.current = now;
    },

    // Long press
    onPointerDown: ({ event }) => {
      const longPressTimeout = setTimeout(() => {
        handlers.onLongPress?.();
      }, 500); // 500ms long press

      const clearLongPress = () => {
        clearTimeout(longPressTimeout);
        event.target.removeEventListener('pointerup', clearLongPress);
        event.target.removeEventListener('pointermove', clearLongPress);
      };

      event.target.addEventListener('pointerup', clearLongPress);
      event.target.addEventListener('pointermove', clearLongPress);
    },
  });

  return bind;
}
```

---

## Data Flow

### Mobile Game Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interaction                         │
│  (Touch, Swipe, Pinch, Long Press)                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               Touch Gesture Detection                        │
│  useTouchGestures() → Gesture Recognition                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Haptic Feedback                             │
│  useHaptic() → Vibration API                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Component State Update                          │
│  React State / Zustand Store                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               Business Logic Layer                           │
│  - Validate county placement                                │
│  - Update game state                                        │
│  - Check achievements                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Persistence Layer                               │
│  - localStorage (immediate)                                 │
│  - IndexedDB (background)                                   │
│  - Service Worker cache (geodata)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  UI Re-render                                │
│  - Optimistic updates                                       │
│  - Spring animations (framer-motion)                        │
│  - Smooth 60fps transitions                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing Strategy

### Mobile-Specific Test Cases

```typescript
// tests/mobile/touch-interactions.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { createPointerEvent } from '@testing-library/user-event';
import { MobileCountyTray } from '@/components/mobile/MobileCountyTray';

describe('Mobile Touch Interactions', () => {
  it('should handle press-and-hold drag initiation', async () => {
    const onDragStart = vi.fn();
    const { getByTestId } = render(
      <MobileCountyTray onDragStart={onDragStart} />
    );

    const county = getByTestId('county-alameda');

    // Simulate press-and-hold
    fireEvent.pointerDown(county);
    await new Promise(resolve => setTimeout(resolve, 300)); // Wait for long press

    expect(onDragStart).toHaveBeenCalled();
  });

  it('should detect swipe gestures', async () => {
    const onSwipeLeft = vi.fn();
    const { container } = render(
      <MobileStudyMode onSwipeLeft={onSwipeLeft} />
    );

    // Simulate swipe left
    fireEvent.touchStart(container, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchMove(container, { touches: [{ clientX: 50, clientY: 100 }] });
    fireEvent.touchEnd(container);

    expect(onSwipeLeft).toHaveBeenCalled();
  });

  it('should provide haptic feedback on success', async () => {
    const vibrateSpy = vi.spyOn(navigator, 'vibrate');

    // ... place county correctly

    expect(vibrateSpy).toHaveBeenCalledWith([50, 100, 50]); // Success pattern
  });
});
```

### Viewport Testing

```typescript
// tests/mobile/responsive.test.tsx
import { render } from '@testing-library/react';
import { AdaptiveGameContainer } from '@/components/adaptive/AdaptiveGameContainer';
import { ViewportProvider } from '@/providers/ViewportProvider';

describe('Responsive Layout', () => {
  it('should render mobile layout on small viewport', () => {
    // Mock viewport
    global.innerWidth = 375;
    global.innerHeight = 667;

    const { container } = render(
      <ViewportProvider>
        <AdaptiveGameContainer />
      </ViewportProvider>
    );

    expect(container.querySelector('.mobile-game-container')).toBeInTheDocument();
  });

  it('should render desktop layout on large viewport', () => {
    global.innerWidth = 1920;
    global.innerHeight = 1080;

    const { container } = render(
      <ViewportProvider>
        <AdaptiveGameContainer />
      </ViewportProvider>
    );

    expect(container.querySelector('.desktop-game-container')).toBeInTheDocument();
  });
});
```

---

## Deployment

### Mobile Build Configuration

```typescript
// vite.config.ts - Mobile optimizations
export default defineConfig({
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        passes: 2, // Extra compression pass
      },
    },
    rollupOptions: {
      output: {
        // Optimize chunk sizes for mobile
        manualChunks: {
          'vendor-core': ['react', 'react-dom'],
          'vendor-mobile': ['@use-gesture/react', '@react-spring/web'],
        },
      },
    },
    // Report compressed size
    reportCompressedSize: true,
    // Generate source maps for debugging
    sourcemap: true,
  },
  // PWA plugin
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'California Counties Puzzle',
        short_name: 'CA Puzzle',
        description: 'Learn California geography',
        theme_color: '#3b82f6',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
```

---

**Document Version**: 1.0.0
**Last Updated**: October 7, 2025
**Next Review**: Post-Phase 1 Implementation
