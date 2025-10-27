import React, { memo } from 'react';
import { useGame } from '../../context/GameContext';
import { useSoundEffect } from '../../utils/simpleSoundManager';
import { Badge } from '../ui';
import { County } from '../../data/californiaCountiesComplete';

interface MobileCountySelectorProps {
  county: County;
  isPlaced: boolean;
}

/**
 * Mobile-optimized county selector with tap interactions
 * Tap once to select, tap again to deselect
 * Selected county can be placed by tapping on the map
 */
export const MobileCountySelector = memo<MobileCountySelectorProps>(
  ({ county, isPlaced }) => {
    const { currentCounty, selectCounty, clearCurrentCounty } = useGame();
    const sound = useSoundEffect();
    const isSelected = currentCounty?.id === county.id;

    const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isPlaced) return;

      if (isSelected) {
        // Deselect if already selected
        clearCurrentCounty();
        sound.playSound('pickup', 0.3);
      } else {
        // Select this county
        selectCounty(county);
        sound.playSound('pickup', 0.5);
      }
    };

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
        onClick={handleTap}
        onTouchEnd={handleTap}
        className={`
          touch-none select-none cursor-pointer
          transition-all duration-200 ease-in-out
          ${isSelected ? 'transform scale-110 z-10' : 'hover:scale-105 active:scale-95'}
        `}
      >
        <Badge
          region={county.region}
          size="small"
          className={`
            ${isSelected ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50 dark:bg-blue-900/30' : ''}
          `}
        >
          {isSelected && <span className="mr-1">👆</span>}
          {county.name}
        </Badge>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.county.id === nextProps.county.id && prevProps.isPlaced === nextProps.isPlaced;
  }
);

MobileCountySelector.displayName = 'MobileCountySelector';
