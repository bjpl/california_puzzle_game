import React from 'react';
import { realCaliforniaCountyShapes } from '../data/californiaCountyBoundaries';

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
  const county = realCaliforniaCountyShapes.find(
    c => c.id === countyId ||
    c.id === countyId.replace(/_/g, '-') ||
    c.id === countyId.replace(/-/g, '_')
  );

  if (!county) return null;

  // Extract bounds from the path for viewBox calculation
  const getPathBounds = (pathData: string) => {
    const numbers = pathData.match(/[\d.]+/g)?.map(Number) || [];
    const coords: number[][] = [];
    for (let i = 0; i < numbers.length; i += 2) {
      if (numbers[i] !== undefined && numbers[i + 1] !== undefined) {
        coords.push([numbers[i], numbers[i + 1]]);
      }
    }
    if (coords.length === 0) return { minX: 0, minY: 0, maxX: 100, maxY: 100 };

    const xs = coords.map(c => c[0]);
    const ys = coords.map(c => c[1]);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    };
  };

  const bounds = getPathBounds(county.pathDetailed || county.path);
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const padding = Math.max(width, height) * 0.1;
  const viewBox = `${bounds.minX - padding} ${bounds.minY - padding} ${width + padding * 2} ${height + padding * 2}`;

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

  const fill = fillColor || getRegionColor(county.region || '');

  return (
    <div className={`inline-block ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        className="border border-gray-200 rounded-lg bg-white shadow-sm"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* County shape with real boundaries */}
        <path
          d={county.pathDetailed || county.path}
          fill={fill}
          fillOpacity="0.85"
          stroke="#374151"
          strokeWidth="1"
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
            {county.abbrev || county.name.substring(0, 3).toUpperCase()}
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
            {realCaliforniaCountyShapes.find(c => c.id === id)?.name}
          </span>
        </div>
      ))}
    </div>
  );
}