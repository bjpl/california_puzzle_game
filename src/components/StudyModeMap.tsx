import React, { useState } from 'react';
import { realCaliforniaCountyShapes } from '../data/californiaCountyBoundaries';
import { getRegionHexColor } from '../config/regionColors';

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
    if (onCountySelect) {
      onCountySelect(countyId);
    }
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
    <div className="relative w-full h-full">
      {/* SVG Map with Real Geographic Boundaries */}
      <svg
        viewBox="0 0 800 900"
        className="w-full h-full"
        style={{ maxHeight: '600px', overflow: 'visible' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background - Ocean blue gradient */}
        <defs>
          <linearGradient id="ocean" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#E0F2FE', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#F0F9FF', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <rect width="800" height="900" fill="url(#ocean)" />

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
                onClick={() => isFiltered && handleCountyClick(county.id)}
              />

              {/* Removed inline labels - using hover tooltip instead */}
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(650, 20)">
          <text x="0" y="0" className="text-xs font-bold fill-gray-700">Regions</text>
          {[
            { name: 'Bay Area', color: '#3B82F6' },
            { name: 'Southern CA', color: '#EF4444' },
            { name: 'Central Valley', color: '#10B981' },
            { name: 'Central Coast', color: '#A855F7' },
            { name: 'Northern CA', color: '#F59E0B' },
            { name: 'North Coast', color: '#06B6D4' },
            { name: 'Sierra Nevada', color: '#8B5CF6' }
          ].map((region, idx) => (
            <g key={region.name} transform={`translate(0, ${20 + idx * 15})`}>
              <rect x="0" y="0" width="10" height="10" fill={region.color} opacity="0.8" />
              <text x="15" y="8" className="text-xs fill-gray-600">{region.name}</text>
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
                fill={getRegionColor(getCountyInfo(hoveredCounty)?.region || '')}
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