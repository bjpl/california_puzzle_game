import { describe, it, expect, beforeEach } from 'vitest';
import { MOCK_CALIFORNIA_COUNTIES } from '../../fixtures';

describe('County Data Integrity', () => {
  describe('Data Structure Validation', () => {
    it('should have all required fields for each county', () => {
      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        expect(county).toHaveProperty('id');
        expect(county).toHaveProperty('name');
        expect(county).toHaveProperty('population');
        expect(county).toHaveProperty('area');
        expect(county).toHaveProperty('coordinates');
        expect(county).toHaveProperty('region');
        expect(county).toHaveProperty('established');
        expect(county).toHaveProperty('countyFIPS');
        expect(county).toHaveProperty('geometry');
      });
    });

    it('should have valid data types for each field', () => {
      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        expect(typeof county.id).toBe('string');
        expect(typeof county.name).toBe('string');
        expect(typeof county.population).toBe('number');
        expect(typeof county.area).toBe('number');
        expect(typeof county.coordinates).toBe('object');
        expect(typeof county.region).toBe('string');
        expect(typeof county.established).toBe('number');
        expect(typeof county.countyFIPS).toBe('string');
        expect(typeof county.geometry).toBe('object');
      });
    });

    it('should have valid coordinates with lat/lng', () => {
      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        expect(county.coordinates).toHaveProperty('lat');
        expect(county.coordinates).toHaveProperty('lng');
        expect(typeof county.coordinates.lat).toBe('number');
        expect(typeof county.coordinates.lng).toBe('number');

        // California latitude bounds: ~32.5 to ~42.0
        expect(county.coordinates.lat).toBeGreaterThan(32);
        expect(county.coordinates.lat).toBeLessThan(42);

        // California longitude bounds: ~-124.5 to ~-114.0
        expect(county.coordinates.lng).toBeGreaterThan(-125);
        expect(county.coordinates.lng).toBeLessThan(-114);
      });
    });

    it('should have valid FIPS codes', () => {
      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        // California FIPS codes start with '06'
        expect(county.countyFIPS).toMatch(/^06\d{3}$/);
      });
    });

    it('should have unique identifiers', () => {
      const ids = MOCK_CALIFORNIA_COUNTIES.map(county => county.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds).toHaveLength(ids.length);

      const fipsCodes = MOCK_CALIFORNIA_COUNTIES.map(county => county.countyFIPS);
      const uniqueFips = [...new Set(fipsCodes)];
      expect(uniqueFips).toHaveLength(fipsCodes.length);
    });
  });

  describe('Geometry Validation', () => {
    it('should have valid GeoJSON geometry', () => {
      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        expect(county.geometry.type).toBe('Polygon');
        expect(Array.isArray(county.geometry.coordinates)).toBe(true);
        expect(county.geometry.coordinates).toHaveLength(1); // Simple polygon

        const polygon = county.geometry.coordinates[0];
        expect(Array.isArray(polygon)).toBe(true);
        expect(polygon.length).toBeGreaterThan(2);

        // Each coordinate should be [lng, lat]
        polygon.forEach((coord) => {
          expect(Array.isArray(coord)).toBe(true);
          expect(coord).toHaveLength(2);
          expect(typeof coord[0]).toBe('number'); // longitude
          expect(typeof coord[1]).toBe('number'); // latitude
        });
      });
    });

    it('should have closed polygon coordinates', () => {
      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        const polygon = county.geometry.coordinates[0];
        const firstPoint = polygon[0];
        const lastPoint = polygon[polygon.length - 1];

        expect(firstPoint[0]).toBe(lastPoint[0]);
        expect(firstPoint[1]).toBe(lastPoint[1]);
      });
    });
  });

  describe('Population and Area Validation', () => {
    it('should have realistic population values', () => {
      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        expect(county.population).toBeGreaterThan(0);
        expect(county.population).toBeLessThan(15000000); // Max reasonable for CA county
      });
    });

    it('should have realistic area values (square miles)', () => {
      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        expect(county.area).toBeGreaterThan(0);
        expect(county.area).toBeLessThan(25000); // San Bernardino is largest at ~20k sq miles
      });
    });

    it('should calculate population density reasonably', () => {
      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        const density = county.population / county.area;
        expect(density).toBeGreaterThan(0);
        expect(density).toBeLessThan(20000); // Max reasonable density per sq mile
      });
    });
  });

  describe('Historical Data Validation', () => {
    it('should have valid establishment years', () => {
      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        expect(county.established).toBeGreaterThan(1800);
        expect(county.established).toBeLessThan(1900); // CA became state in 1850
      });
    });

    it('should have counties established after CA statehood for most', () => {
      const statehood = 1850;
      const afterStatehood = MOCK_CALIFORNIA_COUNTIES.filter(
        county => county.established >= statehood
      );

      expect(afterStatehood.length).toBeGreaterThan(MOCK_CALIFORNIA_COUNTIES.length * 0.8);
    });
  });

  describe('Regional Classification', () => {
    it('should have valid regional classifications', () => {
      const validRegions = [
        'Southern California',
        'Northern California',
        'Central California',
        'Bay Area',
        'Central Valley',
        'Inland Empire',
        'North Coast',
        'Sierra Nevada',
        'Desert'
      ];

      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        expect(validRegions).toContain(county.region);
      });
    });

    it('should have balanced regional distribution', () => {
      const regionCounts = MOCK_CALIFORNIA_COUNTIES.reduce((acc, county) => {
        acc[county.region] = (acc[county.region] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // No region should be empty
      Object.values(regionCounts).forEach(count => {
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Consistency Checks', () => {
    it('should maintain consistent naming conventions', () => {
      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        // ID should be kebab-case
        expect(county.id).toMatch(/^[a-z]+(-[a-z]+)*$/);

        // Name should be title case
        expect(county.name).toMatch(/^[A-Z][a-zA-Z\s]*$/);
      });
    });

    it('should have no duplicate names', () => {
      const names = MOCK_CALIFORNIA_COUNTIES.map(county => county.name);
      const uniqueNames = [...new Set(names)];
      expect(uniqueNames).toHaveLength(names.length);
    });

    it('should validate cross-referenced data integrity', () => {
      // Los Angeles should be largest by population
      const losAngeles = MOCK_CALIFORNIA_COUNTIES.find(c => c.id === 'los-angeles');
      if (losAngeles) {
        const otherCounties = MOCK_CALIFORNIA_COUNTIES.filter(c => c.id !== 'los-angeles');
        otherCounties.forEach(county => {
          expect(losAngeles.population).toBeGreaterThan(county.population);
        });
      }

      // San Bernardino should be largest by area
      const sanBernardino = MOCK_CALIFORNIA_COUNTIES.find(c => c.id === 'san-bernardino');
      if (sanBernardino) {
        const otherCounties = MOCK_CALIFORNIA_COUNTIES.filter(c => c.id !== 'san-bernardino');
        otherCounties.forEach(county => {
          expect(sanBernardino.area).toBeGreaterThanOrEqual(county.area);
        });
      }
    });
  });
});