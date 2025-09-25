import React, { useState, useRef } from 'react';
import { realCaliforniaCountyShapes } from '../data/californiaCountyBoundaries';
import { getRegionHexColor, REGION_COLORS } from '../config/regionColors';

interface StudyModeMapProps {
  onCountySelect?: (countyId: string) => void;
  selectedCounty?: any;
  filteredCounties?: any[];
  showAllCounties?: boolean;
}

export default function StudyModeMap({
  onCountySelect,
  selectedCounty,
  filteredCounties,
  showAllCounties = true
}: StudyModeMapProps) {
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });
  const startMouse = useRef({ x: 0, y: 0 });
  const hasPanned = useRef(false);

  // Use centralized color configuration for consistency
  const getRegionColorForMap = (region: string) => {
    return getRegionHexColor(region);
  };

  // Get county display info
  const getCountyInfo = (countyId: string) => {
    return realCaliforniaCountyShapes.find(
      county => county.id === countyId ||
      county.id === countyId.replace(/_/g, '-') ||
      county.id === countyId.replace(/-/g, '_')
    );
  };

  const handleCountyClick = (countyId: string) => {
    if (onCountySelect && !hasPanned.current) {
      onCountySelect(countyId);
    }
  };

  // Handle mouse wheel for zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(0.5, zoom + delta), 3);
    setZoom(newZoom);
  };

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    // Always allow panning, regardless of what element is clicked
    isPanning.current = true;
    startPan.current = { ...pan };
    startMouse.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.style.cursor = 'grabbing';
    e.preventDefault(); // Prevent text selection while dragging
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPanning.current) return;
    const dx = (e.clientX - startMouse.current.x) / zoom;
    const dy = (e.clientY - startMouse.current.y) / zoom;

    // Mark that we've actually panned if movement is significant
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      hasPanned.current = true;
    }

    setPan({
      x: startPan.current.x + dx,
      y: startPan.current.y + dy
    });
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    isPanning.current = false;
    e.currentTarget.style.cursor = 'grab';

    // Reset pan flag after a short delay to allow click handlers to check it
    setTimeout(() => {
      hasPanned.current = false;
    }, 100);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            stroke-opacity: 1;
            stroke-width: 3.5;
          }
          50% {
            stroke-opacity: 0.7;
            stroke-width: 4.5;
          }
        }
      `}</style>
    <div className="relative w-full h-full overflow-hidden">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <button
          onClick={() => setZoom(Math.min(zoom + 0.25, 3))}
          className="w-10 h-10 bg-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center text-gray-700 hover:text-blue-600"
          title="Zoom In"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}
          className="w-10 h-10 bg-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center text-gray-700 hover:text-blue-600"
          title="Zoom Out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
        <button
          onClick={resetView}
          className="w-10 h-10 bg-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center text-gray-700 hover:text-blue-600"
          title="Reset View"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* SVG Map with Real Geographic Boundaries */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 900"
        className="w-full h-full"
        style={{
          maxHeight: '600px',
          cursor: isPanning.current ? 'grabbing' : 'grab'
        }}
        preserveAspectRatio="xMidYMid meet"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Clean white background for study mode */}
        <rect width="800" height="900" fill="#FFFFFF" />

        {/* Apply zoom and pan transformation */}
        <g transform={`translate(${400 * (1 - zoom) / 2 + pan.x * zoom}, ${450 * (1 - zoom) / 2 + pan.y * zoom}) scale(${zoom})`}>

        {/* Real County Geographic Boundaries */}
        {realCaliforniaCountyShapes.map((county) => {
          const isHovered = hoveredCounty === county.id;
          const isSelected = selectedCounty?.id === county.id ||
                           selectedCounty?.id === county.id.replace(/-/g, '_');

          // Check if county should be visible based on filter
          const isFiltered = filteredCounties && !showAllCounties
            ? filteredCounties.some(fc =>
                fc.id === county.id ||
                fc.id === county.id.replace(/-/g, '_') ||
                fc.id === county.id.replace(/_/g, '-')
              )
            : true;

          const fillColor = isFiltered
            ? getRegionColorForMap(county.region)
            : '#E5E7EB'; // Gray color for filtered out counties

          return (
            <g key={county.id}>
              <path
                d={county.path}
                fill={fillColor}
                fillOpacity={
                  !isFiltered ? 0.3 :
                  isSelected ? 0.98 :
                  isHovered ? 0.90 : 0.7
                }
                stroke={
                  !isFiltered ? '#D1D5DB' :
                  isSelected ? '#FFD700' :
                  isHovered ? '#FFFFFF' : '#ffffff'
                }
                strokeWidth={
                  !isFiltered ? 0.5 :
                  isSelected ? 3.5 :
                  isHovered ? 2.5 : 1
                }
                strokeLinejoin="round"
                strokeLinecap="round"
                data-clickable={isFiltered ? "true" : "false"}
                className={isFiltered ? "cursor-pointer transition-all duration-200 hover:filter hover:brightness-110" : "transition-all duration-200"}
                style={{
                  filter: !isFiltered ? 'none' :
                         isSelected ? 'drop-shadow(0 6px 12px rgba(255, 215, 0, 0.4))' :
                         isHovered && isFiltered ? 'drop-shadow(0 4px 8px rgba(255, 255, 255, 0.5))' : 'none',
                  transition: 'all 0.3s ease',
                  strokeDasharray: isSelected && isFiltered ? '5, 2' : 'none',
                  animation: isSelected && isFiltered ? 'pulse 2s infinite' : 'none',
                  pointerEvents: isFiltered ? 'auto' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (isFiltered) {
                    setHoveredCounty(county.id);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMousePosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                  }
                }}
                onMouseLeave={() => {
                  if (isFiltered) setHoveredCounty(null);
                }}
                onMouseMove={(e) => {
                  if (isFiltered) setMousePosition({ x: e.clientX, y: e.clientY });
                }}
                onClick={(e) => {
                  // Only trigger click if we haven't panned
                  if (!hasPanned.current && isFiltered) {
                    handleCountyClick(county.id);
                  }
                }}
              />

              {/* Removed inline labels - using hover tooltip instead */}
            </g>
          );
        })}

        </g>
        {/* End of zoom/pan transform group */}

        {/* Legend - not affected by zoom */}
        <g transform="translate(650, 20)">
          <text x="0" y="0" className="text-xs font-bold fill-gray-700">Regions</text>
          {Object.entries(REGION_COLORS).map(([regionName, config], idx) => (
            <g key={regionName} transform={`translate(0, ${20 + idx * 15})`}>
              <rect x="0" y="0" width="10" height="10" fill={config.hex} opacity="0.8" />
              <text x="15" y="8" className="text-xs fill-gray-600">{regionName.replace('California', 'CA').replace('Central ', '')}</text>
            </g>
          ))}
        </g>
      </svg>

      {/* Enhanced Hover Tooltip - Smart positioning that follows cursor */}
      {hoveredCounty && (
        <div
          className="fixed bg-white rounded-xl shadow-2xl p-3 pointer-events-none border border-gray-200 z-50 transition-all duration-150"
          style={{
            // Position tooltip intelligently based on cursor position
            left: mousePosition.x > window.innerWidth - 250
              ? mousePosition.x - 220 + 'px'
              : mousePosition.x + 20 + 'px',
            top: mousePosition.y > window.innerHeight - 100
              ? mousePosition.y - 80 + 'px'
              : mousePosition.y + 10 + 'px',
            // Ensure tooltip stays within viewport
            maxWidth: '200px'
          }}
        >
          <div className="flex items-center gap-3">
            <div>
              <div className="text-sm font-bold text-gray-900">{getCountyInfo(hoveredCounty)?.name}</div>
              <div className="text-xs text-gray-600 mt-0.5">{getCountyInfo(hoveredCounty)?.region}</div>
            </div>
            {/* Mini county shape preview */}
            <svg width="28" height="28" viewBox="0 0 450 1100" className="border border-gray-200 rounded bg-gray-50 flex-shrink-0">
              <path
                d={getCountyInfo(hoveredCounty)?.path}
                fill={getRegionHexColor(getCountyInfo(hoveredCounty)?.region || '')}
                fillOpacity="0.8"
                stroke="#4B5563"
                strokeWidth="8"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
    </>
  );
}