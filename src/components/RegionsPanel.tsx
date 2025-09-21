import { useGame } from '../context/GameContext';

export default function RegionsPanel() {
  const { showRegions, toggleShowRegions } = useGame();

  const regions = [
    { name: 'Southern California', color: '#ef4444', bgColor: '#fca5a5' },
    { name: 'Bay Area', color: '#3b82f6', bgColor: '#93c5fd' },
    { name: 'Central Valley', color: '#10b981', bgColor: '#86efac' },
    { name: 'Central Coast', color: '#8b5cf6', bgColor: '#c4b5fd' },
    { name: 'Northern California', color: '#f97316', bgColor: '#fdba74' },
    { name: 'Sierra Nevada', color: '#eab308', bgColor: '#fde047' },
    { name: 'North Coast', color: '#14b8a6', bgColor: '#5eead4' },
  ];

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
                  {region.name.replace('California', '').replace('Central ', '')}
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