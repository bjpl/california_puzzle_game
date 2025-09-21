import { useEffect, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useGame } from '../context/GameContext';

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

function CountyDropZone({ county, bounds }: { county: CountyFeature; bounds: any }) {
  const { placedCounties, currentCounty } = useGame();
  const countyName = county.properties.NAME;
  const countyId = countyName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
  const isPlaced = placedCounties.has(countyId);

  const { isOver, setNodeRef } = useDroppable({
    id: countyId,
  });

  // Don't give visual hints about which county is correct!
  // Only show green when placed, gray otherwise
  let fillColor = '#e5e7eb'; // Default gray
  if (isPlaced) fillColor = '#10b981'; // Green when placed

  // Simple projection that works
  const project = ([lon, lat]: [number, number]): [number, number] => {
    const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * 800;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 600;
    return [x, y];
  };

  // Generate SVG path
  const generatePath = () => {
    const geom = county.geometry;
    let pathData = '';

    const ringToPath = (ring: number[][]) => {
      return ring
        .map((coord, i) => {
          const [x, y] = project([coord[0], coord[1]]);
          return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ') + 'Z';
    };

    if (geom.type === 'Polygon') {
      pathData = geom.coordinates.map((ring: number[][]) => ringToPath(ring)).join(' ');
    } else if (geom.type === 'MultiPolygon') {
      pathData = geom.coordinates
        .map((polygon: number[][][]) =>
          polygon.map((ring: number[][]) => ringToPath(ring)).join(' ')
        )
        .join(' ');
    }

    return pathData;
  };

  const path = generatePath();

  return (
    <g ref={setNodeRef}>
      <path
        d={path}
        fill={fillColor}
        stroke="#374151"
        strokeWidth="0.5"
        className="transition-colors duration-200"
        style={{ cursor: isPlaced ? 'default' : 'pointer' }}
      />
      {isPlaced && (
        <text
          x={400}
          y={300}
          textAnchor="middle"
          fontSize="8"
          fill="white"
          fontWeight="bold"
          pointerEvents="none"
        >
          {countyName}
        </text>
      )}
    </g>
  );
}

export default function CaliforniaMapSimple({ isDragging }: { isDragging: boolean }) {
  const [geoData, setGeoData] = useState<any>(null);
  const [bounds, setBounds] = useState<any>(null);

  useEffect(() => {
    const basePath = window.location.hostname === 'localhost'
      ? '/data/geo/ca-counties-ultra-low.geojson'
      : '/california_puzzle_game/data/geo/ca-counties-ultra-low.geojson';

    fetch(basePath)
      .then(response => response.json())
      .then(data => {
        setGeoData(data);

        // Calculate bounds
        let minLon = Infinity, maxLon = -Infinity;
        let minLat = Infinity, maxLat = -Infinity;

        const processCoords = (coords: any) => {
          if (Array.isArray(coords[0]) && !Array.isArray(coords[0][0])) {
            // Array of coordinates
            coords.forEach((coord: number[]) => {
              minLon = Math.min(minLon, coord[0]);
              maxLon = Math.max(maxLon, coord[0]);
              minLat = Math.min(minLat, coord[1]);
              maxLat = Math.max(maxLat, coord[1]);
            });
          } else {
            // Nested arrays
            coords.forEach((subCoords: any) => processCoords(subCoords));
          }
        };

        data.features.forEach((feature: any) => {
          processCoords(feature.geometry.coordinates);
        });

        setBounds({ minLon, maxLon, minLat, maxLat });
        console.log('Bounds:', { minLon, maxLon, minLat, maxLat });
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
      });
  }, []);

  if (!geoData || !bounds) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500 animate-pulse">Loading California map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Title moved outside SVG as a separate HTML element */}
      <div className="text-center py-2">
        <h3 className="text-lg font-bold text-blue-900">California Counties Puzzle</h3>
        {isDragging && (
          <p className="text-xs text-gray-600 animate-pulse mt-1">
            Drop the county on its correct location
          </p>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full"
          style={{ maxHeight: '100%', maxWidth: '100%' }}
          preserveAspectRatio="xMidYMid meet"
        >
          <rect width="800" height="600" fill="#dbeafe" />

        {/* Render all counties */}
        <g>
          {geoData.features.map((feature: CountyFeature, idx: number) => (
            <CountyDropZone
              key={feature.properties.NAME || `county-${idx}`}
              county={feature}
              bounds={bounds}
            />
          ))}
        </g>

        {/* Legend */}
        <g transform="translate(20, 550)">
          <rect x="0" y="0" width="10" height="10" fill="#e5e7eb" stroke="#374151" strokeWidth="0.5" />
          <text x="15" y="9" fontSize="10" fill="#6b7280">Available</text>

          <rect x="80" y="0" width="10" height="10" fill="#10b981" stroke="#374151" strokeWidth="0.5" />
          <text x="95" y="9" fontSize="10" fill="#6b7280">Placed</text>
        </g>
      </svg>
      </div>
    </div>
  );
}