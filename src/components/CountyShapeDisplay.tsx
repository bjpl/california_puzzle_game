import React from 'react';
import { getCountyShape, getCountyBounds } from '../data/californiaCountyShapes';

interface CountyShapeDisplayProps {
  countyId: string;
  size?: number;
  className?: string;
  showLabel?: boolean;
  fillColor?: string;
}

/**
 * Display an individual county shape in a small SVG
 * Automatically scales and centers the county within the viewbox
 */
export default function CountyShapeDisplay({
  countyId,
  size = 60,
  className = '',
  showLabel = false,
  fillColor
}: CountyShapeDisplayProps) {
  const county = getCountyShape(countyId);

  if (!county) return null;

  // Get the bounding box of the county shape
  const bounds = getCountyBounds(county.path);
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  // Add padding around the shape
  const padding = 10;
  const viewBoxWidth = width + (padding * 2);
  const viewBoxHeight = height + (padding * 2);
  const viewBox = `${bounds.minX - padding} ${bounds.minY - padding} ${viewBoxWidth} ${viewBoxHeight}`;

  // Determine fill color based on region if not provided
  const getRegionColor = (region: string) => {
    switch(region?.toLowerCase()) {
      case 'bay area': return '#3B82F6';
      case 'southern california': return '#EF4444';
      case 'central valley': return '#10B981';
      case 'central coast': return '#A855F7';
      case 'northern california': return '#F59E0B';
      case 'north coast': return '#06B6D4';
      case 'sierra nevada': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const fill = fillColor || getRegionColor(county.region);

  return (
    <div className={`inline-block ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        className="border border-gray-200 rounded-lg bg-white shadow-sm"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* County shape */}
        <path
          d={county.path}
          fill={fill}
          fillOpacity="0.8"
          stroke="#4B5563"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Optional label */}
        {showLabel && (
          <text
            x={county.center[0]}
            y={county.center[1]}
            textAnchor="middle"
            className="text-xs font-bold fill-white"
            style={{ fontSize: Math.min(12, width / 8) }}
          >
            {county.name.substring(0, 3).toUpperCase()}
          </text>
        )}
      </svg>
    </div>
  );
}

/**
 * Display multiple county shapes in a grid
 */
export function CountyShapeGrid({
  countyIds,
  size = 50,
  columns = 4
}: {
  countyIds: string[];
  size?: number;
  columns?: number;
}) {
  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
      }}
    >
      {countyIds.map(id => (
        <div key={id} className="flex flex-col items-center">
          <CountyShapeDisplay
            countyId={id}
            size={size}
            className="mb-1"
          />
          <span className="text-xs text-gray-600 text-center">
            {getCountyShape(id)?.name}
          </span>
        </div>
      ))}
    </div>
  );
}