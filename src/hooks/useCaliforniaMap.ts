/**
 * React Hook for California Map Integration
 * Provides map utilities, geodata loading, and D3-geo integration for the puzzle game
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as d3 from 'd3-geo';
import { GeoDataCache } from '../utils/geoDataCache';
import { CaliforniaMapUtilities, CountyCollisionDetector } from '../utils/mapUtilities';

export interface CountyData {
  id: string;
  name: string;
  fullName: string;
  centroid: [number, number];
  area: {
    land: number;
    water: number;
  };
  bounds: {
    southwest: [number, number];
    northeast: [number, number];
    center: [number, number];
  };
}

export interface GeoJsonFeature {
  type: 'Feature';
  properties: {
    GEOID: string;
    NAME: string;
    NAMELSAD: string;
    ALAND: number;
    AWATER: number;
    INTPTLAT: string;
    INTPTLON: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
}

export interface ProjectionConfig {
  type: string;
  center?: [number, number];
  parallels?: [number, number];
  rotate?: [number, number];
  scale: number;
  translate: [number, number];
}

export interface MapState {
  isLoading: boolean;
  error: string | null;
  currentDetailLevel: 'ultra-low' | 'low' | 'medium' | 'high';
  zoomLevel: number;
  transform: d3.ZoomTransform | null;
  counties: CountyData[];
  geoData: GeoJsonFeature[] | null;
}

export interface UseCaliforniaMapOptions {
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  initialProjection?: 'albers' | 'mercator' | 'lambert';
  preloadLevels?: ('ultra-low' | 'low' | 'medium' | 'high')[];
}

export interface UseCaliforniaMapReturn {
  // State
  mapState: MapState;

  // Map utilities
  mapUtils: CaliforniaMapUtilities | null;
  collisionDetector: CountyCollisionDetector | null;

  // Data loading
  loadDetailLevel: (level: 'ultra-low' | 'low' | 'medium' | 'high') => Promise<void>;
  switchProjection: (projection: 'albers' | 'mercator' | 'lambert') => void;

  // Map interactions
  zoomToCounty: (countyId: string, duration?: number) => d3.ZoomTransform | null;
  zoomToFitAll: (padding?: number) => d3.ZoomTransform | null;
  getCountyAtPoint: (point: [number, number]) => CountyData | null;

  // Coordinate utilities
  screenToGeo: (screenPoint: [number, number]) => [number, number] | null;
  geoToScreen: (geoPoint: [number, number]) => [number, number] | null;

  // Performance
  getOptimalDetailLevel: (zoomLevel: number) => 'ultra-low' | 'low' | 'medium' | 'high';
  clearCache: () => void;
}

export function useCaliforniaMap(options: UseCaliforniaMapOptions = {}): UseCaliforniaMapReturn {
  const {
    width = 1024,
    height = 768,
    margin = { top: 20, right: 20, bottom: 20, left: 20 },
    initialProjection = 'albers',
    preloadLevels = ['ultra-low', 'low']
  } = options;

  // State
  const [mapState, setMapState] = useState<MapState>({
    isLoading: false,
    error: null,
    currentDetailLevel: 'low',
    zoomLevel: 1,
    transform: null,
    counties: [],
    geoData: null
  });

  // Refs for utilities
  const mapUtilsRef = useRef<CaliforniaMapUtilities | null>(null);
  const collisionDetectorRef = useRef<CountyCollisionDetector | null>(null);
  const cacheRef = useRef<GeoDataCache | null>(null);

  // Initialize utilities
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setMapState(prev => ({ ...prev, isLoading: true, error: null }));

        // Initialize cache
        cacheRef.current = new GeoDataCache();

        // Initialize map utilities
        mapUtilsRef.current = new CaliforniaMapUtilities({
          width,
          height,
          margin
        });

        // Set initial projection
        mapUtilsRef.current.setProjection(initialProjection);

        // Load initial data
        await loadDetailLevel('low');

        // Preload other levels in background
        preloadLevels.forEach(level => {
          if (level !== 'low') {
            loadDetailLevel(level).catch(console.warn);
          }
        });

      } catch (error) {
        setMapState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to initialize map'
        }));
      } finally {
        setMapState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeMap();
  }, [width, height, initialProjection]);

  // Load detail level
  const loadDetailLevel = useCallback(async (level: 'ultra-low' | 'low' | 'medium' | 'high') => {
    if (!cacheRef.current || !mapUtilsRef.current) return;

    try {
      setMapState(prev => ({ ...prev, isLoading: true, error: null }));

      const data = await cacheRef.current.loadOptimizedData(level);

      // Update map utilities with new data
      await mapUtilsRef.current.loadGeoData(
        `/data/geo/ca-counties-${level}.geojson`,
        '/data/geo/county-lookup.json'
      );

      // Initialize collision detector
      collisionDetectorRef.current = mapUtilsRef.current.createCollisionDetector();

      setMapState(prev => ({
        ...prev,
        currentDetailLevel: level,
        counties: data.lookup.counties,
        geoData: data.geoData.features,
        isLoading: false
      }));

    } catch (error) {
      setMapState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load map data',
        isLoading: false
      }));
    }
  }, []);

  // Switch projection
  const switchProjection = useCallback((projection: 'albers' | 'mercator' | 'lambert') => {
    if (!mapUtilsRef.current) return;

    mapUtilsRef.current.setProjection(projection);

    // Rebuild collision detector with new projection
    if (collisionDetectorRef.current) {
      collisionDetectorRef.current = mapUtilsRef.current.createCollisionDetector();
    }
  }, []);

  // Zoom to county
  const zoomToCounty = useCallback((countyId: string, duration = 750) => {
    if (!mapUtilsRef.current) return null;

    try {
      return mapUtilsRef.current.zoomToCounty(countyId, duration);
    } catch (error) {
      console.error('Failed to zoom to county:', error);
      return null;
    }
  }, []);

  // Zoom to fit all
  const zoomToFitAll = useCallback((padding = 0.1) => {
    if (!mapUtilsRef.current) return null;

    try {
      return mapUtilsRef.current.zoomToFitAll(padding);
    } catch (error) {
      console.error('Failed to zoom to fit all:', error);
      return null;
    }
  }, []);

  // Get county at point
  const getCountyAtPoint = useCallback((point: [number, number]): CountyData | null => {
    if (!mapUtilsRef.current) return null;

    const result = mapUtilsRef.current.getCountyAtPoint(point, mapState.transform);
    if (!result) return null;

    // Convert to our CountyData format
    const county = mapState.counties.find(c => c.id === result.id);
    return county || null;
  }, [mapState.counties, mapState.transform]);

  // Screen to geo coordinates
  const screenToGeo = useCallback((screenPoint: [number, number]): [number, number] | null => {
    if (!mapUtilsRef.current) return null;
    return mapUtilsRef.current.screenToGeo(screenPoint, mapState.transform);
  }, [mapState.transform]);

  // Geo to screen coordinates
  const geoToScreen = useCallback((geoPoint: [number, number]): [number, number] | null => {
    if (!mapUtilsRef.current) return null;
    return mapUtilsRef.current.geoToScreen(geoPoint, mapState.transform);
  }, [mapState.transform]);

  // Get optimal detail level for zoom
  const getOptimalDetailLevel = useCallback((zoomLevel: number): 'ultra-low' | 'low' | 'medium' | 'high' => {
    if (!mapUtilsRef.current) {
      if (zoomLevel <= 5) return 'ultra-low';
      if (zoomLevel <= 7) return 'low';
      if (zoomLevel <= 9) return 'medium';
      return 'high';
    }
    return mapUtilsRef.current.getOptimalDetailLevel(zoomLevel);
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    if (cacheRef.current) {
      cacheRef.current.clearCache();
    }
  }, []);

  return {
    mapState,
    mapUtils: mapUtilsRef.current,
    collisionDetector: collisionDetectorRef.current,
    loadDetailLevel,
    switchProjection,
    zoomToCounty,
    zoomToFitAll,
    getCountyAtPoint,
    screenToGeo,
    geoToScreen,
    getOptimalDetailLevel,
    clearCache
  };
}

export default useCaliforniaMap;