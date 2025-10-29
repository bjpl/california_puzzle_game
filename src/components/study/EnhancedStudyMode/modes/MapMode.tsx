import { useState } from 'react';
import StudyModeMap from '../../../map/StudyModeMap';
import CountyShapeDisplay from '../../../county/CountyShapeDisplay';
import MobileBottomSheet from '../components/MobileBottomSheet';
import type { MapModeProps } from '../types';

/**
 * MapMode - Interactive map view with county information
 *
 * Features:
 * - Interactive California map with hover and click support
 * - Desktop: Side panel with county details
 * - Mobile: Floating button + bottom sheet for county info
 * - Region-based color coding with legend
 * - Educational content integration
 */
export default function MapMode({
  counties,
  selectedRegion,
  selectedCounty,
  progress: _progress,
  isMobile = false,
  educationContent = null,
  onCountySelect,
  onShowEducationalContent: _onShowEducationalContent,
  onShowEducationalModal = () => {},
  onShowCountyDetailsModal = () => {},
}: MapModeProps) {
  const [showMapCountyList, setShowMapCountyList] = useState(false);

  // Filter counties by region
  const filteredCounties =
    selectedRegion === 'all' ? counties : counties.filter((c) => c.region === selectedRegion);

  // Sort counties alphabetically
  const sortedCounties = [...filteredCounties].sort((a, b) => a.name.localeCompare(b.name));

  const handleCountySelect = (county: typeof selectedCounty) => {
    if (county) {
      onCountySelect(county);
      onShowCountyDetailsModal();
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 overflow-y-auto">
      <div className="h-full w-full p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            🗺️ Interactive County Map
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Hover to see • Click to select
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map Display Area - Responsive height with mobile support */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg p-3 h-[60vh] sm:h-[65vh] lg:h-[calc(100vh-240px)]">
            <StudyModeMap
              onCountySelect={(countyId) => {
                const county = counties.find(
                  (c) => c.id === countyId || c.id === countyId.replace(/-/g, '_')
                );
                if (county) {
                  handleCountySelect(county);
                }
              }}
              selectedCounty={selectedCounty as unknown as Record<string, unknown> | undefined}
              filteredCounties={sortedCounties as unknown as Record<string, unknown>[]}
              showAllCounties={selectedRegion === 'all'}
            />
          </div>

          {/* County Info Panel - Desktop Only */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">
              📍 County Information
            </h3>
            {selectedCounty ? (
              <div className="space-y-4">
                {/* County Shape and Name */}
                <div className="flex items-start gap-4">
                  <CountyShapeDisplay
                    countyId={selectedCounty.id}
                    size={90}
                    className="flex-shrink-0 shadow-md"
                  />
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                      {selectedCounty.name}
                    </h4>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {selectedCounty.region}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded inline-block">
                      County ID: {selectedCounty.id}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      County Seat:
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {selectedCounty.capital || selectedCounty.countySeat || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Population:
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {selectedCounty.population?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Area:</span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {selectedCounty.area
                        ? `${selectedCounty.area.toLocaleString()} sq mi`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Established:
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {selectedCounty.founded || selectedCounty.established || 'N/A'}
                    </span>
                  </div>
                </div>

                {selectedCounty.funFact && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Fun Fact:</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      {selectedCounty.funFact}
                    </p>
                  </div>
                )}

                {selectedCounty.funFacts && selectedCounty.funFacts.length > 0 && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Interesting Facts:
                    </h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {selectedCounty.funFacts.slice(0, 3).map((fact: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {educationContent && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={onShowEducationalModal}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                      <span>View Full Educational Content</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">👆</div>
                <p className="text-gray-500 dark:text-gray-400">
                  Hover over counties to see their names
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Click on a county to view detailed information
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Floating Button - Show County Info */}
        {isMobile && (
          <button
            onClick={() => setShowMapCountyList(true)}
            className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-200"
            aria-label="Show county information"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        )}

        {/* Mobile Bottom Sheet - County Information */}
        <MobileBottomSheet
          isOpen={showMapCountyList && isMobile}
          onClose={() => setShowMapCountyList(false)}
          title="📍 County Information"
          maxHeight="80vh"
        >
          {selectedCounty ? (
            <div className="space-y-4">
              {/* County Shape and Name */}
              <div className="flex items-start gap-4">
                <CountyShapeDisplay
                  countyId={selectedCounty.id}
                  size={90}
                  className="flex-shrink-0 shadow-md"
                />
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                    {selectedCounty.name}
                  </h4>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {selectedCounty.region}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded inline-block">
                    County ID: {selectedCounty.id}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">County Seat:</span>
                  <span className="text-gray-800 dark:text-gray-200">
                    {selectedCounty.capital || selectedCounty.countySeat || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Population:</span>
                  <span className="text-gray-800 dark:text-gray-200">
                    {selectedCounty.population?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Area:</span>
                  <span className="text-gray-800 dark:text-gray-200">
                    {selectedCounty.area ? `${selectedCounty.area.toLocaleString()} sq mi` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Established:</span>
                  <span className="text-gray-800 dark:text-gray-200">
                    {selectedCounty.founded || selectedCounty.established || 'N/A'}
                  </span>
                </div>
              </div>

              {selectedCounty.funFact && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Fun Fact:</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {selectedCounty.funFact}
                  </p>
                </div>
              )}

              {selectedCounty.funFacts && selectedCounty.funFacts.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interesting Facts:
                  </h5>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {selectedCounty.funFacts.slice(0, 3).map((fact: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {educationContent && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      onShowEducationalModal();
                      setShowMapCountyList(false);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    <span>View Full Educational Content</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">👆</div>
              <p className="text-gray-500 dark:text-gray-400">Tap on a county on the map</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                to view detailed information
              </p>
            </div>
          )}
        </MobileBottomSheet>

        {/* Region Legend */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
            🎨 Color Legend by Region:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }} />
              <span className="text-sm text-gray-700 dark:text-gray-300">Bay Area</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }} />
              <span className="text-sm text-gray-700 dark:text-gray-300">Southern California</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }} />
              <span className="text-sm text-gray-700 dark:text-gray-300">Central Valley</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#A855F7' }} />
              <span className="text-sm text-gray-700 dark:text-gray-300">Central Coast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }} />
              <span className="text-sm text-gray-700 dark:text-gray-300">Northern California</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#06B6D4' }} />
              <span className="text-sm text-gray-700 dark:text-gray-300">North Coast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8B5CF6' }} />
              <span className="text-sm text-gray-700 dark:text-gray-300">Sierra Nevada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
