/**
 * California Map Utilities for Puzzle Game
 * Provides D3-geo integration, projection settings, zoom/pan, and collision detection
 */

import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';

export class CaliforniaMapUtilities {
  constructor(options = {}) {
    this.options = {
      width: options.width || 1024,
      height: options.height || 768,
      margin: options.margin || { top: 20, right: 20, bottom: 20, left: 20 },
      ...options
    };

    this.currentProjection = null;
    this.currentPath = null;
    this.geoData = null;
    this.countyLookup = null;
    this.zoomBehavior = null;
    this.currentZoomLevel = 1;

    // California geographic bounds
    this.californiaBounds = {
      southwest: [-124.848974, 32.528832],
      northeast: [-114.131211, 42.009518],
      center: [-119.449444, 37.166111]
    };

    // Initialize projections
    this.initializeProjections();
  }

  initializeProjections() {
    const { width, height, margin } = this.options;
    const mapWidth = width - margin.left - margin.right;
    const mapHeight = height - margin.top - margin.bottom;

    this.projections = {
      // Albers Equal Area Conic - Best for California overview
      albers: d3.geoAlbers()
        .parallels([34, 40.5])
        .rotate([120, 0])
        .center([-2, 36.5])
        .scale(7000)
        .translate([mapWidth / 2, mapHeight / 2]),

      // Mercator - Web compatible
      mercator: d3.geoMercator()
        .center(this.californiaBounds.center)
        .scale(3500)
        .translate([mapWidth / 2, mapHeight / 2]),

      // Lambert Conformal Conic - Shape preserving
      lambert: d3.geoConicConformal()
        .parallels([33, 45])
        .rotate([120, 0])
        .center([-2, 36.5])
        .scale(6000)
        .translate([mapWidth / 2, mapHeight / 2])
    };

    // Set default projection
    this.setProjection('albers');
  }

  setProjection(projectionName) {
    if (!this.projections[projectionName]) {
      throw new Error(`Unknown projection: ${projectionName}`);
    }

    this.currentProjection = this.projections[projectionName];
    this.currentPath = d3.geoPath().projection(this.currentProjection);

    return this;
  }

  async loadGeoData(geoDataPath, lookupPath) {
    try {
      const [geoResponse, lookupResponse] = await Promise.all([
        fetch(geoDataPath),
        fetch(lookupPath)
      ]);

      this.geoData = await geoResponse.json();
      this.countyLookup = await lookupResponse.json();

      console.log(`Loaded ${this.geoData.features.length} counties`);
      return this;
    } catch (error) {
      console.error('Failed to load geo data:', error);
      throw error;
    }
  }

  // Zoom and pan utilities
  setupZoomBehavior(svg, onZoom) {
    const { width, height } = this.options;

    this.zoomBehavior = d3.zoom()
      .scaleExtent([0.5, 20])
      .extent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        this.currentZoomLevel = event.transform.k;
        if (onZoom) {
          onZoom(event.transform);
        }
      });

    svg.call(this.zoomBehavior);
    return this.zoomBehavior;
  }

  zoomToCounty(countyId, duration = 750) {
    if (!this.geoData || !this.currentPath) {
      throw new Error('Geo data not loaded or projection not set');
    }

    const county = this.geoData.features.find(
      f => f.properties.GEOID === countyId
    );

    if (!county) {
      throw new Error(`County not found: ${countyId}`);
    }

    const bounds = this.currentPath.bounds(county);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.min(8, 0.9 / Math.max(dx / this.options.width, dy / this.options.height));
    const translate = [this.options.width / 2 - scale * x, this.options.height / 2 - scale * y];

    return d3.zoomIdentity
      .translate(translate[0], translate[1])
      .scale(scale);
  }

  zoomToFitAll(padding = 0.1) {
    if (!this.geoData || !this.currentPath) {
      throw new Error('Geo data not loaded or projection not set');
    }

    const bounds = this.currentPath.bounds(this.geoData);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = (1 - padding) / Math.max(dx / this.options.width, dy / this.options.height);
    const translate = [this.options.width / 2 - scale * x, this.options.height / 2 - scale * y];

    return d3.zoomIdentity
      .translate(translate[0], translate[1])
      .scale(scale);
  }

  // County boundary detection
  getCountyAtPoint(point, transform = null) {
    if (!this.geoData || !this.currentPath) {
      return null;
    }

    // Apply inverse transform if zoomed/panned
    let testPoint = point;
    if (transform) {
      testPoint = [
        (point[0] - transform.x) / transform.k,
        (point[1] - transform.y) / transform.k
      ];
    }

    // Convert screen coordinates to geographic coordinates
    const geoPoint = this.currentProjection.invert(testPoint);
    if (!geoPoint) return null;

    // Find county containing this point
    for (const feature of this.geoData.features) {
      if (this.pointInPolygon(geoPoint, feature.geometry)) {
        return {
          county: feature,
          id: feature.properties.GEOID,
          name: feature.properties.NAME,
          properties: feature.properties
        };
      }
    }

    return null;
  }

  // Enhanced collision detection for drag-drop
  createCollisionDetector() {
    return new CountyCollisionDetector(this);
  }

  // Utility: Point-in-polygon test
  pointInPolygon(point, geometry) {
    if (geometry.type === 'Polygon') {
      return this.pointInPolygonRing(point, geometry.coordinates[0]);
    } else if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates.some(polygon =>
        this.pointInPolygonRing(point, polygon[0])
      );
    }
    return false;
  }

  pointInPolygonRing(point, ring) {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];

      if (((yi > y) !== (yj > y)) &&
          (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }

  // Performance optimization: Get appropriate detail level
  getOptimalDetailLevel(zoomLevel = this.currentZoomLevel) {
    if (zoomLevel <= 5) return 'ultra-low';
    if (zoomLevel <= 7) return 'low';
    if (zoomLevel <= 9) return 'medium';
    return 'high';
  }

  // Coordinate transformations
  screenToGeo(screenPoint, transform = null) {
    let point = screenPoint;
    if (transform) {
      point = [
        (screenPoint[0] - transform.x) / transform.k,
        (screenPoint[1] - transform.y) / transform.k
      ];
    }
    return this.currentProjection.invert(point);
  }

  geoToScreen(geoPoint, transform = null) {
    const screenPoint = this.currentProjection(geoPoint);
    if (!screenPoint) return null;

    if (transform) {
      return [
        screenPoint[0] * transform.k + transform.x,
        screenPoint[1] * transform.k + transform.y
      ];
    }
    return screenPoint;
  }

  // Calculate county centroid in screen coordinates
  getCountyCentroid(countyId, transform = null) {
    const county = this.geoData.features.find(
      f => f.properties.GEOID === countyId
    );

    if (!county) return null;

    const centroid = this.currentPath.centroid(county);
    if (transform) {
      return [
        centroid[0] * transform.k + transform.x,
        centroid[1] * transform.k + transform.y
      ];
    }
    return centroid;
  }

  // Get county bounds in screen coordinates
  getCountyBounds(countyId, transform = null) {
    const county = this.geoData.features.find(
      f => f.properties.GEOID === countyId
    );

    if (!county) return null;

    const bounds = this.currentPath.bounds(county);
    if (transform) {
      return [
        [bounds[0][0] * transform.k + transform.x, bounds[0][1] * transform.k + transform.y],
        [bounds[1][0] * transform.k + transform.x, bounds[1][1] * transform.k + transform.y]
      ];
    }
    return bounds;
  }
}

// Specialized collision detection system
export class CountyCollisionDetector {
  constructor(mapUtils) {
    this.mapUtils = mapUtils;
    this.spatialIndex = null;
    this.buildSpatialIndex();
  }

  buildSpatialIndex() {
    if (!this.mapUtils.geoData) return;

    // Simple spatial index using county bounds
    this.spatialIndex = new Map();

    this.mapUtils.geoData.features.forEach(feature => {
      const bounds = this.mapUtils.currentPath.bounds(feature);
      const id = feature.properties.GEOID;

      this.spatialIndex.set(id, {
        bounds,
        feature,
        center: this.mapUtils.currentPath.centroid(feature)
      });
    });
  }

  // Check if a dragged county piece overlaps with any target counties
  checkCollisions(draggedElement, threshold = 0.8) {
    const draggedBounds = this.getElementBounds(draggedElement);
    const collisions = [];

    for (const [countyId, indexEntry] of this.spatialIndex) {
      const overlap = this.calculateOverlap(draggedBounds, indexEntry.bounds);

      if (overlap.percentage > threshold) {
        collisions.push({
          countyId,
          county: indexEntry.feature,
          overlap: overlap.percentage,
          center: indexEntry.center,
          snapPoint: this.calculateSnapPoint(draggedBounds, indexEntry.bounds)
        });
      }
    }

    return collisions.sort((a, b) => b.overlap - a.overlap);
  }

  getElementBounds(element) {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height
    };
  }

  calculateOverlap(bounds1, bounds2) {
    const left = Math.max(bounds1.left, bounds2[0][0]);
    const top = Math.max(bounds1.top, bounds2[0][1]);
    const right = Math.min(bounds1.right, bounds2[1][0]);
    const bottom = Math.min(bounds1.bottom, bounds2[1][1]);

    const overlapWidth = Math.max(0, right - left);
    const overlapHeight = Math.max(0, bottom - top);
    const overlapArea = overlapWidth * overlapHeight;

    const bounds1Area = bounds1.width * bounds1.height;
    const bounds2Area = (bounds2[1][0] - bounds2[0][0]) * (bounds2[1][1] - bounds2[0][1]);

    const percentage = overlapArea / Math.min(bounds1Area, bounds2Area);

    return {
      area: overlapArea,
      percentage,
      intersection: overlapArea > 0
    };
  }

  calculateSnapPoint(draggedBounds, targetBounds) {
    return [
      (targetBounds[0][0] + targetBounds[1][0]) / 2,
      (targetBounds[0][1] + targetBounds[1][1]) / 2
    ];
  }

  // Find nearest drop target
  findNearestTarget(point, maxDistance = 100) {
    let nearest = null;
    let minDistance = Infinity;

    for (const [countyId, indexEntry] of this.spatialIndex) {
      const distance = this.calculateDistance(point, indexEntry.center);

      if (distance < maxDistance && distance < minDistance) {
        minDistance = distance;
        nearest = {
          countyId,
          county: indexEntry.feature,
          distance,
          center: indexEntry.center
        };
      }
    }

    return nearest;
  }

  calculateDistance(point1, point2) {
    const dx = point1[0] - point2[0];
    const dy = point1[1] - point2[1];
    return Math.sqrt(dx * dx + dy * dy);
  }
}

// Data loading and caching utilities
export class GeoDataCache {
  constructor() {
    this.cache = new Map();
    this.loadPromises = new Map();
  }

  async loadOptimizedData(detailLevel = 'medium') {
    const cacheKey = `counties-${detailLevel}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (this.loadPromises.has(cacheKey)) {
      return this.loadPromises.get(cacheKey);
    }

    const loadPromise = this.fetchGeoData(detailLevel);
    this.loadPromises.set(cacheKey, loadPromise);

    try {
      const data = await loadPromise;
      this.cache.set(cacheKey, data);
      this.loadPromises.delete(cacheKey);
      return data;
    } catch (error) {
      this.loadPromises.delete(cacheKey);
      throw error;
    }
  }

  async fetchGeoData(detailLevel) {
    const dataPath = `/data/geo/ca-counties-${detailLevel}.geojson`;
    const lookupPath = '/data/geo/county-lookup.json';

    const [geoResponse, lookupResponse] = await Promise.all([
      fetch(dataPath),
      fetch(lookupPath)
    ]);

    if (!geoResponse.ok || !lookupResponse.ok) {
      throw new Error('Failed to load geo data');
    }

    return {
      geoData: await geoResponse.json(),
      lookup: await lookupResponse.json()
    };
  }

  preloadAllLevels() {
    const levels = ['ultra-low', 'low', 'medium', 'high'];
    return Promise.all(levels.map(level => this.loadOptimizedData(level)));
  }

  clearCache() {
    this.cache.clear();
    this.loadPromises.clear();
  }
}

export default CaliforniaMapUtilities;