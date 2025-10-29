import type { County, ExtendedCounty } from '../../../../types/game-types';

interface CountyListProps {
  counties: County[];
  selectedCounty: County | null;
  progress: {
    studiedCounties: Set<string>;
    masteredCounties: Set<string>;
  };
  selectedRegion: string;
  onCountySelect: (county: County) => void;
  isMobile?: boolean;
}

export default function CountyList({
  counties,
  selectedCounty,
  progress,
  selectedRegion,
  onCountySelect,
  isMobile = false,
}: CountyListProps) {
  return (
    <div
      className={`${selectedCounty && isMobile ? 'hidden md:block' : 'block'} w-full md:w-1/3 lg:w-1/4 xl:w-1/5 min-w-[280px] max-w-[400px] border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto max-h-screen county-tray-scroll`}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base sm:text-lg">
          {selectedRegion === 'all' ? 'All Counties' : selectedRegion}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          {counties.length} counties
        </p>
      </div>

      {/* Scrollable County List */}
      <div className="p-4 space-y-2">
        {counties.map((county) => {
          const isStudied = progress.studiedCounties.has(county.id);
          const isMastered = progress.masteredCounties.has(county.id);

          return (
            <button
              key={county.id}
              onClick={() => onCountySelect(county)}
              className={`w-full p-4 rounded-xl text-left transition-all duration-200 border min-h-[56px] active:scale-98 ${
                selectedCounty?.id === county.id
                  ? 'ring-2 ring-blue-500 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700'
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-md border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">
                    {county.name}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {county.capital || (county as ExtendedCounty).countySeat}
                  </div>
                </div>
                <div className="flex gap-1">
                  {isStudied && <span className="text-green-500">✓</span>}
                  {isMastered && <span className="text-yellow-500">⭐</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
