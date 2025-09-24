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

function CountyDropZone({
  county,
  isDragging,
  renderLabels = true,
  renderShapes = true
}: {
  county: CountyFeature;
  isDragging: boolean;
  renderLabels?: boolean;
  renderShapes?: boolean;
}) {
  const { placedCounties, currentCounty, showRegions, counties } = useGame();
  const countyName = county.properties.NAME;
  const countyId = countyName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
  const isPlaced = placedCounties.has(countyId);

  // Find the region and centroid for this county
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
  let fillColor = '#ffffff'; // Clean white for available counties
  let strokeColor = '#6b7280'; // Medium gray stroke
  let strokeWidth = "0.75";

  if (isPlaced) {
    fillColor = '#10b981'; // Green when placed
    strokeColor = '#047857'; // Darker green stroke
    strokeWidth = "1";
  } else if (isDragging && isOver) {
    fillColor = '#fde68a'; // Softer yellow when hovering over during drag
    strokeColor = '#f59e0b'; // Amber stroke
    strokeWidth = "1.5";
  } else if (showRegions && region) {
    fillColor = regionColors[region] || '#ffffff'; // Show region color if enabled
  }

  // Calculate optimal text color based on background
  const textColor = getSvgTextFill(fillColor);

  // Convert Web Mercator (EPSG:3857) to lat/lon (EPSG:4326)
  const webMercatorToLatLon = (x: number, y: number): [number, number] => {
    const lon = (x / 20037508.34) * 180;
    const lat = (Math.atan(Math.exp((y / 20037508.34) * Math.PI)) * 360 / Math.PI) - 90;
    return [lon, lat];
  };

  // Project coordinates to SVG space
  const project = ([x, y]: [number, number]): [number, number] => {
    // Check if coordinates are in Web Mercator (large values)
    if (Math.abs(x) > 180) {
      // Convert from Web Mercator to lat/lon
      [x, y] = webMercatorToLatLon(x, y);
    }

    // California's approximate bounds in lat/lon
    const caMinLon = -124.5;
    const caMaxLon = -114.0;
    const caMinLat = 32.5;
    const caMaxLat = 42.0;

    // Project to SVG coordinates
    const svgX = ((x - caMinLon) / (caMaxLon - caMinLon)) * 800;
    const svgY = ((caMaxLat - y) / (caMaxLat - caMinLat)) * 600;
    return [svgX, svgY];
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

  // Calculate the label position for the county
  const getLabelPosition = (): [number, number] => {
    // If we have predefined centroid data, use it
    if (countyData?.centroid) {
      return project([countyData.centroid[0], countyData.centroid[1]]);
    }

    // Otherwise, calculate approximate centroid from geometry
    const geom = county.geometry;
    let sumX = 0, sumY = 0, count = 0;

    const processRing = (ring: number[][]) => {
      ring.forEach(coord => {
        const [x, y] = project([coord[0], coord[1]]);
        sumX += x;
        sumY += y;
        count++;
      });
    };

    if (geom.type === 'Polygon') {
      processRing(geom.coordinates[0]);
    } else if (geom.type === 'MultiPolygon') {
      geom.coordinates.forEach((polygon: number[][][]) => {
        processRing(polygon[0]);
      });
    }

    // Return average position (approximate centroid)
    return count > 0 ? [sumX / count, sumY / count] : [400, 300];
  };

  const [labelX, labelY] = isPlaced ? getLabelPosition() : [0, 0];

  return (
    <g ref={renderShapes ? setNodeRef : undefined}>
      {/* Conditionally render county shape */}
      {renderShapes && (
        <path
          d={path}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={isDragging && isOver ? "1.5" : strokeWidth}
          className="transition-all duration-200 hover:opacity-90"
          style={{
            cursor: isPlaced ? 'default' : 'pointer',
            filter: isDragging && isOver ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' : isPlaced ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' : 'none',
            opacity: 1
          }}
        />
      )}

      {/* Conditionally render county label */}
      {renderLabels && isPlaced && (
        <g className="county-label-group">
          {/* Background rectangle for better text visibility */}
          <rect
            x={labelX - (countyName.length * 4)}
            y={labelY - 8}
            width={countyName.length * 8}
            height={16}
            fill="rgba(255, 255, 255, 0.8)"
            stroke="rgba(0, 0, 0, 0.2)"
            strokeWidth="0.5"
            rx="3"
            pointerEvents="none"
          />
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill={textColor}
            fontWeight="bold"
            pointerEvents="none"
            style={{
              textShadow: textColor === '#ffffff' ? '1px 1px 2px rgba(0,0,0,0.9)' : '1px 1px 2px rgba(255,255,255,0.9)'
            }}
          >
            {countyName}
          </text>
        </g>
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
        // We use fixed California bounds in the projection function,
        // so we don't need to calculate them from the data
        setBounds({ loaded: true });
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
    <div className="w-full h-full bg-white relative flex items-center justify-center">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setZoom(Math.min(zoom + 0.25, 3))}
          className="bg-white/90 backdrop-blur hover:bg-white text-gray-700 w-8 h-8 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          title="Zoom In"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
          </svg>
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}
          className="bg-white/90 backdrop-blur hover:bg-white text-gray-700 w-8 h-8 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          title="Zoom Out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
        <button
          onClick={resetView}
          className="bg-white/90 backdrop-blur hover:bg-white text-gray-700 w-8 h-8 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          title="Reset View"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Only show drag instruction when dragging */}
      {isDragging && (
        <div className="absolute top-4 left-0 right-0 z-10 text-center pointer-events-none">
          <div className="inline-block bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg">
            <p className="text-sm text-gray-700 font-medium">
              Drop on the correct location
            </p>
          </div>
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
          <filter id="mapShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1"/>
          </filter>
        </defs>

        {/* Apply zoom and pan transformation - zoom from center */}
        <g transform={`translate(${400 * (1 - zoom) / 2 + pan.x * zoom}, ${300 * (1 - zoom) / 2 + pan.y * zoom}) scale(${zoom})`}>

        {/* Render all county shapes first */}
        <g className="county-shapes">
          {geoData.features.map((feature: CountyFeature, idx: number) => (
            <CountyDropZone
              key={feature.properties.NAME || `county-${idx}`}
              county={feature}
              isDragging={isDragging}
              renderLabels={false}
            />
          ))}
        </g>

        {/* Render all county labels on top */}
        <g className="county-labels">
          {geoData.features.map((feature: CountyFeature, idx: number) => (
            <CountyDropZone
              key={`label-${feature.properties.NAME || idx}`}
              county={feature}
              isDragging={isDragging}
              renderLabels={true}
              renderShapes={false}
            />
          ))}
        </g>

        </g>
        {/* End of zoom/pan group */}
      </svg>
    </div>
  );
}