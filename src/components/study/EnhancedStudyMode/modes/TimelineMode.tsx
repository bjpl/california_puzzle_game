/**
 * TimelineMode Component
 * Extracted from EnhancedStudyMode.tsx
 *
 * Displays California counties on a historical timeline organized by decade.
 * Features:
 * - Timeline visualization by decade
 * - County cards on timeline
 * - Desktop side panel with county details
 * - Mobile bottom sheet for county details
 * - Decade grouping logic
 */

import React, { useState } from 'react';
import { getCountyEducation } from '../../../../data/countyEducation';
import { getCountyEducationComplete } from '../../../../data/countyEducationComplete';
import CountyShapeDisplay from '../../../county/CountyShapeDisplay';
import MobileBottomSheet from '../components/MobileBottomSheet';
import type { TimelineModeProps } from '../types';
import type { County, ExtendedCounty } from '../../../../types/game-types';

interface TimelineModeComponentProps extends TimelineModeProps {
  isMobile: boolean;
  onRegionChange: (region: string) => void;
}

const TimelineMode: React.FC<TimelineModeComponentProps> = ({
  counties,
  selectedRegion: _selectedRegion,
  selectedCounty,
  onCountySelect,
  isMobile,
  onRegionChange,
}) => {
  const [showMobileBottomSheet, setShowMobileBottomSheet] = useState(false);

  // Sort counties alphabetically
  const sortedCounties = [...counties].sort((a, b) => a.name.localeCompare(b.name));

  // Handle county selection
  const handleCountySelect = (county: County) => {
    onCountySelect(county);
    if (isMobile) {
      setShowMobileBottomSheet(true);
    }
  };

  // Get education content for selected county
  const educationContent = selectedCounty
    ? getCountyEducationComplete(selectedCounty.id) || getCountyEducation(selectedCounty.id)
    : null;

  // Group counties by decade
  const countiesByDecade = sortedCounties.reduce((acc: Record<string, County[]>, county) => {
    const established = (county as ExtendedCounty).established;
    const year =
      county.founded ||
      (typeof established === 'number' ? established : parseInt(established || '0'));
    if (year) {
      const decade = Math.floor(year / 10) * 10;
      if (!acc[decade]) acc[decade] = [];
      acc[decade].push(county);
    }
    return acc;
  }, {});

  const sortedDecades = Object.keys(countiesByDecade).sort((a, b) => Number(a) - Number(b));

  return (
    <div
      className={`flex-1 flex ${isMobile ? 'flex-col' : 'gap-6'} bg-gradient-to-br from-gray-50 to-amber-50 dark:from-gray-900 dark:to-amber-950 overflow-hidden p-4 sm:p-6 md:p-8`}
    >
      {/* Main Timeline Area - Left Side */}
      <div className="flex-1 overflow-y-auto pr-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          📅 California Counties Timeline
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-5">
          {isMobile
            ? 'Tap any county to view details'
            : 'Click any county to view detailed information →'}
        </p>

        {/* Timeline visualization */}
        <div className="space-y-5">
          {sortedDecades.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Counties Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No counties match the selected region filter.
              </p>
              <button
                onClick={() => onRegionChange('all')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Show All Counties
              </button>
            </div>
          ) : (
            sortedDecades.map((decade) => (
              <div key={decade} className="relative">
                {/* Decade Header */}
                <div className="flex items-center mb-3">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold shadow-lg text-base sm:text-lg md:text-xl">
                    {decade}s
                  </div>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-gray-300 to-transparent ml-2 sm:ml-4"></div>
                </div>

                {/* Counties in this decade */}
                <div className={`flex flex-wrap gap-2 sm:gap-3 ${isMobile ? 'ml-0' : 'ml-6'}`}>
                  {(countiesByDecade[decade] || [])
                    .sort((a: County, b: County) => {
                      const establishedA = (a as ExtendedCounty).established;
                      const establishedB = (b as ExtendedCounty).established;
                      const yearA =
                        a.founded ||
                        (typeof establishedA === 'number'
                          ? establishedA
                          : parseInt(establishedA || '0'));
                      const yearB =
                        b.founded ||
                        (typeof establishedB === 'number'
                          ? establishedB
                          : parseInt(establishedB || '0'));
                      return yearA - yearB;
                    })
                    .map((county: County) => (
                      <button
                        key={county.id}
                        onClick={() => handleCountySelect(county)}
                        className={`${isMobile ? 'flex-1 min-w-[calc(50%-0.25rem)]' : 'min-w-[140px] max-w-[180px]'} p-2.5 sm:p-3 rounded-xl border-2 transition-all transform hover:scale-105 ${
                          selectedCounty?.id === county.id
                            ? 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-500 dark:border-blue-700 shadow-lg scale-105'
                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md hover:bg-blue-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {county.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {county.founded || (county as ExtendedCounty).established}
                        </div>
                        {selectedCounty?.id === county.id && !isMobile && (
                          <div className="mt-0.5">
                            <span className="text-xs text-blue-600 font-bold">✓ Selected</span>
                          </div>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Side Panel for County Details - Desktop Only */}
      {!isMobile && (
        <div className="w-80 flex-shrink-0">
          {selectedCounty ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-5 border-2 border-gray-100 dark:border-gray-700 h-full overflow-y-auto">
              <div className="mb-4">
                {/* Header with County Shape */}
                <div className="flex items-start gap-3 mb-3">
                  <CountyShapeDisplay
                    countyId={selectedCounty.id}
                    size={75}
                    className="flex-shrink-0 shadow-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      {selectedCounty.name} County
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {selectedCounty.region}
                    </p>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <h4 className="font-bold text-blue-900 mb-1 text-sm flex items-center gap-2">
                    <span>📅</span> Established
                  </h4>
                  <p className="text-2xl font-bold text-blue-700">
                    {selectedCounty.founded ||
                      (selectedCounty as ExtendedCounty).established ||
                      'Unknown'}
                  </p>
                </div>

                <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <h4 className="font-bold text-purple-900 mb-1 text-sm flex items-center gap-2">
                    <span>🏛️</span> County Seat
                  </h4>
                  <p className="text-lg font-semibold text-purple-700">
                    {selectedCounty.capital ||
                      (selectedCounty as ExtendedCounty).countySeat ||
                      'N/A'}
                  </p>
                </div>

                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <h4 className="font-bold text-green-900 mb-1 text-sm flex items-center gap-2">
                    <span>📍</span> Region
                  </h4>
                  <p className="text-base font-medium text-green-700">
                    {selectedCounty.region || 'N/A'}
                  </p>
                </div>

                {selectedCounty.population && (
                  <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                    <h4 className="font-bold text-amber-900 mb-1 text-sm flex items-center gap-2">
                      <span>👥</span> Population
                    </h4>
                    <p className="text-base font-semibold text-amber-700">
                      {selectedCounty.population.toLocaleString()}
                    </p>
                  </div>
                )}

                {educationContent && (
                  <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <h4 className="font-bold text-gray-800 mb-2 text-sm flex items-center gap-2">
                      <span>📚</span> Historical Context
                    </h4>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {educationContent.historicalContext}
                    </p>
                  </div>
                )}

                {(selectedCounty as ExtendedCounty).funFacts &&
                  (selectedCounty as ExtendedCounty).funFacts &&
                  (selectedCounty as ExtendedCounty).funFacts!.length > 0 && (
                    <div className="p-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl">
                      <h4 className="font-bold text-yellow-900 mb-2 text-sm flex items-center gap-2">
                        <span>✨</span> Fun Facts
                      </h4>
                      <ul className="space-y-1">
                        {(selectedCounty as ExtendedCounty)
                          .funFacts!.slice(0, 3)
                          .map((fact: string, idx: number) => (
                            <li key={idx} className="text-xs text-yellow-800 flex gap-1.5">
                              <span className="text-yellow-600">•</span>
                              <span>{fact}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          ) : (
            <div className="sticky top-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-600 h-[400px] flex flex-col items-center justify-center text-center">
              <span className="text-5xl mb-3 opacity-50">📋</span>
              <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                Select a County
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Click on any county from the timeline to view its detailed historical information
                and facts.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mobile Bottom Sheet for Timeline - Slides up from bottom */}
      {isMobile && selectedCounty && (
        <MobileBottomSheet
          isOpen={showMobileBottomSheet}
          onClose={() => setShowMobileBottomSheet(false)}
          maxHeight="80vh"
          showDragHandle={true}
        >
          <div className="mb-4">
            {/* Header with County Shape */}
            <div className="flex items-start gap-3 mb-3">
              <CountyShapeDisplay
                countyId={selectedCounty.id}
                size={60}
                className="flex-shrink-0 shadow-lg"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {selectedCounty.name} County
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {selectedCounty.region}
                </p>
              </div>
              <button
                onClick={() => setShowMobileBottomSheet(false)}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <h4 className="font-bold text-blue-900 mb-1 text-sm flex items-center gap-2">
                <span>📅</span> Established
              </h4>
              <p className="text-2xl font-bold text-blue-700">
                {selectedCounty.founded ||
                  (selectedCounty as ExtendedCounty).established ||
                  'Unknown'}
              </p>
            </div>

            <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <h4 className="font-bold text-purple-900 mb-1 text-sm flex items-center gap-2">
                <span>🏛️</span> County Seat
              </h4>
              <p className="text-lg font-semibold text-purple-700">
                {selectedCounty.capital || (selectedCounty as ExtendedCounty).countySeat || 'N/A'}
              </p>
            </div>

            <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <h4 className="font-bold text-green-900 mb-1 text-sm flex items-center gap-2">
                <span>📍</span> Region
              </h4>
              <p className="text-base font-medium text-green-700">
                {selectedCounty.region || 'N/A'}
              </p>
            </div>

            {selectedCounty.population && (
              <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                <h4 className="font-bold text-amber-900 mb-1 text-sm flex items-center gap-2">
                  <span>👥</span> Population
                </h4>
                <p className="text-base font-semibold text-amber-700">
                  {selectedCounty.population.toLocaleString()}
                </p>
              </div>
            )}

            {(() => {
              const educationContent =
                getCountyEducationComplete(selectedCounty.id) ||
                getCountyEducation(selectedCounty.id);
              return educationContent ? (
                <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <h4 className="font-bold text-gray-800 mb-2 text-sm flex items-center gap-2">
                    <span>📚</span> Historical Context
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {educationContent.historicalContext}
                  </p>
                </div>
              ) : null;
            })()}

            {(selectedCounty as ExtendedCounty).funFacts &&
              (selectedCounty as ExtendedCounty).funFacts &&
              (selectedCounty as ExtendedCounty).funFacts!.length > 0 && (
                <div className="p-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl">
                  <h4 className="font-bold text-yellow-900 mb-2 text-sm flex items-center gap-2">
                    <span>✨</span> Fun Facts
                  </h4>
                  <ul className="space-y-1">
                    {(selectedCounty as ExtendedCounty)
                      .funFacts!.slice(0, 3)
                      .map((fact: string, idx: number) => (
                        <li key={idx} className="text-xs text-yellow-800 flex gap-1.5">
                          <span className="text-yellow-600">•</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
          </div>
        </MobileBottomSheet>
      )}
    </div>
  );
};

export default TimelineMode;
