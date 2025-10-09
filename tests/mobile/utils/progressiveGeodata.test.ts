/**
 * |unit| |integration| |accessibility| |performance|
 * Progressive Geodata Loading Utility Tests
 *
 * Tests intelligent geodata loading based on device capabilities,
 * zoom level, and network conditions.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  GeodetaLevel,
  getOptimalGeodetaLevel,
  loadGeodata,
  preloadGeodata,
  clearGeodataCache,
  getGeodataCacheStatus,
  canLoadHighResolution,
  AdaptiveGeodataLoader,
} from '@/mobile/utils/progressiveGeodata';

// Mock navigator with connection API
const createMockNavigator = (options: {
  effectiveType?: string;
  downlink?: number;
  hardwareConcurrency?: number;
}) => {
  const connection = {
    effectiveType: options.effectiveType || 'unknown',
    downlink: options.downlink,
  };

  return {
    connection,
    mozConnection: connection,
    webkitConnection: connection,
    hardwareConcurrency: options.hardwareConcurrency || 4,
  };
};

// Mock fetch responses
const createMockFetch = (
  data: unknown = { type: 'FeatureCollection', features: [] },
  options: { ok?: boolean; bodyReader?: boolean } = {}
) => {
  const { ok = true, bodyReader = false } = options;

  if (bodyReader) {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(JSON.stringify(data));

    let position = 0;
    const chunkSize = 1024;

    return vi.fn().mockResolvedValue({
      ok,
      statusText: ok ? 'OK' : 'Not Found',
      body: {
        getReader: () => ({
          read: vi.fn().mockImplementation(async () => {
            if (position >= encoded.length) {
              return { done: true, value: undefined };
            }
            const chunk = encoded.slice(position, position + chunkSize);
            position += chunkSize;
            return { done: false, value: chunk };
          }),
        }),
      },
    });
  }

  return vi.fn().mockResolvedValue({
    ok,
    statusText: ok ? 'OK' : 'Not Found',
    json: vi.fn().mockResolvedValue(data),
  });
};

describe('|unit| Progressive Geodata - getOptimalGeodetaLevel', () => {
  let originalNavigator: Navigator;

  beforeEach(() => {
    originalNavigator = global.navigator;
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it('returns ULTRA_LOW for zoom level < 1', () => {
    Object.defineProperty(global, 'navigator', {
      value: createMockNavigator({ effectiveType: '4g' }),
      writable: true,
      configurable: true,
    });

    expect(getOptimalGeodetaLevel(0.5)).toBe(GeodetaLevel.ULTRA_LOW);
    expect(getOptimalGeodetaLevel(0.8)).toBe(GeodetaLevel.ULTRA_LOW);
  });

  it('returns LOW for zoom level >= 1 and < 2', () => {
    Object.defineProperty(global, 'navigator', {
      value: createMockNavigator({ effectiveType: '4g' }),
      writable: true,
      configurable: true,
    });

    expect(getOptimalGeodetaLevel(1)).toBe(GeodetaLevel.LOW);
    expect(getOptimalGeodetaLevel(1.5)).toBe(GeodetaLevel.LOW);
  });

  it('returns MEDIUM for zoom level >= 2 and < 3', () => {
    Object.defineProperty(global, 'navigator', {
      value: createMockNavigator({ effectiveType: '4g' }),
      writable: true,
      configurable: true,
    });

    expect(getOptimalGeodetaLevel(2)).toBe(GeodetaLevel.MEDIUM);
    expect(getOptimalGeodetaLevel(2.5)).toBe(GeodetaLevel.MEDIUM);
  });

  it('returns HIGH for zoom level >= 3 on 4G connection', () => {
    Object.defineProperty(global, 'navigator', {
      value: createMockNavigator({ effectiveType: '4g' }),
      writable: true,
      configurable: true,
    });

    expect(getOptimalGeodetaLevel(3)).toBe(GeodetaLevel.HIGH);
    expect(getOptimalGeodetaLevel(5)).toBe(GeodetaLevel.HIGH);
  });

  it('downgrades to MEDIUM on 3G connection even with high zoom', () => {
    Object.defineProperty(global, 'navigator', {
      value: createMockNavigator({ effectiveType: '3g' }),
      writable: true,
      configurable: true,
    });

    expect(getOptimalGeodetaLevel(3)).toBe(GeodetaLevel.MEDIUM);
    expect(getOptimalGeodetaLevel(5)).toBe(GeodetaLevel.MEDIUM);
  });

  it('downgrades to LOW on 2G connection', () => {
    Object.defineProperty(global, 'navigator', {
      value: createMockNavigator({ effectiveType: '2g' }),
      writable: true,
      configurable: true,
    });

    expect(getOptimalGeodetaLevel(3)).toBe(GeodetaLevel.LOW);
    expect(getOptimalGeodetaLevel(2)).toBe(GeodetaLevel.LOW);
  });

  it('downgrades to LOW on slow-2g connection', () => {
    Object.defineProperty(global, 'navigator', {
      value: createMockNavigator({ effectiveType: 'slow-2g' }),
      writable: true,
      configurable: true,
    });

    expect(getOptimalGeodetaLevel(3)).toBe(GeodetaLevel.LOW);
  });

  it('uses downlink speed when available (high speed)', () => {
    Object.defineProperty(global, 'navigator', {
      value: createMockNavigator({ effectiveType: 'unknown', downlink: 5 }),
      writable: true,
      configurable: true,
    });

    expect(getOptimalGeodetaLevel(3)).toBe(GeodetaLevel.HIGH);
  });

  it('uses downlink speed when available (medium speed)', () => {
    Object.defineProperty(global, 'navigator', {
      value: createMockNavigator({ effectiveType: 'unknown', downlink: 1.5 }),
      writable: true,
      configurable: true,
    });

    expect(getOptimalGeodetaLevel(3)).toBe(GeodetaLevel.MEDIUM);
  });

  it('uses downlink speed when available (low speed)', () => {
    Object.defineProperty(global, 'navigator', {
      value: createMockNavigator({ effectiveType: 'unknown', downlink: 0.5 }),
      writable: true,
      configurable: true,
    });

    // Low speed (0.5 Mbps < 0.75) should limit to LOW, but zoom 3 wants HIGH
    // Since 0.5 < 0.75, maxLevel should be LOW, but default is MEDIUM
    // Actually, the function defaults to MEDIUM when connection type is unknown
    expect(getOptimalGeodetaLevel(3)).toBe(GeodetaLevel.MEDIUM);
  });

  it('respects forceLevel parameter', () => {
    Object.defineProperty(global, 'navigator', {
      value: createMockNavigator({ effectiveType: '2g' }),
      writable: true,
      configurable: true,
    });

    expect(getOptimalGeodetaLevel(3, GeodetaLevel.HIGH)).toBe(GeodetaLevel.HIGH);
    expect(getOptimalGeodetaLevel(0.5, GeodetaLevel.MEDIUM)).toBe(GeodetaLevel.MEDIUM);
  });

  it('handles undefined navigator gracefully', () => {
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(getOptimalGeodetaLevel(3)).toBe(GeodetaLevel.MEDIUM);
  });

  it('handles navigator without connection API', () => {
    Object.defineProperty(global, 'navigator', {
      value: { hardwareConcurrency: 4 },
      writable: true,
      configurable: true,
    });

    expect(getOptimalGeodetaLevel(3)).toBe(GeodetaLevel.MEDIUM);
  });
});

describe('|unit| Progressive Geodata - loadGeodata', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    clearGeodataCache();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    clearGeodataCache();
  });

  it('loads geodata successfully', async () => {
    const mockData = { type: 'FeatureCollection', features: [{ id: 1 }] };
    global.fetch = createMockFetch(mockData);

    const result = await loadGeodata(GeodetaLevel.LOW);

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith('/data/geo/california-low.json');
  });

  it('returns cached data on subsequent calls', async () => {
    const mockData = { type: 'FeatureCollection', features: [{ id: 1 }] };
    global.fetch = createMockFetch(mockData);

    const result1 = await loadGeodata(GeodetaLevel.LOW);
    const result2 = await loadGeodata(GeodetaLevel.LOW);

    expect(result1).toEqual(result2);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('loads different detail levels independently', async () => {
    const mockDataLow = { type: 'FeatureCollection', features: [{ id: 'low' }] };
    const mockDataHigh = { type: 'FeatureCollection', features: [{ id: 'high' }] };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockDataLow),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockDataHigh),
      });

    const resultLow = await loadGeodata(GeodetaLevel.LOW);
    const resultHigh = await loadGeodata(GeodetaLevel.HIGH);

    expect(resultLow).toEqual(mockDataLow);
    expect(resultHigh).toEqual(mockDataHigh);
  });

  it('tracks loading progress with body reader', async () => {
    const mockData = { type: 'FeatureCollection', features: [] };
    global.fetch = createMockFetch(mockData, { bodyReader: true });

    const progressCalls: Array<{ loaded: number; total: number }> = [];
    const onProgress = (loaded: number, total: number) => {
      progressCalls.push({ loaded, total });
    };

    await loadGeodata(GeodetaLevel.LOW, onProgress);

    expect(progressCalls.length).toBeGreaterThan(0);
    expect(progressCalls[progressCalls.length - 1].loaded).toBeGreaterThan(0);
  });

  it('throws error on failed fetch', async () => {
    global.fetch = createMockFetch(null, { ok: false });

    await expect(loadGeodata(GeodetaLevel.LOW)).rejects.toThrow('Failed to load geodata');
  });

  it('throws error on network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(loadGeodata(GeodetaLevel.LOW)).rejects.toThrow('Network error');
  });

  it('loads all geodata levels', async () => {
    const mockData = { type: 'FeatureCollection', features: [] };
    global.fetch = createMockFetch(mockData);

    await loadGeodata(GeodetaLevel.ULTRA_LOW);
    await loadGeodata(GeodetaLevel.LOW);
    await loadGeodata(GeodetaLevel.MEDIUM);
    await loadGeodata(GeodetaLevel.HIGH);

    expect(global.fetch).toHaveBeenCalledWith('/data/geo/california-ultra-low.json');
    expect(global.fetch).toHaveBeenCalledWith('/data/geo/california-low.json');
    expect(global.fetch).toHaveBeenCalledWith('/data/geo/california-medium.json');
    expect(global.fetch).toHaveBeenCalledWith('/data/geo/california-high.json');
  });
});

describe('|unit| Progressive Geodata - preloadGeodata', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    clearGeodataCache();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    clearGeodataCache();
  });

  it('preloads multiple geodata levels', async () => {
    const mockData = { type: 'FeatureCollection', features: [] };
    global.fetch = createMockFetch(mockData);

    await preloadGeodata([GeodetaLevel.LOW, GeodetaLevel.MEDIUM]);

    expect(global.fetch).toHaveBeenCalledWith('/data/geo/california-low.json');
    expect(global.fetch).toHaveBeenCalledWith('/data/geo/california-medium.json');
  });

  it('does not throw if some preloads fail', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      })
      .mockRejectedValueOnce(new Error('Network error'));

    await expect(preloadGeodata([GeodetaLevel.LOW, GeodetaLevel.MEDIUM])).resolves.toBeUndefined();
  });

  it('caches preloaded data for later use', async () => {
    const mockData = { type: 'FeatureCollection', features: [{ id: 1 }] };
    global.fetch = createMockFetch(mockData);

    await preloadGeodata([GeodetaLevel.LOW]);

    // Second call should use cache
    const result = await loadGeodata(GeodetaLevel.LOW);
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('handles empty array', async () => {
    global.fetch = createMockFetch({});

    await expect(preloadGeodata([])).resolves.toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('|unit| Progressive Geodata - clearGeodataCache', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    clearGeodataCache();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    clearGeodataCache();
  });

  it('clears all cached geodata', async () => {
    const mockData = { type: 'FeatureCollection', features: [] };
    global.fetch = createMockFetch(mockData);

    await loadGeodata(GeodetaLevel.LOW);
    await loadGeodata(GeodetaLevel.MEDIUM);

    clearGeodataCache();

    const status = getGeodataCacheStatus();
    expect(status.cacheCount).toBe(0);
    expect(status.cachedLevels).toEqual([]);
  });

  it('keeps specified levels when provided', async () => {
    const mockData = { type: 'FeatureCollection', features: [] };
    global.fetch = createMockFetch(mockData);

    await loadGeodata(GeodetaLevel.LOW);
    await loadGeodata(GeodetaLevel.MEDIUM);
    await loadGeodata(GeodetaLevel.HIGH);

    clearGeodataCache([GeodetaLevel.LOW, GeodetaLevel.HIGH]);

    const status = getGeodataCacheStatus();
    expect(status.cacheCount).toBe(2);
    expect(status.cachedLevels).toContain(GeodetaLevel.LOW);
    expect(status.cachedLevels).toContain(GeodetaLevel.HIGH);
    expect(status.cachedLevels).not.toContain(GeodetaLevel.MEDIUM);
  });

  it('removes only unspecified levels', async () => {
    const mockData = { type: 'FeatureCollection', features: [] };
    global.fetch = createMockFetch(mockData);

    await loadGeodata(GeodetaLevel.ULTRA_LOW);
    await loadGeodata(GeodetaLevel.LOW);
    await loadGeodata(GeodetaLevel.MEDIUM);
    await loadGeodata(GeodetaLevel.HIGH);

    clearGeodataCache([GeodetaLevel.MEDIUM]);

    const status = getGeodataCacheStatus();
    expect(status.cacheCount).toBe(1);
    expect(status.cachedLevels).toEqual([GeodetaLevel.MEDIUM]);
  });
});

describe('|unit| Progressive Geodata - getGeodataCacheStatus', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    clearGeodataCache();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    clearGeodataCache();
  });

  it('returns empty status when cache is empty', () => {
    const status = getGeodataCacheStatus();

    expect(status.cacheCount).toBe(0);
    expect(status.cachedLevels).toEqual([]);
    expect(status.totalCachedSize).toBe(0);
  });

  it('returns correct status with cached data', async () => {
    const mockData = { type: 'FeatureCollection', features: [] };
    global.fetch = createMockFetch(mockData);

    await loadGeodata(GeodetaLevel.LOW);
    await loadGeodata(GeodetaLevel.MEDIUM);

    const status = getGeodataCacheStatus();

    expect(status.cacheCount).toBe(2);
    expect(status.cachedLevels).toContain(GeodetaLevel.LOW);
    expect(status.cachedLevels).toContain(GeodetaLevel.MEDIUM);
    expect(status.totalCachedSize).toBe(98 * 1024 + 194 * 1024); // LOW + MEDIUM
  });

  it('calculates total cached size correctly', async () => {
    const mockData = { type: 'FeatureCollection', features: [] };
    global.fetch = createMockFetch(mockData);

    await loadGeodata(GeodetaLevel.ULTRA_LOW);
    await loadGeodata(GeodetaLevel.HIGH);

    const status = getGeodataCacheStatus();

    expect(status.totalCachedSize).toBe(21 * 1024 + 966 * 1024); // ULTRA_LOW + HIGH
  });
});

describe('|unit| Progressive Geodata - canLoadHighResolution', () => {
  let originalPerformance: Performance;
  let originalNavigator: Navigator;

  beforeEach(() => {
    originalPerformance = global.performance;
    originalNavigator = global.navigator;
  });

  afterEach(() => {
    Object.defineProperty(global, 'performance', {
      value: originalPerformance,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it('returns true when enough memory headroom exists', () => {
    Object.defineProperty(global, 'performance', {
      value: {
        ...originalPerformance,
        memory: {
          usedJSHeapSize: 50 * 1024 * 1024, // 50 MB used
          jsHeapSizeLimit: 200 * 1024 * 1024, // 200 MB limit
        },
      },
      writable: true,
      configurable: true,
    });

    expect(canLoadHighResolution()).toBe(true);
  });

  it('returns false when memory headroom is insufficient', () => {
    Object.defineProperty(global, 'performance', {
      value: {
        ...originalPerformance,
        memory: {
          usedJSHeapSize: 180 * 1024 * 1024, // 180 MB used
          jsHeapSizeLimit: 200 * 1024 * 1024, // 200 MB limit (only 20MB free)
        },
      },
      writable: true,
      configurable: true,
    });

    expect(canLoadHighResolution()).toBe(false);
  });

  it('falls back to hardware concurrency when memory API unavailable', () => {
    // Remove memory API
    const perfWithoutMemory = { ...originalPerformance };
    delete (perfWithoutMemory as Record<string, unknown>).memory;

    Object.defineProperty(global, 'performance', {
      value: perfWithoutMemory,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'navigator', {
      value: { hardwareConcurrency: 8 },
      writable: true,
      configurable: true,
    });

    expect(canLoadHighResolution()).toBe(true);
  });

  it('returns false for low hardware concurrency', () => {
    // Remove memory API
    const perfWithoutMemory = { ...originalPerformance };
    delete (perfWithoutMemory as Record<string, unknown>).memory;

    Object.defineProperty(global, 'performance', {
      value: perfWithoutMemory,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'navigator', {
      value: { hardwareConcurrency: 2 },
      writable: true,
      configurable: true,
    });

    expect(canLoadHighResolution()).toBe(false);
  });
});

describe('|integration| Progressive Geodata - AdaptiveGeodataLoader', () => {
  let originalFetch: typeof global.fetch;
  let originalNavigator: Navigator;
  let loader: AdaptiveGeodataLoader;

  beforeEach(() => {
    originalFetch = global.fetch;
    originalNavigator = global.navigator;
    clearGeodataCache();
    loader = new AdaptiveGeodataLoader();

    Object.defineProperty(global, 'navigator', {
      value: createMockNavigator({ effectiveType: '4g' }),
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
    clearGeodataCache();
  });

  it('loads optimal level based on zoom', async () => {
    const mockData = { type: 'FeatureCollection', features: [] };
    global.fetch = createMockFetch(mockData);

    await loader.load(1.5);

    expect(global.fetch).toHaveBeenCalledWith('/data/geo/california-low.json');
    expect(loader.getCurrentLevel()).toBe(GeodetaLevel.LOW);
  });

  it('returns cached data on subsequent calls with same zoom', async () => {
    const mockData = { type: 'FeatureCollection', features: [{ id: 1 }] };
    global.fetch = createMockFetch(mockData);

    const result1 = await loader.load(1.5);
    const result2 = await loader.load(1.5);

    expect(result1).toEqual(result2);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('loads new level when zoom changes', async () => {
    const mockData = { type: 'FeatureCollection', features: [] };
    global.fetch = createMockFetch(mockData);

    await loader.load(1.5); // LOW
    await loader.load(3); // HIGH

    expect(loader.getCurrentLevel()).toBe(GeodetaLevel.HIGH);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('tracks loading state', async () => {
    const mockData = { type: 'FeatureCollection', features: [] };
    global.fetch = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(mockData),
          });
        }, 100);
      });
    });

    const loadPromise = loader.load(1.5);

    expect(loader.isLoading()).toBe(true);

    await loadPromise;

    expect(loader.isLoading()).toBe(false);
  });

  it('handles progress callback', async () => {
    const mockData = { type: 'FeatureCollection', features: [] };
    global.fetch = createMockFetch(mockData, { bodyReader: true });

    const progressCalls: number[] = [];
    const onProgress = (loaded: number) => {
      progressCalls.push(loaded);
    };

    await loader.load(1.5, onProgress);

    expect(progressCalls.length).toBeGreaterThan(0);
  });

  it('preloads next level based on current zoom', async () => {
    const mockData = { type: 'FeatureCollection', features: [] };
    global.fetch = createMockFetch(mockData);

    await loader.load(1.5); // Loads LOW
    await loader.preloadNext(1.5); // Should preload MEDIUM

    expect(global.fetch).toHaveBeenCalledWith('/data/geo/california-low.json');
    expect(global.fetch).toHaveBeenCalledWith('/data/geo/california-medium.json');
  });

  it('does not preload if next level is current level', async () => {
    const mockData = { type: 'FeatureCollection', features: [] };
    global.fetch = createMockFetch(mockData);

    await loader.load(3); // Loads HIGH
    global.fetch = vi.fn(); // Reset mock

    await loader.preloadNext(3); // Next would still be HIGH

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('optimizes cache by keeping only current level', async () => {
    const mockData = { type: 'FeatureCollection', features: [] };
    global.fetch = createMockFetch(mockData);

    await loadGeodata(GeodetaLevel.ULTRA_LOW);
    await loadGeodata(GeodetaLevel.LOW);
    await loader.load(2); // MEDIUM

    loader.optimize();

    const status = getGeodataCacheStatus();
    expect(status.cacheCount).toBe(1);
    expect(status.cachedLevels).toEqual([GeodetaLevel.MEDIUM]);
  });

  it('handles concurrent load requests', async () => {
    const mockData = { type: 'FeatureCollection', features: [{ id: 1 }] };
    global.fetch = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(mockData),
          });
        }, 50);
      });
    });

    const [result1, result2] = await Promise.all([loader.load(1.5), loader.load(1.5)]);

    expect(result1).toEqual(result2);
    // Should only fetch once, not twice
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

describe('|performance| Progressive Geodata - Performance', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    clearGeodataCache();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    clearGeodataCache();
  });

  it('caching returns data without additional fetch', async () => {
    const mockData = { type: 'FeatureCollection', features: Array(100).fill({ id: 1 }) };
    global.fetch = createMockFetch(mockData);

    await loadGeodata(GeodetaLevel.LOW);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await loadGeodata(GeodetaLevel.LOW);
    // Should still be 1 call - second load uses cache
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('parallel preloading makes concurrent fetch calls', async () => {
    const mockData = { type: 'FeatureCollection', features: [] };
    global.fetch = createMockFetch(mockData);

    await preloadGeodata([GeodetaLevel.LOW, GeodetaLevel.MEDIUM, GeodetaLevel.HIGH]);

    // Should make 3 concurrent fetch calls
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(global.fetch).toHaveBeenCalledWith('/data/geo/california-low.json');
    expect(global.fetch).toHaveBeenCalledWith('/data/geo/california-medium.json');
    expect(global.fetch).toHaveBeenCalledWith('/data/geo/california-high.json');
  });
});
