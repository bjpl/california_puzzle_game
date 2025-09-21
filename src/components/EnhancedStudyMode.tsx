import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getCountyEducation, getMemoryAid, getRelatedCounties, historicalConnections, interCountyConnections } from '../data/countyEducation';
import { getCountyEducationComplete } from '../data/countyEducationComplete';
import { getMemoryAid as getMemoryAidData, memoryPatterns, spatialRelationships, learningStrategies } from '../data/memoryAids';
import { useSoundEffect } from '../utils/simpleSoundManager';

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

type ViewMode = 'explore' | 'flashcards' | 'quiz' | 'map' | 'timeline' | 'connections';
type ContentTab = 'overview' | 'history' | 'economy' | 'culture' | 'geography' | 'memory';

export default function EnhancedStudyMode({ onClose, onStartGame }: StudyModeProps) {
  const { counties } = useGame();
  const sound = useSoundEffect();

  const [viewMode, setViewMode] = useState<ViewMode>('explore');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCounty, setSelectedCounty] = useState<any>(null);
  const [contentTab, setContentTab] = useState<ContentTab>('overview');
  const [showHints, setShowHints] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState<any>(null);
  const [progress, setProgress] = useState<StudyProgress>({
    studiedCounties: new Set(),
    completedQuizzes: new Set(),
    masteredCounties: new Set(),
    currentStreak: 0,
    totalPoints: 0
  });

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('californiaStudyProgress');
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      setProgress({
        ...parsed,
        studiedCounties: new Set(parsed.studiedCounties),
        completedQuizzes: new Set(parsed.completedQuizzes),
        masteredCounties: new Set(parsed.masteredCounties)
      });
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    const toSave = {
      ...progress,
      studiedCounties: Array.from(progress.studiedCounties),
      completedQuizzes: Array.from(progress.completedQuizzes),
      masteredCounties: Array.from(progress.masteredCounties)
    };
    localStorage.setItem('californiaStudyProgress', JSON.stringify(toSave));
  }, [progress]);

  // Get unique regions
  const regions = Array.from(new Set(counties.map(c => c.region))).sort();

  // Filter counties by region
  const filteredCounties = selectedRegion === 'all'
    ? counties
    : counties.filter(c => c.region === selectedRegion);

  // Sort counties alphabetically
  const sortedCounties = [...filteredCounties].sort((a, b) => a.name.localeCompare(b.name));

  // Handle county selection
  const handleCountySelect = (county: any) => {
    setSelectedCounty(county);
    setContentTab('overview');
    setProgress(prev => ({
      ...prev,
      studiedCounties: new Set([...prev.studiedCounties, county.id])
    }));
    // Removed sound effect for better study experience
  };

  // Generate quiz question
  const generateQuizQuestion = () => {
    const randomCounty = sortedCounties[Math.floor(Math.random() * sortedCounties.length)];
    const education = getCountyEducation(randomCounty.id);

    const questionTypes = [
      {
        question: `Which county is known as the "${randomCounty.funFact?.split(' ')[0]} Capital"?`,
        answer: randomCounty.name,
        options: generateOptions(randomCounty.name, counties.map(c => c.name))
      },
      {
        question: `What region is ${randomCounty.name} County located in?`,
        answer: randomCounty.region,
        options: generateOptions(randomCounty.region, regions)
      },
      {
        question: `What is the county seat of ${randomCounty.name} County?`,
        answer: randomCounty.capital,
        options: generateOptions(randomCounty.capital, counties.map(c => c.capital).filter(Boolean))
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
            {(['explore', 'flashcards', 'quiz', 'map', 'timeline', 'connections'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-blue-600'
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
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
                              <h4 className="font-semibold text-blue-900 mb-2">Quick Facts</h4>
                              <div className="space-y-1 text-sm">
                                <div><strong>County Seat:</strong> {selectedCounty.capital}</div>
                                <div><strong>Population:</strong> {selectedCounty.population?.toLocaleString()}</div>
                                <div><strong>Area:</strong> {selectedCounty.area?.toLocaleString()} sq mi</div>
                                <div><strong>Founded:</strong> {selectedCounty.founded}</div>
                              </div>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                              <h4 className="font-semibold text-green-900 mb-2">Fun Fact</h4>
                              <p className="text-sm text-green-800">{selectedCounty.funFact}</p>
                            </div>
                          </div>
                          {educationContent?.specificData?.majorAttractions && (
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

                    {/* Related Counties */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-3">Related Counties to Study</h4>
                      <div className="flex flex-wrap gap-2">
                        {getRelatedCounties(selectedCounty.id).slice(0, 6).map(countyId => {
                          const relatedCounty = counties.find(c => c.id === countyId);
                          if (!relatedCounty) return null;
                          return (
                            <button
                              key={countyId}
                              onClick={() => handleCountySelect(relatedCounty)}
                              className="px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              {relatedCounty.name}
                            </button>
                          );
                        })}
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
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-2xl w-full">
                {!quizQuestion ? (
                  <button
                    onClick={generateQuizQuestion}
                    className="w-full py-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-xl font-bold hover:from-blue-600 hover:to-purple-600 transition-colors"
                  >
                    Start Quiz
                  </button>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">{quizQuestion.question}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {quizQuestion.options.map((option: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleQuizAnswer(option)}
                          className="p-4 bg-gray-100 rounded-lg hover:bg-blue-100 transition-colors text-lg font-medium"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add more view modes (flashcards, map, timeline, connections) as needed */}
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
    </div>
  );
}