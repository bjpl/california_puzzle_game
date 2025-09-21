/**
 * GeoData Caching Utilities for California Map
 * Handles loading, caching, and optimization of geographical data
 */

export interface CachedGeoData {
  geoData: {
    type: 'FeatureCollection';
    features: any[];
    metadata?: {
      optimizationLevel: string;
      tolerance: number;
      maxPoints: number;
      originalFeatureCount: number;
      optimizedFeatureCount: number;
      processingTime: number;
      originalSize: number;
      optimizedSize: number;
      compressionRatio: number;
    };
  };
  lookup: {
    counties: Array<{
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
    }>;
    totalCounties: number;
    generatedAt: string;
  };
}

export interface CacheEntry {
  data: CachedGeoData;
  timestamp: number;
  size: number;
}

export interface CacheOptions {
  maxCacheSize: number; // bytes
  ttl: number; // milliseconds
  preload: ('ultra-low' | 'low' | 'medium' | 'high')[];
  adaptiveLoading: boolean;
}

export class GeoDataCache {
  private cache = new Map<string, CacheEntry>();
  private loadingPromises = new Map<string, Promise<CachedGeoData>>();
  private options: CacheOptions;

  constructor(options: Partial<CacheOptions> = {}) {
    this.options = {
      maxCacheSize: 50 * 1024 * 1024, // 50MB
      ttl: 1000 * 60 * 30, // 30 minutes
      preload: ['ultra-low', 'low'],
      adaptiveLoading: true,
      ...options
    };
  }

  async loadOptimizedData(detailLevel: 'ultra-low' | 'low' | 'medium' | 'high'): Promise<CachedGeoData> {
    const cacheKey = `counties-${detailLevel}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey)!;

      // Check if expired
      if (Date.now() - entry.timestamp < this.options.ttl) {
        return entry.data;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    // Check if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // Start loading
    const loadPromise = this.fetchGeoData(detailLevel);
    this.loadingPromises.set(cacheKey, loadPromise);

    try {
      const data = await loadPromise;
      this.cacheData(cacheKey, data);
      this.loadingPromises.delete(cacheKey);
      return data;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }

  private async fetchGeoData(detailLevel: string): Promise<CachedGeoData> {
    const geoDataPath = `/data/geo/ca-counties-${detailLevel}.geojson`;
    const lookupPath = '/data/geo/county-lookup.json';

    try {
      const [geoResponse, lookupResponse] = await Promise.all([
        fetch(geoDataPath),
        fetch(lookupPath)
      ]);

      if (!geoResponse.ok) {
        throw new Error(`Failed to load geo data: ${geoResponse.status} ${geoResponse.statusText}`);
      }

      if (!lookupResponse.ok) {
        throw new Error(`Failed to load lookup data: ${lookupResponse.status} ${lookupResponse.statusText}`);
      }

      const [geoData, lookup] = await Promise.all([
        geoResponse.json(),
        lookupResponse.json()
      ]);

      return { geoData, lookup };

    } catch (error) {
      console.error(`Failed to fetch geo data for ${detailLevel}:`, error);
      throw error;
    }
  }

  private cacheData(key: string, data: CachedGeoData): void {
    // Check cache size limits
    const dataSize = this.estimateDataSize(data);

    if (this.getCurrentCacheSize() + dataSize > this.options.maxCacheSize) {
      this.evictOldEntries(dataSize);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      size: dataSize
    });
  }

  private getCurrentCacheSize(): number {
    let total = 0;
    for (const entry of this.cache.values()) {
      total += entry.size;
    }
    return total;
  }

  private evictOldEntries(requiredSpace: number): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp); // Sort by timestamp (oldest first)

    let freedSpace = 0;
    for (const [key, entry] of entries) {
      this.cache.delete(key);
      freedSpace += entry.size;

      // Stop when we've freed enough space
      if (freedSpace >= requiredSpace ||
          this.getCurrentCacheSize() <= this.options.maxCacheSize * 0.7) {
        break;
      }
    }
  }

  private estimateDataSize(data: CachedGeoData): number {
    // Rough estimate: JSON string length * 2 (for UTF-16) + overhead
    return JSON.stringify(data).length * 2 + 1024;
  }

  // Preload commonly used data
  async preloadEssentials(): Promise<void> {
    console.log('Preloading essential geo data...');

    const preloadPromises = this.options.preload.map(async (level) => {
      try {
        await this.loadOptimizedData(level);
        console.log(`✓ Preloaded ${level} detail level`);
      } catch (error) {
        console.warn(`Failed to preload ${level}:`, error);
      }
    });

    await Promise.all(preloadPromises);
    console.log('Preloading completed');
  }

  // Get cache statistics
  getCacheStats() {
    const entries = Array.from(this.cache.values());
    const totalSize = this.getCurrentCacheSize();

    return {
      itemCount: this.cache.size,
      totalSize,
      totalSizeMB: totalSize / (1024 * 1024),
      utilization: totalSize / this.options.maxCacheSize,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : null,
      avgItemSize: entries.length > 0 ? totalSize / entries.length : 0
    };
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
    console.log('Cache cleared');
  }

  // Check if data is cached
  isCached(detailLevel: 'ultra-low' | 'low' | 'medium' | 'high'): boolean {
    const cacheKey = `counties-${detailLevel}`;
    const entry = this.cache.get(cacheKey);

    if (!entry) return false;

    // Check if expired
    return Date.now() - entry.timestamp < this.options.ttl;
  }

  // Get available detail levels in cache
  getAvailableLevels(): ('ultra-low' | 'low' | 'medium' | 'high')[] {
    const levels: ('ultra-low' | 'low' | 'medium' | 'high')[] = [];

    for (const key of this.cache.keys()) {
      const level = key.replace('counties-', '') as 'ultra-low' | 'low' | 'medium' | 'high';
      if (this.isCached(level)) {
        levels.push(level);
      }
    }

    return levels;
  }
}

export default GeoDataCache;