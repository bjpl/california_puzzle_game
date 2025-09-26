import React, { useState, useEffect, useRef } from 'react';
import { realCaliforniaCountyShapes } from '../data/californiaCountyBoundaries';
import { allCaliforniaCounties } from '../data/californiaCountiesComplete';
import { getRegionHexColor } from '../config/regionColors';

interface HistoricalEvent {
  year: number;
  label: string;
  icon: string;
  description: string;
}

const HISTORICAL_EVENTS: HistoricalEvent[] = [
  { year: 1850, label: 'California Statehood', icon: '🌟', description: '27 original counties established' },
  { year: 1849, label: 'Gold Rush Begins', icon: '⛏️', description: 'Mass migration to California' },
  { year: 1861, label: 'Civil War Era', icon: '🎖️', description: 'Nation divided, westward expansion continues' },
  { year: 1906, label: 'San Francisco Earthquake', icon: '🌋', description: 'Major disaster reshapes Bay Area' },
  { year: 1907, label: 'Final County', icon: '🏜️', description: 'Imperial County completes California' }
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

  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());

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

      setTimeout(() => {
        setHighlightedCounty(null);
      }, 2000);
    }
  };

  const resetAnimation = () => {
    setCurrentYear(1850);
    setVisibleCounties(new Set());
    setRecentlyAdded([]);
    setHighlightedCounty(null);
    setIsPlaying(false);
    setHasStarted(false);
  };

  const startAnimation = () => {
    setHasStarted(true);
    setIsPlaying(true);
    if (currentYear >= 1907) {
      resetAnimation();
      setTimeout(() => setIsPlaying(true), 100);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      const now = Date.now();
      const deltaTime = now - lastUpdateRef.current;
      const yearDuration = 1000 / playbackSpeed;

      if (deltaTime >= yearDuration) {
        setCurrentYear(prev => {
          const nextYear = prev + 1;
          if (nextYear > 1907) {
            setIsPlaying(false);
            return 1907;
          }

          addCountiesForYear(nextYear);
          lastUpdateRef.current = now;
          return nextYear;
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    addCountiesForYear(currentYear);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, currentYear]);

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

        {/* Compact Year Display & Info Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="text-4xl font-bold text-blue-600">
                {currentYear}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{currentCount}</span> / {totalCounties} counties
              </div>
            </div>

            {currentEvent && (
              <div className="bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-2">
                <span className="text-lg">{currentEvent.icon}</span>
                <div>
                  <div className="font-semibold text-amber-900 text-xs">
                    {currentEvent.label}
                  </div>
                  <div className="text-xs text-amber-700">
                    {currentEvent.description}
                  </div>
                </div>
              </div>
            )}
          </div>

          {countiesAddedThisYear.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-semibold text-green-800">New:</span>
              <div className="flex flex-wrap gap-1.5">
                {countiesAddedThisYear.map(id => {
                  const info = getCountyInfo(id);
                  return (
                    <span
                      key={id}
                      className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium"
                    >
                      {info?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Display - Maximum Height */}
      <div className="flex-1 bg-white overflow-hidden relative">
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
                </div>
              </div>
            )}

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

                const isVisible = visibleCounties.has(countyInfo.id);
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
                          setHighlightedCounty(countyInfo.id);
                        }
                      }}
                      onMouseLeave={() => {
                        if (!recentlyAdded.includes(countyInfo.id)) {
                          setHighlightedCounty(null);
                        }
                      }}
                    />
                  </g>
                );
              })}

              {highlightedCounty && (() => {
                const info = getCountyInfo(highlightedCounty);
                const shape = getCountyPath(highlightedCounty);
                if (!info || !shape) return null;

                return (
                  <g>
                    <rect
                      x="400"
                      y="30"
                      width="200"
                      height="60"
                      rx="8"
                      fill="white"
                      stroke="#D1D5DB"
                      strokeWidth="2"
                      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                    />
                    <text
                      x="500"
                      y="55"
                      textAnchor="middle"
                      className="text-sm font-bold fill-gray-900"
                    >
                      {info.name}
                    </text>
                    <text
                      x="500"
                      y="75"
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                    >
                      Founded: {info.founded}
                    </text>
                  </g>
                );
              })()}
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
              <span>1880</span>
              <span>1907</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}