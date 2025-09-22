import React, { useState } from 'react';
import { californiaCountyPaths } from '../data/californiaMapPaths';

interface StudyModeMapProps {
  onCountySelect?: (countyId: string) => void;
  selectedCounty?: any;
}

export default function StudyModeMap({ onCountySelect, selectedCounty }: StudyModeMapProps) {
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);

  // Region color mapping
  const getRegionColor = (region: string) => {
    switch(region?.toLowerCase()) {
      case 'bay area': return '#3B82F6'; // blue
      case 'southern california': return '#EF4444'; // red
      case 'central valley': return '#10B981'; // green
      case 'central coast': return '#A855F7'; // purple
      case 'northern california': return '#F59E0B'; // amber
      case 'north coast': return '#06B6D4'; // cyan
      case 'sacramento valley': return '#F97316'; // orange
      case 'san joaquin valley': return '#84CC16'; // lime
      case 'sierra nevada': return '#8B5CF6'; // violet
      case 'desert': return '#F59E0B'; // yellow
      default: return '#6B7280'; // gray
    }
  };

  // Get county display info
  const getCountyInfo = (countyId: string) => {
    // This would come from the counties data
    return californiaCountyPaths[countyId];
  };

  const handleCountyClick = (countyId: string) => {
    if (onCountySelect) {
      onCountySelect(countyId);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* SVG Map */}
      <svg
        viewBox="0 0 800 1000"
        className="w-full h-full"
        style={{ maxHeight: '600px' }}
      >
        {/* Background */}
        <rect width="800" height="1000" fill="#F3F4F6" />

        {/* County Paths */}
        {Object.entries(californiaCountyPaths).map(([countyId, countyData]) => {
          const isHovered = hoveredCounty === countyId;
          const isSelected = selectedCounty?.id === countyId;
          const fillColor = getRegionColor(countyData.region);

          return (
            <g key={countyId}>
              <path
                d={countyData.path}
                fill={fillColor}
                fillOpacity={isSelected ? 0.9 : isHovered ? 0.8 : 0.6}
                stroke="#ffffff"
                strokeWidth={isSelected ? 2 : 1}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredCounty(countyId)}
                onMouseLeave={() => setHoveredCounty(null)}
                onClick={() => handleCountyClick(countyId)}
              />

              {/* Show label on hover or selection */}
              {(isHovered || isSelected) && countyData.center && (
                <g pointerEvents="none">
                  {/* Background for label */}
                  <rect
                    x={countyData.center[0] - 40}
                    y={countyData.center[1] - 12}
                    width="80"
                    height="24"
                    fill="white"
                    fillOpacity="0.95"
                    rx="4"
                    stroke={fillColor}
                    strokeWidth="1"
                  />
                  {/* County name */}
                  <text
                    x={countyData.center[0]}
                    y={countyData.center[1] + 4}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-gray-800"
                  >
                    {countyData.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoveredCounty && (
        <div className="absolute top-2 left-2 bg-white rounded-lg shadow-lg p-3 pointer-events-none">
          <div className="text-sm font-semibold">{getCountyInfo(hoveredCounty)?.name}</div>
          <div className="text-xs text-gray-600">{getCountyInfo(hoveredCounty)?.region}</div>
        </div>
      )}
    </div>
  );
}