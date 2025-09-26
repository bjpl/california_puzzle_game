import React, { useState, useEffect, useRef } from 'react';
import { realCaliforniaCountyShapes } from '../data/californiaCountyBoundaries';
import { allCaliforniaCounties } from '../data/californiaCountiesComplete';
import { getRegionHexColor } from '../config/regionColors';
import { countyEducationData } from '../data/countyEducationComplete';

interface HistoricalEvent {
  year: number;
  label: string;
  icon: string;
  description: string;
}

const HISTORICAL_EVENTS: HistoricalEvent[] = [
  { year: 1850, label: 'California Statehood', icon: '🌟', description: 'California joins the Union as the 31st state. The original 27 counties form the foundation of the state\'s governance.' },
  { year: 1849, label: 'Gold Rush Peak', icon: '⛏️', description: 'Over 300,000 people flood to California seeking fortune, transforming the territory overnight.' },
  { year: 1861, label: 'Civil War Begins', icon: '🎖️', description: 'Despite being far from the conflict, California remains loyal to the Union and continues to grow westward.' },
  { year: 1869, label: 'Transcontinental Railroad', icon: '🚂', description: 'The railroad connects California to the rest of the nation, accelerating development and settlement.' },
  { year: 1906, label: 'Great Earthquake', icon: '🌋', description: 'A devastating 7.9 earthquake destroys much of San Francisco, but the city rebuilds stronger.' },
  { year: 1907, label: 'California Complete', icon: '🏜️', description: 'Imperial County becomes the 58th and final county, completing California\'s geographic organization.' }
];

type PlaybackSpeed = 0.5 | 1 | 2 | 5;

export default function CountyFormationAnimation() {
  const [currentYear, setCurrentYear] = useState(1850);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [visibleCounties, setVisibleCounties] = useState<Set<string>>(new Set());
  const [recentlyAdded, setRecentlyAdded] = useState<string[]>([]);
  const [highlightedCounty, setHighlightedCounty] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showCompletion, setShowCompletion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(true);
  const [hasShownInitialYear, setHasShownInitialYear] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(true);

  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());
  const hasAddedCountiesRef = useRef<boolean>(false);
  const shouldPauseRef = useRef<boolean>(false);

  const countiesByYear = React.useMemo(() => {
    const grouped = new Map<number, string[]>();
    allCaliforniaCounties.forEach(county => {
      const year = county.founded;
      if (!grouped.has(year)) {
        grouped.set(year, []);
      }
      grouped.get(year)!.push(county.id);
    });
    return grouped;
  }, []);

  const totalCounties = allCaliforniaCounties.length;
  const currentCount = visibleCounties.size;

  const getCountyInfo = (countyId: string) => {
    return allCaliforniaCounties.find(c => c.id === countyId);
  };

  const getCountyPath = (countyId: string) => {
    return realCaliforniaCountyShapes.find(
      c => c.id === countyId || c.id === countyId.replace(/_/g, '-') || c.id === countyId.replace(/-/g, '_')
    );
  };

  const getCountyEducation = (countyId: string) => {
    const normalizedId = countyId.replace(/-/g, '_');
    return countyEducationData.find(ed => ed.countyId === normalizedId);
  };

  const getFoundingStory = (countyId: string): string => {
    const education = getCountyEducation(countyId);
    if (!education) return '';

    // Extract a concise founding snippet from historicalContext
    const context = education.historicalContext;
    const sentences = context.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);

    // Find sentence mentioning founding/established/created
    const foundingSentence = sentences.find(s =>
      s.match(/founded|established|created|formed|separated|divided/i)
    );

    if (foundingSentence && foundingSentence.length < 200) {
      return foundingSentence + '.';
    }

    // Otherwise return first 2 sentences
    return sentences.slice(0, 2).join('. ') + '.';
  };

  const addCountiesForYear = (year: number) => {
    const newCounties = countiesByYear.get(year) || [];
    if (newCounties.length > 0) {
      setVisibleCounties(prev => {
        const updated = new Set(prev);
        newCounties.forEach(id => updated.add(id));
        return updated;
      });
      setRecentlyAdded(newCounties);
      setHighlightedCounty(newCounties[0]);

      // Auto-pause when counties are founded (if enabled)
      const isInitialYear = year === 1850 && !hasShownInitialYear;

      if (autoPauseEnabled) {
        if (isInitialYear) {
          // For 1850, pause immediately but delay showing Continue button
          shouldPauseRef.current = true;
          setIsPlaying(false);
          setIsPaused(true);
          setShowContinueButton(false);
          setTimeout(() => {
            setShowContinueButton(true);
          }, 2500);
          setHasShownInitialYear(true);
        } else {
          // For all other years, pause immediately with button
          shouldPauseRef.current = true;
          setIsPlaying(false);
          setIsPaused(true);
          setShowContinueButton(true);
        }
      } else if (isInitialYear) {
        setHasShownInitialYear(true);
      }

      setTimeout(() => {
        setHighlightedCounty(null);
      }, 2000);
    }
  };

  const continueAnimation = () => {
    shouldPauseRef.current = false;
    setIsPaused(false);
    setIsPlaying(true);
    setShowContinueButton(true);
  };

  const resetAnimation = () => {
    setCurrentYear(1850);
    setVisibleCounties(new Set());
    setRecentlyAdded([]);
    setHighlightedCounty(null);
    setIsPlaying(false);
    setHasStarted(false);
    setIsPaused(false);
    setHasShownInitialYear(false);
    setShowContinueButton(true);
  };

  const startAnimation = () => {
    setHasStarted(true);
    setVisibleCounties(new Set());
    setRecentlyAdded([]);
    setCurrentYear(1850);
    hasAddedCountiesRef.current = false;
    setIsPlaying(true);
    if (currentYear >= 1907) {
      resetAnimation();
      setTimeout(() => setIsPlaying(true), 100);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      // Check if we should pause (synchronous check)
      if (shouldPauseRef.current) {
        return; // Stop animation loop
      }

      const now = Date.now();
      const deltaTime = now - lastUpdateRef.current;
      const yearDuration = 1000 / playbackSpeed;

      if (deltaTime >= yearDuration) {
        setCurrentYear(prev => {
          const nextYear = prev + 1;
          if (nextYear > 1907) {
            setIsPlaying(false);
            setShowCompletion(true);
            setTimeout(() => setShowCompletion(false), 5000);
            return 1907;
          }

          addCountiesForYear(nextYear);
          lastUpdateRef.current = now;
          return nextYear;
        });
      }

      // Only schedule next frame if we shouldn't pause
      if (!shouldPauseRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    shouldPauseRef.current = false; // Reset pause flag when starting

    if (!hasAddedCountiesRef.current) {
      addCountiesForYear(currentYear);
      hasAddedCountiesRef.current = true;
    }

    lastUpdateRef.current = Date.now();

    // Only start animation if we haven't been paused
    if (!shouldPauseRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackSpeed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch(e.key) {
        case ' ':
          e.preventDefault();
          if (isPaused) {
            continueAnimation();
          } else {
            isPlaying ? setIsPlaying(false) : startAnimation();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentYear(prev => Math.max(1850, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentYear(prev => Math.min(1907, prev + 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setPlaybackSpeed(prev => prev === 0.5 ? 1 : prev === 1 ? 2 : prev === 2 ? 5 : 5);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setPlaybackSpeed(prev => prev === 5 ? 2 : prev === 2 ? 1 : prev === 1 ? 0.5 : 0.5);
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          resetAnimation();
          break;
        case '1':
          setPlaybackSpeed(0.5);
          break;
        case '2':
          setPlaybackSpeed(1);
          break;
        case '3':
          setPlaybackSpeed(2);
          break;
        case '4':
          setPlaybackSpeed(5);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, hasStarted]);

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value);
    setCurrentYear(year);

    const newVisible = new Set<string>();
    for (let y = 1850; y <= year; y++) {
      const counties = countiesByYear.get(y) || [];
      counties.forEach(id => newVisible.add(id));
    }
    setVisibleCounties(newVisible);

    const currentYearCounties = countiesByYear.get(year) || [];
    setRecentlyAdded(currentYearCounties);
  };

  const getCountyOpacity = (countyId: string, baseYear: number): number => {
    if (highlightedCounty === countyId) return 0.98;
    if (recentlyAdded.includes(countyId)) return 0.85;

    const yearsSince = currentYear - baseYear;
    if (yearsSince < 5) return 0.75;
    return 0.65;
  };

  const currentEvent = HISTORICAL_EVENTS
    .filter(e => e.year <= currentYear)
    .sort((a, b) => b.year - a.year)[0];

  const countiesAddedThisYear = countiesByYear.get(currentYear) || [];

  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-50 to-white flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        {/* Compact Header */}
        <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between">
          <h1 className="text-xl font-bold">
            California Through Time <span className="text-sm font-normal text-blue-100 ml-2">1850-1907</span>
          </h1>
        </div>

        {/* Enhanced Info Bar with Rich Content */}
        <div className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-4 py-3 relative">
          <div className="flex items-start gap-4">
            {/* Year Display */}
            <div className="flex-shrink-0">
              <div className="text-4xl font-bold text-blue-600 leading-none">
                {currentYear}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <span className="font-bold text-blue-600">{currentCount}</span>/{totalCounties}
              </div>
            </div>

            {/* Main Content Area - County Spotlight or Historical Event */}
            <div className="flex-1 min-h-[60px]">
              {hasStarted && countiesAddedThisYear.length > 0 ? (
                /* County Formation Spotlight */
                countiesAddedThisYear.length === 1 ? (
                  /* Single County - Rich Display with Founding Story */
                  (() => {
                    const county = getCountyInfo(countiesAddedThisYear[0]);
                    if (!county) return null;
                    const foundingStory = getFoundingStory(county.id);
                    const education = getCountyEducation(county.id);
                    return (
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 rounded-r-lg px-3 py-2">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl flex-shrink-0">✨</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-1">
                              <h3 className="font-bold text-emerald-900 text-sm">
                                {county.name} County Founded
                              </h3>
                              <span className="text-xs text-emerald-600">
                                {county.region}
                              </span>
                            </div>
                            <p className="text-xs text-emerald-800 leading-relaxed mb-1.5">
                              {foundingStory || county.funFact}
                            </p>
                            <div className="flex gap-3 text-xs text-emerald-600">
                              <span>👥 {(county.population / 1000).toFixed(0)}k</span>
                              <span>📍 {county.capital}</span>
                              {education?.specificData.established && (
                                <span>📅 {education.specificData.established}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : currentYear === 1850 && countiesAddedThisYear.length === 27 ? (
                  /* Special 1850 "Big Bang" Display */
                  <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-l-4 border-purple-500 rounded-r-lg px-3 py-2">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-2xl">🌟</span>
                      <div>
                        <h3 className="font-bold text-purple-900 text-sm">
                          California Statehood: The Original 27
                        </h3>
                        <p className="text-xs text-purple-700 italic mt-0.5">
                          September 9, 1850 — California becomes the 31st state with 27 founding counties
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 text-xs text-purple-800 ml-9">
                      {countiesAddedThisYear.slice(0, 27).map(id => {
                        const county = getCountyInfo(id);
                        return county ? <span key={id} className="font-medium">{county.name}</span> : null;
                      })}
                    </div>
                  </div>
                ) : (
                  /* Multiple Counties - Compact List with Founding Snippets */
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 rounded-r-lg px-3 py-2">
                    <div className="flex items-start gap-2 mb-1.5">
                      <span className="text-lg">✨</span>
                      <h3 className="font-bold text-emerald-900 text-sm">
                        {countiesAddedThisYear.length} Counties Founded This Year
                      </h3>
                    </div>
                    <div className="space-y-1.5 ml-7">
                      {countiesAddedThisYear.map(id => {
                        const county = getCountyInfo(id);
                        if (!county) return null;
                        const education = getCountyEducation(id);
                        // Use first sentence of historical context for multiple counties
                        const snippet = education?.historicalContext.split(/[.!?]+/)[0] + '.' || county.funFact;
                        return (
                          <div key={id} className="text-xs">
                            <span className="font-semibold text-emerald-900">{county.name}</span>
                            <span className="text-emerald-700"> — {snippet.length > 100 ? snippet.substring(0, 100) + '...' : snippet}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              ) : (
                /* No Counties This Year - Show Historical Event or Context */
                currentEvent ? (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-r-lg px-3 py-2">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{currentEvent.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-amber-900 text-sm mb-1">
                          {currentEvent.label}
                        </h3>
                        <p className="text-xs text-amber-700 leading-relaxed">
                          {currentEvent.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border-l-4 border-blue-300 rounded-r-lg px-3 py-2">
                    <p className="text-xs text-blue-700 italic">
                      No new counties established in {currentYear}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Auto-Pause Continue Prompt - Positioned in Info Bar */}
          {isPaused && countiesAddedThisYear.length > 0 && showContinueButton && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 animate-in fade-in slide-in-from-right-4 duration-300">
              <button
                onClick={continueAnimation}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center gap-2 border-2 border-white/20"
              >
                <span>Continue</span>
                <span className="text-xl">→</span>
              </button>
              <div className="text-center mt-1 text-xs text-gray-600">
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded font-mono text-xs">Space</kbd>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Display - Maximum Height */}
      <div className="flex-1 bg-white overflow-hidden relative"
           onMouseMove={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
           }}
           onMouseLeave={() => setHoveredCounty(null)}
      >
            {!hasStarted && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
                <div className="text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Ready to Travel Through Time?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Watch 57 years of California history unfold
                  </p>
                  <button
                    onClick={startAnimation}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Begin Journey
                  </button>
                  <div className="mt-4 text-xs text-gray-500">
                    💡 Tip: Use Space to play/pause, Arrow keys to navigate
                  </div>
                </div>
              </div>
            )}


            {/* Completion Celebration */}
            {showCompletion && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/90 to-purple-600/90 z-20 animate-in fade-in duration-500">
                <div className="text-center text-white px-8">
                  <div className="text-7xl mb-4 animate-bounce">🎉</div>
                  <h2 className="text-4xl font-bold mb-3">
                    California Complete!
                  </h2>
                  <p className="text-xl mb-6">
                    All 58 counties established by 1907
                  </p>
                  <p className="text-sm text-blue-100">
                    From 27 original counties in 1850 to the final county, Imperial, in 1907
                  </p>
                </div>
              </div>
            )}

            {/* Hover Tooltip */}
            {hoveredCounty && visibleCounties.has(hoveredCounty) && (() => {
              const info = getCountyInfo(hoveredCounty);
              if (!info) return null;
              return (
                <div
                  className="absolute z-30 pointer-events-none"
                  style={{
                    left: Math.min(mousePosition.x + 15, window.innerWidth - 200),
                    top: Math.max(mousePosition.y - 60, 10)
                  }}
                >
                  <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-sm max-w-[200px]">
                    <div className="font-bold">{info.name}</div>
                    <div className="text-xs text-gray-300 mt-1">
                      Founded: {info.founded}
                    </div>
                    <div className="text-xs text-gray-300">
                      Region: {info.region}
                    </div>
                  </div>
                </div>
              );
            })()}

            <svg
              viewBox="0 0 800 900"
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="xMidYMid meet"
              style={{ display: 'block' }}
            >
              <rect width="800" height="900" fill="#FAFAFA" opacity="1" />

              {realCaliforniaCountyShapes.map(countyShape => {
                const countyInfo = getCountyInfo(countyShape.id) ||
                                  getCountyInfo(countyShape.id.replace(/-/g, '_')) ||
                                  getCountyInfo(countyShape.id.replace(/_/g, '-'));

                if (!countyInfo) return null;

                const isVisible = hasStarted && visibleCounties.has(countyInfo.id);
                const isHighlighted = highlightedCounty === countyInfo.id;
                const isRecent = recentlyAdded.includes(countyInfo.id);

                return (
                  <g key={countyShape.id}>
                    <path
                      d={countyShape.path}
                      fill={isVisible ? getRegionHexColor(countyInfo.region) : '#E5E7EB'}
                      fillOpacity={isVisible ? getCountyOpacity(countyInfo.id, countyInfo.founded) : 0.2}
                      stroke={
                        isHighlighted ? '#FFD700' :
                        isRecent ? '#FFFFFF' :
                        isVisible ? '#D1D5DB' : '#E5E7EB'
                      }
                      strokeWidth={
                        isHighlighted ? 3 :
                        isRecent ? 2 :
                        isVisible ? 1 : 0.5
                      }
                      strokeLinejoin="round"
                      style={{
                        transition: 'all 0.3s ease-in-out',
                        filter: isHighlighted ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))' : 'none',
                        cursor: isVisible ? 'pointer' : 'default'
                      }}
                      onMouseEnter={() => {
                        if (isVisible) {
                          setHoveredCounty(countyInfo.id);
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredCounty(null);
                      }}
                    />
                  </g>
                );
              })}

            </svg>
        </div>

      {/* Controls - Fixed Bottom */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => {
                const newYear = Math.max(1850, currentYear - 5);
                setCurrentYear(newYear);
                handleScrubberChange({ target: { value: newYear.toString() } } as any);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back 5 years"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>

            <button
              onClick={() => isPlaying ? setIsPlaying(false) : startAnimation()}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <button
              onClick={() => {
                const newYear = Math.min(1907, currentYear + 5);
                setCurrentYear(newYear);
                handleScrubberChange({ target: { value: newYear.toString() } } as any);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Forward 5 years"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
              </svg>
            </button>

            <button
              onClick={resetAnimation}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Auto-pause toggle */}
            <button
              onClick={() => setAutoPauseEnabled(!autoPauseEnabled)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                autoPauseEnabled
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
              title={autoPauseEnabled ? 'Auto-pause enabled - will pause after each founding' : 'Auto-pause disabled - continuous playback'}
            >
              {autoPauseEnabled ? '⏸' : '▶'}
              <span className="hidden sm:inline">Auto-pause</span>
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600">Speed:</span>
              {([0.5, 1, 2, 5] as PlaybackSpeed[]).map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    playbackSpeed === speed
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* Timeline markers showing years with formations */}
            <div className="relative w-full h-1 mb-1">
              {Array.from(countiesByYear.keys()).map(year => {
                const position = ((year - 1850) / 57) * 100;
                const count = countiesByYear.get(year)?.length || 0;
                return (
                  <div
                    key={year}
                    className="absolute w-0.5 bg-blue-400 rounded-full"
                    style={{
                      left: `${position}%`,
                      height: year === 1850 ? '12px' : count > 2 ? '8px' : '6px',
                      bottom: 0,
                      transform: 'translateX(-50%)'
                    }}
                    title={`${year}: ${count} ${count === 1 ? 'county' : 'counties'}`}
                  />
                );
              })}
            </div>
            <input
              type="range"
              min="1850"
              max="1907"
              value={currentYear}
              onChange={handleScrubberChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((currentYear - 1850) / 57) * 100}%, #E5E7EB ${((currentYear - 1850) / 57) * 100}%, #E5E7EB 100%)`
              }}
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>1850</span>
              <span className="text-blue-600 font-semibold">{currentYear}</span>
              <span>1907</span>
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="mt-2 text-center text-xs text-gray-400">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Space</kbd> Play/Pause
              <span className="mx-1">•</span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">←→</kbd> Navigate
              <span className="mx-1">•</span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">1-4</kbd> Speed
              <span className="mx-1">•</span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">R</kbd> Reset
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}