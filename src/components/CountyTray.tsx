import { useDraggable } from '@dnd-kit/core';
import { useGame } from '../context/GameContext';
import { useSoundEffect } from '../utils/simpleSoundManager';
import { getRegionColor } from '../config/regionColors';

function DraggableCounty({ county }: { county: any }) {
  const { placedCounties, selectCounty, currentCounty } = useGame();
  const sound = useSoundEffect();
  const isPlaced = placedCounties.has(county.id);
  const isSelected = currentCounty?.id === county.id;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: county.id,
    disabled: isPlaced,
  });

  // When dragging, hide the original element to prevent scrolling issues
  const style = isDragging
    ? {
        opacity: 0,
        pointerEvents: 'none' as const,
      }
    : undefined;

  // Use centralized color configuration
  const regionColor = getRegionColor(county.region);
  const colorClass = `${regionColor.tailwindLight} ${regionColor.tailwindLightBorder}`;

  if (isPlaced) {
    return (
      <div className="px-1 py-0 bg-gray-100 border border-gray-300 rounded opacity-50 cursor-not-allowed" style={{ fontSize: '10px' }}>
        <span className="text-gray-500 line-through">{county.name}</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, fontSize: '10px' }}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        if (!isPlaced && !isSelected) {
          sound.playSound('pickup', 0.5);
          selectCounty(county);
        }
      }}
      className={`px-1 py-0 border rounded cursor-move hover:shadow-sm transition-all ${colorClass} ${
        isDragging ? 'opacity-50 cursor-grabbing' : ''
      } ${
        isSelected ? 'ring-2 ring-blue-500 shadow-md transform scale-105' : ''
      }`}
      title={`${county.name} - ${county.region}${isSelected ? ' (Selected - Use hint or drag to map)' : ' (Click to select)'}`}
    >
      <span className="text-gray-700 font-medium">
        {isSelected && '▶ '}
        {county.name}
      </span>
    </div>
  );
}

export default function CountyTray() {
  const { counties } = useGame();

  // Group counties by region for better organization
  const countiesByRegion = counties.reduce((acc, county) => {
    if (!acc[county.region]) acc[county.region] = [];
    acc[county.region].push(county);
    return acc;
  }, {} as Record<string, typeof counties>);

  return (
    <div className="bg-white rounded-lg shadow-lg p-2 h-[520px] overflow-hidden">
      <h2 className="text-xs font-bold text-gray-800 mb-1">Counties ({counties.length})</h2>
      <div className="space-y-0.5 max-h-[490px] overflow-y-auto overflow-x-hidden pr-1">
        {Object.entries(countiesByRegion).map(([region, regionCounties]) => (
          <div key={region}>
            <p className="text-xs font-semibold text-gray-600 mt-1 mb-0.5">{region}</p>
            <div className="grid grid-cols-2 gap-0.5">
              {regionCounties.map(county => (
                <DraggableCounty key={county.id} county={county} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}