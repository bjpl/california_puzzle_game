/**
 * Enhanced Study Mode - Main Orchestrator Component
 *
 * This component orchestrates all study mode functionality by delegating to
 * specialized components and hooks. It has been refactored from 1,200+ lines
 * to ~250 lines of pure orchestration logic.
 *
 * Architecture:
 * - Hooks manage all state and business logic
 * - Mode components handle view-specific UI
 * - Shared components handle common UI elements
 * - Main component only handles mode switching and modal coordination
 */

import { useState, useEffect } from 'react';
import { allCaliforniaCounties } from '@/data/californiaCountiesComplete';
import { getCountyEducation } from '../../data/countyEducation';
import { getCountyEducationComplete } from '../../data/countyEducationComplete';
import { getMemoryAid as getMemoryAidData } from '../../data/memoryAids';
import { useDeviceInfo } from '../../mobile/hooks/useDeviceInfo';
import EducationalContentModal from '../game/modals/EducationalContentModal';
import CountyDetailsModal from '../county/CountyDetailsModal';
import type { County } from '../../types/game-types';
import type { County as FilterCounty } from '../../types';

// Import all extracted hooks
import { useStudyProgress } from './EnhancedStudyMode/hooks/useStudyProgress';
import { useQuizState } from './EnhancedStudyMode/hooks/useQuizState';
import { useContentNavigation } from './EnhancedStudyMode/hooks/useContentNavigation';
import { useCountySelection } from './EnhancedStudyMode/hooks/useCountySelection';
import { useRegionFilter } from './EnhancedStudyMode/hooks/useRegionFilter';

// Import all mode components
import FormationMode from './EnhancedStudyMode/modes/FormationMode';
import MapMode from './EnhancedStudyMode/modes/MapMode';
import ExploreMode from './EnhancedStudyMode/modes/ExploreMode';
import QuizMode from './EnhancedStudyMode/modes/QuizMode';
import TimelineMode from './EnhancedStudyMode/modes/TimelineMode';

// Import shared components
import StudyHeader from './EnhancedStudyMode/components/StudyHeader';
import RegionFilterBar from './EnhancedStudyMode/components/RegionFilterBar';

// Import types
import type { ViewMode, StudyModeProps } from './EnhancedStudyMode/types';

/**
 * EnhancedStudyMode - Main Orchestrator Component
 *
 * Responsibilities:
 * - Mode switching and view state
 * - Modal coordination
 * - Hook orchestration
 * - Component composition
 */
export default function EnhancedStudyMode({ onClose, onStartGame: _onStartGame }: StudyModeProps) {
  const counties = allCaliforniaCounties;
  const deviceInfo = useDeviceInfo();
  const isMobile = deviceInfo.isMobile || deviceInfo.isTablet;

  // ============================================================================
  // Core State Management via Hooks
  // ============================================================================

  // Study progress tracking with localStorage persistence
  const { progress, markCountyStudied, markQuizCompleted } = useStudyProgress();

  // View mode state (explore, quiz, map, timeline, formation)
  const [viewMode, setViewMode] = useState<ViewMode>('explore');

  // Quiz state management (questions, answers, history)
  const quizState = useQuizState({
    selectedRegion: 'all', // Will be connected to region filter
    counties,
    progress,
    markQuizCompleted,
  });

  // Content navigation (tabs and modals)
  const {
    contentTab,
    setContentTab,
    showEducationalModal,
    showCountyDetailsModal,
    openEducationalModal,
    closeEducationalModal,
    openCountyDetailsModal,
    closeCountyDetailsModal,
  } = useContentNavigation();

  // County selection with data merging
  const { selectedCounty, selectCounty } = useCountySelection(counties);

  // Region filtering with quiz state awareness
  const {
    selectedRegion,
    showRegionChangeModal,
    requestRegionChange,
    confirmRegionChange,
    cancelRegionChange,
  } = useRegionFilter(quizState.quizState);

  // ============================================================================
  // Derived State
  // ============================================================================

  // Filter and sort counties by region
  const filteredCounties =
    selectedRegion === 'all' ? counties : counties.filter((c) => c.region === selectedRegion);
  const sortedCounties = [...filteredCounties].sort((a, b) => a.name.localeCompare(b.name));

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handle county selection with study tracking
   */
  const handleCountySelect = (county: County) => {
    selectCounty(county);
    setContentTab('overview');
    markCountyStudied(county.id);
  };

  /**
   * Handle confirmed region change (after modal confirmation if needed)
   */
  const handleConfirmRegionChange = () => {
    confirmRegionChange();
    if (quizState.quizState === 'active') {
      quizState.retryQuiz(); // Reset quiz when region changes
    }
  };

  // ============================================================================
  // Education Content Preparation
  // ============================================================================

  // Get education content for selected county
  const rawEducationContent = selectedCounty
    ? getCountyEducationComplete(selectedCounty.id) || getCountyEducation(selectedCounty.id)
    : null;
  const rawMemoryAid = selectedCounty ? getMemoryAidData(selectedCounty.id) : null;

  // Convert education content for ExploreMode (uniqueFeatures as string)
  const educationContentExplore = rawEducationContent
    ? {
        historicalContext: rawEducationContent.historicalContext,
        economicImportance: rawEducationContent.economicImportance,
        culturalHeritage: rawEducationContent.culturalHeritage,
        geographicalSignificance: rawEducationContent.geographicalSignificance,
        uniqueFeatures: Array.isArray(rawEducationContent.uniqueFeatures)
          ? rawEducationContent.uniqueFeatures.join(', ')
          : rawEducationContent.uniqueFeatures || '',
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

  // Convert education content for MapMode (uniqueFeatures as array)
  const educationContentMap = rawEducationContent
    ? {
        historicalContext: rawEducationContent.historicalContext,
        economicImportance: rawEducationContent.economicImportance,
        culturalHeritage: rawEducationContent.culturalHeritage,
        geographicalSignificance: rawEducationContent.geographicalSignificance,
        uniqueFeatures: Array.isArray(rawEducationContent.uniqueFeatures)
          ? rawEducationContent.uniqueFeatures
          : rawEducationContent.uniqueFeatures
            ? [rawEducationContent.uniqueFeatures]
            : undefined,
        specificData: rawEducationContent.specificData,
      }
    : null;

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

  // ============================================================================
  // Keyboard Shortcuts for Quiz Mode
  // ============================================================================

  useEffect(() => {
    if (viewMode !== 'quiz' || !quizState.currentQuestion) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Number keys 1-4 for answers
      if (
        quizState.quizState === 'active' &&
        !quizState.showAnswer &&
        e.key >= '1' &&
        e.key <= '4'
      ) {
        const index = parseInt(e.key) - 1;
        if (index < quizState.currentQuestion!.options.length) {
          quizState.selectAnswer(quizState.currentQuestion!.options[index]);
        }
      }
      // Space or Enter for next question
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        quizState.nextQuestion();
      }
      // Arrow keys for navigation
      else if (e.key === 'ArrowLeft') {
        quizState.previousQuestion();
      } else if (e.key === 'ArrowRight') {
        quizState.nextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [viewMode, quizState]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col h-screen w-screen overflow-hidden ${
        viewMode === 'formation' ? '' : 'bg-white dark:bg-gray-900'
      }`}
    >
      {/* Header - Hidden in Formation Mode */}
      {viewMode !== 'formation' && (
        <StudyHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          progress={progress}
          onClose={onClose}
          isMobile={isMobile}
        />
      )}

      {/* Region Filter Bar - Hidden in Formation Mode */}
      {viewMode !== 'formation' && (
        <RegionFilterBar
          counties={counties.filter((c) => 'fips' in c && c.fips) as unknown as FilterCounty[]}
          selectedRegion={selectedRegion}
          onRegionChange={requestRegionChange}
          isMobile={isMobile}
        />
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex overflow-hidden ${viewMode === 'formation' ? '' : 'bg-gray-50 dark:bg-gray-900'}`}
      >
        {/* Explore Mode */}
        {viewMode === 'explore' && (
          <ExploreMode
            counties={counties as County[]}
            sortedCounties={sortedCounties as County[]}
            selectedCounty={selectedCounty}
            selectedRegion={selectedRegion}
            contentTab={contentTab}
            progress={progress}
            isMobile={isMobile}
            educationContent={educationContentExplore}
            memoryAid={memoryAid}
            onContentTabChange={setContentTab}
            onCountySelect={handleCountySelect}
            onSelectedCountyChange={(county) => selectCounty(county as County)}
          />
        )}

        {/* Quiz Mode */}
        {viewMode === 'quiz' && (
          <QuizMode
            counties={counties}
            selectedRegion={selectedRegion}
            quizState={quizState.quizState}
            quizSettings={quizState.quizSettings}
            currentQuestion={quizState.currentQuestion}
            currentQuestionIndex={quizState.currentQuestionIndex}
            questionHistory={quizState.questionHistory}
            showAnswer={quizState.showAnswer}
            selectedAnswer={quizState.selectedAnswer}
            progress={progress}
            isMobile={isMobile}
            onStartQuiz={quizState.startQuiz}
            onAnswerSelect={quizState.selectAnswer}
            onNextQuestion={quizState.nextQuestion}
            onPreviousQuestion={quizState.previousQuestion}
            onEndQuiz={quizState.endQuiz}
            onRetryQuiz={quizState.retryQuiz}
          />
        )}

        {/* Map Mode */}
        {viewMode === 'map' && (
          <MapMode
            counties={counties as County[]}
            selectedRegion={selectedRegion}
            selectedCounty={selectedCounty}
            progress={progress}
            isMobile={isMobile}
            educationContent={educationContentMap}
            onRegionChange={requestRegionChange}
            onCountySelect={handleCountySelect}
            onShowEducationalContent={openEducationalModal}
            onShowEducationalModal={openEducationalModal}
            onShowCountyDetailsModal={openCountyDetailsModal}
          />
        )}

        {/* Timeline Mode */}
        {viewMode === 'timeline' && (
          <TimelineMode
            counties={sortedCounties as County[]}
            selectedRegion={selectedRegion}
            selectedCounty={selectedCounty}
            progress={progress}
            isMobile={isMobile}
            onCountySelect={handleCountySelect}
            onRegionChange={requestRegionChange}
            onShowEducationalContent={openEducationalModal}
          />
        )}

        {/* Formation Mode - Full Screen */}
        {viewMode === 'formation' && <FormationMode onClose={onClose} />}
      </div>

      {/* Footer */}
      {viewMode !== 'formation' && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Progress: {progress.studiedCounties.size} counties studied
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Return to Menu
            </button>
          </div>
        </div>
      )}

      {/* Educational Content Modal */}
      {selectedCounty && educationContentMap && (
        <EducationalContentModal
          isOpen={showEducationalModal}
          onClose={closeEducationalModal}
          county={selectedCounty as never}
          educationContent={educationContentMap as never}
          memoryAid={memoryAid || undefined}
        />
      )}

      {/* County Details Modal */}
      {selectedCounty && (
        <CountyDetailsModal
          isOpen={showCountyDetailsModal}
          onClose={closeCountyDetailsModal}
          county={selectedCounty as never}
          educationContent={(educationContentMap as never) || undefined}
          memoryAid={memoryAid || undefined}
          onViewEducationalContent={() => {
            closeCountyDetailsModal();
            openEducationalModal();
          }}
        />
      )}

      {/* Region Change Confirmation Modal */}
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
                onClick={cancelRegionChange}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRegionChange}
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
