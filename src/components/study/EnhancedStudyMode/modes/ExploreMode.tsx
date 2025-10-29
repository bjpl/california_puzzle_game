import { County, ExtendedCounty } from '../../../../types/game-types';
import { StudyProgress } from '../types';
import { getRegionGradient } from '../utils/regionHelpers';
import { getRelatedCounties } from '../../../../data/countyEducation';

interface ExploreModeProps {
  counties: County[];
  sortedCounties: County[];
  selectedCounty: County | null;
  selectedRegion: string;
  contentTab: ContentTab;
  progress: StudyProgress;
  isMobile: boolean;
  educationContent: {
    historicalContext: string;
    economicImportance: string;
    uniqueFeatures: string;
    culturalHeritage: string;
    geographicalSignificance: string;
    specificData?: {
      historicalEvents?: Array<{ year: number; event: string } | string>;
      industries?: string[];
      majorAttractions?: string[];
      climate?: string;
      elevation?: string;
    };
  } | null;
  memoryAid: {
    locationMnemonic: string;
    shapeMnemonic: string;
    rhymes?: string | string[];
    visualCues: string[];
  } | null;
  onContentTabChange: (tab: ContentTab) => void;
  onCountySelect: (county: County) => void;
  onSelectedCountyChange: (county: County | null) => void;
}

type ContentTab = 'overview' | 'history' | 'economy' | 'culture' | 'geography' | 'memory';

export default function ExploreMode({
  sortedCounties,
  selectedCounty,
  selectedRegion,
  contentTab,
  progress,
  isMobile,
  educationContent,
  memoryAid,
  counties,
  onContentTabChange,
  onCountySelect,
  onSelectedCountyChange,
}: ExploreModeProps) {
  return (
    <>
      {/* County List - Responsive: Hidden on mobile when county selected */}
      <div
        className={`${selectedCounty ? 'hidden md:block' : 'block'} w-full md:w-1/3 lg:w-1/4 xl:w-1/5 min-w-[280px] max-w-[400px] border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto max-h-screen county-tray-scroll`}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base sm:text-lg">
            {selectedRegion === 'all' ? 'All Counties' : selectedRegion}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {sortedCounties.length} counties
          </p>
        </div>
        <div className="p-4 space-y-2">
          {sortedCounties.map((county) => {
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

      {/* County Details - Responsive: Shows on mobile when county selected */}
      <div
        className={`${selectedCounty ? 'block' : 'hidden md:block'} flex-1 flex flex-col bg-gray-50 dark:bg-gray-800`}
      >
        {/* Mobile Back Button */}
        {selectedCounty && (
          <div className="md:hidden sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 z-10">
            <button
              onClick={() => onSelectedCountyChange(null)}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium min-h-[44px] active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back to County List</span>
            </button>
          </div>
        )}
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-6xl mx-auto w-full">
          {selectedCounty ? (
            <div>
              {/* County Header - Enhanced */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
                  <div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                      {selectedCounty.name} County
                    </h3>
                    <div
                      className={`inline-block px-5 py-2.5 rounded-full text-white font-semibold bg-gradient-to-r shadow-lg ${getRegionGradient(
                        selectedCounty.region
                      )}`}
                    >
                      {selectedCounty.region}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    {selectedCounty.founded && (
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Established
                      </div>
                    )}
                    <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {selectedCounty.founded || selectedCounty.established || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Tabs - Enhanced Design */}
              {isMobile ? (
                <div className="mb-6">
                  <select
                    value={contentTab}
                    onChange={(e) => onContentTabChange(e.target.value as ContentTab)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-base font-medium min-h-[44px] shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="overview">📊 Overview</option>
                    <option value="history">📜 History</option>
                    <option value="economy">💼 Economy</option>
                    <option value="culture">🎭 Culture</option>
                    <option value="geography">🗺️ Geography</option>
                    <option value="memory">🧠 Memory Aid</option>
                  </select>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 mb-6 overflow-x-auto">
                  <div className="flex gap-1 min-w-max">
                    {[
                      { id: 'overview' as ContentTab, label: 'Overview', icon: '📊' },
                      { id: 'history' as ContentTab, label: 'History', icon: '📜' },
                      { id: 'economy' as ContentTab, label: 'Economy', icon: '💼' },
                      { id: 'culture' as ContentTab, label: 'Culture', icon: '🎭' },
                      { id: 'geography' as ContentTab, label: 'Geography', icon: '🗺️' },
                      { id: 'memory' as ContentTab, label: 'Memory Aid', icon: '🧠' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => onContentTabChange(tab.id)}
                        className={`
                          flex-shrink-0 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg
                          font-medium transition-all duration-200
                          ${
                            contentTab === tab.id
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }
                        `}
                      >
                        <span className="text-base sm:text-lg">{tab.icon}</span>
                        <span className="whitespace-nowrap">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Content - Improved Spacing */}
              <div className="space-y-6">
                {contentTab === 'overview' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700 shadow-sm">
                        <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-4 text-base sm:text-lg flex items-center gap-2">
                          <span className="text-xl sm:text-2xl">📊</span> Quick Facts
                        </h4>
                        <div className="space-y-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          <div>
                            <strong className="text-gray-900 dark:text-gray-100">
                              County Seat:
                            </strong>{' '}
                            <span className="text-gray-700 dark:text-gray-300">
                              {selectedCounty?.capital || selectedCounty?.countySeat || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <strong className="text-gray-900 dark:text-gray-100">
                              Population:
                            </strong>{' '}
                            <span className="text-gray-700 dark:text-gray-300">
                              {selectedCounty?.population
                                ? selectedCounty.population.toLocaleString()
                                : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <strong className="text-gray-900 dark:text-gray-100">Area:</strong>{' '}
                            <span className="text-gray-700 dark:text-gray-300">
                              {selectedCounty?.area
                                ? `${selectedCounty.area.toLocaleString()} sq mi`
                                : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <strong className="text-gray-900 dark:text-gray-100">
                              Established:
                            </strong>{' '}
                            <span className="text-gray-700 dark:text-gray-300">
                              {selectedCounty?.founded || selectedCounty?.established || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <strong className="text-gray-900 dark:text-gray-100">Region:</strong>{' '}
                            <span className="text-gray-700 dark:text-gray-300">
                              {selectedCounty?.region || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <strong className="text-gray-900 dark:text-gray-100">
                              Difficulty:
                            </strong>{' '}
                            <span className="text-gray-700 dark:text-gray-300">
                              {selectedCounty?.difficulty
                                ? selectedCounty.difficulty.charAt(0).toUpperCase() +
                                  selectedCounty.difficulty.slice(1)
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700 shadow-sm">
                        <h4 className="font-bold text-green-900 dark:text-green-100 mb-4 text-base sm:text-lg flex items-center gap-2">
                          <span className="text-xl sm:text-2xl">🎉</span> Fun Facts
                        </h4>
                        {selectedCounty.funFacts && selectedCounty.funFacts.length > 0 ? (
                          <ul className="text-xs sm:text-sm text-green-800 dark:text-green-200 space-y-1">
                            {selectedCounty.funFacts
                              .slice(0, 3)
                              .map((fact: string, idx: number) => (
                                <li key={idx} className="text-xs">
                                  • {fact}
                                </li>
                              ))}
                          </ul>
                        ) : selectedCounty.funFact ? (
                          <p className="text-sm text-green-800">{selectedCounty.funFact}</p>
                        ) : (
                          <p className="text-sm text-green-800 italic">No fun facts available</p>
                        )}
                      </div>
                    </div>

                    {/* Natural Features and Economic Focus */}
                    {(selectedCounty.naturalFeatures || selectedCounty.economicFocus) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedCounty.naturalFeatures &&
                          selectedCounty.naturalFeatures.length > 0 && (
                            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700">
                              <h4 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-2">
                                🏔️ Natural Features
                              </h4>
                              <ul className="text-sm text-cyan-800 dark:text-cyan-200 space-y-1">
                                {selectedCounty.naturalFeatures
                                  .slice(0, 3)
                                  .map((feature: string, idx: number) => (
                                    <li key={idx}>• {feature}</li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        {selectedCounty.economicFocus &&
                          selectedCounty.economicFocus.length > 0 && (
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                                💼 Economic Focus
                              </h4>
                              <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                                {selectedCounty.economicFocus
                                  .slice(0, 3)
                                  .map((focus: string, idx: number) => (
                                    <li key={idx}>• {focus}</li>
                                  ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    )}
                    {educationContent && (
                      <>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                          <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            Historical Context
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {educationContent.historicalContext}
                          </p>
                        </div>
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                          <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            Economic Importance
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {educationContent.economicImportance}
                          </p>
                        </div>
                        {educationContent.specificData?.majorAttractions && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Major Attractions</h4>
                            <div className="flex flex-wrap gap-2">
                              {educationContent.specificData.majorAttractions.map(
                                (attraction: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-purple-100 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200 rounded-full text-sm"
                                  >
                                    {attraction}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {contentTab === 'history' && (
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
                      Historical Context
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      {educationContent?.historicalContext || 'No historical context available.'}
                    </p>
                    {educationContent?.specificData?.historicalEvents && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Key Historical Events</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {educationContent.specificData.historicalEvents.map(
                            (event: { year: number; event: string } | string, idx: number) => (
                              <li key={idx} className="text-gray-600">
                                {typeof event === 'string'
                                  ? event
                                  : `${event.year}: ${event.event}`}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {contentTab === 'economy' && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Economic Importance</h4>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {educationContent?.economicImportance || 'No economic data available.'}
                    </p>
                    {educationContent?.specificData?.industries && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Major Industries</h5>
                        <div className="flex flex-wrap gap-2">
                          {educationContent.specificData.industries.map(
                            (industry: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                              >
                                {industry}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {contentTab === 'culture' && (
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
                      Cultural Heritage
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      {educationContent?.culturalHeritage || 'No cultural heritage data available.'}
                    </p>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 mt-6">
                      Unique Features
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {educationContent?.uniqueFeatures || 'No unique features data available.'}
                    </p>
                  </div>
                )}

                {contentTab === 'geography' && (
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
                      Geographical Significance
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      {educationContent?.geographicalSignificance ||
                        'No geographical data available.'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h5 className="font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Climate
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {educationContent?.specificData?.climate || 'N/A'}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h5 className="font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Elevation
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {educationContent?.specificData?.elevation || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {contentTab === 'memory' && memoryAid && (
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
                      Memory Aids
                    </h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h5 className="font-medium text-yellow-900 mb-2">📍 Location Memory Aid</h5>
                        <p className="text-yellow-800">{memoryAid.locationMnemonic}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-blue-900 mb-2">🔷 Shape Memory Aid</h5>
                        <p className="text-blue-800">{memoryAid.shapeMnemonic}</p>
                      </div>
                      {memoryAid.rhymes && (
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <h5 className="font-medium text-purple-900 mb-2">🎵 Rhyme to Remember</h5>
                          <p className="text-purple-800 italic">{memoryAid.rhymes}</p>
                        </div>
                      )}
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Visual Cues</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {memoryAid.visualCues.map((cue, idx) => (
                            <li key={idx} className="text-gray-600">
                              {cue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Natural Features & Landmarks */}
              {(selectedCounty.naturalFeatures || selectedCounty.culturalLandmarks) && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedCounty.naturalFeatures && (
                    <div className="p-4 bg-teal-50 rounded-lg">
                      <h4 className="font-semibold text-teal-900 mb-2">🏔️ Natural Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCounty.naturalFeatures.map((feature: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-sm"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedCounty.culturalLandmarks && (
                    <div className="p-4 bg-pink-50 rounded-lg">
                      <h4 className="font-semibold text-pink-900 mb-2">🏛️ Cultural Landmarks</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCounty.culturalLandmarks.map((landmark: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-sm"
                          >
                            {landmark}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Related Counties */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  🔗 Related Counties to Study
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    // Try both ID formats (with hyphens and underscores)
                    const normalizedId = selectedCounty.id.toLowerCase().replace(/-/g, '_');
                    let relatedIds = getRelatedCounties(normalizedId);

                    // If no related counties found, try the original ID
                    if (relatedIds.length === 0) {
                      relatedIds = getRelatedCounties(selectedCounty.id);
                    }

                    // If still no related counties, show neighboring counties from same region
                    if (relatedIds.length === 0) {
                      relatedIds = counties
                        .filter(
                          (c) => c.region === selectedCounty.region && c.id !== selectedCounty.id
                        )
                        .slice(0, 6)
                        .map((c) => c.id);
                    }

                    return relatedIds.slice(0, 6).map((countyId) => {
                      // Try to find the county with both ID formats
                      const relatedCounty = counties.find(
                        (c) =>
                          c.id === countyId ||
                          c.id === countyId.replace(/_/g, '-') ||
                          c.id.toLowerCase().replace(/-/g, '_') === countyId
                      );

                      if (!relatedCounty) return null;

                      return (
                        <button
                          key={countyId}
                          onClick={() => onCountySelect(relatedCounty)}
                          className="px-3 py-1 min-h-[44px] bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700 hover:text-gray-900"
                        >
                          {relatedCounty.name}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <span className="text-6xl mb-4">📖</span>
              <p className="text-lg font-medium">Select a county to begin studying</p>
              <p className="text-sm mt-2">
                Explore comprehensive educational content for all 58 counties
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
