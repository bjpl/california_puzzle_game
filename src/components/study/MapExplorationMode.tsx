import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../../stores/studyStore';
import { allCaliforniaCounties, californiaRegions } from '../../data/californiaCountiesComplete';
import CountyInfoPanel from './CountyInfoPanel';
import StudyProgress from './StudyProgress';
import CaliforniaButton from '../CaliforniaButton';

interface MapExplorationModeProps {
  onBack: () => void;
}

const MapExplorationMode: React.FC<MapExplorationModeProps> = ({ onBack }) => {
  const {
    mapSettings,
    startStudySession,
    endStudySession,
    markCountyAsStudied,
    progress,
    getCountyStudyInfo,
    updateMapSettings,
    isStudySessionActive
  } = useStudyStore();

  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    startStudySession('map-exploration');

    return () => {
      if (isStudySessionActive) {
        endStudySession();
      }
    };
  }, []);

  const getCountyData = (countyId: string) => {
    return allCaliforniaCounties.find(c => c.id === countyId);
  };

  const handleCountyClick = (countyId: string) => {
    setSelectedCounty(countyId);
  };

  const handleCountyStudied = (countyId: string, difficulty: 'easy' | 'medium' | 'hard') => {
    markCountyAsStudied(countyId, difficulty);
  };

  const getCountyColor = (countyId: string) => {
    const studyInfo = getCountyStudyInfo(countyId);
    const isStudied = progress.studiedCounties.has(countyId);
    const isMastered = progress.masteredCounties.has(countyId);

    if (!mapSettings.highlightStudied) {
      return hoveredCounty === countyId ? '#3B82F6' : '#E5E7EB';
    }

    if (isMastered) return '#10B981'; // green
    if (isStudied) return '#3B82F6'; // blue
    return hoveredCounty === countyId ? '#6B7280' : '#E5E7EB'; // gray
  };

  const getDifficultyBorder = (countyId: string) => {
    if (!mapSettings.showDifficulty) return 'none';

    const county = getCountyData(countyId);
    if (!county) return 'none';

    switch (county.difficulty) {
      case 'easy': return '2px solid #10B981';
      case 'medium': return '2px solid #F59E0B';
      case 'hard': return '2px solid #EF4444';
      default: return 'none';
    }
  };

  const getRegionCounties = (regionName: string) => {
    return californiaRegions[regionName as keyof typeof californiaRegions] || [];
  };

  const selectedCountyData = selectedCounty ? getCountyData(selectedCounty) : null;

  // Simplified SVG map - in a real implementation, you'd load actual California county SVG paths
  const renderCountyShape = (countyId: string, index: number) => {
    const county = getCountyData(countyId);
    if (!county) return null;

    // Simple placeholder rectangles arranged in a grid for demo
    const cols = 8;
    const rows = 8;
    const x = (index % cols) * 80 + 50;
    const y = Math.floor(index / cols) * 60 + 50;

    return (
      <rect
        key={countyId}
        x={x}
        y={y}
        width="70"
        height="50"
        fill={getCountyColor(countyId)}
        stroke={getDifficultyBorder(countyId).includes('solid') ? getDifficultyBorder(countyId).split(' ')[2] : '#9CA3AF'}
        strokeWidth={getDifficultyBorder(countyId).includes('solid') ? '2' : '1'}
        className="cursor-pointer transition-colors duration-200"
        onMouseEnter={() => setHoveredCounty(countyId)}
        onMouseLeave={() => setHoveredCounty(null)}
        onClick={() => handleCountyClick(countyId)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span>←</span>
              <span>Back to Study Modes</span>
            </button>

            <div>
              <h1 className="text-xl font-bold text-gray-800">Map Exploration</h1>
              <p className="text-sm text-gray-600">
                Click counties to learn about them
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ⚙️
            </button>

            <button
              onClick={() => endStudySession()}
              className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
            >
              End Session
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-4 border border-white/20 shadow-lg">
              {/* Region Filter */}
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedRegion(null)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedRegion === null
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Regions
                </button>
                {Object.keys(californiaRegions).map(region => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedRegion === region
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>

              {/* Map SVG */}
              <div className="relative overflow-hidden rounded-lg bg-blue-50 min-h-96">
                <svg
                  ref={svgRef}
                  width="100%"
                  height="500"
                  viewBox="0 0 700 500"
                  className="w-full h-full"
                >
                  {allCaliforniaCounties
                    .filter(county => {
                      if (!selectedRegion) return true;
                      return getRegionCounties(selectedRegion).includes(county.name);
                    })
                    .map((county, index) => renderCountyShape(county.id, index))}

                  {/* County Labels */}
                  {mapSettings.showLabels && allCaliforniaCounties
                    .filter(county => {
                      if (!selectedRegion) return true;
                      return getRegionCounties(selectedRegion).includes(county.name);
                    })
                    .map((county, index) => {
                      const cols = 8;
                      const x = (index % cols) * 80 + 85;
                      const y = Math.floor(index / cols) * 60 + 75;

                      return (
                        <text
                          key={`label-${county.id}`}
                          x={x}
                          y={y}
                          textAnchor="middle"
                          className="text-xs fill-gray-700 pointer-events-none font-medium"
                        >
                          {county.name}
                        </text>
                      );
                    })}
                </svg>

                {/* Hover tooltip */}
                <AnimatePresence>
                  {hoveredCounty && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute top-4 left-4 bg-black text-white px-3 py-2 rounded-lg text-sm pointer-events-none"
                    >
                      {getCountyData(hoveredCounty)?.name}
                      <br />
                      <span className="text-xs opacity-75">
                        {getCountyData(hoveredCounty)?.region}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {mapSettings.highlightStudied && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <span>Not studied</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Studied</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Mastered</span>
                    </div>
                  </>
                )}

                {mapSettings.showDifficulty && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-green-500 rounded"></div>
                      <span>Easy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-yellow-500 rounded"></div>
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-red-500 rounded"></div>
                      <span>Hard</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <StudyProgress compact showDetails={false} />

            {/* Region Progress */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h3 className="font-semibold text-gray-800 mb-3">Region Progress</h3>
              <div className="space-y-2">
                {Object.keys(californiaRegions).map(region => {
                  const regionCounties = getRegionCounties(region);
                  const studiedCount = regionCounties.filter(countyName => {
                    const county = allCaliforniaCounties.find(c => c.name === countyName);
                    return county && progress.studiedCounties.has(county.id);
                  }).length;

                  const percentage = (studiedCount / regionCounties.length) * 100;

                  return (
                    <div key={region} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">{region}</span>
                        <span className="text-gray-800">{studiedCount}/{regionCounties.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* County Info Panel */}
      {selectedCountyData && (
        <CountyInfoPanel
          county={selectedCountyData}
          onClose={() => setSelectedCounty(null)}
          onStudied={handleCountyStudied}
          position="right"
        />
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Map Settings</h3>

              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={mapSettings.showLabels}
                    onChange={(e) => updateMapSettings({ showLabels: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-700">Show county labels</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={mapSettings.highlightStudied}
                    onChange={(e) => updateMapSettings({ highlightStudied: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-700">Highlight studied counties</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={mapSettings.showDifficulty}
                    onChange={(e) => updateMapSettings({ showDifficulty: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-700">Show difficulty borders</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={mapSettings.groupByRegion}
                    onChange={(e) => updateMapSettings({ groupByRegion: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-700">Group by region</span>
                </label>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapExplorationMode;