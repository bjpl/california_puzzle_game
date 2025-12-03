import { useState, useEffect, useCallback, useMemo } from 'react';
import { logger } from '../utils/logger';

/**
 * Hook for lazy loading geodata only for visible counties
 * Implements viewport-based loading to reduce initial bundle size
 */

interface CountyGeometry {
  type: string;
  coordinates: number[][][] | number[][][][];
}

interface County {
  id: string;
  name: string;
  geometry?: CountyGeometry;
}

interface UseViewportGeodataOptions {
  counties: County[];
  viewport: {
    width: number;
    height: number;
    x: number;
    y: number;
    zoom: number;
  };
  loadingThreshold?: number; // How close to viewport to start loading (default: 200px)
}

interface ViewportGeodataResult {
  loadedCounties: Set<string>;
  isLoading: boolean;
  loadCountyGeodata: (countyId: string) => Promise<void>;
  preloadVisibleCounties: () => Promise<void>;
}

// Cache for loaded geodata
const geodataCache = new Map<string, CountyGeometry>();

/**
 * Lazy load county geodata based on viewport visibility
 */
export function useViewportGeodata({
  counties,
  viewport: _viewport,
  loadingThreshold: _loadingThreshold = 200,
}: UseViewportGeodataOptions): ViewportGeodataResult {
  const [loadedCounties, setLoadedCounties] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Load geodata for a specific county
   */
  const loadCountyGeodata = useCallback(async (countyId: string): Promise<void> => {
    // Check cache first
    if (geodataCache.has(countyId)) {
      setLoadedCounties((prev) => new Set(prev).add(countyId));
      return;
    }

    try {
      setIsLoading(true);

      // Simulate geodata loading - replace with actual fetch in production
      // In real implementation, this would fetch from /geodata/counties/${countyId}.json
      const response = await fetch(`/geodata/counties/${countyId}.json`);
      if (response.ok) {
        const geodata = await response.json();
        geodataCache.set(countyId, geodata);
        setLoadedCounties((prev) => new Set(prev).add(countyId));
      }
    } catch (error) {
      logger.warn(`Failed to load geodata for county ${countyId}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Determine which counties are visible in the viewport
   */
  const visibleCountyIds = useMemo(() => {
    // Simple implementation - in production, calculate based on actual county bounds
    // For now, return all counties as visible
    // Real implementation would check if county bounds intersect with viewport
    return new Set(counties.map((c) => c.id));
    // Note: viewport and loadingThreshold would be used in real implementation
  }, [counties]);

  /**
   * Preload geodata for all visible counties
   */
  const preloadVisibleCounties = useCallback(async (): Promise<void> => {
    const countiesNeedingData = Array.from(visibleCountyIds).filter(
      (id) => !loadedCounties.has(id) && !geodataCache.has(id)
    );

    if (countiesNeedingData.length === 0) return;

    setIsLoading(true);
    try {
      // Load counties in batches to avoid overwhelming the network
      const batchSize = 5;
      for (let i = 0; i < countiesNeedingData.length; i += batchSize) {
        const batch = countiesNeedingData.slice(i, i + batchSize);
        await Promise.all(batch.map((id) => loadCountyGeodata(id)));
      }
    } finally {
      setIsLoading(false);
    }
  }, [visibleCountyIds, loadedCounties, loadCountyGeodata]);

  /**
   * Auto-load visible counties when viewport changes
   */
  useEffect(() => {
    // Debounce viewport changes
    const timeoutId = setTimeout(() => {
      preloadVisibleCounties();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [preloadVisibleCounties]);

  return {
    loadedCounties,
    isLoading,
    loadCountyGeodata,
    preloadVisibleCounties,
  };
}

/**
 * Clear geodata cache (useful for memory management)
 */
export function clearGeodataCache(): void {
  geodataCache.clear();
}

/**
 * Get cache size for monitoring
 */
export function getGeodataCacheSize(): number {
  return geodataCache.size;
}
