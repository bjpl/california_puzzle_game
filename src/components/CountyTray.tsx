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
    'Northern California': 'bg-orange-100 border-orange-400',
    'Sierra Nevada': 'bg-yellow-100 border-yellow-400',
    'North Coast': 'bg-teal-100 border-teal-400',
  };

  const colorClass = regionColors[county.region] || 'bg-gray-100 border-gray-400';

  if (isPlaced) {
    return (
      <div className="p-1 bg-gray-100 border border-gray-300 rounded opacity-50 cursor-not-allowed">
        <p className="text-xs font-medium text-gray-500 line-through">{county.name}</p>
        <p className="text-xs text-gray-400">✓</p>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-1 border rounded cursor-grab hover:shadow-md transition-shadow ${colorClass} ${
        isDragging ? 'opacity-50 cursor-grabbing shadow-lg' : ''
      }`}
    >
      <p className="text-xs font-medium text-gray-700">{county.name}</p>
      <p className="text-xs text-gray-500">{county.region.split(' ')[0]}</p>
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
    <div className="bg-white rounded-lg shadow-lg p-2 h-full">
      <h2 className="text-sm font-bold text-gray-800 mb-2">Counties ({counties.length})</h2>
      <div className="space-y-1 max-h-[550px] overflow-y-auto pr-1">
        {Object.entries(countiesByRegion).map(([region, regionCounties]) => (
          <div key={region}>
            <p className="text-xs font-semibold text-gray-600 mt-2 mb-1">{region}</p>
            <div className="grid grid-cols-2 gap-1">
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