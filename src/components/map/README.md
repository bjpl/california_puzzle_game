# Map Components

California map rendering using D3.js with Canvas and SVG implementations for optimal performance and interactivity.

## Components

### CaliforniaMapSimple.tsx

Primary map component for gameplay. Optimized SVG-based map with drag-and-drop support.

**Features:**

- D3.js geographic projection (Albers USA)
- County click and hover interactions
- Region color support
- Drag-and-drop visual feedback
- Responsive sizing

**Usage:**

```typescript
import CaliforniaMapSimple from '@/components/map/CaliforniaMapSimple';

<CaliforniaMapSimple
  isDragging={isDragging}
/>
```

### CaliforniaMapFixed.tsx

SVG-based static map with full interactivity.

**Features:**

- Click to select counties
- Hover highlighting
- Region color display
- Selected county tracking

**Usage:**

```typescript
import CaliforniaMapFixed from '@/components/map/CaliforniaMapFixed';

<CaliforniaMapFixed
  selectedCounties={selectedCountyIds}
  onCountyClick={handleCountyClick}
  showRegions={showRegions}
/>
```

**Props:**

```typescript
interface CaliforniaMapFixedProps {
  selectedCounties?: string[];
  onCountyClick?: (countyId: string) => void;
  showRegions?: boolean;
}
```

### CaliforniaMapCanvas.tsx

Canvas-based map for better performance with large datasets.

**Features:**

- High-performance rendering
- Scales well with >100 elements
- Lower memory footprint
- Same visual appearance as SVG

**Usage:**

```typescript
import CaliforniaMapCanvas from '@/components/map/CaliforniaMapCanvas';

<CaliforniaMapCanvas
  selectedCounties={selectedCountyIds}
  onCountyClick={handleCountyClick}
/>
```

**When to use:**

- Large number of interactive elements
- Animation-heavy scenarios
- Performance-constrained devices

### StudyModeMap.tsx

Interactive map designed for learning mode.

**Features:**

- County information tooltips
- Focus on specific counties
- Highlighting for learning
- Read-only interaction

**Usage:**

```typescript
import StudyModeMap from '@/components/map/StudyModeMap';

<StudyModeMap
  focusedCounty={currentCounty}
  onCountyHover={handleHover}
/>
```

## Architecture

### D3 + React Integration Pattern

These components follow the "React for state, D3 for calculations" pattern:

```typescript
useEffect(() => {
  if (!svgRef.current || !mapData) return;

  // D3 handles projections and calculations
  const projection = d3.geoAlbers().fitSize([width, height], mapData);

  const pathGenerator = d3.geoPath().projection(projection);

  // React manages the actual rendering
  // Cleanup prevents memory leaks
  return () => {
    // Cleanup code
  };
}, [mapData, width, height]);
```

### Performance Considerations

#### SVG vs Canvas Decision Matrix

| Scenario               | Use SVG | Use Canvas |
| ---------------------- | ------- | ---------- |
| <50 elements           | ✅      | ❌         |
| Interactivity needed   | ✅      | ⚠️         |
| Accessibility required | ✅      | ❌         |
| >100 elements          | ❌      | ✅         |
| Animation-heavy        | ⚠️      | ✅         |
| Memory constrained     | ❌      | ✅         |

#### Optimization Techniques

1. **Memoization**: Expensive calculations cached
2. **useEffect cleanup**: Prevent memory leaks
3. **requestAnimationFrame**: Smooth animations
4. **Debounced resize**: Prevent excessive re-renders

### D3 Projection Setup

California-optimized Albers projection:

```typescript
const projection = d3
  .geoAlbers()
  .parallels([34, 40.5]) // California-specific parallels
  .rotate([120, 0]) // Center on California
  .fitSize([width, height], geoData);
```

## Map Data

### GeoJSON Format

Counties are represented as GeoJSON features:

```typescript
interface CountyGeoJSON {
  type: 'Feature';
  properties: {
    name: string;
    id: string;
    region?: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
}
```

### Data Loading

Map data is loaded from `/public/data/california-counties.json`:

```typescript
import mapData from '@/data/california-counties.json';
```

## Styling

### Default Colors

```typescript
const DEFAULT_COLORS = {
  unplaced: '#e5e7eb', // Light gray
  placed: '#10b981', // Green
  incorrect: '#ef4444', // Red
  hover: '#fbbf24', // Yellow
  dragging: '#c7d2fe', // Light indigo
};
```

### Region Colors

When `showRegions` is enabled, counties use region-specific colors:

- Bay Area: Blue
- Central Valley: Green
- Southern California: Orange
- Northern California: Purple
- Central Coast: Teal

## Interactions

### Click Handling

```typescript
const handleCountyClick = (countyId: string) => {
  // Game logic determines if click is valid
  if (canSelectCounty(countyId)) {
    selectCounty(countyId);
  }
};
```

### Hover States

```typescript
const handleMouseEnter = (countyId: string) => {
  setHoveredCounty(countyId);
  // Visual feedback via stroke and fill changes
};

const handleMouseLeave = () => {
  setHoveredCounty(null);
};
```

### Drag-and-Drop Integration

Maps work with DndKit for county placement:

```typescript
// In GameContainer
<DndContext onDragEnd={handleDragEnd}>
  <CaliforniaMapSimple isDragging={isDragging} />
</DndContext>
```

## Known Issues

See [TECH_DEBT_CLEANUP_REPORT.md](../../docs/TECH_DEBT_CLEANUP_REPORT.md) for:

### Formation Animation Crash (FIXED)

- **Issue**: Formation animation caused crashes and reverted to 1850
- **Solution**: Improved null checking and state management

### Map Visibility Issue (FIXED)

- **Issue**: Invisible map due to white default colors
- **Solution**: Changed default county colors to light gray (#e5e7eb)

### Region Color State Management (FIXED)

- **Issue**: Region colors persisted after "Show Regions" was toggled off
- **Solution**: Proper state cleanup in region toggle handler

## Accessibility

### SVG Maps

- **ARIA labels**: Each county has aria-label
- **Keyboard navigation**: Tab through counties
- **Focus indicators**: Visible stroke on focus
- **Screen reader support**: County names announced

```typescript
<path
  aria-label={`${county.name} county`}
  role="button"
  tabIndex={0}
  onKeyPress={(e) => e.key === 'Enter' && handleClick(county.id)}
/>
```

### Canvas Maps

- **Fallback text**: Alternative text description
- **ARIA live region**: Announces selection changes
- **Keyboard shortcuts**: Alternative interaction method

## Testing

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import CaliforniaMapFixed from './CaliforniaMapFixed';

test('calls onCountyClick when county is clicked', () => {
  const handleClick = jest.fn();
  render(<CaliforniaMapFixed onCountyClick={handleClick} />);

  const county = screen.getByLabelText(/Alameda county/i);
  fireEvent.click(county);

  expect(handleClick).toHaveBeenCalledWith('alameda');
});
```

### Integration Tests

```typescript
test('highlights selected counties', () => {
  render(<CaliforniaMapFixed selectedCounties={['alameda']} />);

  const county = screen.getByLabelText(/Alameda county/i);
  expect(county).toHaveClass('selected');
});
```

## Performance Benchmarks

Tested on MacBook Pro (M1, 16GB RAM):

| Map Type     | Initial Load | Re-render | Memory |
| ------------ | ------------ | --------- | ------ |
| SVG (Simple) | ~80ms        | ~20ms     | ~15MB  |
| SVG (Fixed)  | ~120ms       | ~30ms     | ~20MB  |
| Canvas       | ~50ms        | ~10ms     | ~8MB   |

## Migration Guide

### From CaliforniaMapFixed to CaliforniaMapSimple

```typescript
// Before
<CaliforniaMapFixed
  selectedCounties={selected}
  onCountyClick={handleClick}
  showRegions={showRegions}
/>

// After
<CaliforniaMapSimple
  isDragging={isDragging}
  // Uses GameContext internally for selected counties
/>
```

## Related Components

- **GameContainer** (`/game`): Integrates map with game logic
- **CountyTray** (`/county`): Provides counties for drag-and-drop
- **RegionsPanel** (`/regions`): Controls region display
- **StudyMode** (`/study`): Uses StudyModeMap for learning

## Related Documentation

- [Map Rendering Architecture](../../docs/MAP_ARCHITECTURE.md)
- [D3 Integration Guide](../../docs/D3_INTEGRATION.md)
- [Tech Debt Cleanup](../../docs/TECH_DEBT_CLEANUP_REPORT.md)
- [GeoJSON Data Format](../../docs/GEOJSON_FORMAT.md)

---

For the overall component architecture, see [Component Architecture](../README.md)
