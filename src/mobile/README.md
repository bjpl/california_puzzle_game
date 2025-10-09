# Mobile Infrastructure

Mobile-optimized components, hooks, and utilities for the California Counties Puzzle Game.

**Status**: Phase 1 & 2 Complete (October 8-9, 2025)
**Next**: Phase 3 - PWA & Service Worker
**PRD**: See `docs/MOBILE_PRD.md`
**Architecture**: See `docs/MOBILE_ARCHITECTURE.md`
**Tests**: See `tests/mobile/README.md`

---

## Directory Structure

```
src/mobile/
├── components/         # Mobile-specific UI components (11 files)
│   ├── BottomSheet.tsx           # Swipeable bottom drawer
│   ├── TouchCountyDrag.tsx       # Touch-optimized drag component
│   ├── TouchFeedback.tsx         # Material Design ripple effects
│   ├── DragPreview.tsx           # Drag preview with offset
│   ├── SnapGuides.tsx            # Visual snap guides
│   ├── MobilePortraitLayout.tsx  # Portrait mode layout
│   ├── MobileLandscapeLayout.tsx # Landscape mode layout
│   ├── MobileLayoutWrapper.tsx   # Adaptive layout wrapper
│   ├── GestureTutorial.tsx       # First-time user tutorial
│   └── index.ts                  # Barrel exports
├── hooks/              # Mobile-specific React hooks (7 files)
│   ├── useMediaQuery.ts       # Responsive media queries
│   ├── useDeviceInfo.ts       # Device detection and info
│   ├── useHaptic.ts           # Haptic feedback
│   ├── usePinchZoom.ts        # Pinch-to-zoom gesture
│   ├── useGestureDetection.ts # Tap, swipe, pinch detection
│   └── index.ts               # Barrel exports
├── utils/              # Mobile utilities (1 file)
│   └── progressiveGeodata.ts  # Smart geodata loading
├── config/             # Mobile configuration (2 files)
│   ├── breakpoints.ts         # Responsive breakpoints
│   └── touchSensors.ts        # Touch/drag configuration
├── styles/             # Mobile CSS (2 files)
│   ├── touchFeedback.css      # Touch animations
│   └── utilities.css          # Mobile utilities
└── index.ts            # Main barrel export
```

---

## Quick Start

### Responsive Breakpoints

```tsx
import { useMediaQuery, useDeviceInfo } from '@/mobile/hooks';
import { MEDIA_QUERIES } from '@/mobile/config/breakpoints';

function ResponsiveComponent() {
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);
  const device = useDeviceInfo();

  if (device.isMobile && device.isPortrait) {
    return <MobilePortraitLayout />;
  }

  return <DesktopLayout />;
}
```

### Bottom Sheet

```tsx
import { BottomSheet, BottomSheetState } from '@/mobile/components/BottomSheet';

function CountyInfoSheet({ county }) {
  return (
    <BottomSheet
      initialState={BottomSheetState.COLLAPSED}
      onStateChange={(state) => {
        // Handle state change (e.g., analytics, state management)
      }}
    >
      <CountyDetails county={county} />
    </BottomSheet>
  );
}
```

### Haptic Feedback

```tsx
import { useHaptic } from '@/mobile/hooks/useHaptic';

function DraggableCounty() {
  const haptic = useHaptic({ enabled: true, intensity: 1.0 });

  const handleDragStart = () => {
    haptic.dragStart(); // Light tick
  };

  const handleCorrectPlacement = () => {
    haptic.success(); // Success pattern
  };

  return <div onDragStart={handleDragStart}>County</div>;
}
```

### Progressive Geodata Loading

```tsx
import { AdaptiveGeodataLoader } from '@/mobile/utils/progressiveGeodata';

const geodataLoader = new AdaptiveGeodataLoader();

// Load based on zoom level
const data = await geodataLoader.load(zoomLevel, (loaded, total) => {
  // eslint-disable-next-line no-console
  console.log(`Loading: ${((loaded / total) * 100).toFixed(0)}%`);
});

// Preload next level
await geodataLoader.preloadNext(currentZoom);
```

---

## Key Features

### 📱 Responsive Design

- **6 breakpoints**: Small/medium/large phones, small/large tablets, desktop
- **Touch targets**: WCAG AAA compliant (44px minimum)
- **Fluid typography**: `clamp()` for scalable fonts
- **Safe area handling**: iOS notch and gesture bar support

### 👆 Touch Optimization

- **Press-and-hold drag**: 300ms delay prevents accidental drags
- **Swipe gestures**: Configurable threshold and velocity
- **Haptic feedback**: 8 predefined patterns + custom
- **Gesture cancellation**: Multi-touch and bounds detection

### 🎨 Mobile Components (Phase 1 & 2)

**Layout Components:**

- **MobilePortraitLayout**: Vertical layout (map 60vh, tray 30vh)
- **MobileLandscapeLayout**: Horizontal layout (map 70vw, sidebar 30vw)
- **MobileLayoutWrapper**: Auto-switching responsive wrapper

**Interaction Components:**

- **TouchCountyDrag**: Touch-optimized draggable counties with haptic
- **BottomSheet**: Swipeable drawer with 4 states (closed/collapsed/half/full)
- **GestureTutorial**: Interactive 6-step onboarding

**Feedback Components:**

- **TouchFeedback**: Material Design ripple effects
- **DragPreview**: Preview follows finger with 20px offset
- **SnapGuides**: Visual drop zone guides with distance indicators

### 🌐 Network Awareness

- **Connection detection**: 2G/3G/4G automatic detection
- **Adaptive loading**: Downgrades geodata on slow connections
- **Progressive enhancement**: Start with ultra-low, load higher quality as needed
- **Intelligent caching**: Keep optimal levels, free unused

### ⚡ Performance

- **Lazy loading**: Load mobile components only on mobile devices
- **Code splitting**: Separate bundle for mobile-specific code
- **Memory management**: Clear unused geodata levels
- **60fps animations**: Optimized for smooth interactions

---

## Configuration

### Breakpoints (`config/breakpoints.ts`)

**Pixel Values**:

- Small phone: 320px (iPhone SE 1st gen)
- Medium phone: 375px (iPhone 12/13)
- Large phone: 428px (iPhone Pro Max)
- Small tablet: 768px (iPad mini)
- Desktop: 1280px+

**Media Queries**:

- `MEDIA_QUERIES.mobile`: All phones (<768px)
- `MEDIA_QUERIES.tablet`: All tablets (768px-1279px)
- `MEDIA_QUERIES.touch`: Touch-capable devices
- `MEDIA_QUERIES.portrait`: Portrait orientation
- `MEDIA_QUERIES.reducedMotion`: Accessibility preference

### Touch Targets

**Sizes** (WCAG compliance):

- AAA: 44px (recommended, implemented everywhere)
- AA: 24px (minimum acceptable)
- Optimal: 48px (comfortable touch)
- FAB: 64px (floating action buttons)

### Gestures

**Thresholds**:

- Swipe distance: 50px minimum
- Swipe velocity: 0.3 px/ms minimum
- Press-and-hold: 300ms duration
- Snap threshold: 50px from target

### Performance Budgets

**Targets**:

- First Contentful Paint: <1.5s
- Time to Interactive: <3.0s
- Touch response: <50ms
- Frame rate: 60fps target, 50fps minimum

---

## Hooks API

### useMediaQuery

```tsx
useMediaQuery(query: string, defaultValue?: boolean): boolean
```

Tracks CSS media query matches with real-time updates.

### useDeviceInfo

```tsx
useDeviceInfo(debounceMs?: number): DeviceInfo
```

Provides comprehensive device information:

- `width`, `height` - Viewport dimensions
- `deviceType` - SMALL_PHONE | MEDIUM_PHONE | etc.
- `orientation` - PORTRAIT | LANDSCAPE
- `isMobile`, `isTablet`, `isDesktop` - Device category
- `isTouch` - Touch capability
- `reducedMotion`, `darkMode` - User preferences
- `pixelRatio` - Screen density

### useHaptic

```tsx
useHaptic(settings?: HapticSettings): HapticAPI
```

Provides haptic feedback methods:

- `tap()` - Light tap (10ms)
- `success()` - Success pattern (50-100-50ms)
- `error()` - Error vibration (200ms)
- `achievement()` - Celebration pattern
- `dragStart()`, `snap()`, `selection()` - Interaction feedback
- `custom(pattern)` - Custom vibration pattern
- `isSupported` - Check if device supports haptics

---

## Utilities API

### Progressive Geodata

```tsx
// Determine optimal level
const level = getOptimalGeodetaLevel(zoomLevel, forceLevel?);

// Load geodata
const data = await loadGeodata(level, onProgress?);

// Preload multiple levels
await preloadGeodata([GeodetaLevel.LOW, GeodetaLevel.MEDIUM]);

// Cache management
clearGeodataCache(keepLevels?);
const status = getGeodataCacheStatus();

// Adaptive loader (recommended)
const loader = new AdaptiveGeodataLoader();
const data = await loader.load(zoomLevel, onProgress);
await loader.preloadNext(currentZoom);
```

### Touch Sensors

```tsx
// @dnd-kit sensor configuration
import { MOBILE_SENSORS } from '@/mobile/config/touchSensors';

<DndContext
  sensors={useSensors(...MOBILE_SENSORS.map(({ sensor, options }) => useSensor(sensor, options)))}
>
  {/* Draggable components */}
</DndContext>;

// Gesture utilities
const coords = getTouchCoordinates(event);
const velocity = calculateDragVelocity(startX, startY, endX, endY, duration);
const isSwipe = isSwipeGesture(startX, startY, endX, endY, duration);
const direction = getSwipeDirection(startX, startY, endX, endY);
```

---

## Components API

### BottomSheet

```tsx
<BottomSheet
  initialState={BottomSheetState.COLLAPSED}
  onStateChange={(state) => {}}
  showBackdrop={true}
  closeOnBackdropTap={true}
  enableSwipe={true}
  heights={{
    collapsed: 64,
    half: '50vh',
    full: '90vh',
  }}
>
  {/* Sheet content */}
</BottomSheet>
```

**States**:

- `CLOSED` - Hidden (0vh)
- `COLLAPSED` - Peek view (10vh / 64px)
- `HALF` - Partial view (50vh)
- `FULL` - Full screen (90vh)

**Features**:

- Swipe up/down to transition between states
- Spring-based smooth animations (300ms)
- Backdrop overlay with tap-to-close
- Prevents body scroll when open
- Drag handle for visual affordance

---

## Usage Patterns

### Adaptive Layout

```tsx
function AdaptiveGameContainer() {
  const device = useDeviceInfo();
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);

  if (isMobile && device.isPortrait) {
    return (
      <div className="mobile-portrait-layout">
        <MapArea height="60vh" />
        <CountyTray height="30vh" />
        <BottomSheet initialState={BottomSheetState.COLLAPSED}>
          <GameInfo />
        </BottomSheet>
      </div>
    );
  }

  if (isMobile && device.isLandscape) {
    return (
      <div className="mobile-landscape-layout">
        <MapArea width="70vw" />
        <Sidebar width="30vw" />
      </div>
    );
  }

  return <DesktopLayout />;
}
```

### Progressive Enhancement

```tsx
function MapWithProgressiveData() {
  const [zoom, setZoom] = useState(1);
  const [geodata, setGeodata] = useState(null);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(new AdaptiveGeodataLoader());

  useEffect(() => {
    setLoading(true);
    loaderRef.current
      .load(zoom, (loaded, total) => {
        // Progress logging for demo purposes
        // eslint-disable-next-line no-console
        console.log(`${((loaded / total) * 100).toFixed(0)}%`);
      })
      .then(setGeodata)
      .finally(() => setLoading(false));
  }, [zoom]);

  if (loading) return <LoadingSpinner />;
  return <CaliforniaMap data={geodata} zoom={zoom} onZoomChange={setZoom} />;
}
```

---

## Testing

Mobile components and hooks include TypeScript types and are designed for testability.

**Test Files** (13 files, 2,220+ tests):

**Hook Tests:**

- `tests/mobile/hooks/useMediaQuery.test.ts` - 88 tests
- `tests/mobile/hooks/useDeviceInfo.test.ts` - 104 tests
- `tests/mobile/hooks/useHaptic.test.ts` - 152 tests
- `tests/mobile/hooks/usePinchZoom.test.ts` - 124 tests
- `tests/mobile/hooks/useGestureDetection.test.ts` - 156 tests

**Component Tests:**

- `tests/mobile/components/BottomSheet.test.tsx` - 184 tests
- `tests/mobile/components/TouchCountyDrag.test.tsx` - 204 tests
- `tests/mobile/components/MobileLayoutWrapper.test.tsx` - 156 tests
- `tests/mobile/components/TouchFeedback.test.tsx` - 136 tests
- `tests/mobile/components/GestureTutorial.test.tsx` - 228 tests

**Utility Tests:**

- `tests/mobile/utils/progressiveGeodata.test.ts` - 180 tests
- `tests/mobile/config/breakpoints.test.ts` - 240 tests
- `tests/mobile/config/touchSensors.test.ts` - 268 tests

**Pass Rate**: ~95% (minor edge case fixes in progress)
**Categories**: All tests tagged |unit|, |integration|, |a11y|, |performance|

---

## Browser Support

**Primary** (90%):

- iOS Safari 15+
- Chrome Mobile 100+
- Samsung Internet 16+
- Firefox Mobile 100+

**APIs Used**:

- Vibration API (haptic feedback)
- Network Information API (adaptive loading)
- Media Queries (responsive design)
- Pointer Events (touch handling)
- IntersectionObserver (lazy loading)

**Graceful Degradation**:

- All APIs have fallbacks for unsupported browsers
- Feature detection before usage
- Console warnings (not errors) for missing features

---

## Performance Considerations

### Memory Management

- Cache size: ~1.2MB max (all 4 geodata levels)
- Automatic cleanup: Keep only 2 most recent levels
- Manual control: `clearGeodataCache(keepLevels)`

### Network Optimization

- Connection-aware loading (2G/3G/4G detection)
- Retry logic with exponential backoff
- Prefer cached data over network requests

### Animation Performance

- Hardware-accelerated transforms (translate, scale)
- RequestAnimationFrame for smooth 60fps
- Respect `prefers-reduced-motion`
- Disable animations on low-end devices (< 4 cores)

---

## Roadmap

### ✅ Phase 1: Foundation (Complete - Oct 8, 2025)

- ✅ Responsive breakpoint system (6 device categories)
- ✅ Touch-optimized sensors (@dnd-kit configuration)
- ✅ Bottom sheet component (swipeable drawer)
- ✅ Haptic feedback (8 vibration patterns)
- ✅ Progressive geodata loading (network-aware)
- ✅ Device detection hooks (useMediaQuery, useDeviceInfo)

### ✅ Phase 2: Touch Interactions (Complete - Oct 8-9, 2025)

- ✅ Touch-optimized drag-and-drop (TouchCountyDrag)
- ✅ Pinch-to-zoom gesture (usePinchZoom)
- ✅ Gesture detection (tap, swipe, pinch)
- ✅ Touch feedback overlays (ripple, preview, snap guides)
- ✅ Mobile layouts (portrait, landscape, wrapper)
- ✅ Gesture tutorial (6-step interactive onboarding)
- ✅ Comprehensive test suite (13 files, 2,220+ tests)

### 🚧 Phase 3: PWA & Polish (Next)

- Service worker for offline gameplay
- PWA manifest with app icons
- Install prompts (iOS & Android)
- Dark mode toggle
- Performance monitoring dashboard
- Lighthouse CI integration

---

## Contributing

When adding mobile features:

1. **Test on real devices** - Emulators don't accurately simulate touch
2. **Check PRD** - Follow specifications in `docs/MOBILE_PRD.md`
3. **Maintain type safety** - All code is TypeScript with strict mode
4. **Add documentation** - Update this README with new APIs
5. **Performance first** - Mobile users on slower connections

---

## License

MIT License - Same as main project

---

**Built for mobile-first California geography education** 📱🗺️
