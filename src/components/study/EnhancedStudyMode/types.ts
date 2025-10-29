/**
 * EnhancedStudyMode Type Definitions
 * Extracted from EnhancedStudyMode.tsx for better organization
 */

import type { County } from '../../../types/game-types';
import type { QuizQuestion } from '../../../data/californiaQuizQuestions';

// ============================================================================
// Component Props
// ============================================================================

export interface StudyModeProps {
  onClose: () => void;
  onStartGame: () => void;
}

// ============================================================================
// View Modes
// ============================================================================

export type ViewMode = 'explore' | 'quiz' | 'map' | 'timeline' | 'formation';
export type ContentTab = 'overview' | 'history' | 'economy' | 'culture' | 'geography' | 'memory';
export type QuizState = 'idle' | 'active' | 'summary';

// ============================================================================
// Study Progress
// ============================================================================

export interface StudyProgress {
  studiedCounties: Set<string>;
  completedQuizzes: Set<string>;
  masteredCounties: Set<string>;
}

// ============================================================================
// Quiz
// ============================================================================

export interface QuizSettings {
  questionsPerSession: number;
}

export interface QuestionResult {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
}

// ============================================================================
// Mode Component Props
// ============================================================================

export interface ExploreModeProps {
  counties: County[];
  selectedRegion: string;
  selectedCounty: County | null;
  contentTab: ContentTab;
  progress: StudyProgress;
  onRegionChange: (region: string) => void;
  onCountySelect: (county: County) => void;
  onContentTabChange: (tab: ContentTab) => void;
  onMarkStudied: (countyId: string) => void;
  onShowEducationalContent: () => void;
  onShowCountyDetails: () => void;
}

export interface QuizModeProps {
  counties: County[];
  selectedRegion: string;
  quizState: QuizState;
  quizSettings: QuizSettings;
  currentQuestion: QuizQuestion | null;
  currentQuestionIndex: number;
  questionHistory: QuestionResult[];
  showAnswer: boolean;
  selectedAnswer: string | null;
  progress: StudyProgress;
  onStartQuiz: (numQuestions: number) => void;
  onAnswerSelect: (answer: string) => void;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  onEndQuiz: () => void;
  onRetryQuiz: () => void;
}

export interface MapModeProps {
  counties: County[];
  selectedRegion: string;
  selectedCounty: County | null;
  progress: StudyProgress;
  onRegionChange: (region: string) => void;
  onCountySelect: (county: County) => void;
  onShowEducationalContent: () => void;
}

export interface TimelineModeProps {
  counties: County[];
  selectedRegion: string;
  selectedCounty: County | null;
  progress: StudyProgress;
  onCountySelect: (county: County) => void;
  onShowEducationalContent: () => void;
}

export interface FormationModeProps {
  // Formation mode has no props besides parent handlers
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface StudyProgressHookReturn {
  progress: StudyProgress;
  markCountyStudied: (countyId: string) => void;
  markQuizCompleted: (quizId: string) => void;
  markCountyMastered: (countyId: string) => void;
}

export interface QuizStateHookReturn {
  quizState: QuizState;
  quizSettings: QuizSettings;
  currentQuestion: QuizQuestion | null;
  currentQuestionIndex: number;
  questionHistory: QuestionResult[];
  showAnswer: boolean;
  selectedAnswer: string | null;
  usedQuestionIds: Set<string>;
  startQuiz: (numQuestions: number) => void;
  selectAnswer: (answer: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  endQuiz: () => void;
  retryQuiz: () => void;
}

export interface ContentNavigationHookReturn {
  contentTab: ContentTab;
  setContentTab: (tab: ContentTab) => void;
  showEducationalModal: boolean;
  showCountyDetailsModal: boolean;
  openEducationalModal: () => void;
  closeEducationalModal: () => void;
  openCountyDetailsModal: () => void;
  closeCountyDetailsModal: () => void;
}

export interface CountySelectionHookReturn {
  selectedCounty: County | null;
  selectCounty: (county: County) => void;
  clearSelection: () => void;
}

export interface RegionFilterHookReturn {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  showRegionChangeModal: boolean;
  pendingRegion: string;
  requestRegionChange: (region: string) => void;
  confirmRegionChange: () => void;
  cancelRegionChange: () => void;
}
