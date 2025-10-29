/**
 * Quiz Mode Component
 *
 * Extracted from EnhancedStudyMode.tsx (lines 979-1300)
 * Handles all quiz-related UI states and interactions
 *
 * Features:
 * - Quiz idle state (start screen with statistics)
 * - Active quiz state (questions, answers, and explanations)
 * - Quiz summary state (results and review)
 * - Progress tracking with visual feedback
 * - Navigation controls (next/previous)
 * - Answer validation with audio feedback
 * - Score calculation and display
 * - Keyboard shortcuts support
 * - Responsive mobile design
 *
 * @module QuizMode
 */

import type { QuizModeProps } from '../types';

interface QuizModeComponentProps extends QuizModeProps {
  isMobile?: boolean;
}

/**
 * QuizMode Component
 *
 * Main quiz interface with three distinct states:
 * 1. Idle - Start screen with quiz options
 * 2. Active - Interactive quiz with questions and answers
 * 3. Summary - Results screen with detailed review
 *
 * @param props - Quiz mode configuration and state handlers
 * @returns Quiz mode UI component
 */
export default function QuizMode({
  quizState,
  quizSettings,
  currentQuestion,
  currentQuestionIndex,
  questionHistory,
  showAnswer,
  selectedAnswer,
  progress,
  isMobile: _isMobile,
  onStartQuiz,
  onAnswerSelect,
  onNextQuestion,
  onPreviousQuestion,
  onEndQuiz,
  onRetryQuiz,
}: QuizModeComponentProps) {
  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Quiz Idle State - Start Screen */}
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
                <div className="text-sm text-gray-600 dark:text-gray-400">Questions Studied</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => onStartQuiz(5)}
                className="px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-base sm:text-lg md:text-xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105"
              >
                🎯 Quick Quiz (5)
              </button>
              <button
                onClick={() => onStartQuiz(15)}
                className="px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-base sm:text-lg md:text-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
              >
                🏆 Full Quiz (15)
              </button>
            </div>
          </div>
        )}

        {/* Active Quiz State - Question and Answers */}
        {quizState === 'active' && currentQuestion && (
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
                      {currentQuestion.type}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                      {currentQuestion.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      {currentQuestion.region}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {currentQuestion.question}
                  </h3>
                </div>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                {currentQuestion.options.map((option: string, idx: number) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const showResult = showAnswer;

                  return (
                    <button
                      key={idx}
                      onClick={() => !showAnswer && onAnswerSelect(option)}
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
                      {showResult && isSelected && !isCorrect && <span className="ml-2">✗</span>}
                    </button>
                  );
                })}
              </div>

              {/* Explanation (shown after answering) */}
              {showAnswer && currentQuestion.explanation && (
                <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg mb-6">
                  <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-0 pt-4 sm:pt-6 border-t">
                <div className="flex gap-2">
                  <button
                    onClick={onPreviousQuestion}
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
                    onClick={onNextQuestion}
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
                  onClick={onEndQuiz}
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

        {/* Quiz Summary State - Results and Review */}
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
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Correct</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {Math.round(
                      (questionHistory.filter((q) => q.isCorrect).length / questionHistory.length) *
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
                    <p className="text-gray-500 text-center py-4">No questions answered yet</p>
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
                              const isCorrectAnswer = option === result.question.correctAnswer;

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
                onClick={() => onStartQuiz(10)}
                className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm sm:text-base font-semibold hover:from-blue-600 hover:to-purple-600"
              >
                New Quiz
              </button>
              <button
                onClick={onRetryQuiz}
                className="px-4 sm:px-6 py-3 bg-gray-200 text-gray-700 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-300"
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
