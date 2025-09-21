/**
 * California Map Utilities for React/TypeScript Integration
 * Provides D3-geo integration, projection settings, zoom/pan, and collision detection
 */

import * as d3 from 'd3-geo';

export interface MapOptions {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
}

export interface CaliforniaBounds {
  southwest: [number, number];
  northeast: [number, number];
  center: [number, number];
}

export interface CountyCollisionResult {
  countyId: string;
  county: any;
  overlap: number;
  center: [number, number];
  snapPoint: [number, number];
}

export interface NearestTargetResult {
  countyId: string;
  county: any;
  distance: number;
  center: [number, number];
}

export class CaliforniaMapUtilities {
  private options: MapOptions;
  private currentProjection: d3.GeoProjection | null = null;
  private currentPath: d3.GeoPath | null = null;
  private geoData: any = null;
  private countyLookup: any = null;
  private currentZoomLevel = 1;

  // California geographic bounds
  private californiaBounds: CaliforniaBounds = {
    southwest: [-124.848974, 32.528832],
    northeast: [-114.131211, 42.009518],
    center: [-119.449444, 37.166111]
  };

  private projections: Record<string, d3.GeoProjection>;

  constructor(options: MapOptions) {
    this.options = options;
    this.initializeProjections();
    this.setProjection('albers'); // Default projection
  }

  private initializeProjections(): void {
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
  }

  setProjection(projectionName: 'albers' | 'mercator' | 'lambert'): this {
    if (!this.projections[projectionName]) {
      throw new Error(`Unknown projection: ${projectionName}`);
    }

    this.currentProjection = this.projections[projectionName];
    this.currentPath = d3.geoPath().projection(this.currentProjection);

    return this;
  }

  async loadGeoData(geoDataPath: string, lookupPath: string): Promise<this> {
    try {
      const [geoResponse, lookupResponse] = await Promise.all([
        fetch(geoDataPath),
        fetch(lookupPath)
      ]);

      if (!geoResponse.ok || !lookupResponse.ok) {
        throw new Error('Failed to load geo data');
      }

      this.geoData = await geoResponse.json();
      this.countyLookup = await lookupResponse.json();

      console.log(`Loaded ${this.geoData.features.length} counties`);
      return this;
    } catch (error) {
      console.error('Failed to load geo data:', error);
      throw error;
    }
  }

  // Zoom utilities
  setupZoomBehavior(svg: d3.Selection<any, any, any, any>, onZoom?: (transform: d3.ZoomTransform) => void): d3.ZoomBehavior<any, any> {
    const { width, height } = this.options;

    const zoomBehavior = d3.zoom<any, any>()
      .scaleExtent([0.5, 20])
      .extent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        this.currentZoomLevel = event.transform.k;
        if (onZoom) {
          onZoom(event.transform);
        }
      });

    svg.call(zoomBehavior);
    return zoomBehavior;
  }

  zoomToCounty(countyId: string, duration = 750): d3.ZoomTransform {
    if (!this.geoData || !this.currentPath) {
      throw new Error('Geo data not loaded or projection not set');
    }

    const county = this.geoData.features.find(
      (f: any) => f.properties.GEOID === countyId
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

  zoomToFitAll(padding = 0.1): d3.ZoomTransform {
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
  getCountyAtPoint(point: [number, number], transform: d3.ZoomTransform | null = null): { county: any; id: string; name: string; properties: any } | null {
    if (!this.geoData || !this.currentPath || !this.currentProjection) {
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
    const geoPoint = this.currentProjection.invert!(testPoint);
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

  // Create collision detector
  createCollisionDetector(): CountyCollisionDetector {
    return new CountyCollisionDetector(this);
  }

  // Utility: Point-in-polygon test
  private pointInPolygon(point: [number, number], geometry: any): boolean {
    if (geometry.type === 'Polygon') {
      return this.pointInPolygonRing(point, geometry.coordinates[0]);
    } else if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates.some((polygon: any) =>
        this.pointInPolygonRing(point, polygon[0])
      );
    }
    return false;
  }

  private pointInPolygonRing(point: [number, number], ring: [number, number][]): boolean {
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
  getOptimalDetailLevel(zoomLevel = this.currentZoomLevel): 'ultra-low' | 'low' | 'medium' | 'high' {
    if (zoomLevel <= 5) return 'ultra-low';
    if (zoomLevel <= 7) return 'low';
    if (zoomLevel <= 9) return 'medium';
    return 'high';
  }

  // Coordinate transformations
  screenToGeo(screenPoint: [number, number], transform: d3.ZoomTransform | null = null): [number, number] | null {
    if (!this.currentProjection) return null;

    let point = screenPoint;
    if (transform) {
      point = [
        (screenPoint[0] - transform.x) / transform.k,
        (screenPoint[1] - transform.y) / transform.k
      ];
    }
    return this.currentProjection.invert!(point) || null;
  }

  geoToScreen(geoPoint: [number, number], transform: d3.ZoomTransform | null = null): [number, number] | null {
    if (!this.currentProjection) return null;

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
  getCountyCentroid(countyId: string, transform: d3.ZoomTransform | null = null): [number, number] | null {
    if (!this.currentPath) return null;

    const county = this.geoData.features.find(
      (f: any) => f.properties.GEOID === countyId
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
  getCountyBounds(countyId: string, transform: d3.ZoomTransform | null = null): [[number, number], [number, number]] | null {
    if (!this.currentPath) return null;

    const county = this.geoData.features.find(
      (f: any) => f.properties.GEOID === countyId
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

  // Getters for internal state (for collision detector)
  get path(): d3.GeoPath | null { return this.currentPath; }
  get data(): any { return this.geoData; }
  get projection(): d3.GeoProjection | null { return this.currentProjection; }
}

// Specialized collision detection system
export class CountyCollisionDetector {
  private mapUtils: CaliforniaMapUtilities;
  private spatialIndex = new Map<string, {
    bounds: [[number, number], [number, number]];
    feature: any;
    center: [number, number];
  }>();

  constructor(mapUtils: CaliforniaMapUtilities) {
    this.mapUtils = mapUtils;
    this.buildSpatialIndex();
  }

  private buildSpatialIndex(): void {
    if (!this.mapUtils.data || !this.mapUtils.path) return;

    this.spatialIndex.clear();

    this.mapUtils.data.features.forEach((feature: any) => {
      const bounds = this.mapUtils.path!.bounds(feature);
      const id = feature.properties.GEOID;

      this.spatialIndex.set(id, {
        bounds,
        feature,
        center: this.mapUtils.path!.centroid(feature)
      });
    });
  }

  // Check if a dragged county piece overlaps with any target counties
  checkCollisions(draggedElement: Element, threshold = 0.8): CountyCollisionResult[] {
    const draggedBounds = this.getElementBounds(draggedElement);
    const collisions: CountyCollisionResult[] = [];

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

  private getElementBounds(element: Element): {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  } {
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

  private calculateOverlap(
    bounds1: { left: number; top: number; right: number; bottom: number; width: number; height: number },
    bounds2: [[number, number], [number, number]]
  ): { area: number; percentage: number; intersection: boolean } {
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

  private calculateSnapPoint(
    draggedBounds: { left: number; top: number; right: number; bottom: number },
    targetBounds: [[number, number], [number, number]]
  ): [number, number] {
    return [
      (targetBounds[0][0] + targetBounds[1][0]) / 2,
      (targetBounds[0][1] + targetBounds[1][1]) / 2
    ];
  }

  // Find nearest drop target
  findNearestTarget(point: [number, number], maxDistance = 100): NearestTargetResult | null {
    let nearest: NearestTargetResult | null = null;
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

  private calculateDistance(point1: [number, number], point2: [number, number]): number {
    const dx = point1[0] - point2[0];
    const dy = point1[1] - point2[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Rebuild spatial index (call after projection changes)
  rebuild(): void {
    this.buildSpatialIndex();
  }
}

export default CaliforniaMapUtilities;