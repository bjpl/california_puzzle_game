import React, { useState } from 'react';
import { californiaCountyShapes, getCountyShape } from '../data/californiaCountyShapes';

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
    return getCountyShape(countyId);
  };

  const handleCountyClick = (countyId: string) => {
    if (onCountySelect) {
      onCountySelect(countyId);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* SVG Map with Geographic Shapes */}
      <svg
        viewBox="0 0 450 1100"
        className="w-full h-full"
        style={{ maxHeight: '600px' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background - California outline effect */}
        <rect width="450" height="1100" fill="#E5E7EB" />

        {/* Ocean/Water effect on the left */}
        <path
          d="M 0,0 L 50,0 L 45,400 L 55,600 L 45,900 L 50,1100 L 0,1100 Z"
          fill="#CBD5E1"
          opacity="0.5"
        />

        {/* County Geographic Shapes */}
        {californiaCountyShapes.map((county) => {
          const isHovered = hoveredCounty === county.id;
          const isSelected = selectedCounty?.id === county.id ||
                           selectedCounty?.id === county.id.replace(/-/g, '_');
          const fillColor = getRegionColor(county.region);

          return (
            <g key={county.id}>
              <path
                d={county.path}
                fill={fillColor}
                fillOpacity={isSelected ? 0.95 : isHovered ? 0.85 : 0.7}
                stroke="#ffffff"
                strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                strokeLinejoin="round"
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-200 hover:filter hover:brightness-110"
                style={{
                  filter: isSelected ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))' :
                         isHovered ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))' : 'none'
                }}
                onMouseEnter={() => setHoveredCounty(county.id)}
                onMouseLeave={() => setHoveredCounty(null)}
                onClick={() => handleCountyClick(county.id)}
              />

              {/* Show label on hover or selection with improved positioning */}
              {(isHovered || isSelected) && county.center && (
                <g pointerEvents="none">
                  {/* Enhanced label background */}
                  <rect
                    x={(county.labelPosition || county.center)[0] - 35}
                    y={(county.labelPosition || county.center)[1] - 10}
                    width={county.name.length * 7 + 10}
                    height="20"
                    fill="white"
                    fillOpacity="0.98"
                    rx="3"
                    stroke={fillColor}
                    strokeWidth="1.5"
                    filter="drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))"
                  />
                  {/* County name with better styling */}
                  <text
                    x={(county.labelPosition || county.center)[0]}
                    y={(county.labelPosition || county.center)[1] + 4}
                    textAnchor="middle"
                    className="text-xs font-bold fill-gray-900"
                    style={{ fontSize: '11px' }}
                  >
                    {county.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* California State Border Outline for visual effect */}
        <path
          d="M 45,40 L 290,33 L 400,428 L 383,1090 L 145,1075 L 68,1000 L 55,600 L 48,210 L 68,50 Z"
          fill="none"
          stroke="#6B7280"
          strokeWidth="2"
          strokeDasharray="5,5"
          opacity="0.3"
        />
      </svg>

      {/* Enhanced Hover Tooltip */}
      {hoveredCounty && (
        <div className="absolute top-2 left-2 bg-white rounded-xl shadow-2xl p-4 pointer-events-none border border-gray-200">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-sm font-bold text-gray-900">{getCountyInfo(hoveredCounty)?.name}</div>
              <div className="text-xs text-gray-600 mt-1">{getCountyInfo(hoveredCounty)?.region}</div>
            </div>
            {/* Mini county shape preview */}
            <svg width="30" height="30" viewBox="0 0 450 1100" className="border border-gray-200 rounded bg-gray-50">
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
  );
}