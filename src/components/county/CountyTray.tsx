import { memo, useMemo, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useGame } from '../../context/GameContext';
import { useSoundEffect } from '../../utils/simpleSoundManager';
// import { getRegionColor } from '../../config/regionColors'; // Available if needed
import { Badge, Heading, Text, Card } from '../ui';
import { County } from '../../types';

// Memoized draggable county component
const DraggableCounty = memo(
  ({ county }: { county: County }) => {
    const { placedCounties, selectCounty, currentCounty } = useGame();
    const sound = useSoundEffect();
    const isPlaced = placedCounties.has(county.id);
    const isSelected = currentCounty?.id === county.id;

    const {
      attributes,
      listeners,
      setNodeRef,
      transform: _transform,
      isDragging,
    } = useDraggable({
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
    // Color available if needed: getRegionColor(county.region)

    // Memoize click handler
    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isPlaced && !isSelected) {
          sound.playSound('pickup', 0.5);
          selectCounty(county);
        }
      },
      [isPlaced, isSelected, sound, selectCounty, county]
    );

    // Memoize title
    const title = useMemo(
      () =>
        `${county.name} - ${county.region}${isSelected ? ' (Selected - Use hint or drag to map)' : ' (Click to select)'}`,
      [county.name, county.region, isSelected]
    );

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
        onClick={handleClick}
        title={title}
      >
        <Badge
          region={county.region}
          size="small"
          className={`cursor-move hover:shadow-sm transition-all ${
            isDragging ? 'opacity-50 cursor-grabbing' : ''
          } ${isSelected ? 'ring-2 ring-blue-500 shadow-md transform scale-105' : ''}`}
        >
          {isSelected && '▶ '}
          {county.name}
        </Badge>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    return prevProps.county.id === nextProps.county.id;
  }
);

DraggableCounty.displayName = 'DraggableCounty';

const CountyTray = memo(() => {
  const { counties } = useGame();

  // Memoize grouped counties to prevent recalculation
  const countiesByRegion = useMemo(
    () =>
      counties.reduce(
        (acc, county) => {
          if (!acc[county.region]) acc[county.region] = [];
          acc[county.region].push(county);
          return acc;
        },
        {} as Record<string, County[]>
      ),
    [counties]
  );

  return (
    <Card variant="elevated" className="h-[35vh] lg:h-[520px] p-2 flex flex-col overflow-hidden">
      <Heading
        level={2}
        size="label"
        className="text-gray-800 dark:text-gray-200 mb-2 flex-shrink-0"
      >
        Counties ({counties.length})
      </Heading>
      <div
        className="flex-1 overflow-x-hidden pr-1 space-y-1 county-tray-scroll min-h-0"
      >
        {Object.entries(countiesByRegion).map(([region, regionCounties]) => (
          <div key={region} className="mb-2">
            <Text
              size="xs"
              weight="semibold"
              color="secondary"
              className="mb-1 py-0.5"
            >
              {region}
            </Text>
            <div className="flex flex-wrap gap-1">
              {regionCounties.map((county) => (
                <DraggableCounty key={county.id} county={county} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
});

CountyTray.displayName = 'CountyTray';

export default CountyTray;
