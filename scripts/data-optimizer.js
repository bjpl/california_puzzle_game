/**
 * California GeoData Optimization and Caching System
 * Advanced geometry simplification, adaptive loading, and performance optimization
 */

import { feature } from 'topojson-client';
import { mesh } from 'topojson-client';

export class GeoDataOptimizer {
  constructor(options = {}) {
    this.options = {
      simplificationLevels: {
        'ultra-low': { tolerance: 0.05, maxPoints: 50 },
        'low': { tolerance: 0.01, maxPoints: 100 },
        'medium': { tolerance: 0.005, maxPoints: 200 },
        'high': { tolerance: 0.001, maxPoints: 500 }
      },
      compressionOptions: {
        enableGzip: true,
        quantization: 1e4,
        topojsonPrecision: 3
      },
      cachingStrategy: {
        preload: ['ultra-low', 'low'],
        adaptiveLoading: true,
        maxCacheSize: 50 * 1024 * 1024, // 50MB
        ttl: 1000 * 60 * 30 // 30 minutes
      },
      ...options
    };

    this.cache = new Map();
    this.loadingPromises = new Map();
    this.performanceMetrics = {
      loadTimes: {},
      hitRates: {},
      memoryUsage: 0
    };
  }

  // Advanced Douglas-Peucker simplification with adaptive thresholds
  simplifyGeometry(coordinates, tolerance, maxPoints) {
    if (!coordinates || coordinates.length <= 2) return coordinates;

    // If already under maxPoints, apply tolerance-based simplification
    if (coordinates.length <= maxPoints) {
      return this.douglasPeucker(coordinates, tolerance);
    }

    // If over maxPoints, use point reduction first, then tolerance
    const pointReductionRatio = maxPoints / coordinates.length;
    const reducedCoords = this.reducePoints(coordinates, pointReductionRatio);

    return this.douglasPeucker(reducedCoords, tolerance);
  }

  douglasPeucker(points, tolerance) {
    if (points.length <= 2) return points;

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    let maxDistance = 0;
    let maxIndex = 0;

    // Find the point with maximum distance from the line
    for (let i = 1; i < points.length - 1; i++) {
      const distance = this.perpendicularDistance(points[i], firstPoint, lastPoint);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    // If max distance is less than tolerance, simplify to just endpoints
    if (maxDistance < tolerance) {
      return [firstPoint, lastPoint];
    }

    // Recursively simplify both segments
    const leftSegment = this.douglasPeucker(points.slice(0, maxIndex + 1), tolerance);
    const rightSegment = this.douglasPeucker(points.slice(maxIndex), tolerance);

    // Combine segments, avoiding duplicate middle point
    return [...leftSegment.slice(0, -1), ...rightSegment];
  }

  perpendicularDistance(point, lineStart, lineEnd) {
    const [px, py] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;

    const dx = x2 - x1;
    const dy = y2 - y1;

    if (dx === 0 && dy === 0) {
      // Line is actually a point
      return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    }

    const length = Math.sqrt(dx * dx + dy * dy);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));

    const projectionX = x1 + t * dx;
    const projectionY = y1 + t * dy;

    return Math.sqrt((px - projectionX) ** 2 + (py - projectionY) ** 2);
  }

  reducePoints(coordinates, ratio) {
    if (ratio >= 1) return coordinates;

    const targetCount = Math.max(3, Math.floor(coordinates.length * ratio));
    const step = coordinates.length / targetCount;
    const reduced = [];

    for (let i = 0; i < coordinates.length; i += step) {
      reduced.push(coordinates[Math.floor(i)]);
    }

    // Always include the last point to close polygons
    if (reduced[reduced.length - 1] !== coordinates[coordinates.length - 1]) {
      reduced.push(coordinates[coordinates.length - 1]);
    }

    return reduced;
  }

  // Process complete GeoJSON with optimizations
  async optimizeGeoJSON(geoJSON, level = 'medium') {
    const { tolerance, maxPoints } = this.options.simplificationLevels[level];
    const startTime = performance.now();

    const optimizedFeatures = await Promise.all(
      geoJSON.features.map(async (feature) => {
        return this.optimizeFeature(feature, tolerance, maxPoints);
      })
    );

    const optimizedGeoJSON = {
      type: 'FeatureCollection',
      features: optimizedFeatures,
      metadata: {
        optimizationLevel: level,
        tolerance,
        maxPoints,
        originalFeatureCount: geoJSON.features.length,
        optimizedFeatureCount: optimizedFeatures.length,
        processingTime: performance.now() - startTime,
        originalSize: JSON.stringify(geoJSON).length,
        optimizedSize: JSON.stringify({ type: 'FeatureCollection', features: optimizedFeatures }).length
      }
    };

    // Calculate compression ratio
    optimizedGeoJSON.metadata.compressionRatio =
      optimizedGeoJSON.metadata.originalSize / optimizedGeoJSON.metadata.optimizedSize;

    return optimizedGeoJSON;
  }

  optimizeFeature(feature, tolerance, maxPoints) {
    if (!feature.geometry) return feature;

    const optimizedGeometry = this.optimizeGeometryByType(
      feature.geometry,
      tolerance,
      maxPoints
    );

    return {
      ...feature,
      geometry: optimizedGeometry,
      properties: this.optimizeProperties(feature.properties)
    };
  }

  optimizeGeometryByType(geometry, tolerance, maxPoints) {
    switch (geometry.type) {
      case 'Polygon':
        return {
          ...geometry,
          coordinates: geometry.coordinates.map(ring =>
            this.simplifyGeometry(ring, tolerance, maxPoints)
          )
        };

      case 'MultiPolygon':
        return {
          ...geometry,
          coordinates: geometry.coordinates.map(polygon =>
            polygon.map(ring =>
              this.simplifyGeometry(ring, tolerance, maxPoints)
            )
          )
        };

      case 'LineString':
        return {
          ...geometry,
          coordinates: this.simplifyGeometry(geometry.coordinates, tolerance, maxPoints)
        };

      case 'MultiLineString':
        return {
          ...geometry,
          coordinates: geometry.coordinates.map(line =>
            this.simplifyGeometry(line, tolerance, maxPoints)
          )
        };

      default:
        return geometry;
    }
  }

  optimizeProperties(properties) {
    // Keep only essential properties for the game
    const essential = [
      'GEOID', 'NAME', 'NAMELSAD', 'ALAND', 'AWATER',
      'INTPTLAT', 'INTPTLON'
    ];

    const optimized = {};
    essential.forEach(key => {
      if (properties[key] !== undefined) {
        optimized[key] = properties[key];
      }
    });

    return optimized;
  }

  // Adaptive loading strategy
  async loadWithStrategy(detailLevel, viewport = null) {
    const cacheKey = `geo-${detailLevel}`;
    const startTime = performance.now();

    // Check cache first
    if (this.cache.has(cacheKey)) {
      this.updateMetrics('cache-hit', detailLevel, startTime);
      return this.cache.get(cacheKey);
    }

    // Check if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    // Determine loading strategy
    const strategy = this.selectLoadingStrategy(detailLevel, viewport);
    const loadPromise = this.executeLoadingStrategy(strategy, detailLevel);

    this.loadingPromises.set(cacheKey, loadPromise);

    try {
      const data = await loadPromise;
      this.cacheData(cacheKey, data);
      this.updateMetrics('cache-miss', detailLevel, startTime);
      this.loadingPromises.delete(cacheKey);
      return data;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }

  selectLoadingStrategy(detailLevel, viewport) {
    // If viewport is small or zoomed out, prefer faster loading
    if (viewport && (viewport.zoom < 6 || viewport.area < 100000)) {
      return 'progressive';
    }

    // For high detail levels, use streaming
    if (detailLevel === 'high') {
      return 'streaming';
    }

    // Default to batch loading
    return 'batch';
  }

  async executeLoadingStrategy(strategy, detailLevel) {
    switch (strategy) {
      case 'progressive':
        return this.loadProgressive(detailLevel);
      case 'streaming':
        return this.loadStreaming(detailLevel);
      case 'batch':
      default:
        return this.loadBatch(detailLevel);
    }
  }

  async loadProgressive(detailLevel) {
    // Load lower detail first, then upgrade
    const lowerDetail = this.getLowerDetailLevel(detailLevel);

    if (lowerDetail && !this.cache.has(`geo-${lowerDetail}`)) {
      const quickData = await this.loadBatch(lowerDetail);
      this.cacheData(`geo-${lowerDetail}`, quickData);
    }

    return this.loadBatch(detailLevel);
  }

  async loadStreaming(detailLevel) {
    // For high-detail data, load in chunks
    const url = `/data/geo/ca-counties-${detailLevel}.geojson`;
    const response = await fetch(url);

    if (!response.body) {
      throw new Error('Streaming not supported');
    }

    const reader = response.body.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const completeData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;

    for (const chunk of chunks) {
      completeData.set(chunk, offset);
      offset += chunk.length;
    }

    const text = new TextDecoder().decode(completeData);
    return JSON.parse(text);
  }

  async loadBatch(detailLevel) {
    const url = `/data/geo/ca-counties-${detailLevel}.geojson`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load ${detailLevel} data: ${response.status}`);
    }

    return response.json();
  }

  getLowerDetailLevel(current) {
    const levels = ['ultra-low', 'low', 'medium', 'high'];
    const currentIndex = levels.indexOf(current);
    return currentIndex > 0 ? levels[currentIndex - 1] : null;
  }

  // Caching utilities
  cacheData(key, data) {
    // Check cache size limits
    if (this.getCurrentCacheSize() > this.options.cachingStrategy.maxCacheSize) {
      this.evictOldEntries();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      size: this.estimateDataSize(data)
    });

    this.updateMemoryUsage();
  }

  getCurrentCacheSize() {
    let total = 0;
    for (const entry of this.cache.values()) {
      total += entry.size || 0;
    }
    return total;
  }

  evictOldEntries() {
    const entries = Array.from(this.cache.entries());
    const { ttl } = this.options.cachingStrategy;
    const now = Date.now();

    // Remove expired entries first
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > ttl) {
        this.cache.delete(key);
      }
    });

    // If still over limit, remove oldest entries
    if (this.getCurrentCacheSize() > this.options.cachingStrategy.maxCacheSize) {
      const sortedEntries = entries
        .filter(([key]) => this.cache.has(key))
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      while (this.getCurrentCacheSize() > this.options.cachingStrategy.maxCacheSize * 0.8) {
        const [oldestKey] = sortedEntries.shift();
        this.cache.delete(oldestKey);
      }
    }
  }

  estimateDataSize(data) {
    return JSON.stringify(data).length * 2; // Rough estimate including overhead
  }

  updateMemoryUsage() {
    this.performanceMetrics.memoryUsage = this.getCurrentCacheSize();
  }

  updateMetrics(type, level, startTime) {
    const loadTime = performance.now() - startTime;

    if (!this.performanceMetrics.loadTimes[level]) {
      this.performanceMetrics.loadTimes[level] = [];
    }
    this.performanceMetrics.loadTimes[level].push(loadTime);

    if (!this.performanceMetrics.hitRates[level]) {
      this.performanceMetrics.hitRates[level] = { hits: 0, misses: 0 };
    }

    if (type === 'cache-hit') {
      this.performanceMetrics.hitRates[level].hits++;
    } else {
      this.performanceMetrics.hitRates[level].misses++;
    }
  }

  // Performance monitoring
  getPerformanceReport() {
    const report = {
      cacheSize: this.getCurrentCacheSize(),
      cachedItems: this.cache.size,
      loadTimes: {},
      hitRates: {},
      memoryEfficiency: this.calculateMemoryEfficiency()
    };

    // Calculate average load times
    Object.entries(this.performanceMetrics.loadTimes).forEach(([level, times]) => {
      report.loadTimes[level] = {
        average: times.reduce((a, b) => a + b, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
        samples: times.length
      };
    });

    // Calculate hit rates
    Object.entries(this.performanceMetrics.hitRates).forEach(([level, data]) => {
      const total = data.hits + data.misses;
      report.hitRates[level] = total > 0 ? data.hits / total : 0;
    });

    return report;
  }

  calculateMemoryEfficiency() {
    const totalData = this.cache.size;
    const memoryUsed = this.performanceMetrics.memoryUsage;
    const maxMemory = this.options.cachingStrategy.maxCacheSize;

    return {
      utilization: memoryUsed / maxMemory,
      itemsPerMB: totalData / (memoryUsed / (1024 * 1024)),
      efficiency: totalData / memoryUsed // items per byte
    };
  }

  // Preload commonly used data
  async preloadEssentials() {
    const { preload } = this.options.cachingStrategy;

    console.log('Preloading essential geo data...');

    const preloadPromises = preload.map(async (level) => {
      try {
        await this.loadWithStrategy(level);
        console.log(`✓ Preloaded ${level} detail level`);
      } catch (error) {
        console.warn(`Failed to preload ${level}:`, error.message);
      }
    });

    await Promise.all(preloadPromises);
    console.log('Preloading completed');
  }

  // Clear and reset
  clearCache() {
    this.cache.clear();
    this.loadingPromises.clear();
    this.performanceMetrics = {
      loadTimes: {},
      hitRates: {},
      memoryUsage: 0
    };
  }

  // Export optimization utilities
  static createOptimizationManifest(levels) {
    return {
      optimizationLevels: levels,
      recommendedUsage: {
        'ultra-low': 'Initial load, overview zoom levels 0-4',
        'low': 'Overview and navigation, zoom levels 5-6',
        'medium': 'Interactive selection, zoom levels 7-8',
        'high': 'Detailed interaction, zoom levels 9+'
      },
      adaptiveStrategy: {
        preload: ['ultra-low', 'low'],
        dynamicLoading: ['medium', 'high'],
        caching: true,
        compression: true
      }
    };
  }
}

export default GeoDataOptimizer;