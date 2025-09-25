import { useDroppable } from '@dnd-kit/core';
import { useGame } from '../context/GameContext';

interface CountyDropZoneProps {
  countyId: string;
  path: string;
  name: string;
  x: number;
  y: number;
}

function CountyDropZone({ countyId, path, name, x, y }: CountyDropZoneProps) {
  const { placedCounties, currentCounty } = useGame();
  const isPlaced = placedCounties.has(countyId);

  const { isOver, setNodeRef } = useDroppable({
    id: countyId,
  });

  const isActive = currentCounty?.id === countyId;

  let fillColor = '#f0f0f0';
  if (isPlaced) fillColor = '#4ade80';
  else if (isOver && currentCounty?.id === countyId) fillColor = '#86efac';
  else if (isOver) fillColor = '#fca5a5';
  else if (isActive) fillColor = '#fef3c7';

  return (
    <g ref={setNodeRef}>
      <path
        d={path}
        fill={fillColor}
        stroke="#333"
        strokeWidth="1"
        className="transition-colors duration-200"
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fontSize="10"
        fill={isPlaced ? '#fff' : '#333'}
        fontWeight={isPlaced ? 'bold' : 'normal'}
        pointerEvents="none"
      >
        {isPlaced ? name : '?'}
      </text>
    </g>
  );
}

export default function CaliforniaMap({ isDragging }: { isDragging: boolean }) {
  // Simplified California county paths - these are approximations for demo
  const countyData = [
    // Southern California
    { id: 'los-angeles', name: 'Los Angeles', path: 'M 150 400 L 200 400 L 200 450 L 150 450 Z', x: 175, y: 425 },
    { id: 'san-diego', name: 'San Diego', path: 'M 160 470 L 210 470 L 210 520 L 160 520 Z', x: 185, y: 495 },
    { id: 'orange', name: 'Orange', path: 'M 180 440 L 220 440 L 220 470 L 180 470 Z', x: 200, y: 455 },
    { id: 'riverside', name: 'Riverside', path: 'M 220 420 L 280 420 L 280 480 L 220 480 Z', x: 250, y: 450 },
    { id: 'san-bernardino', name: 'San Bernardino', path: 'M 250 380 L 350 380 L 350 450 L 250 450 Z', x: 300, y: 415 },

    // Bay Area
    { id: 'san-francisco', name: 'San Francisco', path: 'M 60 200 L 80 200 L 80 220 L 60 220 Z', x: 70, y: 210 },
    { id: 'san-mateo', name: 'San Mateo', path: 'M 60 220 L 90 220 L 90 250 L 60 250 Z', x: 75, y: 235 },
    { id: 'santa-clara', name: 'Santa Clara', path: 'M 70 250 L 110 250 L 110 290 L 70 290 Z', x: 90, y: 270 },
    { id: 'alameda', name: 'Alameda', path: 'M 90 210 L 130 210 L 130 250 L 90 250 Z', x: 110, y: 230 },
    { id: 'contra-costa', name: 'Contra Costa', path: 'M 100 180 L 150 180 L 150 220 L 100 220 Z', x: 125, y: 200 },

    // Central Valley
    { id: 'sacramento', name: 'Sacramento', path: 'M 130 150 L 180 150 L 180 200 L 130 200 Z', x: 155, y: 175 },
    { id: 'fresno', name: 'Fresno', path: 'M 150 290 L 210 290 L 210 350 L 150 350 Z', x: 180, y: 320 },
    { id: 'kern', name: 'Kern', path: 'M 140 350 L 220 350 L 220 410 L 140 410 Z', x: 180, y: 380 },
    { id: 'san-joaquin', name: 'San Joaquin', path: 'M 130 220 L 180 220 L 180 270 L 130 270 Z', x: 155, y: 245 },
    { id: 'stanislaus', name: 'Stanislaus', path: 'M 120 260 L 170 260 L 170 300 L 120 300 Z', x: 145, y: 280 },

    // Central Coast
    { id: 'ventura', name: 'Ventura', path: 'M 100 390 L 150 390 L 150 420 L 100 420 Z', x: 125, y: 405 },
    { id: 'santa-barbara', name: 'Santa Barbara', path: 'M 80 360 L 140 360 L 140 390 L 80 390 Z', x: 110, y: 375 },
    { id: 'monterey', name: 'Monterey', path: 'M 70 290 L 130 290 L 130 340 L 70 340 Z', x: 100, y: 315 },
    { id: 'san-luis-obispo', name: 'San Luis Obispo', path: 'M 90 330 L 150 330 L 150 370 L 90 370 Z', x: 120, y: 350 },
    { id: 'santa-cruz', name: 'Santa Cruz', path: 'M 50 260 L 90 260 L 90 290 L 50 290 Z', x: 70, y: 275 },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 400 550"
        className="w-full h-full max-w-full max-h-full"
        style={{ backgroundColor: '#e0f2fe' }}
      >
        {/* California Outline (simplified) */}
        <path
          d="M 40 100 L 200 100 L 350 200 L 360 500 L 200 530 L 50 500 L 30 200 Z"
          fill="none"
          stroke="#1e40af"
          strokeWidth="2"
          strokeDasharray="5,5"
          opacity="0.3"
        />

        {/* Title */}
        <text x="200" y="30" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#1e40af">
          California Counties
        </text>

        {/* Instructions */}
        {isDragging && (
          <text x="200" y="60" textAnchor="middle" fontSize="12" fill="#666">
            Drop the county on its correct location
          </text>
        )}

        {/* County drop zones */}
        {countyData.map(county => (
          <CountyDropZone
            key={county.id}
            countyId={county.id}
            path={county.path}
            name={county.name}
            x={county.x}
            y={county.y}
          />
        ))}
      </svg>
    </div>
  );
}