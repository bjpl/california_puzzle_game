import React from 'react';
import { useCountyPlacementStore } from '@/stores/countyPlacementStore';

export const MobileGameInstructions: React.FC = () => {
  const currentHint = useCountyPlacementStore((state) => state.currentHint);

  return (
    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mb-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-2xl">👆</span>
        <div className="flex-1">
          {currentHint ? (
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                {currentHint.name} selected!
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                Tap on the map where this county belongs
              </p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">How to play:</p>
              <p className="text-blue-700 dark:text-blue-300">
                1. Tap a county name below to select it
              </p>
              <p className="text-blue-700 dark:text-blue-300">2. Tap on the map to place it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileGameInstructions;
