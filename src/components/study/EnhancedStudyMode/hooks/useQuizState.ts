/**
 * Quiz State Management Hook
 *
 * Manages all quiz-related state and logic for EnhancedStudyMode.
 * This is the most complex hook, handling quiz sessions, question history,
 * answer tracking, and quiz progress.
 *
 * @module useQuizState
 */

import { useState } from 'react';
import { studyLogger } from '../../../../utils/logger';
import { useSoundEffect } from '../../../../utils/simpleSoundManager';
import { getRandomQuestions } from '../../../../data/californiaQuizQuestions';
import type { County } from '../../../../types/game-types';
import type { QuizQuestion } from '../../../../data/californiaQuizQuestions';
import type {
  QuizState,
  QuizSettings,
  QuestionResult,
  QuizStateHookReturn,
  StudyProgress,
} from '../types';

/**
 * Hook parameters
 */
interface UseQuizStateParams {
  /** Currently selected region filter */
  selectedRegion: string;
  /** All available counties */
  counties: County[];
  /** Study progress tracking */
  progress: StudyProgress;
  /** Callback to mark a quiz as completed */
  markQuizCompleted: (quizId: string) => void;
}

/**
 * Custom hook for managing quiz state and logic
 *
 * Handles:
 * - Quiz session management (start, end, retry)
 * - Question generation with regional filtering
 * - Answer selection and validation
 * - Question history and navigation
 * - Audio feedback for correct/incorrect answers
 * - Progress tracking
 *
 * @param params - Hook configuration parameters
 * @returns Quiz state and control functions
 *
 * @example
 * ```tsx
 * const {
 *   quizState,
 *   currentQuestion,
 *   startQuiz,
 *   selectAnswer,
 *   nextQuestion,
 * } = useQuizState({
 *   selectedRegion: 'all',
 *   counties,
 *   progress,
 *   markQuizCompleted,
 * });
 * ```
 */
export function useQuizState({
  selectedRegion,
  counties: _counties,
  progress: _progress,
  markQuizCompleted,
}: UseQuizStateParams): QuizStateHookReturn {
  const sound = useSoundEffect();

  // ============================================================================
  // State Management
  // ============================================================================

  /** Current quiz question */
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);

  /** Set of question IDs that have been used in the current session */
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());

  /** Current quiz state (idle, active, or summary) */
  const [quizState, setQuizState] = useState<QuizState>('idle');

  /** History of all answered questions in the current session */
  const [questionHistory, setQuestionHistory] = useState<QuestionResult[]>([]);

  /** Current position in the question history */
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  /** Whether to show the answer explanation */
  const [showAnswer, setShowAnswer] = useState(false);

  /** The user's selected answer */
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  /** Quiz configuration settings */
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    questionsPerSession: 10,
  });

  // ============================================================================
  // Question Generation
  // ============================================================================

  /**
   * Generates a new quiz question based on current filters
   *
   * Applies regional filtering and tracks used questions to avoid repetition.
   * If all questions have been used, resets the pool and tries again.
   */
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

  // ============================================================================
  // Quiz Session Management
  // ============================================================================

  /**
   * Starts a new quiz session
   *
   * @param questionCount - Number of questions for this session
   */
  const startQuiz = (questionCount: number) => {
    setQuizSettings({ questionsPerSession: questionCount });
    setQuizState('active');
    setQuestionHistory([]);
    setCurrentQuestionIndex(0);
    setUsedQuestionIds(new Set());
    generateQuizQuestion();
  };

  /**
   * Ends the current quiz session and shows summary
   */
  const endQuiz = () => {
    setQuizState('summary');
  };

  /**
   * Resets quiz to initial idle state for retry
   */
  const retryQuiz = () => {
    setQuizState('idle');
    setQuizQuestion(null);
    setQuestionHistory([]);
    setCurrentQuestionIndex(0);
    setUsedQuestionIds(new Set());
    setShowAnswer(false);
    setSelectedAnswer(null);
  };

  // ============================================================================
  // Answer Handling
  // ============================================================================

  /**
   * Handles user answer selection
   *
   * @param answer - The selected answer text
   */
  const selectAnswer = (answer: string) => {
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

    // Show answer explanation
    setShowAnswer(true);
  };

  // ============================================================================
  // Question Navigation
  // ============================================================================

  /**
   * Navigates to the next question
   *
   * If viewing history, moves to the next answered question.
   * If at the end of history, generates a new question.
   * If session limit reached, ends the quiz.
   */
  const nextQuestion = () => {
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

  /**
   * Navigates to the previous question in history
   */
  const previousQuestion = () => {
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

  // ============================================================================
  // Return Hook Interface
  // ============================================================================

  return {
    // State
    quizState,
    quizSettings,
    currentQuestion: quizQuestion,
    currentQuestionIndex,
    questionHistory,
    showAnswer,
    selectedAnswer,
    usedQuestionIds,

    // Actions
    startQuiz,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    endQuiz,
    retryQuiz,
  };
}
