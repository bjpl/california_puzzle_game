import { memo, useMemo, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useCountyPlacementStore } from '@/stores/countyPlacementStore';
import { County } from '@/types';
import { useSoundEffect } from '../../utils/simpleSoundManager';
import { useDeviceInfo } from '../../mobile/hooks/useDeviceInfo';
// import { getRegionColor } from '../../config/regionColors'; // Available if needed
import { Badge, Heading, Text } from '../ui';
import { MobileCountySelector } from './MobileCountySelector';
import './CountyTray.css';

// Memoized draggable county component
const DraggableCounty = memo(
  ({ county }: { county: County }) => {
    const placedCounties = useCountyPlacementStore((state) => state.placedCounties);
    const currentHint = useCountyPlacementStore((state) => state.currentHint);
    const setCurrentHint = useCountyPlacementStore((state) => state.setCurrentHint);
    const sound = useSoundEffect();

    // Convert placedCounties array to Set for lookup
    const placedCountiesSet = useMemo(
      () => new Set(placedCounties.map((c) => c.id)),
      [placedCounties]
    );

    const isPlaced = placedCountiesSet.has(county.id);
    const isSelected = currentHint?.id === county.id;

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
          setCurrentHint(county);
        }
      },
      [isPlaced, isSelected, sound, setCurrentHint, county]
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
  const placedCounties = useCountyPlacementStore((state) => state.placedCounties);
  const remainingCounties = useCountyPlacementStore((state) => state.remainingCounties);
  const deviceInfo = useDeviceInfo();
  const isMobile = deviceInfo.isMobile || deviceInfo.isTablet;

  // Convert placedCounties array to Set for lookup
  const placedCountiesSet = useMemo(
    () => new Set(placedCounties.map((c) => c.id)),
    [placedCounties]
  );

  // Combine remaining and placed counties to show full list
  const counties = useMemo(
    () => [...remainingCounties, ...placedCounties],
    [remainingCounties, placedCounties]
  );

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
    <div
      className={`
      ${isMobile ? 'h-[30vh]' : 'h-[35vh] lg:h-[520px]'}
      p-3 flex flex-col relative bg-white dark:bg-gray-800 rounded-lg shadow-lg
      border border-gray-100 dark:border-gray-700
    `}
    >
      <Heading
        level={2}
        size="label"
        className="text-gray-800 dark:text-gray-200 mb-2 flex-shrink-0"
      >
        Counties ({counties.length})
      </Heading>
      <div className="flex-1 overflow-y-auto overflow-x-visible pr-2 space-y-1 min-h-0 county-scroll-container">
        {Object.entries(countiesByRegion).map(([region, regionCounties]) => (
          <div key={region} className="mb-2">
            <Text size="xs" weight="semibold" color="secondary" className="mb-1 py-0.5">
              {region}
            </Text>
            <div className="flex flex-wrap gap-1">
              {regionCounties.map((county) =>
                isMobile ? (
                  <MobileCountySelector
                    key={county.id}
                    county={
                      county as unknown as Parameters<typeof MobileCountySelector>[0]['county']
                    } // Type compatibility
                    isPlaced={placedCountiesSet.has(county.id)}
                  />
                ) : (
                  <DraggableCounty key={county.id} county={county} />
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Visual scroll indicator - gradient fade shows more content below */}
      <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none bg-gradient-to-b from-transparent to-white/90 dark:to-gray-800/90" />
    </div>
  );
});

CountyTray.displayName = 'CountyTray';

export default CountyTray;
