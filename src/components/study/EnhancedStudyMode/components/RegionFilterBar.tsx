import { County } from '../../../../types';
import { getRegionGradient } from '../utils/regionHelpers';

interface RegionFilterBarProps {
  counties: County[];
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  isMobile?: boolean;
}

/**
 * RegionFilterBar Component
 *
 * A sticky filter bar that allows users to filter counties by region.
 * Features horizontal scrolling with snap behavior and displays county counts per region.
 */
export default function RegionFilterBar({
  counties,
  selectedRegion,
  onRegionChange,
}: RegionFilterBarProps) {
  // Extract unique regions from counties
  const regions = Array.from(new Set(counties.map((c) => c.region))).sort();

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600 shadow-sm flex-shrink-0 sticky top-0 z-40 overflow-visible">
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div
          className="flex items-center gap-4 overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent min-h-[44px] scroll-smooth"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {/* Filter Label */}
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
            Filter by Region:
          </span>

          {/* Region Pills Container */}
          <div className="flex gap-3 flex-shrink-0">
            {/* All Counties Button */}
            <button
              onClick={() => onRegionChange('all')}
              className={`
                relative px-3 py-2 rounded-full text-sm font-medium leading-5
                transition-all duration-200 whitespace-nowrap inline-flex items-center justify-center
                min-h-[44px] active:scale-95
                ${
                  selectedRegion === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md transform scale-105'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}
            >
              <span className="flex-shrink-0">All Counties</span>
              <span
                className={`
                  ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-xs font-bold flex-shrink-0
                  ${selectedRegion === 'all' ? 'bg-white/20' : 'bg-gray-100'}
                `}
              >
                {counties.length}
              </span>
            </button>

            {/* Divider */}
            <div className="w-px h-7 bg-gray-300 self-center mx-2"></div>

            {/* Region Buttons */}
            {regions.map((region) => {
              const count = counties.filter((c) => c.region === region).length;
              return (
                <button
                  key={region}
                  onClick={() => onRegionChange(region)}
                  className={`
                    relative px-3 py-2 rounded-full text-sm font-medium leading-5
                    transition-all duration-200 whitespace-nowrap inline-flex items-center justify-center
                    min-h-[44px] active:scale-95
                    ${
                      selectedRegion === region
                        ? `bg-gradient-to-r ${getRegionGradient(region)} text-white shadow-md transform scale-105`
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }
                  `}
                >
                  <span className="flex-shrink-0">{region}</span>
                  <span
                    className={`
                      ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-xs font-bold flex-shrink-0
                      ${selectedRegion === region ? 'bg-white/20' : 'bg-gray-100'}
                    `}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
