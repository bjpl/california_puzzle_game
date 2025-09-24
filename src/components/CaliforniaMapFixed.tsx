import { useEffect, useState, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useGame } from '../context/GameContext';
import { getSvgTextFill } from '../utils/colorContrast';

interface CountyFeature {
  type: string;
  properties: {
    NAME: string;
    COUNTYFP: string;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
}

interface CountyDropZoneProps {
  county: CountyFeature;
  projection: any;
}

function CountyDropZone({ county, projection }: CountyDropZoneProps) {
  const { placedCounties, currentCounty } = useGame();
  // Ensure consistent ID formatting between drag source and drop target
  const countyName = county.properties.NAME;
  const countyId = countyName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
  const isPlaced = placedCounties.has(countyId);

  const { isOver, setNodeRef } = useDroppable({
    id: countyId,
  });

  const isActive = currentCounty?.id === countyId;
  const isCorrectHover = isOver && currentCounty?.id === countyId;
  const isWrongHover = isOver && currentCounty?.id !== countyId;

  let fillColor = '#e5e7eb'; // Default gray
  if (isPlaced) fillColor = '#10b981'; // Green when placed
  else if (isCorrectHover) fillColor = '#86efac'; // Light green on correct hover
  else if (isWrongHover) fillColor = '#fca5a5'; // Light red on wrong hover
  else if (isActive) fillColor = '#fef3c7'; // Yellow when active

  // Calculate optimal text color based on background
  const textColor = getSvgTextFill(fillColor);

  // Convert coordinates to path
  const coordinatesToPath = (coords: any[], isHole = false): string => {
    if (!coords || coords.length === 0) return '';

    const points = coords.map(coord => projection(coord));
    const validPoints = points.filter(p => p && !isNaN(p[0]) && !isNaN(p[1]));

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
      geom.coordinates.forEach((ring, i) => {
        path += coordinatesToPath(ring, i > 0);
      });
    } else if (geom.type === 'MultiPolygon') {
      // Multiple polygons (like islands)
      geom.coordinates.forEach((polygon) => {
        polygon.forEach((ring, i) => {
          path += coordinatesToPath(ring, i > 0);
        });
      });
    }

    return path;
  };

  const path = generatePath();

  // Debug: Log if path is empty for troubleshooting
  if (!path && county.properties.NAME) {
    console.warn(`Empty path for county: ${county.properties.NAME}`);
  }

  // Calculate centroid for label
  const calculateCentroid = () => {
    const geom = county.geometry;
    let totalX = 0, totalY = 0, count = 0;

    const processCoords = (coords: any[]) => {
      coords.forEach(coord => {
        const point = projection(coord);
        if (point) {
          totalX += point[0];
          totalY += point[1];
          count++;
        }
      });
    };

    if (geom.type === 'Polygon') {
      processCoords(geom.coordinates[0]);
    } else if (geom.type === 'MultiPolygon') {
      geom.coordinates.forEach((polygon) => {
        processCoords(polygon[0]);
      });
    }

    return count > 0 ? [totalX / count, totalY / count] : [0, 0];
  };

  const centroid = calculateCentroid();

  return (
    <g ref={setNodeRef}>
      <path
        d={path}
        fill={fillColor}
        stroke="#374151"
        strokeWidth="0.5"
        className="transition-all duration-200"
        style={{ cursor: isPlaced ? 'default' : 'pointer' }}
      />
      {isPlaced && (
        <text
          x={centroid[0]}
          y={centroid[1]}
          textAnchor="middle"
          fontSize="10"
          fill={textColor}
          fontWeight="bold"
          pointerEvents="none"
          style={{
            textShadow: textColor === '#ffffff' ? '1px 1px 2px rgba(0,0,0,0.7)' : '1px 1px 2px rgba(255,255,255,0.7)',
          }}
        >
          {county.properties.NAME}
        </text>
      )}
    </g>
  );
}

export default function CaliforniaMapFixed({ isDragging }: { isDragging: boolean }) {
  const [geoData, setGeoData] = useState<any>(null);
  const [projection, setProjection] = useState<any>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { counties } = useGame();

  useEffect(() => {
    // Load the GeoJSON data (use different path for dev vs production)
    const basePath = window.location.hostname === 'localhost'
      ? '/data/geo/ca-counties-medium.geojson'
      : '/california_puzzle_game/data/geo/ca-counties-medium.geojson';

    console.log('Loading GeoJSON from:', basePath);

    fetch(basePath)
      .then(response => response.json())
      .then(data => {
        console.log('GeoJSON loaded, features count:', data?.features?.length);
        setGeoData(data);

        // Create California-optimized projection
        const width = 800;
        const height = 600;

        // Manual projection function for California
        const californiaProjection = (coord: [number, number]): [number, number] => {
          // California bounds approximately:
          // Longitude: -124.5 to -114
          // Latitude: 32.5 to 42
          const [lon, lat] = coord;

          // Simple linear transformation
          const x = ((lon + 124.5) / 10.5) * width * 0.8 + width * 0.1;
          const y = ((42 - lat) / 9.5) * height * 0.8 + height * 0.1;

          return [x, y];
        };

        setProjection(() => californiaProjection);
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
      });
  }, []);

  // Show ALL counties from the GeoJSON (we have all 58 counties now)
  // No filtering needed since our game includes all California counties
  const filteredFeatures = geoData?.features || [];

  console.log('Map render - counties in game:', counties.length);
  console.log('Map render - features to display:', filteredFeatures.length);

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
        viewBox="0 0 800 600"
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
          x="400"
          y="30"
          textAnchor="middle"
          fontSize="24"
          fontWeight="bold"
          fill="#1e3a8a"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          California Counties Puzzle
        </text>

        {/* Instructions */}
        {isDragging && (
          <text
            x="400"
            y="55"
            textAnchor="middle"
            fontSize="14"
            fill="#6b7280"
            className="animate-pulse"
          >
            Drop the county on its correct location
          </text>
        )}

        {/* All California counties - show them all since we have all 58 counties */}
        <g>
          {geoData.features.map((feature: CountyFeature, idx: number) => (
            <CountyDropZone
              key={feature.properties.NAME || `county-${idx}`}
              county={feature}
              projection={projection}
            />
          ))}
        </g>

        {/* Legend */}
        <g transform="translate(20, 520)">
          <rect x="0" y="0" width="15" height="15" fill="#e5e7eb" stroke="#374151" strokeWidth="0.5" />
          <text x="20" y="12" fontSize="12" fill="#4b5563">Available</text>

          <rect x="0" y="20" width="15" height="15" fill="#10b981" />
          <text x="20" y="32" fontSize="12" fill="#4b5563">Placed</text>

          <rect x="0" y="40" width="15" height="15" fill="#fef3c7" />
          <text x="20" y="52" fontSize="12" fill="#4b5563">Selected</text>
        </g>
      </svg>
    </div>
  );
}