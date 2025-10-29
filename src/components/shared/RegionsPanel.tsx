import { useGame } from '../../context/GameContext';
import { REGION_COLORS, getRegionColor } from '../../config/regionColors';
import { useDeviceInfo } from '../../mobile/hooks/useDeviceInfo';

export default function RegionsPanel() {
  const { showRegions, toggleShowRegions } = useGame();
  const deviceInfo = useDeviceInfo();
  const isMobile = deviceInfo.isMobile || deviceInfo.isTablet;

  // Use centralized color configuration with proper light colors
  const regions = Object.keys(REGION_COLORS).map((regionName) => {
    const colorConfig = getRegionColor(regionName);
    // Abbreviate names for display
    let displayName = regionName.replace('California', '').replace('Central ', '').trim();

    if (displayName === 'Southern') displayName = 'Southern';
    if (displayName === 'Northern') displayName = 'Northern';
    if (displayName === 'Central Valley') displayName = 'Valley';
    if (displayName === 'Central Coast') displayName = 'Coast';

    return {
      name: regionName,
      displayName,
      color: colorConfig.hex,
      bgColor: colorConfig.hexLight, // Use proper light hex color
    };
  });

  // Desktop: Sidebar panel on right
  // Mobile: Floating button + Bottom sheet overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile: Floating Action Button */}
        <button
          onClick={toggleShowRegions}
          className={`fixed bottom-20 right-4 z-30 w-12 h-12 rounded-full font-medium text-white shadow-xl transition-all transform active:scale-95 flex items-center justify-center ${
            showRegions
              ? 'bg-gradient-to-r from-blue-500 to-teal-400'
              : 'bg-gradient-to-r from-gray-400 to-gray-500'
          }`}
          aria-label={showRegions ? 'Hide regions' : 'Show regions'}
          title={showRegions ? 'Hide Regions' : 'Show Regions'}
        >
          <span className="text-xl">🗺️</span>
        </button>

        {/* Mobile: Bottom Sheet Overlay */}
        {showRegions && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/30 z-40 animate-fade-in"
              onClick={toggleShowRegions}
            />

            {/* Bottom Sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl animate-slide-up max-h-[60vh] overflow-hidden">
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              <div className="px-4 pb-6 overflow-y-auto max-h-[calc(60vh-3rem)]">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">
                  California Regions
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {regions.map((region) => (
                    <div
                      key={region.name}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                    >
                      <div
                        className="w-6 h-6 rounded-lg border-2 border-gray-400 dark:border-gray-500 flex-shrink-0"
                        style={{ backgroundColor: region.bgColor }}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {region.displayName}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                    Counties are colored by region to help you learn California's geography
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  // Desktop: Original sidebar design
  return (
    <div className="absolute top-20 right-4 z-20 w-64">
      {/* Toggle Button with Gradient */}
      <button
        onClick={toggleShowRegions}
        className={`w-full px-6 py-3 rounded-full font-medium text-white shadow-lg transition-all transform hover:scale-105 flex items-center gap-3 ${
          showRegions
            ? 'bg-gradient-to-r from-blue-500 to-teal-400'
            : 'bg-gradient-to-r from-gray-400 to-gray-500'
        }`}
      >
        <span className="text-xl">🗺️</span>
        <span className="flex-1 text-left">{showRegions ? 'Hide Regions' : 'Show Regions'}</span>
      </button>

      {/* Regions Panel - Only show when active */}
      {showRegions && (
        <div className="mt-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border border-gray-100 dark:border-gray-700 animate-fade-in">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Regions of California:
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {regions.map((region) => (
              <div
                key={region.name}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div
                  className="w-5 h-5 rounded border border-gray-400 dark:border-gray-500"
                  style={{ backgroundColor: region.bgColor }}
                />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {region.displayName}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              Counties are colored by their geographic region to help you learn patterns
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
