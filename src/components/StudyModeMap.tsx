import React, { useState } from 'react';
import { realCaliforniaCountyShapes } from '../data/californiaCountyBoundaries';

interface StudyModeMapProps {
  onCountySelect?: (countyId: string) => void;
  selectedCounty?: any;
}

// Counties with special label handling for better display
const specialLabelHandling: Record<string, { abbreviation?: string; offset?: [number, number] }> = {
  'san-luis-obispo': { abbreviation: 'SLO' },
  'san-bernardino': { abbreviation: 'San Bern.' },
  'monterey': { abbreviation: 'Monterey' },
  'san-francisco': { abbreviation: 'SF' },
  'contra-costa': { abbreviation: 'Contra C.' },
  'santa-barbara': { abbreviation: 'Santa B.' }
};

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
    <div className="relative w-full h-full">
      {/* SVG Map with Real Geographic Boundaries */}
      <svg
        viewBox="0 0 800 900"
        className="w-full h-full"
        style={{ maxHeight: '600px' }}
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
                  {/* Calculate better label dimensions */}
                  {(() => {
                    // Check if county needs special label handling
                    const special = specialLabelHandling[county.id];
                    const displayName = special?.abbreviation || county.name;

                    // Use smarter text truncation
                    const labelText = displayName.length > 15
                      ? displayName.substring(0, 12) + '...'
                      : displayName;

                    // Calculate width based on actual text length
                    const charWidth = 6;
                    const padding = 10;
                    const labelWidth = Math.min(labelText.length * charWidth + padding, 85);

                    // Get base position
                    const baseX = (county.labelPosition || county.center)[0];
                    const baseY = (county.labelPosition || county.center)[1];

                    // Apply special offset if defined
                    const labelX = baseX + (special?.offset?.[0] || 0);
                    const labelY = baseY + (special?.offset?.[1] || 0);

                    // Ensure label stays within SVG bounds with padding
                    const padding_x = labelWidth / 2 + 5;
                    const adjustedX = Math.max(padding_x, Math.min(800 - padding_x, labelX));
                    const adjustedY = Math.max(15, Math.min(885, labelY));

                    return (
                      <>
                        {/* Enhanced label background */}
                        <rect
                          x={adjustedX - labelWidth / 2}
                          y={adjustedY - 9}
                          width={labelWidth}
                          height="18"
                          fill="white"
                          fillOpacity="0.95"
                          rx="2"
                          stroke={fillColor}
                          strokeWidth="1.2"
                          filter="drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))"
                        />
                        {/* County name with better styling */}
                        <text
                          x={adjustedX}
                          y={adjustedY + 3}
                          textAnchor="middle"
                          className="text-xs font-semibold fill-gray-900"
                          style={{
                            fontSize: '9px',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {labelText}
                        </text>
                      </>
                    );
                  })()}
                </g>
              )}
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