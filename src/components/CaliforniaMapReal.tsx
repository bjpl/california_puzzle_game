import { useEffect, useState, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useGame } from '../context/GameContext';
import * as d3 from 'd3-geo';
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

interface CountyDropZoneProps {
  county: CountyFeature;
  path: string;
  centroid: [number, number];
}

function CountyDropZone({ county, path, centroid }: CountyDropZoneProps) {
  const { placedCounties, currentCounty } = useGame();
  const countyId = county.properties.NAME.toLowerCase().replace(/\s+/g, '-');
  const isPlaced = placedCounties.has(countyId);

  const { isOver, setNodeRef } = useDroppable({
    id: countyId,
  });

  const isActive = currentCounty?.id === countyId;
  const isCorrectHover = isOver && currentCounty?.id === countyId;
  const isWrongHover = isOver && currentCounty?.id !== countyId;

  let fillColor = '#f3f4f6'; // Default gray
  if (isPlaced) fillColor = '#10b981'; // Green when placed
  else if (isCorrectHover) fillColor = '#86efac'; // Light green on correct hover
  else if (isWrongHover) fillColor = '#fca5a5'; // Light red on wrong hover
  else if (isActive) fillColor = '#fef3c7'; // Yellow when active

  // Calculate optimal text color based on background
  const textColor = getSvgTextFill(fillColor);

  return (
    <g ref={setNodeRef}>
      <path
        d={path}
        fill={fillColor}
        stroke="#374151"
        strokeWidth="0.5"
        className="transition-all duration-200 hover:stroke-2"
        style={{ cursor: isPlaced ? 'default' : 'pointer' }}
      />
      {isPlaced && (
        <text
          x={centroid[0]}
          y={centroid[1]}
          textAnchor="middle"
          fontSize="8"
          fill={textColor}
          fontWeight="bold"
          pointerEvents="none"
          style={{
            textShadow: textColor === '#ffffff' ? '1px 1px 2px rgba(0,0,0,0.7)' : '1px 1px 2px rgba(255,255,255,0.7)',
          }}
        >
          {county.properties.NAME}
        </text>
      )}
    </g>
  );
}

export default function CaliforniaMapReal({ isDragging }: { isDragging: boolean }) {
  const [geoData, setGeoData] = useState<any>(null);
  const [paths, setPaths] = useState<Map<string, string>>(new Map());
  const [centroids, setCentroids] = useState<Map<string, [number, number]>>(new Map());
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Load the GeoJSON data
    fetch('/california_puzzle_game/data/geo/ca-counties-low.geojson')
      .then(response => response.json())
      .then(data => {
        setGeoData(data);

        // Create projection
        const width = 800;
        const height = 600;

        // California Albers projection - optimized for California
        const projection = d3.geoAlbers()
          .parallels([34, 40.5])
          .rotate([120, 0])
          .center([0, 37.5])
          .scale(3000)
          .translate([width / 2, height / 2]);

        const pathGenerator = d3.geoPath().projection(projection);

        const newPaths = new Map();
        const newCentroids = new Map();

        // Generate paths and centroids for each county
        data.features.forEach((feature: CountyFeature) => {
          const countyName = feature.properties.NAME;
          const pathData = pathGenerator(feature as any);
          if (pathData) {
            newPaths.set(countyName, pathData);
            const centroid = pathGenerator.centroid(feature as any);
            newCentroids.set(countyName, centroid as [number, number]);
          }
        });

        setPaths(newPaths);
        setCentroids(newCentroids);
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
      });
  }, []);

  const { counties } = useGame();

  // Filter to only show counties we have in our game
  const gameCountyNames = counties.map(c =>
    c.name.toUpperCase()
  );

  const filteredFeatures = geoData?.features.filter((feature: CountyFeature) => {
    const countyName = feature.properties.NAME.toUpperCase();
    return gameCountyNames.some(gameName =>
      countyName.includes(gameName) || gameName.includes(countyName)
    );
  }) || [];

  if (!geoData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-blue-50">
      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        className="w-full h-full"
        style={{ maxHeight: '100%', maxWidth: '100%' }}
      >
        {/* Ocean background */}
        <rect width="800" height="600" fill="#dbeafe" />

        {/* Title */}
        <text
          x="400"
          y="30"
          textAnchor="middle"
          fontSize="24"
          fontWeight="bold"
          fill="#1e3a8a"
        >
          California Counties Puzzle
        </text>

        {/* Instructions */}
        {isDragging && (
          <text
            x="400"
            y="55"
            textAnchor="middle"
            fontSize="14"
            fill="#6b7280"
          >
            Drop the county on its correct location
          </text>
        )}

        {/* All California counties outline (faint) */}
        <g opacity="0.2">
          {geoData.features.map((feature: CountyFeature) => {
            const path = paths.get(feature.properties.NAME);
            if (!path) return null;

            return (
              <path
                key={feature.properties.NAME}
                d={path}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="0.5"
              />
            );
          })}
        </g>

        {/* Game counties (interactive) */}
        <g>
          {filteredFeatures.map((feature: CountyFeature) => {
            const path = paths.get(feature.properties.NAME);
            const centroid = centroids.get(feature.properties.NAME);
            if (!path || !centroid) return null;

            return (
              <CountyDropZone
                key={feature.properties.NAME}
                county={feature}
                path={path}
                centroid={centroid}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}