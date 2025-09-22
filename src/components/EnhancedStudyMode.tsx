import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getCountyEducation, getMemoryAid, getRelatedCounties, historicalConnections, interCountyConnections } from '../data/countyEducation';
import { getCountyEducationComplete } from '../data/countyEducationComplete';
import { getMemoryAid as getMemoryAidData, memoryPatterns, spatialRelationships, learningStrategies } from '../data/memoryAids';
import { useSoundEffect } from '../utils/simpleSoundManager';
import { californiaCounties, CaliforniaCounty } from '../data/californiaCounties';
import StudyModeMap from './StudyModeMap';
import CountyShapeDisplay from './CountyShapeDisplay';
import EducationalContentModal from './EducationalContentModal';
import CountyDetailsModal from './CountyDetailsModal';

interface StudyModeProps {
  onClose: () => void;
  onStartGame: () => void;
}

interface StudyProgress {
  studiedCounties: Set<string>;
  completedQuizzes: Set<string>;
  masteredCounties: Set<string>;
  currentStreak: number;
  totalPoints: number;
}

type ViewMode = 'explore' | 'quiz' | 'map' | 'timeline';
type ContentTab = 'overview' | 'history' | 'economy' | 'culture' | 'geography' | 'memory';

export default function EnhancedStudyMode({ onClose, onStartGame }: StudyModeProps) {
  const { counties } = useGame();
  const sound = useSoundEffect();

  const [viewMode, setViewMode] = useState<ViewMode>('explore');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCounty, setSelectedCounty] = useState<any>(null);
  const [contentTab, setContentTab] = useState<ContentTab>('overview');
  const [showHints, setShowHints] = useState(false);
  const [showEducationalModal, setShowEducationalModal] = useState(false);
  const [showCountyDetailsModal, setShowCountyDetailsModal] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState<any>(null);
  const [progress, setProgress] = useState<StudyProgress>({
    studiedCounties: new Set(),
    completedQuizzes: new Set(),
    masteredCounties: new Set(),
    currentStreak: 0,
    totalPoints: 0
  });

  // Load progress from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProgress = localStorage.getItem('californiaStudyProgress');
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setProgress({
          ...parsed,
          studiedCounties: new Set(parsed.studiedCounties || []),
          completedQuizzes: new Set(parsed.completedQuizzes || []),
          masteredCounties: new Set(parsed.masteredCounties || [])
        });
      }
    }
  }, []);

  // Save progress to localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const toSave = {
        ...progress,
        studiedCounties: Array.from(progress.studiedCounties),
        completedQuizzes: Array.from(progress.completedQuizzes),
        masteredCounties: Array.from(progress.masteredCounties)
      };
      localStorage.setItem('californiaStudyProgress', JSON.stringify(toSave));
    }
  }, [progress]);

  // Auto-select first county on load with merged data
  useEffect(() => {
    if (counties.length > 0 && !selectedCounty) {
      const firstCounty = counties[0];
      // Check if county already has the data we need
      if (firstCounty.capital && firstCounty.population) {
        setSelectedCounty(firstCounty);
      } else {
        const mergedCounty = getMergedCountyData(firstCounty);
        setSelectedCounty(mergedCounty);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counties]);

  // Get unique regions
  const regions = Array.from(new Set(counties.map(c => c.region))).sort();

  // Filter counties by region
  const filteredCounties = selectedRegion === 'all'
    ? counties
    : counties.filter(c => c.region === selectedRegion);

  // Sort counties alphabetically
  const sortedCounties = [...filteredCounties].sort((a, b) => a.name.localeCompare(b.name));

  // Helper function to merge county data from multiple sources
  const getMergedCountyData = (county: any) => {
    // Try to find matching data from californiaCounties.ts by name matching
    const normalizedId = county.id.toLowerCase().replace(/-/g, '_');
    const comprehensiveData = californiaCounties.find(c => {
      const cId = c.id.toLowerCase();
      const countyId = county.id.toLowerCase();
      const countyName = county.name.toLowerCase().replace(' county', '').replace(/\s+/g, '_');

      return cId === normalizedId ||
             cId === countyId ||
             cId === countyName ||
             c.name.toLowerCase() === county.name.toLowerCase() ||
             c.name.toLowerCase().replace(' county', '') === county.name.toLowerCase();
    });

    if (comprehensiveData) {
      // Merge the comprehensive data with the county
      return {
        ...county,
        // Keep original fields but add comprehensive data
        countySeat: comprehensiveData.countySeat,
        established: comprehensiveData.established,
        economicFocus: comprehensiveData.economicFocus,
        naturalFeatures: comprehensiveData.naturalFeatures,
        culturalLandmarks: comprehensiveData.culturalLandmarks,
        funFacts: comprehensiveData.funFacts,
        trivia: comprehensiveData.trivia,
        // Preserve original fields if they exist
        capital: county.capital || comprehensiveData.countySeat,
        founded: county.founded || comprehensiveData.established,
        population: county.population || comprehensiveData.population,
        area: county.area || comprehensiveData.area
      };
    }

    // Return original county data if no match found
    return county;
  };

  // Handle county selection
  const handleCountySelect = (county: any) => {
    // Check if county already has the data we need (from californiaCountiesComplete.ts)
    if (county.capital && county.population && county.area && county.founded) {
      setSelectedCounty(county);
    } else {
      const mergedCounty = getMergedCountyData(county);
      setSelectedCounty(mergedCounty);
    }

    setContentTab('overview');
    setProgress(prev => ({
      ...prev,
      studiedCounties: new Set([...prev.studiedCounties, county.id])
    }));
  };

  // Generate quiz question with diverse types
  const generateQuizQuestion = () => {
    const randomCounty = sortedCounties[Math.floor(Math.random() * sortedCounties.length)];
    const mergedCounty = getMergedCountyData(randomCounty);
    const education = getCountyEducation(randomCounty.id);

    const questionTypes = [
      // County seat questions
      {
        question: `What is the county seat of ${mergedCounty.name} County?`,
        answer: mergedCounty.capital || mergedCounty.countySeat || 'Unknown',
        options: generateOptions(mergedCounty.capital || mergedCounty.countySeat, counties.map(c => c.capital).filter(Boolean))
      },
      // Region questions
      {
        question: `Which region is ${mergedCounty.name} County located in?`,
        answer: mergedCounty.region,
        options: generateOptions(mergedCounty.region, regions)
      },
      // Population questions
      {
        question: `Which county has a population of approximately ${mergedCounty.population?.toLocaleString()}?`,
        answer: mergedCounty.name,
        options: generateOptions(mergedCounty.name, counties.map(c => c.name))
      },
      // Founding date questions
      {
        question: `When was ${mergedCounty.name} County established?`,
        answer: String(mergedCounty.founded || mergedCounty.established || 'Unknown'),
        options: generateOptions(
          String(mergedCounty.founded || mergedCounty.established),
          counties.map(c => String(c.founded || c.established)).filter(Boolean)
        )
      },
      // Fun fact questions
      ...(mergedCounty.funFact ? [{
        question: `Which county ${mergedCounty.funFact.toLowerCase().includes('home to') ? 'is' : 'has'} ${mergedCounty.funFact.toLowerCase()}?`,
        answer: mergedCounty.name,
        options: generateOptions(mergedCounty.name, counties.map(c => c.name))
      }] : []),
      // Area questions
      {
        question: `Which county has an area of approximately ${mergedCounty.area?.toLocaleString()} square miles?`,
        answer: mergedCounty.name,
        options: generateOptions(mergedCounty.name, counties.map(c => c.name))
      },
      // Neighboring counties (if we have Related Counties data)
      {
        question: `Which county is in the same region as ${counties.find(c => c.region === mergedCounty.region && c.id !== mergedCounty.id)?.name}?`,
        answer: mergedCounty.name,
        options: generateOptions(mergedCounty.name, counties.filter(c => c.id !== mergedCounty.id).map(c => c.name))
      }
    ];

    const selected = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    setQuizQuestion(selected);
  };

  // Generate quiz options
  const generateOptions = (correct: string, pool: string[]): string[] => {
    const filtered = pool.filter(item => item && item !== correct);
    const options = [correct];

    while (options.length < 4 && filtered.length > 0) {
      const randomIndex = Math.floor(Math.random() * filtered.length);
      options.push(filtered[randomIndex]);
      filtered.splice(randomIndex, 1);
    }

    return options.sort(() => Math.random() - 0.5);
  };

  // Handle quiz answer
  const handleQuizAnswer = (answer: string) => {
    const isCorrect = answer === quizQuestion.answer;

    if (isCorrect) {
      sound.playSound('correct');
      setProgress(prev => ({
        ...prev,
        currentStreak: prev.currentStreak + 1,
        totalPoints: prev.totalPoints + 10,
        completedQuizzes: new Set([...prev.completedQuizzes, quizQuestion.question])
      }));
    } else {
      sound.playSound('incorrect');
      setProgress(prev => ({
        ...prev,
        currentStreak: 0
      }));
    }

    // Generate new question after a delay
    setTimeout(() => generateQuizQuestion(), 1500);
  };

  // Region colors for visual distinction
  const regionColors: { [key: string]: string } = {
    'Southern California': 'from-red-500 to-orange-500',
    'Bay Area': 'from-blue-500 to-indigo-500',
    'Central Valley': 'from-green-500 to-emerald-500',
    'Central Coast': 'from-purple-500 to-pink-500',
    'Northern California': 'from-orange-500 to-yellow-500',
    'Sierra Nevada': 'from-yellow-500 to-amber-500',
    'North Coast': 'from-teal-500 to-cyan-500',
  };

  // Get education content for selected county
  // Try to get complete data first, fall back to basic data if not available
  const educationContent = selectedCounty ?
    (getCountyEducationComplete(selectedCounty.id) || getCountyEducation(selectedCounty.id)) :
    null;
  const memoryAid = selectedCounty ? getMemoryAidData(selectedCounty.id) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                📚 California Counties Study Mode
              </h2>
              <p className="text-sm opacity-90 mt-1">
                Master all 58 counties with comprehensive educational content
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Progress indicators */}
              <div className="text-sm">
                <div>📍 Studied: {progress.studiedCounties.size}/58</div>
                <div>🏆 Points: {progress.totalPoints}</div>
                <div>🔥 Streak: {progress.currentStreak}</div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg px-3 py-1 transition-colors"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex gap-2 mt-4">
            {(['explore', 'quiz', 'map', 'timeline'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-blue-600'
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
              >
                {mode === 'explore' ? '📚 Explore' :
                 mode === 'quiz' ? '🎯 Quiz' :
                 mode === 'map' ? '🗺️ Map' :
                 mode === 'timeline' ? '📅 Timeline' :
                 mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Region Filter */}
        <div className="bg-gray-100 p-3 border-b flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Filter by Region:</span>
          <button
            onClick={() => setSelectedRegion('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              selectedRegion === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Counties ({counties.length})
          </button>
          {regions.map(region => {
            const count = counties.filter(c => c.region === region).length;
            return (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
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

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {viewMode === 'explore' && (
            <>
              {/* County List */}
              <div className="w-1/3 border-r bg-gray-50 p-4 overflow-y-auto h-full">
                <h3 className="font-semibold text-gray-700 mb-3">
                  {selectedRegion === 'all' ? 'All Counties' : selectedRegion}
                </h3>
                <div className="space-y-2">
                  {sortedCounties.map(county => {
                    const isStudied = progress.studiedCounties.has(county.id);
                    const isMastered = progress.masteredCounties.has(county.id);
                    return (
                      <button
                        key={county.id}
                        onClick={() => handleCountySelect(county)}
                        className={`w-full p-3 rounded-lg text-left transition-all hover:shadow-md ${
                          selectedCounty?.id === county.id
                            ? 'ring-2 ring-blue-500 shadow-md bg-white'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{county.name}</div>
                            <div className="text-xs text-gray-500">{county.capital}</div>
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

              {/* County Details */}
              <div className="flex-1 p-6 overflow-y-auto h-full">
                {selectedCounty ? (
                  <div>
                    {/* County Header */}
                    <div className="mb-6">
                      <h3 className="text-3xl font-bold text-gray-800 mb-2">
                        {selectedCounty.name} County
                      </h3>
                      <div className={`inline-block px-4 py-2 rounded-full text-white font-medium bg-gradient-to-r ${
                        regionColors[selectedCounty.region] || 'from-gray-500 to-gray-600'
                      }`}>
                        {selectedCounty.region}
                      </div>
                    </div>

                    {/* Content Tabs */}
                    <div className="flex gap-2 mb-4 border-b">
                      {(['overview', 'history', 'economy', 'culture', 'geography', 'memory'] as ContentTab[]).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setContentTab(tab)}
                          className={`px-4 py-2 font-medium transition-colors ${
                            contentTab === tab
                              ? 'border-b-2 border-blue-500 text-blue-600'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-6">
                      {contentTab === 'overview' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <h4 className="font-semibold text-blue-900 mb-2">📊 Quick Facts</h4>
                              <div className="space-y-1 text-sm text-gray-700">
                                <div><strong className="text-gray-900">County Seat:</strong> <span className="text-gray-700">{selectedCounty?.capital || selectedCounty?.countySeat || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Population:</strong> <span className="text-gray-700">{selectedCounty?.population ? selectedCounty.population.toLocaleString() : 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Area:</strong> <span className="text-gray-700">{selectedCounty?.area ? `${selectedCounty.area.toLocaleString()} sq mi` : 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Established:</strong> <span className="text-gray-700">{selectedCounty?.founded || selectedCounty?.established || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Region:</strong> <span className="text-gray-700">{selectedCounty?.region || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Difficulty:</strong> <span className="text-gray-700">{selectedCounty?.difficulty ? selectedCounty.difficulty.charAt(0).toUpperCase() + selectedCounty.difficulty.slice(1) : 'N/A'}</span></div>
                              </div>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                              <h4 className="font-semibold text-green-900 mb-2">🎉 Fun Facts</h4>
                              {selectedCounty.funFacts && selectedCounty.funFacts.length > 0 ? (
                                <ul className="text-sm text-green-800 space-y-1">
                                  {selectedCounty.funFacts.slice(0, 3).map((fact: string, idx: number) => (
                                    <li key={idx} className="text-xs">• {fact}</li>
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
                            <div className="grid grid-cols-2 gap-4">
                              {selectedCounty.naturalFeatures && selectedCounty.naturalFeatures.length > 0 && (
                                <div className="p-4 bg-cyan-50 rounded-lg">
                                  <h4 className="font-semibold text-cyan-900 mb-2">🏔️ Natural Features</h4>
                                  <ul className="text-sm text-cyan-800 space-y-1">
                                    {selectedCounty.naturalFeatures.slice(0, 3).map((feature: string, idx: number) => (
                                      <li key={idx}>• {feature}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {selectedCounty.economicFocus && selectedCounty.economicFocus.length > 0 && (
                                <div className="p-4 bg-purple-50 rounded-lg">
                                  <h4 className="font-semibold text-purple-900 mb-2">💼 Economic Focus</h4>
                                  <ul className="text-sm text-purple-800 space-y-1">
                                    {selectedCounty.economicFocus.slice(0, 3).map((focus: string, idx: number) => (
                                      <li key={idx}>• {focus}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                          {educationContent && (
                            <>
                              <div className="p-4 bg-yellow-50 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-2">Historical Context</h4>
                                <p className="text-sm text-gray-600">{educationContent.historicalContext}</p>
                              </div>
                              <div className="p-4 bg-indigo-50 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-2">Economic Importance</h4>
                                <p className="text-sm text-gray-600">{educationContent.economicImportance}</p>
                              </div>
                              {educationContent.specificData?.majorAttractions && (
                                <div>
                                  <h4 className="font-semibold text-gray-700 mb-2">Major Attractions</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {educationContent.specificData.majorAttractions.map((attraction: string, idx: number) => (
                                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                        {attraction}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </>
                      )}

                      {contentTab === 'history' && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3">Historical Context</h4>
                          <p className="text-gray-600 leading-relaxed mb-4">{educationContent?.historicalContext || 'No historical context available.'}</p>
                          {educationContent?.specificData?.historicalEvents && (
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">Key Historical Events</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {educationContent.specificData.historicalEvents.map((event: string, idx: number) => (
                                  <li key={idx} className="text-gray-600">{event}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {contentTab === 'economy' && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3">Economic Importance</h4>
                          <p className="text-gray-600 leading-relaxed mb-4">{educationContent?.economicImportance || 'No economic data available.'}</p>
                          {educationContent?.specificData?.industries && (
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">Major Industries</h5>
                              <div className="flex flex-wrap gap-2">
                                {educationContent.specificData.industries.map((industry: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    {industry}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {contentTab === 'culture' && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3">Cultural Heritage</h4>
                          <p className="text-gray-600 leading-relaxed mb-4">{educationContent?.culturalHeritage || 'No cultural heritage data available.'}</p>
                          <h4 className="font-semibold text-gray-700 mb-3 mt-6">Unique Features</h4>
                          <p className="text-gray-600 leading-relaxed">{educationContent?.uniqueFeatures || 'No unique features data available.'}</p>
                        </div>
                      )}

                      {contentTab === 'geography' && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3">Geographical Significance</h4>
                          <p className="text-gray-600 leading-relaxed mb-4">{educationContent?.geographicalSignificance || 'No geographical data available.'}</p>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="p-3 bg-gray-100 rounded-lg">
                              <h5 className="font-medium text-gray-700 mb-1">Climate</h5>
                              <p className="text-sm text-gray-600">{educationContent?.specificData?.climate || 'N/A'}</p>
                            </div>
                            <div className="p-3 bg-gray-100 rounded-lg">
                              <h5 className="font-medium text-gray-700 mb-1">Elevation</h5>
                              <p className="text-sm text-gray-600">{educationContent?.specificData?.elevation || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {contentTab === 'memory' && memoryAid && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3">Memory Aids</h4>
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
                                  <li key={idx} className="text-gray-600">{cue}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Natural Features & Landmarks */}
                    {(selectedCounty.naturalFeatures || selectedCounty.culturalLandmarks) && (
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        {selectedCounty.naturalFeatures && (
                          <div className="p-4 bg-teal-50 rounded-lg">
                            <h4 className="font-semibold text-teal-900 mb-2">🏔️ Natural Features</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedCounty.naturalFeatures.map((feature: string, idx: number) => (
                                <span key={idx} className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-sm">
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
                                <span key={idx} className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-sm">
                                  {landmark}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Related Counties */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-3">🔗 Related Counties to Study</h4>
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
                              .filter(c => c.region === selectedCounty.region && c.id !== selectedCounty.id)
                              .slice(0, 6)
                              .map(c => c.id);
                          }

                          return relatedIds.slice(0, 6).map(countyId => {
                            // Try to find the county with both ID formats
                            const relatedCounty = counties.find(c =>
                              c.id === countyId ||
                              c.id === countyId.replace(/_/g, '-') ||
                              c.id.toLowerCase().replace(/-/g, '_') === countyId
                            );

                            if (!relatedCounty) return null;

                            return (
                              <button
                                key={countyId}
                                onClick={() => handleCountySelect(relatedCounty)}
                                className="px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700 hover:text-gray-900"
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
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <span className="text-6xl mb-4">📖</span>
                    <p className="text-lg font-medium">Select a county to begin studying</p>
                    <p className="text-sm mt-2">Explore comprehensive educational content for all 58 counties</p>
                  </div>
                )}
              </div>
            </>
          )}

          {viewMode === 'quiz' && (
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                {!quizQuestion ? (
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">🎯 County Knowledge Quiz</h2>
                    <p className="text-gray-600 mb-8">Test your knowledge of California counties!</p>

                    {/* Quiz Statistics */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{progress.currentStreak}</div>
                        <div className="text-sm text-gray-600">Current Streak</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{progress.totalPoints}</div>
                        <div className="text-sm text-gray-600">Total Points</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{progress.completedQuizzes.size}</div>
                        <div className="text-sm text-gray-600">Quizzes Completed</div>
                      </div>
                    </div>

                    <button
                      onClick={generateQuizQuestion}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105"
                    >
                      Start New Quiz
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="mb-4 text-sm text-gray-500">Question {progress.completedQuizzes.size + 1}</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">{quizQuestion.question}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {quizQuestion.options.map((option: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleQuizAnswer(option)}
                          className="p-4 bg-gray-100 rounded-lg hover:bg-blue-100 transition-colors text-lg font-medium text-gray-700"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    <div className="mt-6 pt-6 border-t">
                      <button
                        onClick={() => setQuizQuestion(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Skip Question →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Map Mode - Interactive Visual Learning */}
          {viewMode === 'map' && (
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🗺️ Interactive County Map</h2>
                <p className="text-gray-600 mb-6">Hover to see county names • Click to select and view details</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Map Display Area */}
                  <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-4 min-h-[600px]">
                    <StudyModeMap
                      onCountySelect={(countyId) => {
                        const county = counties.find(c => c.id === countyId || c.id === countyId.replace(/-/g, '_'));
                        if (county) {
                          handleCountySelect(county);
                          setShowCountyDetailsModal(true);
                        }
                      }}
                      selectedCounty={selectedCounty}
                    />
                  </div>

                  {/* County Info Panel */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="font-bold text-lg mb-4">📍 County Information</h3>
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
                            <h4 className="text-xl font-semibold text-blue-600">{selectedCounty.name}</h4>
                            <div className="text-sm text-gray-500 mb-2">{selectedCounty.region}</div>
                            <div className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded inline-block">
                              County ID: {selectedCounty.id}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">County Seat:</span>
                            <span className="text-gray-800">{selectedCounty.capital || selectedCounty.countySeat || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Population:</span>
                            <span className="text-gray-800">{selectedCounty.population?.toLocaleString() || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Area:</span>
                            <span className="text-gray-800">{selectedCounty.area ? `${selectedCounty.area.toLocaleString()} sq mi` : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Established:</span>
                            <span className="text-gray-800">{selectedCounty.founded || selectedCounty.established || 'N/A'}</span>
                          </div>
                        </div>

                        {selectedCounty.funFact && (
                          <div className="pt-4 border-t">
                            <h5 className="font-medium text-gray-700 mb-2">Fun Fact:</h5>
                            <p className="text-sm text-gray-600 italic">{selectedCounty.funFact}</p>
                          </div>
                        )}

                        {selectedCounty.funFacts && selectedCounty.funFacts.length > 0 && (
                          <div className="pt-4 border-t">
                            <h5 className="font-medium text-gray-700 mb-2">Interesting Facts:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
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
                          <div className="pt-4 border-t">
                            <button
                              onClick={() => setShowEducationalModal(true)}
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
                        <p className="text-gray-500">Hover over counties to see their names</p>
                        <p className="text-gray-500 text-sm mt-2">Click on a county to view detailed information</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Region Legend */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">🎨 Color Legend by Region:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }} />
                      <span className="text-sm text-gray-700">Bay Area</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }} />
                      <span className="text-sm text-gray-700">Southern California</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }} />
                      <span className="text-sm text-gray-700">Central Valley</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#A855F7' }} />
                      <span className="text-sm text-gray-700">Central Coast</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }} />
                      <span className="text-sm text-gray-700">Northern California</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#06B6D4' }} />
                      <span className="text-sm text-gray-700">North Coast</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8B5CF6' }} />
                      <span className="text-sm text-gray-700">Sierra Nevada</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Mode - Historical Perspective with Side Panel */}
          {viewMode === 'timeline' && (
            <div className="flex-1 flex gap-4 p-6 overflow-hidden">
              {/* Main Timeline Area - Left Side */}
              <div className="flex-1 overflow-y-auto pr-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">📅 California Counties Timeline</h2>
                <p className="text-gray-600 mb-5 text-sm">Click any county to view detailed information →</p>

                {/* Timeline visualization */}
                <div className="space-y-5">
                  {/* Group counties by decade */}
                  {(() => {
                    const countiesByDecade = counties.reduce((acc: any, county) => {
                      const year = county.founded || county.established;
                      if (year) {
                        const decade = Math.floor(year / 10) * 10;
                        if (!acc[decade]) acc[decade] = [];
                        acc[decade].push(county);
                      }
                      return acc;
                    }, {});

                    const sortedDecades = Object.keys(countiesByDecade).sort((a, b) => Number(a) - Number(b));

                    return sortedDecades.map(decade => (
                      <div key={decade} className="relative">
                        {/* Decade Header */}
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                            {decade}s
                          </div>
                          <div className="flex-1 h-0.5 bg-gradient-to-r from-gray-300 to-transparent ml-4"></div>
                        </div>

                        {/* Counties in this decade */}
                        <div className="flex flex-wrap gap-3 ml-6">
                          {countiesByDecade[decade]
                            .sort((a: any, b: any) => (a.founded || a.established) - (b.founded || b.established))
                            .map((county: any) => (
                            <button
                              key={county.id}
                              onClick={() => handleCountySelect(county)}
                              className={`min-w-[140px] max-w-[180px] p-3 rounded-xl border-2 transition-all transform hover:scale-105 ${
                                selectedCounty?.id === county.id
                                  ? 'bg-gradient-to-br from-blue-100 to-purple-100 border-blue-500 shadow-lg scale-105'
                                  : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50'
                              }`}
                            >
                              <div className="text-sm font-semibold text-gray-800">{county.name}</div>
                              <div className="text-xs text-gray-500 font-medium">{county.founded || county.established}</div>
                              {selectedCounty?.id === county.id && (
                                <div className="mt-0.5">
                                  <span className="text-xs text-blue-600 font-bold">✓ Selected</span>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Right Side Panel for County Details */}
              <div className="w-80 flex-shrink-0">
                {selectedCounty ? (
                  <div className="sticky top-0 bg-white rounded-2xl shadow-2xl p-5 border-2 border-gray-100 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <div className="mb-4">
                      {/* Header with County Shape */}
                      <div className="flex items-start gap-3 mb-3">
                        <CountyShapeDisplay
                          countyId={selectedCounty.id}
                          size={75}
                          className="flex-shrink-0 shadow-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800">{selectedCounty.name} County</h3>
                          <p className="text-sm text-gray-500 font-medium">{selectedCounty.region}</p>
                        </div>
                      </div>
                      <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                        <h4 className="font-bold text-blue-900 mb-1 text-sm flex items-center gap-2">
                          <span>📅</span> Established
                        </h4>
                        <p className="text-2xl font-bold text-blue-700">{selectedCounty.founded || selectedCounty.established || 'Unknown'}</p>
                      </div>

                      <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                        <h4 className="font-bold text-purple-900 mb-1 text-sm flex items-center gap-2">
                          <span>🏛️</span> County Seat
                        </h4>
                        <p className="text-lg font-semibold text-purple-700">{selectedCounty.capital || selectedCounty.countySeat || 'N/A'}</p>
                      </div>

                      <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                        <h4 className="font-bold text-green-900 mb-1 text-sm flex items-center gap-2">
                          <span>📍</span> Region
                        </h4>
                        <p className="text-base font-medium text-green-700">{selectedCounty.region || 'N/A'}</p>
                      </div>

                      {selectedCounty.population && (
                        <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                          <h4 className="font-bold text-amber-900 mb-1 text-sm flex items-center gap-2">
                            <span>👥</span> Population
                          </h4>
                          <p className="text-base font-semibold text-amber-700">{selectedCounty.population.toLocaleString()}</p>
                        </div>
                      )}

                      {educationContent && (
                        <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                          <h4 className="font-bold text-gray-800 mb-2 text-sm flex items-center gap-2">
                            <span>📚</span> Historical Context
                          </h4>
                          <p className="text-xs text-gray-700 leading-relaxed">{educationContent.historicalContext}</p>
                        </div>
                      )}

                      {selectedCounty.funFacts && selectedCounty.funFacts.length > 0 && (
                        <div className="p-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl">
                          <h4 className="font-bold text-yellow-900 mb-2 text-sm flex items-center gap-2">
                            <span>✨</span> Fun Facts
                          </h4>
                          <ul className="space-y-1">
                            {selectedCounty.funFacts.slice(0, 3).map((fact: string, idx: number) => (
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
                  <div className="sticky top-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg p-6 border-2 border-gray-200 h-[400px] flex flex-col items-center justify-center text-center">
                    <span className="text-5xl mb-3 opacity-50">📋</span>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Select a County</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Click on any county from the timeline to view its detailed historical information and facts.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Progress: {progress.studiedCounties.size} counties studied • {progress.totalPoints} points earned
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHints(!showHints)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                {showHints ? 'Hide' : 'Show'} Learning Tips
              </button>
              <button
                onClick={onStartGame}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Practice Game
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Return to Menu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Content Modal */}
      <EducationalContentModal
        isOpen={showEducationalModal}
        onClose={() => setShowEducationalModal(false)}
        county={selectedCounty}
        educationContent={educationContent}
        memoryAid={memoryAid}
      />

      {/* County Details Modal */}
      <CountyDetailsModal
        isOpen={showCountyDetailsModal}
        onClose={() => setShowCountyDetailsModal(false)}
        county={selectedCounty}
        educationContent={educationContent}
        memoryAid={memoryAid}
        onViewEducationalContent={() => {
          setShowCountyDetailsModal(false);
          setShowEducationalModal(true);
        }}
      />
    </div>
  );
}