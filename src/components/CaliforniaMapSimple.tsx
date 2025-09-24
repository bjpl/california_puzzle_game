import { useEffect, useState, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useGame } from '../context/GameContext';
import { getSvgTextFill } from '../utils/colorContrast';
import CountyDetailsModal from './CountyDetailsModal';
import { saveGameState, generateStudyModeUrl } from '../utils/gameStateManager';
import '../styles/educational-design.css';

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

function CountyDropZone({ county, isDragging, onCountyClick }: {
  county: CountyFeature;
  isDragging: boolean;
  onCountyClick?: (county: any) => void;
}) {
  const { placedCounties, currentCounty, showRegions, counties } = useGame();
  const [isHovered, setIsHovered] = useState(false);
  const countyName = county.properties.NAME;
  const countyId = countyName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
  const isPlaced = placedCounties.has(countyId);

  // Find the region and centroid for this county
  const countyData = counties.find(c => c.id === countyId);
  const region = countyData?.region || '';

  const { isOver, setNodeRef } = useDroppable({
    id: countyId,
  });

  // Region colors mapping - Educational, California-authentic colors
  const regionColors: { [key: string]: string } = {
    'Southern California': '#f5d5ae', // Warm sand
    'Bay Area': '#b8d4e3', // Soft bay blue
    'Central Valley': '#d4d4aa', // Farmland green
    'Central Coast': '#c8b8d4', // Coastal purple
    'Northern California': '#e6c2a6', // Redwood brown
    'Sierra Nevada': '#e3d5a7', // Mountain gold
    'North Coast': '#a8c8b8', // Forest green
  };

  // Determine fill color based on state and regions - using educational colors
  let fillColor = '#fefefe'; // Paper white for available counties
  let strokeColor = '#8c8c8c'; // Granite gray stroke
  let strokeWidth = "0.75";

  if (isPlaced) {
    fillColor = '#e6d5b8'; // CA sand color when placed
    strokeColor = '#1e3a5f'; // CA navy stroke
    strokeWidth = "1.5";
  } else if (isDragging && isOver) {
    fillColor = '#daa520'; // CA gold when hovering over during drag
    strokeColor = '#2d5016'; // CA forest stroke
    strokeWidth = "2";
  } else if (showRegions && region) {
    fillColor = regionColors[region] || '#fefefe'; // Show region color if enabled
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

  const [labelX, labelY] = (isPlaced && isHovered) ? getLabelPosition() : [0, 0];

  const handleClick = () => {
    if (isPlaced && onCountyClick && countyData) {
      onCountyClick(countyData);
    }
  };

  return (
    <g ref={setNodeRef}>
      <path
        d={path}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={isDragging && isOver ? "1.5" : strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        className="transition-all duration-200 hover:opacity-90"
        style={{
          cursor: isPlaced ? 'pointer' : 'pointer',
          filter: isDragging && isOver ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' : isPlaced ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' : 'none',
          opacity: 1
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      />
      {/* Hover label for placed counties */}
      {isPlaced && isHovered && (
        <g className="county-hover-label">
          <rect
            className="county-label-bg"
            x={labelX - (countyName.length * 4)}
            y={labelY - 8}
            width={countyName.length * 8}
            height={16}
            pointerEvents="none"
          />
          <text
            className="county-label"
            x={labelX}
            y={labelY}
            fontSize="12"
            fontWeight="600"
            pointerEvents="none"
          >
            {countyName}
          </text>
        </g>
      )}
    </g>
  );
}

export default function CaliforniaMapSimple({ isDragging }: { isDragging: boolean }) {
  const gameContext = useGame();
  const { showRegions, placedCounties, counties, score, timerState, mistakes, gameSettings, placementHistory } = gameContext;
  const [selectedCounty, setSelectedCounty] = useState<any>(null);
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
      ? '/data/geo/ca-counties-medium.geojson'
      : '/california_puzzle_game/data/geo/ca-counties-medium.geojson';

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
    <div className="w-full h-full relative flex items-center justify-center" style={{ backgroundColor: '#fefefe' }}>
      {/* Zoom Controls - Clean educational styling */}
      <div className="map-controls">
        <button
          onClick={() => setZoom(Math.min(zoom + 0.25, 3))}
          className="map-control-btn"
          title="Zoom In"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
          </svg>
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}
          className="map-control-btn"
          title="Zoom Out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
        <button
          onClick={resetView}
          className="map-control-btn"
          title="Reset View"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Only show drag instruction when dragging - Clean educational styling */}
      {isDragging && (
        <div className="instruction-banner">
          <p className="instruction-text">
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
          <filter id="mapShadow">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.05"/>
          </filter>
          {/* Clean educational background pattern */}
          <pattern id="educationalPattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <rect width="20" height="20" fill="#fefefe"/>
            <circle cx="10" cy="10" r="0.3" fill="#8c8c8c" opacity="0.1"/>
          </pattern>
        </defs>

        {/* Clean educational background */}
        <rect width="800" height="600" fill="#fefefe" />

        {/* Apply zoom and pan transformation - zoom from center */}
        <g transform={`translate(${400 * (1 - zoom) / 2 + pan.x * zoom}, ${300 * (1 - zoom) / 2 + pan.y * zoom}) scale(${zoom})`}>

        {/* Render all county shapes with hover labels and click handlers */}
        <g className="county-shapes">
          {geoData.features.map((feature: CountyFeature, idx: number) => (
            <CountyDropZone
              key={feature.properties.NAME || `county-${idx}`}
              county={feature}
              isDragging={isDragging}
              onCountyClick={(county) => setSelectedCounty(county)}
            />
          ))}
        </g>

        </g>
        {/* End of zoom/pan group */}
      </svg>

      {/* County Details Modal */}
      <CountyDetailsModal
        isOpen={!!selectedCounty}
        onClose={() => setSelectedCounty(null)}
        county={selectedCounty}
        onViewEducationalContent={() => {
          // Only save game state if there's actual progress (placed counties)
          const hasProgress = placedCounties.size > 0;

          if (hasProgress) {
            // Save current game state before navigating
            const success = saveGameState({
              placedCounties: Array.from(placedCounties),
              score,
              mistakes,
              timerState,
              gameSettings,
              placementHistory,
              currentCountyId: selectedCounty?.id
            });

            if (!success) {
              console.warn('Failed to save game state');
            }
          }

          // Navigate to study mode with appropriate context
          const studyModeUrl = generateStudyModeUrl(selectedCounty?.id || '', hasProgress);
          window.location.href = studyModeUrl;
        }}
      />
    </div>
  );
}