/**
 * Progressive Geodata Loading Utility
 *
 * Implements intelligent geodata loading based on:
 * - Device capabilities (memory, network speed)
 * - Zoom level (load higher resolution as user zooms in)
 * - Network conditions (downgrade on slow connections)
 *
 * @see docs/MOBILE_PRD.md - F-4: Progressive Geodata Loading
 */

/**
 * Geodata detail levels
 */
export enum GeodetaLevel {
  /** Ultra-low resolution - 21KB - Initial load, overview */
  ULTRA_LOW = 'ultra-low',

  /** Low resolution - 98KB - Default gameplay */
  LOW = 'low',

  /** Medium resolution - 194KB - Detailed view */
  MEDIUM = 'medium',

  /** High resolution - 966KB - Study mode, close inspection */
  HIGH = 'high',
}

/**
 * Get geodata file path with correct base URL
 */
function getGeodataPath(level: GeodetaLevel): string {
  const basePath = import.meta.env.BASE_URL || '/';
  const paths: Record<GeodetaLevel, string> = {
    [GeodetaLevel.ULTRA_LOW]: `${basePath}data/geo/california-ultra-low.json`,
    [GeodetaLevel.LOW]: `${basePath}data/geo/california-low.json`,
    [GeodetaLevel.MEDIUM]: `${basePath}data/geo/california-medium.json`,
    [GeodetaLevel.HIGH]: `${basePath}data/geo/california-high.json`,
  };
  return paths[level];
}

/**
 * Geodata file sizes (bytes) for loading decisions
 */
const GEODATA_SIZES: Record<GeodetaLevel, number> = {
  [GeodetaLevel.ULTRA_LOW]: 21 * 1024, // 21KB
  [GeodetaLevel.LOW]: 98 * 1024, // 98KB
  [GeodetaLevel.MEDIUM]: 194 * 1024, // 194KB
  [GeodetaLevel.HIGH]: 966 * 1024, // 966KB
};

/**
 * Network connection type from Network Information API
 */
export enum ConnectionType {
  SLOW_2G = 'slow-2g',
  TWO_G = '2g',
  THREE_G = '3g',
  FOUR_G = '4g',
  UNKNOWN = 'unknown',
}

/**
 * Network Information API interface
 */
interface NetworkInformation {
  effectiveType?: string;
  downlink?: number;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

/**
 * Get connection type from Network Information API
 */
function getConnectionType(): ConnectionType {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return ConnectionType.UNKNOWN;
  }

  const nav = navigator as NavigatorWithConnection;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

  if (!connection || !connection.effectiveType) {
    return ConnectionType.UNKNOWN;
  }

  return connection.effectiveType as ConnectionType;
}

/**
 * Get connection download speed estimate (Mbps)
 */
function getConnectionSpeed(): number | null {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return null;
  }

  const nav = navigator as NavigatorWithConnection;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

  if (!connection || !connection.downlink) {
    return null;
  }

  return connection.downlink; // Mbps
}

/**
 * Determine optimal geodata level based on device and network conditions
 *
 * Decision matrix:
 * - 4G+ (>2Mbps): HIGH allowed
 * - 3G (750kbps-2Mbps): MEDIUM max
 * - 2G (<750kbps): LOW max
 * - Offline: Use cached or ULTRA_LOW
 */
export function getOptimalGeodetaLevel(
  zoomLevel: number = 1,
  forceLevel?: GeodetaLevel
): GeodetaLevel {
  // If user explicitly chose a level, use it
  if (forceLevel) {
    return forceLevel;
  }

  const connectionType = getConnectionType();
  const connectionSpeed = getConnectionSpeed();

  // Determine max level based on connection
  let maxLevel = GeodetaLevel.MEDIUM;

  if (connectionType === ConnectionType.FOUR_G || (connectionSpeed && connectionSpeed >= 2)) {
    maxLevel = GeodetaLevel.HIGH;
  } else if (
    connectionType === ConnectionType.THREE_G ||
    (connectionSpeed && connectionSpeed >= 0.75)
  ) {
    maxLevel = GeodetaLevel.MEDIUM;
  } else if (connectionType === ConnectionType.TWO_G || connectionType === ConnectionType.SLOW_2G) {
    maxLevel = GeodetaLevel.LOW;
  }

  // Determine optimal level based on zoom
  let optimalLevel: GeodetaLevel;

  if (zoomLevel >= 3) {
    optimalLevel = GeodetaLevel.HIGH;
  } else if (zoomLevel >= 2) {
    optimalLevel = GeodetaLevel.MEDIUM;
  } else if (zoomLevel >= 1) {
    optimalLevel = GeodetaLevel.LOW;
  } else {
    optimalLevel = GeodetaLevel.ULTRA_LOW;
  }

  // Return the minimum of optimal and max (constrained by network)
  const levelPriority = {
    [GeodetaLevel.ULTRA_LOW]: 0,
    [GeodetaLevel.LOW]: 1,
    [GeodetaLevel.MEDIUM]: 2,
    [GeodetaLevel.HIGH]: 3,
  };

  return levelPriority[optimalLevel] <= levelPriority[maxLevel] ? optimalLevel : maxLevel;
}

/**
 * Geodata cache for loaded levels
 */
const geodataCache = new Map<GeodetaLevel, unknown>();

/**
 * Load geodata for a specific detail level
 *
 * @param level - Detail level to load
 * @param onProgress - Optional progress callback
 * @returns Promise resolving to geodata
 */
export async function loadGeodata(
  level: GeodetaLevel,
  onProgress?: (loaded: number, total: number) => void
): Promise<unknown> {
  // Check cache first
  if (geodataCache.has(level)) {
    return geodataCache.get(level);
  }

  const path = getGeodataPath(level);
  const totalSize = GEODATA_SIZES[level];

  try {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Failed to load geodata: ${response.statusText}`);
    }

    // Track loading progress if reader is available
    if (response.body && onProgress) {
      const reader = response.body.getReader();
      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedLength += value.length;
        onProgress(receivedLength, totalSize);
      }

      // Concatenate chunks
      const chunksAll = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
      }

      // Decode and parse
      const text = new TextDecoder('utf-8').decode(chunksAll);
      const data = JSON.parse(text);

      geodataCache.set(level, data);
      return data;
    } else {
      // Simple load without progress tracking
      const data = await response.json();
      geodataCache.set(level, data);
      return data;
    }
  } catch (error) {
    console.error(`Failed to load geodata level ${level}:`, error);
    throw error;
  }
}

/**
 * Preload geodata levels for smoother transitions
 *
 * @param levels - Array of levels to preload
 */
export async function preloadGeodata(levels: GeodetaLevel[]): Promise<void> {
  const promises = levels.map((level) =>
    loadGeodata(level).catch((error) => {
      console.warn(`Failed to preload ${level}:`, error);
      return null;
    })
  );

  await Promise.allSettled(promises);
}

/**
 * Clear geodata cache to free memory
 *
 * @param keepLevels - Levels to keep in cache (optional)
 */
export function clearGeodataCache(keepLevels?: GeodetaLevel[]): void {
  if (!keepLevels) {
    geodataCache.clear();
    return;
  }

  const levelsToRemove = Object.values(GeodetaLevel).filter((level) => !keepLevels.includes(level));

  levelsToRemove.forEach((level) => {
    geodataCache.delete(level);
  });
}

/**
 * Get current cache status
 */
export function getGeodataCacheStatus(): {
  cachedLevels: GeodetaLevel[];
  totalCachedSize: number;
  cacheCount: number;
} {
  const cachedLevels = Array.from(geodataCache.keys());
  const totalCachedSize = cachedLevels.reduce((sum, level) => sum + GEODATA_SIZES[level], 0);

  return {
    cachedLevels,
    totalCachedSize,
    cacheCount: geodataCache.size,
  };
}

/**
 * Check if device has enough memory for high-res geodata
 *
 * Uses performance.memory API (Chrome) or estimates based on device type
 */
export function canLoadHighResolution(): boolean {
  // Check if memory API is available (Chrome only)
  if ('memory' in performance) {
    const memory = (performance as Record<string, unknown>).memory as Record<string, number>;
    const usedMemory = memory.usedJSHeapSize;
    const memoryLimit = memory.jsHeapSizeLimit;

    // Only load high-res if we have at least 50MB headroom
    return memoryLimit - usedMemory > 50 * 1024 * 1024;
  }

  // Fallback: Assume modern devices can handle high-res
  // This is conservative - most devices since 2018 have 2GB+ RAM
  return navigator.hardwareConcurrency >= 4; // At least 4 cores suggests decent device
}

/**
 * Adaptive geodata strategy
 *
 * Automatically selects and loads the best geodata level
 * based on zoom, network, and device capabilities.
 */
export class AdaptiveGeodataLoader {
  private currentLevel: GeodetaLevel | null = null;
  private loadingLevel: GeodetaLevel | null = null;

  /**
   * Load geodata adaptively based on conditions
   */
  async load(
    zoomLevel: number,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<unknown> {
    const optimalLevel = getOptimalGeodetaLevel(zoomLevel);

    // If already at this level, return cached data
    if (this.currentLevel === optimalLevel && geodataCache.has(optimalLevel)) {
      return geodataCache.get(optimalLevel);
    }

    // If already loading this level, wait for it
    if (this.loadingLevel === optimalLevel) {
      // Wait for loading to complete
      while (this.loadingLevel === optimalLevel) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return geodataCache.get(optimalLevel);
    }

    // Load new level
    this.loadingLevel = optimalLevel;

    try {
      const data = await loadGeodata(optimalLevel, onProgress);
      this.currentLevel = optimalLevel;
      return data;
    } finally {
      this.loadingLevel = null;
    }
  }

  /**
   * Preload next likely level based on current zoom
   */
  async preloadNext(currentZoom: number): Promise<void> {
    const nextLevel = getOptimalGeodetaLevel(currentZoom + 0.5);

    if (nextLevel !== this.currentLevel && !geodataCache.has(nextLevel)) {
      await loadGeodata(nextLevel).catch(() => {
        // Ignore preload failures
      });
    }
  }

  /**
   * Get current loaded level
   */
  getCurrentLevel(): GeodetaLevel | null {
    return this.currentLevel;
  }

  /**
   * Check if currently loading
   */
  isLoading(): boolean {
    return this.loadingLevel !== null;
  }

  /**
   * Free memory by clearing unused levels
   */
  optimize(): void {
    if (this.currentLevel) {
      clearGeodataCache([this.currentLevel]);
    }
  }
}
