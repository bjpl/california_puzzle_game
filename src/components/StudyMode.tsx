import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function StudyMode({ onClose }: { onClose: () => void }) {
  const { counties } = useGame();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCounty, setSelectedCounty] = useState<any>(null);

  // Get unique regions
  const regions = Array.from(new Set(counties.map(c => c.region))).sort();

  // Filter counties by region
  const filteredCounties = selectedRegion === 'all'
    ? counties
    : counties.filter(c => c.region === selectedRegion);

  // Sort counties alphabetically
  const sortedCounties = [...filteredCounties].sort((a, b) => a.name.localeCompare(b.name));

  const regionColors: { [key: string]: string } = {
    'Southern California': 'bg-red-50 border-red-400 text-red-900',
    'Bay Area': 'bg-blue-50 border-blue-400 text-blue-900',
    'Central Valley': 'bg-green-50 border-green-400 text-green-900',
    'Central Coast': 'bg-purple-50 border-purple-400 text-purple-900',
    'Northern California': 'bg-orange-50 border-orange-400 text-orange-900',
    'Sierra Nevada': 'bg-yellow-50 border-yellow-400 text-yellow-900',
    'North Coast': 'bg-teal-50 border-teal-400 text-teal-900',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              📚 Study Mode - California Counties
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg px-3 py-1 transition-colors"
            >
              ✕ Close
            </button>
          </div>
          <p className="mt-2 text-blue-100">
            Learn about California's {counties.length} counties. Click on any county to see details!
          </p>
        </div>

        {/* Region Filter */}
        <div className="bg-gray-100 p-4 border-b">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRegion('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedRegion === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Regions ({counties.length})
            </button>
            {regions.map(region => {
              const count = counties.filter(c => c.region === region).length;
              return (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedRegion === region
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {region} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[60vh]">
          {/* County List */}
          <div className="w-1/2 overflow-y-auto border-r">
            <div className="p-4">
              <h3 className="font-semibold text-gray-700 mb-3">
                {selectedRegion === 'all' ? 'All Counties' : selectedRegion}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {sortedCounties.map(county => {
                  const colorClass = regionColors[county.region] || 'bg-gray-50 border-gray-400 text-gray-900';
                  return (
                    <button
                      key={county.id}
                      onClick={() => setSelectedCounty(county)}
                      className={`p-2 border rounded-lg text-left hover:shadow-md transition-all ${
                        selectedCounty?.id === county.id
                          ? 'ring-2 ring-blue-500 shadow-md'
                          : ''
                      } ${colorClass}`}
                    >
                      <div className="font-medium text-sm">{county.name}</div>
                      <div className="text-xs opacity-75">{county.region}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* County Details */}
          <div className="w-1/2 p-6 bg-gray-50">
            {selectedCounty ? (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedCounty.name} County
                </h3>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                  regionColors[selectedCounty.region] || 'bg-gray-100 text-gray-700'
                }`}>
                  {selectedCounty.region}
                </div>

                <div className="space-y-4">
                  {selectedCounty.capital && (
                    <div>
                      <h4 className="font-semibold text-gray-700">County Seat</h4>
                      <p className="text-gray-600">{selectedCounty.capital}</p>
                    </div>
                  )}

                  {selectedCounty.population && (
                    <div>
                      <h4 className="font-semibold text-gray-700">Population</h4>
                      <p className="text-gray-600">
                        {selectedCounty.population.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {selectedCounty.area && (
                    <div>
                      <h4 className="font-semibold text-gray-700">Area</h4>
                      <p className="text-gray-600">
                        {selectedCounty.area.toLocaleString()} square miles
                      </p>
                    </div>
                  )}

                  {selectedCounty.founded && (
                    <div>
                      <h4 className="font-semibold text-gray-700">Founded</h4>
                      <p className="text-gray-600">{selectedCounty.founded}</p>
                    </div>
                  )}

                  {selectedCounty.funFact && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        💡 Fun Fact
                      </h4>
                      <p className="text-blue-800">{selectedCounty.funFact}</p>
                    </div>
                  )}
                </div>

                {/* Study Tips */}
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    📍 Location Tip
                  </h4>
                  <p className="text-yellow-800 text-sm">
                    {selectedCounty.name} is located in {selectedCounty.region}.
                    Try to remember its position relative to other counties in the region!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <span className="text-6xl mb-4">📖</span>
                <p className="text-lg font-medium">Select a county to study</p>
                <p className="text-sm mt-2">Click on any county card to see details</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 border-t">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Studying {filteredCounties.length} counties
              {selectedRegion !== 'all' && ` in ${selectedRegion}`}
            </p>
            <button
              onClick={onClose}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Return to Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}