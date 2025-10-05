import { useDraggable } from '@dnd-kit/core';
import { useGame } from '../../context/GameContext';
import { useSoundEffect } from '../../utils/simpleSoundManager';
import { getRegionColor } from '../../config/regionColors';
import { Badge, Heading, Text, Card } from '../ui';

function DraggableCounty({ county }: { county: Record<string, unknown> }) {
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
      <Badge
        variant="default"
        size="small"
        className="opacity-50 cursor-not-allowed line-through"
      >
        {county.name}
      </Badge>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        if (!isPlaced && !isSelected) {
          sound.playSound('pickup', 0.5);
          selectCounty(county);
        }
      }}
      title={`${county.name} - ${county.region}${isSelected ? ' (Selected - Use hint or drag to map)' : ' (Click to select)'}`}
    >
      <Badge
        region={county.region}
        size="small"
        className={`cursor-move hover:shadow-sm transition-all ${
          isDragging ? 'opacity-50 cursor-grabbing' : ''
        } ${
          isSelected ? 'ring-2 ring-blue-500 shadow-md transform scale-105' : ''
        }`}
      >
        {isSelected && '▶ '}
        {county.name}
      </Badge>
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
    <Card variant="elevated" className="h-[520px] overflow-hidden p-2">
      <Heading level={2} size="label" className="text-gray-800 mb-1">
        Counties ({counties.length})
      </Heading>
      <div className="space-y-0.5 max-h-[490px] overflow-y-auto overflow-x-hidden pr-1">
        {Object.entries(countiesByRegion).map(([region, regionCounties]) => (
          <div key={region}>
            <Text size="xs" weight="semibold" color="secondary" className="mt-1 mb-0.5">
              {region}
            </Text>
            <div className="grid grid-cols-2 gap-0.5">
              {regionCounties.map(county => (
                <DraggableCounty key={county.id} county={county} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}