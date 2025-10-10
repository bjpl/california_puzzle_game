import React, { useEffect, useState, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useGame } from '../../context/GameContext';
import { mapLogger } from '../../utils/logger';
import { getSvgTextFill } from '../../utils/colorContrast';
import CountyDetailsModal from '../county/CountyDetailsModal';
import EnhancedStudyMode from '../study/EnhancedStudyMode';
import { CALIFORNIA_COUNTIES } from '../../utils/californiaData';
import { getRegionHexColor } from '../../config/regionColors';
import '../../styles/educational-design.css';

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

function CountyDropZone({
  county,
  isDragging,
  onCountyClick,
  onCountyHover,
  onCountyLeave,
  onLabelPosition,
}: {
  county: CountyFeature;
  isDragging: boolean;
  onCountyClick?: (county: Record<string, unknown>) => void;
  onCountyHover?: (countyId: string) => void;
  onCountyLeave?: () => void;
  onLabelPosition?: (countyId: string, position: [number, number]) => void;
}) {
  const { placedCounties, currentCounty: _currentCounty, showRegions, counties } = useGame();
  const [isHovered, setIsHovered] = useState(false);
  const countyName = county.properties.NAME;
  const countyId = countyName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
  const isPlaced = placedCounties.has(countyId);

  // Find the region and centroid for this county
  const countyData = counties.find((c) => c.id === countyId);
  const region = countyData?.region || '';

  const { isOver, setNodeRef } = useDroppable({
    id: countyId,
    data: {
      accepts: ['county'], // Only accept county droppables
    },
  });

  // Use centralized color configuration for consistency

  // Determine fill color based on state and regions
  let fillColor = showRegions && region ? getRegionHexColor(region) : '#f3f4f6'; // Light gray instead of white
  let strokeColor = '#d1d5db'; // Gray stroke for visibility
  let strokeWidth = '1.5';
  let fillOpacity = 1; // Full opacity for visibility

  if (isPlaced) {
    fillColor = '#10b981'; // Green when placed
    strokeColor = '#047857'; // Darker green stroke
    strokeWidth = '2.5';
    fillOpacity = 1;
  } else if (isDragging && isOver) {
    fillColor = '#fef3c7'; // Light yellow fill when hovering during drag
    strokeColor = '#ea580c'; // BRIGHT ORANGE stroke - very visible
    strokeWidth = '4'; // Extra thick for maximum visibility
    fillOpacity = 0.8; // Semi-transparent so you can see through
  } else if (isHovered) {
    fillOpacity = 1;
    strokeColor = '#d1d5db'; // Keep default gray
    strokeWidth = '1.5';
  }

  // Calculate optimal text color based on background
  const _textColor = getSvgTextFill(fillColor);

  // Convert Web Mercator (EPSG:3857) to lat/lon (EPSG:4326)
  const webMercatorToLatLon = (x: number, y: number): [number, number] => {
    const lon = (x / 20037508.34) * 180;
    const lat = (Math.atan(Math.exp((y / 20037508.34) * Math.PI)) * 360) / Math.PI - 90;
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
      return (
        ring
          .map((coord, i) => {
            const [x, y] = project([coord[0], coord[1]]);
            return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(' ') + 'Z'
      );
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
    // First try to find centroid data from the californiaData
    const californiaCountyData = CALIFORNIA_COUNTIES.find((c) => c.id === countyId);
    if (californiaCountyData?.centroid) {
      return project([californiaCountyData.centroid[0], californiaCountyData.centroid[1]]);
    }

    // If we have predefined centroid data in game context, use it
    if (countyData?.centroid) {
      return project([countyData.centroid[0], countyData.centroid[1]]);
    }

    // Otherwise, calculate approximate centroid from geometry
    const geom = county.geometry;
    let sumX = 0,
      sumY = 0,
      count = 0;

    const processRing = (ring: number[][]) => {
      ring.forEach((coord) => {
        if (coord.length >= 2) {
          const [x, y] = project([coord[0], coord[1]]);
          // Only add valid projected coordinates
          if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
            sumX += x;
            sumY += y;
            count++;
          }
        }
      });
    };

    try {
      if (geom.type === 'Polygon') {
        if (geom.coordinates && geom.coordinates.length > 0) {
          processRing(geom.coordinates[0]);
        }
      } else if (geom.type === 'MultiPolygon') {
        if (geom.coordinates && geom.coordinates.length > 0) {
          geom.coordinates.forEach((polygon: number[][][]) => {
            if (polygon && polygon.length > 0) {
              processRing(polygon[0]);
            }
          });
        }
      }
    } catch (error) {
      mapLogger.warn(`Error calculating centroid for ${countyName}:`, error);
    }

    // Return average position (approximate centroid) if we have valid data
    if (count > 0) {
      const centroidX = sumX / count;
      const centroidY = sumY / count;
      return [centroidX, centroidY];
    }

    // Fallback: return map center
    mapLogger.warn(`No valid coordinates found for ${countyName}, using map center`);
    return [400, 300];
  };

  const [labelX, labelY] = getLabelPosition();

  // Store label position for the parent component if this county is placed
  React.useEffect(() => {
    if (isPlaced && onLabelPosition) {
      onLabelPosition(countyId, [labelX, labelY]);
    }
  }, [isPlaced, labelX, labelY, countyId, onLabelPosition]);

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
        fillOpacity={fillOpacity}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        className="county-drop-zone"
        style={{
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          if (isPlaced && onCountyHover) {
            onCountyHover(countyId);
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          if (isPlaced && onCountyLeave) {
            onCountyLeave();
          }
        }}
        onClick={handleClick}
      />
    </g>
  );
}

export default function CaliforniaMapSimple({ isDragging }: { isDragging: boolean }) {
  mapLogger.debug('🗺️ CaliforniaMapSimple component rendering');
  const gameContext = useGame();
  const {
    showRegions,
    placedCounties,
    counties,
    score: _score,
    timerState: _timerState,
    mistakes: _mistakes,
    gameSettings: _gameSettings,
    placementHistory: _placementHistory,
  } = gameContext;
  mapLogger.debug('🎨 showRegions value:', showRegions);
  const [selectedCounty, setSelectedCounty] = useState<Record<string, unknown> | null>(null);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [labelPositions, setLabelPositions] = useState<Map<string, [number, number]>>(new Map());
  const [geoData, setGeoData] = useState<Record<string, unknown> | null>(null);
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });
  const startMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const basePath =
      window.location.hostname === 'localhost'
        ? '/data/geo/ca-counties-medium.geojson'
        : '/california_puzzle_game/data/geo/ca-counties-medium.geojson';

    mapLogger.debug('Attempting to fetch GeoJSON from:', basePath);
    fetch(basePath)
      .then((response) => {
        mapLogger.debug('Fetch response:', response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        mapLogger.debug('GeoJSON loaded successfully, features:', data.features?.length);
        setGeoData(data);
        // We use fixed California bounds in the projection function,
        // so we don't need to calculate them from the data
        setBounds({ loaded: true });
      })
      .catch((error) => {
        mapLogger.error('Error loading GeoJSON:', error);
        mapLogger.error('Failed path was:', basePath);
      });
  }, []);

  if (!geoData || !bounds) {
    mapLogger.debug('⏳ Map loading state - geoData:', !!geoData, 'bounds:', !!bounds);
    return (
      <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-gray-800">
        <div className="text-gray-700 dark:text-gray-300 animate-pulse text-lg font-semibold">
          Loading California map...
        </div>
      </div>
    );
  }

  mapLogger.debug('✅ Map data loaded, rendering', geoData.features?.length, 'counties');

  // Handle mouse wheel for zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(0.5, zoom + delta), 3);
    setZoom(newZoom);
  };

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 0 && !isDragging) {
      // Left click when not dragging counties
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
        y: startPan.current.y + dy,
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
    <div className="w-full h-full relative flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      {/* Zoom Controls - Clean educational styling */}
      <div className="map-controls">
        <button
          onClick={() => setZoom(Math.min(zoom + 0.25, 3))}
          className="map-control-btn focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
          title="Zoom In"
          aria-label="Zoom in on map"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
          </svg>
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}
          className="map-control-btn focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
          title="Zoom Out"
          aria-label="Zoom out on map"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
        <button
          onClick={resetView}
          className="map-control-btn focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
          title="Reset View"
          aria-label="Reset map view to default"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Only show drag instruction when dragging - Clean educational styling */}
      {isDragging && (
        <div className="instruction-banner">
          <p className="instruction-text">Drop the county on its correct location</p>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        className="w-full h-full"
        role="img"
        aria-label="Interactive map of California counties"
        style={{
          maxHeight: '100%',
          maxWidth: '100%',
          display: 'block',
          cursor: isDragging ? 'default' : isPanning.current ? 'grabbing' : 'grab',
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
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.05" />
          </filter>
          {/* Clean educational background pattern */}
          <pattern id="educationalPattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <rect width="20" height="20" fill="#fefefe" />
            <circle cx="10" cy="10" r="0.3" fill="#8c8c8c" opacity="0.1" />
          </pattern>
        </defs>

        {/* Clean educational background */}
        <rect width="800" height="600" fill="#fefefe" />

        {/* Apply zoom and pan transformation - zoom from center */}
        <g
          transform={`translate(${(400 * (1 - zoom)) / 2 + pan.x * zoom}, ${(300 * (1 - zoom)) / 2 + pan.y * zoom}) scale(${zoom})`}
        >
          {/* Render all county shapes with hover labels and click handlers */}
          <g className="county-shapes">
            {geoData.features.map((feature: CountyFeature, idx: number) => (
              <CountyDropZone
                key={feature.properties.NAME || `county-${idx}`}
                county={feature}
                isDragging={isDragging}
                onCountyClick={(county) => setSelectedCounty(county)}
                onCountyHover={(countyId) => setHoveredCounty(countyId)}
                onCountyLeave={() => setHoveredCounty(null)}
                onLabelPosition={(countyId, position) => {
                  setLabelPositions((prev) => new Map(prev.set(countyId, position)));
                }}
              />
            ))}
          </g>

          {/* Render county labels above all shapes for proper layering */}
          <g className="county-labels" style={{ pointerEvents: 'none' }}>
            {Array.from(labelPositions.entries()).map(([countyId, position]) => {
              const shouldShowLabel = hoveredCounty === countyId;
              const isPlaced = placedCounties.has(countyId);

              if (!isPlaced) return null;

              // Find the county name from the countyId
              const countyData = counties.find((c) => c.id === countyId);
              const countyName = countyData?.name || countyId.replace(/-/g, ' ');
              const [labelX, labelY] = position;

              return (
                <g
                  key={`label-${countyId}`}
                  className={`county-hover-label ${shouldShowLabel ? 'visible' : ''}`}
                  style={{ opacity: shouldShowLabel ? 1 : 0 }}
                >
                  <rect
                    className="county-label-bg"
                    x={labelX - countyName.length * 4}
                    y={labelY - 8}
                    width={countyName.length * 8}
                    height={16}
                  />
                  <text
                    className="county-label"
                    x={labelX}
                    y={labelY}
                    fontSize="12"
                    fontWeight="600"
                  >
                    {countyName}
                  </text>
                </g>
              );
            })}
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
          // Keep reference to selected county for Study Mode focus
          // Don't close county modal immediately - Study Mode will handle the focus
          setShowStudyMode(true);
        }}
      />

      {/* Enhanced Study Mode Modal */}
      {showStudyMode && (
        <EnhancedStudyMode
          onClose={() => {
            setShowStudyMode(false);
            setSelectedCounty(null); // Close county modal when Study Mode closes
          }}
          onStartGame={() => {}} // Empty function as it's not needed here
        />
      )}
    </div>
  );
}
