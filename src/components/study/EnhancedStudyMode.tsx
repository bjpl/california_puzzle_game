import { useState, useEffect } from 'react';
import { studyLogger } from '../../utils/logger';
import { useGame } from '../../context/GameContext';
import { getCountyEducation } from '../../data/countyEducation';
import { getCountyEducationComplete } from '../../data/countyEducationComplete';
import { getMemoryAid as getMemoryAidData } from '../../data/memoryAids';
import { useSoundEffect } from '../../utils/simpleSoundManager';
import { useDeviceInfo } from '../../mobile/hooks/useDeviceInfo';
import { californiaCounties } from '../../data/californiaCounties';
import { QuizQuestion, getRandomQuestions } from '../../data/californiaQuizQuestions';
import EducationalContentModal from '../game/modals/EducationalContentModal';
import CountyDetailsModal from '../county/CountyDetailsModal';
import CountyShapeDisplay from '../county/CountyShapeDisplay';
import { useStudyProgress } from './EnhancedStudyMode/hooks/useStudyProgress';
import StudyHeader from './EnhancedStudyMode/components/StudyHeader';
import RegionFilterBar from './EnhancedStudyMode/components/RegionFilterBar';
import FormationMode from './EnhancedStudyMode/modes/FormationMode';
import MapMode from './EnhancedStudyMode/modes/MapMode';
import ExploreMode from './EnhancedStudyMode/modes/ExploreMode';
import type { County, ExtendedCounty } from '../../types/game-types';

interface StudyModeProps {
  onClose: () => void;
  onStartGame: () => void;
}

type ViewMode = 'explore' | 'quiz' | 'map' | 'timeline' | 'formation';
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

export default function EnhancedStudyMode({ onClose, onStartGame: _onStartGame }: StudyModeProps) {
  const { counties } = useGame();
  const sound = useSoundEffect();
  const deviceInfo = useDeviceInfo();

  // Device detection for mobile-responsive layouts
  const isMobile = deviceInfo.isMobile || deviceInfo.isTablet;

  // Study progress with localStorage persistence
  const { progress, markCountyStudied, markQuizCompleted } = useStudyProgress();

  const [viewMode, setViewMode] = useState<ViewMode>('explore');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
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
    questionsPerSession: 10,
  });
  const [showMobileBottomSheet, setShowMobileBottomSheet] = useState(false);

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

  // Filter counties by region
  const filteredCounties =
    selectedRegion === 'all' ? counties : counties.filter((c) => c.region === selectedRegion);

  // Sort counties alphabetically
  const sortedCounties = [...filteredCounties].sort((a, b) => a.name.localeCompare(b.name));

  // Helper function to merge county data from multiple sources
  const getMergedCountyData = (county: County): County => {
    // Try to find matching data from californiaCounties.ts by name matching
    const normalizedId = county.id.toLowerCase().replace(/-/g, '_');
    const comprehensiveData = californiaCounties.find((c) => {
      const cId = c.id.toLowerCase();
      const countyId = county.id.toLowerCase();
      const countyName = county.name.toLowerCase().replace(' county', '').replace(/\s+/g, '_');

      return (
        cId === normalizedId ||
        cId === countyId ||
        cId === countyName ||
        c.name.toLowerCase() === county.name.toLowerCase() ||
        c.name.toLowerCase().replace(' county', '') === county.name.toLowerCase()
      );
    });

    if (comprehensiveData) {
      // Merge the comprehensive data with the county
      return {
        ...county,
        // Keep original fields but add comprehensive data
        countySeat: comprehensiveData.countySeat,
        established: comprehensiveData.established?.toString(),
        economicFocus: comprehensiveData.economicFocus,
        naturalFeatures: comprehensiveData.naturalFeatures,
        culturalLandmarks: comprehensiveData.culturalLandmarks,
        funFacts: comprehensiveData.funFacts,
        // Preserve original fields if they exist
        capital: county.capital || comprehensiveData.countySeat,
        founded: county.founded || comprehensiveData.established,
        population: county.population || comprehensiveData.population,
        area: county.area || comprehensiveData.area,
      } as County;
    }

    // Return original county data if no match found
    return county;
  };

  // Handle county selection
  const handleCountySelect = (county: County) => {
    // Check if county already has the data we need (from californiaCountiesComplete.ts)
    if (county.capital && county.population && county.area && county.founded) {
      setSelectedCounty(county);
    } else {
      const mergedCounty = getMergedCountyData(county);
      setSelectedCounty(mergedCounty);
    }

    setContentTab('overview');
    markCountyStudied(county.id);
  };

  // Generate quiz question using the comprehensive database
  const generateQuizQuestion = () => {
    // Apply region filter and ensure randomization
    const filters: Record<string, unknown> = {
      region: selectedRegion !== 'all' ? selectedRegion : undefined,
      excludeIds: Array.from(usedQuestionIds),
    };

    // Get filtered questions
    const questions = getRandomQuestions(1, filters);

    if (questions.length === 0) {
      // Reset if we've used all questions
      setUsedQuestionIds(new Set());
      // Try again with fresh pool
      const freshQuestions = getRandomQuestions(1, {
        ...filters,
        excludeIds: [],
      });

      if (freshQuestions.length === 0) {
        studyLogger.warn('No questions available with current filters');
        return;
      }

      const question = freshQuestions[0];
      setQuizQuestion(question);
      setUsedQuestionIds(new Set([question.id]));
    } else {
      const question = questions[0];
      setQuizQuestion(question);
      setUsedQuestionIds((prev) => new Set([...prev, question.id]));
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
        isCorrect,
      };
      setQuestionHistory((prev) => [...prev, result]);
    }

    if (isCorrect) {
      sound.playSound('correct');
      markQuizCompleted(quizQuestion.question);
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
      setQuizSettings((prev) => ({ ...prev, region: newRegion }));
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
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        goToNextQuestion();
      }
      // Arrow keys for navigation
      else if (e.key === 'ArrowLeft') {
        goToPreviousQuestion();
      } else if (e.key === 'ArrowRight') {
        goToNextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, quizState, quizQuestion, showAnswer, currentQuestionIndex, questionHistory]);

  // Get education content for selected county
  // Try to get complete data first, fall back to basic data if not available
  const rawEducationContent = selectedCounty
    ? getCountyEducationComplete(selectedCounty.id) || getCountyEducation(selectedCounty.id)
    : null;
  const rawMemoryAid = selectedCounty ? getMemoryAidData(selectedCounty.id) : null;

  // Convert education content to match EducationalContentModal's expected interface
  const educationContent = rawEducationContent
    ? {
        ...rawEducationContent,
        overview: rawEducationContent.historicalContext,
        uniqueFeatures: rawEducationContent.uniqueFeatures,
        historicalContext: rawEducationContent.historicalContext,
        economicImportance: rawEducationContent.economicImportance,
        culturalHeritage: rawEducationContent.culturalHeritage,
        geographicalSignificance: rawEducationContent.geographicalSignificance,
        specificData: rawEducationContent.specificData
          ? {
              ...rawEducationContent.specificData,
              historicalEvents: rawEducationContent.specificData.historicalEvents?.map(
                (event: string | { year: number; event: string }) =>
                  typeof event === 'string' ? { year: 0, event } : event
              ),
            }
          : undefined,
      }
    : null;

  // Convert memory aid to match expected interface
  const memoryAid = rawMemoryAid
    ? {
        ...rawMemoryAid,
        rhymes: rawMemoryAid.rhymes
          ? Array.isArray(rawMemoryAid.rhymes)
            ? rawMemoryAid.rhymes
            : [rawMemoryAid.rhymes]
          : undefined,
      }
    : null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col h-screen w-screen overflow-hidden ${viewMode === 'formation' ? '' : 'bg-white dark:bg-gray-900'}`}
    >
      {/* Enhanced Header with Modern Design - Fixed Position (Hidden in Formation mode) */}
      {viewMode !== 'formation' && (
        <StudyHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          progress={progress}
          onClose={onClose}
          isMobile={isMobile}
        />
      )}

      {/* Region Filter Bar - Hidden in Formation mode */}
      {viewMode !== 'formation' && (
        <RegionFilterBar
          counties={counties}
          selectedRegion={selectedRegion}
          onRegionChange={handleRegionChange}
          isMobile={isMobile}
        />
      )}

      {/* Main Content Area - Full Height */}
      <div
        className={`flex-1 flex overflow-hidden ${viewMode === 'formation' ? '' : 'bg-gray-50 dark:bg-gray-900'}`}
      >
        {viewMode === 'explore' && (
          <ExploreMode
            counties={counties}
            sortedCounties={sortedCounties}
            selectedCounty={selectedCounty}
            selectedRegion={selectedRegion}
            contentTab={contentTab}
            progress={progress}
            isMobile={isMobile}
            educationContent={educationContent}
            memoryAid={memoryAid}
            onContentTabChange={setContentTab}
            onCountySelect={handleCountySelect}
            onSelectedCountyChange={setSelectedCounty}
          />
        )}

        {viewMode === 'quiz' && (
          <div className="flex-1 bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 overflow-y-auto">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
              {/* Quiz States */}
              {quizState === 'idle' && (
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">
                    🎯 County Knowledge Quiz
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
                    Test your knowledge of California counties!
                  </p>

                  {/* Quiz Statistics */}
                  <div className="flex justify-center mb-6 sm:mb-8">
                    <div className="bg-purple-50 dark:bg-purple-900/30 p-4 sm:p-6 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {progress.completedQuizzes.size}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Questions Studied
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <button
                      onClick={() => startQuiz(5)}
                      className="px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-base sm:text-lg md:text-xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105"
                    >
                      🎯 Quick Quiz (5)
                    </button>
                    <button
                      onClick={() => startQuiz(15)}
                      className="px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-base sm:text-lg md:text-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
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
                        {Math.min(questionHistory.length, quizSettings.questionsPerSession)}{' '}
                        answered
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${((currentQuestionIndex + 1) / quizSettings.questionsPerSession) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Question Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 md:p-8 relative">
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
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                          {quizQuestion.question}
                        </h3>
                      </div>
                    </div>

                    {/* Answer Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                      {quizQuestion.options.map((option: string, idx: number) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = option === quizQuestion.correctAnswer;
                        const showResult = showAnswer;

                        return (
                          <button
                            key={idx}
                            onClick={() => !showAnswer && handleQuizAnswer(option)}
                            disabled={showAnswer}
                            className={`min-h-[44px] p-3 sm:p-4 rounded-lg transition-all text-sm sm:text-base md:text-lg font-medium relative ${
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
                            {showResult && isCorrect && <span className="ml-2">✓</span>}
                            {showResult && isSelected && !isCorrect && (
                              <span className="ml-2">✗</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation (shown after answering) */}
                    {showAnswer && quizQuestion.explanation && (
                      <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg mb-6">
                        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                          <strong>Explanation:</strong> {quizQuestion.explanation}
                        </p>
                      </div>
                    )}

                    {/* Navigation Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-0 pt-4 sm:pt-6 border-t">
                      <div className="flex gap-2">
                        <button
                          onClick={goToPreviousQuestion}
                          disabled={currentQuestionIndex === 0}
                          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all ${
                            currentQuestionIndex === 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          ← Previous
                        </button>
                        <button
                          onClick={goToNextQuestion}
                          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-all ${
                            showAnswer
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {currentQuestionIndex >= questionHistory.length - 1 &&
                          questionHistory.length >= quizSettings.questionsPerSession
                            ? 'Finish Quiz →'
                            : 'Next →'}
                        </button>
                      </div>

                      <button
                        onClick={endQuiz}
                        className="px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm sm:text-base hover:bg-red-200 transition-colors"
                      >
                        End Quiz
                      </button>
                    </div>

                    {/* Keyboard shortcuts hint */}
                    <div className="hidden sm:block mt-4 text-xs text-gray-500 text-center">
                      Press 1-4 to select answer • Space/Enter for next • ← → to navigate
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Summary */}
              {quizState === 'summary' && (
                <div className="text-center px-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                    📊 Quiz Complete!
                  </h2>

                  {/* Score Summary */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 mb-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-green-600">
                          {questionHistory.filter((q) => q.isCorrect).length}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Correct
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                          {Math.round(
                            (questionHistory.filter((q) => q.isCorrect).length /
                              questionHistory.length) *
                              100
                          )}
                          %
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Accuracy
                        </div>
                      </div>
                    </div>

                    {/* Question Review */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Question Review
                      </h3>
                      <div className="space-y-2 sm:space-y-3 max-h-[350px] sm:max-h-[450px] overflow-y-auto">
                        {questionHistory.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">
                            No questions answered yet
                          </p>
                        ) : (
                          questionHistory.map((result, idx) => (
                            <div
                              key={idx}
                              className={`p-3 sm:p-4 rounded-lg border ${
                                result.isCorrect
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-red-50 border-red-200'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <span className="font-semibold text-sm text-gray-700">
                                    Question {idx + 1}
                                  </span>
                                  <span
                                    className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                      result.isCorrect
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {result.isCorrect ? 'Correct' : 'Incorrect'}
                                  </span>
                                </div>
                                <span
                                  className={`text-2xl ${
                                    result.isCorrect ? 'text-green-600' : 'text-red-600'
                                  }`}
                                >
                                  {result.isCorrect ? '✓' : '✗'}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-gray-800 font-medium">
                                  {result.question.question}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                  {result.question.options.map((option, optIdx) => {
                                    const isUserAnswer = option === result.userAnswer;
                                    const isCorrectAnswer =
                                      option === result.question.correctAnswer;

                                    return (
                                      <div
                                        key={optIdx}
                                        className={`min-h-[36px] px-2 sm:px-3 py-2 rounded text-xs ${
                                          isCorrectAnswer
                                            ? 'bg-green-200 text-green-800 font-semibold'
                                            : isUserAnswer && !result.isCorrect
                                              ? 'bg-red-200 text-red-800 line-through'
                                              : 'bg-gray-100 text-gray-600'
                                        }`}
                                      >
                                        {option}
                                        {isCorrectAnswer && ' ✓'}
                                        {isUserAnswer && !isCorrectAnswer && ' (Your answer)'}
                                      </div>
                                    );
                                  })}
                                </div>

                                {result.question.explanation && !result.isCorrect && (
                                  <div className="mt-2 p-2 bg-blue-50 rounded">
                                    <p className="text-xs text-blue-800">
                                      <strong>Explanation:</strong> {result.question.explanation}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <button
                      onClick={() => startQuiz(10)}
                      className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm sm:text-base font-semibold hover:from-blue-600 hover:to-purple-600"
                    >
                      New Quiz
                    </button>
                    <button
                      onClick={resetQuiz}
                      className="px-4 sm:px-6 py-3 bg-gray-200 text-gray-700 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-300"
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
          <MapMode
            counties={counties}
            selectedRegion={selectedRegion}
            selectedCounty={selectedCounty}
            progress={progress}
            isMobile={isMobile}
            educationContent={educationContent}
            onRegionChange={setSelectedRegion}
            onCountySelect={handleCountySelect}
            onShowEducationalContent={() => setShowEducationalModal(true)}
            onShowEducationalModal={() => setShowEducationalModal(true)}
            onShowCountyDetailsModal={() => setShowCountyDetailsModal(true)}
          />
        )}

        {/* Timeline Mode - Historical Perspective with Side Panel */}
        {viewMode === 'timeline' && (
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
                {/* Group counties by decade */}
                {(() => {
                  const countiesByDecade = sortedCounties.reduce(
                    (acc: Record<string, County[]>, county) => {
                      const established = (county as ExtendedCounty).established;
                      const year =
                        county.founded ||
                        (typeof established === 'number'
                          ? established
                          : parseInt(established || '0'));
                      if (year) {
                        const decade = Math.floor(year / 10) * 10;
                        if (!acc[decade]) acc[decade] = [];
                        acc[decade].push(county);
                      }
                      return acc;
                    },
                    {}
                  );

                  const sortedDecades = Object.keys(countiesByDecade).sort(
                    (a, b) => Number(a) - Number(b)
                  );

                  if (sortedDecades.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          No Counties Found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          No counties match the selected region filter.
                        </p>
                        <button
                          onClick={() => setSelectedRegion('all')}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Show All Counties
                        </button>
                      </div>
                    );
                  }

                  return sortedDecades.map((decade) => (
                    <div key={decade} className="relative">
                      {/* Decade Header */}
                      <div className="flex items-center mb-3">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold shadow-lg text-base sm:text-lg md:text-xl">
                          {decade}s
                        </div>
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-gray-300 to-transparent ml-2 sm:ml-4"></div>
                      </div>

                      {/* Counties in this decade */}
                      <div
                        className={`flex flex-wrap gap-2 sm:gap-3 ${isMobile ? 'ml-0' : 'ml-6'}`}
                      >
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
                              onClick={() => {
                                handleCountySelect(county);
                                if (isMobile) {
                                  setShowMobileBottomSheet(true);
                                }
                              }}
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
                                  <span className="text-xs text-blue-600 font-bold">
                                    ✓ Selected
                                  </span>
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
                          {selectedCounty.founded || selectedCounty.established || 'Unknown'}
                        </p>
                      </div>

                      <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                        <h4 className="font-bold text-purple-900 mb-1 text-sm flex items-center gap-2">
                          <span>🏛️</span> County Seat
                        </h4>
                        <p className="text-lg font-semibold text-purple-700">
                          {selectedCounty.capital || selectedCounty.countySeat || 'N/A'}
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

                      {selectedCounty.funFacts && selectedCounty.funFacts.length > 0 && (
                        <div className="p-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl">
                          <h4 className="font-bold text-yellow-900 mb-2 text-sm flex items-center gap-2">
                            <span>✨</span> Fun Facts
                          </h4>
                          <ul className="space-y-1">
                            {selectedCounty.funFacts
                              .slice(0, 3)
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
                      Click on any county from the timeline to view its detailed historical
                      information and facts.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Bottom Sheet for Timeline - Slides up from bottom */}
            {isMobile && showMobileBottomSheet && selectedCounty && (
              <>
                {/* Backdrop overlay */}
                <div
                  className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                  onClick={() => setShowMobileBottomSheet(false)}
                />

                {/* Bottom sheet */}
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl z-50 max-h-[80vh] overflow-y-auto shadow-2xl">
                  {/* Drag handle */}
                  <div className="sticky top-0 bg-white dark:bg-gray-800 pt-3 pb-2 flex justify-center border-b border-gray-200 dark:border-gray-700 rounded-t-3xl">
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  </div>

                  {/* Content */}
                  <div className="p-5">
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
                          {selectedCounty.founded || selectedCounty.established || 'Unknown'}
                        </p>
                      </div>

                      <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                        <h4 className="font-bold text-purple-900 mb-1 text-sm flex items-center gap-2">
                          <span>🏛️</span> County Seat
                        </h4>
                        <p className="text-lg font-semibold text-purple-700">
                          {selectedCounty.capital || selectedCounty.countySeat || 'N/A'}
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

                      {selectedCounty.funFacts && selectedCounty.funFacts.length > 0 && (
                        <div className="p-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl">
                          <h4 className="font-bold text-yellow-900 mb-2 text-sm flex items-center gap-2">
                            <span>✨</span> Fun Facts
                          </h4>
                          <ul className="space-y-1">
                            {selectedCounty.funFacts
                              .slice(0, 3)
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
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
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

      {/* County Formation Animation Mode - Full Screen Immersive Experience */}
      {viewMode === 'formation' && <FormationMode onClose={onClose} />}

      {/* Educational Content Modal */}
      {selectedCounty && educationContent && (
        <EducationalContentModal
          isOpen={showEducationalModal}
          onClose={() => setShowEducationalModal(false)}
          county={selectedCounty as never}
          educationContent={educationContent}
          memoryAid={memoryAid || undefined}
        />
      )}

      {/* County Details Modal */}
      {selectedCounty && (
        <CountyDetailsModal
          isOpen={showCountyDetailsModal}
          onClose={() => setShowCountyDetailsModal(false)}
          county={selectedCounty as never}
          educationContent={educationContent || undefined}
          memoryAid={memoryAid || undefined}
          onViewEducationalContent={() => {
            setShowCountyDetailsModal(false);
            setShowEducationalModal(true);
          }}
        />
      )}

      {/* Region Change Modal */}
      {showRegionChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Change Region?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You have an active quiz in progress. Changing the region will end your current quiz
              and start a new one. Do you want to continue?
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
