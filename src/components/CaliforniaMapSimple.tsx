import { useEffect, useState, useRef } from 'react';
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

function CountyDropZone({ county, bounds, isDragging }: { county: CountyFeature; bounds: any; isDragging: boolean }) {
  const { placedCounties, currentCounty, showRegions, counties } = useGame();
  const countyName = county.properties.NAME;
  const countyId = countyName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
  const isPlaced = placedCounties.has(countyId);

  // Find the region for this county
  const countyData = counties.find(c => c.id === countyId);
  const region = countyData?.region || '';

  const { isOver, setNodeRef } = useDroppable({
    id: countyId,
  });

  // Region colors mapping
  const regionColors: { [key: string]: string } = {
    'Southern California': '#fca5a5', // Light red
    'Bay Area': '#93c5fd', // Light blue
    'Central Valley': '#86efac', // Light green
    'Central Coast': '#c4b5fd', // Light purple
    'Northern California': '#fdba74', // Light orange
    'Sierra Nevada': '#fde047', // Light yellow
    'North Coast': '#5eead4', // Light teal
  };

  // Determine fill color based on state and regions
  let fillColor = '#e5e7eb'; // Default gray (available)
  let strokeColor = '#374151'; // Default stroke
  let strokeWidth = "0.5";

  if (isPlaced) {
    fillColor = '#10b981'; // Green when placed
  } else if (isDragging && isOver) {
    fillColor = '#fbbf24'; // Yellow/amber when hovering over during drag (target state)
  } else if (showRegions && region) {
    fillColor = regionColors[region] || '#e5e7eb'; // Show region color if enabled
  }

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
        stroke={strokeColor}
        strokeWidth={isDragging && isOver ? "1" : strokeWidth}
        className="transition-all duration-200"
        style={{
          cursor: isPlaced ? 'default' : 'pointer',
          filter: isDragging && isOver ? 'brightness(1.1)' : 'none',
          opacity: 1
        }}
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
  const { showRegions } = useGame();
  const [geoData, setGeoData] = useState<any>(null);
  const [bounds, setBounds] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });
  const startMouse = useRef({ x: 0, y: 0 });

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

  // Handle mouse wheel for zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(0.5, zoom + delta), 3);
    setZoom(newZoom);
  };

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 0 && !isDragging) { // Left click when not dragging counties
      const svg = svgRef.current;
      if (!svg) return;

      e.preventDefault();
      isPanning.current = true;
      startMouse.current = { x: e.clientX, y: e.clientY };
      startPan.current = { x: pan.x, y: pan.y };

      // Change cursor to grabbing
      svg.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning.current && !isDragging) {
      e.preventDefault();

      // Calculate the difference from the starting mouse position
      const dx = (e.clientX - startMouse.current.x) / zoom;
      const dy = (e.clientY - startMouse.current.y) / zoom;

      // Apply the pan offset
      setPan({
        x: startPan.current.x + dx,
        y: startPan.current.y + dy
      });
    }
  };

  const handleMouseUp = () => {
    if (isPanning.current) {
      isPanning.current = false;
      const svg = svgRef.current;
      if (svg) {
        svg.style.cursor = isDragging ? 'default' : 'grab';
      }
    }
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-sky-50 via-blue-50 to-blue-100 relative flex items-center justify-center">
      {/* Zoom Controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <button
          onClick={() => setZoom(Math.min(zoom + 0.25, 3))}
          className="bg-white hover:bg-gray-100 text-gray-700 p-1 rounded shadow-md text-xs"
          title="Zoom In"
        >
          ➕
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}
          className="bg-white hover:bg-gray-100 text-gray-700 p-1 rounded shadow-md text-xs"
          title="Zoom Out"
        >
          ➖
        </button>
        <button
          onClick={resetView}
          className="bg-white hover:bg-gray-100 text-gray-700 p-1 rounded shadow-md text-xs"
          title="Reset View"
        >
          🔄
        </button>
      </div>

      {/* Only show drag instruction when dragging */}
      {isDragging && (
        <div className="absolute top-2 left-0 right-0 z-10 text-center">
          <p className="text-xs text-gray-600 animate-pulse">
            Drop the county on its correct location
          </p>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        className="w-full h-full"
        style={{
          maxHeight: '100%',
          maxWidth: '100%',
          cursor: isDragging ? 'default' : (isPanning.current ? 'grabbing' : 'grab')
        }}
        preserveAspectRatio="xMidYMid meet"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <linearGradient id="mapBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f9ff" />
            <stop offset="50%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#mapBg)" />

        {/* Apply zoom and pan transformation - zoom from center */}
        <g transform={`translate(${400 * (1 - zoom) / 2 + pan.x * zoom}, ${300 * (1 - zoom) / 2 + pan.y * zoom}) scale(${zoom})`}>

        {/* Render all counties */}
        <g>
          {geoData.features.map((feature: CountyFeature, idx: number) => (
            <CountyDropZone
              key={feature.properties.NAME || `county-${idx}`}
              county={feature}
              bounds={bounds}
              isDragging={isDragging}
            />
          ))}
        </g>

        </g>
        {/* End of zoom/pan group */}

        {/* Legend (outside of zoom/pan) */}
        <g transform="translate(20, 550)">
          {!showRegions ? (
            <>
              <rect x="0" y="0" width="10" height="10" fill="#e5e7eb" stroke="#374151" strokeWidth="0.5" />
              <text x="15" y="9" fontSize="10" fill="#6b7280">Available</text>

              <rect x="80" y="0" width="10" height="10" fill="#fbbf24" stroke="#374151" strokeWidth="0.5" />
              <text x="95" y="9" fontSize="10" fill="#6b7280">Target</text>

              <rect x="140" y="0" width="10" height="10" fill="#10b981" stroke="#374151" strokeWidth="0.5" />
              <text x="155" y="9" fontSize="10" fill="#6b7280">Placed</text>

              <rect x="210" y="0" width="10" height="10" fill="#3b82f6" stroke="#374151" strokeWidth="0.5" />
              <text x="225" y="9" fontSize="10" fill="#6b7280">Hint</text>
            </>
          ) : (
            <>
              <text x="0" y="9" fontSize="10" fill="#6b7280" fontWeight="bold">Regions:</text>
              <rect x="60" y="0" width="10" height="10" fill="#fca5a5" stroke="#374151" strokeWidth="0.5" />
              <text x="75" y="9" fontSize="9" fill="#6b7280">Southern</text>

              <rect x="120" y="0" width="10" height="10" fill="#93c5fd" stroke="#374151" strokeWidth="0.5" />
              <text x="135" y="9" fontSize="9" fill="#6b7280">Bay</text>

              <rect x="160" y="0" width="10" height="10" fill="#86efac" stroke="#374151" strokeWidth="0.5" />
              <text x="175" y="9" fontSize="9" fill="#6b7280">Valley</text>

              <rect x="210" y="0" width="10" height="10" fill="#c4b5fd" stroke="#374151" strokeWidth="0.5" />
              <text x="225" y="9" fontSize="9" fill="#6b7280">Coast</text>

              <rect x="260" y="0" width="10" height="10" fill="#fdba74" stroke="#374151" strokeWidth="0.5" />
              <text x="275" y="9" fontSize="9" fill="#6b7280">North</text>

              <rect x="310" y="0" width="10" height="10" fill="#fde047" stroke="#374151" strokeWidth="0.5" />
              <text x="325" y="9" fontSize="9" fill="#6b7280">Sierra</text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}