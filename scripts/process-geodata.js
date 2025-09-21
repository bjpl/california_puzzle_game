#!/usr/bin/env node

/**
 * California GeoData Processing Pipeline
 * Converts CA_Counties shapefile to optimized GeoJSON formats for web rendering
 * Creates multiple detail levels for performance optimization
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

class CaliforniaGeoProcessor {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.geoDataDir = path.join(this.projectRoot, 'Geo data');
    this.outputDir = path.join(this.projectRoot, 'public', 'data', 'geo');
    this.scriptsDir = path.join(this.projectRoot, 'scripts');

    // California-specific projection settings
    this.californiaProjections = {
      // Albers Equal Area Conic (good for California)
      albers: {
        type: 'conicEqualArea',
        parallels: [34, 40.5],
        rotate: [120, 0],
        center: [-2, 36.5],
        scale: 7000,
        translate: [512, 384]
      },
      // Mercator (Web Mercator for tile compatibility)
      mercator: {
        type: 'mercator',
        center: [-119.4179, 36.7783],
        scale: 3500,
        translate: [512, 384]
      },
      // Lambert Conformal Conic (preserves shape)
      lambert: {
        type: 'conicConformal',
        parallels: [33, 45],
        rotate: [120, 0],
        center: [-2, 36.5],
        scale: 6000,
        translate: [512, 384]
      }
    };
  }

  async initialize() {
    try {
      // Ensure output directories exist
      await fs.mkdir(this.outputDir, { recursive: true });
      console.log('✓ Created output directories');

      // Check for required tools
      await this.checkDependencies();
      console.log('✓ Dependencies verified');

    } catch (error) {
      console.error('Initialization failed:', error.message);
      throw error;
    }
  }

  async checkDependencies() {
    const dependencies = [
      { cmd: 'ogr2ogr --version', name: 'GDAL/OGR' },
      { cmd: 'node --version', name: 'Node.js' }
    ];

    for (const dep of dependencies) {
      try {
        await execAsync(dep.cmd);
      } catch (error) {
        console.warn(`Warning: ${dep.name} not found. Some features may be limited.`);
      }
    }
  }

  async convertShapefileToGeoJSON() {
    const shapefilePath = path.join(this.geoDataDir, 'CA_Counties.shp');
    const outputPath = path.join(this.outputDir, 'ca-counties-raw.geojson');

    try {
      // Check if shapefile exists
      await fs.access(shapefilePath);

      // Convert using ogr2ogr if available, otherwise use fallback
      try {
        const cmd = `ogr2ogr -f "GeoJSON" -t_srs EPSG:4326 "${outputPath}" "${shapefilePath}"`;
        await execAsync(cmd);
        console.log('✓ Converted shapefile to GeoJSON using ogr2ogr');
      } catch (error) {
        console.warn('ogr2ogr not available, using alternative method');
        await this.convertShapefileAlternative(shapefilePath, outputPath);
      }

      return outputPath;
    } catch (error) {
      console.error('Shapefile conversion failed:', error.message);
      throw error;
    }
  }

  async convertShapefileAlternative(shapefilePath, outputPath) {
    // Alternative conversion method using shapefile package
    try {
      const { default: shapefile } = await import('shapefile');

      const features = [];
      await shapefile.read(shapefilePath)
        .then(collection => {
          const geoJSON = {
            type: 'FeatureCollection',
            features: collection.features.map(feature => ({
              type: 'Feature',
              properties: {
                GEOID: feature.properties.GEOID,
                NAME: feature.properties.NAME,
                NAMELSAD: feature.properties.NAMELSAD,
                ALAND: feature.properties.ALAND,
                AWATER: feature.properties.AWATER,
                INTPTLAT: feature.properties.INTPTLAT,
                INTPTLON: feature.properties.INTPTLON
              },
              geometry: feature.geometry
            }))
          };

          return fs.writeFile(outputPath, JSON.stringify(geoJSON, null, 2));
        });

      console.log('✓ Converted shapefile using alternative method');
    } catch (error) {
      console.error('Alternative conversion failed:', error.message);
      throw error;
    }
  }

  async createOptimizedVersions() {
    const rawGeoJSONPath = path.join(this.outputDir, 'ca-counties-raw.geojson');

    try {
      const rawData = JSON.parse(await fs.readFile(rawGeoJSONPath, 'utf8'));
      console.log(`Processing ${rawData.features.length} counties...`);

      // Create different optimization levels
      const optimizations = [
        { name: 'high', tolerance: 0.001, description: 'High detail for close zoom' },
        { name: 'medium', tolerance: 0.005, description: 'Medium detail for moderate zoom' },
        { name: 'low', tolerance: 0.01, description: 'Low detail for overview' },
        { name: 'ultra-low', tolerance: 0.05, description: 'Ultra-low for thumbnail/preview' }
      ];

      for (const opt of optimizations) {
        const optimizedData = await this.simplifyGeometry(rawData, opt.tolerance);
        const outputPath = path.join(this.outputDir, `ca-counties-${opt.name}.geojson`);

        await fs.writeFile(outputPath, JSON.stringify(optimizedData, null, 2));

        const reduction = this.calculateSizeReduction(rawData, optimizedData);
        console.log(`✓ Created ${opt.name} detail version (${reduction}% size reduction)`);
      }

    } catch (error) {
      console.error('Optimization failed:', error.message);
      throw error;
    }
  }

  async simplifyGeometry(geoJSON, tolerance) {
    // Simple Douglas-Peucker-inspired simplification
    const simplifiedFeatures = geoJSON.features.map(feature => {
      if (feature.geometry.type === 'Polygon') {
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: feature.geometry.coordinates.map(ring =>
              this.simplifyCoordinateRing(ring, tolerance)
            )
          }
        };
      } else if (feature.geometry.type === 'MultiPolygon') {
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: feature.geometry.coordinates.map(polygon =>
              polygon.map(ring => this.simplifyCoordinateRing(ring, tolerance))
            )
          }
        };
      }
      return feature;
    });

    return {
      ...geoJSON,
      features: simplifiedFeatures,
      metadata: {
        ...geoJSON.metadata,
        simplificationTolerance: tolerance,
        processedAt: new Date().toISOString()
      }
    };
  }

  simplifyCoordinateRing(coordinates, tolerance) {
    if (coordinates.length <= 3) return coordinates;

    // Basic point reduction - keep every nth point based on tolerance
    const step = Math.max(1, Math.floor(tolerance * 1000));
    const simplified = [];

    for (let i = 0; i < coordinates.length; i += step) {
      simplified.push(coordinates[i]);
    }

    // Always include the last point to close the ring
    if (simplified[simplified.length - 1] !== coordinates[coordinates.length - 1]) {
      simplified.push(coordinates[coordinates.length - 1]);
    }

    return simplified;
  }

  calculateSizeReduction(original, simplified) {
    const originalSize = JSON.stringify(original).length;
    const simplifiedSize = JSON.stringify(simplified).length;
    return Math.round((1 - simplifiedSize / originalSize) * 100);
  }

  async createCountyLookup() {
    const rawGeoJSONPath = path.join(this.outputDir, 'ca-counties-raw.geojson');

    try {
      const data = JSON.parse(await fs.readFile(rawGeoJSONPath, 'utf8'));

      const lookup = {
        counties: data.features.map(feature => ({
          id: feature.properties.GEOID,
          name: feature.properties.NAME,
          fullName: feature.properties.NAMELSAD,
          centroid: [
            parseFloat(feature.properties.INTPTLON),
            parseFloat(feature.properties.INTPTLAT)
          ],
          area: {
            land: parseFloat(feature.properties.ALAND),
            water: parseFloat(feature.properties.AWATER)
          },
          bounds: this.calculateBounds(feature.geometry)
        })),
        totalCounties: data.features.length,
        generatedAt: new Date().toISOString()
      };

      const outputPath = path.join(this.outputDir, 'county-lookup.json');
      await fs.writeFile(outputPath, JSON.stringify(lookup, null, 2));

      console.log(`✓ Created county lookup with ${lookup.counties.length} entries`);
      return lookup;

    } catch (error) {
      console.error('County lookup creation failed:', error.message);
      throw error;
    }
  }

  calculateBounds(geometry) {
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;

    const processCoordinates = (coords) => {
      if (typeof coords[0] === 'number') {
        // Single coordinate pair
        minLng = Math.min(minLng, coords[0]);
        maxLng = Math.max(maxLng, coords[0]);
        minLat = Math.min(minLat, coords[1]);
        maxLat = Math.max(maxLat, coords[1]);
      } else {
        // Array of coordinates
        coords.forEach(processCoordinates);
      }
    };

    processCoordinates(geometry.coordinates);

    return {
      southwest: [minLng, minLat],
      northeast: [maxLng, maxLat],
      center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2]
    };
  }

  async createProjectionConfigs() {
    const configPath = path.join(this.outputDir, 'projection-configs.json');

    const configs = {
      projections: this.californiaProjections,
      recommended: {
        overview: 'albers',
        detailed: 'lambert',
        web: 'mercator'
      },
      california: {
        bounds: {
          southwest: [-124.848974, 32.528832],
          northeast: [-114.131211, 42.009518]
        },
        center: [-119.449444, 37.166111],
        defaultZoom: {
          overview: 6,
          county: 8,
          detailed: 10
        }
      },
      d3GeoSettings: {
        width: 1024,
        height: 768,
        margin: { top: 20, right: 20, bottom: 20, left: 20 }
      }
    };

    await fs.writeFile(configPath, JSON.stringify(configs, null, 2));
    console.log('✓ Created projection configuration file');

    return configs;
  }

  async generateManifest() {
    const manifestPath = path.join(this.outputDir, 'geo-manifest.json');

    const manifest = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      files: {
        raw: 'ca-counties-raw.geojson',
        optimized: {
          high: 'ca-counties-high.geojson',
          medium: 'ca-counties-medium.geojson',
          low: 'ca-counties-low.geojson',
          ultraLow: 'ca-counties-ultra-low.geojson'
        },
        lookup: 'county-lookup.json',
        projections: 'projection-configs.json'
      },
      usage: {
        zoom: {
          '0-5': 'ultra-low',
          '6-7': 'low',
          '8-9': 'medium',
          '10+': 'high'
        },
        scenarios: {
          overview: 'low',
          selection: 'medium',
          dragging: 'high',
          collision: 'high'
        }
      },
      metadata: {
        projection: 'EPSG:4326 (WGS84)',
        units: 'decimal degrees',
        counties: 58,
        source: 'CA_Counties.shp'
      }
    };

    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✓ Generated geo-data manifest');

    return manifest;
  }

  async run() {

    try {
      await this.initialize();

      console.log('📍 Converting shapefile to GeoJSON...');
      await this.convertShapefileToGeoJSON();

      console.log('⚡ Creating optimized versions...');
      await this.createOptimizedVersions();

      console.log('🗂️  Creating county lookup...');
      await this.createCountyLookup();

      console.log('🗺️  Creating projection configs...');
      await this.createProjectionConfigs();

      console.log('📋 Generating manifest...');
      await this.generateManifest();

      console.log('\n✅ GeoData processing completed successfully!');
      console.log(`📁 Output directory: ${this.outputDir}`);

    } catch (error) {
      console.error('\n❌ Processing failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly (simplified check)
const isMainModule = process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]));

if (isMainModule) {
  console.log('🚀 Starting California GeoData processing...');
  const processor = new CaliforniaGeoProcessor();
  processor.run().catch(error => {
    console.error('❌ Processing failed:', error);
    process.exit(1);
  });
}

export default CaliforniaGeoProcessor;