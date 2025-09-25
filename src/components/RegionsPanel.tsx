import { useGame } from '../context/GameContext';
import { REGION_COLORS, getRegionColor } from '../config/regionColors';

export default function RegionsPanel() {
  const { showRegions, toggleShowRegions } = useGame();

  // Use centralized color configuration with proper light colors
  const regions = Object.keys(REGION_COLORS).map(regionName => {
    const colorConfig = getRegionColor(regionName);
    // Abbreviate names for display
    let displayName = regionName
      .replace('California', '')
      .replace('Central ', '')
      .trim();

    if (displayName === 'Southern') displayName = 'Southern';
    if (displayName === 'Northern') displayName = 'Northern';
    if (displayName === 'Central Valley') displayName = 'Valley';
    if (displayName === 'Central Coast') displayName = 'Coast';

    return {
      name: regionName,
      displayName,
      color: colorConfig.hex,
      bgColor: colorConfig.hexLight // Use proper light hex color
    };
  });

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
        <span className="flex-1 text-left">
          {showRegions ? 'Hide Regions' : 'Show Regions'}
        </span>
      </button>

      {/* Regions Panel - Only show when active */}
      {showRegions && (
        <div className="mt-3 bg-white rounded-2xl shadow-xl p-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Regions of California:
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {regions.map(region => (
              <div
                key={region.name}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-5 h-5 rounded border border-gray-400"
                  style={{ backgroundColor: region.bgColor }}
                />
                <span className="text-xs font-medium text-gray-700">
                  {region.displayName}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 italic">
              Counties are colored by their geographic region to help you learn patterns
            </p>
          </div>
        </div>
      )}
    </div>
  );
}