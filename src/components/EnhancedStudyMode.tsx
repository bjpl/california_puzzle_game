import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getCountyEducation, getMemoryAid, getRelatedCounties, historicalConnections, interCountyConnections } from '../data/countyEducation';
import { getCountyEducationComplete } from '../data/countyEducationComplete';
import { getMemoryAid as getMemoryAidData, memoryPatterns, spatialRelationships, learningStrategies } from '../data/memoryAids';
import { useSoundEffect } from '../utils/simpleSoundManager';
import { californiaCounties, CaliforniaCounty } from '../data/californiaCounties';
import { getQuestionsByRegion, QuizQuestion, getRandomQuestions } from '../data/californiaQuizQuestions';
import StudyModeMap from './StudyModeMap';
import CountyShapeDisplay from './CountyShapeDisplay';
import EducationalContentModal from './EducationalContentModal';
import CountyDetailsModal from './CountyDetailsModal';
import { getRegionColor } from '../config/regionColors';

interface StudyModeProps {
  onClose: () => void;
  onStartGame: () => void;
}

interface StudyProgress {
  studiedCounties: Set<string>;
  completedQuizzes: Set<string>;
  masteredCounties: Set<string>;
}

type ViewMode = 'explore' | 'quiz' | 'map' | 'timeline';
type ContentTab = 'overview' | 'history' | 'economy' | 'culture' | 'geography' | 'memory';
type QuizState = 'idle' | 'active' | 'summary';

interface QuizSettings {
  questionsPerSession: number;
}

interface QuestionResult {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
}

export default function EnhancedStudyMode({ onClose, onStartGame }: StudyModeProps) {
  const { counties } = useGame();
  const sound = useSoundEffect();

  const [viewMode, setViewMode] = useState<ViewMode>('explore');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCounty, setSelectedCounty] = useState<any>(null);
  const [contentTab, setContentTab] = useState<ContentTab>('overview');
  const [showEducationalModal, setShowEducationalModal] = useState(false);
  const [showCountyDetailsModal, setShowCountyDetailsModal] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [questionHistory, setQuestionHistory] = useState<QuestionResult[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showRegionChangeModal, setShowRegionChangeModal] = useState(false);
  const [pendingRegion, setPendingRegion] = useState<string>('');
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    questionsPerSession: 10
  });
  const [progress, setProgress] = useState<StudyProgress>({
    studiedCounties: new Set(),
    completedQuizzes: new Set(),
    masteredCounties: new Set()
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

  // Generate quiz question using the comprehensive database
  const generateQuizQuestion = () => {
    // Apply region filter and ensure randomization
    const filters: any = {
      region: selectedRegion !== 'all' ? selectedRegion : undefined,
      excludeIds: Array.from(usedQuestionIds)
    };

    // Get filtered questions
    const questions = getRandomQuestions(1, filters);

    if (questions.length === 0) {
      // Reset if we've used all questions
      setUsedQuestionIds(new Set());
      // Try again with fresh pool
      const freshQuestions = getRandomQuestions(1, {
        ...filters,
        excludeIds: []
      });

      if (freshQuestions.length === 0) {
        console.warn('No questions available with current filters');
        return;
      }

      const question = freshQuestions[0];
      setQuizQuestion(question);
      setUsedQuestionIds(new Set([question.id]));
    } else {
      const question = questions[0];
      setQuizQuestion(question);
      setUsedQuestionIds(prev => new Set([...prev, question.id]));
    }

    // Reset question state
    setSelectedAnswer(null);
    setShowAnswer(false);
  };

  // Start a new quiz session with specific question count
  const startQuiz = (questionCount: number) => {
    setQuizSettings({ questionsPerSession: questionCount });
    setQuizState('active');
    setQuestionHistory([]);
    setCurrentQuestionIndex(0);
    setUsedQuestionIds(new Set());
    generateQuizQuestion();
  };

  // End the current quiz
  const endQuiz = () => {
    setQuizState('summary');
  };

  // Navigate to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);

      // If we have history for this question, show it
      if (newIndex < questionHistory.length) {
        const prevResult = questionHistory[newIndex];
        setQuizQuestion(prevResult.question);
        setSelectedAnswer(prevResult.userAnswer);
        setShowAnswer(true);
      }
    }
  };

  // Navigate to next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questionHistory.length - 1) {
      // Navigate to existing answered question
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      const nextResult = questionHistory[newIndex];
      setQuizQuestion(nextResult.question);
      setSelectedAnswer(nextResult.userAnswer);
      setShowAnswer(true);
    } else {
      // Generate new question if we're at the last position
      if (questionHistory.length >= quizSettings.questionsPerSession) {
        // End quiz if we've reached the question limit
        endQuiz();
      } else {
        // Generate a new question
        setCurrentQuestionIndex(questionHistory.length);
        generateQuizQuestion();
      }
    }
  };


  // Handle quiz answer
  const handleQuizAnswer = (answer: string) => {
    if (!quizQuestion || showAnswer) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === quizQuestion.correctAnswer;

    // Add to history only if this is a new question (not reviewing)
    if (currentQuestionIndex === questionHistory.length) {
      const result: QuestionResult = {
        question: quizQuestion,
        userAnswer: answer,
        isCorrect
      };
      setQuestionHistory(prev => [...prev, result]);
    }

    if (isCorrect) {
      sound.playSound('correct');
      setProgress(prev => ({
        ...prev,
        completedQuizzes: new Set([...prev.completedQuizzes, quizQuestion.question])
      }));
    } else {
      sound.playSound('incorrect');
    }

    // Show answer
    setShowAnswer(true);
  };

  // Reset quiz to initial state
  const resetQuiz = () => {
    setQuizState('idle');
    setQuizQuestion(null);
    setQuestionHistory([]);
    setCurrentQuestionIndex(0);
    setUsedQuestionIds(new Set());
    setShowAnswer(false);
    setSelectedAnswer(null);
  };

  // Handle region change - works for both selectedRegion and quiz settings
  const handleRegionChange = (newRegion: string) => {
    if (quizState === 'active') {
      // Store the pending region and show modal
      setPendingRegion(newRegion);
      setShowRegionChangeModal(true);
    } else {
      // Not in active quiz, change directly
      setSelectedRegion(newRegion);
      setQuizSettings(prev => ({ ...prev, region: newRegion }));
    }
  };

  // Confirm region change and start new quiz
  const confirmRegionChange = () => {
    setSelectedRegion(pendingRegion);
    setShowRegionChangeModal(false);
    resetQuiz();
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (viewMode !== 'quiz' || !quizQuestion) return;

      // Number keys 1-4 for answers (only in active state, not showing answer)
      if (quizState === 'active' && !showAnswer && e.key >= '1' && e.key <= '4') {
        const index = parseInt(e.key) - 1;
        if (index < quizQuestion.options.length) {
          handleQuizAnswer(quizQuestion.options[index]);
        }
      }
      // Space or Enter for next question
      else if ((e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        goToNextQuestion();
      }
      // Arrow keys for navigation
      else if (e.key === 'ArrowLeft') {
        goToPreviousQuestion();
      }
      else if (e.key === 'ArrowRight') {
        goToNextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [viewMode, quizState, quizQuestion, showAnswer, currentQuestionIndex, questionHistory]);

  // Get region colors from centralized configuration
  const getRegionGradient = (region: string): string => {
    const colorConfig = getRegionColor(region);
    return colorConfig.tailwindGradient;
  };

  // Get education content for selected county
  // Try to get complete data first, fall back to basic data if not available
  const educationContent = selectedCounty ?
    (getCountyEducationComplete(selectedCounty.id) || getCountyEducation(selectedCounty.id)) :
    null;
  const memoryAid = selectedCounty ? getMemoryAidData(selectedCounty.id) : null;

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col h-screen w-screen overflow-hidden">
        {/* Enhanced Header with Modern Design - Fixed Position */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white overflow-hidden flex-shrink-0">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`
            }}></div>
          </div>

          {/* Main Header Content */}
          <div className="relative">
            {/* Ultra-Compact Top Bar */}
            <div className="px-4 sm:px-6 py-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-white/10 backdrop-blur-sm border border-white/20 text-xs">
                  📚
                </span>
                <h1 className="text-sm font-bold tracking-tight text-white">
                  California Counties Study Mode
                </h1>
                <span className="hidden sm:inline text-xs text-blue-200/60">
                  • Master all 58 counties
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Ultra-Compact Progress */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-2 py-0.5 flex items-center gap-1.5">
                  <div className="relative w-6 h-6">
                    <svg className="transform -rotate-90 w-6 h-6">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-white/20"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${(progress.studiedCounties.size / 58) * 63} 63`}
                        className="text-blue-400 transition-all duration-500"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">
                      {Math.round((progress.studiedCounties.size / 58) * 100)}%
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold">{progress.studiedCounties.size}</span>
                    <span className="text-blue-200/70">/58</span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-1 rounded bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
                  aria-label="Close Study Mode"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Navigation Tabs - Compact Design */}
            <div className="px-4 sm:px-6 pb-1">
              <nav className="flex gap-1 p-0.5 bg-black/20 backdrop-blur-sm rounded-lg overflow-x-auto">
                {[
                  { mode: 'explore' as ViewMode, icon: '📚', label: 'Explore' },
                  { mode: 'quiz' as ViewMode, icon: '🎯', label: 'Quiz' },
                  { mode: 'map' as ViewMode, icon: '🗺️', label: 'Map' },
                  { mode: 'timeline' as ViewMode, icon: '📅', label: 'Timeline' }
                ].map(({ mode, icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`
                      relative flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md
                      font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap min-w-[70px]
                      ${
                        viewMode === mode
                          ? 'bg-white text-gray-900 shadow-md'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <span className="text-sm sm:text-base">{icon}</span>
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{label.slice(0, 3)}</span>
                    {viewMode === mode && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full hidden sm:block">
                        <div className="w-2 h-2 bg-white transform rotate-45 -mt-1"></div>
                      </div>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Refined Region Filter Bar - Compact & Sticky */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 shadow-sm flex-shrink-0 sticky top-0 z-40">
          <div className="px-4 sm:px-6 py-1">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {/* Filter Label */}
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">
                Filter by Region:
              </span>

              {/* Region Pills Container */}
              <div className="flex gap-2">
                {/* All Counties Button */}
                <button
                  onClick={() => handleRegionChange('all')}
                  className={`
                    relative px-3 py-0.5 rounded-full text-xs font-medium leading-none
                    transition-all duration-200 whitespace-nowrap inline-flex items-center justify-center h-auto
                    ${
                      selectedRegion === 'all'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md transform scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <span className="leading-none">All Counties</span>
                  <span className={`
                    ml-1.5 inline-flex items-center justify-center min-w-[20px] px-1 py-px rounded-full text-[10px] font-bold leading-none
                    ${selectedRegion === 'all' ? 'bg-white/20' : 'bg-gray-100'}
                  `}>
                    {counties.length}
                  </span>
                </button>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-300 self-center mx-1"></div>

                {/* Region Buttons */}
                {regions.map(region => {
                  const count = counties.filter(c => c.region === region).length;
                  return (
                    <button
                      key={region}
                      onClick={() => handleRegionChange(region)}
                      className={`
                        relative px-3 py-0.5 rounded-full text-xs font-medium leading-none
                        transition-all duration-200 whitespace-nowrap inline-flex items-center justify-center h-auto
                        ${
                          selectedRegion === region
                            ? `bg-gradient-to-r ${getRegionGradient(region)} text-white shadow-md transform scale-105`
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
                        }
                      `}
                    >
                      <span className="leading-none">{region}</span>
                      <span className={`
                        ml-1.5 inline-flex items-center justify-center min-w-[20px] px-1 py-px rounded-full text-[10px] font-bold leading-none
                        ${selectedRegion === region ? 'bg-white/20' : 'bg-gray-100'}
                      `}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Full Height */}
        <div className="flex-1 flex overflow-hidden bg-gray-50">
          {viewMode === 'explore' && (
            <>
              {/* County List - Optimized Width */}
              <div className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 min-w-[280px] max-w-[400px] border-r border-gray-200 bg-white overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {selectedRegion === 'all' ? 'All Counties' : selectedRegion}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{sortedCounties.length} counties</p>
                </div>
                <div className="p-4 space-y-2">
                  {sortedCounties.map(county => {
                    const isStudied = progress.studiedCounties.has(county.id);
                    const isMastered = progress.masteredCounties.has(county.id);
                    return (
                      <button
                        key={county.id}
                        onClick={() => handleCountySelect(county)}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 border ${
                          selectedCounty?.id === county.id
                            ? 'ring-2 ring-blue-500 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                            : 'bg-white hover:bg-gray-50 hover:shadow-md border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{county.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{county.capital || county.countySeat}</div>
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

              {/* County Details - Expanded Layout */}
              <div className="flex-1 flex flex-col bg-gray-50">
                <div className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto w-full">
                  {selectedCounty ? (
                    <div>
                    {/* County Header - Enhanced */}
                    <div className="mb-8">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-4xl font-bold text-gray-900 mb-3">
                            {selectedCounty.name} County
                          </h3>
                          <div className={`inline-block px-5 py-2.5 rounded-full text-white font-semibold bg-gradient-to-r shadow-lg ${
                            getRegionGradient(selectedCounty.region)
                          }`}>
                            {selectedCounty.region}
                          </div>
                        </div>
                        <div className="text-right">
                          {selectedCounty.founded && (
                            <div className="text-sm text-gray-500">Established</div>
                          )}
                          <div className="text-2xl font-bold text-gray-800">
                            {selectedCounty.founded || selectedCounty.established || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Tabs - Enhanced Design */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-6">
                      <div className="flex gap-1 flex-wrap">
                        {[
                          { id: 'overview' as ContentTab, label: 'Overview', icon: '📊' },
                          { id: 'history' as ContentTab, label: 'History', icon: '📜' },
                          { id: 'economy' as ContentTab, label: 'Economy', icon: '💼' },
                          { id: 'culture' as ContentTab, label: 'Culture', icon: '🎭' },
                          { id: 'geography' as ContentTab, label: 'Geography', icon: '🗺️' },
                          { id: 'memory' as ContentTab, label: 'Memory Aid', icon: '🧠' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setContentTab(tab.id)}
                            className={`
                              flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                              font-medium transition-all duration-200
                              ${
                                contentTab === tab.id
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                              }
                            `}
                          >
                            <span>{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tab Content - Improved Spacing */}
                    <div className="space-y-6">
                      {contentTab === 'overview' && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                              <h4 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
                                <span className="text-2xl">📊</span> Quick Facts
                              </h4>
                              <div className="space-y-1 text-sm text-gray-700">
                                <div><strong className="text-gray-900">County Seat:</strong> <span className="text-gray-700">{selectedCounty?.capital || selectedCounty?.countySeat || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Population:</strong> <span className="text-gray-700">{selectedCounty?.population ? selectedCounty.population.toLocaleString() : 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Area:</strong> <span className="text-gray-700">{selectedCounty?.area ? `${selectedCounty.area.toLocaleString()} sq mi` : 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Established:</strong> <span className="text-gray-700">{selectedCounty?.founded || selectedCounty?.established || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Region:</strong> <span className="text-gray-700">{selectedCounty?.region || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Difficulty:</strong> <span className="text-gray-700">{selectedCounty?.difficulty ? selectedCounty.difficulty.charAt(0).toUpperCase() + selectedCounty.difficulty.slice(1) : 'N/A'}</span></div>
                              </div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                              <h4 className="font-bold text-green-900 mb-4 text-lg flex items-center gap-2">
                                <span className="text-2xl">🎉</span> Fun Facts
                              </h4>
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
              </div>
            </>
          )}

          {viewMode === 'quiz' && (
            <div className="flex-1 bg-gradient-to-br from-gray-50 to-indigo-50 overflow-y-auto">
              <div className="max-w-6xl mx-auto p-8">
                {/* Quiz States */}
                {quizState === 'idle' && (
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">🎯 County Knowledge Quiz</h2>
                    <p className="text-gray-600 mb-8">Test your knowledge of California counties!</p>

                    {/* Quiz Statistics */}
                    <div className="flex justify-center mb-8">
                      <div className="bg-purple-50 p-6 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600">{progress.completedQuizzes.size}</div>
                        <div className="text-sm text-gray-600">Questions Studied</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => startQuiz(5)}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105"
                      >
                        🎯 Quick Quiz (5)
                      </button>
                      <button
                        onClick={() => startQuiz(15)}
                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                      >
                        🏆 Full Quiz (15)
                      </button>
                    </div>

                  </div>
                )}

                {/* Active Quiz */}
                {quizState === 'active' && quizQuestion && (
                  <div>
                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Question {currentQuestionIndex + 1} of {quizSettings.questionsPerSession}
                        </span>
                        <span className="text-sm text-gray-500">
                          {Math.min(questionHistory.length, quizSettings.questionsPerSession)} answered
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((currentQuestionIndex + 1) / quizSettings.questionsPerSession) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-white rounded-xl shadow-lg p-8 relative">
                      {/* Question Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                          <div className="flex gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                              {quizQuestion.type}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                              {quizQuestion.difficulty}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              {quizQuestion.region}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-800">{quizQuestion.question}</h3>
                        </div>
                      </div>

                      {/* Answer Options */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {quizQuestion.options.map((option: string, idx: number) => {
                          const isSelected = selectedAnswer === option;
                          const isCorrect = option === quizQuestion.correctAnswer;
                          const showResult = showAnswer;

                          return (
                            <button
                              key={idx}
                              onClick={() => !showAnswer && handleQuizAnswer(option)}
                              disabled={showAnswer}
                              className={`p-4 rounded-lg transition-all text-lg font-medium relative ${
                                showResult
                                  ? isCorrect
                                    ? 'bg-green-100 border-2 border-green-500 text-green-800'
                                    : isSelected
                                    ? 'bg-red-100 border-2 border-red-500 text-red-800'
                                    : 'bg-gray-100 text-gray-500'
                                  : isSelected
                                  ? 'bg-blue-100 border-2 border-blue-500 text-blue-800'
                                  : 'bg-gray-100 hover:bg-blue-50 text-gray-700'
                              }`}
                            >
                              <span className="absolute top-2 left-2 text-xs font-bold text-gray-400">
                                {idx + 1}
                              </span>
                              {option}
                              {showResult && isCorrect && (
                                <span className="ml-2">✓</span>
                              )}
                              {showResult && isSelected && !isCorrect && (
                                <span className="ml-2">✗</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation (shown after answering) */}
                      {showAnswer && quizQuestion.explanation && (
                        <div className="p-4 bg-blue-50 rounded-lg mb-6">
                          <p className="text-sm text-blue-800">
                            <strong>Explanation:</strong> {quizQuestion.explanation}
                          </p>
                        </div>
                      )}

                      {/* Navigation Controls */}
                      <div className="flex justify-between items-center pt-6 border-t">
                        <div className="flex gap-2">
                          <button
                            onClick={goToPreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              currentQuestionIndex === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            ← Previous
                          </button>
                          <button
                            onClick={goToNextQuestion}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${
                              showAnswer
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {currentQuestionIndex >= questionHistory.length - 1 && questionHistory.length >= quizSettings.questionsPerSession
                              ? 'Finish Quiz →'
                              : 'Next →'}
                          </button>
                        </div>

                        <button
                          onClick={endQuiz}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          End Quiz
                        </button>
                      </div>

                      {/* Keyboard shortcuts hint */}
                      <div className="mt-4 text-xs text-gray-500 text-center">
                        Press 1-4 to select answer • Space/Enter for next • ← → to navigate
                      </div>
                    </div>
                  </div>
                )}

                {/* Quiz Summary */}
                {quizState === 'summary' && (
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">📊 Quiz Complete!</h2>

                    {/* Score Summary */}
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <div className="text-3xl font-bold text-green-600">
                            {questionHistory.filter(q => q.isCorrect).length}
                          </div>
                          <div className="text-sm text-gray-600">Correct</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-blue-600">
                            {Math.round((questionHistory.filter(q => q.isCorrect).length / questionHistory.length) * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">Accuracy</div>
                        </div>
                      </div>

                      {/* Question Review */}
                      <div className="border-t pt-6">
                        <h3 className="font-semibold text-gray-700 mb-4">Question Review</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {questionHistory.map((result, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                result.isCorrect ? 'bg-green-50' : 'bg-red-50'
                              }`}
                            >
                              <span className="text-sm">
                                Q{idx + 1}: {result.question.countyName} - {result.question.type}
                              </span>
                              <span className={`text-sm font-medium ${
                                result.isCorrect ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {result.isCorrect ? '✓' : '✗'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={startQuiz}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600"
                      >
                        New Quiz
                      </button>
                      <button
                        onClick={resetQuiz}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                      >
                        Back to Menu
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Map Mode - Interactive Visual Learning */}
          {viewMode === 'map' && (
            <div className="flex-1 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-y-auto">
              <div className="h-full w-full p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-800">🗺️ Interactive County Map</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Hover to see • Click to select</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Map Display Area - Fixed height, no scroll (map handles its own zoom) */}
                  <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-3 h-[calc(100vh-240px)]">
                    <StudyModeMap
                      onCountySelect={(countyId) => {
                        const county = counties.find(c => c.id === countyId || c.id === countyId.replace(/-/g, '_'));
                        if (county) {
                          handleCountySelect(county);
                          setShowCountyDetailsModal(true);
                        }
                      }}
                      selectedCounty={selectedCounty}
                      filteredCounties={sortedCounties}
                      showAllCounties={selectedRegion === 'all'}
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
            <div className="flex-1 flex gap-6 bg-gradient-to-br from-gray-50 to-amber-50 overflow-hidden p-8">
              {/* Main Timeline Area - Left Side */}
              <div className="flex-1 overflow-y-auto pr-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">📅 California Counties Timeline</h2>
                <p className="text-gray-600 mb-5 text-sm">Click any county to view detailed information →</p>

                {/* Timeline visualization */}
                <div className="space-y-5">
                  {/* Group counties by decade */}
                  {(() => {
                    const countiesByDecade = sortedCounties.reduce((acc: any, county) => {
                      const year = county.founded || county.established;
                      if (year) {
                        const decade = Math.floor(year / 10) * 10;
                        if (!acc[decade]) acc[decade] = [];
                        acc[decade].push(county);
                      }
                      return acc;
                    }, {});

                    const sortedDecades = Object.keys(countiesByDecade).sort((a, b) => Number(a) - Number(b));

                    if (sortedDecades.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <div className="text-5xl mb-4">🔍</div>
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Counties Found</h3>
                          <p className="text-gray-500">No counties match the selected region filter.</p>
                          <button
                            onClick={() => setSelectedRegion('all')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Show All Counties
                          </button>
                        </div>
                      );
                    }

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
                  <div className="bg-white rounded-2xl shadow-2xl p-5 border-2 border-gray-100 h-full overflow-y-auto">
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
              Progress: {progress.studiedCounties.size} counties studied
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Return to Menu
              </button>
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

      {/* Region Change Modal */}
      {showRegionChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Change Region?</h3>
            <p className="text-gray-600 mb-6">
              You have an active quiz in progress. Changing the region will end your current quiz and start a new one.
              Do you want to continue?
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setShowRegionChangeModal(false);
                  setPendingRegion('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRegionChange}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Start New Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}