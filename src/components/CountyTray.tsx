import { useDraggable } from '@dnd-kit/core';
import { useGame } from '../context/GameContext';

function DraggableCounty({ county }: { county: any }) {
  const { placedCounties } = useGame();
  const isPlaced = placedCounties.has(county.id);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: county.id,
    disabled: isPlaced,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 1000 : 1,
      }
    : undefined;

  const regionColors: { [key: string]: string } = {
    'Southern California': 'bg-red-100 border-red-400',
    'Bay Area': 'bg-blue-100 border-blue-400',
    'Central Valley': 'bg-green-100 border-green-400',
    'Central Coast': 'bg-purple-100 border-purple-400',
  };

  const colorClass = regionColors[county.region] || 'bg-gray-100 border-gray-400';

  if (isPlaced) {
    return (
      <div className="p-2 bg-gray-100 border-2 border-gray-300 rounded-lg opacity-50 cursor-not-allowed">
        <p className="text-sm font-medium text-gray-500 line-through">{county.name}</p>
        <p className="text-xs text-gray-400">Placed ✓</p>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-2 border-2 rounded-lg cursor-grab hover:shadow-md transition-shadow ${colorClass} ${
        isDragging ? 'opacity-50 cursor-grabbing shadow-lg' : ''
      }`}
    >
      <p className="text-sm font-medium text-gray-700">{county.name}</p>
      <p className="text-xs text-gray-500">{county.region}</p>
    </div>
  );
}

export default function CountyTray() {
  const { counties } = useGame();

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-3">Counties</h2>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {counties.map(county => (
          <DraggableCounty key={county.id} county={county} />
        ))}
      </div>
    </div>
  );
}