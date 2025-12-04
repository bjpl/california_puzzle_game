import { useEffect, useState, useRef, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useCountyPlacementStore } from '@/stores/countyPlacementStore';
import { getSvgTextFill } from '../../utils/colorContrast';
import { UI_CONFIG, COUNTY_FILL_COLORS, STROKE_COLORS, GAME_CONFIG } from '@/constants';
import { mapLogger } from '../../utils/logger';

interface CountyFeature {
  type: string;
  properties: {
    NAME: string;
    COUNTYFP: string;
  };
  geometry: {
    type: string;
    coordinates: Record<string, unknown>;
  };
}

interface CountyDropZoneProps {
  county: CountyFeature;
  projection: (coord: [number, number]) => [number, number];
}

function CountyDropZone({ county, projection }: CountyDropZoneProps) {
  const placedCounties = useCountyPlacementStore((state) => state.placedCounties);
  const currentHint = useCountyPlacementStore((state) => state.currentHint);

  // Ensure consistent ID formatting between drag source and drop target
  const countyName = county.properties.NAME;
  const countyId = countyName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');

  // Convert placed counties array to Set for efficient lookup
  const placedCountyIds = useMemo(
    () => new Set(placedCounties.map(c => c.id)),
    [placedCounties]
  );
  const isPlaced = placedCountyIds.has(countyId);

  const { isOver, setNodeRef } = useDroppable({
    id: countyId,
  });

  // currentHint is a County type, so we need to format its name to match countyId
  const currentCountyId = currentHint?.name
    ? currentHint.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')
    : undefined;

  const isActive = currentCountyId === countyId;
  const isCorrectHover = isOver && currentCountyId === countyId;
  const isWrongHover = isOver && currentCountyId !== countyId;

  let fillColor: string = COUNTY_FILL_COLORS.DEFAULT; // Default gray
  if (isPlaced)
    fillColor = COUNTY_FILL_COLORS.PLACED; // Green when placed
  else if (isCorrectHover)
    fillColor = COUNTY_FILL_COLORS.CORRECT_HOVER; // Light green on correct hover
  else if (isWrongHover)
    fillColor = COUNTY_FILL_COLORS.WRONG_HOVER; // Light red on wrong hover
  else if (isActive) fillColor = COUNTY_FILL_COLORS.ACTIVE; // Yellow when active

  // Calculate optimal text color based on background
  const textColor = getSvgTextFill(fillColor);

  // Convert coordinates to path
  const coordinatesToPath = (coords: [number, number][], isHole = false): string => {
    if (!coords || coords.length === 0) return '';

    const points = coords.map((coord) => projection(coord));
    const validPoints = points.filter((p) => p && !isNaN(p[0]) && !isNaN(p[1]));

    if (validPoints.length === 0) return '';

    let path = isHole ? ' M' : 'M';
    validPoints.forEach((point, i) => {
      if (i === 0) {
        path += `${point[0].toFixed(2)},${point[1].toFixed(2)}`;
      } else {
        path += `L${point[0].toFixed(2)},${point[1].toFixed(2)}`;
      }
    });
    path += 'Z';
    return path;
  };

  // Generate path based on geometry type
  const generatePath = () => {
    const geom = county.geometry;
    let path = '';

    if (geom.type === 'Polygon') {
      // Single polygon (may have holes)
      (geom.coordinates as unknown as [number, number][][]).forEach((ring, i: number) => {
        path += coordinatesToPath(ring, i > 0);
      });
    } else if (geom.type === 'MultiPolygon') {
      // Multiple polygons (like islands)
      (geom.coordinates as unknown as [number, number][][][]).forEach((polygon) => {
        polygon.forEach((ring, i: number) => {
          path += coordinatesToPath(ring, i > 0);
        });
      });
    }

    return path;
  };

  const path = generatePath();

  // Debug: Log if path is empty for troubleshooting
  if (!path && county.properties.NAME) {
    mapLogger.warn(`Empty path for county: ${county.properties.NAME}`);
  }

  // Calculate centroid for label
  const calculateCentroid = () => {
    const geom = county.geometry;
    let totalX = 0,
      totalY = 0,
      count = 0;

    const processCoords = (coords: [number, number][]) => {
      coords.forEach((coord) => {
        const point = projection(coord);
        if (point) {
          totalX += point[0];
          totalY += point[1];
          count++;
        }
      });
    };

    if (geom.type === 'Polygon') {
      processCoords((geom.coordinates as unknown as [number, number][][])[0]);
    } else if (geom.type === 'MultiPolygon') {
      (geom.coordinates as unknown as [number, number][][][]).forEach((polygon) => {
        processCoords(polygon[0]);
      });
    }

    return count > 0 ? [totalX / count, totalY / count] : [0, 0];
  };

  const centroid = calculateCentroid();

  return (
    <g ref={setNodeRef as (node: SVGGElement | null) => void}>
      <path
        d={path}
        fill={fillColor}
        stroke={STROKE_COLORS.DEFAULT}
        strokeWidth={GAME_CONFIG.STROKE_WIDTH_DEFAULT}
        className="transition-all duration-200"
        style={{ cursor: isPlaced ? 'default' : 'pointer' }}
      />
      {isPlaced && (
        <text
          x={centroid[0]}
          y={centroid[1]}
          textAnchor="middle"
          fontSize={UI_CONFIG.FONT_SIZE_SMALL}
          fill={textColor}
          fontWeight="bold"
          pointerEvents="none"
          style={{
            textShadow:
              textColor === '#ffffff'
                ? '1px 1px 2px rgba(0,0,0,0.7)'
                : '1px 1px 2px rgba(255,255,255,0.7)',
          }}
        >
          {county.properties.NAME}
        </text>
      )}
    </g>
  );
}

export default function CaliforniaMapFixed({ isDragging }: { isDragging: boolean }) {
  const [geoData, setGeoData] = useState<Record<string, unknown> | null>(null);
  const [projection, setProjection] = useState<
    ((coord: [number, number]) => [number, number]) | null
  >(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Load the GeoJSON data (use different path for dev vs production)
    const basePath =
      window.location.hostname === 'localhost'
        ? '/data/geo/ca-counties-medium.geojson'
        : '/california_puzzle_game/data/geo/ca-counties-medium.geojson';

    fetch(basePath)
      .then((response) => response.json())
      .then((data) => {
        setGeoData(data);

        // Create California-optimized projection
        const width = GAME_CONFIG.MAP_WIDTH;
        const height = GAME_CONFIG.MAP_HEIGHT;

        // Manual projection function for California
        const californiaProjection = (coord: [number, number]): [number, number] => {
          // California bounds from constants
          const [lon, lat] = coord;

          // Simple linear transformation
          const x =
            ((lon - UI_CONFIG.CA_LON_MIN) / UI_CONFIG.CA_LON_RANGE) *
              width *
              UI_CONFIG.CA_MAP_PADDING +
            width * UI_CONFIG.CA_MAP_OFFSET;
          const y =
            ((UI_CONFIG.CA_LAT_MAX - lat) / UI_CONFIG.CA_LAT_RANGE) *
              height *
              UI_CONFIG.CA_MAP_PADDING +
            height * UI_CONFIG.CA_MAP_OFFSET;

          return [x, y];
        };

        setProjection(() => californiaProjection);
      })
      .catch((error) => {
        mapLogger.error('Error loading GeoJSON:', error);
      });
  }, []);

  // Show ALL counties from the GeoJSON (we have all 58 counties now)
  // No filtering needed since our game includes all California counties
  // const filteredFeatures = geoData?.features || []; // Using geoData.features directly

  if (!geoData || !projection) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500 animate-pulse">Loading California map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <svg
        ref={svgRef}
        viewBox={GAME_CONFIG.MAP_VIEW_BOX}
        className="w-full h-full"
        style={{ maxHeight: '100%', maxWidth: '100%' }}
      >
        {/* Background */}
        <defs>
          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#oceanGradient)" />

        {/* Title */}
        <text
          x={GAME_CONFIG.MAP_WIDTH / 2}
          y="30"
          textAnchor="middle"
          fontSize={UI_CONFIG.FONT_SIZE_LARGE}
          fontWeight="bold"
          fill="#1e3a8a"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          California Counties Puzzle
        </text>

        {/* Instructions */}
        {isDragging && (
          <text
            x={GAME_CONFIG.MAP_WIDTH / 2}
            y="55"
            textAnchor="middle"
            fontSize={UI_CONFIG.FONT_SIZE_MEDIUM}
            fill="#6b7280"
            className="animate-pulse"
          >
            Drop the county on its correct location
          </text>
        )}

        {/* All California counties - show them all since we have all 58 counties */}
        <g>
          {geoData.features && Array.isArray(geoData.features)
            ? geoData.features.map((feature: CountyFeature, idx: number) => (
                <CountyDropZone
                  key={feature.properties.NAME || `county-${idx}`}
                  county={feature}
                  projection={projection as (coord: [number, number]) => [number, number]}
                />
              ))
            : null}
        </g>

        {/* Legend */}
        <g transform="translate(20, 520)">
          <rect
            x="0"
            y="0"
            width="15"
            height="15"
            fill="#e5e7eb"
            stroke="#374151"
            strokeWidth="0.5"
          />
          <text x="20" y="12" fontSize="12" fill="#4b5563">
            Available
          </text>

          <rect x="0" y="20" width="15" height="15" fill="#10b981" />
          <text x="20" y="32" fontSize="12" fill="#4b5563">
            Placed
          </text>

          <rect x="0" y="40" width="15" height="15" fill="#fef3c7" />
          <text x="20" y="52" fontSize="12" fill="#4b5563">
            Selected
          </text>
        </g>
      </svg>
    </div>
  );
}
