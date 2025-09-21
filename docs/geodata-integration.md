# California GeoData Integration Guide

## Overview

This guide explains how to use the California GeoData processing pipeline that converts shapefiles to optimized GeoJSON formats and provides React/TypeScript utilities for interactive map visualization.

## Architecture

### Data Processing Pipeline

```
CA_Counties.shp → GeoJSON → Optimized Levels → React Integration
     ↓                ↓            ↓               ↓
  Raw Shapefile   Raw GeoJSON   4 Detail Levels   React Hook
     (58 counties)   (22MB)     (0.5MB - 22MB)    (useCaliforniaMap)
```

### File Structure

```
california_puzzle_game/
├── Geo data/                      # Source shapefiles
│   └── CA_Counties.shp            # Original shapefile data
├── scripts/                       # Processing scripts
│   ├── process-geodata.js         # Main conversion script
│   ├── map-utilities.js           # D3-geo utilities (Node.js)
│   └── data-optimizer.js          # Advanced optimization
├── public/data/geo/               # Processed data
│   ├── ca-counties-raw.geojson    # Raw converted data
│   ├── ca-counties-high.geojson   # High detail (22MB)
│   ├── ca-counties-medium.geojson # Medium detail (4.5MB)
│   ├── ca-counties-low.geojson    # Low detail (2.3MB)
│   ├── ca-counties-ultra-low.geojson # Ultra low (0.5MB)
│   ├── county-lookup.json         # County metadata
│   ├── projection-configs.json    # D3 projection settings
│   └── geo-manifest.json          # Usage guidelines
└── src/                          # React/TypeScript integration
    ├── hooks/useCaliforniaMap.ts # Main React hook
    ├── utils/geoDataCache.ts     # Caching system
    ├── utils/mapUtilities.ts     # Map utilities (React)
    └── components/CaliforniaMapDemo.tsx # Example component
```

## Quick Start

### 1. Process the GeoData

```bash
# Install dependencies
npm install

# Process shapefile to optimized GeoJSON
npm run process-geodata

# Or run directly
node scripts/process-geodata.js
```

### 2. Use in React Components

```tsx
import React from 'react';
import useCaliforniaMap from '../hooks/useCaliforniaMap';
import CaliforniaMapDemo from '../components/CaliforniaMapDemo';

function App() {
  return (
    <div>
      <h1>California Counties Puzzle</h1>
      <CaliforniaMapDemo width={1024} height={768} />
    </div>
  );
}

export default App;
```

### 3. Custom Integration

```tsx
import useCaliforniaMap from '../hooks/useCaliforniaMap';

function CustomMap() {
  const {
    mapState,
    mapUtils,
    loadDetailLevel,
    getCountyAtPoint
  } = useCaliforniaMap({
    width: 800,
    height: 600,
    initialProjection: 'albers',
    preloadLevels: ['ultra-low', 'low']
  });

  // Your custom map logic here
  return <div>Custom map implementation</div>;
}
```

## Data Structure

### County Lookup Data

```json
{
  "counties": [
    {
      "id": "06067",
      "name": "Sacramento",
      "fullName": "Sacramento County",
      "centroid": [-121.3404408, 38.4500161],
      "area": {
        "land": 2499983887,
        "water": 75425434
      },
      "bounds": {
        "southwest": [-13565686.4934, 4582029.1173],
        "northeast": [-13472674.8173, 4683984.6032],
        "center": [-13519180.6554, 4633006.8603]
      }
    }
  ],
  "totalCounties": 58,
  "generatedAt": "2025-09-21T02:25:53.169Z"
}
```

### GeoJSON Structure

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "GEOID": "06067",
        "NAME": "Sacramento",
        "NAMELSAD": "Sacramento County",
        "ALAND": 2499983887,
        "AWATER": 75425434,
        "INTPTLAT": "+38.4500161",
        "INTPTLON": "-121.3404408"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[lat, lng], ...]]
      }
    }
  ],
  "metadata": {
    "optimizationLevel": "medium",
    "tolerance": 0.005,
    "processingTime": 1234.56,
    "compressionRatio": 2.3
  }
}
```

## Performance Optimization

### Detail Level Usage

| Zoom Level | Detail Level | File Size | Use Case |
|------------|-------------|-----------|----------|
| 0-5        | ultra-low   | 0.5MB     | Overview, initial load |
| 6-7        | low         | 2.3MB     | Navigation, panning |
| 8-9        | medium      | 4.5MB     | County selection |
| 10+        | high        | 22MB      | Detailed interaction |

### Automatic Level Switching

```tsx
const { getOptimalDetailLevel, loadDetailLevel } = useCaliforniaMap();

// Automatically switch based on zoom
useEffect(() => {
  const optimalLevel = getOptimalDetailLevel(currentZoom);
  if (optimalLevel !== currentLevel) {
    loadDetailLevel(optimalLevel);
  }
}, [currentZoom]);
```

### Caching Strategy

```tsx
// Preload essential levels
const { mapState } = useCaliforniaMap({
  preloadLevels: ['ultra-low', 'low', 'medium']
});

// Check cache status
console.log('Cache stats:', cache.getCacheStats());
```

## Projection Settings

### Available Projections

1. **Albers Equal Area Conic** (Recommended for California)
   - Best area representation
   - Optimized for California's shape
   - Good for puzzle games

2. **Mercator** (Web Standard)
   - Compatible with web maps
   - Familiar to users
   - Some distortion at edges

3. **Lambert Conformal Conic** (Shape Preserving)
   - Preserves county shapes
   - Good for detailed work
   - Minimal shape distortion

### Usage

```tsx
const { switchProjection } = useCaliforniaMap();

// Switch projection
switchProjection('albers'); // or 'mercator', 'lambert'
```

## Collision Detection

### Basic Usage

```tsx
const { collisionDetector } = useCaliforniaMap();

// Check if dragged element overlaps with counties
const collisions = collisionDetector?.checkCollisions(draggedElement, 0.8);

if (collisions && collisions.length > 0) {
  const bestMatch = collisions[0];
  console.log(`Best match: ${bestMatch.county.properties.NAME}`);

  // Snap to position
  snapToPosition(bestMatch.snapPoint);
}
```

### Advanced Collision Detection

```tsx
// Find nearest drop target
const nearest = collisionDetector?.findNearestTarget([x, y], 100);

if (nearest) {
  console.log(`Nearest county: ${nearest.county.properties.NAME}`);
  console.log(`Distance: ${nearest.distance}px`);
}
```

## Coordinate Transformations

### Screen ↔ Geographic

```tsx
const { screenToGeo, geoToScreen } = useCaliforniaMap();

// Convert mouse position to geographic coordinates
const geoPoint = screenToGeo([mouseX, mouseY]);

// Convert geographic point to screen position
const screenPoint = geoToScreen([-119.4179, 36.7783]); // California center
```

### County Information

```tsx
const { getCountyAtPoint, mapState } = useCaliforniaMap();

// Get county under mouse cursor
const county = getCountyAtPoint([mouseX, mouseY]);

if (county) {
  console.log(`Mouse over: ${county.name} County`);
  console.log(`County ID: ${county.id}`);
}
```

## API Reference

### useCaliforniaMap Hook

```tsx
interface UseCaliforniaMapOptions {
  width?: number;              // Map width (default: 1024)
  height?: number;             // Map height (default: 768)
  margin?: object;             // Map margins
  initialProjection?: string;  // Starting projection
  preloadLevels?: string[];    // Levels to preload
}

interface UseCaliforniaMapReturn {
  mapState: MapState;          // Current map state
  mapUtils: MapUtilities;      // D3 utilities
  collisionDetector: Detector; // Collision detection
  loadDetailLevel: Function;   // Load data level
  switchProjection: Function;  // Change projection
  zoomToCounty: Function;      // Zoom to specific county
  zoomToFitAll: Function;      // Fit all counties
  getCountyAtPoint: Function;  // Point-to-county lookup
  screenToGeo: Function;       // Coordinate conversion
  geoToScreen: Function;       // Coordinate conversion
  getOptimalDetailLevel: Function; // Performance optimization
  clearCache: Function;        // Cache management
}
```

### MapState Interface

```tsx
interface MapState {
  isLoading: boolean;          // Data loading status
  error: string | null;        // Error message
  currentDetailLevel: string;  // Active detail level
  zoomLevel: number;           // Current zoom level
  transform: ZoomTransform;    // D3 zoom transform
  counties: CountyData[];      // County metadata
  geoData: GeoJsonFeature[];   // Geographic features
}
```

## Build Scripts

```json
{
  "process-geodata": "node scripts/process-geodata.js",
  "geodata:build": "npm run process-geodata",
  "geodata:serve": "python -m http.server 8080 --directory public"
}
```

## Performance Tips

1. **Use appropriate detail levels** for zoom ranges
2. **Preload essential data** (ultra-low, low) on app start
3. **Cache frequently accessed** county data
4. **Debounce zoom events** to avoid excessive level switching
5. **Use collision detection sparingly** during drag operations

## Troubleshooting

### Common Issues

1. **Shapefile not found**: Ensure `CA_Counties.shp` is in `Geo data/` folder
2. **Memory issues**: Reduce `maxCacheSize` in cache options
3. **Slow loading**: Use progressive loading strategy
4. **Projection errors**: Verify projection name spelling

### Debug Information

```tsx
// Enable debug mode
const { mapState } = useCaliforniaMap();

console.log('Map state:', mapState);
console.log('Cache stats:', cache.getCacheStats());
```

## Example Implementation

See `src/components/CaliforniaMapDemo.tsx` for a complete working example that demonstrates:

- Map rendering with D3
- Zoom and pan functionality
- County selection
- Projection switching
- Detail level optimization
- Error handling

This provides a solid foundation for building interactive California county puzzle games with optimized performance and smooth user experience.