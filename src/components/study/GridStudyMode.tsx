import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../../stores/studyStore';
import { allCaliforniaCounties, californiaRegions, County } from '../../data/californiaCountiesComplete';
import CountyInfoPanel from './CountyInfoPanel';
import StudyProgress from './StudyProgress';

interface GridStudyModeProps {
  onBack: () => void;
}

const GridStudyMode: React.FC<GridStudyModeProps> = ({ onBack }) => {
  const {
    gridSettings,
    startStudySession,
    endStudySession,
    markCountyAsStudied,
    progress,
    getCountyStudyInfo,
    updateGridSettings,
    isStudySessionActive
  } = useStudyStore();

  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    startStudySession('grid-study');

    return () => {
      if (isStudySessionActive) {
        endStudySession();
      }
    };
  }, []);

  const filteredAndSortedCounties = useMemo(() => {
    let counties = [...allCaliforniaCounties];

    // Apply filters
    if (gridSettings.filterBy.region) {
      const regionCounties = californiaRegions[gridSettings.filterBy.region as keyof typeof californiaRegions] || [];
      counties = counties.filter(county => regionCounties.includes(county.name));
    }

    if (gridSettings.filterBy.difficulty) {
      counties = counties.filter(county => county.difficulty === gridSettings.filterBy.difficulty);
    }

    if (gridSettings.filterBy.studied !== null) {
      counties = counties.filter(county =>
        progress.studiedCounties.has(county.id) === gridSettings.filterBy.studied
      );
    }

    if (gridSettings.filterBy.mastered !== null) {
      counties = counties.filter(county =>
        progress.masteredCounties.has(county.id) === gridSettings.filterBy.mastered
      );
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      counties = counties.filter(county =>
        county.name.toLowerCase().includes(query) ||
        county.capital.toLowerCase().includes(query) ||
        county.region.toLowerCase().includes(query) ||
        county.funFact.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    counties.sort((a, b) => {
      switch (gridSettings.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'region':
          return a.region.localeCompare(b.region) || a.name.localeCompare(b.name);
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty] || a.name.localeCompare(b.name);
        case 'population':
          return b.population - a.population;
        case 'area':
          return b.area - a.area;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return counties;
  }, [allCaliforniaCounties, gridSettings, progress, searchQuery]);

  const totalPages = Math.ceil(filteredAndSortedCounties.length / gridSettings.cardsPerPage);
  const startIndex = (currentPage - 1) * gridSettings.cardsPerPage;
  const endIndex = startIndex + gridSettings.cardsPerPage;
  const currentCounties = filteredAndSortedCounties.slice(startIndex, endIndex);

  const handleCountyClick = (county: County) => {
    setSelectedCounty(county);
  };

  const handleCountyStudied = (countyId: string, difficulty: 'easy' | 'medium' | 'hard') => {
    markCountyAsStudied(countyId, difficulty);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPopulation = (population: number) => {
    if (population >= 1000000) {
      return `${(population / 1000000).toFixed(1)}M`;
    } else if (population >= 1000) {
      return `${(population / 1000).toFixed(0)}K`;
    }
    return population.toString();
  };

  const CountyCard: React.FC<{ county: County; index: number }> = ({ county, index }) => {
    const studyInfo = getCountyStudyInfo(county.id);
    const isStudied = progress.studiedCounties.has(county.id);
    const isMastered = progress.masteredCounties.has(county.id);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          bg-white rounded-lg p-4 border-2 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg
          ${isMastered ? 'border-green-300 bg-green-50' :
            isStudied ? 'border-blue-300 bg-blue-50' :
            'border-gray-200 hover:border-blue-300'}
        `}
        onClick={() => handleCountyClick(county)}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-lg leading-tight">
              {county.name}
            </h3>
            <p className="text-sm text-gray-600">{county.region}</p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(county.difficulty)}`}>
              {county.difficulty.toUpperCase()}
            </span>

            {isStudied && (
              <div className="flex items-center gap-1">
                {isMastered && <span className="text-green-500 text-sm">★</span>}
                <span className={`text-xs px-2 py-1 rounded ${
                  isMastered ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {isMastered ? 'Mastered' : 'Studied'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Capital:</span>
            <span className="font-medium">{county.capital}</span>
          </div>

          {gridSettings.showDetails && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Population:</span>
                <span className="font-medium">{formatPopulation(county.population)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Founded:</span>
                <span className="font-medium">{county.founded}</span>
              </div>
            </>
          )}
        </div>

        {/* Fun Fact Preview */}
        {gridSettings.showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600 line-clamp-2">
              {county.funFact}
            </p>
          </div>
        )}

        {/* Study Info */}
        {studyInfo.timesStudied > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Studied {studyInfo.timesStudied}x</span>
              {studyInfo.lastStudied && (
                <span>{new Date(studyInfo.lastStudied).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <span>←</span>
                <span>Back to Study Modes</span>
              </button>

              <div>
                <h1 className="text-xl font-bold text-gray-800">Grid Study Mode</h1>
                <p className="text-sm text-gray-600">
                  {filteredAndSortedCounties.length} counties • Page {currentPage} of {totalPages}
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

          {/* Filters and Search */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search counties, capitals, or regions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Sort */}
            <select
              value={gridSettings.sortBy}
              onChange={(e) => updateGridSettings({ sortBy: e.target.value as any })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="region">Sort by Region</option>
              <option value="difficulty">Sort by Difficulty</option>
              <option value="population">Sort by Population</option>
              <option value="area">Sort by Area</option>
            </select>

            {/* Quick Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => updateGridSettings({
                  filterBy: { ...gridSettings.filterBy, studied: null }
                })}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  gridSettings.filterBy.studied === null
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => updateGridSettings({
                  filterBy: { ...gridSettings.filterBy, studied: false }
                })}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  gridSettings.filterBy.studied === false
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Not Studied
              </button>
              <button
                onClick={() => updateGridSettings({
                  filterBy: { ...gridSettings.filterBy, studied: true }
                })}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  gridSettings.filterBy.studied === true
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Studied
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* County Grid */}
            <div className={`grid gap-4 ${
              gridSettings.cardsPerPage <= 6 ? 'md:grid-cols-2 lg:grid-cols-3' :
              gridSettings.cardsPerPage <= 12 ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
              'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            }`}>
              {currentCounties.map((county, index) => (
                <CountyCard key={county.id} county={county} index={index} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    const isNearCurrent = Math.abs(page - currentPage) <= 2;
                    const isFirst = page === 1;
                    const isLast = page === totalPages;

                    if (!isNearCurrent && !isFirst && !isLast) {
                      if (page === currentPage - 3 || page === currentPage + 3) {
                        return <span key={page} className="px-2 text-gray-500">...</span>;
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <StudyProgress compact showDetails={false} />

            {/* Session Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h3 className="font-semibold text-gray-800 mb-3">Session Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total counties:</span>
                  <span className="font-medium">{allCaliforniaCounties.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Filtered results:</span>
                  <span className="font-medium">{filteredAndSortedCounties.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current page:</span>
                  <span className="font-medium">{currentPage} of {totalPages}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* County Info Panel */}
      {selectedCounty && (
        <CountyInfoPanel
          county={selectedCounty}
          onClose={() => setSelectedCounty(null)}
          onStudied={handleCountyStudied}
          position="modal"
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
              className="bg-white rounded-xl p-6 max-w-md w-full max-h-96 overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Grid Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Cards per page</label>
                  <select
                    value={gridSettings.cardsPerPage}
                    onChange={(e) => updateGridSettings({ cardsPerPage: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value={6}>6 cards</option>
                    <option value={12}>12 cards</option>
                    <option value={24}>24 cards</option>
                    <option value={48}>48 cards</option>
                  </select>
                </div>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={gridSettings.showDetails}
                    onChange={(e) => updateGridSettings({ showDetails: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-700">Show detailed information</span>
                </label>

                <div>
                  <label className="block text-gray-700 mb-2">Filter by region</label>
                  <select
                    value={gridSettings.filterBy.region || ''}
                    onChange={(e) => updateGridSettings({
                      filterBy: { ...gridSettings.filterBy, region: e.target.value || null }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All regions</option>
                    {Object.keys(californiaRegions).map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Filter by difficulty</label>
                  <select
                    value={gridSettings.filterBy.difficulty || ''}
                    onChange={(e) => updateGridSettings({
                      filterBy: { ...gridSettings.filterBy, difficulty: e.target.value as any || null }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
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

export default GridStudyMode;